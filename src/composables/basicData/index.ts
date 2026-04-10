/**
 * 基础数据管理统一导出
 * 所有基础数据相关的 Hooks 和工具函数都从这里导入
 */

// Hooks
export { useDictType, useAllDictData, useDictTypes } from './useDict'
export { usePorts, useCountries, useCurrencies, useVessels, createBaseDataHook } from './hooks'

// 适配器
export { createAdapter, BaseAdapter, DictAdapter } from './adapters'
export type { AdapterConfig } from './adapters'

// 缓存 v1.0
export { useBasicDataCache, clearAllBasicDataCache, preloadBasicData } from './cache'

// 缓存 v2.0（增强版）
export {
  useEnhancedCache,
  clearAllEnhancedCache,
  getAllCacheStats,
} from './cache-enhanced'

// LRU 缓存
export { LRUCache } from './cache-lru'

// 智能重试
export {
  RetryManager,
  useRetry,
} from './retry'
export type { RetryConfig } from './retry'

// 请求合并
export {
  RequestMergeManager,
  globalRequestMerger,
  useRequestMerge,
} from './request-merge'

// 类型
export type {
  BaseDataItem,
  DictItem,
  ApiResponse,
  QueryParams,
  CacheConfig,
  CacheEntry,
  BaseDataHookResult,
  DictHookResult,
} from './types'

// API
export {
  fetchDictData,
  fetchAllDictData,
  fetchPortList,
  fetchCountryList,
  fetchCurrencyList,
  fetchVesselList,
} from './api'
