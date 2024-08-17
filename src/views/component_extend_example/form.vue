<script setup lang="ts">
import useForm from '@/components/VForm/src/hooks/useForm.ts'
import { BasicForm } from '@/components/VForm'
import {
  ElAutocomplete, ElCascader,
  ElCheckbox, ElColorPicker, ElDivider,
  ElInput,
  ElLink,
  ElRadio, ElRate,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElText,
  ElTimePicker, ElTimeSelect, ElUpload
} from "element-plus";
import InputNumber from "@/components/InputNumber/InputNumber.vue";
import DateSelect from "@/components/DatePicker/DatePicker.vue";
import DataSelect from "@/components/DataSelect/DataSelect.vue";
import TimeSelect from "@/components/TimeSelect/TimeSelect.vue";
import RadioGroup from "@/components/RadioGroup/RadioGroup.vue";
import CheckBoxGroup from "@/components/CheckBoxGroup/CheckBoxGroup.vue";
import ImageUpload from "@/components/ImageUpload/index.vue";
import DataCheckBox from "@/components/DataCheckbox/DataCheckBox.vue";
import CheckBoxButton from "@/components/CheckboxButton/CheckboxButton.vue";
import RadioButton from "@/components/RadioButton/RadioButton.vue";
import DataInput from "@/components/DataInput/DataInput.vue";
import {componentMap} from "@/components/VForm/src/componentMap.ts";

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
      modelValue: 'fileList',
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
