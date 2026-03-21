/**
 * 基础数据管理统一导出
 * 所有基础数据相关的 Hooks 和工具函数都从这里导入
 */

// 字典数据 Hooks
export { useDictType, useAllDictData, useDictTypes } from './useDict'

// 业务数据 Hooks（工厂函数 + 预定义 Hook）
export { usePorts, useCountries, useCurrencies, useVessels, createBaseDataHook } from './hooks'

// 适配器
export { createAdapter, BaseAdapter, DictAdapter } from './adapters'
export type { AdapterConfig } from './adapters'

// 缓存管理
export { useBasicDataCache, clearAllBasicDataCache, preloadBasicData, getAllCacheStats, getCacheStats } from './cache'

// 类型
export type {
  BaseDataItem,
  DictItem,
  ApiResponse,
  QueryParams,
  CacheConfig,
  CacheEntry,
  CacheStats,
  BaseDataHookResult,
  DictHookResult,
  RetryConfig,
} from './types'

// API（按需导入，通常不直接使用）
export {
  fetchDictData,
  fetchAllDictData,
  fetchPortList,
  fetchCountryList,
  fetchCurrencyList,
  fetchVesselList,
} from './api'
