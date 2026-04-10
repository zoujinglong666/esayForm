/**
 * 基础数据类型定义
 */

/**
 * 基础数据项接口
 */
export interface BaseDataItem {
  code: string | number
  name: string
  label?: string
  enabled?: boolean
  [key: string]: any
}

/**
 * 字典项接口
 */
export interface DictItem {
  value: string | number
  label: string
  [key: string]: any
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * 查询参数接口
 */
export interface QueryParams {
  keyword?: string
  enabledOnly?: boolean
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  key: string
  ttl: number
}

/**
 * 缓存条目接口
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * 基础数据 Hook 返回值接口
 */
export interface BaseDataHookResult<T extends BaseDataItem> {
  data: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  options: ComputedRef<Array<{ label: string; value: any }>>
  isEmpty: ComputedRef<boolean>
  isReady: ComputedRef<boolean>
  refresh: () => Promise<void>
  search: (keyword: string) => T[]
  getByCode: (code: any) => T | undefined
  clearCache: () => void
}

/**
 * 字典 Hook 返回值接口
 */
export interface DictHookResult {
  options: ComputedRef<Array<{ label: string; value: any }>>
  items: ComputedRef<DictItem[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  getLabel: (code: string) => string
  getLabels: (codes: string[]) => string[]
  refresh: () => Promise<void>
}
