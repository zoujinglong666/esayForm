/**
 * 基础数据缓存管理
 * 实现 TTL 机制 + 全局共享缓存
 */

import type { CacheEntry, CacheConfig } from './types'

/**
 * 全局缓存存储
 */
const globalCache = new Map<string, any>()

/**
 * 全局加载状态
 */
const loadingPromises = new Map<string, Promise<void>>()

/**
 * 获取缓存存储键
 */
function getCacheKey(key: string): string {
  return `basic-data:${key}`
}

/**
 * 从 localStorage 读取缓存
 */
function readFromStorage<T>(key: string): CacheEntry<T> | null {
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
function writeToStorage<T>(key: string, entry: CacheEntry<T>): void {
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
 * 检查缓存是否过期
 */
function isExpired(entry: CacheEntry<any>, ttl: number): boolean {
  return Date.now() - entry.timestamp > ttl
}

/**
 * 带 TTL 的响应式缓存 Hook
 * 支持过期自动刷新、手动清除、全局共享
 */
export function useBasicDataCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl: number }
) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 从 localStorage 读取缓存
  const getStorageCache = (): CacheEntry<T> | null => {
    return readFromStorage<T>(key)
  }

  // 写入缓存到 localStorage
  const setStorageCache = (entry: CacheEntry<T>): void => {
    writeToStorage(key, entry)
  }

  // 清除缓存
  const clearCache = (): void => {
    data.value = null
    globalCache.delete(key)
    removeFromStorage(key)
  }

  // 检查缓存是否过期
  const checkExpired = (): boolean => {
    const cached = getStorageCache()
    if (!cached) return true
    return isExpired(cached, options.ttl)
  }

  // 加载数据（带去重）
  async function load(): Promise<void> {
    // 检查是否已有加载中的请求
    if (loadingPromises.has(key)) {
      return loadingPromises.get(key)
    }

    // 检查内存缓存
    if (globalCache.has(key)) {
      data.value = globalCache.get(key)
      return
    }

    // 检查 localStorage 缓存
    const storageCache = getStorageCache()
    if (storageCache && !isExpired(storageCache, options.ttl)) {
      data.value = storageCache.data
      globalCache.set(key, storageCache.data)
      return
    }

    // 创建加载 Promise
    const loadPromise = (async () => {
      loading.value = true
      error.value = null

      try {
        const result = await fetcher()
        data.value = result

        // 更新缓存
        const cacheEntry: CacheEntry<T> = {
          data: result,
          timestamp: Date.now(),
        }

        globalCache.set(key, result)
        setStorageCache(cacheEntry)
      } catch (err) {
        error.value = err as Error

        // 如果有旧缓存，降级使用
        if (storageCache) {
          data.value = storageCache.data
          globalCache.set(key, storageCache.data)
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
  }
}

/**
 * 清除所有基础数据缓存
 */
export function clearAllBasicDataCache(): void {
  globalCache.clear()
  Object.keys(localStorage)
    .filter(key => key.startsWith('basic-data:'))
    .forEach(key => localStorage.removeItem(key))
}

/**
 * 预加载基础数据
 */
export async function preloadBasicData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl: number }
): Promise<void> {
  const { load } = useBasicDataCache(key, fetcher, options)
  await load()
}
