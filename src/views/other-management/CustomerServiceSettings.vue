<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
      <h1>客服设置</h1>
        <p>管理客服联系方式和微信二维码</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAddCustomerService">
          <el-icon><Plus /></el-icon>
          添加客服
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 客服列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="customerServiceList"
          stripe
          style="width: 100%"
          empty-text="暂无客服数据"
        >
          <el-table-column prop="service_id" label="客服ID" width="100" />
          <el-table-column prop="contact_phone" label="联系电话" min-width="180" />
          <el-table-column prop="wechat_number" label="微信号" min-width="180" />
          <el-table-column label="微信二维码" width="140">
            <template #default="{ row }">
              <div class="qr-code-container">
                <el-image
                  v-if="row.wechat_image"
                  :src="getImageUrl(row.wechat_image)"
                  fit="contain"
                  class="qr-code-image"
                  :preview-src-list="[getImageUrl(row.wechat_image)]"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>暂无图片</span>
                    </div>
                  </template>
                </el-image>
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                  <span>暂无图片</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" min-width="200">
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="updated_at" label="更新时间" min-width="200">
            <template #default="{ row }">
              {{ formatDateTime(row.updated_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                :loading="deleteLoading === row.service_id"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 添加客服对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加客服"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="联系电话" prop="contact_phone">
          <el-input
            v-model="addForm.contact_phone"
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="微信号" prop="wechat_number">
          <el-input
            v-model="addForm.wechat_number"
            placeholder="请输入微信号"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="微信二维码" prop="wechat_image">
          <!-- 图片预览区域 -->
          <div v-if="previewImageUrl" class="image-preview-container">
            <el-image
              :src="previewImageUrl"
              fit="contain"
              class="preview-image"
              :preview-src-list="[previewImageUrl]"
              :preview-teleported="true"
            />
            <div class="preview-actions">
              <el-button type="danger" size="small" @click="handleRemoveImage">
                <el-icon><Delete /></el-icon>
                移除图片
              </el-button>
            </div>
          </div>
          
          <!-- 上传组件 -->
          <el-upload
            v-if="!previewImageUrl"
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :before-upload="handleBeforeUpload"
            :on-change="handleFileChange"
            :on-success="handleFileSuccess"
            :on-remove="handleFileRemove"
            :http-request="handleCustomUpload"
            :file-list="fileList"
            accept="image/*"
            drag
            class="upload-demo"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelAdd">取消</el-button>
          <el-button type="primary" @click="handleConfirmAdd" :loading="addLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Picture, Plus, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { customerServiceApi, getImageUrl } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const deleteLoading = ref(null)

// 添加客服相关数据
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref()
const uploadRef = ref()
const fileList = ref([])
const addForm = ref({
  contact_phone: '',
  wechat_number: '',
  wechat_image: null
})

// 图片预览相关
const previewImageUrl = ref('')

// 表单验证规则
const addFormRules = {
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  wechat_number: [
    { required: true, message: '请输入微信号', trigger: 'blur' },
    { min: 6, max: 20, message: '微信号长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  wechat_image: [
    { required: true, message: '请上传微信二维码', trigger: 'change' }
  ]
}

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 客服列表数据
const customerServiceList = ref([])



// 获取客服列表
const getCustomerServiceList = async () => {
  try {
    loading.value = true
    const response = await customerServiceApi.getCustomerServices(currentPage.value, pageSize.value)
    
    if (response.success) {
      customerServiceList.value = response.data
      total.value = response.total
    } else {
      ElMessage.error(response.message || '获取客服列表失败')
    }
  } catch (error) {
    console.error('获取客服列表失败:', error)
    ElMessage.error(error.message || '获取客服列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const handleRefresh = () => {
  getCustomerServiceList()
}


// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客服 "${row.contact_phone}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    deleteLoading.value = row.service_id
    
    const response = await customerServiceApi.deleteCustomerService(row.service_id)
    
    if (response.success) {
      ElMessage.success('删除客服成功')
      getCustomerServiceList()
    } else {
      ElMessage.error(response.message || '删除客服失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除客服失败:', error)
      ElMessage.error(error.message || '删除客服失败')
    }
  } finally {
    deleteLoading.value = null
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getCustomerServiceList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getCustomerServiceList()
}

// 添加客服相关方法
const handleAddCustomerService = () => {
  addDialogVisible.value = true
  resetAddForm()
}

const resetAddForm = () => {
  // 释放预览URL内存
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
  }
  
  addForm.value = {
    contact_phone: '',
    wechat_number: '',
    wechat_image: null
  }
  fileList.value = []
  previewImageUrl.value = ''
  
  if (addFormRef.value) {
    addFormRef.value.clearValidate()
  }
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleBeforeUpload = (file) => {
  console.log('上传前验证:', file)
  
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  // 验证文件大小 (2MB)
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  // 验证通过，允许处理
  return true
}

const handleFileChange = (file, fileList) => {
  console.log('文件变化:', file, '文件列表:', fileList)
  
  // 检查文件是否存在且有效
  if (!file || !file.raw) {
    console.log('文件无效，跳过处理')
    return
  }
  
  // 设置文件到表单
  addForm.value.wechat_image = file.raw
  
  // 创建预览URL
  previewImageUrl.value = URL.createObjectURL(file.raw)
  
  // 更新文件列表
  fileList.value = [file]
  
  console.log('设置文件到表单:', addForm.value.wechat_image)
  console.log('预览URL:', previewImageUrl.value)
  console.log('当前表单数据:', addForm.value)
}

// 处理文件选择成功
const handleFileSuccess = (response, file, fileList) => {
  console.log('文件选择成功:', file, fileList)
  // 这里不需要处理，因为我们在 on-change 中已经处理了
}

// 自定义上传处理（阻止实际上传）
const handleCustomUpload = (options) => {
  console.log('自定义上传处理:', options)
  // 不执行实际上传，只是阻止默认行为
  return Promise.resolve()
}

const handleFileRemove = () => {
  addForm.value.wechat_image = null
  previewImageUrl.value = ''
  fileList.value = []
  console.log('文件已移除，表单数据:', addForm.value)
}

// 移除图片预览
const handleRemoveImage = () => {
  // 释放预览URL内存
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
  }
  
  addForm.value.wechat_image = null
  previewImageUrl.value = ''
  fileList.value = []
  
  console.log('图片已移除')
}

const handleCancelAdd = () => {
  addDialogVisible.value = false
  resetAddForm()
}

const handleConfirmAdd = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    
    // 检查是否上传了文件
    if (!addForm.value.wechat_image) {
      ElMessage.error('请上传微信二维码')
      return
    }
    
    addLoading.value = true
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('contact_phone', addForm.value.contact_phone)
    formData.append('wechat_number', addForm.value.wechat_number)
    
    // 确保文件正确添加到FormData
    if (addForm.value.wechat_image instanceof File) {
      formData.append('wechat_image', addForm.value.wechat_image)
    } else {
      ElMessage.error('文件格式错误，请重新上传')
      return
    }
    
    console.log('提交的表单数据:', {
      contact_phone: addForm.value.contact_phone,
      wechat_number: addForm.value.wechat_number,
      wechat_image: addForm.value.wechat_image,
      wechat_image_name: addForm.value.wechat_image?.name,
      wechat_image_type: addForm.value.wechat_image?.type,
      wechat_image_size: addForm.value.wechat_image?.size,
      fileList: fileList.value
    })
    
    // 调试FormData内容
    console.log('FormData内容:')
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value)
    }
    
    // 调用API
    const response = await customerServiceApi.createCustomerService(formData)
    
    if (response.success) {
      ElMessage.success('添加客服成功')
      addDialogVisible.value = false
      resetAddForm()
      getCustomerServiceList()
    } else {
      ElMessage.error(response.message || '添加客服失败')
    }
    
  } catch (error) {
    console.error('添加客服失败:', error)
    ElMessage.error(error.message || '添加客服失败，请重试')
  } finally {
    addLoading.value = false
  }
}


// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
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

// 组件挂载时获取数据
onMounted(() => {
  getCustomerServiceList()
})
</script>

<style scoped>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f5f5;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
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
  align-items: center;
}

.header-right .el-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 32px;
  padding: 8px 16px;
  font-size: 14px;
  line-height: 1.4;
}

/* 对话框样式 */
.upload-demo {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

.upload-demo :deep(.el-upload__text) {
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}

/* 页面内容样式 */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 140px);
  width: 100%;
}

/* 表格卡片样式 */
.table-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  width: 100%;
  overflow: hidden;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  flex: 1;
  width: 100% !important;
  min-width: 100%;
}

.table-card :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.table-card :deep(.el-table__header-wrapper) {
  width: 100% !important;
}

.table-card :deep(.el-table__header) {
  background-color: #fafafa;
}

.table-card :deep(.el-table th) {
  background-color: #fafafa !important;
  color: #606266;
  font-weight: 600;
}

/* 二维码图片样式 */
.qr-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qr-code-image:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.image-error,
.no-image {
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon,
.no-image .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

/* 分页样式 */
.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}

/* 表格行悬停效果 */
.table-card :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 弹窗样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 图片预览样式 */
.image-preview-container {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.image-preview-container:hover {
  border-color: #409eff;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-actions {
  margin-top: 12px;
}

.preview-actions .el-button {
  border-radius: 4px;
}

/* 上传组件样式 */
.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

.upload-demo :deep(.el-upload-list--picture-card) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-demo :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

/* 图片预览样式 */
.upload-preview {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-image:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.remove-image-btn {
  height: 32px;
}
</style>
