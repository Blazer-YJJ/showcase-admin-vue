<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="90%"
    :close-on-click-modal="false"
    class="product-selection-dialog"
    @close="handleClose"
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
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载商品...</p>
      </div>
      
      <div v-else-if="displayedProducts.length > 0">
        <div class="products-grid-selection">
          <ProductSelectionCard
            v-for="product in displayedProducts"
            :key="product.product_id"
            :product="product"
            :selected="selectedProductIds.includes(product.product_id)"
            :categories="categories"
            @select="handleProductSelect"
            @unselect="handleProductUnselect"
          />
        </div>
        
        <!-- 分页组件（可选） -->
        <div v-if="enablePagination" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
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
          <el-button @click="handleCancel">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirm"
            :disabled="selectedProductIds.length === 0"
            :loading="confirmLoading"
          >
            确定添加 ({{ selectedProductIds.length }})
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Loading, Refresh, Box } from '@element-plus/icons-vue'
import ProductSelectionCard from '@/components/ProductSelectionCard.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '选择商品'
  },
  products: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  enablePagination: {
    type: Boolean,
    default: true
  },
  excludeProductIds: {
    type: Array,
    default: () => []
  },
  confirmLoading: {
    type: Boolean,
    default: false
  },
  initialSelectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'filter-change'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filterForm = ref({
  name: '',
  category_id: ''
})

const selectedProductIds = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 计算属性 - 筛选后的商品列表（用于分页前的筛选）
const filteredProductsForPagination = computed(() => {
  let products = [...props.products]

  // 过滤掉已排除的商品
  if (props.excludeProductIds.length > 0) {
    products = products.filter(product => 
      !props.excludeProductIds.includes(product.product_id)
    )
  }

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

// 计算属性 - 当前页的商品列表
const displayedProducts = computed(() => {
  if (props.enablePagination) {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredProductsForPagination.value.slice(start, end)
  } else {
    return filteredProductsForPagination.value
  }
})

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
  if (props.enablePagination) {
    currentPage.value = 1
  }
  emit('filter-change', filterForm.value)
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    name: '',
    category_id: ''
  }
  if (props.enablePagination) {
    currentPage.value = 1
  }
  emit('filter-change', filterForm.value)
}

// 确认选择
const handleConfirm = () => {
  if (selectedProductIds.value.length === 0) {
    return
  }
  emit('confirm', [...selectedProductIds.value])
}

// 取消
const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

// 关闭弹窗
const handleClose = () => {
  selectedProductIds.value = []
  filterForm.value = {
    name: '',
    category_id: ''
  }
  currentPage.value = 1
  emit('cancel')
}

// 监听筛选结果变化，更新总数
watch(filteredProductsForPagination, (newProducts) => {
  if (props.enablePagination) {
    total.value = newProducts.length
    // 如果当前页超出范围，重置到第一页
    const maxPage = Math.ceil(total.value / pageSize.value) || 1
    if (currentPage.value > maxPage) {
      currentPage.value = 1
    }
  }
}, { immediate: true })

// 监听弹窗打开，重置选择或设置初始选中
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 如果有初始选中ID，使用它们；否则重置为空数组
    selectedProductIds.value = props.initialSelectedIds.length > 0 
      ? [...props.initialSelectedIds] 
      : []
    filterForm.value = {
      name: '',
      category_id: ''
    }
    currentPage.value = 1
  }
})
</script>

<style scoped>
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
  background: #f5f7fa;
  border-radius: 8px;
}

.product-selection-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px 0;
}

.products-grid-selection {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12px;
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

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

/* 空状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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
  margin: 0;
  font-size: 14px;
}

/* 分页样式 */
.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
  margin-top: 16px;
}

/* 响应式设计 - 商品选择弹窗 */
@media (max-width: 1600px) {
  .products-grid-selection {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 1200px) {
  .products-grid-selection {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 900px) {
  .products-grid-selection {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 600px) {
  .products-grid-selection {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
