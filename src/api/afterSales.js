import request from '@/utils/request'
import { getApiUrl } from '@/config/api.js'

/**
 * 获取售后列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.status - 售后状态
 * @param {number} params.order_id - 订单ID
 * @returns {Promise} API响应
 */
export function getAfterSalesList(params = {}) {
  return request.get(getApiUrl('/order-after-sales/admin/list'), params)
}

/**
 * 获取售后详情
 * @param {number} id - 售后ID
 * @returns {Promise} API响应
 */
export function getAfterSaleDetail(id) {
  return request.get(getApiUrl(`/order-after-sales/admin/${id}`))
}

/**
 * 更新售后信息
 * @param {number} id - 售后ID
 * @param {Object} data - 售后数据
 * @param {string} data.reason - 售后原因（可选，1-200字符）
 * @param {string} data.content - 售后具体内容（可选）
 * @param {Array<number>} data.product_ids - 商品ID数组（可选，至少一个商品）
 * @param {string|Date} data.end_time - 结束时间（可选）
 * @returns {Promise} API响应
 */
export function updateAfterSale(id, data) {
  return request.put(getApiUrl(`/order-after-sales/admin/${id}`), data)
}

/**
 * 更新售后状态
 * @param {number} id - 售后ID
 * @param {string} status - 售后状态（pending|processing|approved|rejected|completed）
 * @returns {Promise} API响应
 */
export function updateAfterSaleStatus(id, status) {
  return request.put(getApiUrl(`/order-after-sales/admin/${id}/status`), { status })
}

/**
 * 删除售后
 * @param {number} id - 售后ID
 * @returns {Promise} API响应
 */
export function deleteAfterSale(id) {
  return request.delete(getApiUrl(`/order-after-sales/admin/${id}`))
}

