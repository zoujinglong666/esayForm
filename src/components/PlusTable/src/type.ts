import type {
  ElForm,
  ElFormItem,
  ElMessageBoxOptions,
  ButtonProps,
  LinkProps,
  IconProps,
  ElTooltipProps,
  TableColumnCtx,
  TableProps
} from 'element-plus'
import type { PaginationProps } from 'element-plus'

import type {
  Component,
  Ref,
  ComputedRef,
  AppContext,
  DirectiveArguments,
  CSSProperties
} from 'vue'
import type { Options as SortableOptions } from 'sortablejs'
import type { Mutable } from 'element-plus/es/utils'
import type { RecordType, PageInfo, FieldValueType, PlusColumn } from '@/components/PlusTable/types'
import type { ComponentSize } from 'element-plus/es/constants'

/**
 * 表格操作栏按钮配置项的值的类型
 */
export interface ActionBarButtonsRow {
  /**
   * 操作文本
   */
  text:
    | string
    | Ref<string>
    | ComputedRef<string>
    | ((
        row: any,
        index: number,
        button: ActionBarButtonsRow
      ) => string | Ref<string> | ComputedRef<string>)
  /**
   * 操作唯一code
   *
   */
  code?: string | number

  /**
   * `@element-plus/icons-vue` 的图标名称，对ElButton,ElLink 和ElIcon 组件同时生效
   */
  icon?: Component
  /**
   * ElButton,ElLink和ElIcon 组件对应的props
   */
  props?: Partial<Mutable<ButtonProps & LinkProps & IconProps & { [index: string]: any }>>
  /**
   * ElTooltip组件的props， type 为icon 时生效
   */
  tooltipProps?: Partial<ElTooltipProps>

  /**
   * 按钮显示的逻辑 默认 true 显示， 不需要显示给 false
   *
   * 可以用来控制权限
   */
  show?:
    | boolean
    | Ref<boolean>
    | ComputedRef<boolean>
    | ((
        row: any,
        index: number,
        button: ActionBarButtonsRow
      ) => boolean | Ref<boolean> | ComputedRef<boolean>)

  /**
   * 操作是不是需要二次确认  默认值为 `false`
   */
  confirm?:
    | boolean
    | {
        /**
         * 默认 `提示`
         */
        title?: string | ((data: ButtonsCallBackParams) => string)
        /**
         * 默认 `确定执行本次操作`
         */
        message?: string | ((data: ButtonsCallBackParams) => string)

        /**
         *  ElMessageBox.confirm 的options
         */
        options?: ElMessageBoxOptions
        /**
         *  ElMessageBox.confirm 的appContext
         */
        appContext?: AppContext | null
      }

  /**
   * 指令，可以用来控制权限，数据类型是二维数组
   * @version v0.1.7
   * @see https://cn.vuejs.org/guide/extras/render-function.html#custom-directives
   *
   */
  directives?: DirectiveArguments

  /**
   * 点击当前按钮时触发，可与PlusTable的事件 `clickAction`  同时触发；
   * 操作需要二次确认时：PlusTable的事件 `clickAction`会在确认时触发，而当前的onClick是在点击时触发；
   * @version v0.1.8
   * @param params
   * @returns
   */
  onClick?: (params: ButtonsCallBackParams) => void
  /**
   * 操作需要二次确认时，点击确认时触发
   * @version v0.1.8
   * @param params
   * @returns
   */
  onConfirm?: (params: ButtonsCallBackParams) => void
  /**
   * 操作需要二次确认时，点击取消时触发， 可与PlusTable的事件 `clickActionConfirmCancel`  同时触发
   * @version v0.1.8
   * @param params
   * @returns
   */
  onCancel?: (params: ButtonsCallBackParams) => void
}

/**
 * 表格可编辑表单的行form 的参数类型
 */
export interface TableFormRefRow {
  /**
   * 单元格的表单实例
   */
  formInstance: Ref<InstanceType<typeof ElForm>>
  /**
   * 单元格的表单单项实例
   * @deprecated v0.0.1-beta.34
   */
  formItemInstance: Ref<InstanceType<typeof ElFormItem>>
  /**
   * 获取显示组件实例
   */
  getDisplayItemInstance: () => {
    index: number
    prop: string
    formInstance: Ref<InstanceType<typeof ElForm>>
    /**
     * 单元格的表单单项实例
     * @deprecated v0.0.1-beta.34
     */
    formItemInstance: Ref<InstanceType<typeof ElFormItem>>
  }
  /**
   * 表格的行索引
   */
  index: number
  /**
   * 表格的列字段
   */
  prop: string
  /**
   * 单元格的表单开启编辑
   * @returns
   */

