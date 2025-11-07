<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-left">
        <h1>精品推荐</h1>
        <p>管理精品推荐商品，设置展示顺序</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openProductSelectionDialog">
          <el-icon><Plus /></el-icon>
          添加推荐款式
        </el-button>
      </div>
    </div>
    
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载精品推荐...</p>
      </div>
      
      <!-- 商品列表 -->
      <div v-else-if="selections.length > 0" class="selections-container">
        <div class="selections-grid">
          <ProductCard
            v-for="(selection, index) in selections" 
            :key="selection.selection_id"
            :product="selection"
            :sort-index="index + 1"
            :can-move-up="index > 0"
            :can-move-down="index < selections.length - 1"
            @move-up="moveUp(index)"
            @move-down="moveDown(index)"
            @remove="removeSelection(selection.selection_id)"
          />
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-content">
        <el-icon class="empty-icon"><Trophy /></el-icon>
        <h3>暂无精品推荐</h3>
        <p>还没有设置精品推荐商品</p>
      </div>
    </div>

    <!-- 商品选择弹窗 -->
    <ProductSelectionDialog
      v-model="productSelectionDialogVisible"
      title="选择推荐商品"
      :products="allProducts"
      :categories="categories"
      :loading="productSelectionLoading"
      :enable-pagination="false"
      @confirm="handleConfirmSelection"
      @cancel="handleCancelSelection"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Trophy, 
  Loading,
  Plus
} from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'
import { featuredRecommendationsApi, productApi, categoryApi, getImageUrl } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const selections = ref([])

// 商品选择弹窗相关数据
const productSelectionDialogVisible = ref(false)
const productSelectionLoading = ref(false)
const allProducts = ref([])
const categories = ref([])

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const response = await featuredRecommendationsApi.getFeaturedRecommendations()
    
    if (response.success) {
      selections.value = response.data.selections || []
      ElMessage.success('数据加载成功')
    } else {
      ElMessage.error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载精品推荐数据失败:', error)
    ElMessage.error('加载数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}


// 移除精品推荐
const removeSelection = async (selectionId) => {
  try {
    await ElMessageBox.confirm('确定要移除此商品吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await featuredRecommendationsApi.removeFromFeaturedRecommendations(selectionId)
    
    if (response.success) {
      ElMessage.success('移除成功')
      await loadData() // 重新加载数据
    } else {
      ElMessage.error(response.message || '移除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除精品推荐失败:', error)
      ElMessage.error('移除失败: ' + error.message)
    }
  }
}

// 上移
const moveUp = async (index) => {
  if (index === 0) return
  
  const newSelections = [...selections.value]
  const temp = newSelections[index]
  newSelections[index] = newSelections[index - 1]
  newSelections[index - 1] = temp
  
  // 更新排序
  await updateSortOrder(newSelections)
}

// 下移
const moveDown = async (index) => {
  if (index === selections.value.length - 1) return
  
  const newSelections = [...selections.value]
  const temp = newSelections[index]
  newSelections[index] = newSelections[index + 1]
  newSelections[index + 1] = temp
  
  // 更新排序
  await updateSortOrder(newSelections)
}

// 更新排序
const updateSortOrder = async (newSelections) => {
  try {
    const updatePromises = newSelections.map((selection, index) => 
      featuredRecommendationsApi.updateFeaturedRecommendationOrder(selection.selection_id, index)
    )
    
    await Promise.all(updatePromises)
    selections.value = newSelections
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
    await loadData() // 重新加载数据
  }
}

// 图片错误处理现在由ProductCard组件处理

// 打开商品选择弹窗
const openProductSelectionDialog = async () => {
  productSelectionDialogVisible.value = true
  
  // 加载商品和分类数据
  await Promise.all([
    loadAllProducts(),
    loadCategories()
  ])
}

// 加载所有商品
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
    const response = await featuredRecommendationsApi.addMultipleToFeaturedRecommendations(
      selectedProductIds,
      selections.value.length // 从当前推荐数量开始排序
    )
    
    if (response.success) {
      ElMessage.success(`成功添加 ${selectedProductIds.length} 个商品到精品推荐`)
      productSelectionDialogVisible.value = false
      await loadData() // 重新加载数据
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加精品推荐失败:', error)
    ElMessage.error('添加失败: ' + error.message)
  }
}

// 处理取消选择
const handleCancelSelection = () => {
  // 可以在这里处理取消逻辑，如果需要的话
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
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

.header-left h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}


.page-content {
  height: calc(100% - 120px);
}


/* 商品列表 */
.selections-container {
  height: 100%;
  overflow-y: auto;
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
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* 商品卡片网格布局 */
.selections-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .selections-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 1200px) {
  .selections-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 900px) {
  .selections-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 600px) {
  .selections-grid {
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
  
  .header-right .el-button {
    width: 100%;
  }
}

/* 按钮样式优化 */
.el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  border: none;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #66b3ff 0%, #409eff 100%);
}
</style>

