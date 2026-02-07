<!--<template>-->
<!--  <div style="padding: 20px">-->
<!--    &lt;!&ndash; 🎉 DEMO: Row-Aware Column Properties &ndash;&gt;-->
<!--    &lt;!&ndash;-->
<!--      This demonstrates the new row-aware column properties feature-->
<!--      where column configurations can dynamically access row data.-->

<!--      Key Features:-->
<!--      ✅ Dynamic formProps based on row data (validation rules change)-->
<!--      ✅ Dynamic options that change based on row content-->
<!--      ✅ Dynamic fieldProps (placeholders, disabled state, shortcuts)-->
<!--      ✅ Dynamic visibility (hideInTable, hideInForm)-->
<!--      ✅ Fully TypeScript-friendly with autocomplete-->
<!--      ✅ Reactive updates when row data changes-->
<!--    &ndash;&gt;-->

<!--    <PlusTable-->
<!--      ref="plusTableRef"-->
<!--      :action-bar="{ buttons, width: 140 }"-->
<!--      :columns="tableConfig"-->
<!--      :editable="true"-->
<!--      :table-data="tableData"-->
<!--      @click-action="handleClickButton"-->
<!--      @form-change="onFormChange"-->
<!--    />-->

<!--    &lt;!&ndash; 控制按钮 &ndash;&gt;-->
<!--    <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap">-->
<!--      <el-button type="primary" @click="handleValidateAll">✅ 校验全表</el-button>-->
<!--      <el-button type="success" @click="handleValidateCurrentRow">🔍 校验第1行</el-button>-->
<!--      <el-button type="warning" @click="handleResetAll">🔄 重置全表</el-button>-->
<!--      <el-button @click="handleClearValidate">🧹 清除校验提示</el-button>-->

<!--      <el-button @click="updateAll">1️⃣ 全量更新</el-button>-->
<!--      <el-button @click="updateByIndex">2️⃣ 指定索引</el-button>-->
<!--      <el-button @click="updateByObject">3️⃣ 条件匹配</el-button>-->
<!--      <el-button @click="updateByFn">4️⃣ 函数判断</el-button>-->
<!--      <el-button type="danger" @click="updateByRowFn"> 5️⃣ 每行不同值 </el-button>-->

<!--      <el-button @click="setSingleCell">🧩 setCellValue</el-button>-->
<!--      <el-button @click="setRowByIndex">📦 setCellRow（索引）</el-button>-->
<!--      <el-button @click="setRowByObject">🎯 setCellRow（对象）</el-button>-->
<!--      <el-button @click="setRowByFn">🧠 setCellRow（函数）</el-button>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import type {-->
<!--  ButtonsCallBackParams,-->
<!--  RowChangeContext,-->
<!--  RowChangeHandler,-->
<!--  TableFormRefRow,-->
<!--  WatchRule-->
<!--} from '@/components/PlusTable'-->
<!--import { PlusTable } from '@/components/PlusTable'-->
<!--import {onMounted, ref, WatchOptions} from 'vue'-->
<!--import { ElMessage } from 'element-plus'-->
<!--import { cloneDeep, set } from 'lodash-es'-->
<!--import dayjs from 'dayjs'-->
<!--import type { PlusColumn } from '@/components/PlusTable/types'-->
<!--import usePlusTable from '@/hooks/component/usePlusTable'-->
<!--import {usePlusTableRowWatcher} from "@/hooks/component/usePlusTableRowWatcher.ts";-->

<!--// ========== 类型 ==========-->
<!--interface TableRow {-->
<!--  id: number-->
<!--  name: string-->
<!--  status: string-->
<!--  time: string-->
<!--  priority?: string-->
<!--}-->

