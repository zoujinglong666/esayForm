import type { Component, ComputedRef } from 'vue'
import type { FormRules, RowProps, ColProps, CardProps, ComponentSize } from 'element-plus'
import type { PlusColumn, FieldValues, Mutable, RecordType } from '@/components/PlusTable/types'

/**
 * fork https://github.com/element-plus/element-plus/blob/dev/packages/components/form/src/form.ts#L14-L110
 */
export type ElementPlusFormProps = {
  /**
   * @description Control the size of components in this form.
   */
  size: ComponentSize
  /**
   * @description Whether to disable all components in this form. If set to `true`, it will override the `disabled` prop of the inner component.
   */
  disabled: boolean
  /**
   * @description Data of form component.
   */
  model?: RecordType
  /**
   * @description Validation rules of form.
   */
  rules: FormRules
  /**
   * @description Position of label. If set to `'left'` or `'right'`, `label-width` prop is also required.
   */
  labelPosition: 'left' | 'right' | 'top'
  /**
   * @description Position of asterisk.
   */
  requireAsteriskPosition: 'left' | 'right'
  /**
   * @description Width of label, e.g. `'50px'`. All its direct child form items will inherit this value. `auto` is supported.
   */
  labelWidth: string | number
  /**
   * @description Suffix of the label.
   */
  labelSuffix: string
  /**
   * @description Whether the form is inline.
   */
  inline: boolean
  /**
   * @description Whether to display the error message inline with the form item.
   */
  inlineMessage: boolean
  /**
   * @description Whether to display an icon indicating the validation result.
   */
  statusIcon: boolean
  /**
   * @description Whether to show the error message.
   */
  showMessage: boolean
  /**
   * @description Whether to trigger validation when the `rules` prop is changed.
   */
  validateOnRuleChange: boolean
  /**
   * @description Whether to hide required fields should have a red asterisk (star) beside their labels.
   */
  hideRequiredAsterisk: boolean
  /**
   * @description When validation fails, scroll to the first error form entry.
   */
  scrollToError: boolean
  /**
   * @description When validation fails, it scrolls to the first error item based on the scrollIntoView option.
   * @version 2.3.2
   */
  scrollIntoViewOptions: RecordType | boolean
}

/**
 * 分组表单配置项
 */
export interface PlusFormGroupRow {
  title: string
  icon?: Component
  /**
   * @desc 分组表单el-card的props，优先级高于整体的cardProps
   * @version v0.1.1
   */
  cardProps?: Partial<Mutable<CardProps>>
  hideInGroup?: boolean | ComputedRef<boolean>
  columns: PlusColumn[]
}

export type PlusFormSelfProps = {
  modelValue?: FieldValues
  defaultValues?: FieldValues
  columns?: PlusColumn[]
  labelWidth?: ElementPlusFormProps['labelWidth']
  labelPosition?: ElementPlusFormProps['labelPosition']
  rowProps?: Partial<Mutable<RowProps>>
  colProps?: Partial<Mutable<ColProps>>
  labelSuffix?: ElementPlusFormProps['labelSuffix']
  hasErrorTip?: boolean
  hasFooter?: boolean
  hasReset?: boolean
  hasLabel?: boolean
  submitText?: string
  resetText?: string
  submitLoading?: boolean
  footerAlign?: 'left' | 'right' | 'center'
  rules?: ElementPlusFormProps['rules']
  group?: false | PlusFormGroupRow[]
  cardProps?: Partial<Mutable<CardProps>>
  /**
   * @desc 阻止el-form的默认提交表单行为
   * @version v0.1.12
   */
  prevent?: boolean
}

export type PlusFormProps = PlusFormSelfProps & Partial<ElementPlusFormProps> & RecordType

export interface PlusFormState {
  values: FieldValues
  subColumns: PlusColumn[]
}
export interface PlusFormEmits {
  (e: 'update:modelValue', values: FieldValues): void
  (e: 'submit', values: FieldValues): void
  (e: 'change', values: FieldValues, column: PlusColumn): void
  (e: 'reset', values: FieldValues): void
  (e: 'submitError', errors: unknown): void
  (e: 'validate', ...args: any[]): boolean
}
