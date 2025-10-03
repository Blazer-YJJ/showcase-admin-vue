<template>
  <div class="sidebar-container">
    <!-- PC端侧边栏 -->
    <el-aside 
      :width="sidebarWidth" 
      class="sidebar-pc"
      v-show="!isMobile"
    >
      <div class="logo">
        <h2>管理后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="false"
        router
      >
        <!-- 控制台 -->
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>控制台</span>
        </el-menu-item>

        <!-- 账户管理 -->
        <el-sub-menu index="account">
          <template #title>
            <el-icon><User /></el-icon>
            <span>账户管理</span>
          </template>
          <el-menu-item index="/account-management">账户管理</el-menu-item>
        </el-sub-menu>

        <!-- 会员管理 -->
        <el-sub-menu index="member">
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>会员管理</span>
          </template>
          <el-menu-item index="/member-management">会员管理</el-menu-item>
        </el-sub-menu>

        <!-- 订单管理 -->
        <el-sub-menu index="order">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/order-management">订单管理</el-menu-item>
          <el-menu-item index="/after-sales-management">售后管理</el-menu-item>
        </el-sub-menu>

        <!-- 商品管理 -->
        <el-sub-menu index="product">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/product-management">商品管理</el-menu-item>
          <el-menu-item index="/category-management">分类管理</el-menu-item>
        </el-sub-menu>

        <!-- 其他管理 -->
        <el-sub-menu index="other">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>其他管理</span>
          </template>
          <el-menu-item index="/explore-featured">探索精选</el-menu-item>
          <el-menu-item index="/main-styles">主推款式</el-menu-item>
          <el-menu-item index="/limited-events">限时活动</el-menu-item>
          <el-menu-item index="/carousel-info">轮播信息</el-menu-item>
          <el-menu-item index="/announcement-info">公告信息</el-menu-item>
          <el-menu-item index="/featured-recommendations">精品推荐</el-menu-item>
          <el-menu-item index="/new-arrival-announcement">上新公告</el-menu-item>
          <el-menu-item index="/popular-styles">热门款式</el-menu-item>
          <el-menu-item index="/pdf-export">PDF导出</el-menu-item>
          <el-menu-item index="/image-search">以图搜图</el-menu-item>
          <el-menu-item index="/customer-service-settings">客服设置</el-menu-item>
          <el-menu-item index="/about-us">关于我们</el-menu-item>
          <el-menu-item index="/feedback">意见反馈</el-menu-item>
        </el-sub-menu>
      </el-menu>
      
      <!-- 用户信息和退出 -->
      <div class="user-section">
        <div class="user-info">
          <div class="user-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="user-details">
            <div class="username">{{ user?.username || '管理员' }}</div>
            <div class="user-status">在线</div>
          </div>
        </div>
        <el-button type="danger" size="small" @click="handleLogout" class="logout-btn">
          退出
        </el-button>
      </div>
    </el-aside>

    <!-- 移动端抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :with-header="false"
      direction="ltr"
      size="240px"
      class="mobile-drawer"
    >
      <div class="mobile-sidebar">
        <div class="logo">
          <h2>管理后台</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          @select="handleMenuSelect"
        >
          <!-- 控制台 -->
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>控制台</span>
          </el-menu-item>

          <!-- 账户管理 -->
          <el-sub-menu index="account">
            <template #title>
              <el-icon><User /></el-icon>
              <span>账户管理</span>
            </template>
            <el-menu-item index="/account-management">账户管理</el-menu-item>
          </el-sub-menu>

          <!-- 会员管理 -->
          <el-sub-menu index="member">
            <template #title>
              <el-icon><Avatar /></el-icon>
              <span>会员管理</span>
            </template>
            <el-menu-item index="/member-management">会员管理</el-menu-item>
          </el-sub-menu>

          <!-- 订单管理 -->
          <el-sub-menu index="order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/order-management">订单管理</el-menu-item>
            <el-menu-item index="/after-sales-management">售后管理</el-menu-item>
          </el-sub-menu>

          <!-- 商品管理 -->
          <el-sub-menu index="product">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/product-management">商品管理</el-menu-item>
            <el-menu-item index="/category-management">分类管理</el-menu-item>
          </el-sub-menu>

          <!-- 其他管理 -->
          <el-sub-menu index="other">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>其他管理</span>
            </template>
            <el-menu-item index="/explore-featured">探索精选</el-menu-item>
            <el-menu-item index="/main-styles">主推款式</el-menu-item>
            <el-menu-item index="/limited-events">限时活动</el-menu-item>
            <el-menu-item index="/carousel-info">轮播信息</el-menu-item>
            <el-menu-item index="/announcement-info">公告信息</el-menu-item>
            <el-menu-item index="/featured-recommendations">精品推荐</el-menu-item>
            <el-menu-item index="/new-arrival-announcement">上新公告</el-menu-item>
            <el-menu-item index="/popular-styles">热门款式</el-menu-item>
            <el-menu-item index="/pdf-export">PDF导出</el-menu-item>
            <el-menu-item index="/image-search">以图搜图</el-menu-item>
            <el-menu-item index="/customer-service-settings">客服设置</el-menu-item>
            <el-menu-item index="/about-us">关于我们</el-menu-item>
            <el-menu-item index="/feedback">意见反馈</el-menu-item>
          </el-sub-menu>
        </el-menu>

        <!-- 移动端用户信息和退出 -->
        <div class="user-section mobile-user-section">
          <div class="user-info">
            <div class="user-avatar">
              <el-icon><User /></el-icon>
            </div>
            <div class="user-details">
              <div class="username">{{ user?.username || '管理员' }}</div>
              <div class="user-status">在线</div>
            </div>
          </div>
          <el-button type="danger" size="small" @click="handleLogout" class="logout-btn">
            退出
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, User, Avatar, Document, Box, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuth } from '../utils/auth.js'

const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()
const drawerVisible = ref(false)
const isMobile = ref(false)

const sidebarWidth = '240px'

const activeMenu = computed(() => {
  return route.path
})

const handleMenuSelect = () => {
  // 移动端选择菜单后关闭抽屉
  if (isMobile.value) {
    drawerVisible.value = false
  }
}

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

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 暴露给父组件的方法
defineExpose({
  openDrawer: () => {
    drawerVisible.value = true
  }
})
</script>

<style scoped>
.sidebar-container {
  height: 100%;
}

.sidebar-pc {
  background-color: #ffffff;
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.mobile-drawer .el-drawer__body {
  padding: 0;
}

.mobile-sidebar {
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.sidebar-menu {
  border: none;
  background-color: #ffffff;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #303133;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  background-color: #ffffff;
  color: #606266;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

/* 用户信息区域 */
.user-section {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.user-status {
  font-size: 12px;
  color: #67c23a;
}

.logout-btn {
  font-size: 12px;
  padding: 6px 12px;
}

.mobile-user-section {
  margin-top: auto;
}

/* 移动端样式 */
@media (max-width: 767px) {
  .sidebar-pc {
    display: none;
  }
}

/* PC端样式 */
@media (min-width: 768px) {
  .mobile-drawer {
    display: none;
  }
}
</style>