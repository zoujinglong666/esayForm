<template>
  <el-table-column
    key="dragSort"
    :label="t('plus.table.sort')"
    width="60"
    class-name="plus-table-column-drag-sort"
    v-bind="dragSortableTableColumnProps"
  >
    <span class="plus-table-column-drag-icon">
      <slot name="drag-sort-icon">☷</slot>
    </span>
  </el-table-column>
</template>

<script lang="ts" setup>
import type { SortableEvent } from 'sortablejs'
import Sortable from 'sortablejs'
import { isPlainObject } from '@/utils/is'
import { watch, onMounted, onUnmounted } from 'vue'
import { ElTableColumn } from 'element-plus'
import {useI18n} from '@/hooks/web/useI18n'
defineOptions({
  name: 'PlusTableColumnDragSort'
})

const { t } = useI18n()

const props = defineProps({
  sortable: {
    type: [Boolean, Object],
    default: true
  },
  tableInstance: {
    type: Object,
    default: null
  },
  dragSortableTableColumnProps: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['dragSortEnd'])

let sortableInstance: Sortable | null = null

const createSortable = () => {
  const tbody = props.tableInstance?.$el?.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return

  let config: Sortable.Options = {
    handle: '.plus-table-column-drag-icon',
    animation: 150,
    group: 'box',
    easing: 'cubic-bezier(1, 0, 0, 1)',
    chosenClass: 'sortable-chosen',
    forceFallback: true,
    onEnd({ newIndex, oldIndex }: SortableEvent) {
      emit('dragSortEnd', newIndex as number, oldIndex as number)
    }
  }

  if (isPlainObject(props.sortable)) {
    config = { ...config, ...(props.sortable as Sortable.Options) }
  }

  sortableInstance = Sortable.create(tbody as HTMLElement, config)
}

const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

watch(
  () => props.tableInstance,
  (val) => {
    if (val && props.sortable) {
      destroySortable()
      createSortable()
    }
  }
)

onMounted(() => {
  if (props.tableInstance && props.sortable) {
    createSortable()
  }
})

onUnmounted(() => {
  destroySortable()
})
</script>
