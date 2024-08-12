<template>
  <el-form
    ref="formInstance"
    :rules="rules"
    :label-width="hasLabel ? labelWidth : 0"
    class="plus-form"
    :class="hasLabel ? '' : 'no-has-label'"
    :label-position="labelPosition"
    :validate-on-rule-change="false"
    :label-suffix="hasLabel ? labelSuffix : ''"
    v-bind="attrs"
    :model="model"
    @validate="handleValidate"
  >
    <slot>
      <!-- 分组表单 -->
      <template v-if="subGroup">
        <el-card
          v-for="groupItem in subGroup"
          :key="groupItem.title"
          v-bind="groupItem.cardProps || cardProps"
          class="plus-form__group__item"
        >
          <template #header>
            <slot
              name="group-header"
              :title="groupItem.title"
              :columns="groupItem.columns"
              :icon="groupItem.icon"
            >
              <div class="plus-form__group__item__icon">
                <el-icon v-if="groupItem.icon">
                  <component :is="groupItem.icon" />
                </el-icon>
                {{ groupItem.title }}
              </div>
            </slot>
          </template>

          <PlusFormContent
            v-model="values"
            :row-props="rowProps"
            :col-props="colProps"
            :columns="filterHide(groupItem.columns)"
            @change="handleChange"
          >
            <!--表单项label插槽 -->
            <template v-for="(_, key) in labelSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!--表单项插槽 -->
            <template v-for="(_, key) in fieldSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!--el-PlusFormItem 下一行额外的内容 的插槽 -->
            <template v-for="(_, key) in extraSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!--表单tooltip插槽 -->
            <template v-if="$slots['tooltip-icon']" #tooltip-icon>
              <slot name="tooltip-icon"></slot>
            </template>
          </PlusFormContent>
        </el-card>
      </template>

      <!-- 普通表单 -->
      <template v-else>
        <PlusFormContent
          v-model="values"
          :row-props="rowProps"
          :col-props="colProps"
          :columns="subColumns"
          :has-label="hasLabel"
          @change="handleChange"
        >
          <!--表单项label插槽 -->
          <template v-for="(_, key) in labelSlots" :key="key" #[key]="data">
            <slot :name="key" v-bind="data"></slot>
          </template>

          <!--表单项插槽 -->
          <template v-for="(_, key) in fieldSlots" :key="key" #[key]="data">
            <slot :name="key" v-bind="data"></slot>
          </template>

          <!--el-PlusFormItem 下一行额外的内容 的插槽 -->
          <template v-for="(_, key) in extraSlots" :key="key" #[key]="data">
            <slot :name="key" v-bind="data"></slot>
          </template>

          <!-- 搜索的footer插槽  -->
          <template v-if="$slots['search-footer']" #search-footer>
            <slot name="search-footer"></slot>
          </template>

          <!--表单tooltip插槽 -->
          <template v-if="$slots['tooltip-icon']" #tooltip-icon>
            <slot name="tooltip-icon"></slot>
          </template>
        </PlusFormContent>
      </template>
    </slot>

    <div v-if="hasFooter" class="plus-form__footer" :style="style">
      <slot name="footer" v-bind="{ handleReset, handleSubmit }">
        <el-button v-if="hasReset" @click="handleReset">
          <!-- 重置 -->
          {{ resetText || t('plus.form.resetText') }}
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          <!-- 提交 -->
          {{ submitText || t('plus.form.submitText') }}
        </el-button>
      </slot>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, watch, computed, useSlots, unref, useAttrs, withModifiers } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElForm, ElCard, ElButton, ElIcon } from 'element-plus'
