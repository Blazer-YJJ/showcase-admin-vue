<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
      <h1>意见反馈</h1>
        <p>管理用户提交的意见反馈信息</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 搜索和筛选区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="反馈标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入反馈标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
            />
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

      <!-- 反馈列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="feedbackList"
          stripe
          style="width: 100%"
          empty-text="暂无反馈数据"
        >
          <el-table-column prop="feedback_id" label="反馈ID" width="80" />
          <el-table-column prop="title" label="反馈标题" min-width="150" show-overflow-tooltip />
          <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
          <el-table-column label="反馈图片" width="120">
            <template #default="{ row }">
              <div class="feedback-images">
                <el-image
                  v-if="row.feedback_image"
                  :src="getImageUrl(row.feedback_image)"
                  :preview-src-list="[getImageUrl(row.feedback_image)]"
                  fit="contain"
                  class="feedback-image"
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
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="用户昵称" width="120" show-overflow-tooltip />
          <el-table-column prop="feedback_time" label="反馈时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.feedback_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="info" size="small" @click="openDetailDialog(row)">
                查看
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

    <!-- 反馈详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="反馈详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-loading="detailLoading" class="feedback-detail">
        <div v-if="feedbackDetail" class="detail-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>反馈ID：</label>
                  <span>{{ feedbackDetail.feedback_id }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户ID：</label>
                  <span>{{ feedbackDetail.user_id }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户名：</label>
                  <span>{{ feedbackDetail.username }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户昵称：</label>
                  <span>{{ feedbackDetail.name }}</span>
                </div>
              </el-col>
            </el-row>
            <div class="detail-item">
              <label>反馈标题：</label>
              <span>{{ feedbackDetail.title }}</span>
            </div>
            <div class="detail-item">
              <label>反馈内容：</label>
              <p class="content-text">{{ feedbackDetail.content }}</p>
            </div>
          </div>

          <!-- 反馈图片 -->
          <div class="detail-section" v-if="feedbackDetail.feedback_image">
            <h3 class="section-title">反馈图片</h3>
            <div class="image-container">
              <el-image
                :src="getImageUrl(feedbackDetail.feedback_image)"
                :preview-src-list="[getImageUrl(feedbackDetail.feedback_image)]"
                fit="contain"
                class="detail-image"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="detail-section">
            <h3 class="section-title">时间信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>反馈时间：</label>
                  <span>{{ formatDateTime(feedbackDetail.feedback_time) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>创建时间：</label>
                  <span>{{ formatDateTime(feedbackDetail.created_at) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDetailDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Picture } from '@element-plus/icons-vue'
import { feedbackApi, getImageUrl } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const feedbackList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 反馈详情弹窗相关
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const feedbackDetail = ref(null)

// 搜索表单
const searchForm = reactive({
  title: '',
  username: ''
})

// 页面加载时获取数据
onMounted(async () => {
  await loadFeedbackList()
})

// 加载反馈列表
const loadFeedbackList = async () => {
  try {
    loading.value = true
    const response = await feedbackApi.getFeedbacks(currentPage.value, pageSize.value)
    
    if (response.success) {
      feedbackList.value = response.data
      total.value = response.pagination.total
    } else {
      ElMessage.error(response.message || '获取反馈列表失败')
    }
  } catch (error) {
    console.error('获取反馈列表错误:', error)
    ElMessage.error(error.message || '获取反馈列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadFeedbackList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.title = ''
  searchForm.username = ''
  currentPage.value = 1
  loadFeedbackList()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  loadFeedbackList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadFeedbackList()
}

// 打开反馈详情对话框
const openDetailDialog = async (feedback) => {
  try {
    detailLoading.value = true
    detailDialogVisible.value = true
    
    const response = await feedbackApi.getFeedbackDetail(feedback.feedback_id)
    
    if (response.success) {
      feedbackDetail.value = response.data
    } else {
      ElMessage.error(response.message || '获取反馈详情失败')
      detailDialogVisible.value = false
    }
  } catch (error) {
    console.error('获取反馈详情错误:', error)
    ElMessage.error(error.message || '获取反馈详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 关闭反馈详情对话框
const closeDetailDialog = () => {
  detailDialogVisible.value = false
  feedbackDetail.value = null
}

// 删除反馈
const handleDelete = async (feedback) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除反馈"${feedback.title}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await feedbackApi.deleteFeedback(feedback.feedback_id)
    
    if (response.success) {
      ElMessage.success('反馈删除成功')
      loadFeedbackList() // 刷新列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除反馈错误:', error)
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100% - 100px);
}

/* 搜索卡片样式 */
.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-card :deep(.el-card__body) {
  padding: 20px;
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

/* 反馈图片样式 */
.feedback-images {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feedback-image:hover {
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

/* 反馈详情弹窗样式 */
.feedback-detail {
  min-height: 400px;
}

.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.detail-section .section-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
  margin-right: 8px;
}

.detail-item span {
  color: #303133;
  flex: 1;
}

.content-text {
  margin: 0;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 图片容器样式 */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-image {
  max-width: 400px;
  max-height: 400px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-image:hover {
  border-color: #409eff;
  transform: scale(1.02);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  
  .search-card :deep(.el-form) {
    flex-direction: column;
  }
  
  .search-card :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  /* 详情弹窗响应式 */
  .detail-section {
    padding: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-item label {
    min-width: auto;
    margin-bottom: 4px;
  }
  
  .detail-image {
    max-width: 100%;
    max-height: 300px;
  }
}
</style>
