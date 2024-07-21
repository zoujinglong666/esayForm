<script lang="ts" setup>
import { computed, onMounted, reactive, ref, unref, watch } from 'vue'
import { unionBy } from 'lodash'
import { isFunction } from '@/utils/is'
import { ResultEnum } from '@/enums/httpEnum'

const props = withDefaults (defineProps<DataSelectPropsType> (), {
  title: '',
  modelValue: '',
  placeholder: '',
  labelKey: 'label',
  valueKey: 'value',
  disabled: false,
  multiple: false,
  remote: false,
  label: '',
  maxCollapseTags: 3,
  multipleLimit: 3,
})
const emits = defineEmits (['update:modelValue', 'change', 'clear', 'update:label', 'blur', 'focus'])
const selectData = ref ([])
const copySelectData = ref ([])
const isLoading = ref<boolean> (false)
const isFirstLoaded = ref (false)
const pages = ref (0)
const selectRef = ref<any> ()
const pageState = reactive ({
  pageNo: 1,
  pageSize: 10,
})

interface DataSelectPropsType {
  title?: string
  labelKey?: string
  valueKey?: string
  queryKey?: string
  modelValue?: string | number | boolean | object | any[]
  disabled?: boolean
  multiple?: boolean
  size?: string
  placeholder?: string
  options?: any[] | string[]
  defaultOptions?: any[] | string[]
  label?: string | number
  numberToString?: boolean
  // 自定义api
  api?: (params?: {}) => Promise<any>
  params?: NonNullable<unknown>
  maxCollapseTags?: number
  multipleLimit?: number
}

const customPlaceholder = computed<string> (() => {
  if (props.placeholder)
    return props.placeholder

  return `请选择${props.title || ''}`
})

onMounted (() => {
  fetch ()
})

const valueCom = computed ({
  get() {
    return props.modelValue
  },
  set(val) {
    if (val == null)
      emits ('update:modelValue', '')

    emits ('update:modelValue', val)
  },
})

function handleSelectChange(val) {
  if (props.multiple)
    multipleChange (val)

  else
    singleChange (val)
}

async function fetch() {
  // if (copySelectData.value.length > 0) {
  //   selectData.value = copySelectData.value
  //   return
  // }

  if (props.options.length) {
    selectData.value = (props.options) || []
    copySelectData.value = selectData.value
  }
  else {
    const api = props?.api
    if (!api || !isFunction (api) || isLoading.value)
      return

    await getOptions (api)
  }
}

function multipleChange(value: any[]) {
  const list = selectData.value.reduce ((acc, cur) => {
    if ((value as any[]).includes (cur[props.valueKey]))
      acc.push (cur)

    return acc
  }, [])
  const labelStr = list.map (item => item[props.labelKey]).join ('')
  emits ('change', value, unionBy (list, props.valueKey))
  emits ('update:modelValue', value, unionBy (list, props.valueKey))
  emits ('update:label', labelStr)
}

function singleChange(value: string) {
  const findItem = selectData.value.find (item => item[props.valueKey] === value)
  const label = findItem?.[props.labelKey] ? findItem?.[props.labelKey] : ''
  emits ('change', value, findItem)
  emits ('update:modelValue', value)
  emits ('update:label', label)
}

async function getOptions(api: (params?: {}) => Promise<any>) {
  try {
    isLoading.value = true
    isFirstLoaded.value = true
    const params = {
      ...(props.params || {}),
      ...pageState,
    }
    const { data, code } = await api (params)
    if (code === ResultEnum.SUCCESS) {
      const pageData = data?.data as any[]
      pages.value = data.pages
      selectData.value = (selectData.value ?? []).concat (pageData)
      copySelectData.value = selectData.value
    }
  }
  catch (e) {
  }
  finally {
    isLoading.value = false
    isFirstLoaded.value = false
  }
}

const DEFAULT_LABEL_KEY = 'label'
const DEFAULT_VALUE_KEY = 'value'

interface OptionsItem {
  label?: string
  value?: string
  disabled?: boolean

  [name: string]: any
}

const getOptionsCom = computed (() => {
  const { labelKey = 'optionText', valueKey = 'optionValue', numberToString } = props
  const data = unref (selectData).reduce (
    (prev, next: any) => {
      if (next) {
        const value = next[valueKey ?? DEFAULT_VALUE_KEY] || ''
        const label = next[labelKey ?? DEFAULT_LABEL_KEY] || ''
        prev.push ({
          ...next,
          label,
          value: numberToString ? `${value}` : value,
        })
      }
      return prev
    },
    [] as OptionsItem[] as any[],
  )
  return data.length > 0 ? data : props.options || []
})

function emitChange(val) {
  emits ('update:modelValue', val)
  emits ('change', val)
}

function handleSelectClear() {
  emitChange ('')
}

watch (
  () => props.label,
  async (newValue) => {
    if (newValue === null)
      emits ('update:label', '')

    emits ('update:label', newValue)
  },
  {
    immediate: true,
  },
)
watch (
  () => props.modelValue,
  async (newValue) => {
    if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined)
      emits ('update:modelValue', '')

    emits ('update:modelValue', newValue)
  },
  {
    immediate: true,
  },
)

function handleBlur() {
  if (selectRef.value) {
    selectRef.value?.blur ()
    emits ('blur')
  }
}

function handleFocus() {
  if (selectRef.value) {
    selectRef.value?.focus ()
    emits ('focus')
  }
}

defineExpose ({
  blur: handleBlur (),
  focus: handleFocus (),
})
</script>

<template>
  <el-select
    v-bind="$attrs"
    ref="selectRef"
    v-model="valueCom"
    style="width: 100%;"
    :placeholder="customPlaceholder"
    :disabled="props.disabled"
    :title="props.label"

    clearable filterable collapse-tags default-first-option
    :max-collapse-tags="props.maxCollapseTags"
    :multiple-limit="props.multipleLimit"
    :popper-append-to-body="false"
    :multiple="props.multiple"
    @change="handleSelectChange"
    @clear="handleSelectClear"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <el-option
      v-for="item in getOptionsCom"
      :key="item.value"
      :disabled="item.disabled"
      :label="item.label"
      :value="item.value"
    />
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope || {}" />
    </template>
  </el-select>
</template>

