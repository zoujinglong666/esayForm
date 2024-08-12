<template>
  <el-table-column
    key="index"
    label="#"
    fixed="left"
    type="index"
    class-name="plus-table-column-index"
    width="60"
    align="center"
    :index="getTableIndex"
    v-bind="indexTableColumnProps"
  >
    <template #default="{ row, $index }">
      <el-tooltip
        v-if="getTableIndex($index) > max"
        :content="String(getTableIndex($index))"
        placement="top-start"
      >
        <div class="plus-table-column-index__content" :style="indexContentStyle(row, $index)">
          {{ getTableIndex($index) }}
        </div>
      </el-tooltip>
      <div v-else class="plus-table-column-index__content" :style="indexContentStyle(row, $index)">
        {{ getTableIndex($index) }}
      </div>
    </template>
  </el-table-column>
</template>

<script lang="ts" setup>
import { DefaultPageInfo } from '@/components/PlusTable/constants'
import type { PageInfo, RecordType } from '@/components/PlusTable/types'
import type { CSSProperties, PropType } from 'vue'
import { isFunction, isPlainObject } from '@/utils/is'
import { ElTableColumn, ElTooltip } from 'element-plus'
import {useI18n} from '@/hooks/web/useI18n'
defineOptions({
  name: 'PlusTableTableColumnIndex'
})

const props = defineProps({
  pageInfo: {
    type: Object as PropType<PageInfo>,
    default: () => ({ ...DefaultPageInfo })
  },
  max: {
    type: Number,
    default: 999
  },
  indexContentStyle: {
    type: [Object, Function],
    default: () => ({})
  },
  indexTableColumnProps: {
    type: Object as PropType<RecordType>,
    default: () => ({})
  }
})

// 修改序号生成方法
const getTableIndex = (index: number) => {
  const i =
    ((props.pageInfo?.page || DefaultPageInfo.page) - 1) *
      (props.pageInfo?.pageSize || DefaultPageInfo.page) +
    index +
    1
  return +i
}

// index样式
const indexContentStyle = (row: RecordType, index: number): CSSProperties => {
  if (isFunction(props.indexContentStyle)) {
    return (props.indexContentStyle as (row: RecordType, index: number) => CSSProperties)(
      row,
      index
    )
  } else if (isPlainObject(props.indexContentStyle)) {
    return props.indexContentStyle as CSSProperties
  } else {
    return {}
  }
}
</script>
