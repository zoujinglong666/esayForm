/**
 * 基础数据类型定义
 * 统一的类型系统，支持国际化
 */

/**
 * 基础数据项接口
 * transform 后统一拥有 code/name/nameEn/enabled 字段
 */
export interface BaseDataItem {
  code: string | number
  name: string
  /** 英文名称，用于国际化 */
  nameEn?: string
  enabled?: boolean
  [key: string]: any
}

/**
 * 字典项接口
 * transform 后统一拥有 value/label/labelEn 字段
 */
export interface DictItem {
  value: string | number
  label: string
  /** 英文标签，用于国际化 */
  labelEn?: string
  dictType?: string
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
  /** 是否使用英文名称（国际化） */
  useEnglish?: boolean
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  key: string
  ttl: number
  /** 缓存策略：内存、localStorage、混合（默认） */
  strategy?: 'memory' | 'localStorage' | 'hybrid'
  /** 内存缓存最大条目数（启用 LRU 时有效） */
  memoryMaxSize?: number
  /** 是否启用 LRU 淘汰 */
  enableLRU?: boolean
  /** 是否启用智能重试 */
  enableRetry?: boolean
  /** 重试配置 */
  retryConfig?: RetryConfig
  /** 是否启用请求合并 */
  enableMerge?: boolean
}

/**
 * 重试配置接口
 */
export interface RetryConfig {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  retryableErrors?: (error: any) => boolean
  onRetry?: (error: any, attempt: number) => void
  onSuccess?: (result: any, attempt: number) => void
}

/**
 * 缓存条目接口
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number
  _version?: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  key: string
  hits: number
  misses: number
  size: number
  timestamp: number
  ttl: number
  expired: boolean
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
