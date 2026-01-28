<template>
  <div class="plus-query-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>PlusQuery 完整示例</span>
          <el-button type="primary" @click="handleExport">导出查询结果</el-button>
        </div>
      </template>

      <!-- 查询表单 -->
      <PlusQuery
        v-model="queryParams"
        :columns="queryColumns"
        :default-values="defaultValues"
        label-width="100px"
        label-position="right"
        footer-align="left"
        :has-footer="true"
        :has-reset="true"
        submit-text="搜索"
        reset-text="重置"
        @submit="handleSubmit"
        @reset="handleReset"
        @change="handleChange"
      >

      <!-- 查询表单底部插槽 -->
      <template #search-footer>
        <div class="search-footer-tips">
          <el-icon><InfoFilled /></el-icon>
          <span>支持多条件组合查询，留空表示查询全部</span>
        </div>
      </template>
    </PlusQuery>

    <!-- 导航到高级示例 -->
    <div class="demo-navigation" style="margin-top: 20px;">
      <el-card>
        <template #header>
          <span>更多示例</span>
        </template>
        <div style="text-align: center;">
          <el-button
            type="primary"
            size="large"
            @click="navigateToAdvanced"
          >
            <el-icon style="margin-right: 8px;"><Setting /></el-icon>
            查看高级功能示例
          </el-button>
          <p style="color: #909399; font-size: 14px; margin-top: 10px;">
            包含自定义插槽、复合表单、验证规则等高级功能
          </p>
        </div>
      </el-card>
    </div>
    </el-card>

    <!-- 查询结果展示 -->
    <el-card class="demo-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>查询结果</span>
          <div class="result-actions">
            <el-tag type="info" effect="plain">
              共 {{ resultData.length }} 条记录
            </el-tag>
          </div>
        </div>
      </template>

      <el-table :data="resultData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="salary" label="薪资" width="120" align="right">
          <template #default="{ row }">
            <span>¥{{ row.salary?.toLocaleString() }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import PlusQuery from '@/components/PlusQuery/src/index.vue'
import type { PlusColumn } from '@/components/PlusTable/types'
import { InfoFilled, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 当前查询参数
const queryParams = ref({
  keyword: '',
  status: '',
  department: '',
  dateRange: [],
  salaryRange: [0, 100000],
  userType: [],
  age: 25,
  active: true
})

// 默认值
const defaultValues = {
  keyword: '',
  status: '',
  department: '',
  dateRange: [],
  salaryRange: [0, 100000],
  userType: [],
  age: 25,
  active: true
}

// 查询列配置
const queryColumns = shallowRef<PlusColumn[]>([
  {
    label: '关键词',
    prop: 'keyword',
    valueType: 'input',
    placeholder: '请输入姓名或邮箱搜索',
    fieldProps: {
      clearable: true,
      maxlength: 50,
      showWordLimit: true
    },
    order: 1
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: '' },
      { label: '在职', value: 'active', type: 'success' },
      { label: '离职', value: 'inactive', type: 'danger' },
      { label: '试用期', value: 'probation', type: 'warning' }
    ],
    fieldProps: {
      clearable: true
    },
    linkageTrigger: ['init', 'change'],
    linkage: async ({ value, set, clearValidate, validate }) => {
      const isActive =
        value === 'active' || value === 'probation' || value === '' || value == null
      set('active', isActive)
      clearValidate('active')
      await validate('active')
    },
    order: 2
  },
  {
    label: '部门',
    prop: 'department',
    valueType: 'select',
    placeholder: '请选择部门',
    options: [
      { label: '全部', value: '' },
      { label: '技术部', value: 'tech' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' },
      { label: '人事部', value: 'hr' }
    ],
    fieldProps: {
      clearable: true,
      filterable: true
    },
    linkage: ({ set, clearValidate }) => {
      set('userType', [])
      clearValidate('userType')
    },
    order: 3
  },
  {
    label: '创建时间',
    prop: 'dateRange',
    valueType: 'date-picker',
    fieldProps: {
      type: 'daterange',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    order: 4
  },
  {
    label: '薪资范围',
    prop: 'salaryRange',
    valueType: 'slider',
    fieldProps: {
      range: true,
      min: 0,
      max: 100000,
      step: 1000,
      formatTooltip: (val: number) => `¥${val?.toLocaleString()}`
    },
    order: 5
  },
  {
    label: '用户类型',
    prop: 'userType',
    valueType: 'checkbox',
    options: [
      { label: 'VIP用户', value: 'vip' },
      { label: '普通用户', value: 'normal' },
      { label: '试用用户', value: 'trial' }
    ],
    order: 6
  },
  {
    label: '年龄',
    prop: 'age',
    valueType: 'input-number',
    fieldProps: {
      min: 18,
      max: 65,
      step: 1,
      placeholder: '请输入年龄'
    },
    order: 7
  },
  {
    label: '是否激活',
    prop: 'active',
    valueType: 'switch',
    fieldProps: {
      activeText: '激活',
      inactiveText: '未激活'
    },
    order: 8
  }
])


// 模拟查询结果数据
const resultData = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    status: 'active',
    department: 'tech',
    createTime: '2024-01-15 10:30:00',
    salary: 15000
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    status: 'probation',
    department: 'product',
    createTime: '2024-02-20 14:20:00',
    salary: 12000
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    status: 'active',
    department: 'design',
    createTime: '2024-03-10 09:15:00',
    salary: 18000
  }
])

