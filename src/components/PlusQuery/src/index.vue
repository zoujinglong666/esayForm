<template>
  <el-form
    ref="formInstance"
    :class="hasLabel ? 'no-has-label' : 'no-has-label'"
    :label-position="labelPosition"
    :label-suffix="hasLabel ? labelSuffix : ''"
    :label-width="hasLabel ? labelWidth : 0"
    :model="model"
    :rules="rules || registerRules"
    :validate-on-rule-change="false"
    class="plus-form"
    inline
    v-bind="attrs"
    @validate="handleValidate"
  >
    <slot>
      <!-- 分组表单 -->
      <template v-if="displayedSubGroup">
        <el-card
          v-for="groupItem in displayedSubGroup"
          :key="groupItem.title"
          class="plus-form__group__item"
          v-bind="groupItem.cardProps || cardProps"
        >
          <template #header>
            <div class="plus-form__group__item__header">
              <div class="plus-form__group__item__icon">
                <el-icon v-if="groupItem.icon">
                  <component :is="groupItem.icon" />
                </el-icon>
                {{ groupItem.title }}
              </div>
              <el-icon
                :class="{ collapsed: collapseState[groupItem.title] }"
                class="plus-form__group__item__toggle"
                @click.stop="collapseState[groupItem.title] = !collapseState[groupItem.title]"
              >
                <ArrowDown />
              </el-icon>
            </div>
          </template>
          <PlusFormContent
            v-show="!collapseState[groupItem.title]"
            v-model="values"
            :col-props="colProps"
            :columns="groupItem.columns"
            @change="handleChange"
          >
            <!-- 表单项 label 插槽 -->
            <template v-for="(_, key) in labelSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!-- 表单项插槽 -->
            <template v-for="(_, key) in fieldSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!-- 额外内容插槽 -->
            <template v-for="(_, key) in extraSlots" :key="key" #[key]="data">
              <slot :name="key" v-bind="data"></slot>
            </template>

            <!-- tooltip 插槽 -->
            <template v-if="$slots['tooltip-icon']" #tooltip-icon>
              <slot name="tooltip-icon"></slot>
            </template>
          </PlusFormContent>
        </el-card>
      </template>

      <!-- 普通表单 -->
      <template v-else>
        <CustomFormContent
          v-model="values"
          :col-props="colProps"
          :columns="displayedSubColumns"
          :has-label="hasLabel"
          @change="handleChange"
        >
          <!-- 表单项 label 插槽 -->
          <template v-for="(_, key) in labelSlots" :key="key" #[key]="data">
            <slot :name="key" v-bind="data"></slot>
          </template>

          <!-- 表单项插槽 -->
          <template v-for="(_, key) in fieldSlots" :key="key" #[key]="data">
            <slot :name="key" v-bind="data"></slot>
          </template>

          <!-- 额外内容插槽 -->
          <template v-for="(_, key) in extraSlots" :key="key" #[key]="data">
            <slot :name="key" v-bind="data"></slot>
          </template>

          <!-- 搜索 footer 插槽 -->
          <template v-if="$slots['search-footer']" #search-footer>
            <slot name="search-footer"></slot>
          </template>

          <!-- tooltip 插槽 -->
          <template v-if="$slots['tooltip-icon']" #tooltip-icon>
            <slot name="tooltip-icon"></slot>
          </template>
        </CustomFormContent>
      </template>
    </slot>

    <div v-if="hasFooter" :style="style" class="plus-form__footer">
      <slot name="footer" v-bind="{ handleReset, handleSubmit }">
        <el-button :loading="submitLoading" type="primary" @click="handleSubmit">
          <Icon icon="ep:search" />
          {{ submitText || t('plus.form.submitText') }}
        </el-button>
        <el-button v-if="hasReset" @click="handleReset">
          <Icon icon="ep:refresh" />
          {{ resetText || t('plus.form.resetText') }}
        </el-button>
      </slot>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  onUnmounted,
  reactive,
  ref,
  unref,
  useAttrs,
  useSlots,
  watch,
  withModifiers
} from 'vue'
import type { PropType } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElButton, ElCard, ElForm, ElIcon } from 'element-plus'
import type { FieldValues, PlusColumn } from '@/components/PlusTable/types'
import {
  filterSlots,
  getExtraSlotName,
  getFieldSlotName,
  getLabelSlotName,
  getValue,
  setValue
} from '@/components/PlusTable/utils'
import { ArrowDown } from '@element-plus/icons-vue'
import { isFunction } from '@/utils/is'
import PlusFormContent from '@/components/PlusForm/src/form-content.vue'
import CustomFormContent from '@/components/PlusQuery/src/custom-form-content.vue'
import { useI18n } from 'vue-i18n'
import type { PlusFormGroupRow } from '@/components/PlusForm/src/type'
import {
  getDefaultValueObject,
  getFinalFormData,
  getOptionsSync
} from '@/components/PlusQuery/utils'
import { useDebounceFn } from '@vueuse/core'

