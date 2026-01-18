<template>
  <div v-for="item in columns" :key="item.prop" v-bind="item.colProps || colProps">
    <div class="form-group">
      <CustomFormItem
        :class="{ 'custom-form-item': !!item.children }"
        :children="item.children"
        :model-value="getModelValue(item.prop)"
        v-bind="item"
        :has-label="false"
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
      </CustomFormItem>
      <CustomFormItem
        v-if="item.children"
        v-bind="item.children"
        :model-value="getModelValue(item.children.prop)"
        :has-label="false"
        @change="(value) => handleChange(value, item.children)"
      >
        <!--表单项label插槽 -->
        <template
          v-if="$slots[getLabelSlotName(item.children.prop)]"
          #[getLabelSlotName(item.children.prop)]="data"
        >
          <slot :name="getLabelSlotName(item.children.prop)" v-bind="data"></slot>
        </template>

        <!--表单项插槽 -->
        <template v-if="$slots[getFieldSlotName(item.prop)]" #[getFieldSlotName(item.prop)]="data">
            <slot :name="getFieldSlotName(item.prop)" v-bind="data"></slot>
        </template>

        <!--表单tooltip插槽 -->
        <template v-if="$slots['tooltip-icon']" #tooltip-icon>
          <slot name="tooltip-icon"></slot>
        </template>
      </CustomFormItem>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ComputedRef, Ref } from 'vue'
import { ref, unref, watch } from 'vue'
import type { ColProps } from 'element-plus'
import { FieldValues, FieldValueType, PlusColumn } from '@/components/PlusTable/types'
type Mutable<T> = { -readonly [P in keyof T]: T[P] } // 自定义 Mutable 类型
import { isBoolean } from '@/utils/is'
import {
  getFieldSlotName,
  getLabelSlotName,
  getValue,
  setValue
} from '@/components/PlusTable/utils'


export interface PlusFormContentProps {
  modelValue?: FieldValues
  hasLabel?: boolean
  columns: PlusColumn[]
  colProps?: Partial<Mutable<ColProps>>
}

export interface PlusFormContentEmits {
  (e: 'update:modelValue', values: FieldValues): void
  (e: 'change', values: FieldValues, column: PlusColumn): void
}

defineOptions({
  name: 'CustomFormContent'
})

const props = withDefaults(defineProps<PlusFormContentProps>(), {
  modelValue: () => ({}),
  hasLabel: false,
  colProps: () => ({}),
  columns: () => []
})
const emit = defineEmits<PlusFormContentEmits>()

const values = ref<FieldValues>({})

const getHasLabel = (hasLabel?: boolean | Ref<boolean> | ComputedRef<boolean>) => {
  const has = unref(hasLabel) as boolean
  if (isBoolean(has)) {
    return has
  }
  return ''
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
.custom-form-item {
  margin-right: -2px !important;
  :deep(.el-input__wrapper) {
    border-right: 0 !important;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  :deep(.el-select .is-focus) {
    z-index: 9;
  }

  & + .el-form-item {
    :deep(.el-input__wrapper),
    :deep(.el-select-v2__wrapper),
    :deep(.el-date-editor--daterange) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
.form-group {
  display: flex;
  align-items: center;

  .el-form-item {
    flex: 1;
    margin: 0;
  }

  // 避免默认边距
  :deep(.el-form-item__label) {
    padding-right: 0;
  }


}
</style>
