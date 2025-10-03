import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import AccountManagement from '../views/AccountManagement.vue'
import MemberManagement from '../views/MemberManagement.vue'
import OrderManagement from '../views/OrderManagement.vue'
import AfterSalesManagement from '../views/AfterSalesManagement.vue'
import ProductManagement from '../views/ProductManagement.vue'
import CategoryManagement from '../views/CategoryManagement.vue'
import OtherManagement from '../views/OtherManagement.vue'

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
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
    meta: { title: '欢迎使用管理系统' }
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
    meta: { title: '账户管理' }
  },
  {
    path: '/member-management',
    name: 'MemberManagement',
    component: MemberManagement,
    meta: { title: '会员管理' }
  },
  {
    path: '/order-management',
    name: 'OrderManagement',
    component: OrderManagement,
    meta: { title: '订单管理' }
  },
  {
    path: '/after-sales-management',
    name: 'AfterSalesManagement',
    component: AfterSalesManagement,
    meta: { title: '售后管理' }
  },
  {
    path: '/product-management',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { title: '商品管理' }
  },
  {
    path: '/category-management',
    name: 'CategoryManagement',
    component: CategoryManagement,
    meta: { title: '分类管理' }
  },
  {
    path: '/other-management',
    name: 'OtherManagement',
    component: OtherManagement,
    meta: { title: '其他管理' }
  },
  // 其他管理模块路由
  {
    path: '/explore-featured',
    name: 'ExploreFeatured',
    component: ExploreFeatured,
    meta: { title: '探索精选' }
  },
  {
    path: '/main-styles',
    name: 'MainStyles',
    component: MainStyles,
    meta: { title: '主推款式' }
  },
  {
    path: '/limited-events',
    name: 'LimitedEvents',
    component: LimitedEvents,
    meta: { title: '限时活动' }
  },
  {
    path: '/carousel-info',
    name: 'CarouselInfo',
    component: CarouselInfo,
    meta: { title: '轮播信息' }
  },
  {
    path: '/announcement-info',
    name: 'AnnouncementInfo',
    component: AnnouncementInfo,
    meta: { title: '公告信息' }
  },
  {
    path: '/featured-recommendations',
    name: 'FeaturedRecommendations',
    component: FeaturedRecommendations,
    meta: { title: '精品推荐' }
  },
  {
    path: '/new-arrival-announcement',
    name: 'NewArrivalAnnouncement',
    component: NewArrivalAnnouncement,
    meta: { title: '上新公告' }
  },
  {
    path: '/popular-styles',
    name: 'PopularStyles',
    component: PopularStyles,
    meta: { title: '热门款式' }
  },
  {
    path: '/pdf-export',
    name: 'PdfExport',
    component: PdfExport,
    meta: { title: 'PDF导出' }
  },
  {
    path: '/image-search',
    name: 'ImageSearch',
    component: ImageSearch,
    meta: { title: '以图搜图' }
  },
  {
    path: '/customer-service-settings',
    name: 'CustomerServiceSettings',
    component: CustomerServiceSettings,
    meta: { title: '客服设置' }
  },
  {
    path: '/about-us',
    name: 'AboutUs',
    component: AboutUs,
    meta: { title: '关于我们' }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: Feedback,
    meta: { title: '意见反馈' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
