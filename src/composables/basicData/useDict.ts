/**
 * 字典数据 Hook
 * 专门处理字典数据的获取和使用
 * 支持国际化：根据 locale 自动切换中英文
 */

import type { DictItem, DictHookResult } from './types'
import { useBasicDataCache } from './cache'
import { DictAdapter } from './adapters'
import { fetchAllDictData } from './api'

/**
 * 尝试获取 i18n locale
 * 如果 vue-i18n 不可用，默认中文
 */
function useLocale(): Ref<string> {
  try {
    // vue-i18n 的 useI18n 必须在 setup 中同步调用
    // eslint-disable-next-line ts/no-require-imports
    const { useI18n } = require('vue-i18n') as typeof import('vue-i18n')
    const i18n = useI18n()
    return i18n.locale as Ref<string>
  } catch {
    return ref('zh-CN')
  }
}

/**
 * 获取所有字典数据
 * 使用缓存避免重复请求
 */
export function useAllDictData() {
  const { data, loading, error, refresh, clearCache } = useBasicDataCache<Record<string, DictItem[]>>(
    'ALL_DICT',
    async () => {
      const response: any = await fetchAllDictData()
      const dictMap: Record<string, DictItem[]> = {}

      const dictData = response?.data || response
      if (dictData && typeof dictData === 'object') {
        Object.keys(dictData).forEach(key => {
          dictMap[key] = DictAdapter.transform(dictData[key], key)
        })
      }

      return dictMap
    },
    { ttl: 10 * 60 * 1000 }
  )

  return {
    data: computed(() => data.value || {}),
    loading,
    error,
    refresh,
    clearCache,
  }
}

/**
 * 特定字典类型的组合式函数
 * 提供开箱即用的下拉选项和 label 查询
 * 自动根据 locale 切换中英文
 *
 * @param dictType 字典类型
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useDictType } from '~/composables/basicData'
 *
 * const { options, getLabel, loading } = useDictType('ORDER_STATUS')
 * </script>
 * ```
 */
export function useDictType(dictType: string): DictHookResult {
  const { data: dictMap, loading, error, refresh } = useAllDictData()

  const locale = useLocale()
  const useEnglish = computed(() => locale.value === 'en' || locale.value?.startsWith('en'))

  // 响应式的选项列表，自动根据语言切换
  const options = computed(() => {
    const items = dictMap.value[dictType] || []
    return DictAdapter.toOptions(items, useEnglish.value)
  })

  // 字典项列表
  const items = computed(() => dictMap.value[dictType] || [])

  // 根据 code 获取 label，支持国际化
  function getLabel(code: string): string {
    return DictAdapter.getLabel(items.value, code, useEnglish.value)
  }

  // 根据 code 数组获取 label 数组
  function getLabels(codes: string[]): string[] {
    return codes.map(getLabel)
  }

  return {
    options,
    items,
    loading,
    error,
    getLabel,
    getLabels,
    refresh,
  }
}

/**
 * 批量获取多个字典类型的数据
 *
 * @param dictTypes 字典类型数组
 */
export function useDictTypes(dictTypes: string[]) {
  const { data: dictMap, loading, error, refresh } = useAllDictData()

  const locale = useLocale()
  const useEnglish = computed(() => locale.value === 'en' || locale.value?.startsWith('en'))

  const dictOptions = computed(() => {
    const result: Record<string, Array<{ label: string; value: any }>> = {}
    dictTypes.forEach(type => {
      const items = dictMap.value[type] || []
      result[type] = DictAdapter.toOptions(items, useEnglish.value)
    })
    return result
  })

  const dictItems = computed(() => {
    const result: Record<string, DictItem[]> = {}
    dictTypes.forEach(type => {
      result[type] = dictMap.value[type] || []
    })
    return result
  })

  return {
    dictOptions,
    dictItems,
    loading,
    error,
    refresh,
  }
}
