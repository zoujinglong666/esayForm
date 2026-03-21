/**
 * 基础数据适配器
 * 将 API 返回的数据转换为统一的 label/value 格式
 * 支持 nameEn 国际化
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
  /** 用作英文 label 的字段名，默认 'nameEn' */
  labelEnKey?: string
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
 * // 国家：label 取 countryName，英文取 countryNameEn，value 取 countryCode
 * const countryAdapter = createAdapter({
 *   labelKey: 'countryName',
 *   labelEnKey: 'countryNameEn',
 *   valueKey: 'countryCode',
 * })
 * ```
 */
export function createAdapter(config: AdapterConfig = {}) {
  const {
    labelKey = 'name',
    valueKey = 'code',
    labelEnKey = 'nameEn',
    enabledKey = 'enabled',
    enabledTruthy,
  } = config

  return {
    /**
     * 转换 API 响应为标准 BaseDataItem 格式
     * 保留原始字段，覆盖标准化字段
     */
    transform(response: any): BaseDataItem[] {
      const items = Array.isArray(response) ? response : response?.data || []

      return items.map((item: any) => ({
        ...item,
        code: item[valueKey] ?? item.code,
        name: item[labelKey] ?? item.name,
        nameEn: item[labelEnKey] ?? item.nameEn,
        enabled: enabledTruthy !== undefined
          ? item[enabledKey] === enabledTruthy
          : (item[enabledKey] ?? true),
      }))
    },

    /**
     * 转换为 Element Plus 选项格式 { label, value }
     * @param data 数据列表
     * @param useEnglish 是否使用英文名称
     */
    toOptions<T extends BaseDataItem>(
      data: T[],
      useEnglish = false
    ): Array<{ label: string; value: any }> {
      return data.map(item => ({
        label: String(
          useEnglish
            ? (item.nameEn ?? item.name ?? item[labelKey] ?? '')
            : (item.name ?? item[labelKey] ?? '')
        ),
        value: item.code ?? item[valueKey],
      }))
    },

    /**
     * 根据关键词过滤数据
     * 同时匹配 name、nameEn 和 code
     */
    filterByKeyword<T extends BaseDataItem>(data: T[], keyword: string): T[] {
      if (!keyword) return data
      const lowerKeyword = keyword.toLowerCase()
      return data.filter(
        item =>
          String(item.name ?? item[labelKey] ?? '').toLowerCase().includes(lowerKeyword) ||
          String(item.nameEn ?? item[labelEnKey] ?? '').toLowerCase().includes(lowerKeyword) ||
          String(item.code ?? item[valueKey] ?? '').toLowerCase().includes(lowerKeyword)
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
 * 专门处理字典数据转换（value/label/labelEn 格式）
 */
export const DictAdapter = {
  /**
   * 转换字典数据
   * 保留原始字段，覆盖标准化字段
   */
  transform(response: any, dictType?: string): DictItem[] {
    const items = Array.isArray(response) ? response : response?.data || []

    return items.map((item: any) => ({
      ...item,
      value: item.value ?? item.code,
      label: item.label ?? item.name,
      labelEn: item.labelEn ?? item.nameEn ?? item.label ?? '',
      dictType,
    }))
  },

  /**
   * 转换为 Element Plus 选项格式
   * @param items 字典项列表
   * @param useEnglish 是否使用英文标签
   */
  toOptions(
    items: DictItem[],
    useEnglish = false
  ): Array<{ label: string; value: any }> {
    return items.map(item => ({
      label: String(useEnglish ? (item.labelEn ?? item.label ?? '') : (item.label ?? '')),
      value: item.value,
    }))
  },

  /**
   * 根据 value 获取 label
   * @param items 字典项列表
   * @param value 要查找的 value
   * @param useEnglish 是否使用英文标签
   */
  getLabel(items: DictItem[], value: any, useEnglish = false): string {
    const item = items.find(i => i.value === value)
    if (!item) return String(value)
    return String(useEnglish ? (item.labelEn ?? item.label ?? value) : (item.label ?? value))
  },
}
