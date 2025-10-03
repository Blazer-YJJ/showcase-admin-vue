<template>
  <div class="page-container">
    <div class="page-header">
      <h1>分类管理</h1>
      <p>管理系统商品分类，支持树状层级结构的增删改查操作</p>
      <p class="usage-tip">
        <el-icon><InfoFilled /></el-icon>
        提示：最多创建三级分类，有子分类的行（带小箭头图标）可以通过点击行任意位置展开/收起，三级分类不能添加子分类
      </p>
    </div>
    <div class="page-content">
      <el-card class="content-card">
        <!-- 操作栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="searchText"
              placeholder="搜索分类名称"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch" class="search-btn">
              搜索
            </el-button>
          </div>
          <div class="toolbar-right">
            <el-button type="success" @click="showAddDialog()" size="default" class="add-btn">
              <el-icon><Plus /></el-icon>
              添加一级分类
            </el-button>
            <el-button type="primary" @click="loadCategoryList" size="default">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
            <el-button 
              type="info" 
              @click="expandAll" 
              size="default"
              class="expand-btn"
              v-if="categoryTree.length > 0"
            >
              <el-icon><Operation /></el-icon>
              {{ isExpanded ? '收起全部' : '展开全部' }}
            </el-button>
          </div>
        </div>

        <!-- 分类树状表格 -->
        <el-table 
          ref="treeTableRef"
          :data="filteredCategoryTree" 
          v-loading="loading"
          element-loading-text="正在加载数据..."
          class="category-tree-table"
          row-key="category_id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="isExpanded"
          :expand-on-click-node="false"
          @row-click="handleRowClick"
          :row-class-name="getRowClass"
        >
          <el-table-column prop="category_id" label="分类ID" width="100" align="center">
            <template #default="{ row }">
              <span class="category-id">{{ row.category_id }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="分类名称" min-width="200" align="left">
            <template #default="{ row }">
              <div class="category-name-cell">
                  <span 
                    class="category-name-level"
                    :style="{ paddingLeft: `${(row.level - 1) * 20}px` }"
                  >
                    <el-icon 
                      class="category-icon"
                      :class="getCategoryIcon(row.level)"
                    >
                      <component :is="getLevelIcon(row)" />
                    </el-icon>
                    <span class="category-name">{{ row.name }}</span>
                    <el-icon 
                      v-if="getChildrenCount(row) > 0"
                      class="expand-hint-icon"
                    >
                      <ArrowRight />
                    </el-icon>
                  </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="level" label="层级" width="80" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getLevelTagType(row.level)" 
                size="small"
                class="level-tag"
              >
                {{ row.level }}级
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="children_count" label="子分类数" width="100" align="center">
            <template #default="{ row }">
              <span class="children-count">
                {{ getChildrenCount(row) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="created_at" label="创建时间" min-width="160" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ formatDateTime(row.created_at) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="updated_at" label="更新时间" min-width="160" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ formatDateTime(row.updated_at) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="240" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showEditDialog(row)"
                  class="action-btn"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
        <el-button 
          v-if="row.level < 3"
          type="success" 
          size="small" 
          @click="showAddChildDialog(row)"
          class="action-btn"
        >
          <el-icon><Plus /></el-icon>
          添加子分类
        </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleDelete(row)"
                  class="action-btn"
                  :disabled="getChildrenCount(row) > 0"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态提示 -->
        <el-empty v-if="!loading && categoryTree.length === 0" description="暂无分类数据">
          <el-button type="success" @click="showAddDialog()">
            <el-icon><Plus /></el-icon>
            添加第一个分类
          </el-button>
        </el-empty>
      </el-card>
    </div>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="父级分类" prop="parent_id" v-if="isAddChild">
          <el-select 
            v-model="formData.parent_id" 
            placeholder="请选择父级分类"
            disabled
            style="width: 100%"
          >
            <el-option 
              :label="parentCategoryInfo.name" 
              :value="parentCategoryInfo.category_id"
            />
          </el-select>
          <div class="form-help">
            当前将为"{{ parentCategoryInfo.name }}"添加子分类
          </div>
        </el-form-item>
        
        <el-form-item label="变更分类位置" prop="parent_id" v-if="isEdit && currentEditRow">
          <el-select 
            v-model="formData.parent_id" 
            placeholder="选择新的父级分类位置"
            clearable
            style="width: 100%"
          >
            <el-option-group label="一级分类">
              <el-option 
                label="作为一级分类" 
                :value="null"
              />
            </el-option-group>
            <el-option-group label="二级分类" v-if="parentCategoryOptions.length > 0">
              <el-option 
                v-for="parent in parentCategoryOptions" 
                :key="parent.category_id"
                :label="`${parent.name} (一级分类)`" 
                :value="parent.category_id"
                :disabled="parent.category_id === currentEditRow.category_id || isDescendant(parent, currentEditRow.category_id)"
              />
            </el-option-group>
            <el-option-group label="三级分类" v-if="grandParentCategoryOptions.length > 0">
              <el-option 
                v-for="child in grandParentCategoryOptions" 
                :key="child.category_id"
                :label="`${child.name} (二级分类)`" 
                :value="child.category_id"
                :disabled="child.category_id === currentEditRow.category_id || isDescendant(child, currentEditRow.category_id)"
              />
            </el-option-group>
          </el-select>
          <div class="form-help">
            <el-icon><InfoFilled /></el-icon>
            选择该分类的新父级位置，将影响分类的层级结构，最多支持三级分类
          </div>
        </el-form-item>
        
        <el-form-item label="分类名称" prop="name" required>
          <el-input
            v-model="formData.name"
            placeholder="请输入分类名称（最多100个字符）"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Edit, Delete, Operation, House, Collection, Goods, ArrowRight, InfoFilled } from '@element-plus/icons-vue'
import { categoryApi } from '../config/api.js'

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const categoryTree = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const isAddChild = ref(false)
const submitting = ref(false)
const formRef = ref()
const currentEditId = ref(null)
const currentEditRow = ref(null)
const isExpanded = ref(false)
const parentCategoryInfo = ref({ category_id: null, name: '' })
const treeTableRef = ref()
const expandedRows = ref(new Set())

// 表单数据
const formData = ref({
  name: '',
  parent_id: null
})

// 表单验证规则
const formRules = computed(() => ({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 100, message: '分类名称长度应在1-100个字符之间', trigger: 'blur' }
  ],
  parent_id: [
    {
      validator: (rule, value, callback) => {
        // 添加子分类时，验证层级限制
        if (isAddChild.value && parentCategoryInfo.value.category_id && 
            getCategoryLevel(parentCategoryInfo.value.category_id) >= 3) {
          callback(new Error('最多只能创建三级分类'))
        }
        
        // 编辑时验证层级限制
        if (isEdit.value && currentEditRow.value) {
          const newLevel = value ? getCategoryLevel(value) + 1 : 1
          if (newLevel > 3) {
            callback(new Error('分类层级不能超过三级'))
          }
        }
        
        callback()
      },
      trigger: 'change'
    }
  ]
}))

