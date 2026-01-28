<!--
可编辑表格组件示例
-->
<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import { EditableTable } from '@/components/PlusEditableTable'
import type { CellChangeEvent, EditEndEvent, EditStartEvent, EditableColumn, ValidateErrorEvent } from '@/components/PlusEditableTable'

// 示例数据
const tableData = ref([
  {
    id: 1,
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com',
    status: 1,
    birthDate: '1998-05-15'
  },
  {
    id: 2,
    name: '李四',
    age: 28,
    email: 'lisi@example.com',
    status: 0,
    birthDate: '1995-08-20'
  },
  {
    id: 3,
    name: '王五',
    age: 30,
    email: 'wangwu@example.com',
    status: 1,
    birthDate: '1993-12-10'
  }
])

// 表格列配置
const columns: EditableColumn[] = [
  {
    prop: 'name',
    label: '姓名',
    width: 120,
    editable: true,
    editType: 'input',
    rules: [
      { required: true, message: '请输入姓名' },
      { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符' }
    ] as any
  },
  {
    prop: 'age',
    label: '年龄',
    width: 100,
    editable: true,
    editType: 'number',
    fieldProps: {
      min: 0,
      max: 120
    },
    rules: [
      { required: true, message: '请输入年龄' }
    ] as any
  },
  {
    prop: 'email',
    label: '邮箱',
    width: 220,
    editable: true,
    editType: 'input',
    rules: [
      { required: true, message: '请输入邮箱' },
      {
        validator: (_rule: any, value: any, callback: any) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            callback(new Error('请输入有效的邮箱地址'))
          } else {
            callback()
          }
        }
      }
    ] as any
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    editable: true,
    editType: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ],
    formatter: (row: any, column: any) => {
      const option = column.options?.find((opt: any) => opt.value === row[column.prop])
      return String(option ? option.label : row[column.prop])
    },
    rules: [{ required: true, message: '请选择状态' }] as any
  },
  {
    prop: 'birthDate',
    label: '出生日期',
    width: 160,
    editable: true,
    editType: 'date',
    rules: [{ required: true, message: '请选择出生日期' }] as any
  },
  {
    prop: 'description',
    label: '描述',
    width: 200,
    editable: false,
    formatter: (row: any) => row.description || '暂无描述'
  }
]

// 表格配置
const tableConfig = {
  editable: true,
  border: true,
  stripe: true,
  showIndex: true,
  height: 500,
  rowKey: 'id',
  validateOnInput: true,
  clickOutsideToSave: true,
  alwaysEditable: false
}

// 表格引用
const editableTableRef = ref<any>(null)

// 操作方法
const handleValidateAll = async () => {
  try {
    const isValid = await editableTableRef.value?.validateAll?.()
    if (isValid) {
      ElMessage.success('校验通过')
    } else {
      ElMessage.warning('请修正错误后重试')
    }
    return Boolean(isValid)
  } catch (error) {
    ElMessage.error('校验失败')
    return false
  }
}

// 添加数据
const handleAddRow = () => {
  editableTableRef.value.addRow({
    id: Date.now(),
    name: '',
    age: null,
    email: '',
    status: 1,
    birthDate: ''
  })
}

// 删除数据
const handleRemoveLast = () => {
  if (tableData.value.length > 0) {
    const lastIndex = tableData.value.length - 1
    editableTableRef.value?.removeRow?.(lastIndex)
  }
}

// 编辑所有
const handleEditAll = () => {
  editableTableRef.value?.startEditAll?.()
}

// 开始编辑指定单元格
const handleEditCell = () => {
  if (tableData.value.length > 0) {
    editableTableRef.value?.startEdit?.(0, 'name')
  }
}

// 获取数据
const handleGetData = () => {
  const data = editableTableRef.value?.getData?.() ?? []
  console.log('表格数据:', data)
  ElMessageBox.alert(JSON.stringify(data, null, 2), '表格数据', {
    confirmButtonText: '确定'
  })
}

// 重置数据
const handleResetData = () => {
  tableData.value = [
    {
      id: 1,
      name: '张三',
      age: 25,
      email: 'zhangsan@example.com',
      status: 1,
      birthDate: '1998-05-15'
    }
  ]
}

// 保存所有
const handleSaveAll = () => {
  editableTableRef.value?.saveAll?.()
  ElMessage.success('已保存')
}

// 取消所有编辑
const handleCancelAll = () => {
  editableTableRef.value?.cancelAll?.()
  ElMessage.info('已取消编辑')
}

// 清空错误
const handleClearErrors = () => {
  editableTableRef.value?.clearErrors?.()
  ElMessage.info('已清空错误信息')
}

// 获取指定单元格值
const handleGetCell = () => {
  const value = editableTableRef.value?.getCellValue?.(0, 'name')
  ElMessage.info(`第1行姓名为: ${value}`)
}

// 设置指定单元格值
const handleSetCell = () => {
  editableTableRef.value?.setCellValue?.(0, 'name', '李四')
  ElMessage.success('已设置单元格值')
}

// 插入行
const handleInsertRow = () => {
  editableTableRef.value?.insertRow?.(1, {
    id: Date.now(),
    name: '新员工',
    age: 30,
    email: 'new@example.com',
    status: 1,
    birthDate: '1993-01-01'
  })
  ElMessage.success('已插入新行')
}

