<template>
  <div ref="tableWrapperInstance" class="plus-table">
    <PlusTableTitleBar
      v-if="titleBar"
      :columns="filterColumns"
      :columns-is-change="columnsIsChange"
      :default-size="size"
      :title-bar="titleBar"
      @refresh="handleRefresh"
      @click-density="handleClickDensity"
      @filter-table="handleFilterTableConfirm"
    >
      <template #title>
        <slot name="title"></slot>
      </template>
      <template #toolbar>
        <slot name="toolbar"></slot>
      </template>
      <!-- 表格拖拽行 和 列设置里拖拽 icon -->
      <template v-if="$slots['drag-sort-icon']" #drag-sort-icon>
        <slot name="drag-sort-icon"></slot>
      </template>
      <!-- 表格表头 列设置 icon   -->
      <template v-if="$slots['column-settings-icon']" #column-settings-icon>
        <slot name="column-settings-icon"></slot>
      </template>
      <!-- 表表格表头 密度 icon  -->
      <template v-if="$slots['density-icon']" #density-icon>
        <slot name="density-icon"></slot>
      </template>
    </PlusTableTitleBar>
    <el-table
      ref="tableInstance"
      v-loading="loadingStatus"
      :border="props.border"
      :data="currentTableData"
      :header-cell-style="headerCellStyle"
      :height="props?.height"
      :reserve-selection="props.reserveSelection"
      :row-key="rowKey"
      :show-summary="showSummaryComputed"
      :size="size"
      :summary-method="summaryMethodComputed"
      highlight-current-row
      scrollbar-always-on
      v-bind="$attrs"
      @cell-click="handleClickCell"
      @cell-dblclick="handleDoubleClickCell"
    >
      <!-- 默认插槽 -->
      <template #default>
        <slot name="default">
          <!-- 选择栏 -->
          <el-table-column
            v-if="isSelection"
            key="selection"
            :align="props.align"
            :reserve-selection="props.reserveSelection"
            type="selection"
            v-bind="selectionTableColumnProps"
          />

          <el-table-column v-if="isRadio" :align="props.align" type="radio" width="55">
            <template #default="{ row, $index }">
              <el-radio
                v-model="radioValue"
                :label="$index + 1"
                v-bind="radioTableColumnProps"
                @click.stop="radioChangeHandle($event, row, $index + 1)"
              />
            </template>
          </el-table-column>
          <!-- 序号栏 -->
          <PlusTableTableColumnIndex
            v-if="hasIndexColumn"
            :index-content-style="indexContentStyle"
            :index-table-column-props="indexTableColumnProps"
            :page-info="(pagination as PlusPaginationProps)?.modelValue"
          />

          <!-- 拖拽行 -->
          <PlusTableColumnDragSort
            v-if="dragSortable"
            :drag-sortable-table-column-props="dragSortableTableColumnProps"
            :sortable="dragSortable"
            :table-instance="tableInstance"
            @drag-sort-end="handleDragSortEnd"
          >
            <template v-if="$slots['drag-sort-icon']" #drag-sort-icon>
              <slot name="drag-sort-icon"></slot>
            </template>
          </PlusTableColumnDragSort>
          <!-- 展开行 -->
          <el-table-column v-if="hasExpand" type="expand" v-bind="expandTableColumnProps">
            <template #default="{ row, $index }">
              <div class="plus-table-expand-col" @click.stop>
                <slot :index="$index" :row="row" name="expand"></slot>
              </div>
            </template>
          </el-table-column>
          <!--配置渲染栏  -->
          <PlusTableColumn
            :empty-text="props.emptyText"
            :columns="subColumns"
            :editable="props.editable"
            :tableData="currentTableData"
            @form-change="handleFormChange"
          >
            <!--表格单元格表头的插槽 -->
            <template v-for="(_, key) in headerSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!--表格单元格的插槽 -->
            <template v-for="(_, key) in cellSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data" @form-change="handleFormChange"></slot>
            </template>

            <!--表单单项的插槽 -->
            <template v-for="(_, key) in fieldSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!-- 表单el-PlusFormItem 下一行额外的内容 的插槽 -->
            <template v-for="(_, key) in extraSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!-- tooltip-icon  插槽 -->
            <template v-if="$slots['tooltip-icon']" #tooltip-icon>
              <slot name="tooltip-icon"></slot>
            </template>

            <!--表格单元格编辑的插槽 -->
            <template v-if="$slots['edit-icon']" #edit-icon>
              <slot name="edit-icon"></slot>
            </template>
          </PlusTableColumn>

          <!-- 操作栏 -->
          <PlusTableActionBar
            v-if="actionBar"
            :align="props.align"
            v-bind="actionBar"
            @click-action="handleAction"
            @click-action-confirm-cancel="handleClickActionConfirmCancel"
          >
            <!-- 操作栏更多icon插槽 -->
            <template v-if="$slots['action-bar-more-icon']" #action-bar-more-icon>
              <slot name="action-bar-more-icon"></slot>
            </template>
          </PlusTableActionBar>
        </slot>
      </template>

      <!-- 插入至表格最后一行之后的内容 -->
      <template #append>
        <slot name="append"></slot>
      </template>

      <!-- 当数据为空时自定义的内容 -->
      <template #empty>
        <slot name="empty"></slot>
      </template>
    </el-table>
    <!-- 分页 -->
    <PlusPagination
      v-if="pagination && props.tableData?.length"
      ref="paginationInstance"
      v-model="subPageInfo"
      v-bind="pagination"
      @change="handlePaginationChange"
    >
      <template v-if="$slots['pagination-left']" #pagination-left>
        <slot name="pagination-left"></slot>
      </template>
      <template v-if="$slots['pagination-right']" #pagination-right>
        <slot name="pagination-right"></slot>
      </template>
    </PlusPagination>
  </div>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import {
  computed,
  nextTick,
  PropType,
  provide,
  reactive,
  ref,
  shallowRef,
  toRefs,
  unref,
  useSlots,
  watch
} from 'vue'
import type { PlusPaginationInstance, PlusPaginationProps } from '@/components/PlusPagination'
import { PlusPagination } from '@/components/PlusPagination'
import {
  DefaultPageInfo,
  TableFormFieldRefInjectionKey,
  TableFormRefInjectionKey
} from '@/components/PlusTable/constants'
import type { ComponentSize, TableInstance } from 'element-plus'
import { ElTable, ElTableColumn } from 'element-plus'