<!--// ========== 模拟 API ==========-->
<!--const mockApi = {-->
<!--  getList: (): Promise<{ data: TableRow[] }> => {-->
<!--    return new Promise((resolve) => {-->
<!--      setTimeout(() => {-->
<!--        const data: TableRow[] = []-->

<!--        // 常见中文姓氏-->
<!--        const surnames = [-->
<!--          '张',-->
<!--          '王',-->
<!--          '李',-->
<!--          '刘',-->
<!--          '陈',-->
<!--          '杨',-->
<!--          '赵',-->
<!--          '黄',-->
<!--          '周',-->
<!--          '吴',-->
<!--          '徐',-->
<!--          '孙',-->
<!--          '胡',-->
<!--          '朱',-->
<!--          '高',-->
<!--          '林',-->
<!--          '何',-->
<!--          '郭',-->
<!--          '马',-->
<!--          '罗'-->
<!--        ]-->
<!--        // 常见单/双字名-->
<!--        const givenNames = [-->
<!--          '伟',-->
<!--          '芳',-->
<!--          '娜',-->
<!--          '敏',-->
<!--          '静',-->
<!--          '丽',-->
<!--          '强',-->
<!--          '磊',-->
<!--          '军',-->
<!--          '洋',-->
<!--          '勇',-->
<!--          '艳',-->
<!--          '杰',-->
<!--          '娟',-->
<!--          '涛',-->
<!--          '明',-->
<!--          '超',-->
<!--          '秀英',-->
<!--          '霞',-->
<!--          '平',-->
<!--          '刚',-->
<!--          '桂英',-->
<!--          '梅',-->
<!--          '鹏',-->
<!--          '琳'-->
<!--        ]-->

<!--        for (let i = 1; i <= 5; i++) {-->
<!--          // 随机姓名-->
<!--          const surname = surnames[Math.floor(Math.random() * surnames.length)]-->
<!--          const given = givenNames[Math.floor(Math.random() * givenNames.length)]-->
<!--          const name = Math.random() > 0.1 ? surname + given : '' // 10% 概率为空-->

<!--          // 随机状态-->
<!--          const status = ['0', '1', '2'][Math.floor(Math.random() * 3)]-->

<!--          // 随机日期（70% 有值，30% 为空）-->
<!--          let time = ''-->
<!--          if (Math.random() > 0.3) {-->
<!--            const randomDay = Math.floor(Math.random() * 365)-->
<!--            time = dayjs().subtract(randomDay, 'day').format('YYYY-MM-DD')-->
<!--          }-->

<!--          data.push({-->
<!--            id: i,-->
<!--            name,-->
<!--            status,-->
<!--            time-->
<!--          })-->
<!--        }-->

<!--        resolve({ data })-->
<!--      }, 300)-->
<!--    })-->
<!--  }-->
<!--}-->

<!--// ========== 表格数据 ==========-->
<!--const { tableData, buttons } = usePlusTable()-->
<!--let originalData: TableRow[] = []-->
<!--const timeDisabled=ref(true)-->
<!--// ========== 配置 ==========-->
<!--const tableConfig = ref<PlusColumn[]>([-->
<!--  {-->
<!--    label: '姓名',-->
<!--    prop: 'name',-->
<!--    width: 150,-->
<!--    // 🎉 NEW: Dynamic validation based on row data-->
<!--    formProps: (row: any, column: any, rowIndex: number) => ({-->
<!--      rules: [-->
<!--        { required: true, message: '请输入姓名', trigger: 'blur' } as any,-->
<!--        // Only require for high priority status-->
<!--        ...(row.status === '0' ? [{ min: 2, message: '紧急事项姓名不能少于2字符', trigger: 'blur' } as any] : [])-->
<!--      ]-->
<!--    })-->
<!--  },-->
<!--  {-->
<!--    label: '状态',-->
<!--    prop: 'status',-->
<!--    valueType: 'select',-->
<!--    width: 120,-->
<!--    // 🎉 NEW: Dynamic options based on row data - temporarily static for demo-->
<!--    options: [-->
<!--      { label: '未解决', value: '0' },-->
<!--      { label: '已解决', value: '1' },-->
<!--      { label: '解决中', value: '2' }-->
<!--    ],-->
<!--    formProps: (row: any, column: any, rowIndex: number) => ({-->
<!--      rules: [-->
<!--        { required: true, message: '请选择状态', trigger: 'change' } as any,-->
<!--        // Conditional validation for urgent cases-->
<!--        ...(row.name === 'admin' ? [{ validator: (rule: any, value: any) => value !== '0', message: '管理员不能有未解决状态' } as any] : [])-->
<!--      ]-->
<!--    })-->
<!--  },-->
<!--  {-->
<!--    label: '日期',-->
<!--    prop: 'time',-->
<!--    valueType: 'date-picker',-->
<!--    width: 180,-->
<!--    // 🎉 NEW: Enhanced dynamic fieldProps (static for demo)-->
<!--    fieldProps: {-->
<!--      type: 'date',-->
<!--      format: 'YYYY-MM-DD',-->
<!--      valueFormat: 'YYYY-MM-DD',-->
<!--      placeholder: '请选择日期',-->
<!--      disabled: false-->
<!--    },-->
<!--    formProps: (row: any, column: any, rowIndex: number) => ({-->
<!--      rules: [-->
<!--        { required: row.status !== '1', message: '非已解决状态必须选择日期', trigger: 'change' } as any-->
<!--      ]-->
<!--    })-->
<!--  },-->
<!--  {-->
<!--    label: '优先级',-->
<!--    prop: 'priority',-->
<!--    valueType: 'select',-->
<!--    width: 100,-->
<!--    // 🎉 NEW: Dynamic visibility and options-->
<!--    hideInTable: (row: any, column: any, rowIndex: number) => row.name === 'test',-->
<!--    hideInForm: (row: any, column: any, rowIndex: number) => row.status === '1',-->
<!--    options: [-->
<!--      { label: '📋普通', value: 'normal' },-->
<!--      { label: '⏰稍后', value: 'low' }-->
<!--    ]-->
<!--  }-->
<!--])-->

