/**
 * 基础数据 API 封装
 * 统一管理所有基础数据的 API 请求
 */

/**
 * 获取字典数据
 * @param dictType 字典类型
 */
export async function fetchDictData(dictType: string) {
  // TODO: 替换为实际的 API 请求
  // return request.get(`/api/dict/${dictType}`)

  // 模拟数据 - 实际使用时替换为真实 API
  const mockData: Record<string, any[]> = {
    ORDER_STATUS: [
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' },
    ],
    USER_STATUS: [
      { value: 'active', label: '正常' },
      { value: 'disabled', label: '禁用' },
      { value: 'locked', label: '锁定' },
    ],
    PAYMENT_STATUS: [
      { value: 'unpaid', label: '未支付' },
      { value: 'paid', label: '已支付' },
      { value: 'refunded', label: '已退款' },
    ],
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: mockData[dictType] || [],
        message: 'success',
      })
    }, 100)
  })
}

/**
 * 获取所有字典数据
 */
export async function fetchAllDictData() {
  // TODO: 替换为实际的 API 请求
  // return request.get('/api/dict/all')

  // 模拟数据
  const mockData = {
    ORDER_STATUS: [
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' },
    ],
    USER_STATUS: [
      { value: 'active', label: '正常' },
      { value: 'disabled', label: '禁用' },
      { value: 'locked', label: '锁定' },
    ],
    PAYMENT_STATUS: [
      { value: 'unpaid', label: '未支付' },
      { value: 'paid', label: '已支付' },
      { value: 'refunded', label: '已退款' },
    ],
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: mockData,
        message: 'success',
      })
    }, 100)
  })
}

/**
 * 获取港口列表
 */
export async function fetchPortList() {
  // TODO: 替换为实际的 API 请求
  // return request.get('/api/ports/list')

  // 模拟数据（status: 1=启用, 0=禁用）
  const mockData = [
    { portCode: 'CNSHA', portNameCn: '上海港', countryCode: 'CN', status: 1 },
    { portCode: 'CNNGB', portNameCn: '宁波港', countryCode: 'CN', status: 1 },
    { portCode: 'CNSZX', portNameCn: '深圳港', countryCode: 'CN', status: 1 },
    { portCode: 'CNQDG', portNameCn: '青岛港', countryCode: 'CN', status: 1 },
    { portCode: 'CNTJG', portNameCn: '天津港', countryCode: 'CN', status: 0 },
    { portCode: 'USLAX', portNameCn: '洛杉矶港', countryCode: 'US', status: 1 },
    { portCode: 'USNYC', portNameCn: '纽约港', countryCode: 'US', status: 0 },
    { portCode: 'SGSIN', portNameCn: '新加坡港', countryCode: 'SG', status: 1 },
    { portCode: 'JPTYO', portNameCn: '东京港', countryCode: 'JP', status: 1 },
    { portCode: 'HKHKG', portNameCn: '香港港', countryCode: 'HK', status: 0 },
  ]

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: mockData,
        message: 'success',
      })
    }, 200)
  })
}

/**
 * 获取国家列表
 */
export async function fetchCountryList() {
  // TODO: 替换为实际的 API 请求
  // return request.get('/api/countries/list')

  // 模拟数据（status: 1=启用, 0=禁用）
  const mockData = [
    { countryCode: 'CN', countryName: '中国', status: 1 },
    { countryCode: 'US', countryName: '美国', status: 1 },
    { countryCode: 'JP', countryName: '日本', status: 1 },
    { countryCode: 'KR', countryName: '韩国', status: 0 },
    { countryCode: 'SG', countryName: '新加坡', status: 1 },
    { countryCode: 'HK', countryName: '香港', status: 0 },
    { countryCode: 'GB', countryName: '英国', status: 1 },
    { countryCode: 'DE', countryName: '德国', status: 1 },
    { countryCode: 'FR', countryName: '法国', status: 0 },
    { countryCode: 'AU', countryName: '澳大利亚', status: 1 },
  ]

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: mockData,
        message: 'success',
      })
    }, 200)
  })
}

/**
 * 获取货币列表
 */
export async function fetchCurrencyList() {
  // TODO: 替换为实际的 API 请求
  // return request.get('/api/currencies/list')

  // 模拟数据
  const mockData = [
    { currencyCode: 'CNY', currencyName: '人民币', symbol: '¥', status: 1 },
    { currencyCode: 'USD', currencyName: '美元', symbol: '$', status: 1 },
    { currencyCode: 'EUR', currencyName: '欧元', symbol: '€', status: 1 },
    { currencyCode: 'JPY', currencyName: '日元', symbol: '¥', status: 1 },
    { currencyCode: 'GBP', currencyName: '英镑', symbol: '£', status: 1 },
    { currencyCode: 'KRW', currencyName: '韩元', symbol: '₩', status: 1 },
    { currencyCode: 'SGD', currencyName: '新加坡元', symbol: 'S$', status: 1 },
    { currencyCode: 'HKD', currencyName: '港币', symbol: 'HK$', status: 1 },
  ]

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: mockData,
        message: 'success',
      })
    }, 200)
  })
}

/**
 * 获取船舶列表
 */
export async function fetchVesselList() {
  // TODO: 替换为实际的 API 请求
  // return request.get('/api/vessels/list')

  // 模拟数据
  const mockData = [
    { vesselCode: 'V001', vesselName: '中远海运01', status: 1 },
    { vesselCode: 'V002', vesselName: '中远海运02', status: 1 },
    { vesselCode: 'V003', vesselName: '中远海运03', status: 1 },
    { vesselCode: 'M001', vesselName: '马士基01', status: 1 },
    { vesselCode: 'M002', vesselName: '马士基02', status: 1 },
  ]

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 0,
        data: mockData,
        message: 'success',
      })
    }, 200)
  })
}