import type {
  FormFieldRefsType,
  PageInfo,
  PlusColumn,
  RecordType
} from '@/components/PlusTable/types'
import {
  filterSlots,
  getExtraSlotName,
  getFieldSlotName,
  getTableCellSlotName,
  getTableHeaderSlotName
} from '@/components/PlusTable/utils'
import { cloneDeep, debounce, isPlainObject } from 'lodash-es'
import PlusTableActionBar from './table-action-bar.vue'
import PlusTableColumn from './table-column.vue'
import PlusTableTitleBar from './table-title-bar.vue'
import type {
  ButtonsCallBackParams,
  FormChangeCallBackParams,
  RowLocator,
  RowSelector,
  RowUpdater,
  TableFormRefRow
} from './type'
import { isSVGElement } from '@/utils/is'
import useTableSummary, { ITotalColumns } from '@/hooks/component/useTableSummary'
import PlusTableColumnDragSort from '@/components/PlusTable/src/table-column-drag-sort.vue'
import PlusTableTableColumnIndex from '@/components/PlusTable/src/table-column-index.vue'

defineOptions({
  name: 'PlusTable',
  inheritAttrs: false
})
const props = defineProps({
  defaultSize: {
    type: String,
    default: 'default'
  },
  pagination: {
    type: [Boolean, Object]
  },
  actionBar: {
    type: [Boolean, Object],
    default: false
  },
  hasIndexColumn: {
    type: Boolean,
    default: false
  },
  titleBar: {
    type: [Boolean, Object],
    default: true
  },
  isSelection: {
    type: Boolean,
    default: false
  },
  isRadio: {
    type: Boolean,
    default: false
  },
  hasExpand: {
    type: Boolean,
    default: false
  },
  loadingStatus: {
    type: Boolean,
    default: false
  },
  tableData: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  headerCellStyle: {
    type: Object,
    default: () => ({ 'background-color': 'var(--el-fill-color-light)' })
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  dragSortable: {
    type: Boolean,
    default: false
  },
  dragSortableTableColumnProps: {
    type: Object,
    default: () => ({})
  },
  indexTableColumnProps: {
    type: Object,
    default: () => ({})
  },
  indexContentStyle: {
    type: Object,
    default: () => ({})
  },
  selectionTableColumnProps: {
    type: Object,
    default: () => ({
      width: 40
    })
  },
  radioTableColumnProps: {
    type: Object,
    default: () => ({
      width: 40
    })
  },
  expandTableColumnProps: {
    type: Object,
    default: () => ({})
  },
  editable: {
    type: [Boolean, String],
    default: false
  },
  border: {
    type: Boolean,
    default: true
  },
  totalColumns: {
    type: Array as PropType<ITotalColumns[] | string[]>,
    default: () => []
  },
  adaptive: {
    type: [Boolean, Object],
    default: false
  },
  height: {
    type: [String, Number],
    default: undefined
  },
  reserveSelection: {
    type: Boolean,
    default: true
  },
  // 新增props：控制摘要行显示
  showSummary: {
    type: Boolean,
    default: undefined // undefined表示使用内部逻辑
  },
  // 新增props：自定义摘要方法
  summaryMethod: {
    type: Function,
    default: undefined // undefined表示使用内部逻辑
  },
  align: {
    type: String,
    default: 'left'
  },
  emptyText: {
    type: String,
    default: ''
  }
})
const emit = defineEmits([
  'clickAction',
  'clickActionConfirmCancel',
  'dragSortEnd',
  'formChange',
  'refresh',
  'paginationChange',
  'edited',
  'cell-click',
  'cell-dblclick',
  'radio-change'
])
const radioValue = ref('')
const radioChangeHandle = (event: { preventDefault: () => void }, row: any, index: any) => {
  event.preventDefault()
  emit('radio-change', row, index)
  if (radioValue.value === index) {
    emit('radio-change', {}, -1)
    radioValue.value = ''
    return
  }
  radioValue.value = index
}
const subColumns: Ref<PlusColumn[]> = ref([])
const columnsIsChange: Ref<boolean> = ref(false)
const filterColumns: Ref<PlusColumn[]> = ref([])
const tableInstance = ref<TableInstance | null>(null)
const tableWrapperInstance = ref<HTMLDivElement | null>(null)
const state = reactive({
  subPageInfo: {
    ...(((props.pagination as PlusPaginationProps)?.modelValue || DefaultPageInfo) as PageInfo)
  },
  size: props.defaultSize
})
const currentTableData = computed(() => (props.tableData?.length ? props.tableData : []))

const slots = useSlots()

/**
 * 表格单元格的插槽
 */
const cellSlots = filterSlots(slots, getTableCellSlotName())

/**
 * 表格单元格表头的插槽
 */
const headerSlots = filterSlots(slots, getTableHeaderSlotName())

/**
 * 表单单项的插槽
 */
const fieldSlots = filterSlots(slots, getFieldSlotName())

/**
 * el-PlusFormItem 下一行额外的内容 的插槽
 */
const extraSlots = filterSlots(slots, getExtraSlotName())

/**
 * 表单的ref
 */
const formRefs = shallowRef<Record<string | number, TableFormRefRow[]>>({})
provide(TableFormRefInjectionKey, formRefs)
/**
 * 表单Field的ref
 */
const formFieldRefs = shallowRef<FormFieldRefsType>({})
provide(TableFormFieldRefInjectionKey, formFieldRefs)

// 监听配置更改
watch(
  () => props.columns,
  (val) => {
    subColumns.value = val?.filter(
      (item) => unref(item.hideInTable) !== true
    )
    filterColumns.value = cloneDeep(subColumns.value)
    columnsIsChange.value = !columnsIsChange.value
  },
  {
    deep: true,
    immediate: true
  }
)
const hasAdaptive = computed(() => typeof props?.height === 'undefined' && props.adaptive)

// 计算是否显示摘要行
const showSummaryComputed = computed(() => {
  // 优先使用外部传入的showSummary
  if (props.showSummary !== undefined) {
    return props.showSummary
  }

  // 使用内部逻辑：当有汇总列时显示
  return summaryColumns.value?.length > 0
})

// 计算摘要方法
const summaryMethodComputed = computed(() => {
  // 优先使用外部传入的summaryMethod
  if (props.summaryMethod) {
    return props.summaryMethod
  }

  // 使用内部逻辑：当有汇总列时使用getSummaries
  return summaryColumns.value?.length > 0 ? getSummaries : null
})

// 发分页改变事件
const handlePaginationChange = () => {
  emit('paginationChange', { ...state.subPageInfo })
}

const handleAction = (callbackParams: ButtonsCallBackParams) => {
  emit('clickAction', callbackParams)
}

const handleClickActionConfirmCancel = (callbackParams: ButtonsCallBackParams) => {
  emit('clickActionConfirmCancel', callbackParams)
}

const handleFilterTableConfirm = (_columns: PlusColumn[]) => {
  filterColumns.value = _columns
  subColumns.value = _columns.filter(
    (item) => unref(item.hideInTable) !== true && item.__selfHideInTable !== true
  )
}

// 密度
const handleClickDensity = (size: ComponentSize) => {
  state.size = size
}

const handleDragSortEnd = (newIndex: number, oldIndex: number) => {
  emit('dragSortEnd', { newIndex, oldIndex })
}

// 刷新
const handleRefresh = () => {
  emit('refresh')
}

const handleFormChange = (data: FormChangeCallBackParams) => {
  emit('formChange', data)
}

// 保存活动的表单
const currentForm = ref()
const handleCellEdit = (row: RecordType, column: PlusColumn, type: 'click' | 'dblclick') => {
  const rowIndex = currentTableData.value?.indexOf(row)
  const columnIndex = column.index
  const columnConfig = subColumns.value[column.index]

  // 不是可编辑行，如操作栏
  if (!columnConfig) return

  if (props.editable === type) {
    document.addEventListener('click', handleStopEditClick)
    const currentCellForm = formRefs.value[rowIndex][columnIndex]
    // 停止上一个表单的编辑状态
    if (currentForm.value) {
      currentForm.value?.stopCellEdit()
    }
    currentForm.value = currentCellForm

    // 开启当前点击的单元格的编辑
    currentCellForm.startCellEdit()

    // 当表单初始化完成
    const unwatch = watch(
      () => formFieldRefs.value.valueIsReady,
      (val) => {
        if (
          val?.value &&
          formFieldRefs.value?.fieldInstance?.focus &&
          (props.editable === 'click' || props.editable === 'dblclick')
        ) {
          formFieldRefs.value.fieldInstance.focus()
          // 销毁监听
          unwatch()
        }
      }
    )
  }
}

type CellClickParams = {
  row: RecordType
  column: PlusColumn
  cell: HTMLTableCellElement
  event: Event
  type: 'click' | 'dblclick'
}

const handleCellClick = (params: CellClickParams) => {
  const { row, column, cell, event, type } = params
  try {
    handleCellEdit(row, column, type)
    emit(`cell-${type}`, row, column, cell, event)
  } catch (error) {
    console.error(`Error handling cell ${type}:`, error)
  }
}

const handleClickCell = (
  row: RecordType,
  column: PlusColumn,
  cell: HTMLTableCellElement,
  event: Event
) => {
  handleCellClick({ row, column, cell, event, type: 'click' })
}

const handleDoubleClickCell = (
  row: RecordType,
  column: PlusColumn,
  cell: HTMLTableCellElement,
  event: Event
) => {
  handleCellClick({ row, column, cell, event, type: 'dblclick' })
}

// 退出编辑状态
const handleStopEditClick = (e: MouseEvent) => {
  if (tableWrapperInstance.value && currentForm.value) {
    const wrapperClass = '.el-table__body-wrapper'
    const tbody = tableWrapperInstance?.value?.querySelector(wrapperClass)
    const target = e?.target as HTMLElement
    const cls = Array.from(target.classList).join('.')
    const tempCls = cls ? `.${cls}` : ''
    const contains = tempCls && tbody.querySelector(tempCls)
    if (!contains && !isSVGElement(target)) {
      currentForm.value?.stopCellEdit()
      emit('edited')
      document.removeEventListener('click', handleStopEditClick)
    }
  }
}

const { subPageInfo, size } = toRefs(state)

function handleScrollCloseTooltip() {
  nextTick(() => {
    const ele = document.querySelectorAll('.el-tooltip__popper') as NodeListOf<HTMLElement>
    if (!ele) {
      return
    }
    ele.forEach((item) => {
      item.style.display = 'none'
    })
  })
}

const summaryColumns = computed(() => {
  if (props.totalColumns?.length) {
    return props.totalColumns
  }

  return props.columns
    ?.filter((item) => item.summary && !item.hideInTable)
    .map((item) => ({ column: item.prop }))
})

const paginationInstance = ref<PlusPaginationInstance | null>(null)
const { getSummaries } = useTableSummary(summaryColumns.value)

/**
 * 设置表格自适应高度
 * 优化点：
 * 1. 多次 nextTick 确保 DOM 完全渲染
 * 2. 强制重绘以获取最新位置信息
 * 3. 增加容错处理
 * 4. 计算更加精准
 */

const setAdaptive = async () => {
  await nextTick()
  if (!tableInstance.value) return

  requestAnimationFrame(() => {
    const tableEl = tableInstance.value.$el as HTMLElement
    if (!tableEl) return
    const parent = tableEl.parentElement
    if (!parent) return

    let offsetBottom = 36
    let paginationHeight = 0

    if (isPlainObject(props.adaptive)) {
      offsetBottom = props.adaptive.offsetBottom ?? offsetBottom
    }

    if (paginationInstance.value && props.pagination) {
      paginationHeight = paginationInstance.value.$el.offsetHeight || 0
    }

    const availableHeight = window.innerHeight - parent.getBoundingClientRect().top - offsetBottom
    const tableHeight = Math.max(0, availableHeight - paginationHeight)
    tableEl.style.height = `${tableHeight}px`
  })
}

const debounceSetAdaptive = debounce(
  setAdaptive,
  isPlainObject(props.adaptive) ? props.adaptive?.timeout ?? 60 : 60
)
/**
 * 校验整个表格的所有可编辑表单项
 * @returns Promise<boolean | Error[]> - 如果全部通过返回 true，否则返回错误数组
 */
const validateAll = async (): Promise<boolean | any[]> => {
  const allPromises: Promise<any>[] = []

  // 遍历每一行
  for (const rowIndex in unref(formRefs)) {
    const rowForms = unref(formRefs)[rowIndex]
    if (Array.isArray(rowForms)) {
      // 遍历该行的每个表单（每个可编辑列）
      for (const colForm of rowForms) {
        if (colForm?.formInstance?.value?.validate) {
          allPromises.push(colForm.formInstance.value.validate().catch((err) => err))
        }
      }
    }
  }

  if (allPromises.length === 0) {
    return true // 没有可校验项，默认通过
  }

  const results = await Promise.all(allPromises)
  const errors = results.filter((res) => res !== true)

  if (errors.length > 0) {
    return errors // 返回所有校验失败的错误对象
  }

  return true
}
/**
 * 校验某一行的所有可编辑表单项
 * @param rowIndex 行索引
 * @returns Promise<boolean | Error[]> - 如果全部通过返回 true，否则返回错误数组
 */
const validateRow = async (rowIndex: number): Promise<boolean | any[]> => {
  const rowForms = unref(formRefs)[rowIndex]
  if (!Array.isArray(rowForms) || rowForms.length === 0) {
    return true
  }

  const promises = rowForms
    .filter((colForm) => colForm?.formInstance?.value?.validate)
    .map((colForm) => colForm.formInstance.value.validate().catch((err) => err))

  if (promises.length === 0) return true

  const results = await Promise.all(promises)
  const errors = results.filter((res) => res !== true)
  return errors.length > 0 ? errors : true
}

/**
 * 清除所有表单的校验状态
 * 清除所有校验的红色错误提示（但保留输入值）。
 */
const clearValidateAll = () => {
  for (const rowIndex in unref(formRefs)) {
    const rowForms = unref(formRefs)[rowIndex]
    if (Array.isArray(rowForms)) {
      for (const colForm of rowForms) {
        if (colForm?.formInstance?.value?.clearValidate) {
          colForm.formInstance.value.clearValidate()
        }
      }
    }
  }
}
const resetAll = () => {
  for (const rowIndex in unref(formRefs)) {
    const rowForms = unref(formRefs)[rowIndex]
    if (Array.isArray(rowForms)) {
      for (const colForm of rowForms) {
        if (colForm?.formInstance?.value?.resetFields) {
          colForm.formInstance.value.resetFields()
        }
      }
    }
  }
}

const setCellValue = async (
  rowIndex: number,
  prop: string,
  value: any,
  options?: { clearValidate?: boolean }
) => {
  const row = currentTableData.value[rowIndex]
  if (!row) return

  if (!Object.is(row[prop], value)) {
    row[prop] = value
  }

  if (options?.clearValidate !== false) {
    await nextTick()
    clearValidateCell(rowIndex, prop)
  }
}

const findRowIndex = (locator: RowLocator): number => {
  const data = currentTableData.value

  // 1️⃣ 索引
  if (typeof locator === 'number') {
    return locator >= 0 && locator < data.length ? locator : -1
  }

  // 2️⃣ 函数
  if (typeof locator === 'function') {
    return data.findIndex((row, index) => locator(row, index))
  }

  // 3️⃣ 对象匹配（key-value 全等）
  if (typeof locator === 'object') {
    return data.findIndex((row) => Object.keys(locator).every((key) => row?.[key] === locator[key]))
  }

  return -1
}

const setCellRow = async (
  locator: RowLocator,
  values: Record<string, any>,
  options?: { clearValidate?: boolean }
) => {
  const rowIndex = findRowIndex(locator)
  if (rowIndex === -1) return

  const row = currentTableData.value[rowIndex]
  if (!row || typeof values !== 'object') return

  let changed = false
  Object.keys(values).forEach((key) => {
    if (!Object.is(row[key], values[key])) {
      row[key] = values[key]
      changed = true
    }
  })

  if (changed && options?.clearValidate !== false) {
    await nextTick()
    clearValidateRow(rowIndex)


  }

  emit('formChange', { row, rowIndex })
}

const matchRow = (row: RecordType, index: number, locator?: RowLocator) => {
  if (!locator) return true

  if (Array.isArray(locator)) {
    return locator.includes(index)
  }

  if (typeof locator === 'function') {
    return locator(row, index)
  }

  if (typeof locator === 'object') {
    return Object.keys(locator).every((key) => row[key] === locator[key])
  }

  return false
}

const diffAndPatchRow = (row: RecordType, patch: Record<string, any>): boolean => {
  let changed = false

  Object.keys(patch).forEach((key) => {
    const next = patch[key]
    const prev = row[key]
    // Object.is 比 === 更安全（NaN / -0）
    if (!Object.is(prev, next)) {
      row[key] = next
      changed = true
    }
  })

  return changed
}

const updateRows = (
  locator?: RowLocator,
  updater?: Record<string, any> | ((row: RecordType, index: number) => Record<string, any>)
) => {
  const data = currentTableData.value
  if (!data?.length) return

  let hitCount = 0
  let changeCount = 0

  data.forEach((row, index) => {
    if (!matchRow(row, index, locator)) return
    hitCount++

    const patch = typeof updater === 'function' ? updater(row, index) : updater

    if (!patch || typeof patch !== 'object') return

    const changed = diffAndPatchRow(row, patch)
    if (changed) {
      changeCount++
    }
  })
  // 🔔 只有真的发生变化，才做后续动作
  if (changeCount > 0) {
    emit('edited')
  }
}
const clearValidateCell = (rowIndex: number, prop: string) => {
  const rowForms = unref(formRefs)[rowIndex]
  if (!Array.isArray(rowForms)) return

  const target = rowForms.find((item) => item?.prop === prop)
  target?.formInstance?.value?.clearValidate?.()
}
const clearValidateRow = (rowIndex: number) => {
  const rowForms = unref(formRefs)[rowIndex]
  if (!Array.isArray(rowForms)) return

  rowForms.forEach((colForm) => {
    colForm?.formInstance?.value?.clearValidate?.()
  })
}
onMounted(() => {
  window.addEventListener('scroll', handleScrollCloseTooltip)
  if (hasAdaptive.value) {
    setAdaptive()
    window.addEventListener('resize', debounceSetAdaptive)
  }
})
onUnmounted(() => {
  currentForm.value?.stopCellEdit()
  currentForm.value = null
  formRefs.value = {}
  document.removeEventListener('click', handleStopEditClick)
  window.removeEventListener('scroll', handleScrollCloseTooltip)
  if (hasAdaptive.value) {
    window.removeEventListener('resize', debounceSetAdaptive)
  }
})

defineExpose({
  formRefs,
  tableInstance,
  validateAll,
  clearValidateAll,
  validateRow,
  resetAll,

  //清除某一行校验
  clearValidateCell,
  clearValidateRow,

  // 行数据更新某一行
  setCellValue,
  setCellRow,
  // 行数据更新方法 更多用于批量更新
  updateRows
})
</script>
