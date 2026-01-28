// 判断是否是控制字段
import { OptionsRow, PlusColumn } from '@/components/PlusTable/types'
import { isPromise, isArray, isFunction } from '@/utils/is'
import { isRef, unref } from 'vue'

function isControlField(col: any): boolean {
  return (
    col.isControlField ||
    (col.children?.prop &&
      Array.isArray(col.fieldProps?.options) &&
      col.fieldProps.options.some((opt: any) => opt.children || opt.value !== undefined))
  )
}

// 构建 controlFieldConfigs
function buildControlFieldConfigs(columns: any[]): {
  controlProp: string
  childProp: string
  options: any[]
  useValueAsField: boolean
}[] {
  const configs = []

  for (const col of columns) {
    if (!isControlField(col)) continue

    if (col.children?.prop && Array.isArray(col.fieldProps?.options)) {
      const useValueAsField = col.fieldProps.options.every((opt: any) => !Array.isArray(opt.fields))

      // @ts-ignore
      configs.push({
        controlProp: col.prop,
        childProp: col.children.prop,
        options: col.fieldProps.options,
        useValueAsField
      })
    }
  }

  return configs
}

// 收集需要保留的字段名（keepKeys）
function collectKeepKeys(formData: Record<string, any>, columns: any[]): Set<string> {
  const keepKeys = new Set<string>()

  for (const col of columns) {
    if (isControlField(col)) {
      const selectedValue = formData[col.prop]

      // 情况1：options 中有 fields 字段
      if (
        Array.isArray(col.fieldProps?.options) &&
        col.fieldProps.options.some((opt: any) => Array.isArray(opt.fields))
      ) {
        if (typeof selectedValue === 'string') {
          const matchedOption = col.fieldProps.options.find(
            (opt: any) => opt.value === selectedValue && Array.isArray(opt.fields)
          )
          if (matchedOption) {
            matchedOption.fields.forEach((field: string) => {
              if (typeof field === 'string') keepKeys.add(field)
            })
          }
        }
      }
      // 情况2：动态子字段 —— 使用 option.value 作为字段名
      else if (
        Array.isArray(col.fieldProps?.options) &&
        col.fieldProps.options.some((opt: any) => opt.children)
      ) {
        if (typeof selectedValue === 'string') {
          keepKeys.add(selectedValue)
        }
      }
      // 情况3：旧结构（realKeys）或直接使用 value 作为字段
      else {
        if (Array.isArray(selectedValue)) {
          selectedValue.forEach((key) => keepKeys.add(key))
        } else if (typeof selectedValue === 'string') {
          if (Array.isArray(col.realKeys) && col.realKeys.includes(selectedValue)) {
            keepKeys.add(selectedValue)
          } else {
            keepKeys.add(selectedValue)
          }
        }
      }
    } else {
      keepKeys.add(col.prop)
      if (col.children && !col.children.isPlaceholder) {
        keepKeys.add(col.children.prop)
      }
    }
  }

  return keepKeys
}

// 构建基础结果（过滤空值）
function buildBaseResult(
  formData: Record<string, any>,
  keepKeys: Set<string>
): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in formData) {
    if (keepKeys.has(key)) {
      const val = formData[key]
      if (val != null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        result[key] = val
      }
    }
  }
  return result
}

// 执行动态补全逻辑
function applyDynamicCompletion(
  result: Record<string, any>,
  formData: Record<string, any>,
  controlFieldConfigs: {
    controlProp: string
    childProp: string
    options: any[]
    useValueAsField: boolean
  }[]
): void {
  for (const config of controlFieldConfigs) {
    const { controlProp, childProp, options, useValueAsField } = config
    const controlValue = formData[controlProp]
    const childValue = formData[childProp]

    if (typeof controlValue === 'string' && Array.isArray(options)) {
      const matchedOption = options.find((opt: any) => opt.value === controlValue)
      if (!matchedOption) continue

      if (useValueAsField) {
        const targetField = controlValue
        if (childValue != null && childValue !== '' && result[targetField] === undefined) {
          result[targetField] = childValue
        }
      } else if (Array.isArray(matchedOption.fields)) {
        if (
          matchedOption.fields.length === 2 &&
          Array.isArray(childValue) &&
          childValue.length === 2
        ) {
          const [startField, endField] = matchedOption.fields
          const [startVal, endVal] = childValue
          if (startVal !== undefined && result[startField] === undefined) {
            result[startField] = startVal
          }
          if (endVal !== undefined && result[endField] === undefined) {
            result[endField] = endVal
          }
        } else if (matchedOption.fields.length === 1 && childValue != null && childValue !== '') {
          const targetField = matchedOption.fields[0]
          if (result[targetField] === undefined) {
            result[targetField] = childValue
          }
        }
      }
    }
  }
}

// 主函数
function getFinalFormData(formData: Record<string, any>, columns: any[]): Record<string, any> {
  const keepKeys = collectKeepKeys(formData, columns)
  const result = buildBaseResult(formData, keepKeys)
  const controlFieldConfigs = buildControlFieldConfigs(columns)
  applyDynamicCompletion(result, formData, controlFieldConfigs)
  return result
}

const getOptionsSync = (options: unknown): OptionsRow[] => {
  if (!options) return []

  // 1. 数组
  if (isArray(options)) {
    return options
  }

  // 2. Ref / Reactive
  if (isRef(options)) {
    const val = unref(options)
    return isArray(val) ? val : []
  }

  // 3. 同步函数
  if (isFunction(options)) {
    try {
      const result = (options as Function)()
      return isArray(result) ? result : []
    } catch (err) {
      console.warn('[getOptionsSync] function threw error:', err)
      return []
    }
  }

  // 4. 其他（如对象、字符串等）→ 视为无效
  return []
}

// 异步版本：处理所有类型，包括 Promise 和 async 函数
const getOptionsAsync = async (options: unknown): Promise<OptionsRow[]> => {
  if (!options) return []

  // 1. 数组
  if (isArray(options)) {
    return options
  }
  // 2. Ref / Reactive
  if (isRef(options)) {
    const val = unref(options)
    if (isArray(val)) return val
    if (isPromise(val)) return await val
    if (isFunction(val)) {
      const res = val()
      return isArray(res) ? res : await (isPromise(res) ? res : [])
    }
    return []
  }

  // 3. Promise
  if (isPromise(options)) {
    try {
      const res = await options
      return isArray(res) ? res : []
    } catch (err) {
      console.warn('[getOptionsAsync] promise rejected:', err)
      return []
    }
  }

  // 4. 函数（可能返回 Promise 或数组）
  if (isFunction(options)) {
    try {
      const result = (options as Function)()
      if (isPromise(result)) {
        const res = await result
        return isArray(res) ? res : []
      }
      return isArray(result) ? result : []
    } catch (err) {
      console.warn('[getOptionsAsync] function threw error:', err)
      return []
    }
  }

  // 5. 其他类型
  return []
}

const getDefaultValueObject = (columns: PlusColumn[]) => {
  const result: Record<string, any> = {}
  columns.forEach((col) => {
    // 1. 当前层级 defaultValue
    if (col.defaultValue !== undefined) {
      result[col.prop] = col.defaultValue
    }

    // 2. children 内也可能有 defaultValue
    // @ts-ignore
    if (col.children && col.children?.defaultValue !== undefined) {
      result[col.children.prop] = col.children.defaultValue
    }
  })

  return result
}

export { getFinalFormData, getOptionsSync, getOptionsAsync, getDefaultValueObject }
