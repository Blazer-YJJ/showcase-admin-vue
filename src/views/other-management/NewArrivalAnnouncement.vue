<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
      <h1>上新公告</h1>
        <p>管理和配置新商品上新的公告信息</p>
      </div>
      <div class="header-right">
        <el-button 
          type="danger" 
          :disabled="selectedAnnouncements.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          添加公告
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 公告列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="announcementList"
          stripe
          style="width: 100%"
          empty-text="暂无上新公告数据"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="announcement_id" label="ID" width="80" />
          <el-table-column prop="content" label="公告内容" min-width="300" show-overflow-tooltip />
          <el-table-column label="商品数量" width="100">
            <template #default="{ row }">
              <el-tag type="info">{{ row.products?.length || 0 }} 个</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_active === 1 ? 'success' : 'danger'">
                {{ row.is_active === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="updated_at" label="更新时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.updated_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="info" size="small" @click="openDetailDialog(row)">
                查看
              </el-button>
              <el-button type="primary" size="small" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
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
      </el-card>
    </div>

    <!-- 添加/编辑公告弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑上新公告' : '添加上新公告'"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="announcement-form"
      >
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            placeholder="请输入公告内容"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="is_active">
          <el-radio-group v-model="formData.is_active">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="关联商品" prop="product_ids">
          <div class="product-selection-wrapper">
            <el-button 
              type="primary" 
              @click="openProductSelectionDialog"
              :disabled="productSelectionLoading"
            >
              <el-icon><Plus /></el-icon>
              {{ formData.product_ids.length > 0 ? '重新选择商品' : '选择商品' }}
            </el-button>
            <div v-if="formData.product_ids.length > 0" class="selected-products-info">
              <el-tag 
                v-for="productId in formData.product_ids" 
                :key="productId"
                closable
                @close="removeProduct(productId)"
                style="margin-right: 8px; margin-top: 8px"
              >
                {{ getProductName(productId) }}
              </el-tag>
              <span class="product-count">已选择 {{ formData.product_ids.length }} 个商品</span>
            </div>
            <div v-else class="no-products-tip">
              <el-text type="info">请至少选择一个商品</el-text>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 商品选择弹窗 -->
    <ProductSelectionDialog
      v-model="productSelectionDialogVisible"
      title="选择关联商品"
      :products="allProducts"
      :categories="categories"
      :loading="productSelectionLoading"
      :enable-pagination="true"
      :initialSelectedIds="formData.product_ids"
      :confirm-loading="false"
      @confirm="handleProductSelectionConfirm"
      @cancel="handleProductSelectionCancel"
    />

    <!-- 详情查看弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="公告详情"
      width="900px"
    >
      <div v-if="detailLoading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载详情...</p>
      </div>
      <div v-else-if="announcementDetail" class="announcement-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公告ID">{{ announcementDetail.announcement_id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="announcementDetail.is_active === 1 ? 'success' : 'danger'">
              {{ announcementDetail.is_active === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="公告内容" :span="2">
            {{ announcementDetail.content || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品数量">
            <el-tag type="info">{{ announcementDetail.products?.length || 0 }} 个</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(announcementDetail.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(announcementDetail.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="announcementDetail.products && announcementDetail.products.length > 0" class="products-section">
          <h3>关联商品列表</h3>
          <el-table :data="announcementDetail.products" stripe>
            <el-table-column prop="product_id" label="商品ID" width="100" />
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="price" label="价格" width="120">
              <template #default="{ row }">
                ¥{{ parseFloat(row.price || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="category_id" label="分类ID" width="100" />
            <el-table-column prop="tags" label="标签" width="150" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Loading
} from '@element-plus/icons-vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'
import { newArrivalAnnouncementsApi, productApi, categoryApi } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const announcementList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedAnnouncements = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  announcement_id: null,
  content: '',
  is_active: 1,
  product_ids: []
})

// 商品选择弹窗相关
const productSelectionDialogVisible = ref(false)
const productSelectionLoading = ref(false)
const allProducts = ref([])
const categories = ref([])

// 详情弹窗相关
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const announcementDetail = ref(null)

// 表单验证规则
const formRules = {
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { max: 500, message: '内容长度不能超过500个字符', trigger: 'blur' }
  ],
  product_ids: [
    { 
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少选择一个商品'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 加载公告列表
const loadAnnouncements = async () => {
  try {
    loading.value = true
    const response = await newArrivalAnnouncementsApi.getNewArrivalAnnouncements(
      currentPage.value,
      pageSize.value
    )
    
    if (response.success) {
      announcementList.value = response.data.announcements || []
      total.value = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取公告列表失败')
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error('获取公告列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 分页相关
const handlePageChange = (page) => {
  currentPage.value = page
  loadAnnouncements()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadAnnouncements()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedAnnouncements.value = selection.map(item => item.announcement_id)
}

// 打开添加弹窗
const openAddDialog = async () => {
  isEdit.value = false
  resetForm()
  await loadProductsAndCategories()
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = async (row) => {
  isEdit.value = true
  resetForm()
  
  try {
    loading.value = true
    const response = await newArrivalAnnouncementsApi.getNewArrivalAnnouncementDetail(
      row.announcement_id
    )
    
    if (response.success) {
      const detail = response.data
      formData.announcement_id = detail.announcement_id
      formData.content = detail.content || ''
      formData.is_active = detail.is_active !== undefined ? detail.is_active : 1
      formData.product_ids = detail.products?.map(p => p.product_id) || []
      
      await loadProductsAndCategories()
      dialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取公告详情失败')
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 查看详情
const openDetailDialog = async (row) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  announcementDetail.value = null
  
  try {
    const response = await newArrivalAnnouncementsApi.getNewArrivalAnnouncementDetail(
      row.announcement_id
    )
    
    if (response.success) {
      announcementDetail.value = response.data
    } else {
      ElMessage.error(response.message || '获取公告详情失败')
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败: ' + error.message)
  } finally {
    detailLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitLoading.value = true
      
      const submitData = {
        content: formData.content,
        is_active: formData.is_active,
        product_ids: formData.product_ids
      }
      
      let response
      if (isEdit.value) {
        response = await newArrivalAnnouncementsApi.updateNewArrivalAnnouncement(
          formData.announcement_id,
          submitData
        )
      } else {
        response = await newArrivalAnnouncementsApi.createNewArrivalAnnouncement(submitData)
      }
      
      if (response.success) {
        ElMessage.success(isEdit.value ? '更新公告成功' : '创建公告成功')
        closeDialog()
        loadAnnouncements()
      } else {
        ElMessage.error(response.message || (isEdit.value ? '更新公告失败' : '创建公告失败'))
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败: ' + error.message)
    } finally {
      submitLoading.value = false
    }
  })
}

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.announcement_id = null
  formData.content = ''
  formData.is_active = 1
  formData.product_ids = []
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 删除公告
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告"${row.content}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await newArrivalAnnouncementsApi.batchDeleteNewArrivalAnnouncements([
      row.announcement_id
    ])
    
    if (response.success) {
      ElMessage.success('删除成功')
      loadAnnouncements()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedAnnouncements.value.length === 0) {
    ElMessage.warning('请选择要删除的公告')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedAnnouncements.value.length} 条公告吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await newArrivalAnnouncementsApi.batchDeleteNewArrivalAnnouncements(
      selectedAnnouncements.value
    )
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      selectedAnnouncements.value = []
      loadAnnouncements()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败: ' + error.message)
    }
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  const newStatus = row.is_active === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}公告"${row.content}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await newArrivalAnnouncementsApi.updateNewArrivalAnnouncementStatus(
      row.announcement_id,
      newStatus
    )
    
    if (response.success) {
      ElMessage.success(`${statusText}成功`)
      loadAnnouncements()
    } else {
      ElMessage.error(response.message || `${statusText}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${statusText}失败:`, error)
      ElMessage.error(`${statusText}失败: ` + error.message)
    }
  }
}

// 商品选择相关
const loadProductsAndCategories = async () => {
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

// 打开商品选择弹窗
const openProductSelectionDialog = async () => {
  if (allProducts.value.length === 0) {
    await loadAllProducts()
  }
  if (categories.value.length === 0) {
    await loadCategories()
  }
  productSelectionDialogVisible.value = true
}

// 处理商品选择确认
const handleProductSelectionConfirm = (selectedIds) => {
  formData.product_ids = selectedIds
  productSelectionDialogVisible.value = false
}

// 处理商品选择取消
const handleProductSelectionCancel = () => {
  productSelectionDialogVisible.value = false
}

// 移除商品
const removeProduct = (productId) => {
  const index = formData.product_ids.indexOf(productId)
  if (index > -1) {
    formData.product_ids.splice(index, 1)
  }
}

// 获取商品名称
const getProductName = (productId) => {
  const product = allProducts.value.find(p => p.product_id === productId)
  return product ? product.name : `商品ID: ${productId}`
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 初始化
onMounted(() => {
  loadAnnouncements()
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.announcement-form {
  padding: 20px 0;
}

.product-selection-wrapper {
  width: 100%;
}

.selected-products-info {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.product-count {
  display: inline-block;
  margin-left: 12px;
  color: #606266;
  font-size: 14px;
}

.no-products-tip {
  margin-top: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.announcement-detail {
  padding: 20px 0;
}

.products-section {
  margin-top: 24px;
}

.products-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}
</style>