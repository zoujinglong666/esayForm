/**
 * 基础数据缓存管理
 * 统一实现：TTL + 全局共享 + 版本控制 + LRU + 智能重试 + 请求合并
 */

import type { CacheEntry, CacheStats, RetryConfig } from './types'
import { LRUCache } from './cache-lru'
import { RetryManager } from './retry'
import { RequestMergeManager } from './request-merge'

/**
 * 缓存版本号
 * 数据结构变更时递增，旧缓存自动失效
 */
const CACHE_VERSION = 3

/**
 * 全局缓存存储
 */
const globalCache = new Map<string, any>()

/**
 * 全局加载 Promise（请求去重）
 */
const loadingPromises = new Map<string, Promise<void>>()

/**
 * 全局 LRU 缓存
 */
const lruCache = new LRUCache<string, any>(100)

/**
 * 全局请求合并管理器
 */
const globalRequestMerger = new RequestMergeManager()

/**
 * 缓存统计
 */
const cacheStats = new Map<string, CacheStats>()

/**
 * 获取缓存存储键
 */
function getCacheKey(key: string): string {
  return `basic-data:v${CACHE_VERSION}:${key}`
}

/**
 * 从 localStorage 读取缓存
 */
function readFromStorage<T>(key: string): CacheEntry<T> | null {
  try {
    const storageKey = getCacheKey(key)
    const item = localStorage.getItem(storageKey)
    if (!item) return null
    const entry = JSON.parse(item)
    if (entry._version !== CACHE_VERSION) {
      localStorage.removeItem(storageKey)
      return null
    }
    return entry
  } catch {
    return null
  }
}

/**
 * 写入缓存到 localStorage
 */
function writeToStorage<T>(key: string, entry: CacheEntry<T>): void {
  try {
    const storageKey = getCacheKey(key)
    const dataToStore = { ...entry, _version: CACHE_VERSION }
    localStorage.setItem(storageKey, JSON.stringify(dataToStore))
  } catch (e) {
    console.warn(`[basicData] Failed to write cache: ${e}`)
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
    console.warn(`[basicData] Failed to remove cache: ${e}`)
  }
}

/**
 * 清理旧版本缓存
 */
function cleanupOldCache(): void {
  try {
    const currentPrefix = `basic-data:v${CACHE_VERSION}:`
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      // 清理旧版 basic-data 缓存和旧版 enhanced-cache
      if (k && (
        (k.startsWith('basic-data:') && !k.startsWith(currentPrefix))
        || k.startsWith('enhanced-cache:')
      )) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  } catch (e) {
    console.warn(`[basicData] Failed to cleanup old cache: ${e}`)
  }
}

// 启动时清理旧版本缓存
cleanupOldCache()

/**
 * 检查缓存是否过期
 */
function isExpired(entry: CacheEntry<any>, ttl: number): boolean {
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
    stats.size = globalCache.size
    cacheStats.set(key, stats)
  }
}

/**
 * 初始化缓存统计
 */
function initCacheStats(key: string, ttl: number): void {
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
}

/**
 * 带 TTL 的响应式缓存 Hook
 * 统一实现：内存 + localStorage 双层缓存、请求去重、LRU、智能重试、请求合并
 *
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param options 缓存配置
 */
