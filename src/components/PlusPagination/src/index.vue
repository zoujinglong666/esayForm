<template>
  <el-pagination
    layout="total, sizes, prev, pager, next, jumper"
    :background="false"
    v-model:current-page="pageInfo.page"
    v-model:page-size="pageInfo.pageSize"
    :total="total"
    :page-sizes="pageSizeList"
    v-bind="$attrs"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { DefaultPageSizeList, DefaultPageInfo } from '@/components/PlusTable/constants'

defineOptions({
  name: 'PlusPagination'
})

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  pageSizeList: {
    type: Array,
    default: () => [...DefaultPageSizeList]
  },
  modelValue: {
    type: Object,
    default: () => ({ ...DefaultPageInfo })
  }
})

const emit = defineEmits(['update:modelValue', 'size-change', 'current-change', 'change'])

const pageInfo = ref({ ...props.modelValue })

const handleEmit = () => {
  emit('update:modelValue', pageInfo.value)
  emit('change', pageInfo.value)
}

// 改变翻页组件中每页数据总数
const handleSizeChange = (pageSize: number) => {
  pageInfo.value.pageSize = pageSize
  // 改变翻页数目，必须将页面=1
  pageInfo.value.page = 1
  handleEmit()
  emit('size-change', pageSize)
}

// 跳到当前是第几页
const handleCurrentChange = (page: number) => {
  pageInfo.value.page = page
  handleEmit()
  emit('current-change', page)
}
</script>
