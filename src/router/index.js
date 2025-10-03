import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Welcome from '../views/Welcome.vue'
import AccountManagement from '../views/AccountManagement.vue'
import MemberManagement from '../views/MemberManagement.vue'
import OrderManagement from '../views/OrderManagement.vue'
import AfterSalesManagement from '../views/AfterSalesManagement.vue'
import ProductManagement from '../views/ProductManagement.vue'
import CategoryManagement from '../views/CategoryManagement.vue'
import OtherManagement from '../views/OtherManagement.vue'

// 导入认证管理
import { authManager } from '../utils/auth.js'

// 其他管理模块组件导入
import ExploreFeatured from '../views/other-management/ExploreFeatured.vue'
import MainStyles from '../views/other-management/MainStyles.vue'
import LimitedEvents from '../views/other-management/LimitedEvents.vue'
import CarouselInfo from '../views/other-management/CarouselInfo.vue'
import AnnouncementInfo from '../views/other-management/AnnouncementInfo.vue'
import FeaturedRecommendations from '../views/other-management/FeaturedRecommendations.vue'
import NewArrivalAnnouncement from '../views/other-management/NewArrivalAnnouncement.vue'
import PopularStyles from '../views/other-management/PopularStyles.vue'
import PdfExport from '../views/other-management/PdfExport.vue'
import ImageSearch from '../views/other-management/ImageSearch.vue'
import CustomerServiceSettings from '../views/other-management/CustomerServiceSettings.vue'
import AboutUs from '../views/other-management/AboutUs.vue'
import Feedback from '../views/other-management/Feedback.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '管理员登录', requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '控制台', requiresAuth: true }
  },
  {
    path: '/',
    redirect: () => {
      // 如果已登录，重定向到控制台，否则重定向到登录页
      return authManager.isAuth() ? '/dashboard' : '/login'
    }
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
    meta: { title: '欢迎使用管理系统', requiresAuth: true }
  },
  // 废弃的搜索管理页面重定向到欢迎页面
  {
    path: '/search-management',
    redirect: '/welcome'
  },
  {
    path: '/account-management',
    name: 'AccountManagement',
    component: AccountManagement,
    meta: { title: '账户管理', requiresAuth: true }
  },
  {
    path: '/member-management',
    name: 'MemberManagement',
    component: MemberManagement,
    meta: { title: '会员管理', requiresAuth: true }
  },
  {
    path: '/order-management',
    name: 'OrderManagement',
    component: OrderManagement,
    meta: { title: '订单管理', requiresAuth: true }
  },
  {
    path: '/after-sales-management',
    name: 'AfterSalesManagement',
    component: AfterSalesManagement,
    meta: { title: '售后管理', requiresAuth: true }
  },
  {
    path: '/product-management',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { title: '商品管理', requiresAuth: true }
  },
  {
    path: '/category-management',
    name: 'CategoryManagement',
    component: CategoryManagement,
    meta: { title: '分类管理', requiresAuth: true }
  },
  {
    path: '/other-management',
    name: 'OtherManagement',
    component: OtherManagement,
    meta: { title: '其他管理', requiresAuth: true }
  },
  // 其他管理模块路由
  {
    path: '/explore-featured',
    name: 'ExploreFeatured',
    component: ExploreFeatured,
    meta: { title: '探索精选', requiresAuth: true }
  },
  {
    path: '/main-styles',
    name: 'MainStyles',
    component: MainStyles,
    meta: { title: '主推款式', requiresAuth: true }
  },
  {
    path: '/limited-events',
    name: 'LimitedEvents',
    component: LimitedEvents,
    meta: { title: '限时活动', requiresAuth: true }
  },
  {
    path: '/carousel-info',
    name: 'CarouselInfo',
    component: CarouselInfo,
    meta: { title: '轮播信息', requiresAuth: true }
  },
  {
    path: '/announcement-info',
    name: 'AnnouncementInfo',
    component: AnnouncementInfo,
    meta: { title: '公告信息', requiresAuth: true }
  },
  {
    path: '/featured-recommendations',
    name: 'FeaturedRecommendations',
    component: FeaturedRecommendations,
    meta: { title: '精品推荐', requiresAuth: true }
  },
  {
    path: '/new-arrival-announcement',
    name: 'NewArrivalAnnouncement',
    component: NewArrivalAnnouncement,
    meta: { title: '上新公告', requiresAuth: true }
  },
  {
    path: '/popular-styles',
    name: 'PopularStyles',
    component: PopularStyles,
    meta: { title: '热门款式', requiresAuth: true }
  },
  {
    path: '/pdf-export',
    name: 'PdfExport',
    component: PdfExport,
    meta: { title: 'PDF导出', requiresAuth: true }
  },
  {
    path: '/image-search',
    name: 'ImageSearch',
    component: ImageSearch,
    meta: { title: '以图搜图', requiresAuth: true }
  },
  {
    path: '/customer-service-settings',
    name: 'CustomerServiceSettings',
    component: CustomerServiceSettings,
    meta: { title: '客服设置', requiresAuth: true }
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: AboutUs,
    meta: { title: '关于我们', requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: Feedback,
    meta: { title: '意见反馈', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 验证登录状态
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 管理后台`
  }

  // 检查是否需要认证（只有明确设置 requiresAuth: true 的路由才需要认证）
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth === true)
  
  if (requiresAuth) {
    // 需要认证的页面
    if (authManager.isAuth()) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else if (to.path === '/login' && authManager.isAuth()) {
    // 已登录用户访问登录页，重定向到控制台
    next('/dashboard')
  } else {
    // 不需要认证的页面，直接访问
    next()
  }
})

export default router
