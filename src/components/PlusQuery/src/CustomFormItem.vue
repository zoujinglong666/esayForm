<template>
  <el-form-item
    v-if="valueIsReady"
    ref="formItemInstance"
    :label="hasLabel ? labelValue : ''"
    :prop="prop"
    class="plus-form-item"
    v-bind="customFormItemProps"
    :label-width="hasLabel ? customFormItemProps?.labelWidth : '0px'"
  >
    <!-- Label 插槽 -->
    <template v-if="hasLabel" #label="{ label: currentLabel }">
      <span class="plus-form-item__label">
        <!-- 自定义渲染 Label -->
        <PlusRender
          v-if="renderLabel && isFunction(renderLabel)"
          :render="renderLabel"
          :params="params"
          :callback-value="currentLabel"
          :custom-field-props="customFieldProps"
        />
        <!-- 默认 Label 插槽 -->
        <slot
          v-else
          :name="getLabelSlotName(prop)"
          :prop="prop"
          :label="labelValue"
          :field-props="customFieldProps"
          :value-type="valueType"
          :column="params"
        >
          {{ currentLabel }}
        </slot>
        <!-- Tooltip 提示 -->
        <el-tooltip v-if="tooltip" placement="top" v-bind="getTooltip(tooltip)">
          <slot name="tooltip-icon">
            <el-icon class="plus-table-column__label__icon" :size="16">
              <QuestionFilled />
            </el-icon>
          </slot>
        </el-tooltip>
      </span>
    </template>

    <!-- Field 字段渲染区域 -->
    <!-- 自定义渲染字段 -->
    <PlusRender
      v-if="renderField && isFunction(renderField)"
      :render="renderField"
      :params="params"
      :callback-value="state"
      :custom-field-props="customFieldProps"
      render-type="form"
      :handle-change="handleChange"
    />

    <!-- 自定义字段插槽 -->
    <slot
      v-else-if="$slots[getFieldSlotName(prop)]"
      :name="getFieldSlotName(prop)"
      :prop="prop"
      :label="labelValue"
      :field-props="customFieldProps"
      :value-type="valueType"
      :column="props"
    ></slot>

    <!-- DataSelect 组件 -->
    <DataSelect
      v-else-if="valueType === 'data-select'"
      ref="fieldInstance"
      v-model="state"
      :placeholder="t('plus.field.pleaseSelect') + labelValue"
      class="plus-form-item-field"
      v-bind="customFieldProps"
      @update:model-value="handleChange"
    />

    <!-- 多选 Select -->
    <el-select
      v-else-if="valueType === 'select' && customFieldProps.multiple === true"
      ref="fieldInstance"
      v-model="state"
      :placeholder="t('plus.field.pleaseSelect') + labelValue"
      :popper-append-to-body="false"
      fit-input-width
      class="plus-form-item-field"
      v-bind="customFieldProps"
      @update:model-value="handleChange"
    >
      <template v-for="(fieldSlot, key) in fieldSlots" :key="key" #[key]="data">
        <component :is="fieldSlot" v-bind="data" />
      </template>

      <el-option
        v-for="item in customOptions"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        class="plus-form-item-field"
        v-bind="item.fieldItemProps"
      >
        <component :is="item.fieldSlot" v-if="isFunction(item.fieldSlot)" v-bind="item" />
        <component
          :is="fieldChildrenSlot"
          v-else-if="isFunction(fieldChildrenSlot)"
          v-bind="item"
        />
        <template v-else>{{ item.label }}</template>
      </el-option>
    </el-select>

    <!-- 带子组件的统一表单组件 -->
    <component
      v-else-if="hasFieldComponent(valueType) && getFieldComponent(valueType).children"
      :is="getFieldComponent(valueType).component"
      ref="fieldInstance"
      v-model="state"
      class="plus-form-item-field"
      popper-class="plus-form-item-popper"
      clearable
      v-bind="commonProps"
      @update:model-value="handleChange"
    >
      <template v-for="(fieldSlot, key) in fieldSlots" :key="key" #[key]="data">
        <component :is="fieldSlot" :value="state" :column="params" v-bind="data" />
      </template>

      <component
        :is="getFieldComponent(valueType).children"
        v-for="item in customOptions"
        :key="item.label"
        v-bind="getChildrenProps(item)"
      >
        <component
          :is="item.fieldSlot"
          v-if="isFunction(item.fieldSlot)"
          :model-value="state"
          :column="params"
          v-bind="item"
        />
        <component
          :is="fieldChildrenSlot"
          v-else-if="isFunction(fieldChildrenSlot)"
          :model-value="state"
          :column="params"
          v-bind="item"
        />
        <template v-else>{{ item.label }}</template>
      </component>
    </component>

    <!-- 无子组件的统一表单组件 -->
    <component
      v-else-if="hasFieldComponent(valueType)"
      :is="getFieldComponent(valueType).component"
      ref="fieldInstance"
      v-model="state"
      class="plus-form-item-field"
      popper-class="plus-form-item-popper"
      clearable
      :field-children-slot="fieldChildrenSlot"
      v-bind="commonProps"
      @update:model-value="handleChange"
    >
      <template v-for="(fieldSlot, key) in fieldSlots" :key="key" #[key]="data">
        <component :is="fieldSlot" :model-value="state" :column="params" v-bind="data" />
      </template>
    </component>

    <!-- 静态文本 -->
    <el-text
      v-else-if="valueType === 'text'"
      ref="fieldInstance"
      class="plus-form-item-field"
      v-bind="customFieldProps"
    >
      {{ state }}
    </el-text>

    <!-- 分割线 -->
    <el-divider
      v-else-if="valueType === 'divider'"
      ref="fieldInstance"
      class="plus-form-item-field"
      v-bind="customFieldProps"
    >
      {{ state }}
    </el-divider>

    <!-- 默认输入框 -->
    <el-input
      v-else
      ref="fieldInstance"
      v-model="state"
      :placeholder="t('plus.field.pleaseEnter') + labelValue"
      class="plus-form-item-field"
      autocomplete="off"
      clearable
      v-bind="customFieldProps"
      @update:model-value="handleChange"
    >
      <template v-for="(fieldSlot, key) in fieldSlots" :key="key" #[key]="data">
        <component :is="fieldSlot" :model-value="state" :column="params" v-bind="data" />
      </template>
    </el-input>
  </el-form-item>
