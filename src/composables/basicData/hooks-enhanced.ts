/**
 * 增强版 Hooks v2.0
 * 使用增强缓存系统、智能重试、请求合并
 */

import type { BaseDataHookResult, BaseDataItem, QueryParams, CacheConfig } from './types'
import type { AdapterConfig } from './adapters'
import { useEnhancedCache, getAllCacheStats, clearAllEnhancedCache } from './cache-enhanced'
import { createAdapter } from './adapters'
import { fetchPortList, fetchCountryList, fetchCurrencyList, fetchVesselList } from './api'

/**
 * 增强版工厂函数
 * 整合智能缓存、自动重试、请求合并
 *
 * @param fetchFn 数据获取函数
 * @param adapterConfig 适配器配置（labelKey / valueKey 等）
 * @param cacheConfig 缓存配置
 * @returns 基础数据 Hook
 */
export function createEnhancedHook(
  fetchFn: () => Promise<any>,
  adapterConfig: AdapterConfig,
  cacheConfig: CacheConfig
): (params?: QueryParams) => BaseDataHookResult<BaseDataItem> {
  const adapter = createAdapter(adapterConfig)

  return (params: QueryParams = {}): BaseDataHookResult<BaseDataItem> => {
    // 使用增强缓存系统
    const { data, loading, error, refresh, clearCache, timestamp, isExpired } = useEnhancedCache<BaseDataItem[]>(
      cacheConfig.key,
      async () => adapter.transform(await fetchFn()),
      {
        key: cacheConfig.key,
        ttl: cacheConfig.ttl,
        strategy: 'hybrid', // 使用混合策略
        memoryMaxSize: 100,
        enableLRU: true,
        enableRetry: true,
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          exponentialBackoff: true,
        },
        enableMerge: true,
      }
    )

    // 根据参数过滤数据
    const filteredData = computed(() => {
      let result: BaseDataItem[] = data.value || []

      if (params.keyword) {
        result = adapter.filterByKeyword(result, params.keyword)
      }
      if (params.enabledOnly) {
        result = adapter.filterByEnabled(result, true)
      }

      return result
    })

    // Element Plus 格式的选项
    const options = computed(() => adapter.toOptions(filteredData.value))

    return {
      data: filteredData,
      loading,
      error,
      options,
      isEmpty: computed(() => filteredData.value.length === 0),
      isReady: computed(() => !loading.value && !error.value),
      refresh,
      search: (keyword: string) => adapter.filterByKeyword(data.value || [], keyword),
      getByCode: (code: any) => adapter.findByCode(data.value || [], code),
      clearCache,
      // 缓存状态
      timestamp,
      isExpired,
    }
  }
}

/**
 * 增强版港口数据 Hook
 */
export const usePortsEnhanced = createEnhancedHook(
  fetchPortList,
  { labelKey: 'portNameCn', valueKey: 'portCode' },
  { key: 'PORTS', ttl: 10 * 60 * 1000 }
)

/**
 * 增强版国家数据 Hook
 */
export const useCountriesEnhanced = createEnhancedHook(
  fetchCountryList,
  { labelKey: 'countryName', valueKey: 'countryCode' },
  { key: 'COUNTRIES', ttl: 30 * 60 * 1000 }
)

/**
 * 增强版货币数据 Hook
 */
export const useCurrenciesEnhanced = createEnhancedHook(
  fetchCurrencyList,
  { labelKey: 'currencyName', valueKey: 'currencyCode' },
  { key: 'CURRENCIES', ttl: 60 * 60 * 1000 }
)

/**
 * 增强版船舶数据 Hook
 */
export const useVesselsEnhanced = createEnhancedHook(
  fetchVesselList,
  { labelKey: 'vesselName', valueKey: 'vesselCode' },
  { key: 'VESSELS', ttl: 15 * 60 * 1000 }
)

/**
 * 获取缓存统计信息
 */
export function useCacheStats() {
  const stats = computed(() => {
    return getAllCacheStats()
  })

  return {
    stats,
    clearAll: async () => {
      clearAllEnhancedCache()
    },
  }
}
