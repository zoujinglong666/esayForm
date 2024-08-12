<template>
  <div ref="tableWrapperInstance" class="plus-table">
    <PlusTableTitleBar
      v-if="titleBar"
      :columns="filterColumns"
      :default-size="size"
      :columns-is-change="columnsIsChange"
      :title-bar="titleBar"
      @click-density="handleClickDensity"
      @filter-table="handleFilterTableConfirm"
      @refresh="handleRefresh"
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
      :reserve-selection="true"
      :data="__tableData"
      :border="true"
      :height="props?.height"
      :header-cell-style="headerCellStyle"
      :size="size"
      :row-key="rowKey"
      scrollbar-always-on
      highlight-current-row
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
            type="selection"
            v-bind="selectionTableColumnProps"
          />

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
            :sortable="dragSortable"
            :drag-sortable-table-column-props="dragSortableTableColumnProps"
            :table-instance="tableInstance"
            @drag-sort-end="handleDragSortEnd"
          >
            <template v-if="$slots['drag-sort-icon']" #drag-sort-icon>
              <slot name="drag-sort-icon"></slot>
            </template>
          </PlusTableColumnDragSort>

          <!-- 展开行 -->
          <el-table-column v-if="hasExpand" type="expand" v-bind="expandTableColumnProps">
            <template #default="scoped">
              <div class="plus-table-expand-col">
                <slot name="expand" :index="scoped.$index" v-bind="scoped"></slot>
              </div>
            </template>
          </el-table-column>

          <!--配置渲染栏  -->
          <PlusTableColumn
            :columns="subColumns"
            :editable="props.editable"
            @form-change="handleFormChange"
          >
            <!--表格单元格表头的插槽 -->
            <template v-for="(_, key) in headerSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!--表格单元格的插槽 -->
            <template v-for="(_, key) in cellSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
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
      v-if="pagination"
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
import { reactive, toRefs, watch, ref, provide, shallowRef, useSlots, unref, computed } from 'vue'
import type { PlusPaginationProps } from '@/components/PlusPagination'
import { PlusPagination } from '@/components/PlusPagination'
import {
  TableFormRefInjectionKey,
  TableFormFieldRefInjectionKey
} from '@/components/PlusTable/constants'
import type { Ref, ComputedRef } from 'vue'
import type { ComponentSize } from 'element-plus/es/constants'
import type { TableInstance } from 'element-plus'
import { ElTable, ElTableColumn } from 'element-plus'

import type {
  PageInfo,
  PlusColumn,
  RecordType,
  FormFieldRefsType
} from '@/components/PlusTable/types'
import {
  getTableCellSlotName,
  getTableHeaderSlotName,
  getFieldSlotName,
  getExtraSlotName,
  filterSlots
} from '@/components/PlusTable/utils'
import { cloneDeep } from 'lodash-es'
import PlusTableActionBar from './table-action-bar.vue'
import PlusTableColumn from './table-column.vue'
import PlusTableTableColumnIndex from './table-column-index.vue'
import PlusTableColumnDragSort from './table-column-drag-sort.vue'
import PlusTableTitleBar from './table-title-bar.vue'
import type {
  ButtonsCallBackParams,
  PlusTableState,
  PlusTableSelfProps,
  PlusTableEmits,
  TableFormRefRow,
  FormChangeCallBackParams
} from './type'
import { isSVGElement } from '@/utils/is'

defineOptions({
  name: 'PlusTable',
  inheritAttrs: false
})
const DefaultPageInfo: PageInfo = {
  page: 1,
  pageSize: 10
}

const props = defineProps({
  defaultSize: {
    type: String,
    default: 'default'
  },
  pagination: {
    type: [Boolean, Object],
    default: false
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
  data: {
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
  expandTableColumnProps: {
    type: Object,
    default: () => ({})
  },
  editable: {
    type: [Boolean, String],
    default: false
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
  'cell-dblclick'
])

const subColumns: Ref<PlusColumn[]> = ref([])
const columnsIsChange: Ref<boolean> = ref(false)
const filterColumns: Ref<PlusColumn[]> = ref([])
const tableInstance = shallowRef<TableInstance | null>(null)
const tableWrapperInstance = ref<HTMLDivElement | null>(null)
const state = reactive({
  subPageInfo: {
    ...(((props.pagination as PlusPaginationProps)?.modelValue || DefaultPageInfo) as PageInfo)
  },
  size: props.defaultSize
})
const __tableData: ComputedRef<any[] | undefined> = computed(() =>
  props.tableData?.length ? props.tableData : props.data
)

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
    subColumns.value = val?.filter((item) => unref(item.hideInTable) !== true)
    filterColumns.value = cloneDeep(subColumns.value)
    columnsIsChange.value = !columnsIsChange.value
  },
  {
    deep: true,
    immediate: true
  }
)

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
  emit('dragSortEnd', newIndex, oldIndex)
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
  const rowIndex = __tableData.value?.indexOf(row)
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

const handleClickCell = (
  row: RecordType,
  column: PlusColumn,
  cell: HTMLTableCellElement,
  event: Event
) => {
  handleCellEdit(row, column, 'click')
  emit('cell-click', row, column, cell, event)
}

const handleDoubleClickCell = (
  row: RecordType,
  column: PlusColumn,
  cell: HTMLTableCellElement,
  event: Event
) => {
  handleCellEdit(row, column, 'dblclick')
  emit('cell-dblclick', row, column, cell, event)
}

// 退出编辑状态
const handleStopEditClick = (e: MouseEvent) => {
  if (tableWrapperInstance.value && currentForm.value) {
    const wrapperClass = '.el-table__body-wrapper'
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

defineExpose({
  formRefs,
  tableInstance
})
</script>


