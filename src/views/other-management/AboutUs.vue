<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>关于我们</h1>
        <p>管理公司信息和关于我们的页面内容</p>
      </div>
      <div class="header-right">
        <el-button 
          v-if="!aboutUsData" 
          type="primary" 
          @click="openCreateDialog"
        >
          <el-icon><Plus /></el-icon>
          创建信息
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 关于我们信息展示 -->
      <el-card v-if="aboutUsData" class="info-card">
        <template #header>
          <div class="card-header">
            <span>关于我们信息</span>
            <div class="header-actions">
              <el-button type="primary" @click="openEditDialog">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" @click="handleDelete">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </template>

        <div v-loading="loading" class="about-us-content">
          <!-- 基本信息 -->
          <div class="info-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label>公司名称：</label>
                  <span>{{ aboutUsData.company_name }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>联系电话：</label>
                  <span>{{ aboutUsData.contact_phone }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label>联系邮箱：</label>
                  <span>{{ aboutUsData.email }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>公司官网：</label>
                  <a :href="aboutUsData.website_url" target="_blank" class="website-link">
                    {{ aboutUsData.website_url }}
                  </a>
                </div>
              </el-col>
            </el-row>
            <div class="info-item">
              <label>公司地址：</label>
              <span>{{ aboutUsData.address }}</span>
            </div>
            <div class="info-item">
              <label>主营业务：</label>
              <span>{{ aboutUsData.main_business }}</span>
            </div>
            <div class="info-item">
              <label>公司简介：</label>
              <p class="description-text">{{ aboutUsData.company_description }}</p>
            </div>
            <div class="info-item">
              <label>状态：</label>
              <el-tag :type="aboutUsData.is_active ? 'success' : 'danger'">
                {{ aboutUsData.is_active ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="info-section">
            <h3 class="section-title">时间信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <label>创建时间：</label>
                  <span>{{ formatDateTime(aboutUsData.created_at) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>更新时间：</label>
                  <span>{{ formatDateTime(aboutUsData.updated_at) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-card>

      <!-- 空状态 -->
      <el-card v-else class="empty-card">
        <div class="empty-content">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <h3>暂无关于我们信息</h3>
          <p>请点击上方按钮创建关于我们的信息</p>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            创建信息
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑关于我们' : '创建关于我们'"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称" prop="company_name">
              <el-input
                v-model="formData.company_name"
                placeholder="请输入公司名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input
                v-model="formData.contact_phone"
                placeholder="请输入联系电话"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入联系邮箱"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司官网" prop="website_url">
              <el-input
                v-model="formData.website_url"
                placeholder="请输入公司官网"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="公司地址" prop="address">
          <el-input
            v-model="formData.address"
            placeholder="请输入公司地址"
            clearable
          />
        </el-form-item>

        <el-form-item label="主营业务" prop="main_business">
          <el-input
            v-model="formData.main_business"
            type="textarea"
            :rows="3"
            placeholder="请输入主营业务"
          />
        </el-form-item>

        <el-form-item label="公司简介" prop="company_description">
          <el-input
            v-model="formData.company_description"
            type="textarea"
            :rows="4"
            placeholder="请输入公司简介"
          />
        </el-form-item>

        <el-form-item label="是否启用" prop="is_active">
          <el-radio-group v-model="formData.is_active">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import { aboutUsApi } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const aboutUsData = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  company_name: '',
  main_business: '',
  address: '',
  contact_phone: '',
  company_description: '',
  website_url: '',
  email: '',
  is_active: 1
})

// 表单验证规则
const formRules = {
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入公司地址', trigger: 'blur' }
  ],
  main_business: [
    { required: true, message: '请输入主营业务', trigger: 'blur' }
  ],
  company_description: [
    { required: true, message: '请输入公司简介', trigger: 'blur' }
  ]
}

// 页面加载时获取数据
onMounted(async () => {
  await loadAboutUsData()
})

// 加载关于我们数据
const loadAboutUsData = async () => {
  try {
    loading.value = true
    const response = await aboutUsApi.getAboutUs()
    
    if (response.success) {
      aboutUsData.value = response.data
    } else {
      ElMessage.error(response.message || '获取关于我们信息失败')
    }
  } catch (error) {
    console.error('获取关于我们信息错误:', error)
    ElMessage.error(error.message || '获取关于我们信息失败')
  } finally {
    loading.value = false
  }
}

// 打开创建对话框
const openCreateDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = () => {
  isEdit.value = true
  // 填充表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = aboutUsData.value[key]
  })
  dialogVisible.value = true
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'is_active') {
      formData[key] = 1
    } else {
      formData[key] = ''
    }
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    let response
    if (isEdit.value) {
      response = await aboutUsApi.updateAboutUs(aboutUsData.value.about_id, formData)
    } else {
      response = await aboutUsApi.createAboutUs(formData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      closeDialog()
      await loadAboutUsData() // 刷新数据
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    if (error !== false) { // 表单验证失败时 error 为 false
      console.error('提交表单错误:', error)
      ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } finally {
    submitLoading.value = false
  }
}

// 删除关于我们信息
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除关于我们信息吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await aboutUsApi.deleteAboutUs(aboutUsData.value.about_id)
    
    if (response.success) {
      ElMessage.success('删除成功')
      aboutUsData.value = null
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除关于我们信息错误:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 日期格式化
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
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

/* 页面内容样式 */
.page-content {
  height: calc(100% - 100px);
}

/* 信息卡片样式 */
.info-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card :deep(.el-card__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 关于我们内容样式 */
.about-us-content {
  padding: 0;
}

.info-section {
  margin-bottom: 32px;
  padding: 24px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.info-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-item span {
  color: #303133;
  flex: 1;
}

.website-link {
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
}

.website-link:hover {
  text-decoration: underline;
}

.description-text {
  margin: 0;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 空状态样式 */
.empty-card {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-card :deep(.el-card__body) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
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
  margin: 0 0 20px 0;
  font-size: 14px;
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

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 600;
  color: #606266;
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
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .info-section {
    padding: 16px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-item label {
    min-width: auto;
    margin-bottom: 4px;
  }
  
  /* 对话框响应式 */
  .el-dialog {
    width: 95% !important;
    margin: 0 auto;
  }
  
  .el-col {
    width: 100% !important;
  }
}
</style>
