/**
 * 表格里表单的provide(inject) key
 */
export const TableFormRefInjectionKey = Symbol('tableFormRefInjectionKey')

/**
 * 表格里表单每一项 的provide(inject) key
 */
export const TableFormFieldRefInjectionKey = Symbol('tableFormFieldRefInjectionKey')

/**
 *  表单ElDatePicker 组件 值是数组的type列表
 */
export const DatePickerValueIsArrayList = ['datetimerange', 'daterange', 'monthrange']

/**
 * 表单组件值是数字类型的valueType列表
 */
export const ValueIsNumberList = ['rate', 'input-number', 'slider']

/**
 * 表单组件值是布尔类型的valueType列表
 */

export const ValueIsBooleanList = ['switch']

/**
 *  表单组件值是数组的valueType列表
 */
export const ValueIsArrayList = [
  'checkbox',
  'cascader',
  'plus-date-picker',
  'plus-input-tag',
  'transfer'
]
