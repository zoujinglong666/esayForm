<template>
  <div class="plus-table-title-bar">
    <div class="plus-table-title-bar__title">
      <slot name="title">
        {{ titleBarConfig.title }}
      </slot>
    </div>

    <div class="plus-table-title-bar__toolbar">
      <slot name="toolbar"></slot>
      <span
        v-if="titleBarConfig?.refresh === true"
        class="plus-table-title-bar__toolbar__refresh"
        @click="handleRefresh"
      >
        <el-tooltip effect="dark" :content="'plus.table.refresh'" placement="top">
          <slot name="refresh-icon">
            <el-icon
              :size="iconSize"
              :color="iconColor"
              class="plus-table-title-bar__toolbar__icon"
            >
              <RefreshRight />
            </el-icon>
          </slot>
        </el-tooltip>
      </span>

      <!-- 表格密度 -->
      <PlusPopover
        v-if="titleBarConfig?.density !== false"
        placement="bottom"
        :width="150"
        trigger="click"
        :title="'密度'"
      >
        <div class="plus-table-title-bar__toolbar__density">
          <el-button
            v-for="item in buttonNameDensity"
            :key="item.size"
            :plain="defaultSize !== item.size"
            type="primary"
            size="small"
            @click="handleClickDensity(item.size)"
          >
            {{ unref(item.text) }}
          </el-button>
        </div>

        <template #reference>
          <el-tooltip effect="dark" :content="t('plus.table.density')" placement="top">
            <slot name="density-icon">
              <el-icon
                :size="iconSize"
                :color="iconColor"
                class="plus-table-title-bar__toolbar__icon"
              >
                <svg
                  viewBox="0 0 1024 1024"
                  focusable="false"
                  data-icon="column-height"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M840 836H184c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h656c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm0-724H184c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h656c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zM610.8 378c6 0 9.4-7 5.7-11.7L515.7 238.7a7.14 7.14 0 00-11.3 0L403.6 366.3a7.23 7.23 0 005.7 11.7H476v268h-62.8c-6 0-9.4 7-5.7 11.7l100.8 127.5c2.9 3.7 8.5 3.7 11.3 0l100.8-127.5c3.7-4.7.4-11.7-5.7-11.7H548V378h62.8z"
                  />
                </svg>
              </el-icon>
            </slot>
          </el-tooltip>
        </template>
      </PlusPopover>

      <!-- 列设置 -->
      <PlusPopover
        v-if="titleBarConfig?.columnSetting !== false"
        placement="bottom"
        :width="100"
        trigger="click"
        :title="t('plus.table.columnSettings')"
      >
        <el-checkbox
          v-model="state.checkAll"
          :indeterminate="state.isIndeterminate"
          @change="handleCheckAllChange"
        >
          {{ t('plus.table.selectAll') }}
        </el-checkbox>
        <el-checkbox-group v-model="state.checkList" @change="handleCheckGroupChange">
          <div ref="checkboxGroupInstance" class="plus-table-checkbox-sortable-list">
            <div v-for="item in columns" :key="item.prop" class="plus-table-checkbox-item">
              <div v-if="columnSetting?.dragSort !== false" class="plus-table-checkbox-handle">
                <slot name="drag-sort-icon">☷</slot>
              </div>

              <template v-if="versionIsLessThan260">
                <el-checkbox
                  :label="getTableKey(item)"
                  :disabled="item.disabledHeaderFilter"
                  class="plus-table-title-bar__toolbar__checkbox__item"
                >
                  <el-tooltip
                    v-if="getLabel(item.label).length > filterTableHeaderOverflowLabelLength"
                    :content="getLabel(item.label)"
                    placement="right-start"
                  >
                    {{ getLabelValue(item.label) }}
                  </el-tooltip>
                  <span v-else> {{ item.label ? getLabelValue(item.label) : '' }}</span>
                </el-checkbox>
              </template>
              <!-- element-plus 版本号大于等于2.6.0 -->
              <template v-else>
                <el-checkbox
                  :value="getTableKey(item)"
                  :disabled="item.disabledHeaderFilter"
                  class="plus-table-title-bar__toolbar__checkbox__item"
                >
                  <el-tooltip
                    v-if="getLabel(item.label).length > filterTableHeaderOverflowLabelLength"
                    :content="getLabel(item.label)"
                    placement="right-start"
                  >
                    {{ getLabelValue(item.label) }}
                  </el-tooltip>
                  <span v-else> {{ item.label ? getLabelValue(item.label) : '' }}</span>
                </el-checkbox>
              </template>
            </div>
          </div>
        </el-checkbox-group>
        <template #reference>
          <el-tooltip effect="dark" :content="t(`plus.table.columnSettings`)" placement="top">
            <slot name="column-settings-icon">
              <el-icon
                :size="iconSize"
                :color="iconColor"
                class="plus-table-title-bar__toolbar__icon"
              >
                <Setting />
              </el-icon>
            </slot>
          </el-tooltip>
        </template>
      </PlusPopover>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ComputedRef, PropType } from 'vue'
