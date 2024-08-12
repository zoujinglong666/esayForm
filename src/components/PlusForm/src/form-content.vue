<template>
  <el-row v-bind="rowProps" class="plus-form__row">
    <el-col v-for="item in columns" :key="item.prop" v-bind="item.colProps || colProps">
      <PlusFormItem
        :model-value="getModelValue(item.prop)"
        v-bind="item"
        :has-label="getHasLabel(item.hasLabel)"
        @change="(value) => handleChange(value, item)"
      >
        <!--表单项label插槽 -->
        <template v-if="$slots[getLabelSlotName(item.prop)]" #[getLabelSlotName(item.prop)]="data">
          <slot :name="getLabelSlotName(item.prop)" v-bind="data"></slot>
        </template>

        <!--表单项插槽 -->
        <template v-if="$slots[getFieldSlotName(item.prop)]" #[getFieldSlotName(item.prop)]="data">
          <slot :name="getFieldSlotName(item.prop)" v-bind="data"></slot>
        </template>

        <!--表单tooltip插槽 -->
        <template v-if="$slots['tooltip-icon']" #tooltip-icon>
          <slot name="tooltip-icon"></slot>
        </template>
      </PlusFormItem>

      <!-- el-PlusFormItem 下一行额外的内容 -->
      <div
        v-if="item.renderExtra || $slots[getExtraSlotName(item.prop)]"
        class="plus-form-item-extra"
      >
        <component
          :is="item.renderExtra"
          v-if="item.renderExtra && isFunction(item.renderExtra)"
          v-bind="item"
        />

        <slot
          v-else-if="$slots[getExtraSlotName(item.prop)]"
          :name="getExtraSlotName(item.prop)"
          v-bind="item"
        ></slot>
      </div>
    </el-col>

    <!-- 搜索的footer插槽  -->
    <slot name="search-footer"></slot>
  </el-row>
</template>

<script lang="ts" setup>
import type { Ref, ComputedRef, PropType } from 'vue'
import { ref, watch, unref } from 'vue'
import type { RowProps, ColProps } from 'element-plus'
import { ElRow, ElCol } from 'element-plus'
import { PlusFormItem } from '@/components/PlusFormItem'
import type { PlusColumn, FieldValues, FieldValueType, Mutable } from '@/components/PlusTable/types'
import {
  getLabelSlotName,
  getFieldSlotName,
  getExtraSlotName,
  getValue,
  setValue
} from '@/components/PlusTable/utils'
import { isFunction, isBoolean } from '@/utils/is'
export interface PlusFormContentProps {
  modelValue?: FieldValues
  hasLabel?: boolean
  columns?: PlusColumn[]
  rowProps?: Partial<Mutable<RowProps>>
  colProps?: Partial<Mutable<ColProps>>
}

export interface PlusFormContentEmits {
  (e: 'update:modelValue', values: FieldValues): void
  (e: 'change', values: FieldValues, column: PlusColumn): void
}

defineOptions({
  name: 'PlusFormContent'
})

const props = defineProps({
  modelValue: {
    type: Object as PropType<FieldValues>,
    default: () => ({})
  },
  hasLabel: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  rowProps: {
    type: Object as PropType<Partial<Mutable<RowProps>>>,
    default: () => ({})
  },
  colProps: {
    type: Object as PropType<Partial<Mutable<ColProps>>>,
    default: () => ({})
  },
  columns: {
    type: Array as PropType<PlusColumn[]>,
    default: () => []
  }
})
const emit = defineEmits<PlusFormContentEmits>()

const values = ref<FieldValues>({})

const getHasLabel = (hasLabel?: boolean | Ref<boolean> | ComputedRef<boolean>) => {
  const has = unref(hasLabel) as boolean
  if (isBoolean(has)) {
    return has
  }
  return props.hasLabel
}

watch(
  () => props.modelValue,
  (val) => {
    values.value = val
  },
  {
    immediate: true
  }
)

const getModelValue = (prop: string) => getValue(values.value, prop)

const handleChange = (value: FieldValueType, column: PlusColumn) => {
  setValue(values.value, column.prop, value)
  emit('update:modelValue', values.value)
  emit('change', values.value, column)
}
</script>

<style lang="scss" scoped>
@import '@/components/PlusTable/styles/src/form-item.scss';
</style>
