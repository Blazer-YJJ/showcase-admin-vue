<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
      <h1>热门款式</h1>
        <p>管理和展示热门商品款式</p>
      </div>
      <div class="header-right">
        <el-button 
          type="danger" 
          :disabled="selectedHotIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedHotIds.length }})
        </el-button>
        <el-button type="primary" @click="openProductSelectionDialog">
          <el-icon><Plus /></el-icon>
          添加热门款式
        </el-button>
      </div>
    </div>
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载热门商品...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-icon class="error-icon"><Warning /></el-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <el-button type="primary" @click="loadHotProducts">重新加载</el-button>
      </div>
      
      <!-- 商品列表 -->
      <div v-else-if="hotProducts.length > 0" class="products-container">
        <div class="selection-controls" v-if="hotProducts.length > 0">
          <el-checkbox 
            v-model="selectAll" 
            @change="handleSelectAll"
            :indeterminate="isIndeterminate"
          >
            全选
          </el-checkbox>
          <span class="selection-info">
            已选择 {{ selectedHotIds.length }} / {{ hotProducts.length }}
          </span>
        </div>
        <div class="products-grid">
          <div 
            v-for="(hotProduct, index) in hotProducts" 
            :key="hotProduct.hot_id"
            class="product-card-wrapper"
            :class="{ 'selected': selectedHotIds.includes(hotProduct.hot_id) }"
          >
            <el-checkbox 
              :model-value="selectedHotIds.includes(hotProduct.hot_id)"
              @change="(val) => handleCardSelect(hotProduct.hot_id, val)"
              class="card-checkbox"
            />
            <ProductCard
              :product="hotProduct"
              :sort-index="index + 1"
              :can-move-up="index > 0"
              :can-move-down="index < hotProducts.length - 1"
              @move-up="moveUp(index)"
              @move-down="moveDown(index)"
              @remove="handleDelete(hotProduct)"
            />
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-content">
        <el-icon class="empty-icon"><TrendCharts /></el-icon>
        <h3>暂无热门商品</h3>
        <p>还没有设置热门商品，请先添加商品</p>
        <el-button type="primary" @click="openProductSelectionDialog">添加热门商品</el-button>
      </div>
    </div>

    <!-- 商品选择弹窗 -->
    <ProductSelectionDialog
      v-model="productSelectionDialogVisible"
      title="选择热门商品"
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
  Plus, 
  Delete, 
  Loading,
  Warning
} from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'
import { hotProductsApi, productApi, categoryApi } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const error = ref('')
const hotProducts = ref([])
const selectedHotIds = ref([])

// 商品选择弹窗相关数据
const productSelectionDialogVisible = ref(false)
const productSelectionLoading = ref(false)
const allProducts = ref([])
const categories = ref([])
const confirmLoading = ref(false)

// 计算属性 - 已存在的商品ID（用于排除）
const existingProductIds = computed(() => {
  return hotProducts.value.map(p => p.product_id)
})

// 计算属性 - 全选状态
const selectAll = computed({
  get: () => hotProducts.value.length > 0 && selectedHotIds.value.length === hotProducts.value.length,
  set: (val) => {
    if (val) {
      selectedHotIds.value = hotProducts.value.map(p => p.hot_id)
    } else {
      selectedHotIds.value = []
    }
  }
})

// 计算属性 - 半选状态
const isIndeterminate = computed(() => {
  return selectedHotIds.value.length > 0 && selectedHotIds.value.length < hotProducts.value.length
})

// 获取热门商品列表
const loadHotProducts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await hotProductsApi.getHotProducts()
    
    if (response.success) {
      hotProducts.value = response.data.hotProducts || []
      // 按 sort_order 排序
      hotProducts.value.sort((a, b) => a.sort_order - b.sort_order)
    } else {
      error.value = response.message || '获取热门商品列表失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('API调用失败:', err.message)
    error.value = err.message || '获取热门商品列表失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 处理全选
const handleSelectAll = (val) => {
  if (val) {
    selectedHotIds.value = hotProducts.value.map(p => p.hot_id)
  } else {
    selectedHotIds.value = []
  }
}

// 处理单个卡片选择
const handleCardSelect = (hotId, selected) => {
  if (selected) {
    if (!selectedHotIds.value.includes(hotId)) {
      selectedHotIds.value.push(hotId)
    }
  } else {
    selectedHotIds.value = selectedHotIds.value.filter(id => id !== hotId)
  }
}

// 上移
const moveUp = async (index) => {
  if (index === 0) return
  
  const newProducts = [...hotProducts.value]
  const temp = newProducts[index]
  newProducts[index] = newProducts[index - 1]
  newProducts[index - 1] = temp
  
  // 更新排序
  await updateSortOrder(newProducts)
}

// 下移
const moveDown = async (index) => {
  if (index === hotProducts.value.length - 1) return
  
  const newProducts = [...hotProducts.value]
  const temp = newProducts[index]
  newProducts[index] = newProducts[index + 1]
  newProducts[index + 1] = temp
  
  // 更新排序
  await updateSortOrder(newProducts)
}

// 更新排序
const updateSortOrder = async (newProducts) => {
  try {
    const updatePromises = newProducts.map((product, index) => 
      hotProductsApi.updateHotProductSort(product.hot_id, index)
    )
    
    await Promise.all(updatePromises)
    hotProducts.value = newProducts
    // 更新排序号
    hotProducts.value.forEach((product, index) => {
      product.sort_order = index
    })
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
    await loadHotProducts() // 重新加载数据
  }
}

// 删除单个商品
const handleDelete = async (hotProduct) => {
  try {
    await ElMessageBox.confirm('确定要移除此热门商品吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await hotProductsApi.batchDeleteHotProducts([hotProduct.hot_id])
    
    if (response.success) {
      ElMessage.success('移除成功')
      await loadHotProducts() // 重新加载数据
    } else {
      ElMessage.error(response.message || '移除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('移除热门商品失败:', err)
      ElMessage.error('移除失败: ' + err.message)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedHotIds.value.length === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedHotIds.value.length} 个热门商品吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await hotProductsApi.batchDeleteHotProducts(selectedHotIds.value)
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      selectedHotIds.value = []
      await loadHotProducts() // 重新加载数据
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除热门商品失败:', error)
      ElMessage.error('批量删除失败: ' + error.message)
    }
  }
}

// 查看详情 - 已移除，如需查看详情可在ProductCard中添加点击事件

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
    
    // 批量添加商品到热门，从当前热门数量开始排序
    const response = await hotProductsApi.createHotProducts(
      selectedProductIds,
      hotProducts.value.length
    )
    
    if (response.success) {
      ElMessage.success(`成功添加 ${selectedProductIds.length} 个商品到热门款式`)
      productSelectionDialogVisible.value = false
      await loadHotProducts() // 重新加载数据
    } else {
      ElMessage.error(response.message || '添加热门商品失败')
    }
  } catch (error) {
    console.error('添加热门商品失败:', error)
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
  loadHotProducts()
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

/* 选择控制 */
.selection-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  margin-bottom: 8px;
}

.selection-info {
  color: #909399;
  font-size: 14px;
}

/* 商品卡片网格布局 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
  padding: 16px 0;
}

/* 卡片包装器 */
.product-card-wrapper {
  position: relative;
  min-width: 0; /* 允许内容收缩 */
  width: 100%;
}

.product-card-wrapper.selected {
  opacity: 0.8;
}

.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
}

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
@media (max-width: 1600px) {
  .products-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .page-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    flex-direction: column;
  }
  
  .header-right .el-button {
    width: 100%;
  }
}
</style>