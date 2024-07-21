<script lang="ts" setup>
import type { Ref } from 'vue'
import { computed, nextTick, onMounted, reactive, ref, unref, useAttrs, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'
import type { FormActionType, FormProps, FormSchemaInner as FormSchema } from './types/form'
import type { AdvanceState } from './types/hooks'
import FormItem from './components/FormItem.vue'
import type FormAction from './components/FormAction.vue'

import { dateItemType, isIncludeSimpleComponents } from './helper'
import { useFormValues } from './hooks/useFormValues'
import useAdvanced from './hooks/useAdvanced'

import { useFormEvents } from './hooks/useFormEvents'
import { createFormContext, useFormContext } from './hooks/useFormContext'
import { useAutoFocus } from './hooks/useAutoFocus'
import { basicProps } from './props'
import { useModalContext } from '@/components/Modal'
import { deepMerge } from '@/utils'
import { dateUtil } from '@/utils/dateUtil'
import { useDesign } from '@/hooks/web/useDesign'
import { labelWidthAutoMap, responsiveMap } from '@/components/VForm/src/constant'

defineOptions ({ name: 'BasicForm' })

const props = defineProps (basicProps)
const emit = defineEmits ([
  'advanced-change',
  'reset',
  'submit',
  'register',
  'field-value-change',
  'update:model',
])

const isFold = ref (true)
const attrs = useAttrs ()
const formModel = reactive ({})
const modalFn = useModalContext ()

const advanceState = reactive<AdvanceState> ({
  isAdvanced: true,
  hideAdvanceBtn: false,
  isLoad: false,
  actionSpan: 6,
})
const cols = { xs: 24, sm: 12, md: 12, lg: 8, xl: 6, xxl: 6 }
// const allSlotsName = computed(() => Object.keys(toRaw(slots)))
const colArr = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
const { resetAction, submitAction } = useFormContext ()

function handleReset() {
}

// 用来保存当前页面尺寸处于哪个尺寸区间
const screens = reactive ({
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  xxl: true,
})
const defaultValueRef = ref ({})
const isInitedDefaultRef = ref (false)
const propsRef = ref<Partial<FormProps>> ()
const schemaRef = ref<FormSchema[] | null> (null)
const formElRef = ref<FormActionType | null> (null)
const { prefixCls } = useDesign ('basic-form')
// Get the basic configuration of the form
const getProps = computed (() => {
  return { ...props, ...unref (propsRef) } as FormProps
})

const getFormClass = computed (() => {
  return [
    prefixCls,
    {
      [`${prefixCls}--compact`]: unref (getProps).compact,
    },
  ]
})

const showFormItem = computed<boolean> ((index) => {
  return function (index: number) {
    if (isFold.value)
      return true

    if (index > props?.onlyDisplayFormCount)
      return isFold.value

    else
      return !isFold.value
  }
})

// Get uniform row style and Row configuration for the entire form
const getRow = computed (() => {
  const { baseRowStyle = {}, rowProps } = unref (getProps)
  return {
    style: baseRowStyle,
    ...rowProps,
  }
})

const getBindValue = computed (() => ({ ...attrs, ...props, ...unref (getProps) }) as AntFormProps)

const getSchema = computed ((): FormSchema[] => {
  const schemas: FormSchema[] = unref (schemaRef) || (unref (getProps).schemas as any)
  const newSchemas = schemas.filter (item => item.show !== false)
  const res = {}
  for (const item of schemas) {
    const field = item.field
    res[field] = item.defaultValue ?? ''
  }
  const filteredSchemas = newSchemas.filter ((schema) => {
    const item = {
      field: schema.field,
      values: res,
      schema,
    }
    // 使用ifShow函数判断是否显示当前项
    return schema.ifShow ? schema.ifShow (item) : true
  })

  for (const schema of filteredSchemas) {
    const {
      defaultValue,
      component,
      componentProps = {},
      isHandleDateDefaultValue = true,
    } = schema
    // handle date type
    if (
      isHandleDateDefaultValue
      && defaultValue
      && component
      && dateItemType.includes (component)
    ) {
      const opt = {
        schema,
        tableAction: props.tableAction ?? ({} as TableActionType),
        formModel,
        formActionType: {} as FormActionType,
      }
      const valueFormat = componentProps
        ? typeof componentProps === 'function'
          ? componentProps (opt).valueFormat
          : componentProps.valueFormat
        : null
      if (!Array.isArray (defaultValue)) {
        schema.defaultValue = valueFormat
          ? dateUtil (defaultValue).format (valueFormat)
          : dateUtil (defaultValue)
      }
      else {
        const def: any[] = []
        defaultValue.forEach ((item) => {
          def.push (valueFormat ? dateUtil (item).format (valueFormat) : dateUtil (item))
        })
        schema.defaultValue = def
      }
    }
  }
  if (unref (getProps).showAdvancedButton) {
    return cloneDeep (
      filteredSchemas.filter (schema => !isIncludeSimpleComponents (schema.component)) as FormSchema[],
    )
  }
  else {
    return cloneDeep (filteredSchemas as FormSchema[])
  }
})

const { handleToggleAdvanced, fieldsIsAdvancedMap } = useAdvanced ({
  advanceState,
  emit,
  getProps,
  getSchema,
  formModel,
  defaultValueRef,
})

const { handleFormValues, initDefault } = useFormValues ({
  getProps,
  defaultValueRef,
  getSchema,
  formModel,
})

useAutoFocus ({
  getSchema,
  getProps,
  isInitedDefault: isInitedDefaultRef,
  formElRef: formElRef as Ref<FormActionType>,
})
const labelWidthCalc = computed (() => {
  const { labelWidth } = unref (getProps)
  if (labelPositionCalc.value === 'top') {
    return 'auto'
  }
  else {
    if (labelWidth)
      return labelWidth

    return labelWidthAutoMap[currentBreakpoint.value] as string
  }
})

const labelPositionCalc = computed (() => {
  if (currentBreakpoint.value === 'xs')
    return 'top'

  return 'right'
})
const {
  handleSubmit,
  setFieldsValue,
  clearValidate,
  validate,
  validateFields,
  getFieldsValue,
  updateSchema,
  resetSchema,
  appendSchemaByField,
  removeSchemaByField,
  resetFields,
  scrollToField,
} = useFormEvents ({
  emit,
  getProps,
  formModel,
  getSchema,
  defaultValueRef,
  formElRef: formElRef as Ref<FormActionType>,
  schemaRef: schemaRef as Ref<FormSchema[]>,
  handleFormValues,
})

createFormContext ({
  resetAction: resetFields,
  submitAction: handleSubmit,
})

watch (
  () => unref (getProps).model,
  () => {
    const { model } = unref (getProps)
    if (!model)
      return

    setFieldsValue (model)
  },
  {
    immediate: true,
    deep: true,
  },
)

watch (
  () => props.schemas,
  (schemas) => {
    resetSchema (schemas ?? [])
  },
)

watch (
  () => getSchema.value,
  (schema) => {
    nextTick (() => {
      //  Solve the problem of modal adaptive height calculation when the form is placed in the modal
      modalFn?.redoModalHeight?. ()
    })
    if (unref (isInitedDefaultRef))
      return

    if (schema?.length) {
      initDefault ()
      isInitedDefaultRef.value = true
    }
  },
)

watch(
  () => formModel,
  useDebounceFn(() => {
    unref(getProps).submitOnChange && handleSubmit()
    emit('update:model', formModel)
  }, 0),
  { deep: true },
)

async function setProps(formProps: Partial<FormProps>): Promise<void> {
  propsRef.value = deepMerge (unref (propsRef) || {}, formProps)
}

function setFormModel(key: string, value: any, schema: FormSchema) {
  formModel[key] = value
  emit('field-value-change', key, value)
  // const { model } = unref(getProps)
  // model[key as string] = value
  // TODO 优化验证，这里如果是autoLink=false手动关联的情况下才会再次触发此函数
  if (schema && schema.itemProps && !schema.itemProps.autoLink)
    validateFields([key]).catch((_) => {})
}

function handleEnterPress(e: KeyboardEvent) {
  const { autoSubmitOnEnter } = unref (getProps)
  if (!autoSubmitOnEnter)
    return

  if (e.key === 'Enter' && e.target && e.target instanceof HTMLElement) {
    const target: HTMLElement = e.target as HTMLElement
    if (target && target.tagName && target.tagName.toUpperCase () == 'INPUT')
      handleSubmit ()
  }
}

const formActionType = {
  getFieldsValue,
  setFieldsValue,
  resetFields,
  updateSchema,
  resetSchema,
  setProps,
  removeSchemaByField,
  appendSchemaByField,
  clearValidate,
  validateFields,
  validate,
  submit: handleSubmit,
  scrollToField,
}

const getFormActionBindProps = computed (
  () => ({ ...getProps.value, ...advanceState }) as InstanceType<typeof FormAction>['$props'],
)

defineExpose ({
  ...formActionType,
})

const currentBreakpoint = ref ('')
// 计算当前页面尺寸下一行中可以有几个元素
const resultCol = computed (() => {
  let res = 1
  for (let i = 0; i < colArr.length; i++) {
    const breakpoint = colArr[i]
    currentBreakpoint.value = breakpoint
    if (screens[breakpoint] || breakpoint === 'xs') {
      res = cols[breakpoint]
      break
    }
  }
  return res
})
const spanItem = computed (() => {
  return function (item: any) {
    if (item?.colProp?.span)
      return item.colProp.span

    return resultCol.value
  }
})

const matchHandlers = {}
onMounted (() => {
  Object.keys (responsiveMap).forEach ((screen) => {
    const matchMediaQuery = responsiveMap[screen]
    if (!matchMediaQuery)
      return

    const listener = ({ matches }) => {
      screens[screen] = matches
    }
    const mql = window.matchMedia (matchMediaQuery)
    if (mql.addEventListener)
      mql.addEventListener ('change', listener)

    else
      mql.addListener (listener)

    matchHandlers[matchMediaQuery] = {
      mql,
      listener,
    }
    listener (mql)
  })
})
onUnmounted (() => {
  // 移除监听器
  Object.keys (responsiveMap).forEach ((screen) => {
    const matchMediaQuery = responsiveMap[screen]
    if (!matchMediaQuery)
      return

    const handler = matchHandlers[matchMediaQuery]
    if (handler && handler.mql && handler.listener) {
      if (handler.mql.removeEventListener)
        handler.mql.removeEventListener ('change', handler.listener)

      else
        handler.mql.removeListener (handler.listener)
    }
  })
})
onMounted (() => {
  initDefault ()
  emit ('register', formActionType)
})
</script>

<template>
  <SearchBar :fold="isFold" :show-toggle="false">
    <el-form
      v-bind="getBindValue"
      ref="formElRef"
      :class="getFormClass"
      :model="formModel"
      label-suffix=":"
      :label-width="labelWidthCalc"
      :label-position="labelPositionCalc"
      @keypress.enter="handleEnterPress"
    >
      <el-row v-bind="getRow" :gutter="16" style="width: 100%;">
        <slot name="formHeader" />
        <el-col
          v-for="(schema, index) in getSchema" v-show="showFormItem(index)" :key="schema.field"
          style="width: 100%;" :span="spanItem(schema)"
        >
          <FormItem
            style="flex: 1;width: 100%;"
            :is-advanced="fieldsIsAdvancedMap[schema.field]"
            :table-action="tableAction"
            :form-action-type="formActionType"
            :schema="schema"
            :form-props="getProps"
            :all-default-values="defaultValueRef"
            :form-model="formModel"
            :set-form-model="setFormModel"
          >
            <template v-for="item in Object.keys($slots)" #[item]="data">
              <slot :name="item" v-bind="data || {}" />
            </template>
          </FormItem>
        </el-col>

        <ElFormItem label-width="auto" style="white-space: nowrap;">
          <div style="white-space: nowrap;">
            <ElButton type="primary" @click="submitAction">
              筛选
            </ElButton>
            <el-button plain @click="handleReset">
              重置
            </el-button>
            <ElButton link @click="isFold = !isFold">
              <template #icon>
                <SvgIcon :name="!isFold ? 'ep:caret-bottom' : 'ep:caret-top' " />
              </template>
              {{ !isFold ? '展开' : '收起' }}
            </ElButton>
          </div>
        </ElFormItem>

        <!--          <FormAction v-bind="getFormActionBindProps" @toggle-advanced="handleToggleAdvanced"> -->
        <!--            <template -->
        <!--              #[item]="data" -->
        <!--              v-for="item in ['resetBefore', 'submitBefore', 'advanceBefore', 'advanceAfter']" -->
        <!--            > -->
        <!--              <slot :name="item" v-bind="data || {}"></slot> -->
        <!--            </template> -->
        <!--          </FormAction> -->
        <slot name="formFooter" />
      </el-row>
    </el-form>
  </SearchBar>
</template>

<style lang="scss">
.filter-button {
  position: fixed; /* 使用fixed属性使按钮相对于浏览器窗口固定 */
  top: 50%; /* 可以调整top属性以使按钮垂直居中 */
  right: 0; /* 将按钮定位到右侧 */
  transform: translateY(-50%); /* 通过transform属性垂直居中 */
}
</style>
