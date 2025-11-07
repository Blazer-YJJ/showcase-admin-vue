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
  },

  // 批量创建商品（使用form-data格式）
  async batchCreateProducts(batchData) {
    try {
      const url = getApiUrl('/products/batch/create')
      
      // 创建FormData对象
      const formData = new FormData()
      
      // 添加分类ID（必填）
      if (batchData.category_id) {
        formData.append('category_id', batchData.category_id)
      }
      
      // 添加标签（非必填）
      if (batchData.tags) {
        formData.append('tags', batchData.tags)
      }
      
      // 添加商品图片（每个文件对应一个images参数名）
      if (batchData.images && batchData.images.length > 0) {
        batchData.images.forEach((image) => {
          formData.append('images', image)
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
      throw new Error(`批量创建商品失败: ${error.message}`)
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

// 探索精选相关 API 函数
export const exploreSelectionsApi = {
  // 获取探索精选商品列表（不需要认证）
  async getExploreSelections() {
    try {
      const url = getApiUrl('/explore-selections')
      const response = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
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
      throw new Error(`获取探索精选列表失败: ${error.message}`)
    }
  },

  // 批量添加商品到探索精选（需要认证）
  async addToExploreSelections(productIds, sortOrderStart = 0) {
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
      throw new Error(`添加探索精选商品失败: ${error.message}`)
    }
  },

  // 更新探索精选商品排序（需要认证）
  async updateExploreSelectionOrder(selectionId, sortOrder) {
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
      throw new Error(`更新探索精选商品排序失败: ${error.message}`)
    }
  },

  // 从探索精选中移除商品（需要认证）
  async removeFromExploreSelections(selectionId) {
    try {
      const url = getApiUrl(`/explore-selections/${selectionId}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`移除探索精选商品失败: ${error.message}`)
    }
  }
}

// 公告相关 API 函数
export const announcementApi = {
  // 创建公告
  async createAnnouncement(announcementData) {
    try {
      const url = getApiUrl('/announcements')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(announcementData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建公告失败: ${error.message}`)
    }
  },

  // 获取公告列表
  async getAnnouncements(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/announcements/admin/list?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取公告列表失败: ${error.message}`)
    }
  },

  // 更新公告信息
  async updateAnnouncement(id, announcementData) {
    try {
      const url = getApiUrl(`/announcements/${id}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(announcementData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新公告失败: ${error.message}`)
    }
  },

  // 切换公告状态
  async toggleAnnouncementStatus(id, isActive) {
    try {
      const url = getApiUrl(`/announcements/${id}/status`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`切换公告状态失败: ${error.message}`)
    }
  },

  // 删除公告
  async deleteAnnouncement(id) {
    try {
      const url = getApiUrl(`/announcements/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除公告失败: ${error.message}`)
    }
  }
}

// 意见反馈相关 API 函数
export const feedbackApi = {
  // 获取意见反馈列表
  async getFeedbacks(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/feedback?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取意见反馈列表失败: ${error.message}`)
    }
  },

  // 获取意见反馈详情
  async getFeedbackDetail(id) {
    try {
      const url = getApiUrl(`/feedback/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取意见反馈详情失败: ${error.message}`)
    }
  },

  // 删除意见反馈
  async deleteFeedback(id) {
    try {
      const url = getApiUrl(`/feedback/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除意见反馈失败: ${error.message}`)
    }
  }
}

// 关于我们相关 API 函数
export const aboutUsApi = {
  // 获取关于我们信息
  async getAboutUs() {
    try {
      const url = getApiUrl('/about-us')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取关于我们信息失败: ${error.message}`)
    }
  },

  // 创建关于我们信息
  async createAboutUs(data) {
    try {
      const url = getApiUrl('/about-us')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建关于我们信息失败: ${error.message}`)
    }
  },

  // 更新关于我们信息
  async updateAboutUs(id, data) {
    try {
      const url = getApiUrl(`/about-us/${id}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新关于我们信息失败: ${error.message}`)
    }
  },

  // 删除关于我们信息
  async deleteAboutUs(id) {
    try {
      const url = getApiUrl(`/about-us/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除关于我们信息失败: ${error.message}`)
    }
  }
}

// 客服相关 API 函数
export const customerServiceApi = {
  // 获取客服列表
  async getCustomerServices(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/customer-service?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取客服列表失败: ${error.message}`)
    }
  },

  // 获取客服详情
  async getCustomerServiceById(id) {
    try {
      const url = getApiUrl(`/customer-service/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取客服详情失败: ${error.message}`)
    }
  },

  // 创建客服（使用form-data格式）
  async createCustomerService(formData) {
    try {
      const url = getApiUrl('/customer-service')
      
      // 获取认证头，但不设置Content-Type（让浏览器自动设置multipart/form-data）
      const authHeaders = getAuthHeaders()
      delete authHeaders['Content-Type'] // 删除Content-Type，让浏览器自动设置
      
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      })
      
      const result = await response.json()
      
      // 如果响应不成功，抛出包含详细错误信息的错误
      if (!result.success) {
        throw new Error(result.message || result.error || '创建客服失败')
      }
      
      return result
    } catch (error) {
      console.error('创建客服API错误:', error)
      throw new Error(`创建客服失败: ${error.message}`)
    }
  },

  // 删除客服
  async deleteCustomerService(id) {
    try {
      const url = getApiUrl(`/customer-service/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除客服失败: ${error.message}`)
    }
  }
}

// 轮播图相关 API 函数
export const bannerApi = {
  // 获取轮播图列表
  async getBanners(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/banners?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取轮播图列表失败: ${error.message}`)
    }
  },

  // 获取轮播图详情
  async getBannerDetail(id) {
    try {
      const url = getApiUrl(`/banners/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取轮播图详情失败: ${error.message}`)
    }
  },

  // 创建轮播图（使用form-data格式）
  async createBanner(bannerData) {
    try {
      const url = getApiUrl('/banners')
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('title', bannerData.title)
      formData.append('description', bannerData.description || '')
      formData.append('image_url', bannerData.image_url)
      formData.append('sort_order', bannerData.sort_order)
      formData.append('is_active', bannerData.is_active)
      
      // 获取认证头，但不设置Content-Type（让浏览器自动设置multipart/form-data）
      const authHeaders = getAuthHeaders()
      delete authHeaders['Content-Type'] // 删除Content-Type，让浏览器自动设置
      
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      })
      
      const result = await response.json()
      
      // 如果响应不成功，抛出包含详细错误信息的错误
      if (!result.success) {
        throw new Error(result.message || result.error || '创建轮播图失败')
      }
      
      return result
    } catch (error) {
      console.error('创建轮播图API错误:', error)
      throw new Error(`创建轮播图失败: ${error.message}`)
    }
  },

  // 更新轮播图（使用form-data格式）
  async updateBanner(id, bannerData) {
    try {
      const url = getApiUrl(`/banners/${id}`)
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('title', bannerData.title)
      formData.append('description', bannerData.description || '')
      if (bannerData.image_url) {
        formData.append('image_url', bannerData.image_url)
      }
      formData.append('sort_order', bannerData.sort_order)
      formData.append('is_active', bannerData.is_active)
      
      // 获取认证头，但不设置Content-Type（让浏览器自动设置multipart/form-data）
      const authHeaders = getAuthHeaders()
      delete authHeaders['Content-Type'] // 删除Content-Type，让浏览器自动设置
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: authHeaders,
        body: formData
      })
      
      const result = await response.json()
      
      // 如果响应不成功，抛出包含详细错误信息的错误
      if (!result.success) {
        throw new Error(result.message || result.error || '更新轮播图失败')
      }
      
      return result
    } catch (error) {
      console.error('更新轮播图API错误:', error)
      throw new Error(`更新轮播图失败: ${error.message}`)
    }
  },

  // 删除轮播图
  async deleteBanner(id) {
    try {
      const url = getApiUrl(`/banners/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除轮播图失败: ${error.message}`)
    }
  },

  // 批量删除轮播图
  async batchDeleteBanners(ids) {
    try {
      const url = getApiUrl('/banners/batch')
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`批量删除轮播图失败: ${error.message}`)
    }
  },

  // 更新轮播图状态
  async updateBannerStatus(id, isActive) {
    try {
      const url = getApiUrl(`/banners/${id}/status`)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新轮播图状态失败: ${error.message}`)
    }
  },

  // 更新轮播图排序
  async updateBannerSort(sortData) {
    try {
      const url = getApiUrl('/banners/sort')
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ sort_data: sortData }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新轮播图排序失败: ${error.message}`)
    }
  }
}

