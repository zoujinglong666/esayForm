<template>
  <component
    :is="renderComponent"
    v-if="renderType === 'form'"
    v-model="state"
    v-bind="customFieldProps"
  />
  <component :is="renderComponent" v-else v-bind="customFieldProps" />
</template>

<script lang="ts" setup>
import { isVNode, watch, ref } from 'vue'
import type { VNode } from 'vue'
import type { PlusColumn, FieldValueType } from '@/components/PlusTable/types'
import { isString } from '@/utils/is'
export interface PlusRenderProps {
  /**
   * 渲染的类型
   */
  renderType?: 'form'
  /**
   * 回调参数的第一个值
   */
  callbackValue?: FieldValueType
  customFieldProps?: PlusColumn['fieldProps'] | PlusColumn['formItemProps']
  // eslint-disable-next-line vue/require-default-prop
  render?: PlusColumn['renderField'] | ((...arg: any[]) => void)
  params?: Partial<PlusColumn>
  // eslint-disable-next-line vue/require-default-prop
  handleChange?: (...arg: any[]) => void
}

defineOptions({
  name: 'PlusRender'
})

const props = withDefaults(defineProps<PlusRenderProps>(), {
  renderType: undefined,
  callbackValue: '',
  customFieldProps: () => ({}),
  params: () => ({})
})

const state = ref()

watch(
  () => props.callbackValue,
  (val) => {
    state.value = val
  },
  {
    flush: 'post',
    immediate: true
  }
)

/**
 * 渲染自定义
 */
const renderComponent = () => {
  if (!props.render) return

  /** params 回调第二个参数值 */
  const params = { ...props.params } as PlusColumn

  /** dynamicComponent 组件 */
  const dynamicComponent =
    props.renderType === 'form'
      ? (props.render as Exclude<PlusColumn['renderField'], undefined>)(
          state.value,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          props.handleChange!,
          params as PlusColumn
        )
      : (props.render as (...arg: any[]) => any)(state.value, params)

  /** VNode / J(T)SX  虚拟dom或者jsx */
  if (isVNode(dynamicComponent)) {
    const payload =
      props.renderType === 'form'
        ? {
            modelValue: state.value,
            ...props.customFieldProps,
            ...dynamicComponent.props
          }
        : {
            ...props.customFieldProps,
            ...dynamicComponent.props
          }

    return {
      ...dynamicComponent,
      props: payload
    } as VNode
  } else if (isString(dynamicComponent)) {
    return dynamicComponent
  }
}
</script>
