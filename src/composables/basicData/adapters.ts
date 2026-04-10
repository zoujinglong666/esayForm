/**
 * 基础数据适配器
 * 将 API 返回的数据转换为统一的 label/value 格式
 */

import type { BaseDataItem, DictItem } from './types'

/**
 * 通用适配器配置
 */
export interface AdapterConfig {
  /** 用作 label 的字段名，默认 'name' */
  labelKey?: string
  /** 用作 value 的字段名，默认 'code' */
  valueKey?: string
  /** 用作 enabled 的字段名，默认 'enabled' */
  enabledKey?: string
  /** enabled 的真值映射（如 status === 1 视为启用） */
  enabledTruthy?: any
}

/**
 * 创建通用适配器
 * 通过传入 labelKey / valueKey 自动适配数据格式
 *
 * @example
 * ```ts
 * // 默认：label 取 name，value 取 code
 * const adapter = createAdapter()
 *
 * // 港口：label 取 portNameCn，value 取 portCode
 * const portAdapter = createAdapter({ labelKey: 'portNameCn', valueKey: 'portCode' })
 *
 * // 国家：label 取 countryName，value 取 countryCode
 * const countryAdapter = createAdapter({ labelKey: 'countryName', valueKey: 'countryCode' })
 * ```
 */
export function createAdapter(config: AdapterConfig = {}) {
  const {
    labelKey = 'name',
    valueKey = 'code',
    enabledKey = 'enabled',
    enabledTruthy,
  } = config

  return {
    /**
     * 转换 API 响应为标准 BaseDataItem 格式
     */
    transform(response: any): BaseDataItem[] {
      const items = Array.isArray(response) ? response : response?.data || []

      return items.map((item: any) => ({
        ...item,
        code: item[valueKey] ?? item.code,
        name: item[labelKey] ?? item.name,
        enabled: enabledTruthy !== undefined
          ? item[enabledKey] === enabledTruthy
          : (item[enabledKey] ?? true),
      }))
    },

    /**
     * 转换为 Element Plus 选项格式 { label, value }
     */
    toOptions<T extends BaseDataItem>(data: T[]): Array<{ label: string; value: any }> {
      return data.map(item => ({
        label: String(item.name ?? item[labelKey] ?? ''),
        value: item.code ?? item[valueKey],
      }))
    },

    /**
     * 根据关键词过滤数据
     */
    filterByKeyword<T extends BaseDataItem>(data: T[], keyword: string): T[] {
      if (!keyword) return data
      const lowerKeyword = keyword.toLowerCase()
      return data.filter(
        item =>
          String(item.name ?? item[labelKey]).toLowerCase().includes(lowerKeyword) ||
          String(item.code ?? item[valueKey]).toLowerCase().includes(lowerKeyword)
      )
    },

    /**
     * 根据 enabled 状态过滤
     */
    filterByEnabled<T extends BaseDataItem>(data: T[], enabled: boolean): T[] {
      return data.filter(item => item.enabled === enabled || item.enabled === undefined)
    },

    /**
     * 根据 code 查找数据项
     */
    findByCode<T extends BaseDataItem>(data: T[], code: any): T | undefined {
      return data.find(item => item.code === code)
    },
  }
}

/**
 * 默认适配器
 * label 取 name，value 取 code
 */
export const BaseAdapter = createAdapter()

/**
 * 字典适配器
 * 专门处理字典数据转换（value/label 格式）
 */
export const DictAdapter = {
  /**
   * 转换字典数据
   */
  transform(response: any, dictType?: string): DictItem[] {
    const items = Array.isArray(response) ? response : response?.data || []

    return items.map((item: any) => ({
      value: item.value ?? item.code,
      label: item.label ?? item.name,
      dictType,
      ...item,
    }))
  },

  /**
   * 转换为 Element Plus 选项格式
   */
  toOptions(items: DictItem[]): Array<{ label: string; value: any }> {
    return items.map(item => ({
      label: item.label,
      value: item.value,
    }))
  },

  /**
   * 根据 value 获取 label
   */
  getLabel(items: DictItem[], value: any): string {
    const item = items.find(i => i.value === value)
    return item ? item.label : String(value)
  },
}