// 计算属性 - 对话框标题
const dialogTitle = computed(() => {
  if (isEdit.value) return '编辑分类'
  if (isAddChild.value) return '添加子分类'
  return '添加一级分类'
})

// 计算属性 - 过滤后的分类树
const filteredCategoryTree = computed(() => {
  return !searchText.value 
    ? categoryTree.value 
    : filterCategoryTree(categoryTree.value, searchText.value.toLowerCase())
})

// 一级分类选项（可用作父级）
const parentCategoryOptions = computed(() => {
  const flattenCategories = (categories, level = 1) => {
    let result = []
    categories.forEach(category => {
      if (category.level === level && level < 3) {
        result.push(category)
      }
      if (category.children && category.children.length > 0 && level < 3) {
        result = result.concat(flattenCategories(category.children, level + 1))
      }
    })
    return result
  }
  
  const candidates = flattenCategories(categoryTree.value, 1).filter(cat => cat.level < 3)
  return candidates.filter(cat => !currentEditRow.value || !isDescendant(cat, currentEditRow.value.category_id))
})

// 二级分类选项（可用作三级分类的父级）
const grandParentCategoryOptions = computed(() => {
  const flattenCategories = (categories, level = 1) => {
    let result = []
    categories.forEach(category => {
      if (category.level === level) {
        result.push(category)
      }
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1))
      }
    })
    return result
  }
  
  return flattenCategories(categoryTree.value, 2).filter(cat => 
    !currentEditRow.value || !isDescendant(cat, currentEditRow.value.category_id)
  )
})

