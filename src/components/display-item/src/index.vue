<template>
  <!-- 表单第一优先级 -->
  <PlusForm
    v-if="isEdit"
    ref="formInstance"
    v-model="modelValues"
    :model="modelValues"
    :columns="columns"
    :has-footer="false"
    :has-label="false"
    v-bind="column.formProps"
    class="plus-display-item__form"
    @change="handleChange"
  >
    <!--表单单项的插槽 -->
    <template v-if="$slots[getFieldSlotName(column.prop)]" #[getFieldSlotName(column.prop)]="data">
      <slot :name="getFieldSlotName(column.prop)" v-bind="data" :row="subRow"></slot>
    </template>
    <!-- 表单el-PlusFormItem 下一行额外的内容 的插槽 -->
    <template v-if="$slots[getExtraSlotName(column.prop)]" #[getExtraSlotName(column.prop)]="data">
      <slot :name="getExtraSlotName(column.prop)" v-bind="data" :row="subRow"></slot>
    </template>
  </PlusForm>
  <!-- 自定义显示 -->
  <template v-else-if="column.render && isFunction(column.render)">
    <PlusRender
      v-if="customFieldPropsIsReady"
      :render="column.render"
      :params="renderParams"
      :callback-value="displayValue"
      :custom-field-props="customFieldProps"
    />
  </template>

  <!-- 插槽 -->
  <slot
    v-else-if="$slots[getTableCellSlotName(column.prop)]"
    :name="getTableCellSlotName(column.prop)"
    :value="displayValue"
    v-bind="renderParams"
  ></slot>

  <!--显示HTML -->
  <span
    v-else-if="column.renderHTML && isFunction(column.renderHTML)"
    class="plus-display-item"
    v-html="column.renderHTML?.(displayValue, renderParams)"
  ></span>

  <!-- 状态显示 `select`, `radio`, `checkbox`-->
  <span
    v-else-if="statusValueTypes.includes(column.valueType)"
    class="plus-display-item plus-display-item__badge"
    v-bind="customFieldProps"
  >
    <span
      v-if="getStatus.color || getStatus.type"
      :class="[
        'plus-display-item__badge__dot',
        getStatus.type && !getStatus.color ? 'plus-display-item__badge__dot--' + getStatus.type : ''
      ]"
      :style="{ backgroundColor: getStatus.color }"
    ></span>
    {{
      column.formatter && isFunction(column.formatter)
        ? column.formatter(displayValue, renderParams)
        : getStatus.label
    }}
  </span>

  <!-- 复制 -->
  <span v-else-if="column.valueType === 'copy'" class="plus-display-item">
    {{ formatterValue }}
    <el-icon
      v-if="displayValue"
      size="16"
      class="plus-display-item__icon__copy"
      v-bind="customFieldProps"
      @click="handelClickCopy(column, subRow)"
    >
      <DocumentCopy v-if="!subRow.isCopy" />
      <Select v-else />
    </el-icon>
  </span>

  <!-- 统一处理 -->
  <template v-else-if="hasDisplayComponent(column.valueType)">
    <!--has slots  -->
    <component
      :is="isTagAndNoValue ? 'span' : displayComponent.component"
      v-if="displayComponent.hasSlots"
      :class="['plus-display-item', displayComponent.class]"
      v-bind="{ ...renderParams, ...displayComponentProps }"
    >
      <template v-for="(fieldSlot, key) in column.fieldSlots" :key="key" #[key]="data">
        <component :is="fieldSlot" :value="displayValue" v-bind="{ ...renderParams, ...data }" />
      </template>

      {{ formatterValue }}
    </component>
    <!--no slots  -->
    <component
      :is="displayComponent.component"
      v-else
      :class="['plus-display-item', displayComponent.class]"
      v-bind="{ ...renderParams, ...displayComponentProps }"
    >
      {{ formatterValue }}
    </component>
  </template>

  <el-divider
    v-else-if="column.valueType === 'divider'"
    ref="fieldInstance"
    class="plus-form-item-field"
    v-bind="customFieldProps"
  >
    {{ formatterValue }}
  </el-divider>

  <!-- 没有format -->
  <span v-else class="plus-display-item" v-bind="customFieldProps">{{ formatterValue }} </span>

  <slot name="edit-icon">
    <el-icon
      v-if="hasEditIcon && !isEdit"
      :size="16"
      class="plus-display-item__edit-icon"
      pointer-events="none"
    >
      <svg
        fill="none"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        class="t-icon t-icon-edit-1"
        pointer-events="none"
      >
        <path
          fill="currentColor"
          d="M16.83 1.42l5.75 5.75L7.75 22H2v-5.75L16.83 1.42zm0 8.68l2.92-2.93-2.92-2.93-2.93 2.93 2.93 2.93zm-4.34-1.51L4 17.07V20h2.93l8.48-8.49L12.5 8.6z"
        />
      </svg>
    </el-icon>
  </slot>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { DocumentCopy, Select } from '@element-plus/icons-vue'
