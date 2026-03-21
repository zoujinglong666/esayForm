# 基础数据管理方案 - 使用指南

## 📖 概述

本指南详细介绍了如何在实际项目中使用基础数据管理方案，包含完整的代码示例和最佳实践。

## 🎯 核心概念

### 什么是基础数据？

基础数据是指系统中相对稳定、使用频繁的配置数据，例如：

- **字典数据**：订单状态、用户状态、支付状态等
- **基础信息**：港口、国家、货币、船舶等
- **配置数据**：系统配置、业务规则等

### 为什么需要统一管理？

**问题场景：**

```typescript
// ❌ 混乱的现状

// 组件 A：直接调用 API
const res = await api.getDictList('ORDER_STATUS')
const statusList = res.data

// 组件 B：使用 hooks 但没有缓存
const { data } = useAllDict('ORDER_STATUS') // 每次都请求

// 组件 C：在 Vuex 中存储
store.dispatch('loadDictData', 'ORDER_STATUS')
const statusList = store.state.dict.ORDER_STATUS

// 组件 D：硬编码
const statusList = [
  { value: 1, label: '待处理' },
  { value: 2, label: '已完成' },
]
```

**导致的问题：**
- API 请求爆炸（同一个字典在多个组件中被重复请求）
- 数据不一致（硬编码的数据与后端不同步）
- 代码重复（格式化、查找 label 的逻辑到处都是）
- 类型缺失（没有 TypeScript 类型，IDE 无法提示）
- 维护困难（修改需要改多个地方）

## 🚀 快速开始

### 基础用法

#### 1. 下拉选择器

```vue
<template>
  <el-form-item label="订单状态">
    <el-select v-model="form.status" placeholder="请选择状态">
      <el-option
        v-for="item in statusOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDictType } from '~/composables/basicData'

const form = ref({
  status: ''
})

// 获取字典选项
const { options: statusOptions } = useDictType('ORDER_STATUS')
</script>
```

#### 2. 显示标签文本

```vue
<template>
  <div>
    <p>状态：{{ getStatusLabel(order.status) }}</p>
    <el-tag :type="getStatusType(order.status)">
      {{ getStatusLabel(order.status) }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { useDictType } from '~/composables/basicData'

const order = ref({
  status: 'completed'
})

const { getLabel: getStatusLabel } = useDictType('ORDER_STATUS')

function getStatusType(status: string) {
  const typeMap = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}
</script>
```

#### 3. 表格中使用

```vue
<template>
  <el-table :data="tableData">
    <el-table-column prop="orderNo" label="订单号" />
    <el-table-column label="状态">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ getStatusLabel(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="支付状态">
      <template #default="{ row }">
        {{ getPaymentStatusLabel(row.paymentStatus) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDictType } from '~/composables/basicData'

const tableData = ref([
  { orderNo: 'ORD001', status: 'pending', paymentStatus: 'unpaid' },
  { orderNo: 'ORD002', status: 'completed', paymentStatus: 'paid' },
])

const { getLabel: getStatusLabel } = useDictType('ORDER_STATUS')
const { getLabel: getPaymentStatusLabel } = useDictType('PAYMENT_STATUS')

function getStatusType(status: string) {
  // ... 类型映射逻辑
}
</script>
```

## 💼 实际场景

### 场景 1: 搜索选择器

```vue
<template>
  <el-select
    v-model="selectedPort"
    filterable
    remote
    :remote-method="handleSearch"
    :loading="loading"
    placeholder="搜索港口..."
    clearable
  >
    <el-option
      v-for="port in portOptions"
      :key="port.value"
      :label="port.label"
      :value="port.value"
    >
      <span>{{ port.label }}</span>
      <span style="color: #8492a6; font-size: 12px">
        ({{ port.value }})
      </span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePorts } from '~/composables/basicData'

const selectedPort = ref('')
const searchKeyword = ref('')

// 使用 computed 传递搜索参数
const searchParams = computed(() => ({
  keyword: searchKeyword.value,
  enabledOnly: true
}))

const { options: portOptions, loading } = usePorts(searchParams)

function handleSearch(query: string) {
  searchKeyword.value = query
}
</script>
```

