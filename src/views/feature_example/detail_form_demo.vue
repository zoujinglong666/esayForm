<template>
  <div class="detail-form-demo">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>PlusForm 详情模式演示</span>
          <el-switch
            v-model="isDetailMode"
            active-text="详情模式"
            inactive-text="编辑模式"
          />
        </div>
      </template>

      <!-- PlusForm 详情模式演示 -->
      <PlusForm
        v-model="formData"
        :columns="columns"
        :detail-mode="isDetailMode"
        label-width="120px"
        :has-footer="!isDetailMode"
        :rules="formRules"
      />
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <span>当前表单数据</span>
      </template>
      <pre class="json-display">{{ JSON.stringify(formData, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDetailMode = ref(true)

const formData = ref({
  // 基本信息
  name: '张三',
  age: 28,
  gender: 'male',
  email: 'zhangsan@example.com',
  phone: '13800138000',

  // 工作信息
  department: '技术部',
  position: '前端工程师',
  positionLevel: 3,
  experience: 5,

  // 技能和状态
  skills: ['Vue.js', 'TypeScript', 'React'],
  languages: ['chinese', 'english'],
  isActive: true,
  employmentType: 'fulltime',

  // 日期信息
  birthDate: '1995-05-15',
  joinDate: '2020-03-01',
  lastLogin: '2024-01-15 10:30:00',

  // 其他信息
  salary: 15000,
  workLocation: ['beijing', 'shanghai'],
  workHours: [9, 18],
  performance: 4.5,

  // 介绍
  selfIntroduction: '我是一名热爱前端开发的工程师，专注于Vue.js和React技术栈，有丰富的项目经验...'
})

const columns = [
  // 基本信息
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
    label: '邮箱',
    prop: 'email',
    valueType: 'input'
  },
  {
    label: '手机号',
    prop: 'phone',
    valueType: 'input'
  },

  // 工作信息
  {
    label: '部门',
    prop: 'department',
    valueType: 'select',
    options: [
      { label: '技术部', value: '技术部' },
      { label: '产品部', value: '产品部' },
      { label: '运营部', value: '运营部' },
      { label: '人事部', value: '人事部' },
      { label: '财务部', value: '财务部' }
    ]
  },
  {
    label: '职位',
    prop: 'position',
    valueType: 'input'
  },
  {
    label: '职级',
    prop: 'positionLevel',
    valueType: 'input-number'
  },
  {
    label: '工作经验',
    prop: 'experience',
    valueType: 'input-number',
    fieldProps: {
      min: 0,
      max: 50
    }
  },

  // 技能信息
  {
    label: '技术技能',
    prop: 'skills',
    valueType: 'select',
    fieldProps: {
      multiple: true
    },
    options: [
      { label: 'Vue.js', value: 'Vue.js' },
      { label: 'React', value: 'React' },
      { label: 'Angular', value: 'Angular' },
      { label: 'TypeScript', value: 'TypeScript' },
      { label: 'JavaScript', value: 'JavaScript' },
      { label: 'Node.js', value: 'Node.js' },
      { label: 'Python', value: 'Python' },
      { label: 'Java', value: 'Java' }
    ]
  },
  {
    label: '语言能力',
    prop: 'languages',
    valueType: 'checkbox',
    options: [
      { label: '中文', value: 'chinese' },
      { label: '英文', value: 'english' },
      { label: '日文', value: 'japanese' },
      { label: '法文', value: 'french' }
    ]
  },

  // 状态信息
  {
    label: '是否在职',
    prop: 'isActive',
    valueType: 'switch'
  },
  {
    label: '雇佣类型',
    prop: 'employmentType',
    valueType: 'select',
    options: [
      { label: '全职', value: 'fulltime' },
      { label: '兼职', value: 'parttime' },
      { label: '合同工', value: 'contract' },
      { label: '实习生', value: 'intern' }
    ]
  },

  // 日期信息
  {
    label: '出生日期',
    prop: 'birthDate',
    valueType: 'date-picker',
    fieldProps: {
      type: 'date'
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
    label: '最后登录',
    prop: 'lastLogin',
    valueType: 'input'
  },

  // 数字信息
  {
    label: '薪资',
    prop: 'salary',
    valueType: 'input-number',
    fieldProps: {
      precision: 2
    }
  },
  {
    label: '工作地点',
    prop: 'workLocation',
    valueType: 'select',
    fieldProps: {
      multiple: true
    },
    options: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
      { label: '杭州', value: 'hangzhou' }
    ]
  },
  {
    label: '工作时间',
    prop: 'workHours',
    valueType: 'slider',
    fieldProps: {
      range: true,
      min: 0,
      max: 24
    }
  },
  {
    label: '绩效评分',
    prop: 'performance',
    valueType: 'rate'
  },

  // 文本信息
  {
    label: '自我介绍',
    prop: 'selfIntroduction',
    valueType: 'input',
    fieldProps: {
      type: 'textarea',
      rows: 4
    }
  }
]

const formRules = {
  name: [{; required: true,; message: '请输入姓名',; trigger: 'blur' }],;
  email: [
    {; required: true,; message: '请输入邮箱',; trigger: 'blur' },
    {; type: 'email',; message: '请输入正确的邮箱格式',; trigger: 'blur' }
  ],;
  phone: [
    {; required: true,; message: '请输入手机号',; trigger: 'blur' },
    {; pattern: /^1[3-9]\d{9}$/,; message: '请输入正确的手机号格式',; trigger: 'blur' }
  ],;
  department: [{; required: true,; message: '请选择部门',; trigger: 'change' }]
}
</script>

<style scoped>
.detail-form-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
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

.mt-4 {
  margin-top: 16px;
}

.json-display {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* 详情模式样式 */
:deep(.plus-form-item-detail-text) {
  padding: 8px 0;
  min-height: 32px;
  display: flex;
  align-items: center;
}

:deep(.detail-empty) {
  color: #909399;
  font-style: italic;
}

/* 详情模式下隐藏表单边框和背景 */
:deep(.detail-mode .el-form-item__content) {
  background: none;
  border: none;
}
</style>
