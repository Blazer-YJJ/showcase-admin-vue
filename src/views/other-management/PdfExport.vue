<!--
 * @Author: JingChengCool jingchengcool@outlook.com
 * @Date: 2025-10-03 07:24:31
 * @LastEditors: JingChengCool jingchengcool@outlook.com
 * @LastEditTime: 2025-11-07 06:15:17
 * @FilePath: \showcase-admin-vue\src\views\other-management\PdfExport.vue
 * @Description: PDF导出和配置管理页面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1>PDF管理</h1>
      <p>管理PDF导出功能和模板配置</p>
    </div>
    <div class="page-content">
      <el-tabs v-model="activeTab" class="pdf-tabs">
        <!-- PDF导出模块 -->
        <el-tab-pane label="PDF导出" name="export">
          <el-card class="content-card">
            <div class="export-section">
              <h3 class="section-title">导出全部商品</h3>
              <p class="section-desc">导出系统中所有商品信息为PDF文件</p>
              <el-button 
                type="primary" 
                @click="handleExportAll"
                :loading="exportAllLoading"
                :icon="Download"
              >
                导出全部商品
              </el-button>
            </div>

            <el-divider />

            <div class="export-section">
              <h3 class="section-title">指定分类导出</h3>
              <p class="section-desc">选择分类，导出该分类下的所有商品</p>
              <el-form :model="categoryExportForm" inline>
                <el-form-item label="选择分类">
                  <el-select
                    v-model="categoryExportForm.category_id"
                    placeholder="请选择分类"
                    clearable
                    style="width: 300px"
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
                  <el-button 
                    type="primary" 
                    @click="handleExportByCategory"
                    :loading="exportCategoryLoading"
                    :disabled="!categoryExportForm.category_id"
                    :icon="Download"
                  >
                    导出分类商品
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-divider />

            <div class="export-section">
              <h3 class="section-title">搜索导出</h3>
              <p class="section-desc">根据搜索关键词导出匹配的商品</p>
              <el-form :model="searchExportForm" inline>
                <el-form-item label="搜索关键词">
                  <el-input
                    v-model="searchExportForm.query"
                    placeholder="请输入搜索关键词"
                    clearable
                    style="width: 300px"
                    @keyup.enter="handleExportBySearch"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="handleExportBySearch"
                    :loading="exportSearchLoading"
                    :disabled="!searchExportForm.query"
                    :icon="Download"
                  >
                    搜索导出
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- PDF配置模块 -->
        <el-tab-pane label="PDF配置" name="config">
          <el-card class="content-card">
            <div class="config-section">
              <div class="config-header">
                <h3 class="section-title">PDF信息配置</h3>
                <el-button 
                  v-if="!hasConfig"
                  type="primary"
                  @click="showCreateDialog"
                  :icon="Plus"
                >
                  创建配置
                </el-button>
                <el-button 
                  v-else
                  type="danger"
                  @click="handleDeleteConfig"
                  :loading="deleteLoading"
                  :icon="Delete"
                >
                  删除配置
                </el-button>
              </div>

              <div v-if="configLoading" class="loading-container">
                <el-skeleton :rows="5" animated />
              </div>

              <div v-else-if="hasConfig" class="config-content">
                <el-form 
                  :model="configForm" 
                  :rules="configRules" 
                  ref="configFormRef"
                  label-width="180px"
                >
                  <el-form-item label="文件公司名称" prop="pdf_file_company_name">
                    <el-input
                      v-model="configForm.pdf_file_company_name"
                      placeholder="请输入文件公司名称"
                      clearable
                    />
                  </el-form-item>

                  <el-form-item label="标题公司名称" prop="pdf_title_company_name">
                    <el-input
                      v-model="configForm.pdf_title_company_name"
                      placeholder="请输入标题公司名称"
                      clearable
                    />
                  </el-form-item>

                  <!-- <el-form-item label="每行商品数量" prop="products_per_row">
                    <el-radio-group v-model="configForm.products_per_row">
                      <el-radio label="2">2个</el-radio>
                      <el-radio label="3">3个</el-radio>
                    </el-radio-group>
                  </el-form-item> -->

                  <el-form-item label="背景图片">
                    <div class="image-upload-section">
                      <el-upload
                        ref="uploadRef"
                        :file-list="backgroundImageList"
                        :auto-upload="false"
                        :on-change="handleImageChange"
                        :on-remove="handleImageRemove"
                        :before-upload="beforeImageUpload"
                        :limit="1"
                        accept="image/*"
                        list-type="picture-card"
                      >
                        <el-icon><Plus /></el-icon>
                        <template #tip>
                          <div class="el-upload__tip">
                            支持jpg/png格式，建议尺寸与PDF页面匹配
                          </div>
                        </template>
                      </el-upload>
                      <div v-if="currentConfig?.pdf_background_image" class="current-image">
                        <p>当前背景图片：</p>
                        <el-image
                          :src="getImageUrl(currentConfig.pdf_background_image)"
                          fit="contain"
                          style="width: 200px; height: 150px; border: 1px solid #dcdfe6; border-radius: 4px;"
                        >
                          <template #error>
                            <div class="image-error">
                              <el-icon><Picture /></el-icon>
                              <span>加载失败</span>
                            </div>
                          </template>
                        </el-image>
                      </div>
                    </div>
                  </el-form-item>

                  <el-form-item>
                    <el-button 
                      type="primary" 
                      @click="handleUpdateConfig"
                      :loading="updateLoading"
                    >
                      保存配置
                    </el-button>
                    <el-button @click="loadPdfConfig">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>

              <div v-else class="empty-config">
                <el-empty description="暂无配置信息，请创建配置">
                  <el-button type="primary" @click="showCreateDialog">创建配置</el-button>
                </el-empty>
              </div>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- PDF文件管理模块 -->
        <el-tab-pane label="PDF文件管理" name="files">
      <el-card class="content-card">
            <div class="files-section">
              <div class="files-header">
                <h3 class="section-title">PDF文件列表</h3>
                <div class="files-actions">
                  <el-button 
                    type="primary"
                    @click="loadPdfFiles"
                    :loading="filesLoading"
                    :icon="Refresh"
                  >
                    刷新列表
                  </el-button>
                  <el-button 
                    type="danger"
                    @click="handleBatchDelete"
                    :disabled="selectedFiles.length === 0"
                    :loading="deleteFilesLoading"
                    :icon="Delete"
                  >
                    批量删除 ({{ selectedFiles.length }})
                  </el-button>
                </div>
              </div>

              <div v-if="filesLoading" class="loading-container">
                <el-skeleton :rows="10" animated />
              </div>

              <div v-else-if="filesPagination.total === 0" class="empty-files">
                <el-empty description="暂无PDF文件">
                  <el-button type="primary" @click="loadPdfFiles">刷新列表</el-button>
                </el-empty>
              </div>

              <div v-else class="files-table-container">
                <el-table
                  :data="pdfFiles"
                  style="width: 100%"
                  @selection-change="handleSelectionChange"
                  v-loading="filesLoading"
                >
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="filename" label="文件名" min-width="300" show-overflow-tooltip>
                    <template #default="{ row }">
                      <span class="filename-text">{{ row.filename }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="sizeFormatted" label="文件大小" width="120" align="right" />
                  <el-table-column prop="createdTime" label="创建时间" width="180">
                    <template #default="{ row }">
                      {{ formatDateTime(row.createdTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="modifiedTime" label="修改时间" width="180">
                    <template #default="{ row }">
                      {{ formatDateTime(row.modifiedTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        size="small"
                        @click="handleDownloadFile(row)"
                        :icon="Download"
                      >
                        下载
                      </el-button>
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click="handleDeleteFile(row)"
                        :icon="Delete"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div class="files-footer">
                  <div class="files-info">
                    共 {{ filesPagination.total }} 个文件
                  </div>
                  <el-pagination
                    v-model:current-page="filesPagination.currentPage"
                    v-model:page-size="filesPagination.pageSize"
                    :total="filesPagination.total"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                    class="files-pagination"
                  />
                </div>
              </div>
        </div>
      </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 创建配置对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建PDF配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="createForm" 
        :rules="configRules" 
        ref="createFormRef"
        label-width="180px"
      >
        <el-form-item label="文件公司名称" prop="pdf_file_company_name">
          <el-input
            v-model="createForm.pdf_file_company_name"
            placeholder="请输入文件公司名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="标题公司名称" prop="pdf_title_company_name">
          <el-input
            v-model="createForm.pdf_title_company_name"
            placeholder="请输入标题公司名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="背景图片">
          <el-upload
            ref="createUploadRef"
            :file-list="createImageList"
            :auto-upload="false"
            :on-change="handleCreateImageChange"
            :on-remove="handleCreateImageRemove"
            :before-upload="beforeImageUpload"
            :limit="1"
            accept="image/*"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png格式，建议尺寸与PDF页面匹配（可选）
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeCreateDialog">取消</el-button>
          <el-button type="primary" @click="handleCreateConfig" :loading="createLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Plus, Delete, Picture, Refresh } from '@element-plus/icons-vue'
import { pdfExportApi, pdfConfigApi, pdfFilesApi, categoryApi, getImageUrl, BASE_URL } from '@/config/api.js'
import { authManager } from '@/utils/auth.js'

// 标签页
const activeTab = ref('export')

// 分类列表
const categories = ref([])
const categoryLoading = ref(false)

// 导出相关
const exportAllLoading = ref(false)
const exportCategoryLoading = ref(false)
const exportSearchLoading = ref(false)

const categoryExportForm = reactive({
  category_id: null
})

const searchExportForm = reactive({
  query: ''
})

// 配置相关
const configLoading = ref(false)
const createLoading = ref(false)
const updateLoading = ref(false)
const deleteLoading = ref(false)
const currentConfig = ref(null)
const hasConfig = computed(() => !!currentConfig.value)

const configForm = reactive({
  pdf_file_company_name: '',
  pdf_title_company_name: '',
  products_per_row: '2',
  pdf_background_image: null
})

const configRules = {
  pdf_file_company_name: [
    { required: true, message: '请输入文件公司名称', trigger: 'blur' }
  ],
  pdf_title_company_name: [
    { required: true, message: '请输入标题公司名称', trigger: 'blur' }
  ],
  products_per_row: [
    { required: true, message: '请选择每行商品数量', trigger: 'change' }
  ]
}

const configFormRef = ref(null)
const uploadRef = ref(null)
const backgroundImageList = ref([])

// 创建配置相关
const createDialogVisible = ref(false)
const createForm = reactive({
  pdf_file_company_name: '',
  pdf_title_company_name: '',
  products_per_row: '2',
  pdf_background_image: null
})
const createFormRef = ref(null)
const createUploadRef = ref(null)
const createImageList = ref([])

// 加载分类列表
const loadCategories = async () => {
  try {
    categoryLoading.value = true
    const response = await categoryApi.getCategories()
    if (response.success) {
      categories.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取分类列表失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '获取分类列表失败')
  } finally {
    categoryLoading.value = false
  }
}

// 下载PDF文件
const downloadPdf = async (pdfPath, pdfName) => {
  try {
    const url = `${BASE_URL}${pdfPath}`
    // 使用fetch下载文件，支持认证
    const authHeaders = authManager.getHeaders()
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders
    })
    
    if (!response.ok) {
      throw new Error('下载失败')
    }
    
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = pdfName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // 如果fetch失败，尝试直接打开链接
    const url = `${BASE_URL}${pdfPath}`
    window.open(url, '_blank')
    ElMessage.warning('正在打开PDF文件，如果下载失败请检查浏览器设置')
  }
}

// 导出全部商品
const handleExportAll = async () => {
  try {
    exportAllLoading.value = true
    const response = await pdfExportApi.exportAllProducts()
    if (response.success) {
      ElMessage.success('导出成功')
      downloadPdf(response.data.pdfPath, response.data.pdfName)
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exportAllLoading.value = false
  }
}

// 导出分类商品
const handleExportByCategory = async () => {
  if (!categoryExportForm.category_id) {
    ElMessage.warning('请选择分类')
    return
  }
  try {
    exportCategoryLoading.value = true
    const response = await pdfExportApi.exportByCategory(categoryExportForm.category_id)
    if (response.success) {
      ElMessage.success('导出成功')
      downloadPdf(response.data.pdfPath, response.data.pdfName)
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exportCategoryLoading.value = false
  }
}

// 搜索导出
const handleExportBySearch = async () => {
  if (!searchExportForm.query) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  try {
    exportSearchLoading.value = true
    const response = await pdfExportApi.exportBySearch(searchExportForm.query)
    if (response.success) {
      ElMessage.success('导出成功')
      downloadPdf(response.data.pdfPath, response.data.pdfName)
    } else {
      ElMessage.error(response.message || '导出失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exportSearchLoading.value = false
  }
}

// 加载PDF配置
const loadPdfConfig = async () => {
  try {
    configLoading.value = true
    const response = await pdfConfigApi.getPdfConfig()
    if (response.success) {
      currentConfig.value = response.data
      if (response.data) {
        configForm.pdf_file_company_name = response.data.pdf_file_company_name || ''
        configForm.pdf_title_company_name = response.data.pdf_title_company_name || ''
        configForm.products_per_row = String(response.data.products_per_row || '2')
        configForm.pdf_background_image = null
        backgroundImageList.value = []
      }
    } else {
      if (response.message && !response.message.includes('未找到')) {
        ElMessage.error(response.message || '获取配置失败')
      }
      currentConfig.value = null
    }
  } catch (error) {
    currentConfig.value = null
    // 如果错误不是404，显示错误消息
    if (!error.message.includes('404') && !error.message.includes('未找到')) {
      ElMessage.error(error.message || '获取配置失败')
    }
  } finally {
    configLoading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  createForm.pdf_file_company_name = ''
  createForm.pdf_title_company_name = ''
  createForm.products_per_row = '2'
  createForm.pdf_background_image = null
  createImageList.value = []
  createDialogVisible.value = true
}

// 关闭创建对话框
const closeCreateDialog = () => {
  createDialogVisible.value = false
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
  createImageList.value = []
}

// 创建配置
const handleCreateConfig = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    createLoading.value = true
    
    const configData = {
      pdf_file_company_name: createForm.pdf_file_company_name,
      pdf_title_company_name: createForm.pdf_title_company_name,
      products_per_row: createForm.products_per_row,
      pdf_background_image: createForm.pdf_background_image
    }
    
    const response = await pdfConfigApi.createPdfConfig(configData)
    if (response.success) {
      ElMessage.success('创建配置成功')
      closeCreateDialog()
      await loadPdfConfig()
    } else {
      ElMessage.error(response.message || '创建配置失败')
    }
  } catch (error) {
    if (error.message && !error.message.includes('validation')) {
      ElMessage.error(error.message || '创建配置失败')
    }
  } finally {
    createLoading.value = false
  }
}

// 更新配置
const handleUpdateConfig = async () => {
  if (!configFormRef.value) return
  
  if (!currentConfig.value?.config_id) {
    ElMessage.error('配置ID不存在，无法更新')
    return
  }
  
  try {
    await configFormRef.value.validate()
    updateLoading.value = true
    
    const configData = {
      pdf_file_company_name: configForm.pdf_file_company_name,
      pdf_title_company_name: configForm.pdf_title_company_name,
      products_per_row: configForm.products_per_row,
      pdf_background_image: configForm.pdf_background_image
    }
    
    const response = await pdfConfigApi.updatePdfConfig(currentConfig.value.config_id, configData)
    if (response.success) {
      ElMessage.success('更新配置成功')
      await loadPdfConfig()
    } else {
      ElMessage.error(response.message || '更新配置失败')
    }
  } catch (error) {
    if (error.message && !error.message.includes('validation')) {
      ElMessage.error(error.message || '更新配置失败')
    }
  } finally {
    updateLoading.value = false
  }
}

// 删除配置
const handleDeleteConfig = async () => {
  try {
    await ElMessageBox.confirm(
      '确认删除PDF配置吗？删除后需要重新创建配置才能使用PDF导出功能。',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    deleteLoading.value = true
    const response = await pdfConfigApi.deletePdfConfig(currentConfig.value.config_id)
    if (response.success) {
      ElMessage.success('删除配置成功')
      currentConfig.value = null
      await loadPdfConfig()
    } else {
      ElMessage.error(response.message || '删除配置失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除配置失败')
    }
  } finally {
    deleteLoading.value = false
  }
}

// 图片上传相关
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!')
    return false
  }
  return false // 阻止自动上传
}

const handleImageChange = (file, fileList) => {
  if (fileList.length > 0) {
    configForm.pdf_background_image = file.raw
  } else {
    configForm.pdf_background_image = null
  }
}

const handleImageRemove = () => {
  configForm.pdf_background_image = null
}

const handleCreateImageChange = (file, fileList) => {
  if (fileList.length > 0) {
    createForm.pdf_background_image = file.raw
  } else {
    createForm.pdf_background_image = null
  }
}

const handleCreateImageRemove = () => {
  createForm.pdf_background_image = null
}

// PDF文件管理相关
const pdfFiles = ref([])
const filesLoading = ref(false)
const deleteFilesLoading = ref(false)
const selectedFiles = ref([])
const filesPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 存储所有PDF文件数据（后端可能返回全部数据）
const allPdfFiles = ref([])
// 标记是否使用前端分页（true=前端分页，false=后端分页）
const useFrontendPagination = ref(false)

// 加载PDF文件列表
const loadPdfFiles = async () => {
  try {
    filesLoading.value = true
    const response = await pdfFilesApi.getPdfFiles(filesPagination.currentPage, filesPagination.pageSize)
    if (response.success) {
      // 如果返回的数据包含分页信息（后端已分页）
      if (response.data && typeof response.data === 'object' && 'items' in response.data) {
        pdfFiles.value = response.data.items || []
        filesPagination.total = response.data.total || 0
        allPdfFiles.value = [] // 后端分页时清空
        useFrontendPagination.value = false
      } else {
        // 后端返回全部数据，需要前端分页
        const allFiles = Array.isArray(response.data) ? response.data : []
        allPdfFiles.value = allFiles
        filesPagination.total = allFiles.length
        useFrontendPagination.value = true
        // 前端分页切片
        const start = (filesPagination.currentPage - 1) * filesPagination.pageSize
        const end = start + filesPagination.pageSize
        pdfFiles.value = allFiles.slice(start, end)
      }
    } else {
      ElMessage.error(response.message || '获取PDF文件列表失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '获取PDF文件列表失败')
  } finally {
    filesLoading.value = false
  }
}

// 分页变化处理
const handlePageChange = (page) => {
  filesPagination.currentPage = page
  if (useFrontendPagination.value && allPdfFiles.value.length > 0) {
    // 前端分页：从已加载的数据中切片
    const start = (page - 1) * filesPagination.pageSize
    const end = start + filesPagination.pageSize
    pdfFiles.value = allPdfFiles.value.slice(start, end)
  } else {
    // 后端分页：重新请求
    loadPdfFiles()
  }
}

// 每页数量变化处理
const handleSizeChange = (size) => {
  filesPagination.pageSize = size
  filesPagination.currentPage = 1
  if (useFrontendPagination.value && allPdfFiles.value.length > 0) {
    // 前端分页：从已加载的数据中切片
    const start = 0
    const end = start + size
    pdfFiles.value = allPdfFiles.value.slice(start, end)
  } else {
    // 后端分页：重新请求
    loadPdfFiles()
  }
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 下载单个文件
const handleDownloadFile = (file) => {
  downloadPdf(file.url, file.filename)
}

// 删除单个文件
const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确认删除文件 "${file.filename}" 吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    deleteFilesLoading.value = true
    const response = await pdfFilesApi.deletePdfFiles([file.filename])
    if (response.success) {
      ElMessage.success('删除文件成功')
      // 从本地数据中移除已删除的文件
      const index = allPdfFiles.value.findIndex(f => f.filename === file.filename)
      if (index !== -1) {
        allPdfFiles.value.splice(index, 1)
        filesPagination.total--
      }
      // 如果当前页删除后没有数据了，且不是第一页，则回到上一页
      const currentPageItems = pdfFiles.value.length
      if (currentPageItems === 1 && filesPagination.currentPage > 1) {
        filesPagination.currentPage--
      }
      // 重新计算当前页数据
      handlePageChange(filesPagination.currentPage)
      selectedFiles.value = []
    } else {
      ElMessage.error(response.message || '删除文件失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除文件失败')
    }
  } finally {
    deleteFilesLoading.value = false
  }
}

// 批量删除文件
const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }
  
  try {
    const filenames = selectedFiles.value.map(file => file.filename)
    await ElMessageBox.confirm(
      `确认删除选中的 ${filenames.length} 个文件吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    deleteFilesLoading.value = true
    const response = await pdfFilesApi.deletePdfFiles(filenames)
    if (response.success) {
      ElMessage.success('删除文件成功')
      // 从本地数据中移除已删除的文件
      filenames.forEach(filename => {
        const index = allPdfFiles.value.findIndex(f => f.filename === filename)
        if (index !== -1) {
          allPdfFiles.value.splice(index, 1)
          filesPagination.total--
        }
      })
      // 如果当前页删除后没有数据了，且不是第一页，则回到上一页
      const currentPageItems = pdfFiles.value.length
      const deletedCount = selectedFiles.value.length
      if (currentPageItems <= deletedCount && filesPagination.currentPage > 1) {
        filesPagination.currentPage--
      }
      // 重新计算当前页数据
      handlePageChange(filesPagination.currentPage)
      selectedFiles.value = []
    } else {
      ElMessage.error(response.message || '删除文件失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除文件失败')
    }
  } finally {
    deleteFilesLoading.value = false
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedFiles.value = selection
}

// 初始化
onMounted(() => {
  loadCategories()
  loadPdfConfig()
  loadPdfFiles()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.page-content {
  height: calc(100% - 80px);
}

.pdf-tabs {
  height: 100%;
}

.pdf-tabs :deep(.el-tabs__content) {
  height: calc(100% - 55px);
  overflow-y: auto;
}

.content-card {
  height: 100%;
}

.export-section {
  padding: 20px 0;
}

.section-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.section-desc {
  margin: 0 0 16px 0;
  color: #909399;
  font-size: 14px;
}

.config-section {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-content {
  max-width: 800px;
}

.loading-container {
  padding: 20px;
}

.empty-config {
  padding: 40px 0;
  text-align: center;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-image {
  margin-top: 16px;
}

.current-image p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.files-section {
  padding: 20px;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.files-actions {
  display: flex;
  gap: 10px;
}

.files-table-container {
  margin-top: 20px;
}

.filename-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.files-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.files-info {
  color: #909399;
  font-size: 14px;
}

.files-pagination {
  margin: 0;
}

.empty-files {
  padding: 40px 0;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-content {
    max-width: 100%;
  }
  
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .files-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .files-actions {
    width: 100%;
    flex-direction: column;
  }

  .files-actions .el-button {
    width: 100%;
  }

  .files-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .files-pagination {
    width: 100%;
    justify-content: center;
  }
}
</style>