</template>

<script lang="ts" setup>
import type { Component, Ref } from 'vue'
import { computed, inject, ref, watch } from 'vue'
import type {
  FieldValueType,
  FormFieldRefsType,
  OptionsRow,
  PlusColumn,
  RecordType
} from '@/components/PlusTable/types'
import {
  getCustomProps,
  getFieldSlotName,
  getLabel,
  getLabelSlotName,
  getTooltip,
  versionIsLessThan260
} from '@/components/PlusTable/utils'
import { isArray, isDate, isEmptyVal, isFunction, isString } from '@/utils/is'
import { QuestionFilled } from '@element-plus/icons-vue'
import { PlusRender } from '@/components/PlusRender'
import {
  ElDivider,
  ElFormItem as FormItemComponent,
  ElIcon as IconComponent,
  ElInput as InputComponent,
  ElOption as OptionComponent,
  ElSelect as SelectComponent,
  ElText,
  ElTooltip as TooltipComponent
} from 'element-plus'
import { getFieldComponent, hasFieldComponent } from '@/components/PlusFormItem/src/form-item'
import useGetOptions from '@/hooks/component/useGetOptions'
import { formatToDateTime } from '@/utils/dateUtil'
import {useI18n} from "@/hooks/web/useI18n.ts";
const ElFormItem: Component = FormItemComponent
const ElTooltip: Component = TooltipComponent
const ElIcon: Component = IconComponent
const ElInput: Component = InputComponent
const ElSelect: Component = SelectComponent
const ElOption: Component = OptionComponent
const DatePickerValueIsArrayList = ['datetimerange', 'daterange', 'monthrange']

/**
 * 表格里表单每一项 的provide(inject) key
 */
const TableFormFieldRefInjectionKey = Symbol('tableFormFieldRefInjectionKey')

