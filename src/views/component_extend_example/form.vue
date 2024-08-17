<script setup lang="ts">
import useForm from '@/components/VForm/src/hooks/useForm.ts'
import { BasicForm } from '@/components/VForm'

const schemas = ref ([

  {
    field: 'description',
    component: 'DataInput',
    label: '菜品描述',
    required: true,
  },
  {
    field: 'DataSelect',
    component: 'DataSelect',
    label: 'Select',
    componentProps: {
      onChange(val, options) {
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
      },
    },

  },
  {
    field: 'description1',
    component: 'Input',
    label: '菜品描述',
    required: true,
  },
  {
    field: 'DataSelect1',
    component: 'DataSelect',
    label: 'Select',
    componentProps: {
      onChange(val, options) {
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
    field: 'timeSelect1',
    component: 'TimeSelect',
    label: 'TimeSelect',
    componentProps: {
      onChange(val) {
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
  price: 0,
  description: '',
  DataSelect: '',
  timeSelect: new Date (),
  description1: '',
  DataSelect1: '',
  timeSelect1: new Date (),
})

function handleFieldValueChange(key,value) {
  console.log (key, 'fieldValueChange')
  console.log (value, 'value')
}
</script>

<template>
  <div>
    <PageMain>
      {{ pageData }}
      <BasicForm v-model:model="pageData" @register="register" @submit="handleSubmit" @field-value-change="handleFieldValueChange" />
    </PageMain>
  </div>
</template>

<style lang="scss" scoped>

</style>
