import request from '@/utils/request'
import { getApiUrl } from '@/config/api.js'

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.order_status - 订单状态
 * @param {string} params.username - 用户名
 * @returns {Promise} API响应
 */
export function getOrders(params = {}) {
  return request.get(getApiUrl('/orders/admin/list'), params)
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise} API响应
 */
export function getOrderDetail(id) {
  return request.get(getApiUrl(`/orders/admin/${id}`))
}

/**
 * 更新订单
 * @param {number} id - 订单ID
 * @param {Object} data - 订单数据
 * @param {number} data.address_id - 用户地址ID（必填）
 * @param {Array} data.items - 订单商品列表
 * @param {string} data.order_note - 订单备注（可选）
 * @returns {Promise} API响应
 */
export function updateOrder(id, data) {
  return request.put(getApiUrl(`/orders/admin/${id}`), data)
}

/**
 * 更新订单状态
 * @param {number} id - 订单ID
 * @param {string} order_status - 订单状态
 * @returns {Promise} API响应
 */
export function updateOrderStatus(id, order_status) {
  return request.put(getApiUrl(`/orders/admin/${id}/status`), { order_status })
}

/**
 * 删除订单
 * @param {number} id - 订单ID
 * @returns {Promise} API响应
 */
export function deleteOrder(id) {
  return request.delete(getApiUrl(`/orders/admin/${id}`))
}

