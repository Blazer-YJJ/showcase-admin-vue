<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>轮播图管理</h1>
        <p>管理首页轮播图的展示内容和排序</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          添加轮播图
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 轮播图列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="bannerList"
          stripe
          style="width: 100%"
          empty-text="暂无轮播图数据"
        >
          <el-table-column prop="banner_id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="150" />
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="轮播图" width="120">
            <template #default="{ row }">
              <div class="banner-image">
                <el-image
                  v-if="row.image_url"
                  :src="getImageUrl(row.image_url)"
                  fit="cover"
                  class="banner-img"
                  :preview-src-list="[getImageUrl(row.image_url)]"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>加载失败</span>
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
          <el-table-column prop="sort_order" label="排序" width="80" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_active ? 'success' : 'danger'">
                {{ row.is_active ? '启用' : '禁用' }}
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

    <!-- 添加/编辑轮播图弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑轮播图' : '添加轮播图'"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="banner-form"
      >
        <el-form-item label="轮播图标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入轮播图标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="轮播图描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入轮播图描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="轮播图图片" prop="image_url">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :before-upload="handleBeforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            accept="image/*"
            drag
            class="upload-demo"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将图片拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传jpg/png文件，且不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="排序" prop="sort_order">
          <el-input-number
            v-model="formData.sort_order"
            :min="0"
            :max="999"
            placeholder="请输入排序值"
            style="width: 200px"
          />
          <span class="form-tip">数值越小排序越靠前</span>
        </el-form-item>
        
        <el-form-item label="状态" prop="is_active">
          <el-radio-group v-model="formData.is_active">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture, UploadFilled } from '@element-plus/icons-vue'
import { getBanners, deleteBanner, createBanner, updateBanner } from '@/api/banner'
import { getImageUrl } from '@/config/api'

// 响应式数据
const loading = ref(false)
const bannerList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)


// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref()
const uploadRef = ref()

// 表单数据
const formData = reactive({
  banner_id: null,
  title: '',
  description: '',
  image_url: '',
  sort_order: 0,
  is_active: 1
})

// 文件上传相关
const fileList = ref([])
const previewImageUrl = ref('')

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入轮播图标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度在1到50个字符', trigger: 'blur' }
  ],
  image_url: [
    { required: true, message: '请上传轮播图', trigger: 'change' }
  ],
  sort_order: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}


// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取轮播图列表
const fetchBannerList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    const response = await getBanners(params)
    if (response.success) {
      bannerList.value = response.data
      total.value = response.pagination.total
    } else {
      ElMessage.error(response.message || '获取轮播图列表失败')
    }
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
    ElMessage.error('获取轮播图列表失败')
  } finally {
    loading.value = false
  }
}


// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchBannerList()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchBannerList()
}

// 打开添加弹窗
const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(formData, {
    banner_id: row.banner_id,
    title: row.title,
    description: row.description || '',
    image_url: row.image_url,
    sort_order: row.sort_order,
    is_active: row.is_active
  })
  
  // 设置文件列表
  if (row.image_url) {
    fileList.value = [{
      name: row.title,
      url: getImageUrl(row.image_url)
    }]
    previewImageUrl.value = getImageUrl(row.image_url)
  } else {
    fileList.value = []
    previewImageUrl.value = ''
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    banner_id: null,
    title: '',
    description: '',
    image_url: '',
    sort_order: 0,
    is_active: 1
  })
  fileList.value = []
  previewImageUrl.value = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 关闭弹窗
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 文件上传前验证
const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

// 文件变化处理
const handleFileChange = (file, fileList) => {
  if (!file || !file.raw) {
    return
  }
  
  formData.image_url = file.raw
  previewImageUrl.value = URL.createObjectURL(file.raw)
}

// 文件移除处理
const handleFileRemove = () => {
  formData.image_url = ''
  previewImageUrl.value = ''
  fileList.value = []
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const submitData = {
      title: formData.title,
      description: formData.description,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      image_url: formData.image_url
    }
    
    let response
    if (isEdit.value) {
      response = await updateBanner(formData.banner_id, submitData)
    } else {
      response = await createBanner(submitData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      closeDialog()
      fetchBannerList()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '添加失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除轮播图
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除轮播图"${row.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    loading.value = true
    const response = await deleteBanner(row.banner_id)
    
    if (response.success) {
      ElMessage.success('删除成功')
      fetchBannerList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除轮播图失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBannerList()
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

.header-right {
  display: flex;
  gap: 12px;
}

/* 页面内容样式 */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100% - 100px);
}


/* 表格卡片样式 */
.table-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  flex: 1;
}

.table-card :deep(.el-table__header) {
  background-color: #fafafa;
}

.table-card :deep(.el-table th) {
  background-color: #fafafa !important;
  color: #606266;
  font-weight: 600;
}

/* 轮播图图片样式 */
.banner-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-img {
  width: 80px;
  height: 50px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.banner-img:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.image-error,
.no-image {
  width: 80px;
  height: 50px;
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
  font-size: 16px;
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
.banner-form {
  padding: 20px 0;
}

.form-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 上传组件样式 */
.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

.upload-demo :deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

/* 状态标签样式 */
.el-tag--success {
  background-color: #f0f9ff;
  border-color: #67c23a;
  color: #67c23a;
}

.el-tag--danger {
  background-color: #fef0f0;
  border-color: #f56c6c;
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
}
</style>
