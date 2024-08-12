import type { ElTooltipProps, ButtonType } from 'element-plus'
import type { VNode, Ref, ComputedRef, Component } from 'vue'
import type { RecordType } from './global'
import type { TableValueType, TableColumnProps } from './table'
import type { FormItemValueType, FormColumnProps, FieldValueType } from './form'

export {}

/**
 * 渲染函数的返回值的类型
 */
export type RenderTypes = string | VNode | JSX.Element | Component

/**
 * 分页参数
 */
export interface PageInfo {
  /**
   * 默认为1
   */
  page: number
  /**
   * 默认为10
   */
  pageSize: number
}

/**
 *  自定义props类型  支持对象object，computed，函数和Promise
 */
export type PropsItemType<T extends Record<string, any> = any> =
  | Partial<T>
  | ComputedRef<Partial<T>>
  | ((
      value: FieldValueType,
      data: {
        row: Record<string, any>
        index: number
      }
    ) => Partial<T> | Promise<Partial<T>>)
  | Promise<Partial<T>>

/**
 * 选择框类型
 */
export interface OptionsRow<T = undefined> {
  label: number | string
  value: Exclude<number | string | boolean | RecordType, T>
  /**
   * 小圆点背景色，
   * color 优先级 高于 type
   */
  color?: string
  /**
   * 类型
   * type 优先级 低于 color，
   * 只支持 'success' | 'warning' | 'info' | 'primary' | 'danger'
   */
  type?: Exclude<ButtonType, 'default' | 'text' | ''>
  /**
   * 表单子项的props  如 el-checkbox-group下的el-checkbox的props
   */
  fieldItemProps?: RecordType
  /**
   * el-checkbox-group下的，每一项el-checkbox的各自插槽(即el-checkbox的default插槽)。
   * el-radio-group下的，每一项el-checkbox的内容各自插槽(即el--radio的default插槽)。
   * el-select下的，每一项el-option的内容整体插槽(即el-option的default插槽)。
   *
   * @see https://element-plus.org/zh-CN/component/checkbox.html#checkbox-slots
   * @see https://element-plus.org/zh-CN/component/radio.html#radio-slots
   */
  fieldSlot?: (option?: OptionsRow) => RenderTypes
  /**
   * 子选项
   */
  children?: OptionsRow[]
}
/**
 * 选择类型   支持数组，computed，函数和Promise
 */
export type OptionsType =
  | OptionsRow[]
  | ComputedRef<OptionsRow[]>
  | ((props?: PlusColumn) => OptionsRow[] | Promise<OptionsRow[]>)
  | Promise<OptionsRow[]>
/**
 * 共享类型
 */
export interface CommonType {
  [index: string]: any
  /**
   * 表格表头显示的标题 ；在form 中是 el-form-item的label；在descriptions 是 el-descriptions-item的label；
   *  @version v0.0.10 修改为可选
   *  @version v0.1.0 类型新增ComputedRef<string>
   */
  label?: string | ComputedRef<string>
  /**
   * 表格对应列内容的字段名 ；在form 中是 el-input等所有表单项的双向绑定的值；在descriptions 是 el-descriptions-item的值对应的字段；
   */
  prop: string

  /**
   *  表格宽
   */
  width?: string | number
  /**
   *  表格最小宽
   */
  minWidth?: string | number

  /**
   * @desc 当开启时  valueType 为 `FormItemValueType` 其中之一时 表格中显示的是对应的可编辑的表单
   * @default false
   */
  editable?: boolean

  /**
   * @desc 值的类型
   */
  valueType?: TableValueType | FormItemValueType

  /** @desc 在 PlusDescriptions组件中 隐藏 */
  hideInDescriptions?: boolean | Ref<boolean> | ComputedRef<boolean>

  /** @desc 在 PlusForm 组件中隐藏 */
  hideInForm?: boolean | Ref<boolean> | ComputedRef<boolean>

  /** @desc 在 PlusTable 组件中隐藏 */
  hideInTable?: boolean | Ref<boolean> | ComputedRef<boolean>

  /** @desc 在 PlusSearch 中隐藏 */
  hideInSearch?: boolean | Ref<boolean> | ComputedRef<boolean>

  /**
   * 描述行，el-descriptions-item 的props
   */
  descriptionsItemProps?: RecordType

  /**
   * el-select，el-radio-group，el-checkbox-group 选项 ，支持数组，函数，和Promise
   */
  options?: OptionsType
  /**
   *  自定义状态显示逻辑 需要返回一个 OptionsRow
   * @param data
   * @returns
   */
  customGetStatus?: (data: {
    options: OptionsRow[]
    value: string | number
    row: RecordType
  }) => OptionsRow

  /** @desc 展示一个 icon，hover 是展示一些提示信息 */
  tooltip?: ElTooltipProps | string

  /**
   *
   * @desc 自定义渲染表格单行显示内容 需要返回一个 VNode，`render`的优先级最高
   * @example
   * ```ts
   * import { h } from 'vue'
   * import { ElTag } from 'element-plus'
   * import type { PlusColumn } from 'plus-pro-components'
   *
   * const tableColumns:PlusColumn[] = [
   *  {
   *     label: 'tag',
   *     prop: 'tag',
   *     render: value => {
   *       const item = statusOptions.find(item => item.value === value)
   *        return h(ElTag, { type: item.type }, () => item.label)
   *     }
   *  }
   * ]
   *
   * ```
   */
  render?: (value: any, data: { row: RecordType; column: PlusColumn; index: number }) => RenderTypes

  /**
   * @desc  自定义渲染单行显示内容 需要返回一个 html字符串，`renderHTML`的优先级低于`render`，高于`valueType`。
   * @desc **注意：renderHTML 内部使用`v-html`渲染，使用时需要保证 html字符串可信。**
   * @example
   * ```ts
   *  import type { PlusColumn } from 'plus-pro-components'
   *
   *  const tableColumns:PlusColumn[] = [
   *    {
   *       label: '自定义',
   *       prop: 'custom',
   *       renderHTML: (value, { row }) => {
   *         return `
   *          <div>自定义: ${row.number || 0}</div>
   *         `
   *      }
   *    }
   *  ]
   *
   *```
   */
  renderHTML?: (value: any, data: { row: RecordType; column: PlusColumn; index: number }) => string

  /**
   * @desc 渲染table表单的Header
   * @example
   * ```ts
   * import { h } from 'vue'
   * import { ElButton } from 'element-plus'
   * import type { PlusColumn } from 'plus-pro-components'
   *
   * const tableColumns:PlusColumn[] = [
   *    {
   *       label: '自定义',
   *       prop: 'custom',
   *       renderHeader:label => h(ElButton, null, () => label)
   *    }
   * ]
   *
   *```
   */
  renderHeader?: (label: string, props: PlusColumn) => RenderTypes
  /**
   * 自定义el-descriptions-item 里的内容 优先级高于 render, renderHTML
   */
  renderDescriptionsItem?: (data: {
    value: string
    column: PlusColumn
    row: RecordType
  }) => RenderTypes
  /**
   * 自定义el-descriptions-item 里的label
   */
  renderDescriptionsLabel?: (data: {
    label: string
    column: PlusColumn
    row: RecordType
  }) => RenderTypes

  /**
   * PlusSearch 查询表单中的权重，权重大排序靠前，在PlusPage组件中非常有用
   */
  order?: number | ComputedRef<number>
}

/**
 * 表格，表单，详情，搜索公共的类型
 */
export interface PlusColumn extends CommonType, TableColumnProps, FormColumnProps {
  /** */
}