// 递归过滤分类树
const filterCategoryTree = (categories, searchTerm) => {
  const result = []
  
  categories.forEach(category => {
    const categoryMatches = category.name.toLowerCase().includes(searchTerm)
    let filteredChildren = []
    
    // 递归过滤子分类
    if (category.children && category.children.length > 0) {
      filteredChildren = filterCategoryTree(category.children, searchTerm)
    }
    
    // 如果当前分类匹配或有子分类匹配，则包含此分类
    if (categoryMatches || filteredChildren.length > 0) {
      result.push({
        ...category,
        children: filteredChildren
      })
    }
  })
  
  return result
}

// 获取分类层级图标
const getLevelIcon = (category) => {
  switch (category.level) {
    case 1: return House
    case 2: return Collection
    case 3: return Goods
    default: return Collection
  }
}

// 获取分类图标样式类
const getCategoryIcon = (level) => {
  return `level-${level}-icon`
}

// 获取层级标签类型
const getLevelTagType = (level) => {
  switch (level) {
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'warning'
    default: return 'info'
  }
}

// 获取子分类数量
const getChildrenCount = (category) => {
  if (!category.children) return 0
  return category.children.length
}

// 检查是否是后代分类（防止循环引用）
const isDescendant = (category, targetId) => {
  if (category.category_id === targetId) return true
  
  if (category.children && category.children.length > 0) {
    return category.children.some(child => isDescendant(child, targetId))
  }
  
  return false
}

