# PlusQuery 组件完整示例

## 组件概述

PlusQuery 是一个功能强大的查询表单组件，基于 Element Plus 的 ElForm 组件封装而来。它提供了丰富的表单控件支持和灵活的配置选项，适用于各种复杂的查询场景。

## 主要功能特点

### 🎯 **核心功能**
- ✅ 支持多种表单控件类型（input、select、date-picker、slider 等）
- ✅ 内置表单验证机制
- ✅ 支持自定义插槽和渲染函数
- ✅ 响应式布局和自适应设计
- ✅ 国际化支持

### 🛠 **高级特性**
- 🔧 复合表单控件（组合多个表单项）
- 🎨 主题样式自定义
- 📱 移动端适配
- 🚀 性能优化（懒加载、缓存等）
- 💾 状态持久化支持

## 基本用法

### 1. 简单查询表单

```vue
<template>
  <PlusQuery
    v-model="queryParams"
    :columns="queryColumns"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref } from 'vue'
import { PlusQuery } from '@/components/PlusQuery'
import type { PlusColumn } from '@/components/PlusTable/types'

const queryParams = ref({
  keyword: '',
  status: '',
  dateRange: []
})

const queryColumns = ref<PlusColumn[]>([
  {
    label: '关键词',
    prop: 'keyword',
    valueType: 'input',
    placeholder: '请输入关键词'
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  }
])

const handleSubmit = (formData) => {
  console.log('查询参数:', formData)
}
</script>
```

### 2. 支持的表单控件类型

| 类型 | 值 | 说明 |
|------|-----|------|
| 文本输入 | `'input'` | 单行文本输入框 |
| 多行文本 | `'textarea'` | 多行文本输入框 |
| 数字输入 | `'input-number'` | 数字输入框 |
| 下拉选择 | `'select'` | 下拉选择框 |
| 单选框 | `'radio'` | 单选按钮组 |
| 复选框 | `'checkbox'` | 复选框组 |
| 日期选择 | `'date-picker'` | 日期选择器 |
| 时间选择 | `'time-picker'` | 时间选择器 |
| 时间选择 | `'time-select'` | 时间下拉选择 |
| 滑块 | `'slider'` | 滑动条 |
| 开关 | `'switch'` | 开关按钮 |
| 颜色选择 | `'color-picker'` | 颜色选择器 |
| 评分 | `'rate'` | 星级评分 |
| 穿梭框 | `'transfer'` | 左右穿梭选择 |
| 级联选择 | `'cascader'` | 级联选择器 |
| 标签输入 | `'plus-input-tag'` | 标签输入组件 |

## 高级配置

### 1. 列配置选项

```typescript
interface PlusColumn {
  // 基础属性
  label: string                      // 标签文本
  prop: string                       // 字段名
  valueType: FormItemValueType      // 控件类型

  // 显示控制
  hideInForm?: boolean              // 是否在表单中隐藏
  order?: number                    // 排序权重

  // 选项数据（select、radio、checkbox 等）
  options?: OptionsRow[]            // 选项列表

  // 验证规则
  required?: boolean                // 是否必填
  rules?: FormItemRule[]           // 验证规则

  // 自定义属性
  fieldProps?: any                  // 传递给表单项组件的属性
  formItemProps?: any               // 传递给 el-form-item 的属性
  colProps?: any                   // 传递给 el-col 的属性

  // 自定义渲染
  renderField?: Function           // 自定义字段渲染
  renderLabel?: Function           // 自定义标签渲染
  renderExtra?: Function          // 自定义额外内容渲染

  // 插槽配置
  fieldSlots?: Record<string, Function>  // 字段插槽

  // 复合表单支持
  children?: PlusColumn           // 子表单项
}
```

### 2. 组件属性配置

```vue
<PlusQuery
  v-model="queryParams"
  :columns="columns"

  <!-- 标签配置 -->
  :has-label="true"
  label-width="100px"
  label-position="right"
  label-suffix=":"

  <!-- 布局配置 -->
  footer-align="left"

  <!-- 按钮配置 -->
  :has-footer="true"
  :has-reset="true"
  submit-text="查询"
  reset-text="重置"
  :submit-loading="loading"

  <!-- 事件监听 -->
  @submit="handleSubmit"
  @reset="handleReset"
  @change="handleChange"
/>
```

