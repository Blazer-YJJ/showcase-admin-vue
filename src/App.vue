<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2025-10-01 00:04:15
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2025-10-03 07:55:18
 * @FilePath: \showcase-admin-vue\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="app">
    <!-- 移动端头部 -->
    <MobileHeader @toggle-sidebar="handleToggleSidebar" />
    
    <!-- 主布局容器 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <Sidebar ref="sidebarRef" />
      
      <!-- 主内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import MobileHeader from './components/MobileHeader.vue'

const router = useRouter()
const sidebarRef = ref(null)

const handleToggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.openDrawer()
  }
}
</script>

<style scoped>
#app {
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-container {
  height: 100vh;
}

.main-content {
  background-color: #f5f5f5;
  padding: 0;
  overflow-y: auto;
}

/* 移动端样式调整 */
@media (max-width: 767px) {
  .main-container {
    height: calc(100vh - 60px);
  }
  
  .main-content {
    height: 100%;
  }
}

/* PC端样式调整 */
@media (min-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>
