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
    // Try new function signature, fallback to old if it fails
    try {
      const func = props as any
      if (func.length === 3) {
        // New signature: (row, column, rowIndex)
        return func(row, column, rowIndex) || {}
      } else {
        // Old signature: (value, { row, index })
        const value = row[column.prop]
        return func(value, { row, index: rowIndex }) || {}
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
    // Try new function signature, fallback to old if it fails
    try {
      const func = props as any
      if (func.length === 3) {
        // New signature: (row, column, rowIndex)
        return func(row, column, rowIndex) || {}
      } else {
        // Old signature: (value, { row, index })
        const value = row[column.prop]
        return func(value, { row, index: rowIndex }) || {}
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
      if (func.length === 3) {
        // New signature: (row, column, rowIndex)
        return func(row, column, rowIndex) || {}
      } else {
        // Old signature: (value, { row, index })
        const value = row[column.prop]
        return func(value, { row, index: rowIndex }) || {}
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
  // Check if disabled exists in fieldProps function
  const fieldProps = getFieldProps(column, row, rowIndex)
  if (fieldProps && typeof fieldProps.disabled !== 'undefined') {
    return !!fieldProps.disabled
  }
  
  // Check standalone disabled property
  const dis = column.disabled
  if (typeof dis === 'function') {
    return !!dis(row, column, rowIndex)
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
    return !!hide(row, column, rowIndex)
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
    return !!hide(row, column, rowIndex)
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
    return def(row, column, rowIndex)
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
    return label(row, column, rowIndex)
  }
  return unref(label) || ''
}