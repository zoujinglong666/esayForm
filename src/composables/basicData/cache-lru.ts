/**
 * LRU 缓存实现
 * 最近最少使用淘汰策略
 */

export class LRUCache<K, V> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 重新插入，更新访问顺序
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    // 先删除（如果存在），再插入
    this.cache.delete(key)
    this.cache.set(key, value)

    // 超过容量，删除最久未使用的
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value as K
      this.cache.delete(firstKey)
    }
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  /**
   * 获取所有值
   */
  values(): IterableIterator<V> {
    return this.cache.values()
  }

  /**
   * 遍历缓存
   */
  forEach(callback: (value: V, key: K, map: Map<K, V>) => void): void {
    this.cache.forEach(callback)
  }
}
