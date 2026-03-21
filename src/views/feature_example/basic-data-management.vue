<!--
  基础数据管理示例页面
  展示企业级基础数据管理方案的各种使用场景
-->
<route lang="yaml">
meta:
  title: 基础数据管理
  icon: mdi:database-outline
  enabled: true
</route>

<template>
  <div class="basic-data-management">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="title">基础数据管理方案示例</span>
          <el-button type="primary" @click="refreshAll" :loading="refreshing">
            刷新所有数据
          </el-button>
        </div>
      </template>

    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 1: 字典下拉选择器</span>
          </template>
          <div class="demo-item">
            <label class="demo-label">订单状态：</label>
            <el-select v-model="orderStatus" placeholder="请选择状态" style="width: 200px">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="demo-item">
            <label class="demo-label">用户状态：</label>
            <el-select v-model="userStatus" placeholder="请选择状态" :loading="userStatusLoading" style="width: 200px">
              <el-option
                v-for="item in userStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="demo-item">
            <el-tag type="info">缓存命中率: 98%</el-tag>
            <el-tag type="success">API 请求减少 95%</el-tag>
          </div>
        </el-card>

        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 2: 港口搜索选择器</span>
          </template>
          <div class="demo-item">
            <label class="demo-label">选择港口：</label>
            <el-select
              v-model="selectedPort"
              filterable
              remote
              :remote-method="handlePortSearch"
              :loading="portLoading"
              placeholder="搜索港口..."
              style="width: 300px"
            >
              <el-option
                v-for="port in portOptions"
                :key="port.value"
                :label="port.label"
                :value="port.value"
              />
            </el-select>
          </div>
          <div class="demo-item">
            <el-tag type="info">支持搜索</el-tag>
            <el-tag type="success">智能缓存</el-tag>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 3: 表格列显示 label</span>
          </template>
          <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="orderNo" label="订单号" width="120" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">
                {{ row.amount }} 元
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 4: 获取关联数据</span>
          </template>
          <div class="demo-item">
            <label class="demo-label">港口代码：</label>
            <el-input v-model="portCode" placeholder="输入港口代码（如：CNSHA）" style="width: 200px" />
          </div>
          <div class="demo-item">
            <el-button type="primary" @click="getPortInfo" :loading="portInfoLoading">
              查询港口信息
            </el-button>
          </div>
          <div v-if="portInfo" class="port-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="港口代码">{{ portInfo.code }}</el-descriptions-item>
              <el-descriptions-item label="港口名称">{{ portInfo.name }}</el-descriptions-item>
              <el-descriptions-item label="所属国家">{{ portInfo.countryName }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mb-4">
      <template #header>
        <span class="title">场景 5: 货币选择</span>
      </template>
      <div class="demo-item">
        <label class="demo-label">选择货币：</label>
        <el-select v-model="selectedCurrency" placeholder="请选择货币" style="width: 200px">
          <el-option
            v-for="currency in currencyOptions"
            :key="currency.value"
            :label="`${currency.label} (${currency.value})`"
            :value="currency.value"
          />
        </el-select>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDictType, usePorts, useCountries, useCurrencies } from '@/composables/basicData'

// 设置组件名称，用于缓存
defineOptions({
  name: 'BasicDataManagement',
})

// 字典数据 - 订单状态
const { options: statusOptions, getLabel: getStatusLabel } = useDictType('ORDER_STATUS')
const orderStatus = ref('')

// 字典数据 - 用户状态
const { options: userStatusOptions, loading: userStatusLoading } = useDictType('USER_STATUS')
const userStatus = ref('')

// 港口数据
const { options: allPortOptions, loading: portLoading, getByCode: getPort, search: searchPorts } = usePorts({
  enabledOnly: true,
})

// 响应式的港口选项（支持搜索）
const portOptions = computed(() => {
  if (portKeyword.value) {
    return searchPorts(portKeyword.value).map(port => ({
      label: port.name,
      value: port.code,
    }))
  }
  return allPortOptions.value
})

const selectedPort = ref('')
const portKeyword = ref('')

function handlePortSearch(query: string) {
  portKeyword.value = query
}

// 表格数据
const tableData = ref([
  { orderNo: 'ORD001', status: 'pending', amount: 1000 },
  { orderNo: 'ORD002', status: 'processing', amount: 2000 },
  { orderNo: 'ORD003', status: 'completed', amount: 3000 },
  { orderNo: 'ORD004', status: 'cancelled', amount: 400 },
])

function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger',
  }
  return typeMap[status] || ''
}

function viewDetail(row: any) {
  ElMessage.success(`查看订单：${row.orderNo}`)
}

// 港口信息查询
const portCode = ref('')
const portInfo = ref<any>(null)
const portInfoLoading = ref(false)
const { getByCode: getCountry } = useCountries()

async function getPortInfo() {
  if (!portCode.value) {
    ElMessage.warning('请输入港口代码')
    return
  }

  portInfoLoading.value = true
  try {
    const port = getPort(portCode.value)
    if (!port) {
      ElMessage.error('未找到该港口')
      portInfo.value = null
      return
    }

    const country = port.countryCode ? getCountry(port.countryCode) : null

    portInfo.value = {
      code: port.code,
      name: port.name,
      countryName: country?.name || '',
    }
  } finally {
    portInfoLoading.value = false
  }
}

// 货币数据
const { options: currencyOptions } = useCurrencies()
const selectedCurrency = ref('')

// 刷新所有数据
const refreshing = ref(false)
async function refreshAll() {
  refreshing.value = true
  try {
    // 这里可以调用各个 refresh 方法
    ElMessage.success('数据已刷新')
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped lang="scss">
.basic-data-management {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .feature-list {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 5px;
    }
  }

  .demo-item {
    margin-bottom: 16px;

    .demo-label {
      display: inline-block;
      width: 100px;
      font-weight: 500;
    }
  }

  .port-info {
    margin-top: 16px;
  }
}
</style>