import { computed, onMounted, reactive, ref, unref, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import type { PlusColumn } from '@/components/PlusTable/types'
import { RefreshRight, Setting } from '@element-plus/icons-vue'
import { PlusPopover } from '@/components/PlusPopover'
import type { ComponentSize } from 'element-plus/es/constants'
import type { CheckboxValueType } from 'element-plus'
import { ElButton, ElCheckbox, ElCheckboxGroup, ElIcon, ElTooltip } from 'element-plus'
import { getLabel, getTableKey, versionIsLessThan260 } from '@/components/PlusTable/utils'
import { isPlainObject } from '@/utils/is'
import type { Options as SortableOptions, SortableEvent } from 'sortablejs'
import Sortable from 'sortablejs'
import {useI18n} from '@/hooks/web/useI18n'
import type { ColumnSetting, TitleBar } from './type'
defineOptions({
  name: 'PlusTableToolbar'
})
export interface PlusTableToolbarProps {
  columns?: PlusColumn[]
  titleBar?: boolean | Partial<TitleBar>
  filterTableHeaderOverflowLabelLength?: number
  defaultSize?: ComponentSize
  columnsIsChange?: boolean
}

export interface PlusTableToolbarEmits {
  (e: 'filterTable', columns: PlusColumn[]): void

  (e: 'clickDensity', size: ComponentSize): void

  (e: 'refresh'): void
}

export interface State {
  checkList: string[]
  checkAll: boolean
  isIndeterminate: boolean
}

export interface ButtonNameDensity {
  size: ComponentSize
  text: string | ComputedRef<string>
}
const { t } = useI18n()

const props = defineProps({
  columns: {
    type: Array as PropType<PlusColumn[]>,
    default: () => []
  },
  titleBar: {
    type: [Boolean, Object] as PropType<TitleBar>,
    default: true
  },
  filterTableHeaderOverflowLabelLength: {
    type: Number,
    default: 6
  },
  defaultSize: {
    type: String as PropType<ComponentSize>,
    default: 'default'
  },
  columnsIsChange: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['filterTable', 'clickDensity', 'refresh'])

const checkboxGroupInstance = ref<HTMLElement | null>(null)
const titleBarConfig = computed(() => props.titleBar as TitleBar)
const iconSize = computed(() => titleBarConfig.value?.icon?.size || 18)
const iconColor = computed(() => titleBarConfig.value?.icon?.color || '')
const columnSetting = computed(() => titleBarConfig.value?.columnSetting as ColumnSetting)
const sortable = ref<Sortable | null>(null)

const buttonNameDensity: ButtonNameDensity[] = [
  {
    size: 'default',
    text: computed(() => t('plus.table.default'))
  },
  {
    size: 'large',
    text: computed(() => t('plus.table.loose'))
  },
  {
    size: 'small',
    text: computed(() => t('plus.table.compact'))
  }
]

const getCheckList = (hasDisabled = false) => {
  if (hasDisabled) {
    return props.columns
      ?.filter((item) => item.disabledHeaderFilter === true)
      .map((item) => getTableKey(item))
  }
  return props.columns?.map((item) => getTableKey(item))
}

const state: State = reactive({
  checkAll: true,
  isIndeterminate: false,
  bigImageVisible: false,
  srcList: [],
  checkList: []
})

const setCheckAllState = (value: any[]) => {
  const checkedCount = value.length
  state.checkAll = checkedCount === props.columns?.length
  state.isIndeterminate = checkedCount > 0 && checkedCount < props.columns?.length
}

watch(
  () => props.columnsIsChange,
  () => {
    state.checkList = getCheckList()
    setCheckAllState(state.checkList)
  },
  {
    immediate: true
  }
)

const handleCheckAllChange = (val: CheckboxValueType) => {
  state.checkList = val ? getCheckList() : getCheckList(true)
  setCheckAllState(state.checkList)
  handleFilterTableConfirm()
}

const handleFilterTableConfirm = () => {
  const filterColumns = props.columns?.map((item) => {
    if (state.checkList.includes(getTableKey(item))) {
      return { ...item, __selfHideInTable: false }
    }

    return { ...item, __selfHideInTable: true }
  })
  emit('filterTable', filterColumns)
}

const handleCheckGroupChange = (value: CheckboxValueType[]) => {
  setCheckAllState(value)
  handleFilterTableConfirm()
}

// 密度
const handleClickDensity = (size: ComponentSize) => {
  emit('clickDensity', size)
}
// 刷新
const handleRefresh = () => {
  emit('refresh')
}

const getLabelValue = (label?: PlusColumn['label']) => {
  const tempLabel = getLabel(label)
  if (tempLabel && tempLabel?.length <= props.filterTableHeaderOverflowLabelLength) {
    return tempLabel
  }
  return tempLabel?.slice(0, props.filterTableHeaderOverflowLabelLength) + '...'
}

// checkbox列拖拽
const handleDrop = () => {
  if (!checkboxGroupInstance.value) return

  let config: SortableOptions = {
    onEnd: handleDragEnd,
    ghostClass: 'plus-table-ghost-class'
  }
  const dragSort = columnSetting.value?.dragSort
  if (isPlainObject(dragSort)) {
    config = { ...config, ...(dragSort as SortableOptions), handle: '.plus-table-checkbox-handle' }
  }
  sortable.value = new Sortable(checkboxGroupInstance.value as HTMLElement, config)
}
const handleDragEnd = (event: SortableEvent) => {
  const subDragCheckboxList = cloneDeep(props.columns)
  const draggedCheckbox = props?.columns[event.oldIndex as number]
  subDragCheckboxList.splice(event.oldIndex as number, 1)
  subDragCheckboxList.splice(event.newIndex as number, 0, draggedCheckbox)
  /**
   * FIXME:
   * filter item is undefined
   */
  const list = subDragCheckboxList.filter((item) => item)
  emit('filterTable', list)
}

onMounted(() => {
  const dragSort = columnSetting.value?.dragSort
  if (dragSort !== false) {
    if (checkboxGroupInstance.value) {
      handleDrop()
    }
  }
})
</script>