// 事件处理
const handleCellChange = (event: CellChangeEvent) => {
  console.log('单元格变化:', event)
}

const handleEditStart = (event: EditStartEvent) => {
  console.log('开始编辑:', event)
}

const handleEditEnd = (event: EditEndEvent) => {
  console.log('结束编辑:', event)
}

const handleValidateError = (event: ValidateErrorEvent) => {
  console.log('校验错误:', event)
}

// 自定义插槽展示 - alwaysEditable 模式
const customTableData = ref([
  {
    id: 1,
    title: '任务1',
    priority: 'high',
    tags: ['重要', '紧急']
  }
])

const customColumns: EditableColumn[] = [
  {
    prop: 'title',
    label: '任务标题',
    width: 200,
    editable: true,
    editType: 'input'
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 120,
    editable: true,
    editType: 'select',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' }
    ],
    formatter: (row: any, column: any) => {
      const map = { high: '高', medium: '中', low: '低' }
      const key = row[column.prop] as keyof typeof map
      return map[key] || String(row[column.prop])
    }
  },
  {
    prop: 'tags',
    label: '标签',
    width: 200,
    editable: true,
    editType: 'custom'
  }
]
</script>

<template>
  <div class="editable-table-demo">
    <el-card class="demo-section">
      <template #header>
        <div class="card-header">
          <span>基础可编辑表格 - 点击单元格进行编辑</span>
          <div class="button-group">
            <el-button type="primary" size="small" @click="handleAddRow">
              添加行
            </el-button>
            <el-button type="danger" size="small" @click="handleRemoveLast">
              删除最后一行
            </el-button>
            <el-button type="success" size="small" @click="handleValidateAll">
              校验所有
            </el-button>
            <el-button type="info" size="small" @click="handleGetData">
              获取数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 基础表格 -->
      <EditableTable
        ref="editableTableRef"
        v-model="tableData"
        :columns="columns"
        v-bind="tableConfig"
        @cell-change="handleCellChange"
        @edit-start="handleEditStart"
        @edit-end="handleEditEnd"
        @validate-error="handleValidateError"
      />

      <!-- 操作按钮 -->
      <div class="button-row">
        <el-button type="primary" @click="handleEditAll">开始编辑</el-button>
        <el-button @click="handleEditCell">编辑(0, name)</el-button>
        <el-button @click="handleGetCell">获取单元格值</el-button>
        <el-button @click="handleSetCell">设置单元格值</el-button>
        <el-button @click="handleInsertRow">插入行</el-button>
        <el-button @click="handleSaveAll">保存所有</el-button>
        <el-button @click="handleCancelAll">取消所有</el-button>
        <el-button @click="handleClearErrors">清空错误</el-button>
        <el-button @click="handleResetData">重置数据</el-button>
      </div>

      <!-- 数据显示 -->
      <div class="data-preview">
        <el-descriptions title="当前数据" :column="3" border>
          <el-descriptions-item label="总行数">
            {{ tableData.length }}
          </el-descriptions-item>
          <el-descriptions-item label="是否有效">
            {{ editableTableRef?.value?.isValid?.() ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="当前编辑">
            {{
              editableTableRef?.value?.getEditingCell?.()
                ? JSON.stringify(editableTableRef.value.getEditingCell())
                : '无'
            }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- alwaysEditable 模式 -->
    <el-card class="demo-section">
      <template #header>
        <span>Always Editable 模式 - 持续编辑状态</span>
      </template>

      <EditableTable
        v-model="customTableData"
        :columns="customColumns"
        :always-editable="true"
        editable
        border
        show-index
      >
        <!-- 自定义编辑器插槽 -->
        <template #edit-cell-tags="{ modelValue, onUpdate }">
          <el-input-tag
            :model-value="modelValue"
            @update:model-value="onUpdate"
            placeholder="请输入标签"
          />
        </template>

        <!-- 自定义展示插槽 -->
        <template #view-cell-tags="{ row }">
          <el-space>
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </el-space>
        </template>
      </EditableTable>
    </el-card>

    <el-card class="demo-section">
      <template #header>
        <span>功能说明</span>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="内存管理">
          ✅ 使用 rowKey 替代 rowIndex 管理 ref，彻底解决删除行导致的内存泄漏
        </el-descriptions-item>
        <el-descriptions-item label="类型安全">
          ✅ 返回 ComponentPublicInstance 类型，提供完整的类型提示
        </el-descriptions-item>
        <el-descriptions-item label="定时器管理">
          ✅ 自动清理所有 setTimeout，避免组件卸载后报错
        </el-descriptions-item>
        <el-descriptions-item label="校验体系">
          ✅ 拆分为 isCellValidSync(同步) 和 validateCellAsync(异步)，避免误导
        </el-descriptions-item>
        <el-descriptions-item label="可编辑列管理">
          ✅ 自动清理 inputRefs，支持动态增删行
        </el-descriptions-item>
        <el-descriptions-item label="虚拟滚动">
          ✅ 完全兼容 el-table-v2 虚拟滚动，支持大数据量场景
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.editable-table-demo {
  .demo-section {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .button-group {
      display: flex;
      gap: 8px;
    }
  }

  .button-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
  }

  .data-preview {
    margin-top: 16px;
  }
}
</style>