## 示例详解

### 示例 1：基础员工查询

**功能特点：**
- 多种表单控件组合
- 响应式布局
- 实时搜索提示
- 查询结果展示

**主要配置：**

```typescript
const queryColumns = [
  {
    label: '关键词',
    prop: 'keyword',
    valueType: 'input',
    placeholder: '请输入姓名或邮箱搜索',
    fieldProps: {
      clearable: true,
      showWordLimit: true
    }
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'select',
    options: [
      { label: '在职', value: 'active' },
      { label: '离职', value: 'inactive' }
    ]
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    valueType: 'date-picker',
    fieldProps: {
      type: 'daterange',
      format: 'YYYY-MM-DD'
    }
  }
  // ... 更多字段
]
```

### 示例 2：高级复合查询

**功能特点：**
- 自定义插槽实现
- 复合表单控件
- 级联选择器
- 表单验证
- 参数导出

**高级配置：**

```vue
<!-- 自定义字段插槽 -->
<template #field-customField="{ modelValue, onUpdate }">
  <el-input
    :model-value="modelValue"
    @update:model-value="onUpdate"
  >
    <template #prepend>
      <el-icon><Search /></el-icon>
    </template>
  </el-input>
</template>

<!-- 级联选择器 -->
<template #field-regionCascade="{ modelValue, onUpdate }">
  <el-cascader
    :model-value="modelValue"
    :options="regionOptions"
    :props="{ multiple: true }"
    @update:model-value="onUpdate"
  />
</template>
```

### 示例 3：表单验证查询

**功能特点：**
- 多种验证规则
- 实时验证反馈
- 错误提示优化

**验证配置：**

```typescript
const validationColumns = [
  {
    label: '邮箱地址',
    prop: 'email',
    valueType: 'input',
    required: true,
    rules: [
      { required: true, message: '邮箱不能为空' },
      { type: 'email', message: '邮箱格式不正确' }
    ]
  },
  {
    label: '手机号码',
    prop: 'phone',
    valueType: 'input',
    rules: [
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
    ]
  }
]
```

## 事件说明

### 主要事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `submit` | formData: object | 表单提交时触发 |
| `reset` | formData: object | 表单重置时触发 |
| `change` | formData: object, column: PlusColumn | 字段值变化时触发 |
| `submitError` | errors: any | 提交验证失败时触发 |
| `validate` | ...args: any[] | 表单验证时触发 |

### 使用示例

```typescript
// 提交处理
const handleSubmit = (formData) => {
  console.log('查询参数:', formData)
  // 执行查询逻辑
}

// 字段变化处理
const handleChange = (formData, column) => {
  console.log('字段变化:', column.prop, formData)

  // 根据字段类型特殊处理
  switch (column.prop) {
    case 'status':
      // 状态变化逻辑
      break
    case 'dateRange':
      // 日期范围变化逻辑
      break
  }
}

// 重置处理
const handleReset = (formData) => {
  console.log('重置表单:', formData)
  // 重置相关状态
}
```

## 插槽使用

### 内置插槽

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `default` | - | 默认插槽 |
| `footer` | { handleReset, handleSubmit } | 自定义底部按钮 |
| `search-footer` | - | 查询表单底部内容 |
| `tooltip-icon` | - | 提示图标插槽 |

### 动态插槽

PlusQuery 支持基于字段名的动态插槽：

- `field-{prop}` - 字段插槽（如 `field-keyword`）
- `label-{prop}` - 标签插槽（如 `label-keyword`）
- `extra-{prop}` - 额外内容插槽（如 `extra-keyword`）

```vue
<!-- 字段插槽 -->
<template #field-status="{ modelValue, column, onUpdate }">
  <el-select
    :model-value="modelValue"
    @update:model-value="onUpdate"
  >
    <el-option
      v-for="option in column.options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<!-- 标签插槽 -->
<template #label-keyword="{ column }">
  <span>{{ column.label }} <el-icon><Search /></el-icon></span>
</template>
```

## 最佳实践

### 1. 性能优化

