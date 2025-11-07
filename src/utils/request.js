/*
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2025-01-27 10:00:00
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2025-01-27 10:00:00
 * @FilePath: \showcase-admin-vue\src\utils\request.js
 * @Description: HTTP请求工具类
 */

import { API_CONFIG, getApiUrl } from '@/config/api.js'
import { authManager } from './auth.js'

/**
 * HTTP请求工具类
 */
class Request {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL + API_CONFIG.VERSION
    this.timeout = API_CONFIG.TIMEOUT
  }

  /**
   * 获取请求头
   * @param {Object} customHeaders 自定义请求头
   * @returns {Object} 请求头对象
   */
  getHeaders(customHeaders = {}) {
    const authHeaders = authManager.getHeaders()
    return {
      ...authHeaders,
      ...customHeaders
    }
  }

  /**
   * 处理响应
   * @param {Response} response fetch响应对象
   * @returns {Promise} 处理后的数据
   */
  async handleResponse(response) {
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP错误: ${response.status} - ${errorText}`)
    }

    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器返回的不是JSON格式数据')
    }

    return await response.json()
  }

  /**
   * 发送GET请求
   * @param {string} url 请求URL
   * @param {Object} params 查询参数
   * @param {Object} options 请求选项
   * @returns {Promise} 响应数据
   */
  async get(url, params = {}, options = {}) {
    try {
      // 构建查询字符串
      const queryString = new URLSearchParams(params).toString()
      const fullUrl = queryString ? `${url}?${queryString}` : url
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getHeaders(options.headers),
        ...options
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new Error(`GET请求失败: ${error.message}`)
    }
  }

  /**
   * 发送POST请求
   * @param {string} url 请求URL
   * @param {Object|FormData} data 请求数据
   * @param {Object} options 请求选项
   * @returns {Promise} 响应数据
   */
  async post(url, data = {}, options = {}) {
    try {
      let body
      let headers = this.getHeaders(options.headers)

      // 如果是FormData，不设置Content-Type
      if (data instanceof FormData) {
        body = data
        delete headers['Content-Type'] // 让浏览器自动设置multipart/form-data
      } else {
        body = JSON.stringify(data)
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        ...options
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new Error(`POST请求失败: ${error.message}`)
    }
  }

  /**
   * 发送PUT请求
   * @param {string} url 请求URL
   * @param {Object|FormData} data 请求数据
   * @param {Object} options 请求选项
   * @returns {Promise} 响应数据
   */
  async put(url, data = {}, options = {}) {
    try {
      let body
      let headers = this.getHeaders(options.headers)

      // 如果是FormData，不设置Content-Type
      if (data instanceof FormData) {
        body = data
        delete headers['Content-Type'] // 让浏览器自动设置multipart/form-data
      } else {
        body = JSON.stringify(data)
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body,
        ...options
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new Error(`PUT请求失败: ${error.message}`)
    }
  }

  /**
   * 发送DELETE请求
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Promise} 响应数据
   */
  async delete(url, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(options.headers),
        ...options
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new Error(`DELETE请求失败: ${error.message}`)
    }
  }

  /**
   * 发送PATCH请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @param {Object} options 请求选项
   * @returns {Promise} 响应数据
   */
  async patch(url, data = {}, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(options.headers),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        ...options
      })

      return await this.handleResponse(response)
    } catch (error) {
      throw new Error(`PATCH请求失败: ${error.message}`)
    }
  }
}

// 创建请求实例
const request = new Request()

// 导出请求实例
export default request
