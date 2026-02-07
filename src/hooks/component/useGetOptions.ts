import type { Ref } from 'vue'
import { ref, isRef, watch, isReactive } from 'vue'
import { isPromise, isFunction, isArray, isPlainObject } from '@/utils/is'
import type { OptionsRow, PlusColumn } from '@/components/PlusTable/types'

const toRawType = (value: unknown): string => {
  return Object.prototype.toString.call(value).slice(8, -1)
}

const throwError = (data: unknown) => {
  if (!isArray(data)) {
    console.error('Uncaught TypeError: ', `options expected Array but got ${toRawType(data)}`)
  }
}

const getOptionsByOptionsMap = (optionsList: OptionsRow[], column: PlusColumn): OptionsRow[] => {
  const anyColumn = column as any
  const optionsMap = anyColumn.optionsMap || {}
  const valueType = anyColumn.valueType

  if (valueType === 'cascader' || !isPlainObject(optionsMap)) {
    return optionsList || []
  }

  const labelKey = optionsMap.label || 'label'
  const valueKey = optionsMap.value || 'value'

  const mapped = (optionsList || []).map((item: any) => {
    const label = item[labelKey]
    const value = item[valueKey]
    const origin = {
      [labelKey]: label,
      [valueKey]: value
    }
    return {
      ...item,
      __origin: origin,
      label,
      value
    }
  })

  return mapped || []
}

const useGetOptions = (
  props: any,
  rowArg?: Record<string, any> | Ref<Record<string, any>>,
  rowIndexArg?: number
): {
  customOptions: Ref<OptionsRow[]>
  customOptionsIsReady: Ref<boolean>
} => {
  const options = ref<OptionsRow[]>([])
  const optionsIsReady = ref<boolean>(false)

  const column = ((props as any)?.column || props) as PlusColumn
  const row = (props as any)?.row ?? rowArg
  const rowIndex = (props as any)?.index ?? rowIndexArg

  /**
   * 统一获取 options 配置来源：
   * - 优先使用 props.options
   * - 若未配置，再尝试 props.fieldProps.options（兼容在 fieldProps 里写 options 的用法）
   */
  const getOptionsProp = () => {
    const anyColumn = column as any
    if (anyColumn.options != null) {
      return anyColumn.options
    }
    const fieldProps = anyColumn.fieldProps
    if (fieldProps && (fieldProps as any).options != null) {
      return (fieldProps as any).options
    }
    return undefined
  }

  const rawOptions = getOptionsProp()

  if (!rawOptions) {
    options.value = []
    optionsIsReady.value = true
  } else if (isRef(rawOptions) || isReactive(rawOptions) || isArray(rawOptions)) {
    // computed或者数组
    watch(
      () => getOptionsProp(),
      (val) => {
        const value = isRef(val) ? val.value : val
        options.value = getOptionsByOptionsMap((value || []) as OptionsRow[], column)
        optionsIsReady.value = true
      },
      {
        immediate: true,
        deep: true
      }
    )
  } else if (isFunction(rawOptions)) {
    // 函数或Promise（支持按行动态变化）
    const getValue = rawOptions as any

    const compute = async () => {
      let result

      const hasRowContext = row !== undefined

      if (hasRowContext) {
        const contextRow = isRef(row) || isReactive(row) ? row : row || { [column.prop]: '' }
        const valueRow = isRef(contextRow) ? contextRow.value : contextRow
        const contextIndex = rowIndex !== undefined ? rowIndex : 0
        const cellValue = (valueRow as Record<string, any>)?.[column.prop]

        // 与 render 保持一致：优先支持 (value, ctx) 旧签名
        const ctx = {
          row: valueRow,
          column,
          index: contextIndex,
          rowIndex: contextIndex,
          prop: column.prop,
          valueType: column.valueType
        }

        const arity = getValue.length

        if (arity === 3) {
          result = getValue(valueRow, column, contextIndex)
        } else if (arity === 2) {
          result = getValue(cellValue, ctx)
        } else if (arity === 1) {
          result = getValue(column)
        } else {
          result = getValue(cellValue, ctx)
        }
      } else {
        result = getValue.length > 0 ? getValue(column) : getValue()
      }

      if (isPromise(result)) {
        const res = await (result as Promise<OptionsRow[]>)
        options.value = getOptionsByOptionsMap(res || [], column)
        optionsIsReady.value = true
        throwError(options.value)
      } else {
        const list = (result || []) as OptionsRow[]
        options.value = getOptionsByOptionsMap(list, column)
        optionsIsReady.value = true
        throwError(options.value)
      }
    }

    // 监听 row / options 变化，动态刷新
    watch(
      () => [getOptionsProp(), row],
      () => {
        compute().catch((err: unknown) => {
          throw err
        })
      },
      {
        immediate: true,
        deep: true
      }
    )
  } else if (isPromise(rawOptions)) {
    // 本身是一个Promise
    const getValue = rawOptions as Promise<OptionsRow[]>
    getValue
      .then((res: OptionsRow[]) => {
        options.value = getOptionsByOptionsMap(res || [], column)
        optionsIsReady.value = true
        throwError(options.value)
      })
      .catch((err: unknown) => {
        throw err
      })
  } else {
    optionsIsReady.value = true
    throwError(rawOptions)
  }
  return { customOptions: options, customOptionsIsReady: optionsIsReady }
}
export default useGetOptions
