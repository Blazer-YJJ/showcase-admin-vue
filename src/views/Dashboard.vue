<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>控制台</h1>
      <p>欢迎使用管理后台系统</p>
    </div>
    
    <div class="dashboard-content">
      <!-- 用户信息卡片 -->
      <el-card class="user-card">
        <div class="user-info">
          <div class="user-avatar">
            <el-icon size="48">
              <User />
            </el-icon>
          </div>
            
          <div class="user-details">
            <h3>{{ user?.username || '管理员' }}</h3>
            <p>{{ user?.email || 'admin@example.com' }}</p>
            <el-tag type="success" size="small">在线</el-tag>
          </div>
            
          <div class="logout-btn">
            <el-button type="danger" size="small" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
      </el-card>


    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuth } from '../utils/auth.js'
import { 
  User
} from '@element-plus/icons-vue'

const router = useRouter()
const { user, logout } = useAuth()


// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确认退出登录吗？',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
}

.user-card {
  padding: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.user-details p {
  margin: 0 0 12px 0;
  color: #909399;
  font-size: 14px;
}

.logout-btn {
  margin-left: auto;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .logout-btn {
    margin: 0;
    margin-top: 16px;
  }
}
</style>