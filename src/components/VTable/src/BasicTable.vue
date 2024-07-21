<script setup lang="ts">
import { onMounted } from 'vue'
import TableTitleBar from '@/components/VTable/components/TableTitleBar.vue'

interface BasicTablePropsType {
  title?: string
  tableData?: any[] | string[]
  // 自定义api
  api?: (params?: {}) => Promise<any>
  params?: NonNullable<unknown>
}
const props = withDefaults (defineProps<BasicTablePropsType> (), {
  title: '',

})
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]

const data = ref([])

function fetchData() {

}

onMounted(() => {
  // if(props.api){
  //   fetchData()
  //   return
  // }
  // if(props.tableData.length>0&&Array.isArray(props.tableData)){
  //   data.value=props.tableData;
  //   return;
  // }
})
</script>

<template>
  <div>
    <TableTitleBar />
    <el-table :data="data" border style="width: 100%;">
      <el-table-column prop="date" label="Date" width="180" />
      <el-table-column prop="name" label="Name" width="180" />
      <el-table-column prop="address" label="Address" />
    </el-table>
  </div>
</template>

<style scoped lang="scss">

</style>
