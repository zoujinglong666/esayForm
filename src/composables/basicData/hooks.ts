/**
 * 基础数据 Hooks
 * 提供各种业务数据的组合式函数
 */

import type { Ref, ComputedRef } from 'vue'
import type { BaseDataHookResult, BaseDataItem, QueryParams, CacheConfig } from './types'
import type { AdapterConfig } from './adapters'
import { useBasicDataCache } from './cache'
import { createAdapter } from './adapters'
import { fetchPortList, fetchCountryList, fetchCurrencyList, fetchVesselList } from './api'

/**
 * 参数类型：支持普通对象、Ref、ComputedRef
 */
type MaybeRefQueryParams = QueryParams | Ref<QueryParams> | ComputedRef<QueryParams>

/**
 * 解包 MaybeRef 类型的参数
 */
function unrefParams(params: MaybeRefQueryParams): QueryParams {
  if (isRef(params)) {
    return params.value
  }
  return params
}

/**
 * 创建基础数据 Hook 的工厂函数
 * 所有基础数据 Hook 共享相同的接口和行为
 *
 * @param fetchFn 数据获取函数
 * @param adapterConfig 适配器配置（labelKey / valueKey 等）
 * @param cacheConfig 缓存配置
 * @returns 基础数据 Hook，params 支持传入响应式对象（Ref / ComputedRef）以实现动态过滤
 *
 * @example
 * ```ts
 * // 静态参数（向后兼容）
 * const { options } = usePorts({ enabledOnly: true })
 *
 * // 响应式参数 — 过滤条件动态变化
 * const showDisabled = ref(false)
 * const { options } = usePorts(computed(() => ({
 *   enabledOnly: !showDisabled.value,
 * })))
 * ```
 */
export function createBaseDataHook(
  fetchFn: () => Promise<any>,
  adapterConfig: AdapterConfig,
  cacheConfig: CacheConfig
): (params?: MaybeRefQueryParams) => BaseDataHookResult<BaseDataItem> {
  const adapter = createAdapter(adapterConfig)

  return (params: MaybeRefQueryParams = {}): BaseDataHookResult<BaseDataItem> => {
    // 使用缓存系统
    const { data, loading, error, refresh, clearCache } = useBasicDataCache<BaseDataItem[]>(
      cacheConfig.key,
      async () => adapter.transform(await fetchFn()),
      { ttl: cacheConfig.ttl }
    )

    // 根据参数过滤数据（支持响应式参数）
    const filteredData = computed(() => {
      const p = unrefParams(params)
      let result: BaseDataItem[] = data.value || []

      if (p.keyword) {
        result = adapter.filterByKeyword(result, p.keyword)
      }
      if (p.enabledOnly) {
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
    }
  }
}

/**
 * 港口数据 Hook
 * label 取 portNameCn，value 取 portCode
 */
export const usePorts = createBaseDataHook(
  fetchPortList,
  { labelKey: 'portNameCn', valueKey: 'portCode', enabledKey: 'status', enabledTruthy: 1 },
  { key: 'PORTS', ttl: 10 * 60 * 1000 } // 10 分钟缓存
)

/**
 * 国家数据 Hook
 * label 取 countryName，value 取 countryCode
 */
export const useCountries = createBaseDataHook(
  fetchCountryList,
  { labelKey: 'countryName', valueKey: 'countryCode', enabledKey: 'status', enabledTruthy: 1 },
  { key: 'COUNTRIES', ttl: 30 * 60 * 1000 } // 30 分钟缓存
)

/**
 * 货币数据 Hook
 * label 取 currencyName，value 取 currencyCode
 */
export const useCurrencies = createBaseDataHook(
  fetchCurrencyList,
  { labelKey: 'currencyName', valueKey: 'currencyCode', enabledKey: 'status', enabledTruthy: 1 },
  { key: 'CURRENCIES', ttl: 60 * 60 * 1000 } // 1 小时缓存
)

/**
 * 船舶数据 Hook
 * label 取 vesselName，value 取 vesselCode
 */
export const useVessels = createBaseDataHook(
  fetchVesselList,
  { labelKey: 'vesselName', valueKey: 'vesselCode', enabledKey: 'status', enabledTruthy: 1 },
  { key: 'VESSELS', ttl: 15 * 60 * 1000 } // 15 分钟缓存
)