/**
 * 表单组件值是数字类型的valueType列表
 */
const ValueIsNumberList = ['rate', 'input-number', 'slider']

/**
 *  表单组件值是数组的valueType列表
 */
const ValueIsArrayList = [
  'checkbox',
  'cascader',
  'plus-date-picker',
  'plus-input-tag',
  'transfer',
  'base-date-picker'
]

const { t } = useI18n()

export interface PlusFormItemProps {
  modelValue?: FieldValueType
  hasLabel?: PlusColumn['hasLabel']
  label?: PlusColumn['label']
  prop: PlusColumn['prop']
  fieldProps?: PlusColumn['fieldProps']
  valueType?: PlusColumn['valueType']
  options?: PlusColumn['options']
  formItemProps?: PlusColumn['formItemProps']
  renderField?: PlusColumn['renderField']
  renderLabel?: PlusColumn['renderLabel']
  tooltip?: PlusColumn['tooltip']
  fieldSlots?: PlusColumn['fieldSlots']
  fieldChildrenSlot?: PlusColumn['fieldChildrenSlot']
  index?: number
  children?: {
    modelValue?: FieldValueType
    hasLabel?: PlusColumn['hasLabel']
    label?: PlusColumn['label']
    prop: PlusColumn['prop']
    fieldProps?: PlusColumn['fieldProps']
    valueType?: PlusColumn['valueType']
    options?: PlusColumn['options']
    formItemProps?: PlusColumn['formItemProps']
    renderField?: PlusColumn['renderField']
    renderLabel?: PlusColumn['renderLabel']
    tooltip?: PlusColumn['tooltip']
    fieldSlots?: PlusColumn['fieldSlots']
    fieldChildrenSlot?: PlusColumn['fieldChildrenSlot']
    index?: number
  }
}

export interface PlusFormItemEmits {
  (e: 'update:modelValue', value: FieldValueType): void

  (e: 'change', value: FieldValueType): void
}

defineOptions({
  name: 'PlusFormItem'
})

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Date, Array, Object, null],
    default: ''
  },
  hasLabel: { type: Boolean, default: true },
  label: { type: [String, Number, Boolean, Date, Array, Object, null], default: '' },
  prop: { type: String, required: true },
  fieldProps: { type: [Object, Function], default: () => ({}) },
  valueType: { type: String, default: undefined },
  options: { type: Array, default: () => [] },
  formItemProps: { type: Object, default: () => ({}) },
  renderField: { type: Function, default: undefined },
  renderLabel: { type: Function, default: undefined },
  tooltip: { type: [String, Boolean], default: '' },
  fieldSlots: { type: [Object, Function], default: () => ({}) },
  fieldChildrenSlot: { type: Function, default: undefined },
  index: { type: Number, default: 0 },
  children: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits<PlusFormItemEmits>()
const { customOptions, customOptionsIsReady } = useGetOptions(props)
const formItemInstance = ref<InstanceType<typeof FormItemComponent> | null>()
const fieldInstance = ref()
const customFormItemProps = ref<RecordType>({})
const customFieldProps = ref<RecordType>({})
const state = ref<FieldValueType>()
const customFieldPropsIsReady = ref(false)
const valueIsReady = ref(false)
const labelValue = computed(() => getLabel(props.label))
const params = computed(() => ({ ...props, label: labelValue.value }))
const formFieldRefs = inject(TableFormFieldRefInjectionKey, {}) as unknown as Ref<FormFieldRefsType>
/**
 * 默认值是数组的情况
 */
const isArrayValue = computed(() => {
  // 先处理明确的否定条件
  if (props.valueType === 'cascader' && customFieldProps.value?.props?.emitPath === false) {
    return false
  }
  // 合并所有返回 true 的条件
  return [
    // 预定义的数组类型列表
    ValueIsArrayList.includes(props.valueType as string),
    // 支持多选的表单组件
    ['select', 'tree-select'].includes(props.valueType as string) &&
      customFieldProps.value?.multiple === true,
    // 日期范围选择器
    props.valueType === 'date-picker' &&
      DatePickerValueIsArrayList.includes(customFieldProps.value?.type),
    // 时间范围选择器
    props.valueType === 'time-picker' && customFieldProps.value?.isRange === true
  ].some((condition) => condition)
})