<!--buttons.value = [{ text: '编辑', code: 'edit', props: { type: 'primary' } }]-->

<!--// ========== 初始化 ==========-->
<!--onMounted(async () => {-->
<!--  const res = await mockApi.getList()-->
<!--  tableData.value = res.data.map((item) => ({ ...item }))-->
<!--  originalData = cloneDeep(res.data)-->
<!--})-->

<!--// ========== 事件处理 ==========-->


<!--const handleClickButton = (data: ButtonsCallBackParams) => {-->
<!--  if (data.buttonRow.code === 'edit') {-->
<!--    data.formRefs?.forEach((item: TableFormRefRow) => {-->
<!--      item.startCellEdit?.()-->
<!--    })-->
<!--  }-->
<!--}-->

<!--// ========== Ref ==========-->
<!--const plusTableRef = ref<InstanceType<typeof PlusTable> | null>(null)-->

<!--// ========== 方法调用 ==========-->
<!--const handleValidateAll = async () => {-->
<!--  const result = await plusTableRef.value?.validateAll()-->
<!--  if (result === true) {-->
<!--    ElMessage.success('✅ 全表校验通过！')-->
<!--  } else if (Array.isArray(result)) {-->
<!--    ElMessage.error(`❌ 有 ${result.length} 个字段校验未通过`)-->
<!--  }-->
<!--}-->

<!--const handleValidateCurrentRow = async () => {-->
<!--  const result = await plusTableRef.value?.validateRow(0) // 校验第1行（index=0）-->
<!--  if (result === true) {-->
<!--    ElMessage.success('✅ 第1行校验通过！')-->
<!--  } else if (Array.isArray(result)) {-->
<!--    ElMessage.error(`❌ 第1行有 ${result.length} 个字段校验未通过`)-->
<!--  }-->
<!--}-->

<!--const handleResetAll = () => {-->
<!--  // 1. 恢复数据-->
<!--  tableData.value = cloneDeep(originalData)-->
<!--  // 2. 重置 UI 状态-->
<!--  plusTableRef.value?.resetAll()-->
<!--  ElMessage.info('🔄 表格已重置')-->
<!--}-->

<!--const handleClearValidate = () => {-->
<!--  plusTableRef.value?.clearValidateAll()-->
<!--  ElMessage.success('🧹 校验提示已清除')-->
<!--}-->
<!--const handleUpdateDemo = () => {-->
<!--  // 把 status === '0' 的行，全部改成 '1'-->
<!--  plusTableRef.value?.updateRows((row) => row.status === '0', { status: '1' })-->

<!--  ElMessage.success('🔁 已批量把「未解决」改为「已解决」')-->
<!--}-->

<!--const updateAll = () => {-->
<!--  // 所有行 status → '1'-->
<!--  plusTableRef.value?.updateRows(undefined, {-->
<!--    status: '1'-->
<!--  })-->

<!--  ElMessage.success('✅ 全部行状态已设为「已解决」')-->
<!--}-->

<!--const updateByIndex = () => {-->
<!--  // 第 0、2、4 行改名-->
<!--  plusTableRef.value?.updateRows([0, 2, 4], {-->
<!--    name: '指定修改'-->
<!--  })-->

<!--  ElMessage.success('✏️ 指定索引行已修改')-->
<!--}-->

<!--const updateByObject = () => {-->
<!--  // status === '0' 的行 → '2'-->
<!--  plusTableRef.value?.updateRows({ status: '0' }, { status: '2' })-->

<!--  ElMessage.success('🔁 未解决 → 解决中')-->
<!--}-->

<!--const updateByFn = () => {-->
<!--  // 没选日期的行，自动补今天-->
<!--  plusTableRef.value?.updateRows((row) => !row.time, { time: dayjs().format('YYYY-MM-DD') })-->

<!--  ElMessage.success('📅 空日期已补全')-->
<!--}-->
<!--const updateByRowFn = () => {-->
<!--  plusTableRef.value?.updateRows(-->
<!--    (row) => row.status === '1',-->
<!--    (row, index) => ({-->
<!--      name: `${row.name || '用户'}-${index + 1}`-->
<!--    })-->
<!--  )-->

<!--  ElMessage.success('✨ 已按行动态更新姓名')-->
<!--}-->

<!--const setSingleCell = () => {-->
<!--  // 第 1 行 name-->
<!--  plusTableRef.value?.setCellValue(0, 'name', 'setCellValue')-->

<!--  ElMessage.success('🧩 已修改第 1 行 name')-->
<!--}-->

