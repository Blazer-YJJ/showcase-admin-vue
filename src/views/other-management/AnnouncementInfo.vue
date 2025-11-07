<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>公告信息</h1>
        <p>管理公告信息的发布和编辑</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增公告
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 搜索和筛选区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="公告内容">
            <el-input
              v-model="searchForm.content"
              placeholder="请输入公告内容关键词"
              clearable
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.is_active"
              placeholder="请选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="全部" :value="null" />
              <el-option label="启用" :value="1" />
              <el-option label="未启用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 公告列表 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="announcements"
          stripe
          style="width: 100%"
          empty-text="暂无公告数据"
        >
          <el-table-column prop="announcement_id" label="ID" width="80" />
          <el-table-column prop="content" label="公告内容" min-width="300" show-overflow-tooltip />
          <el-table-column prop="is_active" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_active === 1 ? 'success' : 'info'">
                {{ row.is_active === 1 ? '启用' : '未启用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="updated_at" label="更新时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDate(row.updated_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="openEditDialog(row)"
              >
                编辑
              </el-button>
              <el-button
                :type="row.is_active === 1 ? 'warning' : 'success'"
                size="small"
                @click="toggleStatus(row)"
              >
                {{ row.is_active === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '新增公告'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-radio-group v-model="form.is_active">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">未启用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { announcementApi } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  content: '',
  is_active: null
})

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 公告列表
const announcements = ref([])

// 表单数据
const form = reactive({
  announcement_id: null,
  content: '',
  is_active: 1
})

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 1, max: 500, message: '公告内容长度在 1 到 500 个字符', trigger: 'blur' }
  ],
  is_active: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const currentEditId = computed(() => form.announcement_id)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取公告列表
const getAnnouncements = async () => {
  try {
    loading.value = true
    const response = await announcementApi.getAnnouncements(pagination.page, pagination.limit)
    
    if (response.success) {
      announcements.value = response.data.announcements || []
      pagination.total = response.data.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取公告列表失败')
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error(error.message || '获取公告列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  getAnnouncements()
}

// 重置搜索
const resetSearch = () => {
  searchForm.content = ''
  searchForm.is_active = null
  pagination.page = 1
  getAnnouncements()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.limit = val
  pagination.page = 1
  getAnnouncements()
}

const handleCurrentChange = (val) => {
  pagination.page = val
  getAnnouncements()
}

// 打开新增对话框
const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 打开编辑对话框
const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  form.announcement_id = row.announcement_id
  form.content = row.content
  form.is_active = row.is_active
}

// 重置表单
const resetForm = () => {
  form.announcement_id = null
  form.content = ''
  form.is_active = 1
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const formData = {
      content: form.content,
      is_active: form.is_active
    }
    
    let response
    if (isEdit.value) {
      response = await announcementApi.updateAnnouncement(currentEditId.value, formData)
    } else {
      response = await announcementApi.createAnnouncement(formData)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新公告成功' : '创建公告成功')
      dialogVisible.value = false
      getAnnouncements()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新公告失败' : '创建公告失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 切换状态
const toggleStatus = async (row) => {
  try {
    const newStatus = row.is_active === 1 ? 0 : 1
    const response = await announcementApi.toggleAnnouncementStatus(row.announcement_id, newStatus)
    
    if (response.success) {
      ElMessage.success('状态切换成功')
      getAnnouncements()
    } else {
      ElMessage.error(response.message || '状态切换失败')
    }
  } catch (error) {
    console.error('状态切换失败:', error)
    ElMessage.error(error.message || '状态切换失败')
  }
}

// 删除处理
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告"${row.content.substring(0, 20)}${row.content.length > 20 ? '...' : ''}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await announcementApi.deleteAnnouncement(row.announcement_id)
    
    if (response.success) {
      ElMessage.success('删除公告成功')
      getAnnouncements()
    } else {
      ElMessage.error(response.message || '删除公告失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除公告失败:', error)
      ElMessage.error(error.message || '删除公告失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getAnnouncements()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.page-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100% - 120px);
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-card {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-table .cell) {
  padding: 0 12px;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button--small) {
  padding: 5px 12px;
  font-size: 12px;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: flex-start;
  }
  
  .page-content {
    gap: 16px;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-button--small) {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
