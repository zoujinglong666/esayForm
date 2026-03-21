/**
 * 基础数据 Hooks
 * 提供各种业务数据的组合式函数
 * 统一使用增强缓存系统，支持国际化
 */

import type { BaseDataHookResult, BaseDataItem, QueryParams, CacheConfig } from './types'
import type { AdapterConfig } from './adapters'
import { useBasicDataCache } from './cache'
import { createAdapter } from './adapters'
import { fetchPortList, fetchCountryList, fetchCurrencyList, fetchVesselList } from './api'

/**
 * 创建基础数据 Hook 的工厂函数
 * 所有基础数据 Hook 共享相同的接口和行为
 *
 * @param fetchFn 数据获取函数
 * @param adapterConfig 适配器配置（labelKey / valueKey / labelEnKey 等）
 * @param cacheConfig 缓存配置（支持 strategy / LRU / retry / merge 等增强选项）
 * @returns 基础数据 Hook
 */
export function createBaseDataHook(
  fetchFn: () => Promise<any>,
  adapterConfig: AdapterConfig,
  cacheConfig: CacheConfig
): (params?: QueryParams) => BaseDataHookResult<BaseDataItem> {
  const adapter = createAdapter(adapterConfig)

  return (params: QueryParams = {}): BaseDataHookResult<BaseDataItem> => {
    const { useEnglish = false } = params

    // 使用统一缓存系统
    const { data, loading, error, refresh, clearCache } = useBasicDataCache<BaseDataItem[]>(
      cacheConfig.key,
      async () => adapter.transform(await fetchFn()),
      {
        ttl: cacheConfig.ttl,
        strategy: cacheConfig.strategy ?? 'hybrid',
        enableLRU: cacheConfig.enableLRU ?? true,
        enableRetry: cacheConfig.enableRetry ?? true,
        retryConfig: cacheConfig.retryConfig ?? {
          maxRetries: 3,
          retryDelay: 1000,
          exponentialBackoff: true,
        },
        enableMerge: cacheConfig.enableMerge ?? true,
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

    // Element Plus 格式的选项，支持国际化
    const options = computed(() => adapter.toOptions(filteredData.value, useEnglish))

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
    }
  }
}

/**
 * 港口数据 Hook
 * label 取 portNameCn，英文取 portNameEn，value 取 portCode
 */
export const usePorts = createBaseDataHook(
  fetchPortList,
  { labelKey: 'portNameCn', labelEnKey: 'portNameEn', valueKey: 'portCode' },
  { key: 'PORTS', ttl: 10 * 60 * 1000 }
)

/**
 * 国家数据 Hook
 * label 取 countryName，英文取 countryNameEn，value 取 countryCode
 */
export const useCountries = createBaseDataHook(
  fetchCountryList,
  { labelKey: 'countryName', labelEnKey: 'countryNameEn', valueKey: 'countryCode' },
  { key: 'COUNTRIES', ttl: 30 * 60 * 1000 }
)

/**
 * 货币数据 Hook
 * label 取 currencyName，英文取 currencyNameEn，value 取 currencyCode
 */
export const useCurrencies = createBaseDataHook(
  fetchCurrencyList,
  { labelKey: 'currencyName', labelEnKey: 'currencyNameEn', valueKey: 'currencyCode' },
  { key: 'CURRENCIES', ttl: 60 * 60 * 1000 }
)

/**
 * 船舶数据 Hook
 * label 取 vesselName，英文取 vesselNameEn，value 取 vesselCode
 */
export const useVessels = createBaseDataHook(
  fetchVesselList,
  { labelKey: 'vesselName', labelEnKey: 'vesselNameEn', valueKey: 'vesselCode' },
  { key: 'VESSELS', ttl: 15 * 60 * 1000 }
)
