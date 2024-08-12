<template>
  <template v-for="(item, index) in optimizedColumns" :key="getKey(item)">
    <el-table-column
      :class-name="'plus-table-column ' + (hasPropsEditIcon ? 'plus-table-column__edit' : '')"
      v-bind="item.tableColumnProps"
      :prop="item.prop"
      :width="item.width"
      :min-width="item.minWidth"
      :index="index"
    >
      <template #header="scoped">
        <span class="plus-table-column__header">
          <PlusRender
            v-if="item.renderHeader && isFunction(item.renderHeader)"
            :render="item.renderHeader"
            :params="{ ...scoped, ...item, cellIndex: index }"
            :callback-value="getLabel(item.label)"
          />

          <!--表格单元格Header的插槽 -->
          <slot
            v-else
            :name="getTableHeaderSlotName(item.prop)"
            :prop="item.prop"
            :label="getLabel(item.label)"
            :field-props="item.fieldProps"
            :value-type="item.valueType"
            :cell-index="index"
            v-bind="scoped"
            :column="{ ...scoped, ...item }"
          >
            {{ getLabel(item.label) }}
          </slot>

          <el-tooltip v-if="item.tooltip" placement="top" v-bind="getTooltip(item.tooltip)">
            <slot name="tooltip-icon">
              <el-icon class="plus-table-column__header__icon" :size="16">
                <QuestionFilled />
              </el-icon>
            </slot>
          </el-tooltip>
        </span>
      </template>

      <template #default="{ row, column, $index, ...rest }">
        <PlusDisplayItem
          ref="plusDisplayItemInstance"
          :column="item"
          :row="row"
          :index="$index"
          :editable="editable"
          :rest="{ column, ...rest }"
          @change="(data) => handleChange(data, $index, column, item, rest)"
        >
          <!--表单单项的插槽 -->
          <template
            v-if="$slots[getFieldSlotName(item.prop)]"
            #[getFieldSlotName(item.prop)]="data"
          >
            <slot :name="getFieldSlotName(item.prop)" v-bind="data"></slot>
          </template>

          <!-- 表单el-PlusFormItem 下一行额外的内容 的插槽 -->
          <template
            v-if="$slots[getExtraSlotName(item.prop)]"
            #[getExtraSlotName(item.prop)]="data"
          >
            <slot :name="getExtraSlotName(item.prop)" v-bind="data"></slot>
          </template>

          <!--表格单元格的插槽 -->
          <template
            v-if="$slots[getTableCellSlotName(item.prop)]"
            #[getTableCellSlotName(item.prop)]="data"
          >
            <slot :name="getTableCellSlotName(item.prop)" v-bind="data"></slot>
          </template>

          <!--表格单元格编辑的插槽 -->
          <template v-if="$slots['edit-icon']" #edit-icon>
            <slot name="edit-icon"></slot>
          </template>
        </PlusDisplayItem>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts" setup>
import { PlusDisplayItem } from '@/components/display-item/index'
import type { PlusDisplayItemInstance } from '@/components/display-item/index'
import type { PlusColumn, RecordType } from '@/components/PlusTable/types'
import {
  getTooltip,
  getTableKey,
  getTableCellSlotName,
  getTableHeaderSlotName,
  getFieldSlotName,
  getExtraSlotName,
  getLabel
} from '@/components/PlusTable/utils'
import { isFunction } from '@/utils/is'
import { TableFormRefInjectionKey } from '@/components/PlusTable/constants'
import { QuestionFilled } from '@element-plus/icons-vue'
import type { Ref, ComputedRef } from 'vue'
import { ref, inject, watch, computed } from 'vue'
import { PlusRender } from '@/components/PlusRender'
import type { TableColumnCtx } from 'element-plus'
import { ElTableColumn, ElTooltip, ElIcon } from 'element-plus'
import type { TableFormRefRow, FormChangeCallBackParams } from './type'
import {useI18n} from '@/hooks/web/useI18n'
export interface PlusTableTableColumnProps {
  columns?: PlusColumn[]
  editable?: boolean | 'click' | 'dblclick'
}
export interface PlusTableTableColumnEmits {
  (e: 'formChange', data: FormChangeCallBackParams): void
}

defineOptions({
  name: 'PlusTableTableColumn'
})

const props = withDefaults(defineProps<PlusTableTableColumnProps>(), {
  columns: () => [],
  editable: false
})

const emit = defineEmits(['formChange'])

/**
 *  表单ref处理
 */
const plusDisplayItemInstance = ref<PlusDisplayItemInstance[] | null>()
const formRef = inject(TableFormRefInjectionKey) as Ref<Record<string | number, TableFormRefRow[]>>

/**
 *  设置表单ref
 */
const setFormRef = () => {
  if (!plusDisplayItemInstance.value?.length) return
  const data: RecordType = {}
  const list: { index: number; prop: string; formInstance: ComputedRef<any> }[] =
    plusDisplayItemInstance.value?.map((item) => ({
      ...item,
      ...item?.getDisplayItemInstance()
    })) || []
  list.forEach((item) => {
    if (!data[item.index]) {
      data[item.index] = []
    }
    data[item.index].push(item)
  })

  formRef.value = data
}

watch(
  plusDisplayItemInstance,
  () => {
    setFormRef()
  },
  {
    deep: true
  }
)

// 是否需要editIcon
const hasPropsEditIcon = computed(() => props.editable === 'click' || props.editable === 'dblclick')

/**
 * 获取key
 * @param item
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const getKey = (item: PlusColumn) => getTableKey(item, true)

/**
 * 表单发生变化
 * @param data
 * @param index
 * @param column
 * @param item
 */
const handleChange = (
  data: { value: any; prop: string; row: RecordType },
  index: number,
  column: TableColumnCtx<RecordType>,
  item: PlusColumn,
  rest: RecordType
) => {
  const formChangeCallBackParams = {
    ...data,
    index,
    column: { ...column, ...item },
    rowIndex: index,
    ...rest
  } as unknown as FormChangeCallBackParams

  emit('formChange', formChangeCallBackParams)
}

// Optimized columns to avoid unnecessary re-renders
const optimizedColumns = computed(() => {
  return props.columns.map((item) => ({
    ...item,
    label: getLabel(item.label),
    tooltip: item.tooltip ? getTooltip(item.tooltip) : undefined
  }))
})

defineExpose({
  plusDisplayItemInstance
})
</script>
