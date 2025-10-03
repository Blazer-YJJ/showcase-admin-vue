// 认证状态管理
class AuthManager {
  constructor() {
    this.tokenKey = 'adminToken'
    this.userKey = 'adminUser'
    this.isAuthenticated = ref(false)
    this.user = ref(null)
    this.checkAuthStatus()
  }

  // 检查认证状态
  checkAuthStatus() {
    const token = this.getToken()
    const user = this.getUser()
    
    if (token && user) {
      this.isAuthenticated.value = true
      this.user.value = user
    } else {
      this.isAuthenticated.value = false
      this.user.value = null
    }
  }

  // 获取token
  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  // 设置token
  setToken(token) {
    localStorage.setItem(this.tokenKey, token)
    this.checkAuthStatus()
  }

  // 获取用户信息
  getUser() {
    try {
      const userStr = localStorage.getItem(this.userKey)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }

  // 设置用户信息
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
    this.checkAuthStatus()
  }

  // 登录
  login(token, user) {
    this.setToken(token)
    this.setUser(user)
    this.isAuthenticated.value = true
    this.user.value = user
  }

  // 登出
  logout() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    this.isAuthenticated.value = false
    this.user.value = null
  }

  // 检查是否已认证
  isAuth() {
    return this.isAuthenticated.value
  }

  // 获取请求头（用于API调用）
  getHeaders() {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }
}

// 创建全局认证实例
import { ref } from 'vue'
export const authManager = new AuthManager()

// 导出组合式函数
export function useAuth() {
  return {
    isAuthenticated: authManager.isAuthenticated,
    user: authManager.user,
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
    isAuth: authManager.isAuth.bind(authManager),
    getHeaders: authManager.getHeaders.bind(authManager)
  }
}

export default authManager
