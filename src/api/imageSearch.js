import request from '@/utils/request'
import { getApiUrl } from '@/config/api.js'

/**
 * 以图搜图入库
 * @param {Array<number>} productIds 需要入库的商品id数组
 * @returns {Promise} API响应
 */
export function batchAddImageSearch(productIds) {
  return request.post(getApiUrl('/image-search/batch-add'), {
    product_ids: productIds
  })
}

/**
 * 图片搜索
 * @param {File} imageFile 图片文件
 * @returns {Promise} API响应
 */
export function searchByImage(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  return request.post(getApiUrl('/image-search/search'), formData)
}

/**
 * 批量删除以图搜图商品
 * @param {Array<number>} productIds 需要删除的商品id数组
 * @returns {Promise} API响应
 */
export function batchDeleteImageSearch(productIds) {
  return request.post(getApiUrl('/image-search/batch-delete'), {
    product_ids: productIds
  })
}

/**
 * 获取已入库商品列表
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise} API响应
 */
export function getIndexedProducts(page = 1, limit = 10) {
  return request.get(getApiUrl('/image-search/indexed'), {
    page,
    limit
  })
}

/**
 * 获取未入库商品列表
 * @param {number} page 页码
 * @param {number} limit 每页数量
 * @returns {Promise} API响应
 */
export function getNotIndexedProducts(page = 1, limit = 10) {
  return request.get(getApiUrl('/image-search/not-indexed'), {
    page,
    limit
  })
}

