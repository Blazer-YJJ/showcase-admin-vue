<template>
  <div class="product-selection-card" :class="{ 'selected': isSelected }" @click="toggleSelection">
    <div class="product-image">
      <img 
        :src="getMainImageUrl(product)" 
        :alt="product.name"
        @error="handleImageError"
      />
      <div v-if="isSelected" class="selection-overlay">
        <el-icon class="check-icon"><Check /></el-icon>
      </div>
    </div>
    <div class="product-info">
      <h4 class="product-name">{{ product.name }}</h4>
      <div class="product-category">
        <el-tag size="small" type="info">{{ getCategoryName(product.category_id) }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { getImageUrl } from '@/config/api.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'unselect'])

const isSelected = computed(() => props.selected)

const toggleSelection = () => {
  if (isSelected.value) {
    emit('unselect', props.product.product_id)
  } else {
    emit('select', props.product.product_id)
  }
}

const handleImageError = (event) => {
  event.target.src = '/src/assets/default-product.png'
}

const getCategoryName = (categoryId) => {
  const category = props.categories.find(cat => cat.category_id === categoryId)
  return category ? category.name : '未分类'
}

// 获取商品主图片URL
const getMainImageUrl = (product) => {
  if (!product.images || product.images.length === 0) {
    return ''
  }
  
  // 优先显示主图（image_type为'main'的图片）
  const mainImage = product.images.find(img => img.image_type === 'main')
  if (mainImage) {
    return getImageUrl(mainImage.image_url)
  }
  
  // 如果没有主图，显示第一张图片
  return getImageUrl(product.images[0].image_url)
}
</script>

<style scoped>
.product-selection-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.product-selection-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.product-selection-card.selected {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.product-image {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-selection-card:hover .product-image img {
  transform: scale(1.05);
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(64, 158, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-selection-card.selected .selection-overlay {
  opacity: 1;
}

.check-icon {
  font-size: 24px;
  color: white;
}

.product-info {
  padding: 12px;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-category {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-image {
    height: 100px;
  }
  
  .product-name {
    font-size: 13px;
  }
}
</style>
