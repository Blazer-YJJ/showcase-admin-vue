import request from '@/utils/request'
import { getApiUrl } from '@/config/api.js'

/**
 * 获取统计数据
 * @returns {Promise} API响应
 */
export function getStatistics() {
  return request.get(getApiUrl('/statistics'))
}