// 限时活动相关 API 函数
export const limitedTimeActivitiesApi = {
  // 获取限时活动列表（需要认证）
  async getLimitedTimeActivities(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/limited-time-activities?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取限时活动列表失败: ${error.message}`)
    }
  },

  // 获取限时活动详情（需要认证）
  async getLimitedTimeActivityDetail(activityId) {
    try {
      const url = getApiUrl(`/limited-time-activities/${activityId}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取限时活动详情失败: ${error.message}`)
    }
  },

  // 创建限时活动（需要认证）
  async createLimitedTimeActivity(activityData) {
    try {
      const url = getApiUrl('/limited-time-activities')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建限时活动失败: ${error.message}`)
    }
  },

  // 更新限时活动（需要认证）
  async updateLimitedTimeActivity(activityId, activityData) {
    try {
      const url = getApiUrl(`/limited-time-activities/${activityId}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新限时活动失败: ${error.message}`)
    }
  },

  // 批量删除限时活动（需要认证）
  async batchDeleteLimitedTimeActivities(activityIds) {
    try {
      const url = getApiUrl('/limited-time-activities/batch/delete')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          activityIds: activityIds
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`批量删除限时活动失败: ${error.message}`)
    }
  }
}

// 上新公告相关 API 函数
export const newArrivalAnnouncementsApi = {
  // 获取上新公告列表（需要认证）
  async getNewArrivalAnnouncements(page = 1, limit = 10) {
    try {
      const url = getApiUrl(`/new-arrival-announcements?page=${page}&limit=${limit}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取上新公告列表失败: ${error.message}`)
    }
  },

  // 获取上新公告详情（需要认证）
  async getNewArrivalAnnouncementDetail(announcementId) {
    try {
      const url = getApiUrl(`/new-arrival-announcements/${announcementId}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取上新公告详情失败: ${error.message}`)
    }
  },

  // 创建上新公告（需要认证）
  async createNewArrivalAnnouncement(announcementData) {
    try {
      const url = getApiUrl('/new-arrival-announcements')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(announcementData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建上新公告失败: ${error.message}`)
    }
  },

  // 更新上新公告（需要认证）
  async updateNewArrivalAnnouncement(announcementId, announcementData) {
    try {
      const url = getApiUrl(`/new-arrival-announcements/${announcementId}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(announcementData),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新上新公告失败: ${error.message}`)
    }
  },

  // 更新上新公告状态（需要认证）
  async updateNewArrivalAnnouncementStatus(announcementId, isActive) {
    try {
      const url = getApiUrl(`/new-arrival-announcements/${announcementId}/status`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_active: isActive
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新上新公告状态失败: ${error.message}`)
    }
  },

  // 批量删除上新公告（需要认证）
  async batchDeleteNewArrivalAnnouncements(announcementIds) {
    try {
      const url = getApiUrl('/new-arrival-announcements/batch/delete')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          announcementIds: announcementIds
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`批量删除上新公告失败: ${error.message}`)
    }
  }
}

