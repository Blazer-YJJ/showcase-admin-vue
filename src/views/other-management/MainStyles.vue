<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1>主推款式</h1>
        <p>管理和展示主推商品款式</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openProductSelectionDialog">
          <el-icon><Plus /></el-icon>
          添加主推款式
        </el-button>
      </div>
    </div>
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载主推商品...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-icon class="error-icon"><Warning /></el-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <el-button type="primary" @click="fetchPromotions">重新加载</el-button>
      </div>
      
      <!-- 商品列表 -->
      <div v-else-if="promotions.length > 0" class="products-container">
        <div class="products-grid">
          <ProductCard
            v-for="(promotion, index) in promotions" 
            :key="promotion.promotion_id"
            :product="promotion"
            :sort-index="index + 1"
            :can-move-up="index > 0"
            :can-move-down="index < promotions.length - 1"
            @move-up="moveUp(index)"
            @move-down="moveDown(index)"
            @remove="removePromotion(promotion.promotion_id)"
          />
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-content">
        <el-icon class="empty-icon"><TrendCharts /></el-icon>
        <h3>暂无主推商品</h3>
        <p>还没有设置主推商品，请先添加商品</p>
        <el-button type="primary" @click="openProductSelectionDialog">添加主推商品</el-button>
      </div>
    </div>

    <!-- 商品选择弹窗 -->
    <ProductSelectionDialog
      v-model="productSelectionDialogVisible"
      title="选择主推商品"
      :products="allProducts"
      :categories="categories"
      :loading="productSelectionLoading"
      :enable-pagination="true"
      :exclude-product-ids="existingProductIds"
      :confirm-loading="confirmLoading"
      @confirm="handleConfirmSelection"
      @cancel="handleCancelSelection"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  TrendCharts, 
  Loading, 
  Warning,
  Plus
} from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'
import { mainPromotionsApi, productApi, categoryApi, getImageUrl } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const error = ref('')
const promotions = ref([])

// 商品选择弹窗相关数据
const productSelectionDialogVisible = ref(false)
const productSelectionLoading = ref(false)
const allProducts = ref([])
const categories = ref([])
const confirmLoading = ref(false)

// 计算属性 - 已存在的商品ID（用于排除）
const existingProductIds = computed(() => {
  return promotions.value.map(p => p.product_id)
})

// 获取主推商品列表
const fetchPromotions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await mainPromotionsApi.getMainPromotions()
    
    if (result.success) {
      promotions.value = result.data.promotions || []
    } else {
      error.value = result.message || '获取主推商品列表失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('API调用失败:', err.message)
    error.value = err.message || '获取主推商品列表失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 图片错误处理现在由ProductCard组件处理

// 上移
const moveUp = async (index) => {
  if (index === 0) return
  
  const newPromotions = [...promotions.value]
  const temp = newPromotions[index]
  newPromotions[index] = newPromotions[index - 1]
  newPromotions[index - 1] = temp
  
  // 更新排序
  await updateSortOrder(newPromotions)
}

// 下移
const moveDown = async (index) => {
  if (index === promotions.value.length - 1) return
  
  const newPromotions = [...promotions.value]
  const temp = newPromotions[index]
  newPromotions[index] = newPromotions[index + 1]
  newPromotions[index + 1] = temp
  
  // 更新排序
  await updateSortOrder(newPromotions)
}

// 更新排序
const updateSortOrder = async (newPromotions) => {
  try {
    const updatePromises = newPromotions.map((promotion, index) => 
      mainPromotionsApi.updateMainPromotionOrder(promotion.promotion_id, index)
    )
    
    await Promise.all(updatePromises)
    promotions.value = newPromotions
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
    await fetchPromotions() // 重新加载数据
  }
}

// 移除主推商品
const removePromotion = async (promotionId) => {
  try {
    await ElMessageBox.confirm('确定要移除此主推商品吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await mainPromotionsApi.removeFromMainPromotions(promotionId)
    
    if (response.success) {
      ElMessage.success('移除成功')
      await fetchPromotions() // 重新加载数据
    } else {
      ElMessage.error(response.message || '移除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除主推商品失败:', error)
      ElMessage.error('移除失败: ' + error.message)
    }
  }
}

// 打开商品选择弹窗
const openProductSelectionDialog = async () => {
  productSelectionDialogVisible.value = true
  
  // 加载商品和分类数据
  await Promise.all([
    loadAllProducts(),
    loadCategories()
  ])
}

// 加载所有商品（用于筛选）
const loadAllProducts = async () => {
  try {
    productSelectionLoading.value = true
    allProducts.value = []
    
    // 分页获取所有商品
    let page = 1
    let hasMore = true
    
    while (hasMore) {
      const response = await productApi.getProducts(page, 100) // 每页100个商品
      
      if (response.success) {
        const products = response.data.products || []
        allProducts.value.push(...products)
        
        // 如果返回的商品数量少于100，说明已经是最后一页
        hasMore = products.length === 100
        page++
      } else {
        ElMessage.error(response.message || '获取商品列表失败')
        break
      }
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败: ' + error.message)
  } finally {
    productSelectionLoading.value = false
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await categoryApi.getCategories()
    if (response.success) {
      categories.value = response.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 处理确认选择
const handleConfirmSelection = async (selectedProductIds) => {
  if (selectedProductIds.length === 0) {
    ElMessage.warning('请选择要添加的商品')
    return
  }

  try {
    confirmLoading.value = true
    
    // 批量添加商品到主推，从当前主推数量开始排序
    const addPromises = selectedProductIds.map((productId, index) => 
      mainPromotionsApi.addToMainPromotions(productId, promotions.value.length + index)
    )
    
    const results = await Promise.all(addPromises)
    
    // 检查是否有失败的
    const failed = results.filter(r => !r.success)
    if (failed.length > 0) {
      ElMessage.warning(`成功添加 ${selectedProductIds.length - failed.length} 个商品，${failed.length} 个商品添加失败`)
    } else {
      ElMessage.success(`成功添加 ${selectedProductIds.length} 个商品到主推款式`)
    }
    
    productSelectionDialogVisible.value = false
    await fetchPromotions() // 重新加载数据
  } catch (error) {
    console.error('添加主推商品失败:', error)
    ElMessage.error('添加失败: ' + error.message)
  } finally {
    confirmLoading.value = false
  }
}

// 处理取消选择
const handleCancelSelection = () => {
  // 可以在这里处理取消逻辑，如果需要的话
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPromotions()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  gap: 12px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.page-content {
  height: calc(100% - 120px);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 16px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #f56c6c;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container h3 {
  margin: 0 0 8px 0;
  color: #f56c6c;
  font-size: 18px;
}

.error-container p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 商品列表 */
.products-container {
  height: 100%;
  overflow-y: auto;
}

/* 商品卡片网格布局 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  padding: 16px 0;
}

/* 卡片样式现在由ProductCard组件处理 */

.el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  border: none;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #66b3ff 0%, #409eff 100%);
}

/* 空状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-content h3 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 18px;
}

.empty-content p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* 响应式设计 - 主页面商品网格 */
@media (max-width: 1600px) {
  .products-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
  }
}
</style>