### 场景 2: 联动选择

```vue
<template>
  <div>
    <el-select v-model="countryCode" placeholder="选择国家" @change="onCountryChange">
      <el-option
        v-for="country in countryOptions"
        :key="country.value"
        :label="country.label"
        :value="country.value"
      />
    </el-select>

    <el-select v-model="portCode" placeholder="选择港口" class="ml-2">
      <el-option
        v-for="port in filteredPortOptions"
        :key="port.value"
        :label="port.label"
        :value="port.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCountries, usePorts } from '~/composables/basicData'

const countryCode = ref('')
const portCode = ref('')

const { options: countryOptions, getByCode: getCountry } = useCountries()
const { data: portData } = usePorts()

// 根据国家过滤港口
const filteredPortOptions = computed(() => {
  if (!countryCode.value) return []

  return portData.value
    .filter(port => port.countryCode === countryCode.value)
    .map(port => ({
      label: port.nameCn,
      value: port.code
    }))
})

function onCountryChange() {
  portCode.value = '' // 重置港口选择
}
</script>
```

### 场景 3: 批量操作

```vue
<template>
  <div>
    <el-table :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column label="状态">
        <template #default="{ row }">
          {{ getStatusLabel(row.status) }}
        </template>
      </el-table-column>
    </el-table>

    <el-button type="primary" @click="batchUpdateStatus" :disabled="!hasSelection">
      批量更新状态
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDictType } from '~/composables/basicData'

const tableData = ref([
  { orderNo: 'ORD001', status: 'pending' },
  { orderNo: 'ORD002', status: 'pending' },
])

const selectedRows = ref([])
const { getLabel: getStatusLabel } = useDictType('ORDER_STATUS')

const hasSelection = computed(() => selectedRows.value.length > 0)

function handleSelectionChange(selection: any[]) {
  selectedRows.value = selection
}

function batchUpdateStatus() {
  // 批量更新逻辑
  ElMessage.success(`已更新 ${selectedRows.value.length} 条数据`)
}
</script>
```

### 场景 4: 表单验证

```vue
<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
    <el-form-item label="订单状态" prop="status">
      <el-select v-model="form.status" placeholder="请选择状态">
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDictType } from '~/composables/basicData'

const formRef = ref()
const form = reactive({
  status: ''
})

const { options: statusOptions } = useDictType('ORDER_STATUS')

// 自定义验证规则
const rules = {
  status: [
    { required: true, message: '请选择订单状态', trigger: 'change' },
    {
      validator: (rule: any, value: any, callback: any) => {
        // 某些状态下不允许提交
        if (value === 'cancelled') {
          callback(new Error('已取消的订单不允许修改'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

function submitForm() {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      console.log('表单提交', form)
    }
  })
}
</script>
```

## 🔧 高级用法

### 1. 自定义适配器

```typescript
// adapters.ts
export const CustomDataAdapter = {
  transform(response: any): BaseDataItem[] {
    const items = Array.isArray(response) ? response : response?.data || []

    return items.map((item: any) => ({
      code: item.customCode || item.id,
      nameCn: item.customName || item.name,
      nameEn: item.customNameEn || item.nameEn,
      enabled: item.enabled ?? item.isActive === true,
      // 添加自定义字段
      extraField: item.extraData,
      ...item,
    }))
  }
}
```

### 2. 自定义缓存策略

```typescript
// hooks.ts
export const useCustomData = createBaseDataHook(
  fetchCustomData,
  CustomDataAdapter.transform,
  {
    key: 'CUSTOM_DATA',
    ttl: 5 * 60 * 1000, // 5 分钟缓存
  }
)

// 使用时传递参数
const { options, data, loading } = useCustomData({
  keyword: search.value,
  enabledOnly: true,
})
```

### 3. 缓存预热

```typescript
// 在应用启动时预热数据
import { preloadBasicData } from '~/composables/basicData'
import { fetchPortList, fetchCountryList } from '~/composables/basicData/api'

// 在 main.ts 或 app.vue 中
async function initBasicData() {
  await Promise.all([
    preloadBasicData('PORTS', fetchPortList, { ttl: 600000 }),
    preloadBasicData('COUNTRIES', fetchCountryList, { ttl: 1800000 }),
  ])
}
```