// 热门商品相关 API 函数
export const hotProductsApi = {
  // 获取热门商品列表
  async getHotProducts() {
    try {
      const url = getApiUrl('/hot-products')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取热门商品列表失败: ${error.message}`)
    }
  },

  // 获取热门商品详情
  async getHotProductDetail(id) {
    try {
      const url = getApiUrl(`/hot-products/${id}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取热门商品详情失败: ${error.message}`)
    }
  },

  // 创建热门商品（批量添加）
  async createHotProducts(productIds, sortOrderStart = 0) {
    try {
      const url = getApiUrl('/hot-products')
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
      throw new Error(`创建热门商品失败: ${error.message}`)
    }
  },

  // 更新热门商品排序
  async updateHotProductSort(id, sortOrder) {
    try {
      const url = getApiUrl(`/hot-products/${id}`)
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sort_order: sortOrder
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新热门商品排序失败: ${error.message}`)
    }
  },

  // 批量删除热门商品
  async batchDeleteHotProducts(hotIds) {
    try {
      const url = getApiUrl('/hot-products/batch/delete')
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          hot_ids: hotIds
        }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`批量删除热门商品失败: ${error.message}`)
    }
  }
}

// PDF导出相关 API 函数
export const pdfExportApi = {
  // 导出全部商品
  async exportAllProducts() {
    try {
      const url = getApiUrl('/products/export/pdf/all')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`导出全部商品失败: ${error.message}`)
    }
  },

  // 指定分类导出
  async exportByCategory(categoryId) {
    try {
      const url = getApiUrl(`/products/export/pdf/category/${categoryId}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`导出分类商品失败: ${error.message}`)
    }
  },

  // 搜索导出
  async exportBySearch(query) {
    try {
      const url = getApiUrl(`/products/export/pdf/search?q=${encodeURIComponent(query)}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`搜索导出失败: ${error.message}`)
    }
  }
}

