<template>
  <div class="detail-form-example">
    <el-card class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>详情模式示例</span>
          <el-button-group>
            <el-button @click="isDetailMode = !isDetailMode">
              {{ isDetailMode ? '编辑模式' : '详情模式' }}
            </el-button>
          </el-button-group>
        </div>
      </template>

      <PlusForm
        v-model="formData"
        :columns="columns"
        :detail-mode="isDetailMode"
        label-width="120px"
        :has-footer="!isDetailMode"
      />
    </el-card>

    <el-card>
      <template #header>
        <span>当前表单数据</span>
      </template>
      <pre>{{ formData }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDetailMode = ref(true)

const formData = ref({
  name: '张三',
  age: 28,
  gender: 'male',
  tags: ['前端开发', 'Vue.js'],
  birthDate: '1995-05-15',
  email: 'zhangsan@example.com',
  status: 1,
  description: '热爱编程，专注于前端技术栈开发'
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
    label: '标签',
    prop: 'tags',
    valueType: 'select',
    fieldProps: {
      multiple: true
    },
    options: [
      { label: '前端开发', value: '前端开发' },
      { label: 'Vue.js', value: 'Vue.js' },
      { label: 'React', value: 'React' },
      { label: 'Node.js', value: 'Node.js' }
    ]
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
    label: '状态',
    prop: 'status',
    valueType: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  },
  {
    label: '描述',
    prop: 'description',
    valueType: 'input',
    fieldProps: {
      type: 'textarea',
      rows: 3
    }
  }
]
</script>

<style scoped>
.detail-form-example {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
