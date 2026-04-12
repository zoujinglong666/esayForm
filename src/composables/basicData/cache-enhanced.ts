/**
 * 增强版缓存系统 v2.0
 * 支持混合缓存策略、LRU、智能重试、请求合并
 */

import type { CacheConfig } from './types'
import { LRUCache } from './cache-lru'
import { RetryManager, type RetryConfig } from './retry'
import { RequestMergeManager } from './request-merge'

/**
 * 增强缓存配置
 */
export interface EnhancedCacheConfig extends CacheConfig {
  strategy?: 'memory' | 'localStorage' | 'hybrid' // 缓存策略
  memoryMaxSize?: number // 内存缓存最大条目数
  enableLRU?: boolean // 是否启用 LRU 淘汰
  enableRetry?: boolean // 是否启用智能重试
  retryConfig?: RetryConfig // 重试配置
  enableMerge?: boolean // 是否启用请求合并
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
 * 增强缓存条目
 */
interface EnhancedCacheEntry<T> {
  data: T
  timestamp: number
  hits: number
  misses: number
}

/**
 * 全局增强缓存存储
 */
const enhancedCacheStore = new Map<string, EnhancedCacheEntry<any>>()
const lruCache = new LRUCache<string, any>(100)
const globalRequestMerger = new RequestMergeManager()

/**
 * 缓存统计信息存储
 */
const cacheStats = new Map<string, CacheStats>()

/**
 * 获取缓存存储键
 */
function getCacheKey(key: string): string {
  return `enhanced-cache:${key}`
}

/**
 * 检查缓存是否过期
 */
function isExpired(entry: EnhancedCacheEntry<any>, ttl: number): boolean {
  return Date.now() - entry.timestamp > ttl
}

/**
 * 更新缓存统计
 */
function updateCacheStats(key: string, hit: boolean): void {
  const stats = cacheStats.get(key)
  if (stats) {
    if (hit) {
      stats.hits++
    } else {
      stats.misses++
    }
    stats.size = enhancedCacheStore.size
    cacheStats.set(key, stats)
  }
}

/**
 * 从 localStorage 读取缓存
 */
function readFromStorage<T>(key: string): EnhancedCacheEntry<T> | null {
  try {
    const storageKey = getCacheKey(key)
    const item = localStorage.getItem(storageKey)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

/**
 * 写入缓存到 localStorage
 */
function writeToStorage<T>(key: string, entry: EnhancedCacheEntry<T>): void {
  try {
    const storageKey = getCacheKey(key)
    localStorage.setItem(storageKey, JSON.stringify(entry))
  } catch (e) {
    console.warn(`Failed to write cache to localStorage: ${e}`)
  }
}

/**
 * 从 localStorage 删除缓存
 */
function removeFromStorage(key: string): void {
  try {
    const storageKey = getCacheKey(key)
    localStorage.removeItem(storageKey)
  } catch (e) {
    console.warn(`Failed to remove cache from localStorage: ${e}`)
  }
}

/**
 * 增强版缓存 Hook
 * 支持混合缓存策略、LRU、智能重试、请求合并
 *
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param config 增强缓存配置
 * @returns 缓存 Hook 结果
 */
export function useEnhancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: EnhancedCacheConfig
) {
  const {
    ttl = 5 * 60 * 1000, // 默认 5 分钟
    strategy = 'hybrid',
    enableLRU = false,
    enableRetry = false,
    retryConfig = {},
    enableMerge = true,
  } = config

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const timestamp = ref<number | null>(null)
  const retryCount = ref(0)

  // 初始化缓存统计
  if (!cacheStats.has(key)) {
    cacheStats.set(key, {
      key,
      hits: 0,
      misses: 0,
      size: 0,
      timestamp: Date.now(),
      ttl,
      expired: true,
    })
  }

  /**
   * 从内存缓存读取
   */
  const getMemoryCache = (): T | null => {
    const entry = enhancedCacheStore.get(key)
    if (!entry) return null
    if (isExpired(entry, ttl)) {
      // 过期条目及时清理，避免内存泄漏
      enhancedCacheStore.delete(key)
      if (enableLRU) {
        lruCache.delete(key)
      }
      return null
    }
    updateCacheStats(key, true)
    return entry.data
  }

  /**
   * 写入内存缓存
   */
  const setMemoryCache = (value: T): void => {
    const entry: EnhancedCacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      hits: 0,
      misses: 0,
    }

    // LRU 模式
    if (enableLRU) {
      lruCache.set(key, value)
    }

    enhancedCacheStore.set(key, entry)
    timestamp.value = entry.timestamp

    // 更新统计
    const stats = cacheStats.get(key)
    if (stats) {
      stats.timestamp = entry.timestamp
      stats.size = enhancedCacheStore.size
      stats.expired = false
      cacheStats.set(key, stats)
    }
  }

  /**
   * 从 localStorage 缓存读取
   */
  const getStorageCache = (): T | null => {
    const entry = readFromStorage<T>(key)
    if (entry && !isExpired(entry, ttl)) {
      updateCacheStats(key, true)
      return entry.data
    }
    return null
  }

  /**
   * 写入缓存到存储
   */
  const setCacheToStorage = (value: T): void => {
    const entry: EnhancedCacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      hits: 0,
      misses: 0,
    }

    if (strategy === 'localStorage' || strategy === 'hybrid') {
      writeToStorage(key, entry)
    }
  }