import {
  getCustomProps,
  getTableCellSlotName,
  getFieldSlotName,
  getExtraSlotName,
  getValue,
  setValue
} from '@/components/PlusTable/utils'
import type { PropType, Ref } from 'vue'
import { ref, watch, computed } from 'vue'
import type { PlusColumn, RecordType, FieldValues } from '@/components/PlusTable/types'
import useGetOptions from '@/hooks/component/useGetOptions'
import { PlusRender } from '@/components/PlusRender'
import { ElIcon, ElDivider } from 'element-plus'
import { hasDisplayComponent, getDisplayComponent } from './display-item'
import { isArray, isFunction, isString } from '@/utils/is'
import { PlusForm } from '@/components/PlusForm'
import { copyText } from '@/utils/copy'
export interface PlusDisplayItemProps {
  column: PlusColumn
  row: RecordType
  index?: number
  editable?: boolean | 'click' | 'dblclick'
  rest?: RecordType
}

defineOptions({
  name: 'PlusDisplayItem'
})

const props = defineProps({
  column: {
    type: Object as PropType<PlusColumn>,
    required: true
  },
  row: {
    type: Object as PropType<RecordType>,
    required: true
  },
  index: {
    type: Number as PropType<number>,
    default: 0
  },
  editable: {
    type: [Boolean, String] as PropType<boolean | 'click' | 'dblclick'>,
    default: false
  },
  rest: {
    type: Object as PropType<RecordType>,
    default: () => ({})
  }
})

const emit = defineEmits(['change'])

const customFieldProps = ref<RecordType>({})
const formInstance = ref()
const { customOptions: options } = useGetOptions(props.column)
const columns: Ref<PlusColumn[]> = ref([])
const subRow = ref(cloneDeep(props.row))
const customFieldPropsIsReady = ref(false)
const isEdit = ref(false)
const falseArray = [false, 'click', 'dblclick']
const statusValueTypes: (string | undefined)[] = ['select', 'radio', 'checkbox']

watch(
  () => props.row,
  (val) => {
    subRow.value = cloneDeep(val)
  },
  {
    deep: true
  }
)

watch(
  () => [props.editable, props.column.editable],
  () => {
    if (props.column.editable === true) {
      isEdit.value = true
      return
    }
    if (props.column.editable === false) {
      isEdit.value = false
      return
    }

    if (props.editable === true) {
      isEdit.value = true
      return
    }
    if (falseArray.includes(props.editable)) {
      isEdit.value = false
      return
    }
  },
  {
    immediate: true
  }
)

const hasEditIcon = computed(
  () =>
    (props.editable === 'click' || props.editable === 'dblclick') && props.column.editable !== false
)

/** 多层值支持，原始值 */
const displayValue = computed({
  get() {
    return getValue(subRow.value, props.column.prop)
  },
  set(value) {
    setValue(subRow.value, props.column.prop, value)
  }
})

/** 格式化后的值  */
const formatterValue = computed(() => {
  //  link 支持统一字段
  const value =
    props.column.valueType === 'link'
      ? props.column.linkText || displayValue.value
      : displayValue.value

  // 格式化，不包含状态类型和表单
  if (!statusValueTypes.includes(props.column.valueType) && !isEdit.value) {
    // formatter 第一优先
    if (props.column.formatter && isFunction(props.column.formatter)) {
      return props.column.formatter(value, renderParams.value)
    }

    // 自身的 format，日期和金钱
    if (displayComponent.value.format && isFunction(displayComponent.value.format)) {
      return displayComponent.value.format(
        value,
        customFieldProps.value.format || customFieldProps.value.valueFormat
      )
    }
  }

  return value
})

