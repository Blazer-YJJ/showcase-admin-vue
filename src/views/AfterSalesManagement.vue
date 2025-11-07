<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>售后管理</h1>
        <p>管理所有售后申请和状态</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 搜索和筛选区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="售后状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择售后状态"
              clearable
              style="width: 180px"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="处理中" value="processing" />
              <el-option label="已批准" value="approved" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单ID">
            <el-input-number
              v-model="searchForm.order_id"
              placeholder="请输入订单ID"
              clearable
              :min="1"
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

      <!-- 售后列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="afterSalesList"
          stripe
          style="width: 100%"
          empty-text="暂无售后数据"
        >
          <el-table-column prop="after_sale_id" label="售后ID" width="100" />
          <el-table-column prop="order_id" label="订单ID" width="100" />
          <el-table-column label="订单状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getOrderStatusType(row.order?.order_status)">
                {{ getOrderStatusText(row.order?.order_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="售后原因" min-width="150" show-overflow-tooltip />
          <el-table-column prop="content" label="具体内容" min-width="200" show-overflow-tooltip />
          <el-table-column label="售后状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="商品列表" min-width="200">
            <template #default="{ row }">
              <div v-if="row.products && row.products.length > 0" class="product-items">
                <div
                  v-for="product in row.products.slice(0, 2)"
                  :key="product.product_id"
                  class="product-item"
                >
                  <el-image
                    v-if="product.image_url"
                    :src="getImageUrl(product.image_url)"
                    fit="cover"
                    class="product-image"
                    :preview-src-list="[getImageUrl(product.image_url)]"
                    :preview-teleported="true"
                  />
                  <div class="product-info">
                    <div class="product-name">{{ product.name || '-' }}</div>
                    <div class="product-price">¥{{ parseFloat(product.price || 0).toFixed(2) }}</div>
                  </div>
                </div>
                <div v-if="row.products.length > 2" class="more-products">
                  还有 {{ row.products.length - 2 }} 件商品
                </div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="start_time" label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="end_time" label="结束时间" width="180">
            <template #default="{ row }">
              {{ row.end_time ? formatDateTime(row.end_time) : '-' }}
            </template>
          </el-table-column>
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
                      <el-dropdown-item command="processing">处理中</el-dropdown-item>
                      <el-dropdown-item command="approved">已批准</el-dropdown-item>
                      <el-dropdown-item command="rejected">已拒绝</el-dropdown-item>
                      <el-dropdown-item command="completed">已完成</el-dropdown-item>
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

    <!-- 售后详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="售后详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" class="after-sale-detail">
        <div v-if="afterSaleDetail" class="detail-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>售后ID：</label>
                  <span>{{ afterSaleDetail.after_sale_id }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>订单ID：</label>
                  <span>{{ afterSaleDetail.order_id }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>售后状态：</label>
                  <el-tag :type="getStatusType(afterSaleDetail.status)">
                    {{ getStatusText(afterSaleDetail.status) }}
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>订单状态：</label>
                  <el-tag :type="getOrderStatusType(afterSaleDetail.order?.order_status)">
                    {{ getOrderStatusText(afterSaleDetail.order?.order_status) }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>开始时间：</label>
                  <span>{{ formatDateTime(afterSaleDetail.start_time) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>结束时间：</label>
                  <span>{{ afterSaleDetail.end_time ? formatDateTime(afterSaleDetail.end_time) : '-' }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>创建时间：</label>
                  <span>{{ formatDateTime(afterSaleDetail.created_at) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>更新时间：</label>
                  <span>{{ formatDateTime(afterSaleDetail.updated_at) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 售后信息 -->
          <div class="detail-section">
            <h3 class="section-title">售后信息</h3>
            <div class="detail-item">
              <label>售后原因：</label>
              <span>{{ afterSaleDetail.reason || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>具体内容：</label>
              <span>{{ afterSaleDetail.content || '-' }}</span>
            </div>
          </div>

          <!-- 订单信息 -->
          <div v-if="afterSaleDetail.order" class="detail-section">
            <h3 class="section-title">订单信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>订单ID：</label>
                  <span>{{ afterSaleDetail.order.order_id }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>用户ID：</label>
                  <span>{{ afterSaleDetail.order.user_id }}</span>
                </div>
              </el-col>
            </el-row>
            <div class="detail-item">
              <label>订单状态：</label>
              <el-tag :type="getOrderStatusType(afterSaleDetail.order.order_status)">
                {{ getOrderStatusText(afterSaleDetail.order.order_status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>订单备注：</label>
              <span>{{ afterSaleDetail.order.order_note || '-' }}</span>
            </div>
          </div>

          <!-- 商品列表 -->
          <div v-if="afterSaleDetail.products && afterSaleDetail.products.length > 0" class="detail-section">
            <h3 class="section-title">商品列表</h3>
            <el-table :data="afterSaleDetail.products" border>
              <el-table-column prop="product_id" label="商品ID" width="100" />
              <el-table-column label="商品图片" width="100">
                <template #default="{ row }">
                  <el-image
                    v-if="row.image_url"
                    :src="getImageUrl(row.image_url)"
                    fit="cover"
                    class="product-image"
                    :preview-src-list="[getImageUrl(row.image_url)]"
                    :preview-teleported="true"
                  />
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="商品名称" min-width="150" />
              <el-table-column prop="price" label="价格" width="100">
                <template #default="{ row }">
                  ¥{{ parseFloat(row.price || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="category.name" label="分类" width="120" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 售后编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑售后"
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
          <el-form-item label="售后原因" prop="reason">
            <el-input
              v-model="editForm.reason"
              placeholder="请输入售后原因（1-200字符）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="具体内容" prop="content">
            <el-input
              v-model="editForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入售后具体内容"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="商品ID" prop="product_ids">
            <el-select
              v-model="editForm.product_ids"
              multiple
              filterable
              placeholder="请选择商品（至少选择一个）"
              style="width: 100%"
            >
              <el-option
                v-for="product in availableProducts"
                :key="product.product_id"
                :label="`${product.name} (ID: ${product.product_id})`"
                :value="product.product_id"
              />
            </el-select>
            <div style="margin-top: 8px; color: #909399; font-size: 12px">
              已选择：{{ editForm.product_ids.length }} 个商品
            </div>
          </el-form-item>

          <el-form-item label="结束时间" prop="end_time">
            <el-date-picker
              v-model="editForm.end_time"
              type="datetime"
              placeholder="请选择结束时间（可选）"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
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
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue'
import {
  getAfterSalesList,
  getAfterSaleDetail,
  updateAfterSale,
  updateAfterSaleStatus,
  deleteAfterSale
} from '@/api/afterSales.js'
import { getImageUrl } from '@/config/api.js'

// 数据
const loading = ref(false)
const afterSalesList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  status: '',
  order_id: null
})

// 售后详情弹窗
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const afterSaleDetail = ref(null)

// 售后编辑弹窗
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editSubmitLoading = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  reason: '',
  content: '',
  product_ids: [],
  end_time: null
})

// 可用商品列表（从详情中获取）
const availableProducts = ref([])

const editFormRules = {
  reason: [
    { max: 200, message: '售后原因不能超过200个字符', trigger: 'blur' }
  ],
  content: [
    { max: 1000, message: '具体内容不能超过1000个字符', trigger: 'blur' }
  ],
  product_ids: [
    {
      type: 'array',
      min: 1,
      message: '至少需要选择一个商品',
      trigger: 'change'
    }
  ]
}

// 当前编辑的售后ID
let currentEditAfterSaleId = null

// 页面加载时获取数据
onMounted(async () => {
  await loadAfterSalesList()
})

// 加载售后列表
const loadAfterSalesList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchForm.status) {
      params.status = searchForm.status
    }

    if (searchForm.order_id) {
      params.order_id = searchForm.order_id
    }

    const response = await getAfterSalesList(params)

    if (response.success) {
      afterSalesList.value = response.data || []
      total.value = response.pagination?.total || 0
    } else {
      ElMessage.error(response.message || '获取售后列表失败')
    }
  } catch (error) {
    console.error('获取售后列表错误:', error)
    ElMessage.error(error.message || '获取售后列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadAfterSalesList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.status = ''
  searchForm.order_id = null
  currentPage.value = 1
  loadAfterSalesList()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  loadAfterSalesList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadAfterSalesList()
}

// 获取售后状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    approved: '已批准',
    rejected: '已拒绝',
    completed: '已完成'
  }
  return statusMap[status] || status
}

// 获取售后状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    processing: 'info',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  }
  return typeMap[status] || ''
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    paid: '已支付',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消'
  }
  return statusMap[status] || status || '-'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'info',
    shipped: '',
    delivered: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

// 打开售后详情对话框
const openDetailDialog = async (afterSale) => {
  try {
    detailLoading.value = true
    detailDialogVisible.value = true

    const response = await getAfterSaleDetail(afterSale.after_sale_id)

    if (response.success) {
      afterSaleDetail.value = response.data
    } else {
      ElMessage.error(response.message || '获取售后详情失败')
      detailDialogVisible.value = false
    }
  } catch (error) {
    console.error('获取售后详情错误:', error)
    ElMessage.error(error.message || '获取售后详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 打开售后编辑对话框
const openEditDialog = async (afterSale) => {
  try {
    editLoading.value = true
    editDialogVisible.value = true
    currentEditAfterSaleId = afterSale.after_sale_id

    // 先获取售后详情
    const response = await getAfterSaleDetail(afterSale.after_sale_id)

    if (response.success) {
      const data = response.data
      editForm.reason = data.reason || ''
      editForm.content = data.content || ''
      editForm.product_ids = (data.products || []).map((p) => p.product_id)
      editForm.end_time = data.end_time || null

      // 保存可用商品列表
      availableProducts.value = data.products || []
    } else {
      ElMessage.error(response.message || '获取售后详情失败')
      editDialogVisible.value = false
    }
  } catch (error) {
    console.error('获取售后详情错误:', error)
    ElMessage.error(error.message || '获取售后详情失败')
    editDialogVisible.value = false
  } finally {
    editLoading.value = false
  }
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    editSubmitLoading.value = true

    const data = {}
    if (editForm.reason) data.reason = editForm.reason
    if (editForm.content) data.content = editForm.content
    if (editForm.product_ids && editForm.product_ids.length > 0) {
      data.product_ids = editForm.product_ids
    }
    if (editForm.end_time) data.end_time = editForm.end_time

    const response = await updateAfterSale(currentEditAfterSaleId, data)

    if (response.success) {
      ElMessage.success('售后更新成功')
      editDialogVisible.value = false
      loadAfterSalesList() // 刷新列表
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('更新售后错误:', error)
      ElMessage.error(error.message || '更新失败')
    }
  } finally {
    editSubmitLoading.value = false
  }
}

// 处理状态更改
const handleStatusChange = async (afterSale, newStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要将售后状态改为"${getStatusText(newStatus)}"吗？`,
      '状态更新确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await updateAfterSaleStatus(afterSale.after_sale_id, newStatus)

    if (response.success) {
      ElMessage.success('售后状态更新成功')
      loadAfterSalesList() // 刷新列表
    } else {
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新售后状态错误:', error)
      ElMessage.error(error.message || '状态更新失败')
    }
  }
}

// 删除售后
const handleDelete = async (afterSale) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除售后 #${afterSale.after_sale_id} 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await deleteAfterSale(afterSale.after_sale_id)

    if (response.success) {
      ElMessage.success('售后删除成功')
      loadAfterSalesList() // 刷新列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除售后错误:', error)
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

/* 页面内容样式 */
.page-content {
  height: calc(100% - 100px);
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
}

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 商品列表样式 */
.product-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.more-products {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 售后详情样式 */
.after-sale-detail {
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
