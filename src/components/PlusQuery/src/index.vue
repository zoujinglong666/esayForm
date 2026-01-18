<template>
  <el-form
    ref="formInstance"
    :rules="rules || registerRules"
    :label-width="hasLabel ? labelWidth : 0"
    class="plus-form"
    inline
    :class="hasLabel ? 'no-has-label' : 'no-has-label'"
    :label-position="labelPosition"
    :validate-on-rule-change="false"
    :label-suffix="hasLabel ? labelSuffix : ''"
    v-bind="attrs"
    :model="model"
    @validate="handleValidate"
  >
    <slot>
      <!-- 普通表单 -->
        <CustomFormContent
          v-model="values"
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
        </CustomFormContent>
    </slot>

    <div v-if="hasFooter" class="plus-form__footer" :style="style">
      <slot name="footer" v-bind="{ handleReset, handleSubmit }">
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          <!-- 提交 -->
          <Icon icon="ep:search" />
          {{ submitText || t('plus.form.submitText') }}
        </el-button>
        <el-button v-if="hasReset" @click="handleReset">
          <!-- 重置 -->
          <Icon icon="ep:refresh" />
          {{ resetText || t('plus.form.resetText') }}
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
import CustomFormContent from '@/components/PlusQuery/src/custom-form-content.vue'
import {useI18n} from "@/hooks/web/useI18n.ts";
const collapseState = reactive<Record<string, boolean>>({})
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
      default: '110px'
    },
    labelPosition: {
      type: String,
      default: 'right'
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
    default: '查询'
  },
  resetText: {
    type: String,
    default: '重置'
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


const originAttrs = useAttrs()
const attrs = computed(() => ({
  ...originAttrs,
  ...(props.prevent
    ? {
      onSubmit: withModifiers(
        (...arg: any[]) => {
          if (originAttrs?.onSubmit && isFunction(originAttrs?.onSubmit)) {
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
      console.log('submit', values.value)
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

// 清空校验
const registerRules = ref({})
const createFormRules = (value: PlusColumn[]) => {
  const columns =
    value?.map((item) => {
      // 如果存在规则且没有设置为必填，则设置为必填
      if (item.rules && !item.required) {
        item.required = true
      }
      // 如果是必填但没有定义规则，则设置默认的规则
      if (item.required && !item.rules) {
        item.rules = [{ required: true, message: `${item.label}不能为空` }]
      }

      return item
    }) || [] // 确保即使 value 为 undefined 也能返回空数组
  registerRules.value = columns
    .filter((item) => item.rules?.length > 0) // 只保留有规则的列
    .reduce((acc, cur) => {
      acc[cur.prop] = cur.rules
      return acc
    }, {})
}

watch(
  () => subColumns.value,
  (value) => {
    if (value.length) {
      createFormRules(value)
    }
  },
  {
    immediate: true
  }
)
const validate = () => {
  formInstance.value?.validate()
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

onUnmounted(() => {
  formInstance.value = null
  values.value = {}
})

defineExpose({
  formInstance,
  values,
  clearValidate,
  validate,
  handleSubmit,
  handleReset
})
</script>
<style lang="scss" scoped>


.plus-form__group__item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.plus-form__group__item__toggle {
  transition: transform 0.3s ease;
}

.plus-form__group__item__toggle.collapsed {
  transform: rotate(-180deg);
}
</style>
