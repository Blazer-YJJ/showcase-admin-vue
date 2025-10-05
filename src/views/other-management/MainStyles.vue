<template>
  <div class="page-container">
    <div class="page-header">
      <h1>主推款式</h1>
      <p>管理和展示主推商品款式</p>
    </div>
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在加载主推商品...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-icon class="error-icon"><Warning /></el-icon>
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <el-button type="primary" @click="fetchPromotions">重新加载</el-button>
      </div>
      
      <!-- 商品列表 -->
      <div v-else-if="promotions.length > 0" class="products-container">
        <div class="products-grid">
          <ProductCard
            v-for="(promotion, index) in promotions" 
            :key="promotion.promotion_id"
            :product="promotion"
            :sort-index="index + 1"
            :can-move-up="index > 0"
            :can-move-down="index < promotions.length - 1"
            @move-up="moveUp(index)"
            @move-down="moveDown(index)"
            @remove="removePromotion(promotion.promotion_id)"
          />
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-content">
        <el-icon class="empty-icon"><TrendCharts /></el-icon>
        <h3>暂无主推商品</h3>
        <p>还没有设置主推商品，请先添加商品</p>
        <el-button type="primary">添加主推商品</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  TrendCharts, 
  Loading, 
  Warning
} from '@element-plus/icons-vue'
import ProductCard from '@/components/ProductCard.vue'
import { mainPromotionsApi, getImageUrl } from '@/config/api.js'

// 响应式数据
const loading = ref(false)
const error = ref('')
const promotions = ref([])

// 模拟数据（当API不可用时使用）
const mockPromotions = [
  {
    promotion_id: 1,
    product_name: "经典白衬衫",
    product_description: "简约百搭的经典白衬衫，采用优质棉质面料，版型修身，适合各种场合穿着。",
    product_price: 299.00,
    category_name: "衬衫",
    product_tags: "经典,百搭,棉质,修身",
    main_image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&auto=format"
  },
  {
    promotion_id: 2,
    product_name: "休闲牛仔裤",
    product_description: "舒适耐穿的休闲牛仔裤，经典直筒版型，深蓝色调，搭配任何上衣都很好看。",
    product_price: 399.00,
    category_name: "裤子",
    product_tags: "休闲,经典,直筒,深蓝",
    main_image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop&auto=format"
  },
  {
    promotion_id: 3,
    product_name: "时尚风衣",
    product_description: "优雅时尚的中长款风衣，防风防水面料，经典双排扣设计，彰显都市女性魅力。",
    product_price: 899.00,
    category_name: "外套",
    product_tags: "时尚,风衣,防水,双排扣",
    main_image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&auto=format"
  }
]

// 获取主推商品列表
const fetchPromotions = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await mainPromotionsApi.getMainPromotions()
    
    if (result.success) {
      promotions.value = result.data.promotions || []
      ElMessage.success(result.message || '获取主推商品列表成功')
    } else {
      throw new Error(result.message || '获取主推商品列表失败')
    }
  } catch (err) {
    console.warn('API调用失败，使用模拟数据:', err.message)
    
    // API失败时使用模拟数据
    promotions.value = mockPromotions
    ElMessage.warning('使用演示数据，实际部署时请配置正确的API接口')
  } finally {
    loading.value = false
  }
}

// 图片错误处理现在由ProductCard组件处理

// 上移
const moveUp = async (index) => {
  if (index === 0) return
  
  const newPromotions = [...promotions.value]
  const temp = newPromotions[index]
  newPromotions[index] = newPromotions[index - 1]
  newPromotions[index - 1] = temp
  
  // 更新排序
  await updateSortOrder(newPromotions)
}

// 下移
const moveDown = async (index) => {
  if (index === promotions.value.length - 1) return
  
  const newPromotions = [...promotions.value]
  const temp = newPromotions[index]
  newPromotions[index] = newPromotions[index + 1]
  newPromotions[index + 1] = temp
  
  // 更新排序
  await updateSortOrder(newPromotions)
}

// 更新排序
const updateSortOrder = async (newPromotions) => {
  try {
    // 这里可以调用API更新排序，暂时只更新本地状态
    promotions.value = newPromotions
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
    await fetchPromotions() // 重新加载数据
  }
}

// 移除主推商品
const removePromotion = async (promotionId) => {
  try {
    await ElMessageBox.confirm('确定要移除此主推商品吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里可以调用API移除商品，暂时只更新本地状态
    promotions.value = promotions.value.filter(p => p.promotion_id !== promotionId)
    ElMessage.success('移除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除主推商品失败:', error)
      ElMessage.error('移除失败: ' + error.message)
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPromotions()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  height: calc(100% - 120px);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 16px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #f56c6c;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container h3 {
  margin: 0 0 8px 0;
  color: #f56c6c;
  font-size: 18px;
}

.error-container p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 商品列表 */
.products-container {
  height: 100%;
  overflow-y: auto;
}

/* 商品卡片网格布局 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

/* 卡片样式现在由ProductCard组件处理 */

.el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  border: none;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #66b3ff 0%, #409eff 100%);
}

/* 空状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 12px 0;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>