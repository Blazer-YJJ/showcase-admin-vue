<template>
  <div class="page-container">
    <div class="page-header">
      <h1>会员管理</h1>
      <p>管理系统会员账号的增删改查操作</p>
    </div>
    <div class="page-content">
      <el-card class="content-card">
        <!-- 操作栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="searchText"
              placeholder="搜索会员姓名或用户名"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch" class="search-btn">
              搜索
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-button type="success" @click="showAddDialog" size="default" class="add-btn">
              <el-icon><Plus /></el-icon>
              添加会员
            </el-button>
            <el-button type="primary" @click="showRefreshData" size="default">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </div>

        <!-- 会员列表表格 -->
        <el-table 
          :data="userList" 
          v-loading="loading"
          element-loading-text="正在加载数据..."
          class="user-table"
          :row-style="{ backgroundColor: '#fafbfc' }"
        >
          <el-table-column type="index" label="序号" width="80" align="center" />
          
          <el-table-column prop="name" label="会员姓名" min-width="120" align="center">
            <template #default="{ row }">
              <div class="user-name">{{ row.name }}</div>
            </template>
          </el-table-column>
          
          <el-table-column prop="username" label="用户名" min-width="120" align="center">
            <template #default="{ row }">
              <div class="user-username">{{ row.username }}</div>
            </template>
          </el-table-column>
          
          <el-table-column prop="member_type" label="会员类型" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getMemberTypeTagType(row.member_type)"
                size="small"
                class="member-type-tag"
              >
                {{ getMemberTypeText(row.member_type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="created_at" label="创建时间" min-width="160" align="center">
            <template #default="{ row }">
              <div class="time-text">{{ formatDateTime(row.created_at) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column prop="updated_at" label="更新时间" min-width="160" align="center">
            <template #default="{ row }">
              <div class="time-text">{{ formatDateTime(row.updated_at) }}</div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="openEditDialog(row)"
                  class="action-btn edit-btn"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="confirmDelete(row)"
                  class="action-btn delete-btn"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalCount"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            class="custom-pagination"
          />
        </div>
      </el-card>
    </div>

    <!-- 编辑会员对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑会员信息"
      width="500px"
      :before-close="handleEditDialogClose"
      class="edit-dialog"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item label="会员姓名" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入会员姓名"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="editForm.username"
            placeholder="请输入用户名"
            disabled
          />
        </el-form-item>
        
        <el-form-item label="会员类型" prop="member_type">
          <el-select
            v-model="editForm.member_type"
            placeholder="请选择会员类型"
            style="width: 100%"
          >
            <el-option label="普通会员" value="normal" />
            <el-option label="VIP会员" value="vip" />
            <el-option label="超级VIP" value="svip" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelEdit" class="cancel-btn">取消</el-button>
          <el-button 
            type="primary" 
            @click="saveEdit"
            :loading="saveLoading"
            class="save-btn"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加会员对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加会员"
      width="500px"
      :close-on-click-modal="false"
      class="dialog-container"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="会员姓名" prop="name">
          <el-input
            v-model="addForm.name"
            placeholder="请输入会员姓名"
          />
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="addForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="会员类型" prop="member_type">
          <el-select
            v-model="addForm.member_type"
            placeholder="请选择会员类型"
            style="width: 100%"
          >
            <el-option label="普通会员" value="normal" />
            <el-option label="VIP会员" value="vip" />
            <el-option label="超级VIP" value="svip" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAdd" class="cancel-btn">取消</el-button>
          <el-button 
            type="primary" 
            @click="saveAdd"
            :loading="addLoading"
            class="save-btn"
          >
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { userApi } from '../config/api.js'

// 响应式数据
const loading = ref(false)
const userList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const searchText = ref('')

// 编辑对话框相关
const editDialogVisible = ref(false)
const saveLoading = ref(false)
const editFormRef = ref()
const editForm = reactive({
  user_id: '',
  name: '',
  username: '',
  member_type: ''
})

// 添加对话框相关
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref()
const addForm = reactive({
  name: '',
  username: '',
  password: '',
  member_type: 'normal' // 默认普通会员
})

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入会员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  member_type: [
    { required: true, message: '请选择会员类型', trigger: 'change' }
  ]
}

const addRules = {
  name: [
    { required: true, message: '请输入会员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度最少 6 个字符', trigger: 'blur' }
  ],
  member_type: [
    { required: true, message: '请选择会员类型', trigger: 'change' }
  ]
}

// 获取会员列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const result = await userApi.getUsers(currentPage.value, pageSize.value)
    if (result.success) {
      userList.value = result.data
      totalCount.value = result.pagination.total
    } else {
      ElMessage.error('获取会员列表失败')
    }
  } catch (error) {
    console.error('获取会员列表错误:', error)
    ElMessage.error(error.message || '获取会员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 刷新数据
const showRefreshData = () => {
  fetchUserList()
  ElMessage.success('数据已刷新')
}

// 显示添加对话框
const showAddDialog = () => {
  resetAddForm()
  addDialogVisible.value = true
}

// 重置添加表单
const resetAddForm = () => {
  addForm.name = ''
  addForm.username = ''
  addForm.password = ''
  addForm.member_type = 'normal'
  if (addFormRef.value) {
    addFormRef.value.clearValidate()
  }
}

// 取消添加
const cancelAdd = () => {
  addDialogVisible.value = false
  resetAddForm()
}

// 保存添加
const saveAdd = async () => {
  if (!addFormRef.value) return
  
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      addLoading.value = true
      try {
        const userData = {
          name: addForm.name,
          username: addForm.username,
          password: addForm.password,
          member_type: addForm.member_type
        }
        
        const result = await userApi.createUser(userData)
        
        if (result.success) {
          ElMessage.success('会员创建成功')
          addDialogVisible.value = false
          resetAddForm()
          fetchUserList() // 刷新列表
        } else {
          ElMessage.error(result.message || '创建失败')
        }
      } catch (error) {
        console.error('创建会员错误:', error)
        ElMessage.error(error.message || '创建失败')
      } finally {
        addLoading.value = false
      }
    }
  })
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUserList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUserList()
}

// 会员类型相关方法
const getMemberTypeText = (memberType) => {
  const typeMap = {
    'normal': '普通会员',
    'vip': 'VIP会员',
    'svip': '超级VIP'
  }
  return typeMap[memberType] || memberType
}

const getMemberTypeTagType = (memberType) => {
  const typeMap = {
    'normal': 'info',
    'vip': 'primary',
    'svip': 'danger'
  }
  return typeMap[memberType] || 'info'
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

// 编辑相关方法
const openEditDialog = (user) => {
  editForm.user_id = user.user_id
  editForm.name = user.name
  editForm.username = user.username
  editForm.member_type = user.member_type
  editDialogVisible.value = true
}

const cancelEdit = () => {
  editDialogVisible.value = false
  resetForm()
}

const handleEditDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  editForm.user_id = ''
  editForm.name = ''
  editForm.username = ''
  editForm.member_type = ''
}

const saveEdit = async () => {
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    saveLoading.value = true
    
    // 构建更新数据，只包含允许修改的字段
    const updateData = {
      name: editForm.name,
      member_type: editForm.member_type
    }
    
    const result = await userApi.updateUser(editForm.user_id, updateData)
    
    if (result.success) {
      ElMessage.success('会员信息更新成功')
      editDialogVisible.value = false
      resetForm()
      fetchUserList() // 刷新列表
    } else {
      ElMessage.error(result.message || '更新失败')
    }
  } catch (error) {
    console.error('更新会员信息错误:', error)
    ElMessage.error(error.message || '更新会员信息失败')
    saveLoading.value = false
  }
}

const confirmDelete = (user) => {
  ElMessageBox.confirm(
    `确定要删除会员 "${user.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'confirm-delete-btn'
    }
  ).then(async () => {
    await deleteUser(user)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const deleteUser = async (user) => {
  try {
    const result = await userApi.deleteUser(user.user_id)
    
    if (result.success) {
      ElMessage.success('会员删除成功')
      fetchUserList() // 刷新列表
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    console.error('删除会员错误:', error)
    ElMessage.error(error.message || '删除会员失败')
  }
}

// 页面初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
/* 页面容器 */
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f7fa;
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* 主内容区域 */
.page-content {
  height: calc(100% - 80px);
}

.content-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 280px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: none;
}

.search-input :deep(.el-input__wrapper):hover {
  border-color: #c0c4cc;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-btn {
  background-color: #409eff;
  border: 1px solid #409eff;
  color: white;
  border-radius: 6px;
}

.search-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.toolbar-right .el-button {
  background-color: #409eff;
  border: 1px solid #409eff;
  color: white;
  border-radius: 6px;
}

.toolbar-right .el-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.add-btn {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
}

.add-btn:hover {
  background-color: #85ce61 !important;
  border-color: #85ce61 !important;
}

/* 表格样式 */
.user-table {
  margin-bottom: 20px;
}

.user-table :deep(.el-table__header) {
  background-color: #ecf0f1;
}

.user-table :deep(.el-table__header th) {
  background-color: #ecf0f1 !important;
  color: #2c3e50;
  font-weight: 600;
}

.user-table :deep(.el-table__row:hover > td) {
  background-color: #e8f4fd !important;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.user-username {
  color: #34495e;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.member-type-tag {
  border-radius: 12px;
  font-weight: 500;
}

.time-text {
  color: #7f8c8d;
  font-size: 13px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
}

.edit-btn {
  background-color: #409eff;
  border-color: #409eff;
}

.edit-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.custom-pagination :deep(.el-pager li) {
  border-radius: 4px;
  margin: 0 2px;
}

.custom-pagination :deep(.el-pager li:hover) {
  background-color: #ecf0f1;
}

/* 编辑对话框样式 */
.edit-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 20px;
}

.edit-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.edit-form {
  padding: 20px;
}

.edit-form :deep(.el-form-item__label) {
  color: #2c3e50;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 20px 20px;
}

.cancel-btn {
  background-color: #ecf0f1;
  border-color: #bdc3c7;
  color: #7f8c8d;
  border-radius: 6px;
}

.save-btn {
  background-color: #409eff;
  border-color: #409eff;
  border-radius: 6px;
}

.save-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.confirm-delete-btn {
  background-color: #e74c3c !important;
  border-color: #e74c3c !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 15px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
  }
  
  .toolbar-left {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>