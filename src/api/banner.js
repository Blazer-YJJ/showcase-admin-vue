import request from '@/utils/request'
import { getApiUrl } from '@/config/api.js'

/**
 * 获取轮播图列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.title - 轮播图标题
 * @param {number} params.is_active - 状态
 * @returns {Promise} API响应
 */
export function getBanners(params = {}) {
  return request.get(getApiUrl('/banners'), params)
}

/**
 * 获取轮播图详情
 * @param {number} id - 轮播图ID
 * @returns {Promise} API响应
 */
export function getBannerDetail(id) {
  return request.get(getApiUrl(`/banners/${id}`))
}

/**
 * 创建轮播图
 * @param {Object} data - 轮播图数据
 * @param {string} data.title - 标题
 * @param {string} data.description - 描述
 * @param {File} data.image_url - 图片文件
 * @param {number} data.sort_order - 排序
 * @param {number} data.is_active - 状态
 * @returns {Promise} API响应
 */
export function createBanner(data) {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('description', data.description || '')
  formData.append('image_url', data.image_url)
  formData.append('sort_order', data.sort_order)
  formData.append('is_active', data.is_active)
  
  return request.post(getApiUrl('/banners'), formData)
}

/**
 * 更新轮播图
 * @param {number} id - 轮播图ID
 * @param {Object} data - 轮播图数据
 * @param {string} data.title - 标题
 * @param {string} data.description - 描述
 * @param {File} data.image_url - 图片文件（可选）
 * @param {number} data.sort_order - 排序
 * @param {number} data.is_active - 状态
 * @returns {Promise} API响应
 */
export function updateBanner(id, data) {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('description', data.description || '')
  if (data.image_url) {
    formData.append('image_url', data.image_url)
  }
  formData.append('sort_order', data.sort_order)
  formData.append('is_active', data.is_active)
  
  return request.put(getApiUrl(`/banners/${id}`), formData)
}

/**
 * 删除轮播图
 * @param {number} id - 轮播图ID
 * @returns {Promise} API响应
 */
export function deleteBanner(id) {
  return request.delete(getApiUrl(`/banners/${id}`))
}

/**
 * 批量删除轮播图
 * @param {Array} ids - 轮播图ID数组
 * @returns {Promise} API响应
 */
export function batchDeleteBanners(ids) {
  return request.delete(getApiUrl('/banners/batch'), { ids })
}

/**
 * 更新轮播图状态
 * @param {number} id - 轮播图ID
 * @param {number} is_active - 状态
 * @returns {Promise} API响应
 */
export function updateBannerStatus(id, is_active) {
  return request.patch(getApiUrl(`/banners/${id}/status`), { is_active })
}

/**
 * 更新轮播图排序
 * @param {Array} sortData - 排序数据
 * @param {number} sortData[].id - 轮播图ID
 * @param {number} sortData[].sort_order - 排序值
 * @returns {Promise} API响应
 */
export function updateBannerSort(sortData) {
  return request.patch(getApiUrl('/banners/sort'), { sort_data: sortData })
}
