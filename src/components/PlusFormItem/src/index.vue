<template>
  <template v-if="valueIsReady">
    <el-form-item
      ref="formItemInstance"
      :label="hasLabel ? labelValue : ''"
      :prop="prop"
      class="plus-form-item"
      v-bind="customFormItemProps"
      :label-width="hasLabel ? customFormItemProps?.labelWidth : '0px'"
    >
      <template v-if="hasLabel" #label="{ label: currentLabel }">
        <span class="plus-form-item__label">
          <template v-if="renderLabel && isFunction(renderLabel)">
            <PlusRender
              v-if="valueIsReady"
              :render="renderLabel"
              :params="params"
              :callback-value="currentLabel"
              :custom-field-props="customFieldProps"
            />
          </template>

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

          <el-tooltip v-if="tooltip" placement="top" v-bind="getTooltip(tooltip)">
            <slot name="tooltip-icon">
              <el-icon class="plus-table-column__label__icon" :size="16">
                <QuestionFilled />
              </el-icon>
            </slot>
          </el-tooltip>
        </span>
      </template>

      <template v-if="renderField && isFunction(renderField)">
        <PlusRender
          v-if="valueIsReady"
          :render="renderField"
          :params="params"
          :callback-value="state"
          :custom-field-props="customFieldProps"
          render-type="form"
          :handle-change="handleChange"
        />
      </template>

      <slot
        v-else-if="$slots[getFieldSlotName(prop)]"
        :name="getFieldSlotName(prop)"
        :prop="prop"
        :label="labelValue"
        :field-props="customFieldProps"
        :value-type="valueType"
        :column="props"
      ></slot>

      <el-select
        v-else-if="valueType === 'select' && customFieldProps.multiple === true"
        ref="fieldInstance"
        v-model="state"
        :placeholder="t('plus.field.pleaseSelect') + labelValue"
        class="plus-form-item-field"
        clearable
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
          v-bind="item.fieldItemProps"
        >
          <template #default>
            <component :is="item.fieldSlot" v-if="isFunction(item.fieldSlot)" v-bind="item" />
            <component
              :is="fieldChildrenSlot"
              v-else-if="isFunction(fieldChildrenSlot)"
              v-bind="item"
            />
            <template v-else> {{ item.label }} </template>
          </template>
        </el-option>
      </el-select>

      <!-- 统一处理 -->
      <template v-else-if="hasFieldComponent(valueType)">
        <!-- has-children  -->
        <component
          :is="getFieldComponent(valueType).component"
          v-if="getFieldComponent(valueType).children"
          ref="fieldInstance"
          v-model="state"
          class="plus-form-item-field"
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
            <template #default>
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
              <template v-else> {{ item.label }} </template>
            </template>
          </component>
        </component>
        <!-- no-children  -->
        <component
          :is="getFieldComponent(valueType).component"
          v-else
          ref="fieldInstance"
          v-model="state"
          class="plus-form-item-field"
          clearable
          :field-children-slot="fieldChildrenSlot"
          v-bind="commonProps"
          @update:model-value="handleChange"
        >
          <template v-for="(fieldSlot, key) in fieldSlots" :key="key" #[key]="data">
            <component :is="fieldSlot" :model-value="state" :column="params" v-bind="data" />
          </template>
        </component>
      </template>

      <el-text
        v-else-if="valueType === 'text'"
        ref="fieldInstance"
        class="plus-form-item-field"
        v-bind="customFieldProps"
      >
        {{ state }}
      </el-text>

      <el-divider
        v-else-if="valueType === 'divider'"
        ref="fieldInstance"
        class="plus-form-item-field"
        v-bind="customFieldProps"
      >
        {{ state }}
      </el-divider>

      <el-input
        v-else
        ref="fieldInstance"
        v-model="state"
        class="plus-form-item-field"
        :placeholder="t('plus.field.pleaseEnter') + labelValue"
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
</template>

<script lang="ts" setup>
import type { Component, Ref } from 'vue'
import { ref, watch, computed, inject } from 'vue'
import type {
  PlusColumn,
  FieldValueType,
  OptionsRow,
  RecordType,
  FormFieldRefsType
} from '@/components/PlusTable/types'
import {
  getTooltip,
  getCustomProps,
  getLabelSlotName,
  getFieldSlotName,
  versionIsLessThan260,
  getLabel
} from '@/components/PlusTable/utils'
import { isFunction, isDate, isArray } from '@/utils/is'
import {useI18n} from '@/hooks/web/useI18n'
import { QuestionFilled } from '@element-plus/icons-vue'
import { PlusRender } from '@/components/PlusRender'
import {
  ElFormItem as FormItemComponent,
  ElTooltip as TooltipComponent,
  ElIcon as IconComponent,
  ElInput as InputComponent,
  ElText,
  ElDivider,
  ElSelect as SelectComponent,
  ElOption as OptionComponent
} from 'element-plus'

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
 * 表单组件值是布尔类型的valueType列表
 */

