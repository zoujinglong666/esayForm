/**
 * 字典数据 Hook
 * 专门处理字典数据的获取和使用
 */

import type { DictItem, DictHookResult } from './types'
import { useBasicDataCache } from './cache'
import { DictAdapter } from './adapters'
import { fetchAllDictData } from './api'

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

      // 处理响应数据
      const dictData = response?.data || response
      if (dictData && typeof dictData === 'object') {
        Object.keys(dictData).forEach(key => {
          dictMap[key] = DictAdapter.transform(dictData[key], key)
        })
      }

      return dictMap
    },
    { ttl: 10 * 60 * 1000 } // 10 分钟缓存
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
 *
 * @param dictType 字典类型
 */
export function useDictType(dictType: string): DictHookResult {
  const { data: dictMap, loading, error, refresh } = useAllDictData()

  // 响应式的选项列表
  const options = computed(() => {
    const items = dictMap.value[dictType] || []
    return DictAdapter.toOptions(items)
  })

  // 字典项列表
  const items = computed(() => dictMap.value[dictType] || [])

  // 根据 code 获取 label
  function getLabel(code: string): string {
    return DictAdapter.getLabel(items.value, code)
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

  const dictOptions = computed(() => {
    const result: Record<string, Array<{ label: string; value: any }>> = {}
    dictTypes.forEach(type => {
      const items = dictMap.value[type] || []
      result[type] = DictAdapter.toOptions(items)
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