// PDF配置相关 API 函数
export const pdfConfigApi = {
  // 获取PDF配置
  async getPdfConfig() {
    try {
      const url = getApiUrl('/pdf-config')
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取PDF配置失败: ${error.message}`)
    }
  },

  // 创建PDF配置
  async createPdfConfig(configData) {
    try {
      const url = getApiUrl('/pdf-config')
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('pdf_file_company_name', configData.pdf_file_company_name)
      formData.append('pdf_title_company_name', configData.pdf_title_company_name)
      formData.append('products_per_row', configData.products_per_row)
      
      // 如果有背景图片，添加到FormData
      if (configData.pdf_background_image) {
        formData.append('pdf_background_image', configData.pdf_background_image)
      }
      
      // 获取认证头，但不设置Content-Type（让浏览器自动设置multipart/form-data）
      const authHeaders = getAuthHeaders()
      delete authHeaders['Content-Type']
      
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      })
      return await response.json()
    } catch (error) {
      throw new Error(`创建PDF配置失败: ${error.message}`)
    }
  },

  // 更新PDF配置
  async updatePdfConfig(id, configData) {
    try {
      const url = getApiUrl(`/pdf-config/${id}`)
      
      // 创建FormData对象
      const formData = new FormData()
      formData.append('pdf_file_company_name', configData.pdf_file_company_name)
      formData.append('pdf_title_company_name', configData.pdf_title_company_name)
      formData.append('products_per_row', configData.products_per_row)
      
      // 如果有背景图片，添加到FormData
      if (configData.pdf_background_image) {
        formData.append('pdf_background_image', configData.pdf_background_image)
      }
      
      // 获取认证头，但不设置Content-Type（让浏览器自动设置multipart/form-data）
      const authHeaders = getAuthHeaders()
      delete authHeaders['Content-Type']
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: authHeaders,
        body: formData,
      })
      return await response.json()
    } catch (error) {
      throw new Error(`更新PDF配置失败: ${error.message}`)
    }
  },

  // 删除PDF配置
  async deletePdfConfig(id) {
    try {
      const url = getApiUrl(`/pdf-config/${id}`)
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除PDF配置失败: ${error.message}`)
    }
  }
}

// PDF文件管理相关 API 函数
export const pdfFilesApi = {
  // 获取PDF文件列表
  async getPdfFiles(page = 1, pageSize = 10) {
    try {
      const url = getApiUrl(`/pdf-files?page=${page}&page_size=${pageSize}`)
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`获取PDF文件列表失败: ${error.message}`)
    }
  },

  // 删除PDF文件
  async deletePdfFiles(filenames) {
    try {
      const url = getApiUrl('/pdf-files/batch/delete')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filenames }),
      })
      return await response.json()
    } catch (error) {
      throw new Error(`删除PDF文件失败: ${error.message}`)
    }
  }
}

// 默认导出配置
export default API_CONFIG