<route lang="yaml">
name: home
meta:
title: 主页
icon: ant-design:home-twotone
</route>

<script setup lang="ts">
import useForm from '@/components/VForm/src/hooks/useForm.ts'
import type { FormSchema } from '@/components/VForm'
import { BasicForm } from '@/components/VForm'

const schemas = ref<FormSchema> ([

  {
    field: 'description',
    component: 'Input',
    label: '菜品描述',
    required: true,
  },
  {
    field: 'DataSelect',
    component: 'DataSelect',
    label: 'Select',
    componentProps: {
      onChange(val, options) {
        console.log (val, 'val')
        console.log (options, 'options')
      },
      options: [{
        value: '选项1',
        label: '黄金糕',
      }, {
        value: '选项2',
        label: '双皮奶',
      }, {
        value: '选项3',
        label: '蚵仔煎',
      }, {
        value: '选项4',
        label: '龙须面',
      }, {
        value: '选项5',
        label: '北京烤鸭',
      }],
    },
  },
  {
    field: 'timeSelect',
    component: 'TimeSelect',
    label: 'TimeSelect',
    componentProps: {
      onChange(val) {
        console.log (val, 'inputVal')
      },
    },

  },

])

const { register, methods } = useForm ({
  schemas: schemas.value,
})

async function handleGetValue() {
  const fieldsValue = await methods.getFieldsValue ()
}

async function setValue() {
  await methods.setFieldsValue ({
    price: 1,
  })
}

function handleSubmit(val) {
  console.log (val, 'val')
}

const pageData = ref ({
  price: 1,
  description: '123',
  DataSelect: '',
  timeSelect: new Date (),
})
</script>

<template>
  <div>
    <PageMain>
      {{ pageData }}
      <BasicForm v-model:model="pageData" @register="register" @submit="handleSubmit" />
      <BasicTable />
    </PageMain>
  </div>
</template>

<style lang="scss" scoped>

</style>
