<template>
  <div v-for="item in processedColumns" :key="item.prop" v-bind="item.colProps || colProps">
    <div class="form-group">
      <!-- 主字段 -->
      <CustomFormItem
        :children="item.children"
        :class="{ 'custom-form-item': !!item.children }"
        :has-label="false"
        :model-value="getModelValue(item.prop)"
        v-bind="item"
        @change="(value) => handleChange(value, item)"
      >
        <!-- label 插槽 -->
        <template v-if="$slots[getLabelSlotName(item.prop)]" #[getLabelSlotName(item.prop)]="data">
          <slot :name="getLabelSlotName(item.prop)" v-bind="data"></slot>
        </template>

        <!-- field 插槽 -->
        <template v-if="$slots[getFieldSlotName(item.prop)]" #[getFieldSlotName(item.prop)]="data">
          <slot :name="getFieldSlotName(item.prop)" v-bind="data"></slot>
        </template>

        <!-- tooltip 插槽 -->
        <template v-if="$slots['tooltip-icon']" #tooltip-icon>
          <slot name="tooltip-icon"></slot>
        </template>
      </CustomFormItem>

      <!-- 子字段（children）- 支持动态配置 -->
      <template v-if="getDynamicChildren(item)">
        <CustomFormItem
          :has-label="false"
          :model-value="getModelValue(getDynamicChildren(item).prop)"
          v-bind="getDynamicChildren(item)"
          @change="(value) => handleChange(value, getDynamicChildren(item)!)"
        >
          <!-- label 插槽 -->
          <template
            v-if="$slots[getLabelSlotName(getDynamicChildren(item).prop)]"
            #[getLabelSlotName(getDynamicChildren(item).prop)]="data"
          >
            <slot :name="getLabelSlotName(getDynamicChildren(item).prop)" v-bind="data"></slot>
          </template>

          <!-- field 插槽（注意：这里应使用 children 的 prop，但通常不需要自定义） -->
          <template
            v-if="$slots[getFieldSlotName(getDynamicChildren(item).prop)]"
            #[getFieldSlotName(getDynamicChildren(item).prop)]="data"
          >
            <slot :name="getFieldSlotName(getDynamicChildren(item).prop)" v-bind="data"></slot>
          </template>

          <!-- tooltip 插槽 -->
          <template v-if="$slots['tooltip-icon']" #tooltip-icon>
            <slot name="tooltip-icon"></slot>
          </template>
        </CustomFormItem>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import type { ColProps } from 'element-plus'
import type { FieldValues, FieldValueType, PlusColumn } from '@/components/PlusTable/types'
import CustomFormItem from '@/components/PlusQuery/src/CustomFormItem.vue'

import {
  getFieldSlotName,
  getLabelSlotName,
  getValue,
  setValue
} from '@/components/PlusTable/utils'
import { getOptionsAsync } from '@/components/PlusQuery/utils'

interface EnhancedPlusColumn extends PlusColumn {
  children?: EnhancedPlusColumn & { parentProp?: string }
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] } // 自定义 Mutable 类型
export interface PlusFormContentProps {
  modelValue?: FieldValues
  hasLabel?: boolean
  columns: PlusColumn[]
  colProps?: Partial<Mutable<ColProps>>
  defaultValues?: FieldValues
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
  columns: () => [],
  defaultValues: () => ({})
})
const emit = defineEmits<PlusFormContentEmits>()

const values = ref<FieldValues>({})

// 预处理 columns：给 children 注入 parentProp
const processedColumns = computed<EnhancedPlusColumn[]>(() => {
  return props.columns.map((col) => {
    if (col.children) {
      return {
        ...col,
        children: {
          ...col.children,
          parentProp: col.prop // 标记父字段名
        }
      }
    }
    return col as any
  })
})

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    // 使用深拷贝确保响应式更新，避免直接引用
    const newValues = { ...val }
    // 只有当值真正发生变化时才更新，避免不必要的重新渲染
    if (JSON.stringify(values.value) !== JSON.stringify(newValues)) {
      values.value = newValues
    }
  },
  { immediate: true, deep: true }
)