// ========================
// 类型扩展
// ========================
interface EnhancedPlusColumn extends PlusColumn {
  children?: EnhancedPlusColumn & { parentProp?: string }
  realKeys?: string[]
  isControlField?: boolean
}

// ========================
// Props & Emits
// ========================
const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  effectiveValue: { type: Object, default: () => ({}) }, // 有效值（去除有children的字段）
  defaultValues: { type: Object, default: () => ({}) },
  labelWidth: { type: String, default: '110px' },
  labelPosition: { type: String as PropType<'left' | 'right' | 'top'>, default: 'right' },
  rowProps: { type: Object, default: () => ({}) },
  colProps: { type: Object, default: () => ({}) },
  labelSuffix: { type: String, default: ':' },
  hasErrorTip: { type: Boolean, default: true },
  hasFooter: { type: Boolean, default: true },
  hasReset: { type: Boolean, default: true },
  hasLabel: { type: Boolean, default: true },
  autoSearch: { type: Boolean, default: false },
  autoSearchDebounce: { type: Number, default: 300 },
  submitLoading: { type: Boolean, default: false },
  submitText: { type: String, default: '查询' },
  resetText: { type: String, default: '重置' },
  footerAlign: { type: String as PropType<'left' | 'right' | 'center'>, default: 'left' },
  rules: { type: Object, default: () => ({}) },
  columns: { type: Array as PropType<PlusColumn[]>, default: () => [] },
  group: { type: [Boolean, Array] as PropType<false | PlusFormGroupRow[]>, default: false },
  cardProps: { type: Object, default: () => ({}) },
  prevent: { type: Boolean, default: false },
  itemGap: { type: String, default: '16px' },
  persistKey: { type: String, default: '' }
})

const emit = defineEmits([
  'update:modelValue',
  'update:effectiveValue',
  'submit',
  'change',
  'reset',
  'submitError',
  'validate',
  'search'
])

// ========================
// 响应式状态
// ========================
const { t } = useI18n()
const formInstance = ref<FormInstance | null>(null)
const values = ref<FieldValues>({})
const collapseState = reactive<Record<string, boolean>>({})

// ========================
// 工具函数
// ========================
const filterHide = (columns: EnhancedPlusColumn[]) => {
  return columns.filter((item) => unref(item.hideInForm) !== true)
}

const sortColumns = (columns: EnhancedPlusColumn[]) => {
  const withIndex = columns.map((col, index) => ({ col, index }))

  withIndex.sort((a, b) => {
    // 安全提取 order：必须是 number 且为有限数值
    const orderA = typeof a.col.order === 'number' && isFinite(a.col.order) ? a.col.order : null
    const orderB = typeof b.col.order === 'number' && isFinite(b.col.order) ? b.col.order : null

    // 有 order 的优先（数字越小越靠前？注意：你原逻辑是 orderB - orderA → 大的在前）
    if (orderA !== null && orderB !== null) {
      // ⚠️ 注意：你原逻辑是降序（大的 order 先出现）
      // 如果想升序（order=1 在前），应 return orderA - orderB
      return orderB - orderA // 保持你原有的“大 order 优先”逻辑
    }
    if (orderA !== null) return -1 // a 有 order，b 没有 → a 在前
    if (orderB !== null) return 1  // b 有 order，a 没有 → b 在前
    return a.index - b.index       // 都没有 → 按原始顺序
  })

  return withIndex.map(item => item.col)
}

