/**
 * 请求合并管理器
 * 避免同时发起多个相同的请求
 */

export class RequestMergeManager {
  private pendingRequests = new Map<string, Promise<any>>()

  /**
   * 合并请求
   * 如果已经有相同的请求在进行，返回相同的 Promise
   */
  async mergeRequest<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // 检查是否有相同的请求在进行
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }

    // 创建新请求
    const promise = fetcher().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  /**
   * 检查是否有待处理的请求
   */
  hasPending(key: string): boolean {
    return this.pendingRequests.has(key)
  }

  /**
   * 获取所有待处理的请求键
   */
  getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  /**
   * 取消指定请求
   */
  cancelRequest(key: string): boolean {
    return this.pendingRequests.delete(key)
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAllRequests(): void {
    this.pendingRequests.clear()
  }

  /**
   * 获取待处理的请求数量
   */
  get pendingCount(): number {
    return this.pendingRequests.size
  }
}

/**
 * 全局请求合并管理器实例
 */
export const globalRequestMerger = new RequestMergeManager()

/**
 * 创建请求合并 Hook
 */
export function useRequestMerge() {
  const merger = new RequestMergeManager()

  return {
    mergeRequest: <T>(key: string, fetcher: () => Promise<T>) => {
      return merger.mergeRequest(key, fetcher)
    },
    hasPending: (key: string) => merger.hasPending(key),
    cancelRequest: (key: string) => merger.cancelRequest(key),
    cancelAll: () => merger.cancelAllRequests(),
    getPendingKeys: () => merger.getPendingKeys(),
    pendingCount: computed(() => merger.pendingCount),
  }
}
