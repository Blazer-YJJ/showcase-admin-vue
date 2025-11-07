<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
      <h1>以图搜图</h1>
        <p>通过上传图片搜索相似商品，管理以图搜图商品库</p>
      </div>
      <!-- <div class="header-right">
        <el-button 
          v-if="productListType === 'indexed'"
          type="danger" 
          :disabled="selectedProductIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="openProductSelectionDialog">
          <el-icon><Plus /></el-icon>
          添加商品入库
        </el-button>
      </div> -->
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 图片搜索区域 -->
      <el-card class="search-card">
        <template #header>
          <div class="card-header">
            <span>图片搜索</span>
          </div>
        </template>
        <div class="search-section">
          <el-upload
            ref="uploadRef"
            class="image-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
            accept="image/*"
            drag
          >
            <template v-if="!previewImage">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将图片拖到此处，或<em>点击上传</em>
              </div>
            </template>
            <template v-else>
              <div class="preview-image-wrapper">
                <img :src="previewImage" alt="预览图片" class="preview-image" />
                <el-button 
                  type="danger" 
                  size="small" 
                  circle
                  class="remove-image-btn"
                  @click.stop="removePreviewImage"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip" v-if="!previewImage">
                支持 jpg/png/gif 格式，文件大小不超过 10MB
              </div>
            </template>
          </el-upload>
          
          <el-button 
            v-if="previewImage"
            type="primary" 
            size="large"
            :loading="searchLoading"
            @click="handleSearch"
            class="search-button"
          >
            <el-icon><Search /></el-icon>
            开始搜索
          </el-button>
        </div>

        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="search-results">
          <h3>搜索结果（共 {{ searchResults.length }} 个）</h3>
          <div class="results-grid">
            <div 
              v-for="result in searchResults" 
              :key="result.product_id"
              class="result-item"
            >
              <div class="result-image">
                <img 
                  v-if="getResultImageUrl(result)" 
                  :src="getResultImageUrl(result)" 
                  :alt="result.name"
                  @error="handleImageError"
                />
                <div v-else class="no-image">暂无图片</div>
              </div>
              <div class="result-info">
                <div class="result-name">{{ result.name || '未知商品' }}</div>
                <div class="result-price" v-if="result.price">
                  ¥{{ parseFloat(result.price).toFixed(2) }}
                </div>
                <div class="result-similarity" v-if="result.similarity !== undefined && result.similarity !== null">
                  相似度: {{ (result.similarity * 100).toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 已入库商品列表 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <div class="header-left-group">
              <el-radio-group v-model="productListType" @change="handleListTypeChange" size="small">
                <el-radio-button label="indexed">已入库</el-radio-button>
                <el-radio-button label="not-indexed">未入库</el-radio-button>
              </el-radio-group>
            </div>
            <div class="header-right-group">
              <el-button 
                type="info" 
                size="small"
                @click="handleSelectAll"
                :loading="selectAllLoading"
                :disabled="total === 0"
              >
                <el-icon><Select /></el-icon>
                {{ isSelectAll ? '取消全选' : '全选' }}
              </el-button>
              <el-button 
                v-if="productListType === 'not-indexed'"
                type="success" 
                size="small"
                @click="handleBatchAdd"
                :loading="loading"
                :disabled="selectedProductIds.length === 0"
              >
                <el-icon><Plus /></el-icon>
                批量入库
              </el-button>
              <el-button 
                v-if="productListType === 'indexed'"
                type="danger" 
                size="small"
                @click="handleBatchDelete"
                :loading="loading"
                :disabled="selectedProductIds.length === 0"
              >
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
              <el-button 
                type="primary" 
                size="small"
                @click="loadProducts"
                :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>
        
        <!-- 卡片网格布局 -->
        <div v-loading="loading" class="product-grid-container">
          <div v-if="indexedProducts.length === 0 && !loading" class="empty-state">
            {{ productListType === 'indexed' ? '暂无已入库商品' : '暂无未入库商品' }}
          </div>
          <div v-else class="product-grid">
            <div 
              v-for="product in indexedProducts" 
              :key="product.product_id"
              class="product-card"
              :class="{ 'selected': selectedProductIds.includes(product.product_id) }"
              @click="toggleProductSelection(product.product_id)"
            >
              <div class="card-checkbox">
                <el-checkbox 
                  :model-value="selectedProductIds.includes(product.product_id)"
                  @click.stop
                  @change="toggleProductSelection(product.product_id)"
                />
              </div>
              <div class="card-image">
                <el-image
                  :src="getImageUrl(product.main_image)"
                  fit="contain"
                  class="product-image"
                  lazy
                >
                  <template #error>
                    <div class="image-error">暂无图片</div>
                  </template>
                </el-image>
              </div>
              <div class="card-name" :title="product.name">
                {{ product.name || '未知商品' }}
              </div>
              <div class="card-actions">
                <el-button 
                  v-if="productListType === 'indexed'"
                  type="danger" 
                  size="small" 
                  @click.stop="handleDeleteSingle(product.product_id)"
                >
                  删除
                </el-button>
                <el-button 
                  v-else
                  type="primary" 
                  size="small" 
                  @click.stop="handleAddToIndexed(product.product_id)"
                >
                  入库
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100, 200]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 商品选择弹窗 -->
    <ProductSelectionDialog
      v-model="productSelectionDialogVisible"
      title="选择要入库的商品"
      :products="allProducts"
      :categories="categories"
      :loading="productSelectionLoading"
      :enable-pagination="true"
      :confirm-loading="addLoading"
      @confirm="handleProductSelectionConfirm"
      @cancel="handleProductSelectionCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Search,
  Refresh,
  UploadFilled,
  Close,
  Select
} from '@element-plus/icons-vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'
import { productApi, categoryApi } from '@/config/api.js'
import { getImageUrl } from '@/config/api.js'
import { 
  batchAddImageSearch, 
  searchByImage, 
  batchDeleteImageSearch,
  getIndexedProducts,
  getNotIndexedProducts
} from '@/api/imageSearch.js'

