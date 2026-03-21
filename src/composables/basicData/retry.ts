/**
 * 智能重试管理器
 * 支持自动重试、指数退避、错误分类
 */

export interface RetryConfig {
  maxRetries?: number           // 最大重试次数
  retryDelay?: number          // 重试延迟（毫秒）
  exponentialBackoff?: boolean // 是否启用指数退避
  retryableErrors?: (error: any) => boolean // 判断是否可重试
  onRetry?: (error: any, attempt: number) => void // 重试回调
  onSuccess?: (result: any, attempt: number) => void // 成功回调
}

/**
 * 重试管理器
 */
export class RetryManager {
  /**
   * 带重试的数据获取
   */
  static async fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      exponentialBackoff = true,
      retryableErrors = (error) => RetryManager.isNetworkError(error),
      onRetry,
      onSuccess,
    } = config

    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fetcher()

        // 成功回调
        onSuccess?.(result, attempt)

        return result
      } catch (error) {
        lastError = error

        // 不可重试的错误，直接抛出
        if (!retryableErrors(error)) {
          throw error
        }

        // 最后一次尝试失败，抛出错误
        if (attempt === maxRetries) {
          throw error
        }

        // 计算延迟
        const delay = exponentialBackoff
          ? retryDelay * Math.pow(2, attempt)
          : retryDelay

        // 重试回调
        onRetry?.(error, attempt + 1)

        // 延迟重试
        await RetryManager.sleep(delay)
      }
    }

    throw lastError
  }

  /**
   * 判断是否为网络错误
   */
  static isNetworkError(error: any): boolean {
    if (!error) return false

    // 检查错误码
    if (error.code) {
      return [
        'NETWORK_ERROR',
        'TIMEOUT',
        'ECONNABORTED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
      ].includes(error.code)
    }

    // 检查 HTTP 状态码
    if (error.response?.status) {
      const status = error.response.status
      // 5xx 服务器错误可以重试
      // 429 Too Many Requests 可以重试
      // 408 Request Timeout 可以重试
      return (
        (status >= 500 && status < 600) ||
        status === 429 ||
        status === 408
      )
    }

    // 检查 Axios 错误类型
    if (error.__CANCEL__) {
      return false // 请求被取消，不重试
    }

    // 其他错误默认可以重试
    return true
  }

  /**
   * 延迟函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建重试 Hook
 */
export function useRetry<T>(
  fetcher: () => Promise<T>,
  config: RetryConfig = {}
) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const attemptCount = ref(0)

  const execute = async (): Promise<T> => {
    loading.value = true
    error.value = null
    attemptCount.value = 0

    try {
      const result = await RetryManager.fetchWithRetry(fetcher, {
        ...config,
        onRetry: (err, attempt) => {
          attemptCount.value = attempt
          config.onRetry?.(err, attempt)
        },
        onSuccess: (result, attempt) => {
          attemptCount.value = attempt
          config.onSuccess?.(result, attempt)
        },
      })

      data.value = result
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    attemptCount: computed(() => attemptCount.value),
    execute,
    reset: () => {
      data.value = null
      error.value = null
      attemptCount.value = 0
    },
  }
}