  /**
   * 清除缓存
   */
  const clearCache = (): void => {
    data.value = null
    error.value = null
    timestamp.value = null
    retryCount.value = 0

    // 清除内存缓存
    enhancedCacheStore.delete(key)
    if (enableLRU) {
      lruCache.delete(key)
    }

    // 清除存储缓存
    if (strategy === 'localStorage' || strategy === 'hybrid') {
      removeFromStorage(key)
    }

    // 更新统计
    const stats = cacheStats.get(key)
    if (stats) {
      stats.expired = true
      cacheStats.set(key, stats)
    }
  }

  /**
   * 检查缓存是否过期
   */
  const checkExpired = (): boolean => {
    const stats = cacheStats.get(key)
    if (!stats) return true

    const entry = enhancedCacheStore.get(key)
    if (!entry) return true

    const expired = isExpired(entry, ttl)
    stats.expired = expired
    cacheStats.set(key, stats)
    return expired
  }

  /**
   * 从全局缓存同步数据到本地 ref
   */
  const syncFromGlobalCache = (): boolean => {
    // 优先从内存缓存同步
    const memoryValue = getMemoryCache()
    if (memoryValue !== null) {
      data.value = memoryValue as any
      return true
    }
    // 再从 localStorage 缓存同步
    if (strategy === 'localStorage' || strategy === 'hybrid') {
      const storageValue = getStorageCache()
      if (storageValue !== null) {
        data.value = storageValue as any
        return true
      }
    }
    return false
  }

  /**
   * 加载数据
   */
  async function load(): Promise<void> {
    // 请求合并模式：如果已有相同 key 的请求在进行中，等待其完成后同步数据
    if (enableMerge && globalRequestMerger.hasPending(key)) {
      loading.value = true
      try {
        await globalRequestMerger.mergeRequest(key, fetcher)
      } finally {
        loading.value = false
      }
      // 请求完成后，从全局缓存同步数据到本地 ref
      syncFromGlobalCache()
      return
    }

    // 检查 LRU 缓存
    if (enableLRU) {
      const lruValue = lruCache.get(key)
      if (lruValue !== undefined) {
        data.value = lruValue
        updateCacheStats(key, true)
        return
      }
    }

    // 检查内存缓存
    if (strategy === 'memory' || strategy === 'hybrid') {
      const memoryValue = getMemoryCache()
      if (memoryValue !== null) {
        data.value = memoryValue as any
        return
      }
    }

    // 检查 localStorage 缓存
    if (strategy === 'localStorage' || strategy === 'hybrid') {
      const storageValue = getStorageCache()
      if (storageValue !== null) {
        data.value = storageValue as any
        if (strategy === 'hybrid') {
          // 同步到内存缓存
          setMemoryCache(storageValue)
        }
        return
      }
    }

    // 需要从服务器获取
    loading.value = true
    error.value = null
    retryCount.value = 0

    try {
      let result: T

      // 启用重试
      if (enableRetry) {
        result = await RetryManager.fetchWithRetry(fetcher, {
          ...retryConfig,
          onRetry: (err, attempt) => {
            retryCount.value = attempt
            retryConfig.onRetry?.(err, attempt)
          },
        })
      } else {
        result = await fetcher()
      }

      // 更新数据
      data.value = result as any
      setMemoryCache(result)
      setCacheToStorage(result)

      // 清除请求合并状态
      if (enableMerge) {
        globalRequestMerger.cancelRequest(key)
      }
    } catch (err) {
      error.value = err as Error
      updateCacheStats(key, false)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 自动加载
  load()

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    timestamp: computed(() => timestamp.value),
    retryCount: computed(() => retryCount.value),
    isExpired: computed(() => checkExpired()),
    refresh: async () => {
      clearCache()
      return load()
    },
    clearCache,
  }
}

/**
 * 清除所有增强缓存
 */
export function clearAllEnhancedCache(): void {
  enhancedCacheStore.clear()
  lruCache.clear()
  globalRequestMerger.cancelAllRequests()

  // 清除 localStorage 中的缓存
  Object.keys(localStorage)
    .filter(key => key.startsWith('enhanced-cache:'))
    .forEach(key => localStorage.removeItem(key))

  // 清除缓存统计
  cacheStats.clear()
}

/**
 * 获取所有缓存统计信息
 */
export function getAllCacheStats(): CacheStats[] {
  const stats: CacheStats[] = []
  cacheStats.forEach((value) => {
    stats.push({ ...value })
  })
  return stats
}

/**
 * 获取指定缓存的统计信息
 */
export function getCacheStats(key: string): CacheStats | null {
  const stats = cacheStats.get(key)
  return stats ? { ...stats } : null
}

/**
 * 预热缓存
 */
export function preloadCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: EnhancedCacheConfig
): void {
  useEnhancedCache(key, fetcher, config)
}
