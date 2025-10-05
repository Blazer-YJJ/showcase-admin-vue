/*
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2025-10-03 09:16:40
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2025-10-04 22:14:21
 * @FilePath: \showcase-admin-vue\src\config\api.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 基础URL常量
export const BASE_URL = 'http://localhost:3000'

// API基础配置
export const API_CONFIG = {
  // 基础URL配置
  BASE_URL,
  
  // API版本
  VERSION: '/api',
  
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 请求头配置
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// 导入认证管理
import { authManager } from '../utils/auth.js'

// 获取带认证的请求头
const getAuthHeaders = () => {
  return authManager.getHeaders()
}

// 获取完整的API URL
export const getApiUrl = (path = '') => {
  // 确保path以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_CONFIG.BASE_URL}${API_CONFIG.VERSION}${normalizedPath}`
}

// 获取完整的图片URL
export const getImageUrl = (imagePath = '') => {
  if (!imagePath) return ''
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // 确保path以/开头
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${API_CONFIG.BASE_URL}${normalizedPath}`
}

// 管理员相关 API 函数
export const adminApi = {
  // 获取管理员列表
  async getAdmins(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/admins?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取管理员列表失败: ${error.message}`)
    }
  },

  // 创建管理员
  async createAdmin(adminData) {
    try {
      const url = getApiUrl('/admins')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建管理员失败: ${error.message}`)
    }
  },

  // 更新管理员信息
  async updateAdmin(id, adminData) {
    try {
      const url = getApiUrl(`/admins/${id}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新管理员失败: ${error.message}`)
    }
  },

  // 删除管理员
  async deleteAdmin(id) {
    try {
      const url = getApiUrl(`/admins/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除管理员失败: ${error.message}`)
    }
  }
}

// 会员相关 API 函数
export const userApi = {
  // 获取会员列表
  async getUsers(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/users?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取会员列表失败: ${error.message}`)
    }
  },

  // 创建会员
  async createUser(userData) {
    try {
      const url = getApiUrl('/users')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建会员失败: ${error.message}`)
    }
  },

  // 更新会员信息
  async updateUser(id, userData) {
    try {
      const url = getApiUrl(`/users/${id}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新会员失败: ${error.message}`)
    }
  },

  // 删除会员
  async deleteUser(id) {
    try {
      const url = getApiUrl(`/users/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除会员失败: ${error.message}`)
    }
  }
}

// 分类相关 API 函数
export const categoryApi = {
  // 获取分类列表
  async getCategories() {
    try {
      const url = getApiUrl('/categories/all')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取分类列表失败: ${error.message}`)
    }
  },

  // 获取分类树结构
  async getCategoryTree() {
    try {
      const url = getApiUrl('/categories/tree')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取分类树失败: ${error.message}`)
    }
  },

  // 创建分类
  async createCategory(categoryData) {
    try {
      const url = getApiUrl('/categories')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建分类失败: ${error.message}`)
    }
  },

  // 更新分类信息
  async updateCategory(id, categoryData) {
    try {
      const url = getApiUrl(`/categories/${id}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新分类失败: ${error.message}`)
    }
  },

  // 删除分类
  async deleteCategory(id) {
    try {
      const url = getApiUrl(`/categories/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除分类失败: ${error.message}`)
    }
  }
}

// 商品相关 API 函数
export const productApi = {
  // 获取商品列表
  async getProducts(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/products?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取商品列表失败: ${error.message}`)
    }
  },

  // 创建商品（使用form-data格式）
  async createProduct(productData) {
    try {
      const url = getApiUrl('/products')
      
      // 创建FormData对象
      const formData = new FormData()
      
      // 添加商品基本信息
      if (productData.name) formData.append('name', productData.name)
      if (productData.description) formData.append('description', productData.description)
      if (productData.price) formData.append('price', productData.price)
      if (productData.category_id) formData.append('category_id', productData.category_id)
      if (productData.tags) formData.append('tags', productData.tags)
      if (productData.params) formData.append('params', productData.params)
      
      // 添加商品图片
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          formData.append(`images`, image)
        })
      }
      
      // 获取认证头，但不设置Content-Type（让浏览器自动设置multipart/form-data）
      const authHeaders = getAuthHeaders()
      delete authHeaders['Content-Type'] // 删除Content-Type，让浏览器自动设置
      
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建商品失败: ${error.message}`)
    }
  },

  // 更新商品信息
  async updateProduct(id, productData) {
    try {
      const url = getApiUrl(`/products/${id}`)
      
      // 如果有文件上传，使用FormData
      if (productData.images && productData.images.length > 0) {
        const formData = new FormData()
        
        // 添加商品基本信息
        if (productData.name) formData.append('name', productData.name)
        if (productData.description) formData.append('description', productData.description)
        if (productData.price) formData.append('price', productData.price)
        if (productData.category_id) formData.append('category_id', productData.category_id)
        if (productData.tags) formData.append('tags', productData.tags)
        if (productData.params) formData.append('params', productData.params)
        
        // 添加商品图片
        productData.images.forEach((image, index) => {
          formData.append(`images`, image)
        })
        
        const authHeaders = getAuthHeaders()
        delete authHeaders['Content-Type']
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: authHeaders,
          body: formData,
        })
        return await response.json()
      } else {
        // 没有文件上传，使用JSON格式
        const response = await fetch(url, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(productData),
        })
        return await response.json()
      }
    } catch (error) {
      throw new Error(`更新商品失败: ${error.message}`)
    }
  },

  // 获取商品详情
  async getProductDetail(id) {
    try {
      const url = getApiUrl(`/products/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取商品详情失败: ${error.message}`)
    }
  },

  // 删除商品
  async deleteProduct(id) {
    try {
      const url = getApiUrl(`/products/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除商品失败: ${error.message}`)
    }
  }
}

// 精品推荐相关 API 函数
export const featuredRecommendationsApi = {
  // 获取精品推荐列表
  async getFeaturedRecommendations() {
    try {
      const url = getApiUrl('/explore-selections')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取精品推荐列表失败: ${error.message}`)
    }
  },

  // 添加商品到精品推荐（单个）
  async addToFeaturedRecommendations(productId, sortOrder = 0) {
    try {
      const url = getApiUrl('/explore-selections')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_id: productId,
          sort_order: sortOrder
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`添加精品推荐失败: ${error.message}`)
    }
  },

  // 批量添加商品到精品推荐
  async addMultipleToFeaturedRecommendations(productIds, sortOrderStart = 0) {
    try {
      const url = getApiUrl('/explore-selections')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_ids: productIds,
          sort_order_start: sortOrderStart
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`批量添加精品推荐失败: ${error.message}`)
    }
  },

  // 更新精品推荐排序
  async updateFeaturedRecommendationOrder(selectionId, sortOrder) {
    try {
      const url = getApiUrl(`/explore-selections/${selectionId}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sort_order: sortOrder
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新精品推荐排序失败: ${error.message}`)
    }
  },

  // 从精品推荐中移除商品
  async removeFromFeaturedRecommendations(selectionId) {
    try {
      const url = getApiUrl(`/explore-selections/${selectionId}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`移除精品推荐失败: ${error.message}`)
    }
  }
}

// 主推商品相关 API 函数
export const mainPromotionsApi = {
  // 获取主推商品列表
  async getMainPromotions() {
    try {
      const url = getApiUrl('/main-promotions')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回的不是JSON格式数据')
      }
      
      return await response.json()
    } catch (error) {
      throw new Error(`获取主推商品列表失败: ${error.message}`)
    }
  },

  // 添加商品到主推
  async addToMainPromotions(productId, sortOrder = 0) {
    try {
      const url = getApiUrl('/main-promotions')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_id: productId,
          sort_order: sortOrder
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`添加主推商品失败: ${error.message}`)
    }
  },

  // 更新主推商品排序
  async updateMainPromotionOrder(promotionId, sortOrder) {
    try {
      const url = getApiUrl(`/main-promotions/${promotionId}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sort_order: sortOrder
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新主推商品排序失败: ${error.message}`)
    }
  },

  // 从主推中移除商品
  async removeFromMainPromotions(promotionId) {
    try {
      const url = getApiUrl(`/main-promotions/${promotionId}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`移除主推商品失败: ${error.message}`)
    }
  }
}

// 默认导出配置
export default API_CONFIG