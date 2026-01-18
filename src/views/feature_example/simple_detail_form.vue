<template>
  <div class="simple-detail-form">
    <!-- 切换模式按钮 -->
    <div class="mb-4">
      <el-button-group>
        <el-button
          :type="!isDetailMode ? 'primary' : 'default'"
          @click="isDetailMode = false"
        >
          编辑模式
        </el-button>
        <el-button
          :type="isDetailMode ? 'primary' : 'default'"
          @click="isDetailMode = true"
        >
          详情模式
        </el-button>
      </el-button-group>
    </div>

    <!-- PlusForm 示例 -->
    <PlusForm
      v-model="formData"
      :columns="columns"
      :detail-mode="isDetailMode"
      label-width="100px"
      :has-footer="!isDetailMode"
    />

    <!-- 当前数据展示 -->
    <el-card class="mt-4">
      <template #header>当前表单数据</template>
      <pre>{{ formData }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDetailMode = ref(false)

const formData = ref({
  name: '张三',
  age: 28,
  gender: 'male',
  department: '技术部',
  skills: ['Vue.js', 'TypeScript'],
  isActive: true,
  birthDate: '1995-05-15',
  email: 'zhangsan@example.com'
})

const columns = [
  {
    label: '姓名',
    prop: 'name',
    valueType: 'input'
  },
  {
    label: '年龄',
    prop: 'age',
    valueType: 'input-number'
  },
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
    label: '部门',
    prop: 'department',
    valueType: 'select',
    options: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '运营部', value: '运营部' }
    ]
  },
  {
    label: '技能',
    prop: 'skills',
    valueType: 'select',
    fieldProps: {
      multiple: true
    },
    options: [
      { label: 'Vue.js', value: 'Vue.js' },
      { label: 'TypeScript', value: 'TypeScript' },
      { label: 'React', value: 'React' }
    ]
  },
  {
    label: '在职状态',
    prop: 'isActive',
    valueType: 'switch'
  },
  {
    label: '出生日期',
    prop: 'birthDate',
    valueType: 'date-picker'
  },
  {
    label: '邮箱',
    prop: 'email',
    valueType: 'input'
  }
]
</script>

<style scoped>
.simple-detail-form {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