/**
 * 增强 column 配置，自动推导 realKeys（支持新结构 fields 和旧结构 value）
 */
const processColumn = (col: PlusColumn): EnhancedPlusColumn => {
  let newCol = { ...col }

  // 自动推导 realKeys：仅当 isControlField=true 且未手动指定 realKeys
  const fieldProps = col.fieldProps as any
  if (col.isControlField === true && !col.realKeys && Array.isArray(fieldProps?.options)) {
    const autoRealKeys: string[] = []
    const rawOptions = getOptionsSync(fieldProps.options)
    for (const opt of rawOptions) {
      // 🆕 新结构：优先使用 opt.fields
      if (Array.isArray((opt as any).fields)) {
        const fields = (opt as any).fields as unknown[]
        for (const field of fields) {
          if (typeof field === 'string') {
            autoRealKeys.push(field)
          }
        }
      }
      // 🔄 兼容旧结构：opt.value 是字符串数组或字符串
      else if (Array.isArray(opt.value)) {
        for (const val of opt.value) {
          if (typeof val === 'string') {
            autoRealKeys.push(val)
          }
        }
      } else if (typeof opt.value === 'string') {
        autoRealKeys.push(opt.value)
      }
    }

    // 去重并赋值
    newCol = {
      ...newCol,
      realKeys: [...new Set(autoRealKeys)]
    }
  }

  // 注入 parentProp 到 children（用于子字段反向写入）
  if (newCol.children) {
    newCol = {
      ...newCol,
      children: {
        ...newCol.children,
        parentProp: newCol.prop
      }
    }
  }

  return newCol as EnhancedPlusColumn
}

// ========================
// 计算属性
// ========================
const model = computed(() => values.value)

const alignMap: Record<'left' | 'center' | 'right', string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
}

const style = computed(() => ({
  justifyContent: alignMap[props.footerAlign] || 'flex-end' // 默认右对齐
}))

const subColumns = computed(() => filterHide(props.columns as EnhancedPlusColumn[]))
const subGroup = computed(() => {
  if (Array.isArray(props.group)) {
    return props.group.filter((item) => unref(item.hideInGroup) !== true)
  }
  return null
})

const processedSubColumns = computed(() => {
  return sortColumns(subColumns.value.map(processColumn))
})

const processedSubGroup = computed(() => {
  if (!subGroup.value) return null
  if (Array.isArray(subGroup.value)) {
    return subGroup.value.map((group) => ({
      ...group,
      columns: sortColumns(group.columns.map(processColumn))
    }))
  }
  return subGroup.value
})

const isColumnShownInQuery = (col: EnhancedPlusColumn) => {
  const showInQuery = (col as any).showInQuery as unknown
  if (showInQuery === undefined) return true
  if (typeof showInQuery === 'boolean') return showInQuery
  if (isFunction(showInQuery)) return (showInQuery as any)(values.value) !== false
  return true
}

const displayedSubColumns = computed(() => processedSubColumns.value.filter(isColumnShownInQuery))

const displayedSubGroup = computed(() => {
  if (!processedSubGroup.value) return null
  if (Array.isArray(processedSubGroup.value)) {
    const nextGroups = processedSubGroup.value
      .map((group) => {
        const columns = filterHide(group.columns).filter(isColumnShownInQuery)
        return { ...group, columns }
      })
      .filter((group) => group.columns.length > 0)
    return nextGroups.length > 0 ? nextGroups : null
  }
  return processedSubGroup.value
})

const allProcessedColumns = computed<EnhancedPlusColumn[]>(() => {
  if (processedSubGroup.value) {
    return processedSubGroup.value.flatMap((group) => group.columns)
  }
  return processedSubColumns.value
})

