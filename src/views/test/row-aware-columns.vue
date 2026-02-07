<template>
  <div class="test-row-aware">
    <h2>Test Row-Aware Column Properties</h2>

    <!-- Test PlusTable -->
    <div class="section">
      <h3>PlusTable with Row-Aware Properties</h3>
      <div class="description">
        This table demonstrates dynamic column properties based on row data:
        <ul>
          <li>Name field has required validation only when status is '0'</li>
          <li>Status options are limited for admin user</li>
          <li>Date field is disabled based on name and status</li>
          <li>Category field is hidden in form for Tom</li>
        </ul>
      </div>
      <PlusTable
        :data="tableData"
        :columns="tableColumns"
        pagination
      />
    </div>

    <!-- Debug Info -->
    <div class="section">
      <h3>Current Data</h3>
      <pre>{{ tableData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { PlusColumn } from '@/components/PlusTable/types'
import PlusTable from "@/components/PlusTable/src/index.vue";

// Test data for PlusTable
const tableData = reactive([
  { id: 1, name: 'Tom', status: '0', time: '', category: 'A' },
  { id: 2, name: 'Jerry', status: '1', time: '', category: 'B' },
  { id: 3, name: 'admin', status: '0', time: '', category: 'A' }
])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: tableData.length
})

// Test columns for PlusTable with row-aware functions
const tableColumns = reactive<PlusColumn[]>([
  {
    label: '姓名',
    prop: 'name',
    width: 150,
    // Dynamic form props based on row data
    formProps: (row, column, rowIndex) => ({
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
    // Dynamic options based on row data
    options: (row, column, rowIndex) => {
      if (row.name === 'admin') {
        return [{ label: '管理员', value: '1' }]
      }
      return [
        { label: '未解决', value: '0' },
        { label: '已解决', value: '1' }
      ]
    },
    // Dynamic field props
    fieldProps: (row, column, rowIndex) => ({
      disabled: row.name === 'Jerry'
    })
  },
  {
    label: '日期',
    prop: 'time',
    width: 180,
    valueType: 'date-picker',
    // Dynamic disabled state
    fieldProps: (row, column, rowIndex) => ({
      disabled: !row.name || row.status === '0'
    })
  },
  {
    label: '分类',
    prop: 'category',
    width: 120,
    valueType: 'select',
    // Dynamic visibility
    hideInForm: (row, column, rowIndex) => row.name === 'Tom',
    options: [
      { label: 'A类', value: 'A' },
      { label: 'B类', value: 'B' }
    ]
  }
])

</script>

<style scoped>
.test-row-aware {
  padding: 20px;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.section h3 {
  margin-top: 0;
  color: #333;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