import type { PlusColumn, FieldValues, RecordType } from '@/components/PlusTable/types'
import {
  getLabelSlotName,
  getFieldSlotName,
  getExtraSlotName,
  filterSlots
} from '@/components/PlusTable/utils'
import { isArray, isPlainObject, isFunction } from '@/utils/is'
import {useI18n} from '@/hooks/web/useI18n'
import PlusFormContent from './form-content.vue'
defineOptions({
  name: 'PlusForm',
  inheritAttrs: false
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },

  defaultValues: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: String,
    default: '80px'
  },
  labelPosition: {
    type: String,
    default: 'right'
  },
  rowProps: {
    type: Object,
    default: () => ({})
  },
  colProps: {
    type: Object,
    default: () => ({})
  },
  labelSuffix: {
    type: String,
    default: ':'
  },
  hasErrorTip: {
    type: Boolean,
    default: true
  },
  hasFooter: {
    type: Boolean,
    default: true
  },
  hasReset: {
    type: Boolean,
    default: true
  },
  hasLabel: {
    type: Boolean,
    default: true
  },
  submitLoading: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: ''
  },
  resetText: {
    type: String,
    default: ''
  },
  footerAlign: {
    type: String,
    default: 'left'
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  columns: {
    type: Array,
    default: () => []
  },
  group: {
    type: [Boolean, Array],
    default: false
  },
  cardProps: {
    type: Object,
    default: () => ({})
  },
  prevent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'submit',
  'change',
  'reset',
  'submitError',
  'validate'
])

const { t } = useI18n()
const formInstance = ref<FormInstance | null>(null)
const values = ref<FieldValues>({})

const filterHide = (columns: PlusColumn[]) => {
  return columns.filter((item) => unref(item.hideInForm) !== true)
}
const model = computed(() => values.value)
const style = computed(() => ({
  justifyContent:
    props.footerAlign === 'left'
      ? 'flex-start'
      : props.footerAlign === 'center'
        ? 'center'
        : 'flex-end'
}))
const subColumns = computed(() => filterHide(props.columns))
const subGroup = computed(() =>
  isArray(props.group)
    ? props.group?.filter((item) => unref(item.hideInGroup) !== true)
    : props.group
)

const originAttrs = useAttrs()
const attrs = computed(() => ({
  ...originAttrs,
  ...(props.prevent
    ? {
        onSubmit: withModifiers(
          (...arg: any[]) => {
            if (originAttrs?.onSubmit && isFunction(originAttrs?.onSubmit)) {
              // eslint-disable-next-line @typescript-eslint/no-extra-semi
              ;(originAttrs.onSubmit as any)(...arg)
            }
          },
          ['prevent']
        )
      }
    : {})
}))

const slots = useSlots()
/**
 * 表单label的插槽
 */
const labelSlots = filterSlots(slots, getLabelSlotName())

/**
 * 表单field的插槽
 */
const fieldSlots = filterSlots(slots, getFieldSlotName())
/**
 * el-PlusFormItem 下一行额外的内容 的插槽
 */
const extraSlots = filterSlots(slots, getExtraSlotName())

watch(
  () => props.modelValue,
  (val) => {
    values.value = val
  },
  {
    immediate: true
  }
)

const handleChange = (_: FieldValues, column: PlusColumn) => {
  emit('update:modelValue', values.value)
  emit('change', values.value, column)
}

// 清空校验
const clearValidate = (): void => {
  formInstance.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    const valid = await formInstance.value?.validate()
    if (valid) {
      emit('submit', values.value)
      return true
    }
  } catch (errors: unknown) {
    if (props.hasErrorTip) {
      ElMessage.closeAll()
      const values: RecordType[] | false =
        isPlainObject(errors) && Object.values(errors as RecordType)
      const message = values ? values[0]?.[0]?.message : undefined
      ElMessage.warning(message || t('plus.form.errorTip'))
    }
    emit('submitError', errors)
  }
  return false
}

const handleReset = (): void => {
  clearValidate()
  values.value = { ...props.defaultValues }
  emit('update:modelValue', values.value)
  emit('reset', values.value)
}

const handleValidate = (...args: any[]): void => {
  emit('validate', ...args)
}

defineExpose({
  formInstance,
  handleSubmit,
  handleReset
})
</script>

