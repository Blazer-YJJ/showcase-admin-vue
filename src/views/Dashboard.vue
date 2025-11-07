<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2025-10-03 10:18:42
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2025-11-07 01:05:04
 * @FilePath: \showcase-admin-vue\src\views\Dashboard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>控制台</h1>
      <p>欢迎使用管理后台系统</p>
    </div>
    
    <div class="dashboard-content">
      <!-- 统计数据卡片 -->
      <div v-loading="loading" class="statistics-grid">
        <!-- 商品数量 -->
        <el-card class="stat-card stat-card-primary" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stat-icon-primary">
              <el-icon size="32"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">商品数量</div>
              <div class="stat-value">{{ statistics.productCount || 0 }}</div>
            </div>
          </div>
        </el-card>

        <!-- 分类数量 -->
        <el-card class="stat-card stat-card-success" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stat-icon-success">
              <el-icon size="32"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">分类数量</div>
              <div class="stat-value">{{ statistics.categoryCount || 0 }}</div>
            </div>
          </div>
        </el-card>

        <!-- 订单数量 -->
        <el-card class="stat-card stat-card-warning" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stat-icon-warning">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">订单数量</div>
              <div class="stat-value">{{ statistics.orderCount || 0 }}</div>
            </div>
          </div>
        </el-card>

        <!-- 售后数量 -->
        <el-card class="stat-card stat-card-info" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stat-icon-info">
              <el-icon size="32"><Service /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">售后数量</div>
              <div class="stat-value">{{ statistics.afterSaleCount || 0 }}</div>
            </div>
          </div>
        </el-card>

        <!-- 用户数量 -->
        <el-card class="stat-card stat-card-purple" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stat-icon-purple">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">会员数量</div>
              <div class="stat-value">{{ statistics.userCount || 0 }}</div>
            </div>
          </div>
        </el-card>

        <!-- 管理员数量 -->
        <el-card class="stat-card stat-card-danger" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon stat-icon-danger">
              <el-icon size="32"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">管理员数量</div>
              <div class="stat-value">{{ statistics.adminCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 快捷跳转 -->
      <div class="quick-actions">
        <h2 class="section-title">快捷操作</h2>
        <div class="actions-grid">
          <el-card class="action-card" shadow="hover" @click="goToOrders">
            <div class="action-content">
              <div class="action-icon action-icon-order">
                <el-icon size="32"><Document /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">查看订单</div>
                <div class="action-desc">管理订单信息</div>
              </div>
              <div class="action-arrow">
                <el-icon size="20"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>

          <el-card class="action-card" shadow="hover" @click="goToAddMember">
            <div class="action-content">
              <div class="action-icon action-icon-member">
                <el-icon size="32"><User /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">添加会员</div>
                <div class="action-desc">创建新会员账号</div>
              </div>
              <div class="action-arrow">
                <el-icon size="20"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>

          <el-card class="action-card" shadow="hover" @click="goToAddProduct">
            <div class="action-content">
              <div class="action-icon action-icon-product">
                <el-icon size="32"><Box /></el-icon>
              </div>
              <div class="action-text">
                <div class="action-title">添加商品</div>
                <div class="action-desc">添加新商品信息</div>
              </div>
              <div class="action-arrow">
                <el-icon size="20"><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 技术支持 -->
    <div class="support-section">
      <el-card class="support-card" shadow="never">
        <div class="support-content">
          <div class="support-info">
            <h3 class="support-title">技术支持：JC软件开发</h3>
            <p class="support-text">联系微信：<span class="wechat-id">yangjingcheng168</span></p>
          </div>
          <div class="support-qrcode">
            <el-image
              :src="weixinImage"
              fit="contain"
              class="qrcode-image"
              :preview-src-list="[weixinImage]"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Box,
  Folder,
  Document,
  Service,
  User,
  UserFilled,
  ArrowRight,
  Picture
} from '@element-plus/icons-vue'
import { getStatistics } from '@/api/statistics.js'
import weixinImage from '@/static/weixin.png'

const router = useRouter()

// 数据
const loading = ref(false)
const statistics = ref({
  productCount: 0,
  categoryCount: 0,
  orderCount: 0,
  afterSaleCount: 0,
  userCount: 0,
  adminCount: 0
})

// 加载统计数据
const loadStatistics = async () => {
  try {
    loading.value = true
    const response = await getStatistics()

    if (response.success) {
      statistics.value = response.data || {}
    } else {
      ElMessage.error(response.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据错误:', error)
    ElMessage.error(error.message || '获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 快捷跳转
const goToOrders = () => {
  router.push('/order-management')
}

const goToAddMember = () => {
  router.push('/member-management')
}

const goToAddProduct = () => {
  router.push('/product-management')
}

// 页面加载时获取数据
onMounted(() => {
  loadStatistics()
})
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
  width: 100%;
}

/* 统计数据网格 */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}

/* 统计卡片 */
.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.stat-icon-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon-purple {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #764ba2;
}

.stat-icon-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

/* 卡片颜色主题 */
.stat-card-primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.stat-card-success {
  background: linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%);
}

.stat-card-warning {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
}

.stat-card-info {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
}

.stat-card-purple {
  background: linear-gradient(135deg, rgba(168, 237, 234, 0.2) 0%, rgba(254, 214, 227, 0.2) 100%);
}

.stat-card-danger {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 111, 0.1) 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-content {
    gap: 16px;
  }

  .stat-icon {
    width: 56px;
    height: 56px;
  }

  .stat-value {
    font-size: 28px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .statistics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 快捷操作区域 */
.quick-actions {
  margin-top: 40px;
}

.section-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.action-icon-order {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.action-icon-member {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon-product {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.action-text {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: #909399;
}

.action-arrow {
  color: #909399;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: #409eff;
  transform: translateX(4px);
}

/* 技术支持区域 */
.support-section {
  margin-top: 40px;
  padding-bottom: 20px;
}

.support-card {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.support-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding: 20px;
}

.support-info {
  flex: 1;
}

.support-title {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.support-text {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.wechat-id {
  color: #409eff;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.support-qrcode {
  flex-shrink: 0;
}

.qrcode-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qrcode-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

/* 响应式设计 - 快捷操作 */
@media (max-width: 768px) {
  .quick-actions {
    margin-top: 30px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .action-content {
    gap: 12px;
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }

  .support-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .qrcode-image {
    width: 100px;
    height: 100px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>