<!--const setRowByIndex = () => {-->
<!--  plusTableRef.value?.setCellRow(1, {-->
<!--    name: '索引更新',-->
<!--    status: '2'-->
<!--  })-->

<!--  ElMessage.success('📦 已通过索引更新整行')-->
<!--}-->

<!--const setRowByObject = () => {-->
<!--  // 找到 status === '0' 的第一行-->
<!--  plusTableRef.value?.setCellRow(-->
<!--    { status: '0' },-->
<!--    {-->
<!--      status: '1',-->
<!--      name: '对象匹配更新'-->
<!--    }-->
<!--  )-->

<!--  ElMessage.success('🎯 已通过对象条件更新行')-->
<!--}-->

<!--const setRowByFn = () => {-->
<!--  plusTableRef.value?.setCellRow((row) => !row.time, {-->
<!--    time: dayjs().format('YYYY-MM-DD')-->
<!--  })-->

<!--  ElMessage.success('🧠 已补全第一条空日期')-->
<!--}-->

<!--const {-->
<!--  watchRowChange,-->
<!--  onFormChange,-->
<!--  getRow,-->
<!--  getTableData-->
<!--} = usePlusTableRowWatcher<TableRow>(-->
<!--  plusTableRef,-->
<!--  tableData,-->
<!--  { debug: true }-->
<!--)-->


<!--watchRowChange(['status'], ({ row, index, setRow,updateRows }) => {-->
<!--  console.log('status', row, index)-->
<!--  if (row.status=='1'){-->
<!--    console.log(getTableData())-->
<!--    plusTableRef.value?.updateRows(undefined, {-->
<!--      name: '1'-->
<!--    })-->
<!--  }-->
<!--},) // 🚀 输入再快也不卡-->

<!--watchRowChange([ 'name'], ({ row, index, setRow }) => {-->

<!--  if (row.name) {-->

<!--    timeDisabled.value=false-->
<!--  }-->
<!--}, )-->
<!--watchRowChange(['name','status'], ctx => {-->
<!--  console.log('[name/age] 字段变化', ctx.prop, ctx.value, ctx.oldValue, ctx.diff)-->
<!--})-->

<!--</script>-->
<template>
  <div class="row-aware-demo">
    <h2>行感知列配置示例（PlusTable）</h2>

    <PlusTable
      @form-change="onFormChange"
      :table-data="tableData"
      :columns="columns"
      :editable="true"
    />

    <div class="debug">
      <h3>当前数据</h3>
      <pre>{{ tableData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { PlusColumn } from '@/components/PlusTable/types'
import PlusTable from "@/components/PlusTable/src/index.vue";
import {usePlusTableRowWatcher} from "@/hooks/component/usePlusTableRowWatcher.ts";

const tableData = ref([
  { id: 1, name: 'Tom',   status: '0', time: '', category: 'A' },
  { id: 2, name: 'Jerry', status: '1', time: '', category: 'B' },
  { id: 3, name: 'admin', status: '0', time: '', category: 'A' }
])

const columns = reactive<PlusColumn[]>([
  {
    label: '姓名',
    prop: 'name',
    width: 150,
    // ✅ 用 formItemProps 而不是 formProps
    formItemProps: (row, column, rowIndex) => ({
      rules: row.status === '0'
        ? [{ required: true, message: '请输入姓名', trigger: 'blur' }]
        : []
    })
  },
  {
    label: '状态',
    prop: 'status',
    width: 120,
    valueType: 'select',
    options: (row, column, rowIndex) => {
      console.log('options', row, column)
      if (row.name === 'admin') {
        return [{ label: '管理员', value: 'admin' }]
      }
      return [
        { label: '未解决', value: '0' },
        { label: '已解决', value: '1' }
      ]
    },
    fieldProps: (row, column, rowIndex) => ({
      disabled: row.name === 'Jerry'
    })
  },
  {
    label: '日期',
    prop: 'time',
    width: 180,
    valueType: 'date-picker',
    fieldProps: (row, column, rowIndex) => ({
      disabled: !row.name
    })
  },
  {
    label: '分类',
    prop: 'category',
    width: 120,
    valueType: 'select',
    // ⚠️ 这一行目前还是「按列隐藏」，不是按行隐藏
    hideInForm: false,
    options: [
      { label: 'A类', value: 'A' },
      { label: 'B类', value: 'B' }
    ]
  }
])
const plusTableRef=ref<InstanceType<typeof PlusTable> | null>(null)

const {onFormChange}=usePlusTableRowWatcher(plusTableRef,tableData)
</script>

<style scoped>
.row-aware-demo {
  padding: 20px;
}

.debug {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
