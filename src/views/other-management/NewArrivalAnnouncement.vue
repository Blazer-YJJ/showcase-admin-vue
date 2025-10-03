<template>
  <div class="page-container">
    <div class="page-header">
      <h1>上新公告</h1>
      <p>这里是上新公告页面</p>
    </div>
    <div class="page-content">
      <el-card class="content-card">
        <div class="empty-content">
          <el-icon class="empty-icon"><Notification /></el-icon>
          <h3>上新公告</h3>
          <p>此页面用于管理新商品上新的公告信息</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { Notification } from '@element-plus/icons-vue'
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
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
  height: calc(100% - 80px);
}

.content-card {
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
  margin: 0;
  font-size: 14px;
}
</style>
