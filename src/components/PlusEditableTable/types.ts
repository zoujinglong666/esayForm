import type { FormRules } from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'

export interface EditableColumn {
  prop: string
  label: string
  editable?: boolean
  editType?: 'input' | 'number' | 'select' | 'date' | 'datetime' | 'switch' | 'textarea' | 'custom'
  fieldProps?: Record<string, any>
  options?: Array<{ label: string; value: any }>
  rules?: FormRules
  width?: number | string
  formatter?: (row: Record<string, any>, column: TableColumnCtx<EditableColumn>) => string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
}

export interface EditableTableProps {
  modelValue: Array<Record<string, any>>
  columns: EditableColumn[]
  editable?: boolean
  border?: boolean
  height?: string | number
  maxHeight?: string | number
  stripe?: boolean
  size?: 'large' | 'default' | 'small'
  showOverflowTooltip?: boolean
  rowKey?: string
  validateOnInput?: boolean
  clickOutsideToSave?: boolean
  showIndex?: boolean
  alwaysEditable?: boolean
}

export interface CellChangeEvent {
  row: Record<string, any>
  prop: string
  oldValue: any
  newValue: any
  index: number
}

export interface ValidateErrorEvent {
  row: Record<string, any>
  prop: string
  errors: string[]
  index: number
}

export interface EditStartEvent {
  row: Record<string, any>
  prop: string
  index: number
}

export interface EditEndEvent {
  row: Record<string, any>
  prop: string
  index: number
  action: 'save' | 'cancel'
}

export interface CellState {
  row: Record<string, any>
  prop: string
  index: number
}

/**
 * PlusEditableTable 组件实例类型定义
 * 定义暴露给父组件的所有方法
 */
export interface EditableTableInstance {
  // 原有方法
  startEditAll: () => void
  saveAll: () => void
  cancelAll: () => void
  validateAll: () => boolean
  startEdit: (rowIndex: number, prop: string) => void
  endEdit: (action?: 'save' | 'cancel') => void
  tableRef: any
  registerEditor: (editType: string, component: any) => void

  // 数据操作方法
  getData: () => Array<Record<string, any>>
  setData: (data: Array<Record<string, any>>) => void
  getRow: (rowIndex: number) => Record<string, any> | null
  setRow: (rowIndex: number, rowData: Record<string, any>) => void

  // 单元格操作方法
  getCellValue: (rowIndex: number, prop: string) => any
  setCellValue: (rowIndex: number, prop: string, value: any) => void

  // 错误处理方法
  getRows: () => Array<Record<string, any>>
  clearErrors: () => void
  getCellError: (rowIndex: number, prop: string) => string[] | null
  getEditingCell: () => { rowIndex: number; prop: string } | null
  isValid: () => boolean

  // 行操作方法
  addRow: (rowData?: Record<string, any>) => void
  removeRow: (rowIndex: number) => void
  insertRow: (rowIndex: number, rowData?: Record<string, any>) => void
}