  startCellEdit: () => void
  /**
   * 单元格的表单停止编辑
   * @returns
   */
  stopCellEdit: () => void

  /**
   *  当前单元格是否可编辑
   * @version v0.1.8
   */
  isEdit: Ref<boolean>
}

/**
 * 表格单元格回调参数
 */
export type TableCellParams = {
  /**
   * 表格行数据
   */
  row: RecordType

  /**
   * 表格行索引
   */
  index: number

  /**
   * 表格列数据
   * @version v0.1.7
   */
  column: RecordType
  /**
   * 表格行索引 同 index
   * @version v0.1.7
   */
  rowIndex: number
  /**
   * 表格列索引
   * @version v0.1.7
   */
  cellIndex: number
  /**
   * 表格store
   * @version v0.1.7
   */
  store: RecordType
  /**
   * 表格 expanded
   * @version v0.1.7
   */
  expanded: boolean
  /**
   * 表格  _self
   * @version v0.1.7
   */
  _self: RecordType
}

/**
 * 点击按钮回调的参数的类型
 */
export interface ButtonsCallBackParams extends TableCellParams {
  /**
   * 点击按钮数据
   */
  buttonRow: ActionBarButtonsRow

  /**
   * 按钮点击事件数据
   */
  e: MouseEvent
  /**
   * 可编辑表单的行form
   */
  formRefs?: TableFormRefRow[]
}

/**
 * formChange回调的参数的类型
 */
export interface FormChangeCallBackParams extends TableCellParams {
  /**
   * 表单的值
   */
  value: FieldValueType
  /**
   * 当前单元格的prop
   */
  prop: string
}

/**
 * 操作栏的整体类型
 */
export interface ActionBarProps {
  /**
   * 操作栏名称  默认值为 `'操作栏'`
   *
   */
  label?: string
  /**
   * 操作栏固定   默认值为 `'right'`
   */
  fixed?: string
  /**
   * 显示出来的按钮个数  默认值为 `3`
   */
  showNumber?: number
  /**
   * 操作按钮的类型   默认值为 `'link'`
   */
  type?: 'icon' | 'button' | 'link'
  /**
   * 操作按钮集合   默认值为 `[]`
   */
  buttons?: ActionBarButtonsRow[]
  /**
   * 表格操作栏 el-table-column 的其width   默认值为 `200`
   */
  width?: string | number
  /**
   * 表格操作栏 el-table-column 的其他props   默认值为 `{}`
   */
  actionBarTableColumnProps?: Partial<TableColumnCtx<any>>
}

/**
 * 表格自身状态
 */
export interface PlusTableState {
  size?: ComponentSize

  /**
   * 分页参数供表格自身使用
   */
  subPageInfo: PageInfo
}

/**
 * 列设置类型
 */
export type ColumnSetting = { dragSort?: boolean | Partial<SortableOptions> }

/**
 * 标题栏
 */
export type TitleBar = Partial<{
  /**
   * 标题  使用title插槽则此配置不生效
   */
  title?: string

  /**
   *  是否需要刷新  默认false
   */
  refresh?: boolean

  /**
   *  是否需要密度控制  默认true
   */
  density?: boolean
  /**
   * 是否需要列设置 默认true
   */
  columnSetting?: boolean | ColumnSetting

  /**
   * 工具栏 icon 的大小和颜色配置
   */
  icon?: {
    /**
     * icon 的大小  默认 18
     */
    size?: string
    /**
     * icon 的颜色  默认 #606266
     */
    color?: string
  }
}>

/**
 * 表格props
 */
