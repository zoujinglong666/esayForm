import type { FieldValueType } from '@/components/PlusTable/types'

/**
 * 获取详情模式下的显示文本
 */
export function getDisplayValue(
  value: FieldValueType,
  valueType?: string,
  options: Array<{ label: string; value: any }> = []
): string {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  // 处理单选框和下拉选择
  if ((valueType === 'radio' || valueType === 'select' || valueType === 'select-v2') && options.length > 0) {
    if (Array.isArray(value)) {
      // 多选情况
      const selectedLabels = value
        .map(val => {
          const option = options.find(opt => opt.value === val)
          return option ? option.label : val
        })
        .filter(Boolean)
      return selectedLabels.join(', ') || ''
    } else {
      // 单选情况
      const option = options.find(opt => opt.value === value)
      return option ? option.label : String(value)
    }
  }

  // 处理复选框
  if (valueType === 'checkbox' && options.length > 0) {
    if (Array.isArray(value)) {
      const selectedLabels = value
        .map(val => {
          const option = options.find(opt => opt.value === val)
          return option ? option.label : val
        })
        .filter(Boolean)
      return selectedLabels.join(', ') || ''
    }
  }

  // 处理开关
  if (valueType === 'switch') {
    return value ? '是' : '否'
  }

  // 处理日期和时间范围
  if ((valueType === 'date-picker' || valueType === 'time-picker') && Array.isArray(value)) {
    return value.join(' 至 ')
  }

  // 处理数组类型的值
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : ''
  }

  // 默认转换为字符串
  return String(value)
}