```typescript
// ✅ 推荐：使用 shallowRef 避免深度响应式
const queryColumns = shallowRef<PlusColumn[]>([
  // ... 配置
])

// ✅ 推荐：合理设置 order 进行排序
const columns = [
  { label: '关键词', prop: 'keyword', order: 1 },
  { label: '状态', prop: 'status', order: 2 }
]

// ❌ 避免：频繁更新 columns 配置
const updateColumns = () => {
  // 避免在方法中重新创建 columns 数组
}
```

### 2. 验证配置

```typescript
// ✅ 推荐：合理配置验证规则
const rules = [
  {
    label: '邮箱',
    prop: 'email',
    required: true,
    rules: [
      { required: true, message: '邮箱不能为空', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
  }
]

// ✅ 推荐：使用 trigger 优化验证时机
const triggers = {
  blur: '失去焦点时验证',
  change: '值变化时验证',
  all: '所有时机都验证'
}
```

### 3. 响应式设计

```css
/* ✅ 推荐：响应式断点处理 */
@media (max-width: 768px) {
  .el-form--inline .el-form-item {
    display: block;
    width: 100%;
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .plus-query-form {
    padding: 10px;
  }

  .el-card__body {
    padding: 15px;
  }
}
```

## 常见问题

### Q1: 如何动态更新选项数据？

```typescript
// 方法1：使用计算属性
const dynamicOptions = computed(() => {
  return departments.value.map(dept => ({
    label: dept.name,
    value: dept.id
  }))
})

// 方法2：使用函数返回选项
const getOptions = (column) => {
  return fetchOptions(column.prop)
}
```

### Q2: 如何实现条件显示/隐藏字段？

```typescript
const conditionalColumns = computed(() => {
  const columns = [...baseColumns]

  // 根据条件动态添加字段
  if (queryParams.value.showAdvanced) {
    columns.push(advancedField)
  }

  return columns
})
```

### Q3: 如何自定义表单验证？

```typescript
const customRules = [
  {
    label: '自定义字段',
    prop: 'custom',
    rules: [
      {
        validator: (rule, value, callback) => {
          if (!value || value.length < 3) {
            callback(new Error('最少输入3个字符'))
          } else if (!/^[a-zA-Z]+$/.test(value)) {
            callback(new Error('只能输入英文字母'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }
]
```

### Q4: 如何集成到表格组件？

```vue
<template>
  <div>
    <PlusQuery
      v-model="queryParams"
      :columns="queryColumns"
      @submit="handleQuery"
    />

    <PlusTable
      :data="tableData"
      :columns="tableColumns"
    />
  </div>
</template>

<script setup>
const handleQuery = async (formData) => {
  loading.value = true
  try {
    const { data } = await fetchTableData(formData)
    tableData.value = data
  } finally {
    loading.value = false
  }
}
</script>
```

## 进阶技巧

### 1. 表单状态管理

```typescript
// 使用 Pinia 管理表单状态
export const useQueryStore = defineStore('query', {
  state: () => ({
    params: {},
    history: []
  }),
  actions: {
    setParams(params) {
      this.params = params
      this.history.push({ ...params, timestamp: Date.now() })
    },
    saveToLocal() {
      localStorage.setItem('queryParams', JSON.stringify(this.params))
    },
    loadFromLocal() {
      const saved = localStorage.getItem('queryParams')
      if (saved) {
        this.params = JSON.parse(saved)
      }
    }
  }
})
```

### 2. 表单模板复用

```typescript
// 创建可复用的表单配置
export const createUserQueryColumns = () => {
  return [
    {
      label: '用户ID',
      prop: 'userId',
      valueType: 'input',
      fieldProps: { placeholder: '请输入用户ID' }
    },
    {
      label: '注册时间',
      prop: 'registerTime',
      valueType: 'date-picker',
      fieldProps: {
        type: 'daterange',
        format: 'YYYY-MM-DD'
      }
    }
  ]
}

// 在不同页面复用
const userQueryColumns = createUserQueryColumns()
const adminQueryColumns = createUserQueryColumns()
```

## 相关资源

- [Element Plus 表单文档](https://element-plus.org/zh-CN/component/form.html)
- [PlusTable 类型定义](../PlusTable/types/)
- [组件样式定制指南](../../styles/)
- [国际化配置指南](../../locales/)

---

通过以上示例和说明，您应该能够全面了解 PlusQuery 组件的功能和使用方法。如果您需要更多定制功能，建议查看组件源码或参考 Element Plus 的相关文档。