/**
 *  表单组件值是数组的valueType列表
 */
const ValueIsArrayList = ['checkbox', 'cascader', 'plus-date-picker', 'plus-input-tag', 'transfer']
import { hasFieldComponent, getFieldComponent } from './form-item'
import useGetOptions from '@/hooks/component/useGetOptions'
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
}
export interface PlusFormItemEmits {
  (e: 'update:modelValue', value: FieldValueType): void
  (e: 'change', value: FieldValueType): void
}

defineOptions({
  name: 'PlusFormItem'
})

/**
 * FIXME: The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.
 */
const ElFormItem: Component = FormItemComponent
const ElTooltip: Component = TooltipComponent
const ElIcon: Component = IconComponent
const ElInput: Component = InputComponent
const ElSelect: Component = SelectComponent
const ElOption: Component = OptionComponent

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Date, Array, Object, null],
    default: ''
  },
  hasLabel: { type: Boolean, default: true },

  label: { type: [String, Number, Boolean, Date, Array, Object, null], default: '' },
  prop: { type: String, required: true },
  fieldProps: { type: Object, default: () => ({}) },
  valueType: { type: String, default: undefined },
  options: { type: Array, default: () => [] },
  formItemProps: { type: Object, default: () => ({}) },
  renderField: { type: Function, default: undefined },
  renderLabel: { type: Function, default: undefined },
  tooltip: { type: [String, Boolean], default: '' },
  fieldSlots: { type: Object, default: () => ({}) },
  fieldChildrenSlot: { type: Function, default: undefined },
  index: { type: Number, default: 0 }
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
  if (props.valueType === 'cascader' && customFieldProps.value?.props?.emitPath === false) {
    return false
  }

  if (ValueIsArrayList.includes(props.valueType as string)) {
    return true
  }
  if (props.valueType === 'select' && customFieldProps.value?.multiple === true) {
    return true
  }
  if (
    props.valueType === 'date-picker' &&
    DatePickerValueIsArrayList.includes(customFieldProps.value?.type)
  ) {
    return true
  }
  if (props.valueType === 'time-picker' && customFieldProps.value?.isRange === true) {
    return true
  }
  if (props.valueType === 'tree-select' && customFieldProps.value?.multiple === true) {
    return true
  }
  return false
})

/**
 * 默认值是数字的情况
 */
const isNumberValue = computed(() => {
  if (ValueIsNumberList.includes(props.valueType as string)) {
    return true
  }
  return false
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
        state.value = [String(start), String(end)]
      } else {
        state.value = val
      }
    } else {
      state.value = []
    }
  } else if (isNumberValue.value) {
    // input-number default value
    state.value =
      val === null || val === void 0 || val === ''
        ? null
        : typeof val === 'string'
          ? Number(val)
          : val
  } else if (isDate(val)) {
    state.value = String(val)
  } else {
    state.value = val
  }
  valueIsReady.value = true
}

const commonProps = computed(() => {
  const { hasOptions, hasSelectEvent, props: componentProps } = getFieldComponent(props.valueType)
  return {
    ...(hasOptions
      ? {
          options: customOptions.value
        }
      : null),
    ...(hasSelectEvent
      ? {
          onSelect: handleSelect
        }
      : null),
    ...componentProps,
    placeholder: componentProps?.placeholder
      ? t(componentProps?.placeholder) + labelValue.value
      : t('plus.field.pleaseSelect') + labelValue.value,
    ...(props.valueType === 'date-picker'
      ? {
          startPlaceholder: componentProps?.startPlaceholder
            ? t(componentProps?.startPlaceholder as string)
            : '',
          endPlaceholder: componentProps?.startPlaceholder
            ? t(componentProps?.endPlaceholder as string)
            : ''
        }
      : null),
    ...customFieldProps.value
  }
})

/**
 * 获取子组件 props，兼容 element-plus@2.6.0
 */
const getChildrenProps = (item: OptionsRow) => {
  return {
    ...(props.valueType === 'select'
      ? {
          label: item.label,
          value: item.value
        }
      : versionIsLessThan260
        ? {
            label: item.value
          }
        : {
            label: item.label,
            value: item.value
          }),
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
<style lang="scss" scoped>
@import '@/components/PlusTable/styles/src/form-item.scss';
</style>