const allDisplayedColumns = computed<EnhancedPlusColumn[]>(() => {
  if (displayedSubGroup.value) {
    return displayedSubGroup.value.flatMap((group) => group.columns)
  }
  return displayedSubColumns.value
})

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
const labelSlots = filterSlots(slots, getLabelSlotName())
const fieldSlots = filterSlots(slots, getFieldSlotName())
const extraSlots = filterSlots(slots, getExtraSlotName())
const emitChange = () => {
  emit('update:modelValue', values.value)
  const effectiveValues = getFinalFormData(values.value, allDisplayedColumns.value)
  emit('update:effectiveValue', effectiveValues)
}

const setValues = (newValues: Partial<FieldValues>) => {
  values.value = {
    ...values.value,
    ...newValues
  }
  emitChange()
}

const setField = (prop: string, value: unknown) => {
  setValue(values.value, prop, value)
  emitChange()
}

const getField = (prop: string) => {
  return getValue(values.value, prop)
}

const resetField = (prop: string) => {
  if (!prop) return
  formInstance.value?.clearValidate(prop as any)
  const defaultValueObj = getDefaultValueObject(allProcessedColumns.value)
  const hasPropDefault = Object.prototype.hasOwnProperty.call(props.defaultValues, prop)
  const propDefaultValue = hasPropDefault ? (props.defaultValues as any)[prop] : undefined
  const hasColumnDefault = Object.prototype.hasOwnProperty.call(defaultValueObj, prop)
  const columnDefaultValue = hasColumnDefault ? (defaultValueObj as any)[prop] : undefined

  if (hasPropDefault || hasColumnDefault) {
    setValue(values.value, prop, hasPropDefault ? propDefaultValue : columnDefaultValue)
  } else {
    setValue(values.value, prop, undefined)
  }
  emitChange()
}

const validateField = (props?: string | string[]) => {
  if (!formInstance.value) {
    return Promise.resolve(false)
  }
  const targetProps = props === undefined ? [] : props
  return new Promise<boolean>((resolve) => {
    ;(formInstance.value as any).validateField(targetProps as any, (valid: boolean) => {
      resolve(valid)
    })
  })
}
// ========================
// Watchers
// ========================

function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  const result: Record<string, any> = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const srcVal = source[key]
      const targetVal = result[key]

      if (typeof srcVal === 'object' && srcVal !== null && !Array.isArray(srcVal)) {
        if (typeof targetVal === 'object' && targetVal !== null && !Array.isArray(targetVal)) {
          result[key] = deepMerge(targetVal as Record<string, any>, srcVal as Record<string, any>)
        } else {
          result[key] = deepClone(srcVal)
        }
      } else if (Array.isArray(srcVal)) {
        result[key] = srcVal.slice()
      } else {
        result[key] = srcVal
      }
    }
  }
  return result
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj) as unknown as T
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as unknown as T
  const cloned: Record<string, any> = {}
  const source = obj as unknown as Record<string, any>
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      cloned[key] = deepClone(source[key])
    }
  }
  return cloned as unknown as T
}
watch(
  () => props.modelValue,
  (modelVal) => {
    values.value ={
      ...modelVal
    }
  },
  { immediate: true, deep: true }
)

// 初始化时应用默认值
watch(
  () => props.defaultValues,
  (defaultValues) => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      // 检查是否有任何默认值需要应用
      let hasNewDefaults = false

      for (const key in defaultValues) {
        // 如果当前值为空、undefined或null，则应用默认值
        if (
          values.value[key] === '' ||
          values.value[key] === undefined ||
          values.value[key] === null
        ) {
          values.value[key] = defaultValues[key]
          hasNewDefaults = true
        }
      }

      // 如果有新的默认值被应用，则更新modelValue
      if (hasNewDefaults) {
        emitChange()
      }
    }
  },
  { immediate: true, deep: true }
)

