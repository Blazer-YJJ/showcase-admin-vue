<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>限时活动</h1>
        <p>管理和配置限时活动，设置活动时间和关联商品</p>
      </div>
      <div class="header-right">
        <el-button 
          type="danger" 
          :disabled="selectedActivities.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          添加活动
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 活动列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="activityList"
          stripe
          style="width: 100%"
          empty-text="暂无限时活动数据"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="activity_id" label="ID" width="80" />
          <el-table-column prop="title" label="活动标题" min-width="150" />
          <el-table-column prop="description" label="活动描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column label="结束时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.end_time) }}
            </template>
          </el-table-column>
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

    <!-- 添加/编辑活动弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑限时活动' : '添加限时活动'"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="activity-form"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入活动标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入活动描述"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="开始时间" prop="start_time">
          <el-date-picker
            v-model="formData.start_time"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束时间" prop="end_time">
          <el-date-picker
            v-model="formData.end_time"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
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
      title="活动详情"
      width="900px"
    >
      <div v-if="detailLoading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载详情...</p>
      </div>
      <div v-else-if="activityDetail" class="activity-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动ID">{{ activityDetail.activity_id }}</el-descriptions-item>
          <el-descriptions-item label="活动标题">{{ activityDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="活动描述" :span="2">
            {{ activityDetail.description || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDateTime(activityDetail.start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ formatDateTime(activityDetail.end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="activityDetail.is_active === 1 ? 'success' : 'danger'">
              {{ activityDetail.is_active === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品数量">
            <el-tag type="info">{{ activityDetail.products?.length || 0 }} 个</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(activityDetail.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(activityDetail.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="activityDetail.products && activityDetail.products.length > 0" class="products-section">
          <h3>关联商品列表</h3>
          <el-table :data="activityDetail.products" stripe>
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
  Loading,
  Timer
} from '@element-plus/icons-vue'
import ProductSelectionDialog from '@/components/ProductSelectionDialog.vue'
import { limitedTimeActivitiesApi, productApi, categoryApi } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const activityList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedActivities = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  activity_id: null,
  title: '',
  description: '',
  start_time: '',
  end_time: '',
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
const activityDetail = ref(null)

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在1到100个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
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

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取活动列表
const fetchActivityList = async () => {
  loading.value = true
  try {
    const response = await limitedTimeActivitiesApi.getLimitedTimeActivities(currentPage.value, pageSize.value)
    if (response.success) {
      activityList.value = response.data || []
      total.value = response.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取活动列表失败')
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 打开添加弹窗
const openAddDialog = async () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
  await loadAllProducts()
  await loadCategories()
}

// 打开编辑弹窗
const openEditDialog = async (row) => {
  isEdit.value = true
  resetForm()
  
  // 加载详情数据
  try {
    const response = await limitedTimeActivitiesApi.getLimitedTimeActivityDetail(row.activity_id)
    if (response.success) {
      const detail = response.data
      formData.activity_id = detail.activity_id
      formData.title = detail.title || ''
      formData.description = detail.description || ''
      formData.start_time = detail.start_time || ''
      formData.end_time = detail.end_time || ''
      formData.is_active = detail.is_active !== undefined ? detail.is_active : 1
      formData.product_ids = detail.products?.map(p => p.product_id) || []
    } else {
      ElMessage.error(response.message || '获取活动详情失败')
      return
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败: ' + error.message)
    return
  }
  
  dialogVisible.value = true
  await loadAllProducts()
  await loadCategories()
}

// 打开详情弹窗
const openDetailDialog = async (row) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  activityDetail.value = null
  
  try {
    const response = await limitedTimeActivitiesApi.getLimitedTimeActivityDetail(row.activity_id)
    if (response.success) {
      activityDetail.value = response.data
    } else {
      ElMessage.error(response.message || '获取活动详情失败')
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败: ' + error.message)
  } finally {
    detailLoading.value = false
  }
}

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.activity_id = null
  formData.title = ''
  formData.description = ''
  formData.start_time = ''
  formData.end_time = ''
  formData.is_active = 1
  formData.product_ids = []
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 验证结束时间必须晚于开始时间
    if (formData.start_time && formData.end_time) {
      const startTime = new Date(formData.start_time)
      const endTime = new Date(formData.end_time)
      if (endTime <= startTime) {
        ElMessage.error('结束时间必须晚于开始时间')
        return
      }
    }
    
    submitLoading.value = true
    
    const submitData = {
      title: formData.title,
      description: formData.description,
      start_time: formData.start_time,
      end_time: formData.end_time,
      is_active: formData.is_active,
      product_ids: formData.product_ids
    }
    
    let response
    if (isEdit.value) {
      response = await limitedTimeActivitiesApi.updateLimitedTimeActivity(formData.activity_id, submitData)
    } else {
      response = await limitedTimeActivitiesApi.createLimitedTimeActivity(submitData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      closeDialog()
      fetchActivityList()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '添加失败'))
    }
  } catch (error) {
    if (error !== false) { // 表单验证失败时不显示错误
      console.error('提交失败:', error)
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 删除活动
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${row.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    const response = await limitedTimeActivitiesApi.batchDeleteLimitedTimeActivities([row.activity_id])
    
    if (response.success) {
      ElMessage.success('删除成功')
      fetchActivityList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedActivities.value.length === 0) {
    ElMessage.warning('请选择要删除的活动')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedActivities.value.length} 个活动吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    const activityIds = selectedActivities.value.map(a => a.activity_id)
    const response = await limitedTimeActivitiesApi.batchDeleteLimitedTimeActivities(activityIds)
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      selectedActivities.value = []
      fetchActivityList()
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedActivities.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchActivityList()
}

// 页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchActivityList()
}

// 打开商品选择弹窗
const openProductSelectionDialog = async () => {
  productSelectionDialogVisible.value = true
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
      const response = await productApi.getProducts(page, 100)
      
      if (response.success) {
        const products = response.data.products || []
        allProducts.value.push(...products)
        
        hasMore = products.length === 100
        page++
      } else {
        break
      }
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
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
const handleProductSelectionConfirm = (selectedProductIds) => {
  formData.product_ids = selectedProductIds
  productSelectionDialogVisible.value = false
  // 触发表单验证
  if (formRef.value) {
    formRef.value.validateField('product_ids')
  }
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
    if (formRef.value) {
      formRef.value.validateField('product_ids')
    }
  }
}

// 获取商品名称
const getProductName = (productId) => {
  const product = allProducts.value.find(p => p.product_id === productId)
  return product ? product.name : `商品ID: ${productId}`
}

// 组件挂载时获取数据
onMounted(() => {
  fetchActivityList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f5f5;
}

/* 页面头部样式 */
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

.table-card {
  height: 100%;
}

/* 表单样式 */
.activity-form {
  padding: 20px 0;
}

.product-selection-wrapper {
  width: 100%;
}

.selected-products-info {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.product-count {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.no-products-tip {
  margin-top: 8px;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
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

.activity-detail {
  padding: 20px 0;
}

.products-section {
  margin-top: 30px;
}

.products-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  border: none;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #66b3ff 0%, #409eff 100%);
}
</style>
