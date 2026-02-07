import { unref, computed } from 'vue'
import type { PlusColumn, RecordType } from '@/components/PlusTable/types'
import type { OptionsRow } from '@/components/PlusTable/types/plus'
import type { FieldProps } from '@/components/PlusTable/types/form'

/**
 * Get field props for a column at a specific row
 */
export const getFieldProps = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): Record<string, any> => {
  const props = column.fieldProps
  if (typeof props === 'function') {
    try {
      const func = props as any
      const value = row[column.prop]
      const ctx = {
        row,
        column,
        index: rowIndex,
        rowIndex,
        prop: column.prop,
        valueType: column.valueType
      }
      const arity = func.length

      if (arity === 3) {
        return func(row, column, rowIndex) || {}
      } else if (arity === 2) {
        return func(value, ctx) || {}
      } else if (arity === 1) {
        return func(value) || {}
      } else {
        return func(value, ctx) || {}
      }
    } catch (error) {
      console.warn('Error calling fieldProps function:', error)
      return {}
    }
  }
  return unref(props) || {}
}

/**
 * Get form props for a column at a specific row
 */
export const getFormProps = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): Record<string, any> => {
  const props = column.formProps
  if (typeof props === 'function') {
    try {
      const func = props as any
      const value = row[column.prop]
      const ctx = {
        row,
        column,
        index: rowIndex,
        rowIndex,
        prop: column.prop,
        valueType: column.valueType
      }
      const arity = func.length

      if (arity === 3) {
        return func(row, column, rowIndex) || {}
      } else if (arity === 2) {
        return func(value, ctx) || {}
      } else if (arity === 1) {
        return func(value) || {}
      } else {
        return func(value, ctx) || {}
      }
    } catch (error) {
      console.warn('Error calling formProps function:', error)
      return {}
    }
  }
  return unref(props) || {}
}

/**
 * Get form item props for a column at a specific row
 */
export const getFormItemProps = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): Record<string, any> => {
  const props = column.formItemProps
  if (typeof props === 'function') {
    try {
      const func = props as any
      const value = row[column.prop]
      const ctx = {
        row,
        column,
        index: rowIndex,
        rowIndex,
        prop: column.prop,
        valueType: column.valueType
      }
      const arity = func.length

      if (arity === 3) {
        return func(row, column, rowIndex) || {}
      } else if (arity === 2) {
        return func(value, ctx) || {}
      } else if (arity === 1) {
        return func(value) || {}
      } else {
        return func(value, ctx) || {}
      }
    } catch (error) {
      console.warn('Error calling formItemProps function:', error)
      return {}
    }
  }
  return unref(props) || {}
}

/**
 * Get options for a column at a specific row
 */
export const getOptions = async (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): Promise<OptionsRow[]> => {
  const opts = column.options
  if (typeof opts === 'function') {
    try {
      const func = opts as any
      let result
      if (func.length === 3) {
        // New signature: (row, column, rowIndex)
        result = func(row, column, rowIndex)
      } else {
        // Old signature: (props: PlusColumn)
        result = func(column)
      }
      
      if (result instanceof Promise) {
        return await result || []
      }
      return result || []
    } catch (error) {
      console.warn('Error calling options function:', error)
      return []
    }
  }
  return unref(opts) || []
}

/**
 * Check if a column is disabled at a specific row
 */
export const isDisabled = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): boolean => {
  const fieldProps = getFieldProps(column, row, rowIndex)
  if (fieldProps && typeof fieldProps.disabled !== 'undefined') {
    return !!fieldProps.disabled
  }
  const dis = column.disabled
  if (typeof dis === 'function') {
    const func = dis as any
    const value = row[column.prop]
    const ctx = {
      row,
      column,
      index: rowIndex,
      rowIndex,
      prop: column.prop,
      valueType: column.valueType
    }
    const arity = func.length

    if (arity === 3) {
      return !!func(row, column, rowIndex)
    }
    if (arity === 2) {
      return !!func(value, ctx)
    }
    if (arity === 1) {
      return !!func(value)
    }
    return !!func(value, ctx)
  }
  return !!unref(dis)
}

/**
 * Check if a column should be hidden in form at a specific row
 */
export const isHideInForm = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): boolean => {
  const hide = column.hideInForm
  if (typeof hide === 'function') {
    const func = hide as any
    const value = row[column.prop]
    const ctx = {
      row,
      column,
      index: rowIndex,
      rowIndex,
      prop: column.prop,
      valueType: column.valueType
    }
    const arity = func.length

    if (arity === 3) {
      return !!func(row, column, rowIndex)
    }
    if (arity === 2) {
      return !!func(value, ctx)
    }
    if (arity === 1) {
      return !!func(value)
    }
    return !!func(value, ctx)
  }
  return !!unref(hide)
}

/**
 * Check if a column should be hidden in table at a specific row
 */
export const isHideInTable = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): boolean => {
  const hide = column.hideInTable
  if (typeof hide === 'function') {
    const func = hide as any
    const value = row[column.prop]
    const ctx = {
      row,
      column,
      index: rowIndex,
      rowIndex,
      prop: column.prop,
      valueType: column.valueType
    }
    const arity = func.length

    if (arity === 3) {
      return !!func(row, column, rowIndex)
    }
    if (arity === 2) {
      return !!func(value, ctx)
    }
    if (arity === 1) {
      return !!func(value)
    }
    return !!func(value, ctx)
  }
  return !!unref(hide)
}

/**
 * Get default value for a column at a specific row
 */
export const getDefaultValue = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): any => {
  const def = column.defaultValue
  if (typeof def === 'function') {
    const func = def as any
    const value = row[column.prop]
    const ctx = {
      row,
      column,
      index: rowIndex,
      rowIndex,
      prop: column.prop,
      valueType: column.valueType
    }
    const arity = func.length

    if (arity === 3) {
      return func(row, column, rowIndex)
    }
    if (arity === 2) {
      return func(value, ctx)
    }
    if (arity === 1) {
      return func(value)
    }
    return func(value, ctx)
  }
  return def
}

/**
 * Get label for a column at a specific row
 */
export const getLabel = (
  column: PlusColumn,
  row: RecordType,
  rowIndex: number
): string => {
  const label = column.label
  if (typeof label === 'function') {
    const func = label as any
    const value = row[column.prop]
    const ctx = {
      row,
      column,
      index: rowIndex,
      rowIndex,
      prop: column.prop,
      valueType: column.valueType
    }
    const arity = func.length

    if (arity === 3) {
      return func(row, column, rowIndex)
    }
    if (arity === 2) {
      return func(value, ctx)
    }
    if (arity === 1) {
      return func(value)
    }
    return func(value, ctx)
  }
  return unref(label) || ''
}