// 监听columns变化，自动合并字段的defaultValue到defaultValues
watch(
  () => props.columns,
  (columns) => {
    if (columns && columns.length > 0) {
      const mergedDefaults = { ...props.defaultValues }

      // 递归处理列配置，提取defaultValue
      const extractDefaultValues = (cols: any[]) => {
        cols.forEach((col) => {
          // 如果当前字段有defaultValue且defaultValues中没有该字段，则添加
          if (col.defaultValue !== undefined && mergedDefaults[col.prop] === undefined) {
            mergedDefaults[col.prop] = col.defaultValue
          }

          // 如果有子字段，也处理子字段的defaultValue
          if (
            col.children &&
            col.children.defaultValue !== undefined &&
            mergedDefaults[col.children.prop] === undefined
          ) {
            mergedDefaults[col.children.prop] = col.children.defaultValue
          }
        })
      }

      extractDefaultValues(columns)

      // 如果有新的默认值，更新values和modelValue
      if (JSON.stringify(mergedDefaults) !== JSON.stringify(props.defaultValues)) {
        // 更新values中的默认值
        for (const key in mergedDefaults) {
          if (
            values.value[key] === '' ||
            values.value[key] === undefined ||
            values.value[key] === null
          ) {
            values.value[key] = mergedDefaults[key]
          }
        }

        // 触发update:modelValue事件
        emitChange()
      }
    }
  },
  { immediate: true, deep: true }
)

// 监听subGroup变化，自动合并字段的defaultValue到defaultValues
watch(
  () => props.group,
  (groups) => {
    if (Array.isArray(groups)) {
      const mergedDefaults = { ...props.defaultValues }

      // 递归处理分组列配置，提取defaultValue
      groups.forEach((group) => {
        if (group.columns && group.columns.length > 0) {
          group.columns.forEach((col: any) => {
            // 如果当前字段有defaultValue且defaultValues中没有该字段，则添加
            if (col.defaultValue !== undefined && mergedDefaults[col.prop] === undefined) {
              mergedDefaults[col.prop] = col.defaultValue
            }

            // 如果有子字段，也处理子字段的defaultValue
            if (
              col.children &&
              col.children.defaultValue !== undefined &&
              mergedDefaults[col.children.prop] === undefined
            ) {
              mergedDefaults[col.children.prop] = col.children.defaultValue
            }
          })
        }
      })

      // 如果有新的默认值，更新values和modelValue
      if (JSON.stringify(mergedDefaults) !== JSON.stringify(props.defaultValues)) {
        // 更新values中的默认值
        for (const key in mergedDefaults) {
          if (
            values.value[key] === '' ||
            values.value[key] === undefined ||
            values.value[key] === null
          ) {
            values.value[key] = mergedDefaults[key]
          }
        }

        // 触发update:modelValue事件
        emitChange()
      }
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => props.persistKey,
  (key) => {
    if (!key) return
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      const stored = window.localStorage.getItem(key)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        values.value = parsed
        emitChange()
      }
    } catch {}
  },
  { immediate: true }
)

watch(
  () => values.value,
  (val) => {
    if (!props.persistKey) return
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      window.localStorage.setItem(props.persistKey, JSON.stringify(val || {}))
    } catch {}
  },
  { deep: true }
)

watch(
  () => subGroup.value,
  (groups) => {
    if (Array.isArray(groups)) {
      groups.forEach((group) => {
        if (!(group.title in collapseState)) {
          collapseState[group.title] = false // 默认展开
        }
      })
    }
  },
  { immediate: true }
)

const clearValidate = (props?: string | string[]) => {
  formInstance.value?.clearValidate(props as any)
}

const applyLinkage = async (column: PlusColumn) => {
  const linkage = (column as any).linkage as unknown
  if (!isFunction(linkage)) return

  const prop = column.prop
  const value = getValue(values.value, prop)

  await (linkage as any)({
    values: values.value,
    column,
    prop,
    value,
    get: (p: string) => getValue(values.value, p),
    set: (p: string, v: any) => setValue(values.value, p, v),
    clearValidate
  })
}

const autoSearchWait = computed(() => props.autoSearchDebounce)

const doAutoSearch = () => {
  const currentFormData = getFinalFormData(values.value, allDisplayedColumns.value)
  const finalValues = {
    ...currentFormData,
    // pageNo: values.value.pageNo || 1,
    // pageSize: values.value.pageSize || 10
  }
  emit('submit', finalValues)
  emit('search', finalValues)
}

const triggerAutoSearch = useDebounceFn(() => {
  if (!props.autoSearch) return
  doAutoSearch()
}, autoSearchWait)

