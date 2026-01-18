<template>
  <div>
    <h3>详情模式测试</h3>
    <PlusForm :model-value="formData" :columns="columns" :detail-mode="true" />

    <h3>编辑模式测试</h3>
    <PlusForm v-model="formData" :columns="columns" :detail-mode="false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusForm } from '@/components/PlusForm'

const formData = ref({
  gender: 'male',
  status: 'active'
})

const columns = [
  {
    label: '性别',
    prop: 'gender',
    valueType: 'radio',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'radio',
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  }
]
</script>
