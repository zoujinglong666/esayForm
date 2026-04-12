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

    <el-card class="mb-4">
      <template #header>
        <span class="title">场景 6: 动态过滤（响应式参数）</span>
      </template>
      <div class="demo-item">
        <el-switch v-model="showAllPorts" active-text="显示全部" inactive-text="仅启用" />
      </div>
      <div class="demo-item">
        <label class="demo-label">港口列表：</label>
        <el-select v-model="dynamicPort" placeholder="请选择港口" style="width: 300px">
          <el-option
            v-for="port in dynamicPortOptions"
            :key="port.value"
            :label="port.label"
            :value="port.value"
          />
        </el-select>
        <el-tag class="ml-2" type="info">{{ dynamicPortOptions.length }} 条</el-tag>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 7: 船舶选择器</span>
          </template>
          <div class="demo-item">
            <label class="demo-label">选择船舶：</label>
            <el-select v-model="selectedVessel" placeholder="请选择船舶" style="width: 250px">
              <el-option
                v-for="v in vesselOptions"
                :key="v.value"
                :label="v.label"
                :value="v.value"
              />
            </el-select>
          </div>
          <div v-if="selectedVessel && vesselDetail" class="demo-item">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="船舶代码">{{ vesselDetail.code }}</el-descriptions-item>
              <el-descriptions-item label="船舶名称">{{ vesselDetail.name }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="demo-item">
            <el-tag type="success">按 code 反查详情</el-tag>
          </div>
        </el-card>

        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 8: 国家下拉 + 联动港口</span>
          </template>
          <div class="demo-item">
            <label class="demo-label">选择国家：</label>
            <el-select
              v-model="selectedCountry"
              placeholder="请选择国家"
              style="width: 200px"
              @change="handleCountryChange"
            >
              <el-option
                v-for="c in countryOptions"
                :key="c.value"
                :label="c.label"
                :value="c.value"
              />
            </el-select>
          </div>
          <div class="demo-item">
            <label class="demo-label">该国家港口：</label>
            <el-select v-model="linkedPort" placeholder="先选国家" :disabled="!selectedCountry" style="width: 250px">
              <el-option
                v-for="p in linkedPortOptions"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              />
            </el-select>
          </div>
          <div class="demo-item">
            <el-tag type="warning">级联联动</el-tag>
            <el-tag type="info">{{ linkedPortOptions.length }} 个港口</el-tag>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 9: 支付状态字典 + 多选</span>
          </template>
          <div class="demo-item">
            <label class="demo-label">支付状态：</label>
            <el-select v-model="paymentStatus" placeholder="请选择" style="width: 200px">
              <el-option
                v-for="item in paymentStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="demo-item">
            <label class="demo-label">多选状态：</label>
            <el-select v-model="multiStatus" multiple placeholder="可多选" style="width: 300px">
              <el-option
                v-for="item in paymentStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div v-if="multiStatus.length" class="demo-item">
            <label class="demo-label">已选标签：</label>
            <el-tag
              v-for="s in multiStatus"
              :key="s"
              closable
              class="mr-2"
              @close="multiStatus = multiStatus.filter(v => v !== s)"
            >
              {{ getPaymentLabel(s) }}
            </el-tag>
          </div>
        </el-card>

        <el-card class="mb-4">
          <template #header>
            <span class="title">场景 10: 数据预加载 & 缓存状态</span>
          </template>
          <div class="demo-item">
            <el-button type="primary" @click="handlePreload" :loading="preloading">
              预加载所有基础数据
            </el-button>
            <el-button @click="handleClearCache">
              清除全部缓存
            </el-button>
          </div>
          <div class="demo-item">
            <label class="demo-label">缓存状态：</label>
            <el-tag v-if="!cacheCleared" type="success">
              缓存已就绪
            </el-tag>
            <el-tag v-else type="info">缓存已清除</el-tag>
          </div>
          <div class="demo-item">
            <el-button size="small" @click="handleRefreshPorts">刷新港口</el-button>
            <el-button size="small" @click="handleRefreshCountries">刷新国家</el-button>
            <el-button size="small" @click="handleRefreshVessels">刷新船舶</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mb-4">
      <template #header>
        <span class="title">场景 11: 港口-货币组合展示</span>
      </template>
      <el-table :data="comboTableData" border style="width: 100%">
        <el-table-column prop="portCode" label="港口代码" width="120" />
        <el-table-column prop="portName" label="港口名称" width="140" />
        <el-table-column prop="country" label="所属国家" width="120">
          <template #default="{ row }">
            {{ getCountryName(row.countryCode) }}
          </template>
        </el-table-column>
        <el-table-column prop="currency" label="本地货币" width="140">
          <template #default="{ row }">
            {{ getCurrencyName(row.countryCode) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  useDictType,
  usePorts,
  useCountries,
  useCurrencies,
  useVessels,
  clearAllBasicDataCache,
} from '@/composables/basicData'

// 设置组件名称，用于缓存
defineOptions({
  name: 'BasicDataManagement',
})

// ==================== 场景 1: 字典下拉 ====================
const { options: statusOptions, getLabel: getStatusLabel } = useDictType('ORDER_STATUS')
const orderStatus = ref('')

const { options: userStatusOptions, loading: userStatusLoading } = useDictType('USER_STATUS')
const userStatus = ref('')

// ==================== 场景 2: 港口搜索 ====================
const { options: allPortOptions, loading: portLoading, getByCode: getPort, search: searchPorts } = usePorts({
  enabledOnly: true,
})

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

// ==================== 场景 3: 表格列显示 ====================
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

// ==================== 场景 4: 关联数据 ====================
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

// ==================== 场景 5: 货币选择 ====================
const { options: currencyOptions } = useCurrencies()
const selectedCurrency = ref('')

// ==================== 场景 6: 动态过滤 ====================
const showAllPorts = ref(false)
const { options: dynamicPortOptions } = usePorts(
  computed(() => ({
    enabledOnly: !showAllPorts.value,
  })),
)
const dynamicPort = ref('')

// ==================== 场景 7: 船舶选择器 ====================
const { options: vesselOptions, getByCode: getVesselByCode } = useVessels()
const selectedVessel = ref('')

const vesselDetail = computed(() => {
  if (!selectedVessel.value) return null
  return getVesselByCode(selectedVessel.value)
})

// ==================== 场景 8: 国家联动港口 ====================
const { options: countryOptions } = useCountries({ enabledOnly: true })
const { data: allPortsData } = usePorts()
const selectedCountry = ref('')
const linkedPort = ref('')

const linkedPortOptions = computed(() => {
  if (!selectedCountry.value) return []
  return allPortsData.value
    .filter(p => p.countryCode === selectedCountry.value)
    .map(p => ({ label: p.name, value: p.code }))
})

function handleCountryChange() {
  linkedPort.value = ''
}

// ==================== 场景 9: 支付状态字典 + 多选 ====================
const { options: paymentStatusOptions, getLabel: getPaymentLabel } = useDictType('PAYMENT_STATUS')
const paymentStatus = ref('')
const multiStatus = ref<string[]>([])

// ==================== 场景 10: 缓存管理 ====================
const preloading = ref(false)
const cacheCleared = ref(false)

async function handlePreload() {
  preloading.value = true
  try {
    await Promise.all([refreshPorts(), refreshCountries(), refreshVessels()])
    cacheCleared.value = false
    ElMessage.success('所有基础数据预加载完成')
  } catch {
    ElMessage.error('预加载失败')
  } finally {
    preloading.value = false
  }
}

function handleClearCache() {
  clearAllBasicDataCache()
  cacheCleared.value = true
  ElMessage.success('缓存已清除')
}

// 单项刷新
const { refresh: refreshPorts } = usePorts()
const { refresh: refreshCountries } = useCountries()
const { refresh: refreshVessels } = useVessels()

async function handleRefreshPorts() {
  await refreshPorts()
  cacheCleared.value = false
  ElMessage.success('港口数据已刷新')
}

async function handleRefreshCountries() {
  await refreshCountries()
  cacheCleared.value = false
  ElMessage.success('国家数据已刷新')
}

async function handleRefreshVessels() {
  await refreshVessels()
  cacheCleared.value = false
  ElMessage.success('船舶数据已刷新')
}

// ==================== 场景 11: 组合展示 ====================
const { data: portsForTable } = usePorts()

const comboTableData = computed(() => {
  return portsForTable.value.map(p => ({
    portCode: p.code,
    portName: p.name,
    countryCode: p.countryCode || '',
    status: (p as any).status,
  }))
})

const { getByCode: getCountryByCode } = useCountries()
const { getByCode: getCurrencyByCode } = useCurrencies()

// 国家代码 -> 货币代码映射
const countryCurrencyMap: Record<string, string> = {
  CN: 'CNY',
  US: 'USD',
  JP: 'JPY',
  KR: 'KRW',
  SG: 'SGD',
  HK: 'HKD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  AU: 'AUD',
}

function getCountryName(code: string) {
  return getCountryByCode(code)?.name || code
}

function getCurrencyName(countryCode: string) {
  const currencyCode = countryCurrencyMap[countryCode]
  if (!currencyCode) return '-'
  const currency = getCurrencyByCode(currencyCode)
  return currency ? `${currency.name} (${currencyCode})` : currencyCode
}

// ==================== 刷新所有数据 ====================
const refreshing = ref(false)
async function refreshAll() {
  refreshing.value = true
  try {
    await Promise.all([refreshPorts(), refreshCountries(), refreshVessels()])
    cacheCleared.value = false
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