const handleChange = async (_: FieldValues, column: PlusColumn) => {
  await applyLinkage(column)
  emitChange()
  emit('change', { ...values.value }, column)
  if (props.autoSearch && column.autoTriggerSearch) {
    triggerAutoSearch()
  }
}

const handleSubmit = () => {
  // 确保使用最新的 values
  nextTick(() => {
    emit('update:modelValue', values.value)
    doAutoSearch()
  })
}

const handleReset = (): void => {
  clearValidate()
  const defaultValueObj = getDefaultValueObject(allProcessedColumns.value)
  values.value = { ...props.defaultValues, ...defaultValueObj }
  emitChange()
  emit('reset', values.value)
}

const handleValidate = (...args: any[]): void => {
  emit('validate', ...args)
}
// 表单规则
const registerRules = ref<Record<string, any>>({})
const createFormRules = (value: PlusColumn[]) => {
  const columns =
    value?.map((item) => {
      if (item.rules && !item.required) {
        item.required = true
      }
      if (item.required && !item.rules) {
        item.rules = [{ required: true, message: `${item.label}不能为空` }]
      }
      return item
    }) || []
  registerRules.value = columns
    .filter((item) => item.rules?.length > 0)
    .reduce((acc, cur) => {
      acc[cur.prop] = cur.rules
      return acc
    }, {} as Record<string, any>)
}

watch(
  () => subColumns.value,
  (value) => {
    if (value.length) {
      createFormRules(value)
    }
  },
  { immediate: true }
)

const validate = () => {
  return formInstance.value?.validate()
}
const getEffectiveValues = computed(() => getFinalFormData(values.value, allDisplayedColumns.value))

defineExpose({
  formInstance,
  values,
  setValues,
  setField,
  getField,
  resetField,
  validateField,
  getEffectiveValues,
  clearValidate,
  validate,
  handleSubmit,
  handleReset
})

onUnmounted(() => {
  formInstance.value = null
  values.value = {}
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
  cursor: pointer;
}

.plus-form__group__item__toggle.collapsed {
  transform: rotate(-180deg);
}

// el-form 非常关键
.el-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: v-bind('itemGap');

  .el-form-item {
    margin: 0;
  }
}

// 统一 el-select 和 el-select-v2 的外观
.el-select,
.el-select-v2 {
  // 1. 基础尺寸 —— 使用 Element Plus 官方 CSS 变量
  --plus-select-height: var(--el-component-size, 32px);
  height: var(--plus-select-height);

  // 2. 内部输入框容器（关键！）
  :deep(.el-input__wrapper),
  :deep(.el-select-v2__wrapper) {
    height: var(--plus-select-height);
    line-height: var(--plus-select-height);
    padding: 0 10px; // 与 el-select 保持一致
    border-radius: var(--el-border-radius-base);
    border: var(--el-border);
    background-color: var(--el-fill-color-blank);
    transition: var(--el-transition-box-shadow), var(--el-transition-border);

    // 悬停状态
    &:hover {
      border-color: var(--el-color-primary);
    }

    // 聚焦状态
    &.is-focused,
    &:focus-within {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }

    // 禁用状态
    &.is-disabled {
      background-color: var(--el-disabled-bg-color);
      color: var(--el-text-color-disabled);
      cursor: not-allowed;

      .el-input__inner,
      .el-select-v2__input {
        cursor: not-allowed;
      }
    }
  }

  // 3. 输入区域文字对齐
  :deep(.el-input__inner),
  :deep(.el-select-v2__input) {
    height: var(--plus-select-height);
    line-height: var(--plus-select-height);
    padding: 0;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-regular);
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  // 4. 下拉图标
  :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: var(--plus-select-height);
  }

  // 5. 尺寸变体（small / large）
  &.el-select--small,
  &.el-select-v2--small {
    --plus-select-height: 24px;
    font-size: var(--el-font-size-small);
  }

  &.el-select--large,
  &.el-select-v2--large {
    --plus-select-height: 40px;
    font-size: var(--el-font-size-large);
  }
}
</style>