// 监听columns变化，处理默认值
watch(
  () => props.columns,
  (columns) => {
    if (columns && columns.length > 0) {
      let hasChanges = false
      const newValues = { ...values.value }

      // 递归处理列配置，提取defaultValue
      const extractDefaultValues = (cols: any[]) => {
        cols.forEach((col) => {
          // 如果当前字段有defaultValue且当前值为空，则使用默认值
          if (
            col.defaultValue !== undefined &&
            (newValues[col.prop] === undefined ||
              newValues[col.prop] === '' ||
              newValues[col.prop] === null)
          ) {
            newValues[col.prop] = col.defaultValue
            hasChanges = true
          }

          // 如果有子字段，也处理子字段的defaultValue
          if (
            col.children &&
            col.children.defaultValue !== undefined &&
            (newValues[col.children.prop] === undefined ||
              newValues[col.children.prop] === '' ||
              newValues[col.children.prop] === null)
          ) {
            newValues[col.children.prop] = col.children.defaultValue
            hasChanges = true
          }
        })
      }

      extractDefaultValues(columns)

      // 处理 props.defaultValues 中的默认值
      if (props.defaultValues && Object.keys(props.defaultValues).length > 0) {
        Object.keys(props.defaultValues).forEach((key) => {
          if (newValues[key] === undefined || newValues[key] === '' || newValues[key] === null) {
            newValues[key] = props.defaultValues[key]
            hasChanges = true
          }
        })
      }

      // 如果有新的默认值，更新values
      if (hasChanges) {
        values.value = newValues
        // 同步到父组件
        emit('update:modelValue', { ...newValues })
      }
    }
  },
  { immediate: true, deep: true }
)

// 监听values变化，确保能及时同步到父组件
watch(
  values,
  (newValues) => {
    // 确保values变化时能及时同步，避免点击两次的问题
    const stringifiedValues = JSON.stringify(newValues)
    const stringifiedProps = JSON.stringify(props.modelValue)

    if (stringifiedValues !== stringifiedProps) {
      // 使用nextTick确保DOM更新完成
      nextTick(() => {
        emit('update:modelValue', { ...newValues })
      })
    }
  },
  { deep: true }
)

const getDynamicChildren = (item: EnhancedPlusColumn | undefined) => {
  if (!item) return undefined

  const currentValue = getValue(values.value, item.prop) as string | undefined
  if (!currentValue) return item.children

  const rawOptions = item.fieldProps?.options
  const optionsArray = Array.isArray(unref(rawOptions)) ? unref(rawOptions) : []
  if (optionsArray.length === 0) return item.children

  const selectedOption = optionsArray.find((opt: any) => opt && opt.value === currentValue)

  if (selectedOption?.children) {
    return {
      ...selectedOption.children,
      parentProp: item.prop
    }
  }

  return item.children
}

// 获取字段值
const getModelValue = (prop: string) => getValue(values.value, prop)
interface Option {
  value: string
  label: string
  fields?: string[]
  children?: boolean // 或更具体的结构
}

interface Option {
  value: string
  label: string
  fields?: string[]
  children?: boolean // 或更具体的结构
}

const handleChange = (value: FieldValueType, column: EnhancedPlusColumn) => {
  const newValues = { ...values.value }
  // 1. 更新当前字段
  setValue(newValues, column.prop, value)

  // 2. 主字段变化：同步子字段 + 清理无关 realKeys
  if (column.children) {
    handleMainFieldChange(newValues, column, value as string | null)
  }

  // 3. 子字段变化：回写到父字段对应的真实字段
  if ('parentProp' in column && column.parentProp) {
    handleChildFieldChange(newValues, column, value)
  }

  // 4. 提交更新
  values.value = newValues

  nextTick(() => {
    emit('update:modelValue', { ...newValues })
    emit('change', newValues, column)
  })
}

