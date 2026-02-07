import { computed, Ref } from 'vue'
import type { FieldValues, PlusColumn } from '../../../../../Library/Containers/com.tencent.xinWeChat/Data/Documents/xwechat_files/wxid_r1gzen2f53th22_fdd8/msg/file/2026-02/ctmy_erp_vue.git/src/components/PlusTable/types'
export interface PlusFormExpose {
  // 表单实例（Element Plus FormInstance）
  formInstance: any

  // 当前表单值
  values: FieldValues

  // 表单值操作
  setFieldsValue: (model: FieldValues) => void
  resetFields: () => void
  clearValidate: (props?: string | string[]) => void
  validate: (callback?: (isValid: boolean) => void) => Promise<any>

  // 表单提交
  handleSubmit: () => Promise<boolean>

  // 动态结构操作
  setColumn: (columns: PlusColumn[]) => void
  addColumn: (
    column: PlusColumn,
    referenceProp?: string | number,
    position?: 'before' | 'after'
  ) => void
  delColumn: (prop: string) => void
}

/**
 * 封装 PlusForm 常用方法，提供类型安全的操作接口
 * @param plusFormRef - PlusForm 组件的 ref 引用
 */
export const usePlusFormCommonMethods = (plusFormRef: Ref<any>) => {
  const formInstance = computed(() => plusFormRef.value?.formInstance || null)
  const values = computed<FieldValues>(() => plusFormRef.value?.values || {})

  const setFieldsValue = (model: FieldValues): void => {
    if (!plusFormRef.value || !model || typeof model !== 'object') return
    plusFormRef.value.setFieldsValue?.(model)
  }

  const resetFields = (): void => {
    if (!plusFormRef.value) return
    plusFormRef.value.resetFields?.()
  }

  const clearValidate = (props?: string | string[]): void => {
    if (formInstance.value && typeof formInstance.value.clearValidate === 'function') {
      formInstance.value.clearValidate(props)
    }
  }

  const setColumn = (columns: PlusColumn[]): void => {
    if (!Array.isArray(columns)) {
      console.warn('[usePlusFormCommonMethods] setColumn 参数必须是 PlusColumn[]')
      return
    }
    plusFormRef.value?.setColumn?.(columns)
  }

  const addColumn = (
    column: PlusColumn,
    referenceProp?: string | number,
    position: 'before' | 'after' = 'after'
  ): void => {
    if (!column?.prop) {
      console.error('[usePlusFormCommonMethods] addColumn 缺少 prop 字段')
      return
    }
    plusFormRef.value?.addColumn?.(column, referenceProp, position)
  }

  const delColumn = (prop: string): void => {
    if (!prop || typeof prop !== 'string') {
      console.error('[usePlusFormCommonMethods] delColumn 需要有效的字符串 prop')
      return
    }
    plusFormRef.value?.delColumn?.(prop)
  }

  const validate = async (): Promise<boolean> => {
    if (!formInstance.value) return false
    try {
      await formInstance.value.validate()
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (): Promise<boolean> => {
    const valid = await validate()
    if (valid && typeof plusFormRef.value?.handleSubmit === 'function') {
      return await plusFormRef.value.handleSubmit()
    }
    return false
  }

  return {
    // 响应式数据
    formInstance,
    values,
    getFormModel: values,

    // 表单值控制
    setFieldsValue,
    resetFields,
    clearValidate,
    validate,
    handleSubmit,

    // 动态结构控制
    setColumn,
    addColumn,
    delColumn
  }
}
