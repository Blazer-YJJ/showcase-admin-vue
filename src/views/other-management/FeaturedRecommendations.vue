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
    <el-dialog
      v-model="productSelectionDialogVisible"
      title="选择推荐商品"
      width="80%"
      :close-on-click-modal="false"
      class="product-selection-dialog"
    >
      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-form :model="filterForm" inline>
          <el-form-item label="商品名称">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px"
              @input="handleFilterChange"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="filterForm.category_id"
              placeholder="请选择分类"
              clearable
              style="width: 200px"
              @change="handleFilterChange"
            >
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in categories"
                :key="category.category_id"
                :label="category.name"
                :value="category.category_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetFilter">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 商品列表 -->
      <div class="product-selection-content">
        <div v-if="productSelectionLoading" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在加载商品...</p>
        </div>
        
        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <ProductSelectionCard
            v-for="product in filteredProducts"
            :key="product.product_id"
            :product="product"
            :selected="selectedProductIds.includes(product.product_id)"
            :categories="categories"
            @select="handleProductSelect"
            @unselect="handleProductUnselect"
          />
        </div>
        
        <div v-else class="empty-content">
          <el-icon class="empty-icon"><Box /></el-icon>
          <h3>暂无商品</h3>
          <p>没有找到符合条件的商品</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <div class="selection-info">
            已选择 {{ selectedProductIds.length }} 个商品
          </div>
          <div class="footer-buttons">
            <el-button @click="productSelectionDialogVisible = false">取消</el-button>
            <el-button 
              type="primary" 
              @click="confirmSelection"
              :disabled="selectedProductIds.length === 0"
            >
              确定添加 ({{ selectedProductIds.length }})
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Trophy, 
  Loading,
  Plus,
  Refresh,
  Box
} from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductSelectionCard from '@/components/ProductSelectionCard.vue'
import { featuredRecommendationsApi, productApi, categoryApi, getImageUrl } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const selections = ref([])

// 商品选择弹窗相关数据
const productSelectionDialogVisible = ref(false)
const productSelectionLoading = ref(false)
const allProducts = ref([])
const categories = ref([])
const selectedProductIds = ref([])
const filterForm = ref({
  name: '',
  category_id: ''
})

// 计算属性
const filteredProducts = computed(() => {
  let products = allProducts.value

  // 按名称筛选
  if (filterForm.value.name) {
    products = products.filter(product => 
      product.name.toLowerCase().includes(filterForm.value.name.toLowerCase())
    )
  }

  // 按分类筛选
  if (filterForm.value.category_id) {
    products = products.filter(product => 
      product.category_id === filterForm.value.category_id
    )
  }

  return products
})

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
  selectedProductIds.value = []
  
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

// 处理商品选择
const handleProductSelect = (productId) => {
  if (!selectedProductIds.value.includes(productId)) {
    selectedProductIds.value.push(productId)
  }
}

// 处理商品取消选择
const handleProductUnselect = (productId) => {
  const index = selectedProductIds.value.indexOf(productId)
  if (index > -1) {
    selectedProductIds.value.splice(index, 1)
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  // 筛选变化时自动触发计算属性更新
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    name: '',
    category_id: ''
  }
}

// 确认选择
const confirmSelection = async () => {
  if (selectedProductIds.value.length === 0) {
    ElMessage.warning('请选择要添加的商品')
    return
  }

  try {
    const response = await featuredRecommendationsApi.addMultipleToFeaturedRecommendations(
      selectedProductIds.value,
      selections.value.length // 从当前推荐数量开始排序
    )
    
    if (response.success) {
      ElMessage.success(`成功添加 ${selectedProductIds.value.length} 个商品到精品推荐`)
      productSelectionDialogVisible.value = false
      selectedProductIds.value = []
      await loadData() // 重新加载数据
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加精品推荐失败:', error)
    ElMessage.error('添加失败: ' + error.message)
  }
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

/* 商品选择弹窗样式 */
.product-selection-dialog :deep(.el-dialog) {
  border-radius: 12px;
}

.product-selection-dialog :deep(.el-dialog__header) {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

.product-selection-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.product-selection-dialog :deep(.el-dialog__footer) {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #e4e7ed;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.product-selection-content {
  min-height: 300px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  color: #606266;
  font-size: 14px;
}

.footer-buttons {
  display: flex;
  gap: 12px;
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .selections-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .selections-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .selections-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
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
