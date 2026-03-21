<template>
  <div>
    <!-- 切换按钮 -->
    <PageMain>
      <el-button @click="toggleMode">
        {{ detailMode ? '切换到编辑模式' : '切换到详情模式' }}
      </el-button>
      <!-- 只在编辑模式下显示校验按钮 -->
      <el-button
        v-if="!detailMode"
        type="primary"
        plain
        @click="handleValidate"
      >
        校验表单
      </el-button>
      <!-- PlusForm with 详情模式 -->
      <PlusForm
        v-if="isMounted"
        ref="plusFormRef"
        v-model="formData"
        :columns="columns"
        :detail-mode="detailMode"
        label-width="120px"
        :has-footer="!detailMode"
        :key="formKey"
      />

      <PlusQuery
        ref="plusFormRef"
        v-model="formData"
        :columns="columns"
      />
    </PageMain>
  </div>

</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import PlusForm from "@/components/PlusForm/src/index.vue"
import PlusQuery from "@/components/PlusQuery/src/index.vue"
import PageMain from "@/components/PageMain/index.vue"
import dayjs from "@/utils/dayjs.ts";

defineOptions({
  name: 'ComponentExampleExtendDetailForm'
})

const isMounted = ref(false)
const formKey = ref(Date.now())
const detailMode = ref(false)

const formData = ref({
  name: '张三',
  age: 28,
  gender: 'male',
  department: '技术部',
  position: '前端工程师',
  skills: ['Vue.js', 'TypeScript'],
  birthDate: '1995-05-15',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  status: 1,
  salary: 15000,
  joinDate: '2020-03-01',
  description: '具有5年前端开发经验，熟练掌握Vue.js、React等主流前端框架...',
})

const columns = [
  {
    label: '姓名',
    prop: 'name',
    valueType: 'input',
    formItemProps: {
      rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
    }
  },
  {
    label: '年龄',
    prop: 'age',
    valueType: 'input-number',
  },
  {
    label: '性别',
    prop: 'gender',
    valueType: 'radio',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    disabledInDetail: true
  },
  {
    label: '部门',
    prop: 'department',
    valueType: 'select',
    options: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '运营部', value: '运营部' },
      { label: '人事部', value: '人事部' }
    ]
  },
  {
    label: '职位',
    prop: 'position',
    valueType: 'input'
  },
  {
    label: '技能标签',
    prop: 'skills',
    valueType: 'data-select',
    fieldProps: {
      multiple: true , options: [
        { label: 'Vue.js', value: 'Vue.js' },
        { label: 'React', value: 'React' },
        { label: 'Angular', value: 'Angular' },
        { label: 'TypeScript', value: 'TypeScript' },
        { label: 'JavaScript', value: 'JavaScript' },
        { label: 'Node.js', value: 'Node.js' }
      ]

    },

  },
  {
    label: '出生日期',
    prop: 'birthDate',
    valueType: 'date-picker',
    fieldProps: {
      type: 'date'
    }
  },
  {
    label: '邮箱',
    prop: 'email',
    valueType: 'input'
  },
  {
    label: '手机号',
    prop: 'phone',
    valueType: 'input'
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'select',
    options: [
      { label: '在职', value: 1 },
      { label: '离职', value: 0 }
    ]
  },
  {
    label: '薪资',
    prop: 'salary',
    valueType: 'input-number',
    fieldProps: {
      precision: 2
    }
  },
  {
    label: '入职日期',
    prop: 'joinDate',
    valueType: 'date-picker',
    fieldProps: {
      type: 'date'
    }
  },
  {
    label: '个人简介',
    prop: 'description',
    valueType: 'input',
    fieldProps: {
      type: 'textarea',
      rows: 4
    }
  },
  {
    label: '时间',
    prop: 'timeProp',
    valueType: 'data-select',
    defaultValue:'createTime',
    fieldProps: {
      options: [
        { label: '创建时间', value: 'createTime' },
        { label: '出具时间', value: 'chujuTime' },

      ]
    },
    children:{
      prop: 'timePropValue',
      valueType: 'date-picker',
      defaultValue:Date.now(),
      fieldProps: {
        type: 'date'
      }
    }

  },
]
const plusFormRef = ref(null)
const handleValidate = () => {
  plusFormRef.value?.formInstance?.validate((valid: boolean) => {
    if (valid) {
      console.log('✅ 表单校验通过')
    } else {
      console.log('❌ 表单校验失败')
    }
  })
}
const toggleMode = () => {
  detailMode.value = !detailMode.value
}

// 修复：组件挂载时设置状态
onMounted(() => {
  isMounted.value = true
})

// 修复：组件卸载时清理状态，避免影响其他路由
onUnmounted(() => {
  isMounted.value = false
  detailMode.value = false
  // 重置表单数据到初始状态
  formData.value = {
    name: '张三',
    age: 28,
    gender: 'male',
    department: '技术部',
    position: '前端工程师',
    skills: ['Vue.js', 'TypeScript'],
    birthDate: '1995-05-15',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    status: 1,
    salary: 15000,
    joinDate: '2020-03-01',
    description: '具有5年前端开发经验，熟练掌握Vue.js、React等主流前端框架...'
  }
})
</script>
