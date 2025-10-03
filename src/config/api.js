/*
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2025-10-03 09:16:40
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2025-10-03 11:03:49
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

// 默认导出配置
export default API_CONFIG