<script setup lang="ts">
import useForm from '@/components/VForm/src/hooks/useForm.ts'
import { BasicForm } from '@/components/VForm'


const schemas = ref ([
  {
    field: 'input',
    component: 'DataInput',
    label: 'input',
    required: true,
  },
  {
    field: 'select',
    component: 'DataSelect',
    label: 'Select',
    componentProps: {
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
  },
  {
    field: 'switch',
    component: 'Switch',
    label: 'Switch',
  },
  {
    field: 'radio',
    component: 'RadioGroup',
    label: 'Radio',
    componentProps: {
      options: [{
        value: '选项1',
        label: '黄金糕',
      }, {
        value: '选项2',
        label: '双皮奶',
      }, {
        value: '选项3',
        label: '蚵仔煎',
      }],
    },
  },
  {
    field: 'checkboxGroup',
    component: 'CheckBoxGroup',
    label: 'Checkbox',
    componentProps: {
      options: [{
        value: '选项1',
        label: '黄金糕',
      }, {
        value: '选项2',
        label: '双皮奶',
      }, {
        value: '选项3',
        label: '蚵仔煎',
      }],
    },
  },
  {
    field: 'rate',
    component: 'Rate',
    label: 'Rate',
  },
  {
    field: 'slider',
    component: 'Slider',
    label: 'Slider',
  },
  {
    field: 'colorInput',
    component: 'ColorPicker',
    label: 'colorInput',
  },

  {
    field: 'dataCheckbox',
    component: 'DataCheckBox',
    label: 'dataCheckbox',
    componentProps: {
      options: [{
        value: '选项1',
        label: '黄金糕',
      }, {
        value: '选项2',
        label: '双皮奶',
      }, {
        value: '选项3',
        label: '蚵仔煎',
      }],
      prop: 'label',
    },
  },
  {
    field: 'Autocomplete',
    component: 'Autocomplete',
    label: 'Autocomplete',
    componentProps: {
      options: [{
        value: '选项1',
        label: '黄金糕',
      }, {
        value: '选项2',
        label: '双皮奶',
      }, {
        value: '选项3',
        label: '蚵仔煎',
      }],
      prop: 'label',
    },
  },
  {
    field: 'InputNumber',
    component: 'InputNumber',
    label: 'InputNumber',
  },

  {
    field: 'ImageUpload',
    component: 'ImageUpload',
    label: 'ImageUpload',
    componentProps: {
    }
  },
  {
    field: 'RadioButton',
    component: 'RadioButton',
    label: 'RadioButton',
    componentProps: {
      options: [{
        value: '选项1',
        label: '黄金糕',
      }, {
        value: '选项2',
        label: '双皮奶',
      }, {
        value: '选项3',
        label: '蚵仔煎',
      }],
    },
  },
  {
    field: 'CheckBoxButton',
    component: 'CheckBoxButton',
    label: 'CheckBoxButton',
    componentProps: {
      options: ['选项1', '选项2', '选项3'],
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
  input: '',
  select: '选项1',
  timeSelect: '12:00:00',
  switch: true,
  radio: '选项1',
  checkboxGroup: ['选项1', '选项2'],
  rate: 3,
  slider: 30,
  colorInput: '#13c2c2',
  dataCheckbox: ['选项1', '选项3'],
  Autocomplete: '选项1',
  InputNumber: 10,
  ImageUpload: [],
  RadioButton: '选项1',
  CheckBoxButton: ['选项1', '选项2'],


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