export function useBasicDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl: number
    strategy?: 'memory' | 'localStorage' | 'hybrid'
    enableLRU?: boolean
    enableRetry?: boolean
    retryConfig?: RetryConfig
    enableMerge?: boolean
  } = { ttl: 5 * 60 * 1000 }
) {
  const {
    ttl,
    strategy = 'hybrid',
    enableLRU = false,
    enableRetry = false,
    retryConfig = {},
    enableMerge = true,
  } = options

  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 初始化统计
  initCacheStats(key, ttl)

  /**
   * 清除缓存
   */
  function clearCache(): void {
    data.value = null
    globalCache.delete(key)
    if (enableLRU) {
      lruCache.delete(key)
    }
    if (strategy === 'localStorage' || strategy === 'hybrid') {
      removeFromStorage(key)
    }
    const stats = cacheStats.get(key)
    if (stats) {
      stats.expired = true
      cacheStats.set(key, stats)
    }
  }

  /**
   * 加载数据
   */
  async function load(): Promise<void> {
    // 1. 请求去重：已有加载中的请求，等待它
    if (loadingPromises.has(key)) {
      return loadingPromises.get(key)
    }

    // 2. 检查 LRU 缓存
    if (enableLRU && lruCache.has(key)) {
      const lruValue = lruCache.get(key)
      if (lruValue !== undefined) {
        data.value = lruValue
        updateCacheStats(key, true)
        return
      }
    }

    // 3. 检查内存缓存
    if (globalCache.has(key)) {
      data.value = globalCache.get(key)
      updateCacheStats(key, true)
      return
    }

    // 4. 检查 localStorage 缓存
    if (strategy === 'localStorage' || strategy === 'hybrid') {
      const storageCache = readFromStorage<T>(key)
      if (storageCache && !isExpired(storageCache, ttl)) {
        data.value = storageCache.data
        globalCache.set(key, storageCache.data)
        if (enableLRU) {
          lruCache.set(key, storageCache.data)
        }
        updateCacheStats(key, true)
        return
      }
    }

    // 5. 请求合并：相同 key 的请求只发一次
    if (enableMerge && globalRequestMerger.hasPending(key)) {
      loading.value = true
      try {
        await globalRequestMerger.mergeRequest(key, () => fetcher())
        // 合并请求完成后，从内存缓存获取
        if (globalCache.has(key)) {
          data.value = globalCache.get(key)
        }
      } finally {
        loading.value = false
      }
      return
    }

    // 6. 从服务器获取
    const loadPromise = (async () => {
      loading.value = true
      error.value = null

      // 获取旧缓存用于降级
      let staleData: T | null = null
      if (strategy === 'localStorage' || strategy === 'hybrid') {
        const storageCache = readFromStorage<T>(key)
        if (storageCache) {
          staleData = storageCache.data
        }
      }

      try {
        let result: T

        if (enableRetry) {
          result = await RetryManager.fetchWithRetry(fetcher, {
            ...retryConfig,
            onRetry: (err, attempt) => {
              retryConfig.onRetry?.(err, attempt)
            },
          })
        } else {
          result = await fetcher()
        }

        data.value = result

        // 更新缓存
        const cacheEntry: CacheEntry<T> = {
          data: result,
          timestamp: Date.now(),
        }

        globalCache.set(key, result)
        if (enableLRU) {
          lruCache.set(key, result)
        }
        if (strategy === 'localStorage' || strategy === 'hybrid') {
          writeToStorage(key, cacheEntry)
        }

        // 清除请求合并状态
        if (enableMerge) {
          globalRequestMerger.cancelRequest(key)
        }

        // 更新统计
        const stats = cacheStats.get(key)
        if (stats) {
          stats.timestamp = cacheEntry.timestamp
          stats.size = globalCache.size
          stats.expired = false
          cacheStats.set(key, stats)
        }
      } catch (err) {
        error.value = err as Error
        updateCacheStats(key, false)

        // 降级：如果有旧缓存，使用旧数据
        if (staleData) {
          data.value = staleData
          globalCache.set(key, staleData)
        }
      } finally {
        loading.value = false
        loadingPromises.delete(key)
      }
    })()

    loadingPromises.set(key, loadPromise)
    return loadPromise
  }

  // 自动加载
  load()

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh: async () => {
      clearCache()
      return load()
    },
    clearCache,
    load,
  }
}

/**
 * 清除所有基础数据缓存
 */
export function clearAllBasicDataCache(): void {
  globalCache.clear()
  lruCache.clear()
  globalRequestMerger.cancelAllRequests()
  loadingPromises.clear()
  cacheStats.clear()

  Object.keys(localStorage)
    .filter(key => key.startsWith('basic-data:') || key.startsWith('enhanced-cache:'))
    .forEach(key => localStorage.removeItem(key))
}

/**
 * 预加载基础数据
 */
export async function preloadBasicData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl: number } = { ttl: 5 * 60 * 1000 }
): Promise<void> {
  const cache = useBasicDataCache(key, fetcher, options)
  await new Promise<void>((resolve) => {
    const unwatch = watch(
      () => cache.loading.value,
      (isLoading) => {
        if (!isLoading) {
          unwatch()
          resolve()
        }
      },
      { immediate: true }
    )
  })
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
