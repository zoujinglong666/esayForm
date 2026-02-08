<template>


  <LoaderCircle
    :spinning="fullscreenLoading"
    size="large"
  >

    <div>

      <PlusTable
        ref="plusTableInstance"
        :columns="tableConfig"
        :table-data="tableData"
        @formChange="formChange"
      />

      <el-row class="mgt-10">
        <el-button type="primary" @click="handleAdd">新增数据</el-button>
        <el-button type="danger" @click="handleDelete">移除数据</el-button>

        <el-button class="mgb-10" @click="handleStart(0)"> 开启第一行编辑 </el-button>
        <el-button class="mgb-10" @click="handleStop(0)"> 关闭第一行编辑 </el-button>

        <el-button class="mgb-10" @click="handleStart(2)"> 开启第三行编辑 </el-button>
        <el-button class="mgb-10" @click="handleStop(2)"> 关闭第三行编辑 </el-button>

        <el-button class="mgb-10" @click="handleStart(1, 'status')"> 开启第二行第二列编辑 </el-button>
        <el-button class="mgb-10" @click="handleStop(1, 'status')"> 关闭第二行第二列编辑 </el-button>

        <el-button class="mgb-10" @click="handleMockLoading"> 模拟加载状态 </el-button>
      </el-row>
    </div>
  </LoaderCircle>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { set } from 'lodash-es'
import {PlusColumn} from "@/components/PlusTable/types";
import {PlusTableInstance, TableFormRefRow} from "@/components/PlusTable";
import usePlusTable from "@/hooks/component/usePlusTable.ts";
import PlusTable from "@/components/PlusTable/src/index.vue";

interface TableRow {
  id: number
  name: string
  status: string
  rate: number
  switch: boolean
  time: string | Date
}

const TestServe = {
  getList: async () => {
    const data = Array.from({ length: 4 }).map((item, index) => {
      return {
        id: index,
        name: index < 2 ? '' : index + 'name',
        status: String(index % 3),
        status1: String(index % 3),
        rate: index > 3 ? 2 : 3.5,
        switch: index % 2 === 0 ? true : false,
        time: index < 2 ? '' : new Date()
      }
    })
    return { data: data as TableRow[] }
  }
}
const { tableData } = usePlusTable<TableRow[]>()

const plusTableInstance = ref<PlusTableInstance | null>(null)

const tableConfig = ref<PlusColumn[]>([
  {
    label: '名称',
    prop: 'name',
    width: 120,
    formProps: {
      // 添加校验
      rules: {
        name: [
          {
            required: true,
            message: '请输入名称'
          }
        ]
      }
    }
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'data-select',
    fieldProps: {
      options: [
        {
          label: '未解决',
          value: '0',
          color: 'red'
        },
        {
          label: '已解决',
          value: '1',
          color: 'blue'
        },
        {
          label: '解决中',
          value: '2',
          color: 'yellow'
        },
        {
          label: '失败',
          value: '3',
          color: 'red'
        }
      ]
    },
    formProps: {
      // 添加校验
      rules: {
        status: [
          {
            required: true,
            trigger: 'change',
            message: '请选择状态'
          }
        ]
      }
    }
  },
   {
    label: '状态',
    prop: 'status1',
    valueType: 'select',
      options: [
        {
          label: '未解决',
          value: '0',
          color: 'red'
        },
        {
          label: '已解决',
          value: '1',
          color: 'blue'
        },
        {
          label: '解决中',
          value: '2',
          color: 'yellow'
        },
        {
          label: '失败',
          value: '3',
          color: 'red'
        }
      ],
    formProps: {
      // 添加校验
      rules: {
        status: [
          {
            required: true,
            trigger: 'change',
            message: '请选择状态'
          }
        ]
      }
    }
  },
  {
    label: '评分',
    width: 200,
    prop: 'rate',
    valueType: 'rate'
  },
  {
    label: '开关',
    width: 100,
    prop: 'switch',
    valueType: 'switch'
  },
  {
    label: '日期',
    prop: 'time',
    valueType: 'date-picker',
    minWidth: 150,
    fieldProps: {
      type: 'date',
      placeholder: '请选择日期',
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    formProps: {
      // 添加校验
      rules: {
        time: [
          {
            required: true,
            message: '请选择日期'
          }
        ]
      }
    }
  }
])

const getList = async () => {
  try {
    const { data } = await TestServe.getList()
    tableData.value = data.map(item => ({ ...item }))
  } catch (error) {}
}
getList()

const fullscreenLoading = ref(false)

const handleMockLoading = () => {
  if (fullscreenLoading.value)
    return

  fullscreenLoading.value = true
  window.setTimeout(() => {
    fullscreenLoading.value = false
  }, 2000)
}

const handleAdd = () => {
  const index = ((tableData.value.at(-1)?.id as number) || 0) + 1
  tableData.value.push({
    id: index,
    name: index < 2 ? '' : index + 'name',
    status: String(index % 3),
    rate: index > 3 ? 2 : 3.5,
    switch: index % 2 === 0,
    time: index < 2 ? '' : new Date()
  })
}

const handleDelete = () => {
  tableData.value.pop()
}

const handleStart = (index: number, prop?: string) => {
  if (plusTableInstance.value?.formRefs) {
    let cell = Reflect.get(plusTableInstance.value?.formRefs, index) as TableFormRefRow[]
    if (prop) {
      cell = cell.filter(item => item.prop === prop)
    }
    cell?.forEach(item => {
      item.startCellEdit()
    })
  }
}

const handleStop = (index: number, prop?: string) => {
  if (plusTableInstance.value?.formRefs) {
    let cell = Reflect.get(plusTableInstance.value?.formRefs, index) as TableFormRefRow[]
    if (prop) {
      cell = cell.filter(item => item.prop === prop)
    }
    cell?.forEach(item => {
      item.stopCellEdit()
    })
  }
}

const formChange = ({ value, prop, index }: { value: any; prop: string; index: number }) => {
  // 同步表单数据到表格
  set(tableData.value[index], prop, value)
  console.log(tableData.value, 'tableData.value')
}
</script>

<style lang="scss" scoped>
.mgb-10 {
  margin-bottom: 10px;
}

.mgt-10 {
  margin-top: 10px;
}
</style>
