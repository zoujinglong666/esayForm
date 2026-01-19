import type { FieldValueType } from '@/components/PlusTable/types'

/**
 * 安全比较值
 */
function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a === 'string' && typeof b === 'number') return a === String(b)
  if (typeof a === 'number' && typeof b === 'string') return String(a) === b
  return false
}

function getLabelFromOptions(value: any, options: Array<{ label: string; value: any }>): string {
  if (!options?.length) return String(value)
  const option = options.find(opt => isEqual(opt.value, value))
  return option?.label != null ? String(option.label) : String(value)
}

function handleArrayValue(value: any[], options: Array<{ label: string; value: any }>): string {
  if (!value.length) return ''
  return value
    .map(val => getLabelFromOptions(val, options))
    .filter(label => label !== '')
    .join(', ')
}

/**
 * 格式化单个日期/时间值
 */
function formatSingleDate(value: any, valueType?: string): string {
  let date: Date

  // 尝试解析为 Date
  if (value instanceof Date && !isNaN(value.getTime())) {
    date = value
  } else if (typeof value === 'string') {
    // 支持 ISO、YYYY-MM-DD、YYYY-MM-DD HH:mm:ss、中文 Date 字符串等
    date = new Date(value)
    if (isNaN(date.getTime())) {
      return value // 解析失败，原样返回
    }
  } else {
    return String(value)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // 根据 valueType 决定格式
  if (valueType === 'datetime-picker' || valueType === 'date-time') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
  if (valueType === 'time-picker') {
    return `${hours}:${minutes}:${seconds}`
  }
  // 默认：date-picker 或其他 → 只显示日期
  return `${year}-${month}-${day}`
}

/**
 * 获取详情模式下的显示文本
 */
export function getDisplayValue(
  value: FieldValueType,
  valueType?: string,
  options: Array<{ label: string; value: any }> = []
): string {
  if (value == null || value === '') {
    return ''
  }

  // 数组：日期范围 or 多选
  if (Array.isArray(value)) {
    if (['select', 'select-v2', 'checkbox'].includes(valueType ?? '') ||
      (valueType === 'radio' && value.length > 0)) {
      return handleArrayValue(value, options)
    }
    if (['date-picker', 'datetime-picker', 'time-picker'].includes(valueType ?? '')) {
      return value.map(v => formatSingleDate(v, valueType)).join(' 至 ')
    }
    return value.join(', ')
  }

  // 单选类型（select/radio）
  if (['radio', 'select', 'select-v2'].includes(valueType ?? '') && options.length > 0) {
    return getLabelFromOptions(value, options)
  }

  // 开关
  if (valueType === 'switch') {
    return value ? '是' : '否'
  }

  // 日期/时间类型（单值）
  if (['date-picker', 'datetime-picker', 'time-picker'].includes(valueType ?? '')) {
    return formatSingleDate(value, valueType)
  }

  // 默认
  return String(value)
}
