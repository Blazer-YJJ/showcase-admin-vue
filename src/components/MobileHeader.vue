<template>
  <div class="mobile-header">
    <el-button 
      type="text" 
      class="menu-button"
      @click="toggleSidebar"
    >
      <el-icon><Menu /></el-icon>
    </el-button>
    <h1 class="header-title">管理后台</h1>
    <div class="header-actions">
      <!-- 可以添加其他操作按钮 -->
    </div>
  </div>
</template>

<script setup>
import { Menu } from '@element-plus/icons-vue'

const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>

<style scoped>
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.menu-button {
  font-size: 20px;
  color: #606266;
  padding: 8px;
}

.menu-button:hover {
  color: #409eff;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  text-align: center;
}

.header-actions {
  width: 40px;
  display: flex;
  justify-content: flex-end;
}

/* 只在移动端显示 */
@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}
</style>
