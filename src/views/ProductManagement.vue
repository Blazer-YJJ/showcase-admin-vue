<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
      <h1>商品管理</h1>
        <p>管理商品信息、库存和分类</p>
      </div>
      <div class="header-right">
        <el-button type="success" @click="openBatchUploadDialog">
          <el-icon><UploadFilled /></el-icon>
          批量上传
        </el-button>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 搜索和筛选区域 -->
      <el-card class="search-card">
        <el-form :model="searchForm" inline>
          <el-form-item label="商品名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category_id"
              placeholder="请选择分类"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="category in categories"
                :key="category.category_id"
                :label="category.name"
                :value="category.category_id"
              />
            </el-select>
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

      <!-- 商品列表表格 -->
      <el-card class="table-card">
        <el-table
          v-loading="loading"
          :data="productList"
          stripe
          style="width: 100%"
          empty-text="暂无商品数据"
        >
          <el-table-column prop="product_id" label="商品ID" width="80" />
          <el-table-column prop="name" label="商品名称" min-width="150" />
          <el-table-column label="商品图片" width="120">
            <template #default="{ row }">
              <div class="product-images">
                <el-image
                  v-if="getMainImage(row)"
                  :src="getMainImage(row)"
                  :preview-src-list="getImageList(row)"
                  fit="contain"
                  class="product-image"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>暂无图片</span>
                    </div>
                  </template>
                </el-image>
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                  <span>暂无图片</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="商品描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="price" label="价格" width="120">
            <template #default="{ row }">
              <span class="price-text">¥{{ parseFloat(row.price).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="category_name" label="分类" width="120" />
          <el-table-column prop="category_path" label="分类路径" min-width="150" show-overflow-tooltip />
          <el-table-column prop="tags" label="标签" width="150" show-overflow-tooltip />
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <el-button type="info" size="small" @click="openDetailDialog(row)">
                查看
              </el-button>
              <el-button type="primary" size="small" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
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

    <!-- 添加商品弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加商品"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        label-position="left"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name">
                <el-input
                  v-model="addForm.name"
                  placeholder="请输入商品名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="价格" prop="price">
                <el-input-number
                  v-model="addForm.price"
                  :min="0"
                  :precision="2"
                  placeholder="请输入价格（默认0）"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分类" prop="category_id">
                <el-cascader
                  v-model="addForm.category_id"
                  :options="categoryTree"
                  :props="cascaderProps"
                  placeholder="请选择分类"
                  style="width: 100%"
                  clearable
                  filterable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标签" prop="tags">
                <el-input
                  v-model="addForm.tags"
                  placeholder="请输入标签，用逗号分隔"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="addForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述（可选）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 商品参数 -->
        <div class="form-section">
          <h3 class="section-title">
            商品参数
            <el-button
              type="primary"
              size="small"
              @click="addParam"
              style="margin-left: 10px"
            >
              <el-icon><Plus /></el-icon>
              添加参数
            </el-button>
          </h3>
          <div v-if="addForm.params.length === 0" class="empty-params">
            <el-empty description="暂无参数，点击上方按钮添加" :image-size="80" />
          </div>
          <div v-else class="params-list">
            <div
              v-for="(param, index) in addForm.params"
              :key="index"
              class="param-item"
            >
              <el-row :gutter="10">
                <el-col :span="10">
                  <el-input
                    v-model="param.param_key"
                    placeholder="参数名称"
                    clearable
                  />
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model="param.param_value"
                    placeholder="参数值"
                    clearable
                  />
                </el-col>
                <el-col :span="2">
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeParam(index)"
                    :disabled="addForm.params.length === 1"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 商品图片 -->
        <div class="form-section">
          <h3 class="section-title">商品图片</h3>
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
            multiple
            drag
            accept="image/*"
            list-type="picture-card"
            class="upload-demo"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png格式，单个文件不超过5MB，最多上传10张图片
              </div>
            </template>
          </el-upload>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAddDialog">取消</el-button>
          <el-button type="primary" @click="submitAddForm" :loading="submitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 商品详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="商品详情"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-loading="detailLoading" class="product-detail">
        <div v-if="productDetail" class="detail-content">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>商品ID：</label>
                  <span>{{ productDetail.product_id }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>商品名称：</label>
                  <span>{{ productDetail.name }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>价格：</label>
                  <span class="price-text">¥{{ parseFloat(productDetail.price).toFixed(2) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>分类：</label>
                  <span>{{ productDetail.category_name }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>分类路径：</label>
                  <span>{{ productDetail.category_path }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>标签：</label>
                  <span>{{ productDetail.tags || '无' }}</span>
                </div>
              </el-col>
            </el-row>
            <div class="detail-item">
              <label>商品描述：</label>
              <p class="description-text">{{ productDetail.description || '暂无描述' }}</p>
            </div>
          </div>

          <!-- 商品参数 -->
          <div class="detail-section" v-if="productDetail.params && productDetail.params.length > 0">
            <h3 class="section-title">商品参数</h3>
            <div class="params-grid">
              <div
                v-for="(param, index) in productDetail.params"
                :key="index"
                class="param-item"
              >
                <div class="param-key">{{ param.param_key }}：</div>
                <div class="param-value">{{ param.param_value }}</div>
              </div>
            </div>
          </div>

          <!-- 商品图片 -->
          <div class="detail-section" v-if="productDetail.images && productDetail.images.length > 0">
            <h3 class="section-title">商品图片</h3>
            <div class="images-grid">
              <div
                v-for="(image, index) in productDetail.images"
                :key="index"
                class="image-item"
              >
                <el-image
                  :src="getImageUrl(image.image_url)"
                  :preview-src-list="getDetailImageList()"
                  :initial-index="index"
                  fit="contain"
                  class="detail-image"
                  :preview-teleported="true"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                </el-image>
                <div class="image-info">
                  <div class="image-type">{{ getImageTypeText(image.image_type) }}</div>
                  <div class="image-sort">排序：{{ image.sort_order }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="detail-section">
            <h3 class="section-title">时间信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="detail-item">
                  <label>创建时间：</label>
                  <span>{{ formatDateTime(productDetail.created_at) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="detail-item">
                  <label>更新时间：</label>
                  <span>{{ formatDateTime(productDetail.updated_at) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDetailDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量上传弹窗 -->
    <el-dialog
      v-model="batchUploadDialogVisible"
      title="批量上传商品"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="batchUploadFormRef"
        :model="batchUploadForm"
        :rules="batchUploadFormRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="分类" prop="category_id">
          <el-cascader
            v-model="batchUploadForm.category_id"
            :options="categoryTree"
            :props="cascaderProps"
            placeholder="请选择分类（必填）"
            style="width: 100%"
            clearable
            filterable
          />
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-input
            v-model="batchUploadForm.tags"
            placeholder="请输入标签（非必填，用逗号分隔）"
            clearable
          />
        </el-form-item>

        <el-form-item label="商品图片" prop="images">
          <el-upload
            ref="batchUploadRef"
            :file-list="batchUploadFileList"
            :auto-upload="false"
            :on-change="handleBatchFileChange"
            :on-remove="handleBatchFileRemove"
            :before-upload="beforeBatchUpload"
            :limit="100"
            multiple
            drag
            accept="image/*"
            list-type="picture-card"
            class="batch-upload-demo"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png格式，单个文件不超过5MB，最多上传100张图片。图片名称将作为商品名称。
              </div>
            </template>
          </el-upload>
          
          <div v-if="batchUploadFileList.length > 0" class="batch-upload-info">
            <el-alert
              :title="`已选择 ${batchUploadFileList.length} 张图片`"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeBatchUploadDialog">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitBatchUpload" 
            :loading="batchUploadLoading"
            :disabled="batchUploadFileList.length === 0"
          >
            确定上传
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑商品弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑商品"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
        label-position="left"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name">
                <el-input
                  v-model="editForm.name"
                  placeholder="请输入商品名称（可选）"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="价格" prop="price">
                <el-input-number
                  v-model="editForm.price"
                  :min="0"
                  :precision="2"
                  placeholder="请输入价格（可选）"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分类" prop="category_id">
                <el-cascader
                  v-model="editForm.category_id"
                  :options="categoryTree"
                  :props="cascaderProps"
                  placeholder="请选择分类（可选）"
                  style="width: 100%"
                  clearable
                  filterable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标签" prop="tags">
                <el-input
                  v-model="editForm.tags"
                  placeholder="请输入标签，用逗号分隔（可选）"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="editForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述（可选）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 商品参数 -->
        <div class="form-section">
          <h3 class="section-title">
            商品参数
            <el-button
              type="primary"
              size="small"
              @click="addEditParam"
              style="margin-left: 10px"
            >
              <el-icon><Plus /></el-icon>
              添加参数
            </el-button>
          </h3>
          <div v-if="editForm.params.length === 0" class="empty-params">
            <el-empty description="暂无参数，点击上方按钮添加" :image-size="80" />
          </div>
          <div v-else class="params-list">
            <div
              v-for="(param, index) in editForm.params"
              :key="index"
              class="param-item"
            >
              <el-row :gutter="10">
                <el-col :span="10">
                  <el-input
                    v-model="param.param_key"
                    placeholder="参数名称"
                    clearable
                  />
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model="param.param_value"
                    placeholder="参数值"
                    clearable
                  />
                </el-col>
                <el-col :span="2">
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeEditParam(index)"
                    :disabled="editForm.params.length === 1"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>

        <!-- 商品图片 -->
        <div class="form-section">
          <h3 class="section-title">商品图片</h3>
          <el-upload
            ref="editUploadRef"
            :file-list="editFileList"
            :auto-upload="false"
            :on-change="handleEditFileChange"
            :on-remove="handleEditFileRemove"
            :before-upload="beforeUpload"
            multiple
            drag
            accept="image/*"
            list-type="picture-card"
            class="upload-demo"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png格式，单个文件不超过5MB，最多上传10张图片
              </div>
            </template>
          </el-upload>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditDialog">取消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="editSubmitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Picture, Delete, UploadFilled } from '@element-plus/icons-vue'
import { productApi, categoryApi, getImageUrl } from '../config/api.js'

// 响应式数据
const loading = ref(false)
const productList = ref([])
const categories = ref([])
const categoryTree = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 添加商品弹窗相关
const addDialogVisible = ref(false)
const addFormRef = ref()
const uploadRef = ref()
const submitLoading = ref(false)
const fileList = ref([])

// 商品详情弹窗相关
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const productDetail = ref(null)

// 编辑商品弹窗相关
const editDialogVisible = ref(false)
const editFormRef = ref()
const editUploadRef = ref()
const editSubmitLoading = ref(false)
const editFileList = ref([])
const currentEditProduct = ref(null)

// 批量上传弹窗相关
const batchUploadDialogVisible = ref(false)
const batchUploadFormRef = ref()
const batchUploadRef = ref()
const batchUploadLoading = ref(false)
const batchUploadFileList = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  category_id: ''
})

// 添加商品表单
const addForm = reactive({
  name: '',
  description: '',
  price: 0,
  category_id: null,
  tags: '',
  params: []
})

// 编辑商品表单
const editForm = reactive({
  name: '',
  description: '',
  price: 0,
  category_id: null,
  tags: '',
  params: []
})

// 级联选择器配置
const cascaderProps = {
  value: 'category_id',
  label: 'name',
  children: 'children',
  emitPath: false, // 只返回最后一级的值
  checkStrictly: true // 允许选择任意一级
}

// 表单验证规则
const addFormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 100, message: '商品名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '商品描述长度不能超过 500 个字符', trigger: 'blur' }
  ],
  price: [
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 编辑表单验证规则（所有参数都是可选的）
const editFormRules = {
  name: [
    { min: 1, max: 100, message: '商品名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '商品描述长度不能超过 500 个字符', trigger: 'blur' }
  ],
  price: [
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ]
}

// 批量上传表单
const batchUploadForm = reactive({
  category_id: null,
  tags: ''
})

// 批量上传表单验证规则
const batchUploadFormRules = {
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    loadProductList(),
    loadCategoryList(),
    loadCategoryTree()
  ])
})

// 加载商品列表
const loadProductList = async () => {
  try {
    loading.value = true
    const response = await productApi.getProducts(currentPage.value, pageSize.value)
    
    if (response.success) {
      productList.value = response.data.products
      total.value = response.data.pagination.total
    } else {
      ElMessage.error(response.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表错误:', error)
    ElMessage.error(error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategoryList = async () => {
  try {
    const response = await categoryApi.getCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类列表错误:', error)
  }
}

// 加载分类树
const loadCategoryTree = async () => {
  try {
    const response = await categoryApi.getCategoryTree()
    if (response.success) {
      categoryTree.value = response.data
    } else {
      // 如果API不支持树结构，则使用平级列表构建树
      console.warn('分类树API不可用，使用平级列表')
      categoryTree.value = categories.value
    }
  } catch (error) {
    console.error('获取分类树错误:', error)
    // 降级到使用平级列表
    categoryTree.value = categories.value
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadProductList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.category_id = ''
  currentPage.value = 1
  loadProductList()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  loadProductList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadProductList()
}

// 打开添加商品对话框
const openAddDialog = () => {
  resetAddForm()
  addDialogVisible.value = true
}

// 关闭添加商品对话框
const closeAddDialog = () => {
  addDialogVisible.value = false
  resetAddForm()
}

// 重置添加表单
const resetAddForm = () => {
  addForm.name = ''
  addForm.description = ''
  addForm.price = 0
  addForm.category_id = null
  addForm.tags = ''
  addForm.params = []
  fileList.value = []
  
  // 清除表单验证
  if (addFormRef.value) {
    addFormRef.value.clearValidate()
  }
  
  // 清除上传组件
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 重置编辑表单
const resetEditForm = () => {
  editForm.name = ''
  editForm.description = ''
  editForm.price = 0
  editForm.category_id = null
  editForm.tags = ''
  editForm.params = []
  editFileList.value = []
  currentEditProduct.value = null
  
  // 清除表单验证
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
  
  // 清除上传组件
  if (editUploadRef.value) {
    editUploadRef.value.clearFiles()
  }
}

// 添加参数
const addParam = () => {
  addForm.params.push({
    param_key: '',
    param_value: ''
  })
}

// 删除参数
const removeParam = (index) => {
  if (addForm.params.length > 1) {
    addForm.params.splice(index, 1)
  }
}

// 添加编辑参数
const addEditParam = () => {
  editForm.params.push({
    param_key: '',
    param_value: ''
  })
}

// 删除编辑参数
const removeEditParam = (index) => {
  if (editForm.params.length > 1) {
    editForm.params.splice(index, 1)
  }
}

// 文件上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  if (fileList.value.length >= 10) {
    ElMessage.error('最多只能上传10张图片!')
    return false
  }
  return true
}

// 文件变化处理
const handleFileChange = (file, fileListParam) => {
  // 更新fileList
  fileList.value = fileListParam
}

// 文件移除处理
const handleFileRemove = (file, fileListParam) => {
  // 更新fileList
  fileList.value = fileListParam
}

// 编辑文件变化处理
const handleEditFileChange = (file, fileListParam) => {
  // 更新editFileList
  editFileList.value = fileListParam
}

// 编辑文件移除处理
const handleEditFileRemove = (file, fileListParam) => {
  // 更新editFileList
  editFileList.value = fileListParam
}

// 提交添加表单
const submitAddForm = async () => {
  try {
    // 表单验证
    await addFormRef.value.validate()
    
    // 检查是否有上传的图片
    if (fileList.value.length === 0) {
      ElMessage.warning('请至少上传一张商品图片')
      return
    }
    
    submitLoading.value = true
    
    // 准备商品数据
    const productData = {
      name: addForm.name,
      description: addForm.description,
      price: addForm.price.toString(),
      category_id: Array.isArray(addForm.category_id) ? addForm.category_id[addForm.category_id.length - 1] : addForm.category_id,
      tags: addForm.tags,
      params: JSON.stringify(addForm.params),
      images: fileList.value.map(file => file.raw)
    }
    
    // 发送请求
    const response = await productApi.createProduct(productData)
    
    if (response.success) {
      ElMessage.success('商品添加成功')
      closeAddDialog()
      loadProductList() // 刷新列表
    } else {
      ElMessage.error(response.message || '添加失败')
    }
  } catch (error) {
    console.error('添加商品错误:', error)
    ElMessage.error(error.message || '添加失败')
  } finally {
    submitLoading.value = false
  }
}

// 打开商品详情对话框
const openDetailDialog = async (product) => {
  try {
    detailLoading.value = true
    detailDialogVisible.value = true
    
    const response = await productApi.getProductDetail(product.product_id)
    
    if (response.success) {
      productDetail.value = response.data
    } else {
      ElMessage.error(response.message || '获取商品详情失败')
      detailDialogVisible.value = false
    }
  } catch (error) {
    console.error('获取商品详情错误:', error)
    ElMessage.error(error.message || '获取商品详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 关闭商品详情对话框
const closeDetailDialog = () => {
  detailDialogVisible.value = false
  productDetail.value = null
}

// 获取详情图片列表（用于预览）
const getDetailImageList = () => {
  if (!productDetail.value || !productDetail.value.images) {
    return []
  }
  return productDetail.value.images.map(img => getImageUrl(img.image_url))
}

// 获取图片类型文本
const getImageTypeText = (type) => {
  const typeMap = {
    'main': '主图',
    'sub': '副图',
    'detail': '详情图'
  }
  return typeMap[type] || type
}

// 打开编辑商品对话框
const openEditDialog = async (product) => {
  try {
    // 保存当前编辑的商品
    currentEditProduct.value = product
    
    // 获取商品详情
    const response = await productApi.getProductDetail(product.product_id)
    
    if (response.success) {
      const productDetail = response.data
      
      // 填充编辑表单
      editForm.name = productDetail.name
      editForm.description = productDetail.description || ''
      editForm.price = parseFloat(productDetail.price)
      editForm.category_id = productDetail.category_id
      editForm.tags = productDetail.tags || ''
      
      // 处理参数
      if (productDetail.params && productDetail.params.length > 0) {
        editForm.params = productDetail.params.map(param => ({
          param_key: param.param_key,
          param_value: param.param_value
        }))
      } else {
        editForm.params = []
      }
      
      // 处理现有图片（显示但不作为新上传的文件）
      if (productDetail.images && productDetail.images.length > 0) {
        editFileList.value = productDetail.images.map((img, index) => ({
          name: `existing_${index}.jpg`,
          url: getImageUrl(img.image_url),
          status: 'success',
          uid: `existing_${index}`,
          isExisting: true // 标记为现有图片
        }))
      } else {
        editFileList.value = []
      }
      
      editDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情错误:', error)
    ElMessage.error(error.message || '获取商品详情失败')
  }
}

// 关闭编辑商品对话框
const closeEditDialog = () => {
  editDialogVisible.value = false
  resetEditForm()
}

// 提交编辑表单
const submitEditForm = async () => {
  try {
    // 表单验证（只验证格式，不验证必填）
    await editFormRef.value.validate()
    
    editSubmitLoading.value = true
    
    // 准备商品数据（只包含有值的字段）
    const productData = {}
    
    // 只添加有值的字段
    if (editForm.name && editForm.name.trim()) {
      productData.name = editForm.name.trim()
    }
    if (editForm.description && editForm.description.trim()) {
      productData.description = editForm.description.trim()
    }
    if (editForm.price !== null && editForm.price !== undefined) {
      productData.price = editForm.price.toString()
    }
    if (editForm.category_id) {
      productData.category_id = Array.isArray(editForm.category_id) ? editForm.category_id[editForm.category_id.length - 1] : editForm.category_id
    }
    if (editForm.tags && editForm.tags.trim()) {
      productData.tags = editForm.tags.trim()
    }
    if (editForm.params && editForm.params.length > 0) {
      productData.params = JSON.stringify(editForm.params)
    }
    
    // 处理图片：只上传新添加的图片
    const newImages = editFileList.value.filter(file => !file.isExisting && file.raw)
    if (newImages.length > 0) {
      productData.images = newImages.map(file => file.raw)
    }
    
    // 发送请求
    const response = await productApi.updateProduct(currentEditProduct.value.product_id, productData)
    
    if (response.success) {
      ElMessage.success('商品更新成功')
      closeEditDialog()
      loadProductList() // 刷新列表
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新商品错误:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    editSubmitLoading.value = false
  }
}

// 删除商品
const handleDelete = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${product.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await productApi.deleteProduct(product.product_id)
    
    if (response.success) {
      ElMessage.success('商品删除成功')
      loadProductList() // 刷新列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品错误:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 获取商品主图片
const getMainImage = (product) => {
  if (!product.images || product.images.length === 0) {
    return null
  }
  
  // 优先显示主图（image_type为'main'的图片）
  const mainImage = product.images.find(img => img.image_type === 'main')
  if (mainImage) {
    return getImageUrl(mainImage.image_url)
  }
  
  // 如果没有主图，显示第一张图片
  return getImageUrl(product.images[0].image_url)
}

// 获取商品所有图片列表（用于预览）
const getImageList = (product) => {
  if (!product.images || product.images.length === 0) {
    return []
  }
  
  return product.images.map(img => getImageUrl(img.image_url))
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

// 打开批量上传对话框
const openBatchUploadDialog = () => {
  resetBatchUploadForm()
  batchUploadDialogVisible.value = true
}

// 关闭批量上传对话框
const closeBatchUploadDialog = () => {
  batchUploadDialogVisible.value = false
  resetBatchUploadForm()
}

// 重置批量上传表单
const resetBatchUploadForm = () => {
  batchUploadForm.category_id = null
  batchUploadForm.tags = ''
  batchUploadFileList.value = []
  
  // 清除表单验证
  if (batchUploadFormRef.value) {
    batchUploadFormRef.value.clearValidate()
  }
  
  // 清除上传组件
  if (batchUploadRef.value) {
    batchUploadRef.value.clearFiles()
  }
}

// 批量上传文件验证
const beforeBatchUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  if (batchUploadFileList.value.length >= 100) {
    ElMessage.error('最多只能上传100张图片!')
    return false
  }
  return true
}

// 批量上传文件变化处理
const handleBatchFileChange = (file, fileListParam) => {
  // 更新fileList
  batchUploadFileList.value = fileListParam
}

// 批量上传文件移除处理
const handleBatchFileRemove = (file, fileListParam) => {
  // 更新fileList
  batchUploadFileList.value = fileListParam
}

// 提交批量上传
const submitBatchUpload = async () => {
  try {
    // 表单验证
    await batchUploadFormRef.value.validate()
    
    // 检查是否选择了图片
    if (batchUploadFileList.value.length === 0) {
      ElMessage.warning('请至少选择一张图片')
      return
    }
    
    batchUploadLoading.value = true
    
    // 准备批量上传数据
    const batchData = {
      category_id: Array.isArray(batchUploadForm.category_id) 
        ? batchUploadForm.category_id[batchUploadForm.category_id.length - 1] 
        : batchUploadForm.category_id,
      tags: batchUploadForm.tags || '',
      images: batchUploadFileList.value.map(file => file.raw)
    }
    
    // 发送请求
    const response = await productApi.batchCreateProducts(batchData)
    
    if (response.success) {
      ElMessage.success(`成功批量创建 ${response.data?.created_count || batchUploadFileList.value.length} 个商品`)
      closeBatchUploadDialog()
      loadProductList() // 刷新列表
    } else {
      ElMessage.error(response.message || '批量上传失败')
    }
  } catch (error) {
    console.error('批量上传错误:', error)
    ElMessage.error(error.message || '批量上传失败')
  } finally {
    batchUploadLoading.value = false
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  min-height: 100%;
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

.header-right {
  display: flex;
  gap: 12px;
}

/* 页面内容样式 */
.page-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 搜索卡片样式 */
.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

/* 表格卡片样式 */
.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  width: 100%;
}

.table-card :deep(.el-table__header) {
  background-color: #fafafa;
}

.table-card :deep(.el-table th) {
  background-color: #fafafa !important;
  color: #606266;
  font-weight: 600;
}

/* 价格样式 */
.price-text {
  color: #e6a23c;
  font-weight: 600;
  font-size: 14px;
}

/* 商品图片样式 */
.product-images {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-image:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.image-error,
.no-image {
  width: 60px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
  color: #909399;
  font-size: 12px;
}

.image-error .el-icon,
.no-image .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

/* 分页样式 */
.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}

/* 表格行悬停效果 */
.table-card :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 弹窗样式 */
.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.section-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.empty-params {
  text-align: center;
  padding: 20px;
  background-color: white;
  border-radius: 6px;
  border: 1px dashed #c0c4cc;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item {
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

.upload-demo :deep(.el-upload-list--picture-card) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-demo :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

.batch-upload-demo {
  width: 100%;
}

.batch-upload-demo :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

.batch-upload-demo :deep(.el-upload-list--picture-card) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.batch-upload-demo :deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

.batch-upload-info {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 商品详情弹窗样式 */
.product-detail {
  min-height: 400px;
}

.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.detail-section .section-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
  margin-right: 8px;
}

.detail-item span {
  color: #303133;
  flex: 1;
}

.description-text {
  margin: 0;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 参数网格样式 */
.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.param-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.param-key {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.param-value {
  color: #303133;
  flex: 1;
}

/* 图片网格样式 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  text-align: center;
}

.detail-image {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-image:hover {
  border-color: #409eff;
  transform: scale(1.02);
}

.image-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.image-type {
  font-weight: 600;
  margin-bottom: 4px;
}

.image-sort {
  color: #c0c4cc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .search-card :deep(.el-form) {
    flex-direction: column;
  }
  
  .search-card :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  /* 弹窗响应式 */
  .form-section {
    padding: 12px;
  }
  
  .param-item .el-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .param-item .el-col {
    width: 100% !important;
  }
  
  /* 详情弹窗响应式 */
  .detail-section {
    padding: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-item label {
    min-width: auto;
    margin-bottom: 4px;
  }
  
  .params-grid {
    grid-template-columns: 1fr;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .detail-image {
    width: 150px;
    height: 150px;
  }
}
</style>