### 4. 缓存清理

```typescript
import { clearAllBasicDataCache } from '~/composables/basicData'

// 在特定场景下清理缓存
function handleDataUpdate() {
  // 更新数据后清理缓存
  clearAllBasicDataCache()
  ElMessage.success('数据已更新')
}

// 或清理特定数据的缓存
const { clearCache } = useDictType('ORDER_STATUS')
function handleOrderStatusUpdate() {
  clearCache() // 只清理订单状态缓存
}
```

## 📊 性能优化

### 1. 避免重复请求

```typescript
// ❌ 错误：每次组件挂载都会请求
components.forEach(component => {
  const { options } = useDictType('ORDER_STATUS')
})

// ✅ 正确：共享数据
const { options: orderStatusOptions } = useDictType('ORDER_STATUS')
components.forEach(component => {
  // 直接使用 orderStatusOptions
})
```

### 2. 使用 computed 传递参数

```typescript
// ❌ 错误：每次 search 变化都会创建新的 Hook
const { options } = usePorts({
  keyword: search.value
})

// ✅ 正确：使用 computed
const searchParams = computed(() => ({
  keyword: search.value,
  enabledOnly: true
}))
const { options } = usePorts(searchParams)
```

### 3. 处理加载状态

```vue
<template>
  <div v-if="loading">
    <el-skeleton :rows="3" animated />
  </div>
  <div v-else>
    <el-select v-model="value">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { useDictType } from '~/composables/basicData'

const { options, loading } = useDictType('ORDER_STATUS')
</script>
```

## 🎨 最佳实践

### 1. 统一导入路径

```typescript
// ✅ 推荐：从统一入口导入
import {
  useDictType,
  usePorts,
  useCountries
} from '~/composables/basicData'

// ❌ 不推荐：从具体文件导入
import { useDictType } from '~/composables/basicData/useDict'
import { usePorts } from '~/composables/basicData/hooks'
```

### 2. 合理设置缓存时间

```typescript
// 变化频率高：短缓存
export const useOrderStatus = createBaseDataHook(
  fetchOrderStatus,
  OrderStatusAdapter.transform,
  { key: 'ORDER_STATUS', ttl: 5 * 60 * 1000 } // 5 分钟
)

// 变化频率低：长缓存
export const useCurrency = createBaseDataHook(
  fetchCurrency,
  CurrencyAdapter.transform,
  { key: 'CURRENCY', ttl: 60 * 60 * 1000 } // 1 小时
)
```

### 3. 错误处理

```typescript
const { options, loading, error } = useDictType('ORDER_STATUS')

watchEffect(() => {
  if (error.value) {
    console.error('加载字典失败', error.value)
    ElMessage.error('加载字典失败，请稍后重试')
  }
})
```

### 4. 类型安全

```typescript
// 确保类型安全
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

const { getLabel } = useDictType('ORDER_STATUS')
const statusLabel = getLabel('pending' as OrderStatus) // 类型安全
```

## 🐛 常见问题

### Q1: 数据没有更新？

**A:** 可能是缓存未过期，手动清除缓存：

```typescript
const { clearCache } = useDictType('ORDER_STATUS')
clearCache()
```

### Q2: 如何禁用缓存？

**A:** 设置较短的 TTL 或在请求后清除缓存：

```typescript
export const useRealTimeData = createBaseDataHook(
  fetchRealTimeData,
  RealTimeDataAdapter.transform,
  { key: 'REAL_TIME_DATA', ttl: 0 } // 不缓存
)
```

### Q3: 如何批量获取多个字典？

**A:** 使用 `useDictTypes`：

```typescript
import { useDictTypes } from '~/composables/basicData'

const { dictOptions, dictItems } = useDictTypes([
  'ORDER_STATUS',
  'USER_STATUS',
  'PAYMENT_STATUS'
])

const orderStatusOptions = dictOptions.value.ORDER_STATUS
```

## 📚 更多资源

- [基础数据管理示例页面](/src/views/feature_example/basic-data-management.vue)
- [完整 API 文档](/src/composables/basicData/README.md)
- [类型定义](/src/composables/basicData/types/index.ts)
