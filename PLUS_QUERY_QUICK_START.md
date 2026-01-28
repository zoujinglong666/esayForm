# PlusQuery 快速开始指南

## 📋 概述

本指南将帮助您快速了解和使用 PlusQuery 组件的完整示例。示例包含了基础用法、高级功能、复合表单、验证规则等各种场景。

## 🚀 快速启动

### 1. 查看示例页面

启动项目后，您可以通过以下路径访问示例：

- **基础示例**: `/plus-query-demo`
- **高级示例**: `/plus-query-demo/advanced`

### 2. 文件结构

```bash
src/views/plus-query-demo/
├── index.vue                 # 基础示例 - 员工查询系统演示
├── advanced.vue             # 高级示例 - 各种高级功能演示
├── README.md               # 详细文档说明
└──

src/router/modules/
├── plus-query-demo.ts      # 路由配置
└──
```

## 📖 示例说明

### 基础示例 (`index.vue`)

**功能特点：**
- ✅ 多种表单控件（输入框、下拉框、日期范围、滑块、复选框、数字输入、开关）
- ✅ 响应式布局设计
- ✅ 查询结果展示表格
- ✅ 状态标签和格式化显示
- ✅ 事件处理和参数传递

**主要演示的控件类型：**
```typescript
// 文本输入
{
  label: '关键词',
  prop: 'keyword',
  valueType: 'input',
  placeholder: '请输入姓名或邮箱搜索'
}

// 下拉选择
{
  label: '状态',
  prop: 'status',
  valueType: 'select',
  options: [...]
}

// 日期范围
{
  label: '创建时间',
  prop: 'dateRange',
  valueType: 'date-picker',
  fieldProps: { type: 'daterange' }
}

// 滑块（范围选择）
{
  label: '薪资范围',
  prop: 'salaryRange',
  valueType: 'slider',
  fieldProps: { range: true }
}
```

### 高级示例 (`advanced.vue`)

**功能特点：**
- 🎨 自定义插槽实现
- 🔗 级联选择器
- ⚙️ 复合表单控件
- ✅ 表单验证规则
- 📋 参数导出功能
- 🎯 多表单实例

**高级功能演示：**

1. **自定义插槽**
   - 自定义输入框（带前后缀）
   - 日期时间范围选择器
   - 多级级联地区选择

2. **复合表单**
   - 字段组合（姓名邮箱 + 年龄范围）
   - 嵌套属性支持

3. **表单验证**
   - 邮箱格式验证
   - 手机号格式验证
   - URL格式验证
   - 字符长度验证
   - 数值范围验证

## 🔧 常用配置

### 基础配置

```vue
<PlusQuery
  v-model="queryParams"
  :columns="columns"
  label-width="100px"
  footer-align="left"
  submit-text="查询"
  @submit="handleSubmit"
/>
```

### 完整配置选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `v-model` | Object | - | 表单数据对象 |
| `:columns` | Array | [] | 列配置数组 |
| `:default-values` | Object | {} | 默认值 |
| `label-width` | String | '110px' | 标签宽度 |
| `label-position` | String | 'right' | 标签位置 |
| `footer-align` | String | 'left' | 底部对齐方式 |
| `:has-footer` | Boolean | true | 显示底部按钮 |
| `:has-reset` | Boolean | true | 显示重置按钮 |
| `submit-text` | String | '查询' | 提交按钮文本 |
| `reset-text` | String | '重置' | 重置按钮文本 |
| `:submit-loading` | Boolean | false | 提交加载状态 |

### 事件监听

```typescript
// 表单提交
const handleSubmit = (formData) => {
  console.log('提交数据:', formData)
  // 执行查询逻辑
}

// 字段变化
const handleChange = (formData, column) => {
  console.log('字段:', column.prop, '数据:', formData)
  // 实时处理逻辑
}

// 表单重置
const handleReset = (formData) => {
  console.log('重置数据:', formData)
  // 重置相关状态
}
```

## 🎯 核心概念

### 1. Column 配置

每条 `column` 定义对应一个表单项：

```typescript
interface Column {
  label: string           // 显示标签
  prop: string           // 字段名
  valueType: string      // 控件类型
  placeholder?: string   // 占位符
  options?: Array        // 选项数据
  fieldProps?: Object    // 表单项属性
  rules?: Array          // 验证规则
  required?: boolean     // 是否必填
}
```

### 2. 支持的 valueType

- `'input'` - 文本输入框
- `'textarea'` - 多行文本
- `'select'` - 下拉选择
- `'radio'` - 单选按钮
- `'checkbox'` - 复选框
- `'date-picker'` - 日期选择器
- `'time-picker'` - 时间选择器
- `'slider'` - 滑块
- `'switch'` - 开关
- `'input-number'` - 数字输入框
- `'color-picker'` - 颜色选择器
- `'rate'` - 评分
- `'cascader'` - 级联选择器
- `'plus-input-tag'` - 标签输入

### 3. 选项数据格式

```typescript
const options = [
  {
    label: '显示文本',
    value: '实际值',
    type?: 'success' | 'warning' | 'danger' | 'info', // 状态类型
    color?: '#ff0000', // 自定义颜色
    disabled?: false   // 是否禁用
  }
]
```

## 📚 开发指南

### 集成到现有项目

1. **复制组件文件**
   ```bash
   # 复制示例文件到您的项目
   cp -r src/views/plus-query-demo/ your-project/src/views/
   cp src/router/modules/plus-query-demo.ts your-project/src/router/modules/
   ```

