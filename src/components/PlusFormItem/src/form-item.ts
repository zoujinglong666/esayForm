import {
  ElAutocomplete,
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElInputNumber,
  ElRadioGroup,
  ElRadio,
  ElRate,
  ElSelect,
  ElOption,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElInput,
  ElTransfer,
  ElTreeSelect
} from 'element-plus'
import type { FormItemValueType } from '@/components/PlusTable/types'
import type { Component } from 'vue'

export type FieldComponentType = {
  /**
   * parent Component
   */
  component: Component
  /**
   *  parent Props
   */
  props?: {
    [key: string]: string | boolean | undefined
    type?: 'textarea'
    /**
     * @default  'plus.field.pleaseSelect'
     */
    placeholder?: 'plus.field.pleaseEnter'
  }
  /**
   *  children  Component
   */
  children?: Component

  /**
   * has options
   * @default false
   */
  hasOptions?: boolean
  /**
   * has SelectEvent
   * @default false
   */
  hasSelectEvent?: boolean
  /**
   * has version compatibility
   * @default false
   */
  hasVersionCompatibility?: boolean
}

export type FieldComponentMapType = Record<
  Exclude<FormItemValueType, undefined | 'text'>,
  FieldComponentType
>

export const FieldComponentMap: FieldComponentMapType = {
  // plus
  'plus-radio': {
    component: ElRadio,
    hasOptions: true
  },
  'plus-date-picker': {
    component: ElDatePicker
  },
  // el
  autocomplete: {
    component: ElAutocomplete,
    props: { placeholder: 'plus.field.pleaseEnter' },
    hasSelectEvent: true
  },
  cascader: {
    component: ElCascader,
    hasOptions: true
  },
  checkbox: {
    component: ElCheckboxGroup,
    children: ElCheckbox,
    hasVersionCompatibility: true
  },
  'color-picker': {
    component: ElColorPicker
  },
  'date-picker': {
    component: ElDatePicker,
    props: {
      startPlaceholder: 'plus.datepicker.startPlaceholder',
      endPlaceholder: 'plus.datepicker.endPlaceholder'
    }
  },
  'input-number': {
    component: ElInputNumber,
    props: { placeholder: 'plus.field.pleaseEnter' }
  },
  radio: {
    component: ElRadioGroup,
    children: ElRadio,
    hasVersionCompatibility: true
  },
  rate: {
    component: ElRate
  },
  select: {
    component: ElSelect,
    children: ElOption
  },
  slider: {
    component: ElSlider
  },
  switch: {
    component: ElSwitch
  },
  'time-picker': {
    component: ElTimePicker
  },
  'time-select': {
    component: ElTimeSelect
  },
  transfer: {
    component: ElTransfer
  },
  input: {
    component: ElInput,
    props: { placeholder: 'plus.field.pleaseEnter' }
  },
  textarea: {
    component: ElInput,
    props: { type: 'textarea', placeholder: 'plus.field.pleaseEnter' }
  },
  'tree-select': {
    component: ElTreeSelect
  }
}

/**
 * has component
 * @param valueType
 * @returns
 */
export const hasFieldComponent = (valueType?: string) =>
  Object.keys(FieldComponentMap).includes(
    valueType as Exclude<FormItemValueType, undefined | 'text'>
  )
/**
 * get component
 * @param valueType
 * @returns
 */
export const getFieldComponent = (valueType?: string): FieldComponentType =>
  Reflect.get(FieldComponentMap, valueType as string) || {}