async function handleMainFieldChange(
  newValues: Record<string, any>,
  column: EnhancedPlusColumn,
  selectedKey: string | null
) {
  const { children, realKeys, fieldProps } = column

  // 获取所有可能的真实 key
  const allRealKeys = Array.isArray(realKeys)
    ? realKeys
    : fieldProps?.options?.map((opt) => opt.value) || []

  // 同步占位子字段（如 time-child）
  if (children?.prop) {
    const realValue = selectedKey ? getValue(newValues, selectedKey) : undefined
    setValue(newValues, children.prop, realValue)
  }

  // 清理其他 realKeys 字段（保持响应式）
  if (selectedKey != null) {
    allRealKeys.forEach((key) => {
      if (key !== selectedKey && newValues.hasOwnProperty(key)) {
        setValue(newValues, key, undefined)
      }
    })
  }

  // 清理非选中选项的动态子字段（如 opt.children 存在）
  const normalized = await getOptionsAsync(fieldProps?.options)
  if (selectedKey && normalized) {
    for (const opt of normalized) {
      if (opt.children && opt.value !== selectedKey) {
        setValue(newValues, opt.value, undefined)
      }
    }
  }
}

async function handleChildFieldChange(
  newValues: Record<string, any>,
  column: EnhancedPlusColumn,
  childValue: FieldValueType
) {
  const parentProp = column.parentProp!
  const selectedType = getValue(newValues, parentProp) as string | undefined

  if (!selectedType) return
  const normalized = await getOptionsAsync(column.fieldProps?.options)
  const option = normalized?.find((opt) => opt.value === selectedType)
  if (!option) return

  const { fields, children } = option

  if (fields?.length === 2 && Array.isArray(childValue)) {
    // 范围型：[start, end] → 写入两个字段
    const [startField, endField] = fields
    const [startVal, endVal] = childValue
    setValue(newValues, startField, startVal)
    setValue(newValues, endField, endVal)
  } else if (fields?.length === 1) {
    // 单值型：写入指定字段
    setValue(newValues, fields[0], childValue)
  } else if (!fields && children) {
    // 直接以 selectedType 为字段名写入（兼容旧配置）
    setValue(newValues, selectedType, childValue)
  }
}
</script>

<style lang="scss" scoped>
.custom-form-item {
  margin-right: -2px !important;

  // 👇 覆盖所有可能的 wrapper
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),        /* ← 新增这一行 */
  :deep(.el-select-v2__wrapper),
  :deep(.el-date-editor .el-input__wrapper),
  :deep(.el-cascader .el-input__wrapper),
  :deep(.el-time-picker .el-input__wrapper) {
    border-right: 0 !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  :deep(.el-select .is-focus),
  :deep(.el-select-v2.is-focus) {
    z-index: 9;
  }

  & + .el-form-item {
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper),      /* ← 这里也要加 */
    :deep(.el-select-v2__wrapper),
    :deep(.el-date-editor .el-input__wrapper),
    :deep(.el-cascader .el-input__wrapper),
    :deep(.el-time-picker .el-input__wrapper) {
      border-left: 0 !important;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
    }
  }
}

.form-group {
  display: flex;
  align-items: center;

  // 默认情况下，表单项不设置 flex: 1，让字段宽度由 fieldProps.style.width 控制
  .el-form-item {
    margin: 0;
    flex: unset;
    width: auto;
    min-width: 220px;
  }

  // 只有当字段没有子字段且没有设置宽度时，才使用 flex: 1 填充剩余空间
  .el-form-item:not(.custom-form-item):not([style*='width']) {
    flex: 1;
  }

  :deep(.el-form-item__label) {
    padding-right: 0;
  }
}
</style>