// 根据分类ID获取分类层级
const getCategoryLevel = (categoryId) => {
  const findCategoryById = (categories, id) => {
    for (const category of categories) {
      if (category.category_id === id) {
        return category
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryById(category.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  const category = findCategoryById(categoryTree.value, categoryId)
  return category ? category.level : 0
}

// 格式化时间显示
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 加载分类树
const loadCategoryList = async () => {
  try {
    loading.value = true
    const response = await categoryApi.getCategories()
    
    if (response.success) {
      categoryTree.value = response.data || []
    } else {
      ElMessage.error('获取分类列表失败')
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    ElMessage.error(error.message || '获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// getRowClass已经自动处理CSS类的添加，这里不需要额外的处理

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑通过计算属性自动处理
}

// 展开/收起全部
const expandAll = () => {
  isExpanded.value = !isExpanded.value
  
  // 遍历所有有子分类的节点
  const toggleAllNodes = (nodes) => {
    nodes.forEach(node => {
      const childrenCount = getChildrenCount(node)
      if (childrenCount > 0) {
        treeTableRef.value.toggleRowExpansion(node, isExpanded.value)
        
        // 递归处理子节点
        if (node.children) {
          toggleAllNodes(node.children)
        }
      }
    })
  }
  
  nextTick(() => {
    toggleAllNodes(filteredCategoryTree.value)
  })
}

// 使用行ID作为展开键
const getRowKey = (row) => {
  return row.category_id
}

// 获取行的CSS类
const getRowClass = (row) => {
  const childrenCount = getChildrenCount(row)
  return childrenCount > 0 ? 'has-children' : ''
}

// 展开/收起指定行
const toggleRowExpanded = (row) => {
  const rowKey = getRowKey(row)
  if (expandedRows.value.has(rowKey)) {
    // 收起
    expandedRows.value.delete(rowKey)
    if (treeTableRef.value) {
      treeTableRef.value.toggleRowExpansion(row, false)
    }
  } else {
    // 展开
    expandedRows.value.add(rowKey)
    if (treeTableRef.value) {
      treeTableRef.value.toggleRowExpansion(row, true)
    }
  }
}

// 处理行点击事件
const handleRowClick = async (row, column, event) => {
  // 检查是否点击的是操作按钮区域
  const target = event.target
  if (target.closest('.action-buttons') || 
      target.closest('.el-button') || 
      target.closest('.expand-btn') ||
      target.tagName === 'BUTTON' ||
      target.closest('button')) {
    return
  }
  
  // 如果有子分类，触发展开/收起
  const childrenCount = getChildrenCount(row)
  if (childrenCount > 0) {
    // 切换展开状态
    toggleRowExpanded(row)
  }
}

// 显示添加一级分类对话框
const showAddDialog = () => {
  isEdit.value = false
  isAddChild.value = false
  currentEditId.value = null
  parentCategoryInfo.value = { category_id: null, name: '' }
  formData.value = { name: '', parent_id: null }
  dialogVisible.value = true
}

// 显示添加子分类对话框
const showAddChildDialog = (parentCategory) => {
  // 检查是否可以添加子分类（限制三级）
  if (parentCategory.level >= 3) {
    ElMessage.warning('最多只能创建三级分类')
    return
  }
  
  isEdit.value = false
  isAddChild.value = true
  currentEditId.value = null
  parentCategoryInfo.value = {
    category_id: parentCategory.category_id,
    name: parentCategory.name
  }
  formData.value = { 
    name: '', 
    parent_id: parentCategory.category_id 
  }
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (category) => {
  isEdit.value = true
  isAddChild.value = false
  currentEditId.value = category.category_id
  currentEditRow.value = category
  formData.value = { 
    name: category.name,
    parent_id: category.parent_id
  }
  dialogVisible.value = true
}

// 取消对话框
const cancelDialog = () => {
  dialogVisible.value = false
  formData.value = { name: '', parent_id: null }
  isAddChild.value = false
  currentEditRow.value = null
  parentCategoryInfo.value = { category_id: null, name: '' }
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    if (isEdit.value) {
      // 更新分类
      const updateData = {
        name: formData.value.name,
        parent_id: formData.value.parent_id
      }
      
      // 如果parent_id没有变化，则不发送该字段
      if (currentEditRow.value && formData.value.parent_id === currentEditRow.value.parent_id) {
        delete updateData.parent_id
      }
      
      console.log('更新分类请求:', { id: currentEditId.value, data: updateData })
      const response = await categoryApi.updateCategory(currentEditId.value, updateData)
      console.log('更新分类响应:', response)
      
      if (response.success) {
        ElMessage.success('分类更新成功')
        await loadCategoryList()
        dialogVisible.value = false
      } else {
        ElMessage.error('分类更新失败')
      }
    } else {
      // 创建分类
      const response = await categoryApi.createCategory({
        name: formData.value.name,
        parent_id: formData.value.parent_id || null
      })
      
      if (response.success) {
        ElMessage.success('分类创建成功')
        await loadCategoryList()
        dialogVisible.value = false
      } else {
        ElMessage.error('分类创建失败')
      }
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 删除分类
const handleDelete = async (category) => {
  const childrenCount = getChildrenCount(category)
  
  if (childrenCount > 0) {
    ElMessage.warning('请先删除该分类下的所有子分类')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    loading.value = true
    const response = await categoryApi.deleteCategory(category.category_id)
    
    if (response.success) {
      ElMessage.success('分类删除成功')
      await loadCategoryList()
    } else {
      ElMessage.error('分类删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      ElMessage.error(error.message || '分类删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  background: #f5f7fa;
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

.usage-tip {
  margin-top: 8px !important;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  font-size: 13px;
  font-style: italic;
}

.page-content {
  height: calc(100% - 80px);
}

.content-card {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.search-input :deep(.el-input__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.search-input :deep(.el-input__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-btn {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
  border-radius: 6px;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.search-btn {
  border-radius: 6px;
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.expand-btn {
  border-radius: 6px;
  transition: all 0.3s;
}

.expand-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 树状表格样式 */
.category-tree-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-tree-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
}

.category-tree-table :deep(.el-table__header th) {
  background: transparent;
  border-bottom: 1px solid #e4e7ed;
  color: #606266;
  font-weight: 600;
  font-size: 14px;
}

.category-tree-table :deep(.el-table__row) {
  transition: all 0.3s;
}

.category-tree-table :deep(.el-table__row:hover) {
  background: #f8f9ff !important;
}

/* 有子分类的行样式 */
.category-tree-table :deep(.el-table__row.has-children) {
  background: rgba(64, 158, 255, 0.02);
  cursor: pointer;
}

.category-tree-table :deep(.el-table__row.has-children:hover) {
  background: rgba(64, 158, 255, 0.08) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

/* 没有子分类的行样式 */
.category-tree-table :deep(.el-table__row:not(.has-children)) {
  cursor: default;
}

.category-tree-table :deep(.el-table__body tr td) {
  border-bottom: 1px solid #f0f2f5;
  padding: 12px 0;
}

/* 树状结构样式 */
.category-name-cell {
  width: 100%;
}

.category-name-level {
  display: flex;
  align-items: center;
}

.category-icon {
  margin-right: 8px;
  transition: all 0.3s;
}

.category-icon.level-1-icon {
  color: #409eff;
  font-size: 16px;
}

.category-icon.level-2-icon {
  color: #67c23a;
  font-size: 14px;
}

.category-icon.level-3-icon {
  color: #e6a23c;
  font-size: 12px;
}

.category-name {
  color: #303133;
  font-weight: 500;
  transition: color 0.3s;
}

.category-name:hover {
  color: #409eff;
}

.expand-hint-icon {
  margin-left: 8px;
  color: #409eff;
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.3s;
}

.expand-hint-icon:hover {
  opacity: 1;
  transform: translateX(2px);
}

.category-id {
  color: #606266;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

/* 标签样式 */
.level-tag {
  font-weight: 500;
  border-radius: 8px;
}

/* 子分类计数样式 */
.children-count {
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.time-text {
  color: #909399;
  font-size: 13px;
  font-family: 'Courier New', monospace;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-btn {
  border-radius: 4px;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 12px;
  padding: 6px 10px;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.el-button--primary:hover {
  background: #337ecc;
  border-color: #337ecc;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.action-btn.el-button--success:hover {
  background: #529b2e;
  border-color: #529b2e;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.action-btn.el-button--danger:hover {
  background: #f56c6c;
  border-color: #f56c6c;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 对话框样式 */
.el-dialog {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.el-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #fafbff 0%, #f8f9ff 100%);
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.el-dialog :deep(.el-dialog__title) {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.el-dialog :deep(.el-dialog__body) {
  padding: 24px;
  background: #fff;
}

.el-dialog :deep(.el-dialog__footer) {
  background: #fafbff;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e4e7ed;
  padding: 16px 24px;
}

/* 表单样式 */
.el-form-item__label {
  color: #606266;
  font-weight: 500;
}

.el-input :deep(.el-input__inner) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.el-input :deep(.el-input__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.form-help {
  margin-top: 6px;
  font-size: 12px;
  color: #67c23a;
  font-style: italic;
}

/* 空状态样式 */
.el-empty {
  padding: 40px 0;
}

.el-empty :deep(.el-empty__description) {
  color: #909399;
  font-size: 14px;
}

/* 加载状态样式 */
.el-loading-mask {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.el-loading-spinner {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
  }
  
  .category-tree-table :deep(.el-table__cell) {
    padding: 8px 4px;
  }
  
  .action-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-card {
  animation: fadeInUp 0.6s ease-out;
}

.category-tree-table :deep(.el-table__row) {
  animation: fadeInUp 0.4s ease-out;
}

/* 滚动条样式 */
:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background: #c1c4cb;
  border-radius: 8px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: #f1f1f1;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}

/* 树状结构缩进动画 */
.category-name-level {
  transition: padding-left 0.3s ease;
}

/* 层级图标动画 */
.category-icon {
  transition: all 0.3s ease;
}

.category-icon:hover {
  transform: scale(1.2);
}
</style>