// 状态映射
const statusMap = {
  active: { label: '在职', type: 'success' },
  inactive: { label: '离职', type: 'danger' },
  probation: { label: '试用期', type: 'warning' }
} as const

// 获取状态标签
const getStatusLabel = (status: string) => {
  const key = status as keyof typeof statusMap
  return statusMap[key]?.label || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const key = status as keyof typeof statusMap
  return statusMap[key]?.type ?? 'info'
}

// 处理表单提交
const handleSubmit = (formData: any) => {
  console.log('查询参数:', formData)
  ElMessage.success('查询成功')

  // 这里可以调用API进行实际的数据查询
  // 模拟查询延迟
  setTimeout(() => {
    console.log('查询完成，更新结果数据')
  }, 500)
}

// 处理表单重置
const handleReset = (formData: any) => {
  console.log('重置表单:', formData)
  ElMessage.info('表单已重置')
}

// 处理字段值变化
const handleChange = (formData: any, column: PlusColumn) => {
  console.log('字段变化:', column.prop, formData)

  // 可以根据不同字段进行特殊处理
  switch (column.prop) {
    case 'status':
      console.log('状态变化:', formData.status)
      break;
    case 'dateRange':
      console.log('日期范围变化:', formData.dateRange)
      break;
    case 'salaryRange':
      console.log('薪资范围变化:', formData.salaryRange)
      break
  }
}

// 导出功能
const handleExport = () => {
  ElMessage.success('导出功能演示')
  console.log('导出数据:', resultData.value)
}

// 导航到高级示例
const router = useRouter()
const navigateToAdvanced = () => {
  router.push('/plus-query-demo/advanced')
}
</script>

<style lang="scss" scoped>
.plus-query-demo {
  padding: 20px;
  background-color: var(--el-bg-color-page);

  .demo-card {
    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .result-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .search-footer-tips {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 10px;

    .el-icon {
      font-size: 16px;
    }
  }

  // 响应式布局
  :deep(.el-form--inline) {
    .el-form-item {
      margin-right: 15px;
      margin-bottom: 15px;
    }

    @media screen and (max-width: 768px) {
      .el-form-item {
        display: block;
        margin-right: 0;
        width: 100%;
      }
    }
  }

  // 滑块样式优化
  :deep(.el-slider) {
    .el-slider__runway {
      margin: 10px 0;
    }
  }

  // 表格样式
  :deep(.el-table) {
    .el-table__header th {
      background-color: var(--el-fill-color-light);
      font-weight: 600;
    }

    .el-table__row {
      &:hover {
        background-color: var(--el-fill-color-lighter);
      }
    }
  }
}
</style>
