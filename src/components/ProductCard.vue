<template>
  <div class="product-card">
    <!-- 商品图片 -->
    <div class="card-image">
      <img 
        v-if="product.main_image" 
        :src="getImageUrl(product.main_image)" 
        :alt="product.product_name"
        @error="handleImageError"
      />
      <div v-else class="no-image">
        <el-icon><Picture /></el-icon>
      </div>
      
      <!-- 排序位置标识 -->
      <div class="sort-badge" v-if="showSortBadge">
        {{ sortIndex }}
      </div>
    </div>
    
    <!-- 商品信息 -->
    <div class="card-content">
      <h3 class="product-name">{{ product.product_name }}</h3>
      <div class="product-category">
        <el-tag size="small" type="info">{{ product.category_name || '未分类' }}</el-tag>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="card-actions">
      <div class="sort-controls" v-if="showSortControls">
        <el-button 
          size="small" 
          @click="$emit('moveUp')"
          :disabled="!canMoveUp"
          title="上移"
        >
          <el-icon><ArrowUp /></el-icon>
        </el-button>
        <el-button 
          size="small" 
          @click="$emit('moveDown')"
          :disabled="!canMoveDown"
          title="下移"
        >
          <el-icon><ArrowDown /></el-icon>
        </el-button>
      </div>
      
      <el-button 
        type="danger" 
        size="small" 
        @click="$emit('remove')"
        title="移除"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Picture, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'
import { getImageUrl } from '@/config/api.js'

// 定义props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  sortIndex: {
    type: Number,
    default: 0
  },
  showSortBadge: {
    type: Boolean,
    default: true
  },
  showSortControls: {
    type: Boolean,
    default: true
  },
  canMoveUp: {
    type: Boolean,
    default: true
  },
  canMoveDown: {
    type: Boolean,
    default: true
  }
})

// 定义emits
const emit = defineEmits(['moveUp', 'moveDown', 'remove'])

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0; /* 允许内容收缩 */
  height: 220px; /* 固定高度 */
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

/* 商品图片区域 */
.card-image {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  background-color: #f5f5f5;
  flex-shrink: 0; /* 图片区域不收缩 */
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.product-card:hover .card-image img {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  font-size: 32px;
}

/* 排序标识 */
.sort-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

/* 卡片内容区域 */
.card-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许内容收缩 */
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.product-description {
  display: none;
}

.product-meta {
  display: none;
}

.price {
  display: none;
}

.category {
  display: none;
}

.product-tags {
  display: none;
}

.product-category {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

/* 卡片操作区域 */
.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background-color: #fafafa;
  border-top: 1px solid #e4e7ed;
}


.sort-controls {
  display: flex;
  gap: 4px;
}

.sort-controls .el-button {
  padding: 4px 6px;
  min-height: auto;
  border-radius: 4px;
  font-size: 11px;
}

.card-actions .el-button--danger {
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-image {
    height: 120px;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .product-name {
    font-size: 13px;
  }
  
  .product-description {
    font-size: 11px;
  }
  
  .price {
    font-size: 13px;
  }
  
  .card-actions {
    padding: 6px 10px;
  }
  
  .sort-controls .el-button {
    padding: 3px 5px;
    font-size: 11px;
  }
  
  .card-actions .el-button--danger {
    padding: 3px 5px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .card-image {
    height: 100px;
  }
  
  .sort-badge {
    top: 6px;
    left: 6px;
    padding: 2px 4px;
    font-size: 10px;
  }
}
</style>