2. **注册路由**
   ```typescript
   // 在主路由文件中添加
   import plusQueryDemoRoutes from './modules/plus-query-demo'

   const routes = [
     // ... 其他路由
     ...plusQueryDemoRoutes
   ]
   ```

3. **自定义配置**
   ```typescript
   // 根据您的项目需求调整列配置
   const myColumns = [
     {
       label: '产品名称',
       prop: 'productName',
       valueType: 'input'
     },
     // ... 更多字段
   ]
   ```

### 样式自定义

```scss
// 覆盖默认样式
.plus-query-demo {
  .el-form--inline {
    .el-form-item {
      margin-right: 20px;
    }
  }

  .el-card {
    border-radius: 8px;
  }
}
```

### 主题适配

修改 Element Plus 主题变量：

```scss
// variables.scss
:root {
  --el-color-primary: #409eff;
  --el-text-color-primary: #303133;
  --el-border-color: #dcdfe6;
}
```

## 🔍 调试技巧

### 1. 查看当前参数

示例中提供了参数展示区域，实时显示当前表单数据：

```vue
<pre>{{ JSON.stringify(queryParams, null, 2) }}</pre>
```

### 2. 控制台输出

所有事件都会在控制台输出详细信息：

```typescript
const handleSubmit = (formData) => {
  console.log('查询参数:', formData)
  // 实际业务逻辑
}
```

### 3. 表单验证调试

```typescript
// 查看验证错误
const handleSubmitError = (errors) => {
  console.log('验证错误:', errors)
  // 处理错误显示
}
```

## 🚨 常见问题

### Q1: 如何添加新的表单项？

```typescript
// 在 columns 数组中添加新对象
const newColumn = {
  label: '新字段',
  prop: 'newField',
  valueType: 'input',
  placeholder: '请输入新字段值'
}

columns.value.push(newColumn)
```

### Q2: 如何动态更新选项？

```typescript
// 使用计算属性或方法
const dynamicOptions = computed(() => {
  return apiData.value.map(item => ({
    label: item.name,
    value: item.id
  }))
})

// 或者在列配置中使用函数
{
  options: (column) => fetchOptionsFor(column.prop)
}
```

### Q3: 如何实现条件显示字段？

```typescript
const filteredColumns = computed(() => {
  return allColumns.value.filter(column => {
    // 根据条件过滤
    if (column.prop === 'advancedField') {
      return showAdvanced.value
    }
    return true
  })
})
```

### Q4: 如何自定义验证规则？

```typescript
const customRule = {
  label: '自定义字段',
  prop: 'custom',
  rules: [
    {
      validator: (rule, value, callback) => {
        if (!isValid(value)) {
          callback(new Error('验证失败'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
```

## 📈 性能优化建议

### 1. 减少响应式开销

```typescript
// ✅ 推荐：使用 shallowRef
import { shallowRef } from 'vue'
const columns = shallowRef<PlusColumn[]>([])

// ❌ 避免：频繁创建新数组
const badExample = () => {
  columns.value = [...columns.value, newColumn] // 触发完全重新渲染
}
```

### 2. 合理使用计算属性

```typescript
// ✅ 推荐：缓存计算结果
const processedOptions = computed(() => {
  return rawOptions.value.map(process)
})

// ❌ 避免：在模板中执行复杂计算
// <PlusQuery :columns="complexCalculation()" />
```

### 3. 虚拟滚动优化（大数据量）

```typescript
// 对于大量选项，考虑分页或虚拟滚动
const paginatedOptions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allOptions.value.slice(start, end)
})
```

## 🎨 UI/UX 最佳实践

### 1. 合理的标签宽度

```vue
<!-- 根据内容调整标签宽度 -->
<PlusQuery label-width="120px" />
<!-- 或使用自适应 -->
<PlusQuery :label-width="autoLabelWidth" />
```

### 2. 一致的按钮文案

```vue
<!-- 统一使用中文或英文 -->
<PlusQuery
  submit-text="搜索"
  reset-text="重置"
/>
```

### 3. 清晰的占位符提示

```typescript
const goodPlaceholder = {
  keyword: '请输入姓名、邮箱或工号',
  status: '请选择员工状态',
  dateRange: '选择入职时间范围'
}
```

### 4. 合理的默认值

```typescript
const smartDefaults = {
  status: '',           // 空值表示全部
  dateRange: [          // 最近30天
    getLastMonth(),
    getToday()
  ],
  active: true          // 默认为激活状态
}
```

## 📞 获取帮助

### 查看示例代码

```bash
# 基础用法
cat src/views/plus-query-demo/index.vue

# 高级功能
cat src/views/plus-query-demo/advanced.vue

# 详细说明
cat src/views/plus-query-demo/README.md
```

### 调试信息

- 查看浏览器控制台输出
- 使用 Vue DevTools 检查组件状态
- 查看网络请求（如果有API调用）

### 文档资源

- [Element Plus 官方文档](https://element-plus.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [PlusTable 类型定义](../src/components/PlusTable/types/)

---

## 🎉 下一步

1. **运行示例**: 启动项目查看实际效果
2. **修改配置**: 根据您的需求调整表单字段
3. **集成业务**: 将查询表单集成到您的实际业务中
4. **扩展功能**: 基于示例添加更多自定义功能

祝您使用愉快！如有问题，欢迎随时查看示例代码或参考相关文档。
