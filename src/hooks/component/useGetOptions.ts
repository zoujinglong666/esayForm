import type { Ref } from 'vue'
import { ref, isRef, watch, isReactive } from 'vue'
import { isPromise, isFunction, isArray } from '@/utils/is'
import type { OptionsRow, PlusColumn } from '@/components/PlusTable/types'

const throwError = (data: unknown) => {
  if (!isArray(data)) {
    console.error('Uncaught TypeError: ', `options expected Array but got `)
  }
}

const useGetOptions = (
  props: PlusColumn,
  row?: Record<string, any> | Ref<Record<string, any>>,
  rowIndex?: number
): {
  customOptions: Ref<OptionsRow[]>
  customOptionsIsReady: Ref<boolean>
} => {
  const options = ref<OptionsRow[]>([])
  const optionsIsReady = ref<boolean>(false)

  if (!props.options) {
    options.value = []
    optionsIsReady.value = true
  } else if (isRef(props.options) || isReactive(props.options) || isArray(props.options)) {
    // computed或者数组
    watch(
      () => props.options,
      (val) => {
        const value = isRef(val) ? val.value : val
        options.value = value as OptionsRow[]
        optionsIsReady.value = true
      },
      {
        immediate: true,
        deep: true
      }
    )
  } else if (isFunction(props.options)) {
    // 函数或Promise（支持按行动态变化）
    const getValue = props.options as any

    const compute = async () => {
      let result

      // 根据函数参数个数区分新旧签名
      if (getValue.length === 3) {
        // 新签名: (row, column, rowIndex)
        const contextRow = isRef(row) || isReactive(row) ? row : row || { [props.prop]: '' }
        const valueRow = isRef(contextRow) ? contextRow.value : contextRow
        const contextIndex = rowIndex !== undefined ? rowIndex : 0
        result = getValue(valueRow, props, contextIndex)
      } else {
        // 旧签名: (props: PlusColumn)
        result = getValue(props)
      }

      // 函数返回一个Promise
      if (isPromise(result)) {
        const res = await (result as Promise<OptionsRow[]>)
        options.value = res
        optionsIsReady.value = true
        throwError(options.value)
      } else {
        // 同步函数
        options.value = result as OptionsRow[]
        optionsIsReady.value = true
      }
    }

    // 监听 row / options 变化，动态刷新
    watch(
      () => [props.options, row],
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
  } else if (isPromise(props.options)) {
    // 本身是一个Promise
    const getValue = props.options as Promise<OptionsRow[]>
    getValue
      .then((res: OptionsRow[]) => {
        options.value = res
        optionsIsReady.value = true
        throwError(options.value)
      })
      .catch((err: unknown) => {
        throw err
      })
  } else {
    optionsIsReady.value = true
    throwError(props.options)
  }
  return { customOptions: options, customOptionsIsReady: optionsIsReady }
}
export default useGetOptions