/**
 * 表单绑定值处理
 */
const modelValues = computed({
  get() {
    return { [props.column?.prop]: displayValue.value }
  },
  set(values) {
    displayValue.value = values[props.column?.prop]
  }
})

/**
 * tag 没有值的时候不渲染
 */
const isTagAndNoValue = computed(
  () =>
    props.column?.valueType === 'tag' &&
    (displayValue.value === undefined || displayValue.value === null || displayValue.value === '')
)

const renderParams = computed(() => ({
  prop: props.column?.prop,
  valueType: props.column?.valueType,
  row: subRow.value,
  index: props.index,
  rowIndex: props.index,
  fieldProps: customFieldProps.value,
  ...props.rest,
  column: { ...props.rest?.column, ...props.column }
}))

const imageUrl = computed(() => {
  const option = formatterValue.value
  if (option && isString(option)) {
    return { options: [option], url: option }
  }
  if (isArray(option)) {
    return { options: option, url: option[0] }
  }
  return { options: [], url: '' }
})

const getStatus = computed(() => {
  let option = options.value?.find((i) => i.value === displayValue.value)
  if (props.column?.customGetStatus && isFunction(props.column?.customGetStatus)) {
    option = props.column?.customGetStatus({
      options: options.value,
      value: displayValue.value,
      row: subRow.value
    })
  }
  if (!option) {
    return { label: '', value: '' }
  }
  return option
})

const displayComponent = computed(() => getDisplayComponent(props.column.valueType))

const displayComponentProps = computed<any>(() => {
  return {
    // img
    ...(props.column?.valueType === 'img'
      ? {
          fit: 'cover',
          previewTeleported: true,
          src: imageUrl.value.url,
          previewSrcList: props.column.preview !== false ? imageUrl.value.options : []
        }
      : null),
    // progress
    ...(props.column?.valueType === 'progress'
      ? {
          percentage: formatterValue.value
        }
      : null),
    // link
    ...(props.column?.valueType === 'link'
      ? {
          type: 'primary'
        }
      : null),
    // avatar
    ...(props.column?.valueType === 'avatar'
      ? {
          src: formatterValue.value
        }
      : null),
    ...customFieldProps.value
  }
})

watch(
  () => props.column,
  (val) => {
    if (val) {
      columns.value = [val as PlusColumn]
    }
  },
  {
    immediate: true,
    deep: true
  }
)

watch(
  () => props.column.fieldProps,
  async (val) => {
    const data = await getCustomProps(
      val,
      displayValue.value,
      subRow.value,
      <number>props.index,
      'fieldProps'
    )
    customFieldProps.value = data
    customFieldPropsIsReady.value = true
  },
  {
    immediate: true,
    deep: true
  }
)

watch(
  () => props.row,
  (val) => {
    subRow.value = { ...val }
  },
  {
    deep: true
  }
)

const handelClickCopy = async (item: PlusColumn, row: RecordType) => {
  await copyText(row[item.prop])
  row.isCopy = true
  setTimeout(() => {
    row.isCopy = false
  }, 3000)
}

const handleChange = (values: FieldValues) => {
  const columnProp = props.column?.prop
  emit('change', {
    value: values[columnProp],
    prop: columnProp,
    // 兼容 value 代码
    row: { value: subRow.value, ...subRow.value }
  })
}

const startCellEdit = () => {
  if (props.column?.editable === false) {
    isEdit.value = false
    return
  }
  isEdit.value = true
}

const stopCellEdit = () => {
  if (props.column?.editable === true) {
    isEdit.value = true
    return
  }
  isEdit.value = false
}

const getDisplayItemInstance = () => {
  return {
    isEdit: isEdit,
    index: props.index,
    prop: props.column?.prop,
    formInstance: computed(() => formInstance.value?.formInstance)
  }
}

defineExpose({
  startCellEdit,
  stopCellEdit,
  getDisplayItemInstance
})
</script>