/**
 * 默认值是数字的情况
 */
const isNumberValue = computed(() => {
  return ValueIsNumberList.includes(props.valueType as string)
})

/**
 * 设置表单值（默认值）
 * @param val
 */
const setValue = (val: FieldValueType) => {
  if (isArrayValue.value) {
    if (isArray(val)) {
      const [start, end] = val
      if (isDate(start) || isDate(end)) {
        state.value = [formatToDateTime(start), formatToDateTime(end)]
      } else {
        state.value = val
      }
    } else {
      state.value = []
    }
  } else if (isNumberValue.value) {
    state.value = isEmptyVal(val) ? null : isString(val) ? Number(val) : val
  } else if (isDate(val)) {
    state.value = formatToDateTime(val)
  } else {
    state.value = val
  }
  valueIsReady.value = true
}

const commonProps = computed(() => {
  const { hasOptions, hasSelectEvent, props: componentProps } = getFieldComponent(props.valueType)

  // 使用 Object.assign 代替展开运算符，减少中间对象创建
  const base = Object.assign(
    {
      placeholder: componentProps?.placeholder
        ? `${t(componentProps.placeholder)}${labelValue.value}`
        : `${t('plus.field.pleaseSelect')}${labelValue.value}`
    },
    componentProps,
    props.fieldProps,
    customFieldProps.value
  )

  // 按需添加属性
  if (hasOptions) {
    Object.assign(base, { options: customOptions.value })
  }
  if (hasSelectEvent) {
    Object.assign(base, { onSelect: handleSelect })
  }
  if (props.valueType === 'date-picker') {
    Object.assign(base, {
      startPlaceholder: componentProps?.startPlaceholder ? t(componentProps.startPlaceholder) : '',
      endPlaceholder: componentProps?.endPlaceholder ? t(componentProps.endPlaceholder) : ''
    })
  }

  return base
})

/**
 * 获取子组件 props，兼容 element-plus@2.6.0
 */
const getChildrenProps = (item: OptionsRow) => {
  const baseProps =
    props.valueType === 'select' || props.valueType === 'data-select'
      ? { label: item.label, value: item.value }
      : versionIsLessThan260
      ? { label: item.value }
      : { label: item.label, value: item.value }

  return {
    ...baseProps,
    ...item.fieldItemProps
  }
}

/**
 * 监听formItemProps
 */
watch(
  () => props.formItemProps,
  (val) => {
    getCustomProps(val, state.value, props, props.index, 'formItemProps')
      .then((data) => {
        customFormItemProps.value = data
      })
      .catch((err) => {
        throw err
      })
  },
  {
    immediate: true,
    deep: true
  }
)

/**
 * 监听fieldProps
 */
watch(
  () => props.fieldProps,
  (val) => {
    getCustomProps(val, state.value, props, props.index, 'fieldProps')
      .then((data) => {
        customFieldProps.value = data
        customFieldPropsIsReady.value = true
      })
      .catch((err) => {
        throw err
      })
  },
  {
    immediate: true,
    deep: true
  }
)

watch(
  computed(() => [props.modelValue, customFieldPropsIsReady.value, customOptionsIsReady.value]),
  ([val, fieldPropsIsReady, optionsIsReady]) => {
    if (fieldPropsIsReady && optionsIsReady) {
      console.log(val)
      setValue(val)
    }
  },
  {
    immediate: true,
    flush: 'post'
  }
)

const handleChange = (val: FieldValueType) => {
  emit('update:modelValue', val)
  emit('change', val)
}

/**
 * el-autocomplete 特殊处理
 * @param param0
 */
const handleSelect = ({ value }: { value: FieldValueType }) => {
  handleChange(value)
}

watch(fieldInstance, () => {
  formFieldRefs.value = {
    fieldInstance: fieldInstance.value,
    valueIsReady: valueIsReady
  }
})

defineExpose({
  formItemInstance,
  fieldInstance
})
</script>


