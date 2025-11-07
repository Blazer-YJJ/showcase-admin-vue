<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>订单管理</h1>
        <p>管理所有订单信息和状态</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 搜索和筛选区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="订单状态">
            <el-select
              v-model="searchForm.order_status"
              placeholder="请选择订单状态"
              clearable
              style="width: 180px"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="已支付" value="paid" />
              <el-option label="已发货" value="shipped" />
              <el-option label="已送达" value="delivered" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 订单列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="orderList"
          stripe
          style="width: 100%"
          empty-text="暂无订单数据"
        >
          <el-table-column prop="order_id" label="订单ID" width="100" />
          <el-table-column label="用户信息" width="150">
            <template #default="{ row }">
              <div>
                <div>{{ row.user?.username || '-' }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.user?.name || '-' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="收货地址" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <div v-if="row.address">
                <div>{{ row.address.name }} {{ row.address.phone }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.address.address }}</div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="订单状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.order_status)">
                {{ getStatusText(row.order_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="商品数量" width="100">
            <template #default="{ row }">
              <span>{{ row.total_quantity || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品列表" min-width="200">
            <template #default="{ row }">
              <div v-if="row.items && row.items.length > 0" class="order-items">
                <div
                  v-for="item in row.items.slice(0, 2)"
                  :key="item.order_item_id"
                  class="order-item"
                >
                  <el-image
                    v-if="item.product?.image_url"
                    :src="getImageUrl(item.product.image_url)"
                    fit="cover"
                    class="item-image"
                    :preview-src-list="[getImageUrl(item.product.image_url)]"
                    :preview-teleported="true"
                  />
                  <div class="item-info">
                    <div class="item-name">{{ item.product?.name || '-' }}</div>
                    <div class="item-quantity">x{{ item.quantity }}</div>
                  </div>
                </div>
                <div v-if="row.items.length > 2" class="more-items">
                  还有 {{ row.items.length - 2 }} 件商品
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="order_note" label="订单备注" min-width="150" show-overflow-tooltip />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="340" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="info" size="small" @click="openDetailDialog(row)">
                  查看
                </el-button>
                <el-button type="primary" size="small" @click="openEditDialog(row)">
                  编辑
                </el-button>
                <el-dropdown @command="(cmd) => handleStatusChange(row, cmd)">
                  <el-button type="warning" size="small">
                    状态<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="pending">待处理</el-dropdown-item>
                      <el-dropdown-item command="paid">已支付</el-dropdown-item>
                      <el-dropdown-item command="shipped">已发货</el-dropdown-item>
                      <el-dropdown-item command="delivered">已送达</el-dropdown-item>
                      <el-dropdown-item command="cancelled">已取消</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" class="order-detail">
        <div v-if="orderDetail" class="detail-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>订单ID：</label>
                  <span>{{ orderDetail.order_id }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>订单状态：</label>
                  <el-tag :type="getStatusType(orderDetail.order_status)">
                    {{ getStatusText(orderDetail.order_status) }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>商品总数：</label>
                  <span>{{ orderDetail.total_quantity || 0 }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>创建时间：</label>
                  <span>{{ formatDateTime(orderDetail.created_at) }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <div class="detail-item">
                  <label>订单备注：</label>
                  <span>{{ orderDetail.order_note || '-' }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 用户信息 -->
          <div class="detail-section">
            <h3 class="section-title">用户信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户ID：</label>
                  <span>{{ orderDetail.user?.user_id || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户名：</label>
                  <span>{{ orderDetail.user?.username || '-' }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户昵称：</label>
                  <span>{{ orderDetail.user?.name || '-' }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 收货地址 -->
          <div class="detail-section">
            <h3 class="section-title">收货地址</h3>
            <el-row :gutter="20" v-if="orderDetail.address">
              <el-col :span="12">
                <div class="detail-item">
                  <label>收货人：</label>
                  <span>{{ orderDetail.address.name }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>联系电话：</label>
                  <span>{{ orderDetail.address.phone }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" v-if="orderDetail.address">
              <el-col :span="24">
                <div class="detail-item">
                  <label>详细地址：</label>
                  <span>{{ orderDetail.address.address }}</span>
                </div>
              </el-col>
            </el-row>
            <div v-else class="detail-item">
              <span style="color: #909399">暂无地址信息</span>
            </div>
          </div>

          <!-- 商品列表 -->
          <div class="detail-section">
            <h3 class="section-title">商品列表</h3>
            <el-table
              :data="orderDetail.items || []"
              border
              style="width: 100%"
              empty-text="暂无商品"
            >
              <el-table-column label="商品图片" width="100">
                <template #default="{ row }">
                  <el-image
                    v-if="row.product?.image_url"
                    :src="getImageUrl(row.product.image_url)"
                    fit="cover"
                    class="product-image"
                    :preview-src-list="[getImageUrl(row.product.image_url)]"
                    :preview-teleported="true"
                  />
                  <span v-else style="color: #909399">无图片</span>
                </template>
              </el-table-column>
              <el-table-column prop="product.name" label="商品名称" min-width="150" />
              <el-table-column prop="product.price" label="单价" width="100">
                <template #default="{ row }">
                  ¥{{ parseFloat(row.product?.price || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column label="小计" width="100">
                <template #default="{ row }">
                  ¥{{ (parseFloat(row.product?.price || 0) * row.quantity).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="item_note" label="商品备注" min-width="150" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 订单编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑订单"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-loading="editLoading">
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editFormRules"
          label-width="120px"
        >
          <el-form-item label="收货地址ID" prop="address_id">
            <el-input-number
              v-model="editForm.address_id"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="订单备注" prop="order_note">
            <el-input
              v-model="editForm.order_note"
              type="textarea"
              :rows="3"
              placeholder="请输入订单备注（可选）"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="商品列表" prop="items">
            <div class="order-items-edit">
              <div
                v-for="(item, index) in editForm.items"
                :key="index"
                class="order-item-edit"
              >
                <el-card shadow="never">
                  <div class="item-edit-row">
                    <el-form-item
                      :label="`商品${index + 1}`"
                      :prop="`items.${index}.product_id`"
                      :rules="[
                        { required: true, message: '请选择商品', trigger: 'change' }
                      ]"
                      style="flex: 1; margin-right: 10px"
                    >
                      <el-input-number
                        v-model="item.product_id"
                        :min="1"
                        placeholder="商品ID"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item
                      :label="`数量`"
                      :prop="`items.${index}.quantity`"
                      :rules="[
                        { required: true, message: '请输入数量', trigger: 'blur' },
                        { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
                      ]"
                      style="flex: 1; margin-right: 10px"
                    >
                      <el-input-number
                        v-model="item.quantity"
                        :min="1"
                        placeholder="数量"
                        style="width: 100%"
                      />
                    </el-form-item>
                    <el-form-item
                      :label="`备注`"
                      :prop="`items.${index}.item_note`"
                      style="flex: 2"
                    >
                      <el-input
                        v-model="item.item_note"
                        placeholder="商品备注（可选）"
                      />
                    </el-form-item>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      circle
                      @click="removeEditItem(index)"
                      style="margin-left: 10px"
                    />
                  </div>
                </el-card>
              </div>
              <el-button
                type="primary"
                :icon="Plus"
                @click="addEditItem"
                style="width: 100%; margin-top: 10px"
              >
                添加商品
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitLoading" @click="handleEditSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
import { getOrders, getOrderDetail, updateOrder, updateOrderStatus, deleteOrder } from '@/api/order.js'
import { getImageUrl } from '@/config/api.js'

// 数据
const loading = ref(false)
const orderList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  order_status: '',
  username: ''
})

// 订单详情弹窗
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const orderDetail = ref(null)

// 订单编辑弹窗
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editSubmitLoading = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  address_id: null,
  order_note: '',
  items: [
    {
      product_id: null,
      quantity: 1,
      item_note: ''
    }
  ]
})

const editFormRules = {
  address_id: [
    { required: true, message: '请输入收货地址ID', trigger: 'blur' },
    { type: 'number', min: 1, message: '地址ID必须大于0', trigger: 'blur' }
  ],
  order_note: [
    { max: 1000, message: '订单备注不能超过1000个字符', trigger: 'blur' }
  ]
}

// 当前编辑的订单ID
let currentEditOrderId = null

// 页面加载时获取数据
onMounted(async () => {
  await loadOrderList()
})

// 加载订单列表
const loadOrderList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (searchForm.order_status) {
      params.order_status = searchForm.order_status
    }
    
    if (searchForm.username) {
      params.username = searchForm.username
    }
    
    const response = await getOrders(params)
    
    if (response.success) {
      orderList.value = response.data || []
      total.value = response.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表错误:', error)
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadOrderList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.order_status = ''
  searchForm.username = ''
  currentPage.value = 1
  loadOrderList()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  loadOrderList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadOrderList()
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'info',
    shipped: '',
    delivered: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

// 打开订单详情对话框
const openDetailDialog = async (order) => {
  try {
    detailLoading.value = true
    detailDialogVisible.value = true
    
    const response = await getOrderDetail(order.order_id)
    
    if (response.success) {
      orderDetail.value = response.data
    } else {
      ElMessage.error(response.message || '获取订单详情失败')
      detailDialogVisible.value = false
    }
  } catch (error) {
    console.error('获取订单详情错误:', error)
    ElMessage.error(error.message || '获取订单详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 打开订单编辑对话框
const openEditDialog = async (order) => {
  try {
    editLoading.value = true
    editDialogVisible.value = true
    currentEditOrderId = order.order_id
    
    // 先获取订单详情
    const response = await getOrderDetail(order.order_id)
    
    if (response.success) {
      const data = response.data
      editForm.address_id = data.address_id
      editForm.order_note = data.order_note || ''
      editForm.items = (data.items || []).map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        item_note: item.item_note || ''
      }))
      
      // 如果没有商品，至少添加一个空项
      if (editForm.items.length === 0) {
        editForm.items = [
          {
            product_id: null,
            quantity: 1,
            item_note: ''
          }
        ]
      }
    } else {
      ElMessage.error(response.message || '获取订单详情失败')
      editDialogVisible.value = false
    }
  } catch (error) {
    console.error('获取订单详情错误:', error)
    ElMessage.error(error.message || '获取订单详情失败')
    editDialogVisible.value = false
  } finally {
    editLoading.value = false
  }
}

// 添加编辑项
const addEditItem = () => {
  editForm.items.push({
    product_id: null,
    quantity: 1,
    item_note: ''
  })
}

// 移除编辑项
const removeEditItem = (index) => {
  if (editForm.items.length > 1) {
    editForm.items.splice(index, 1)
  } else {
    ElMessage.warning('至少需要保留一个商品')
  }
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editSubmitLoading.value = true
    
    const data = {
      address_id: editForm.address_id,
      order_note: editForm.order_note || '',
      items: editForm.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        item_note: item.item_note || ''
      }))
    }
    
    const response = await updateOrder(currentEditOrderId, data)
    
    if (response.success) {
      ElMessage.success('订单更新成功')
      editDialogVisible.value = false
      loadOrderList() // 刷新列表
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('更新订单错误:', error)
      ElMessage.error(error.message || '更新失败')
    }
  } finally {
    editSubmitLoading.value = false
  }
}

// 处理状态更改
const handleStatusChange = async (order, newStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态改为"${getStatusText(newStatus)}"吗？`,
      '状态更新确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await updateOrderStatus(order.order_id, newStatus)
    
    if (response.success) {
      ElMessage.success('订单状态更新成功')
      loadOrderList() // 刷新列表
    } else {
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新订单状态错误:', error)
      ElMessage.error(error.message || '状态更新失败')
    }
  }
}

// 删除订单
const handleDelete = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 #${order.order_id} 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await deleteOrder(order.order_id)
    
    if (response.success) {
      ElMessage.success('订单删除成功')
      loadOrderList() // 刷新列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单错误:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 日期格式化
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  background-color: #f5f5f5;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 20px;
}

/* 表格卡片样式 */
.table-card {
  flex: 1;
}

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单商品列表样式 */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-quantity {
  font-size: 12px;
  color: #909399;
}

.more-items {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 订单详情样式 */
.order-detail {
  min-height: 200px;
}

.detail-content {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item label {
  display: inline-block;
  min-width: 100px;
  color: #606266;
  font-weight: 500;
}

.detail-item span {
  color: #303133;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

/* 订单编辑样式 */
.order-items-edit {
  width: 100%;
}

.order-item-edit {
  margin-bottom: 15px;
}

.item-edit-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

/* 操作按钮区域样式 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin: 0;
  flex-shrink: 0;
}

.action-buttons .el-dropdown {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .page-header {
    padding: 15px;
  }

  .header-left h1 {
    font-size: 20px;
  }
}
</style>