// 响应式数据
const loading = ref(false)
const searchLoading = ref(false)
const addLoading = ref(false)
const indexedProducts = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedProductIds = ref([])
const productListType = ref('indexed') // 'indexed' 或 'not-indexed'
const selectAllLoading = ref(false)

// 图片搜索相关
const uploadRef = ref()
const previewImage = ref('')
const selectedImageFile = ref(null)
const searchResults = ref([])

// 商品选择弹窗相关
const productSelectionDialogVisible = ref(false)
const productSelectionLoading = ref(false)
const allProducts = ref([])
const categories = ref([])

// 处理图片选择
const handleImageChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  const isLt10M = file.raw.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return
  }

  selectedImageFile.value = file.raw
  previewImage.value = URL.createObjectURL(file.raw)
  searchResults.value = []
}

// 移除预览图片
const removePreviewImage = () => {
  previewImage.value = ''
  selectedImageFile.value = null
  searchResults.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 获取搜索结果商品的图片URL
const getResultImageUrl = (result) => {
  // 如果存在 images 数组，优先使用主图
  if (result.images && Array.isArray(result.images) && result.images.length > 0) {
    // 优先显示主图（image_type为'main'的图片）
    const mainImage = result.images.find(img => img.image_type === 'main')
    if (mainImage && mainImage.image_url) {
      return getImageUrl(mainImage.image_url)
    }
    // 如果没有主图，显示第一张图片
    if (result.images[0] && result.images[0].image_url) {
      return getImageUrl(result.images[0].image_url)
    }
  }
  
  // 如果存在直接的 image_url 字段
  if (result.image_url) {
    return getImageUrl(result.image_url)
  }
  
  // 如果都不存在，返回空字符串
  return ''
}

// 处理图片加载错误
const handleImageError = (event) => {
  console.error('图片加载失败:', event.target.src)
  // 隐藏图片，显示"暂无图片"
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.no-image')) {
    const noImageDiv = document.createElement('div')
    noImageDiv.className = 'no-image'
    noImageDiv.textContent = '暂无图片'
    parent.appendChild(noImageDiv)
  }
}