export type PlusTableSelfProps = {
  /** 表格数据 同data*/
  tableData?: RecordType[]
  /**
   * 表格数据  同tableData
   * @version 0.1.10
   */
  data?: RecordType[]
  /** 表格配置信息*/
  columns?: PlusColumn[]
  // 密度
  defaultSize?: ComponentSize
  /** 分页参数*/
  pagination?: false | Partial<PlusPaginationProps>
  /** 操作栏参数*/
  actionBar?: false | Partial<ActionBarProps>
  /** 是否需要序号*/
  hasIndexColumn?: boolean
  /** 是否工具栏*/
  titleBar?: boolean | Partial<TitleBar>
  /** 是否是多选表格*/
  isSelection?: boolean
  /** 是否需要展开行*/
  hasExpand?: boolean
  /** loading状态*/
  loadingStatus?: boolean
  height?: TableProps<any[]>['height']
  /** 表格头样式*/
  headerCellStyle?: Partial<TableProps<any[]>['headerCellStyle']>
  rowKey?: TableProps<any[]>['rowKey']
  /** sortablejs配置 */
  dragSortable?: false | Partial<SortableOptions>
  dragSortableTableColumnProps?: RecordType
  indexTableColumnProps?: RecordType
  selectionTableColumnProps?: RecordType
  expandTableColumnProps?: RecordType
  indexContentStyle?:
    | Partial<CSSProperties>
    | ((row: RecordType, index: number) => Partial<CSSProperties>)
  editable?: boolean | 'click' | 'dblclick'
}

export type PlusTableProps = PlusTableSelfProps & Partial<TableProps<any[]>> & RecordType

/**
 * fork  https://github.com/element-plus/element-plus/blob/dev/packages/components/table/src/table.vue#L203-L222
 *
 */
export type ElementPlusTableEmits = {
  (e: 'select', selection: RecordType[], row: RecordType): void
  (e: 'select-all', selection: RecordType[]): void
  (e: 'selection-change', newSelection: any[]): void
  (
    e: 'cell-mouse-enter',
    row: RecordType,
    column: RecordType,
    cell: HTMLTableCellElement,
    event: Event
  ): void
  (
    e: 'cell-mouse-leave',
    row: RecordType,
    column: RecordType,
    cell: HTMLTableCellElement,
    event: Event
  ): any
  (
    e: 'cell-contextmenu',
    row: RecordType,
    column: RecordType,
    cell: HTMLTableCellElement,
    event: Event
  ): void
  // (e: 'cell-click', ...args: any[]): any
  // (e: 'cell-dblclick', ...args: any[]): any
  (e: 'row-click', row: RecordType, column: RecordType, event: Event): void
  (e: 'row-contextmenu', row: RecordType, column: RecordType, event: Event): void
  (e: 'row-dblclick', row: RecordType, column: RecordType, event: Event): void
  (e: 'header-click', column: RecordType, event: Event): void
  (e: 'header-contextmenu', column: RecordType, event: Event): void
  (e: 'sort-change', data: { column: any; prop: string; order: any }): void
  (e: 'filter-change', newFilters: any): void
  (e: 'current-change', currentRow: RecordType, oldCurrentRow: RecordType): void
  (
    e: 'header-dragend',
    newWidth: number,
    oldWidth: number,
    column: RecordType,
    event: MouseEvent
  ): void
  (e: 'expand-change', row: RecordType, expandedRows: RecordType[], expanded: boolean): void
}
export type PlusTableEmits = {
  (e: 'paginationChange', pageInfo: PageInfo): void
  (e: 'clickAction', data: ButtonsCallBackParams): void
  (e: 'clickActionConfirmCancel', data: ButtonsCallBackParams): void
  (e: 'dragSortEnd', newIndex: number, oldIndex: number): void
  (e: 'formChange', data: FormChangeCallBackParams): void
  (e: 'refresh'): void
  (e: 'edited'): void
  (
    e: 'cell-click',
    row: RecordType,
    column: PlusColumn,
    cell: HTMLTableCellElement,
    event: Event
  ): void
  (
    e: 'cell-dblclick',
    row: RecordType,
    column: PlusColumn,
    cell: HTMLTableCellElement,
    event: Event
  ): void
}

export interface PlusPaginationSelfProps {
  modelValue?: PageInfo
  total?: number
  pageSizeList?: number[]
  align?: 'left' | 'right'
}

export type PlusPaginationProps = PlusPaginationSelfProps &
  Partial<Mutable<PaginationProps>> &
  RecordType

export interface PlusPaginationEmits {
  (e: 'update:modelValue', pageInfo: PageInfo): void
  (e: 'change', pageInfo: PageInfo): void
  (e: 'size-change', value: number): void
  (e: 'current-change', value: number): void
}