// 执行图片搜索
const handleSearch = async () => {
  if (!selectedImageFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }

  try {
    searchLoading.value = true
    const response = await searchByImage(selectedImageFile.value)
    
    if (response.success) {
      // API返回的数据结构: { success: true, data: { results: [...], total: 8 } }
      searchResults.value = response.data?.results || response.data || []
      const total = response.data?.total || searchResults.value.length
      
      // 调试：打印搜索结果数据结构
      if (searchResults.value.length > 0) {
        console.log('搜索结果数据结构示例:', searchResults.value[0])
        console.log('图片字段检查:', {
          hasImages: !!searchResults.value[0].images,
          imagesLength: searchResults.value[0].images?.length,
          hasImageUrl: !!searchResults.value[0].image_url,
          imageUrl: searchResults.value[0].image_url
        })
      }
      
      ElMessage.success(response.message || `搜索完成，找到 ${total} 个相似商品`)
    } else {
      ElMessage.error(response.message || '搜索失败')
      searchResults.value = []
    }
  } catch (error) {
    console.error('图片搜索错误:', error)
    ElMessage.error('搜索失败: ' + error.message)
    searchResults.value = []
  } finally {
    searchLoading.value = false
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

// 处理商品选择确认
const handleProductSelectionConfirm = async (selectedIds) => {
  if (selectedIds.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }

  try {
    addLoading.value = true
    const response = await batchAddImageSearch(selectedIds)
    
    if (response.success) {
      const successCount = response.data?.success_count || 0
      const failedCount = response.data?.failed_count || 0
      
      ElMessage.success(response.message || `成功入库 ${successCount} 个商品，失败 ${failedCount} 个`)
      
      // 关闭弹窗
      productSelectionDialogVisible.value = false
      
      // 刷新商品列表
      await loadProducts()
    } else {
      ElMessage.error(response.message || '入库失败')
    }
  } catch (error) {
    console.error('商品入库错误:', error)
    ElMessage.error('入库失败: ' + error.message)
  } finally {
    addLoading.value = false
  }
}

// 处理商品选择取消
const handleProductSelectionCancel = () => {
  productSelectionDialogVisible.value = false
}

// 加载商品列表（根据类型）
const loadProducts = async () => {
  try {
    loading.value = true
    
    let response
    if (productListType.value === 'indexed') {
      response = await getIndexedProducts(currentPage.value, pageSize.value)
    } else {
      response = await getNotIndexedProducts(currentPage.value, pageSize.value)
    }
    
    console.log('API响应:', response)
    
    // 处理响应：兼容不同的响应结构
    if (response) {
      // 如果响应有success字段且为false，表示失败
      if (response.success === false) {
        const errorMsg = response.message || `获取${productListType.value === 'indexed' ? '已入库' : '未入库'}商品列表失败`
        ElMessage.error(errorMsg)
        indexedProducts.value = []
        total.value = 0
        selectedProductIds.value = []
        return
      }
      
      // 尝试多种数据结构
      let products = []
      let totalCount = 0
      
      if (response.data) {
        products = response.data.products || response.data.data?.products || response.data.list || response.data
        totalCount = response.data.pagination?.total || response.data.total || response.total || products.length
      } else if (Array.isArray(response)) {
        products = response
        totalCount = response.length
      } else if (response.success !== false) {
        // 如果response本身没有success字段，可能是直接返回的数据
        products = response.products || response.list || []
        totalCount = response.total || products.length
      }
      
      indexedProducts.value = Array.isArray(products) ? products : []
      total.value = totalCount || indexedProducts.value.length
      
      // 如果没有数据，清空选中状态
      if (indexedProducts.value.length === 0) {
        selectedProductIds.value = []
      }
      
      console.log('解析后的数据:', {
        products: indexedProducts.value.length,
        total: total.value,
        firstProduct: indexedProducts.value[0]
      })
    } else {
      indexedProducts.value = []
      total.value = 0
      selectedProductIds.value = []
    }
  } catch (error) {
    console.error('获取商品列表错误:', error)
    ElMessage.error(`获取${productListType.value === 'indexed' ? '已入库' : '未入库'}商品列表失败: ${error.message}`)
    indexedProducts.value = []
    total.value = 0
    selectedProductIds.value = []
  } finally {
    loading.value = false
  }
}

// 处理列表类型切换
const handleListTypeChange = () => {
  currentPage.value = 1
  selectedProductIds.value = []
  loadProducts()
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 批量入库
const handleBatchAdd = async () => {
  if (selectedProductIds.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedProductIds.value.length} 个商品入库吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await batchAddImageSearch(selectedProductIds.value)
    
    // 处理响应：兼容不同的响应结构
    if (response && response.success !== false) {
      ElMessage.success(response.message || '批量入库成功')
      selectedProductIds.value = []
      await loadProducts()
    } else {
      ElMessage.error(response?.message || '批量入库失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量入库错误:', error)
      ElMessage.error('批量入库失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 单个商品入库
const handleAddToIndexed = async (productId) => {
  try {
    await ElMessageBox.confirm(
      '确定要将这个商品入库吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await batchAddImageSearch([productId])
    
    // 处理响应：兼容不同的响应结构
    if (response && response.success !== false) {
      ElMessage.success(response.message || '入库成功')
      await loadProducts()
    } else {
      ElMessage.error(response?.message || '入库失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('入库错误:', error)
      ElMessage.error('入库失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 计算是否全选（所有商品都被选中）
const isSelectAll = computed(() => {
  if (total.value === 0 || indexedProducts.value.length === 0) {
    return false
  }
  // 如果选中数量等于总数，且当前页的所有商品都被选中，则认为是全选状态
  if (selectedProductIds.value.length >= total.value) {
    const currentPageProductIds = indexedProducts.value.map(p => p.product_id)
    return currentPageProductIds.every(id => selectedProductIds.value.includes(id))
  }
  return false
})

// 获取所有页面的商品ID
const getAllProductIds = async () => {
  const allIds = []
  const totalPages = Math.ceil(total.value / pageSize.value)
  
  for (let page = 1; page <= totalPages; page++) {
    try {
      let response
      if (productListType.value === 'indexed') {
        response = await getIndexedProducts(page, pageSize.value)
      } else {
        response = await getNotIndexedProducts(page, pageSize.value)
      }
      
      // 解析响应数据
      let products = []
      if (response) {
        if (response.success === false) {
          continue
        }
        
        if (response.data) {
          products = response.data.products || response.data.data?.products || response.data.list || response.data
        } else if (Array.isArray(response)) {
          products = response
        } else if (response.success !== false) {
          products = response.products || response.list || []
        }
      }
      
      if (Array.isArray(products) && products.length > 0) {
        const ids = products.map(p => p.product_id).filter(id => id != null)
        allIds.push(...ids)
      }
    } catch (error) {
      console.error(`获取第${page}页商品失败:`, error)
    }
  }
  
  return allIds
}

// 全选/取消全选
const handleSelectAll = async () => {
  if (total.value === 0) {
    return
  }
  
  try {
    selectAllLoading.value = true
    
    if (isSelectAll.value) {
      // 取消全选：清空所有选中状态
      selectedProductIds.value = []
      ElMessage.info('已取消全选')
    } else {
      // 全选：获取所有页面的商品ID
      const allIds = await getAllProductIds()
      if (allIds.length > 0) {
        // 合并去重
        const uniqueIds = [...new Set([...selectedProductIds.value, ...allIds])]
        selectedProductIds.value = uniqueIds
        ElMessage.success(`已全选 ${uniqueIds.length} 个商品`)
      } else {
        ElMessage.warning('未获取到商品数据')
      }
    }
  } catch (error) {
    console.error('全选操作失败:', error)
    ElMessage.error('全选操作失败: ' + error.message)
  } finally {
    selectAllLoading.value = false
  }
}

// 切换商品选择状态
const toggleProductSelection = (productId) => {
  const index = selectedProductIds.value.indexOf(productId)
  if (index > -1) {
    selectedProductIds.value.splice(index, 1)
  } else {
    selectedProductIds.value.push(productId)
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedProductIds.value.length === 0) {
    ElMessage.warning('请至少选择一个商品')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProductIds.value.length} 个商品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await batchDeleteImageSearch(selectedProductIds.value)
    
    // 处理响应：兼容不同的响应结构
    if (response && response.success !== false) {
      ElMessage.success(response.message || '批量删除成功')
      selectedProductIds.value = []
      await loadProducts()
    } else {
      ElMessage.error(response?.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除错误:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 单个删除
const handleDeleteSingle = async (productId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await batchDeleteImageSearch([productId])
    
    // 处理响应：兼容不同的响应结构
    if (response && response.success !== false) {
      ElMessage.success(response.message || '删除成功')
      // 如果删除的商品在选中列表中，移除它
      const index = selectedProductIds.value.indexOf(productId)
      if (index > -1) {
        selectedProductIds.value.splice(index, 1)
      }
      await loadProducts()
    } else {
      ElMessage.error(response?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除错误:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  loadProducts()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

// 页面加载时获取数据
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
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

.header-right {
  display: flex;
  gap: 12px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  min-height: 0;
}

.search-card {
  flex-shrink: 0;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.image-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload) {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: 20px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-uploader :deep(.el-upload-dragger.is-dragover) {
  border-color: #409eff;
}

.preview-image-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 300px;
  max-height: 300px;
}

.preview-image {
  width: 100%;
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.remove-image-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #f56c6c;
  border: 2px solid #fff;
  z-index: 10;
}

.search-button {
  margin-top: 10px;
  width: 200px;
}

.search-results {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #ebeef5;
}

.search-results h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.result-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.result-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.result-image {
  width: 100%;
  min-height: 200px;
  height: 200px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.result-image .no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  background: #f5f7fa;
}

.result-info {
  padding: 12px;
}

.result-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-price {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 4px;
}

.result-similarity {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #ebeef5;
}

.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 20px;
}

.product-grid-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
  font-size: 14px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 16px;
  padding-bottom: 20px;
}

.product-card {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.card-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.card-image {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  background: #f5f7fa;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  background: #f5f7fa;
}

.card-name {
  padding: 12px;
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
  min-height: 36px;
}

.card-actions {
  padding: 8px 12px 12px;
  display: flex;
  justify-content: center;
}

.card-actions .el-button {
  width: 100%;
}
</style>
