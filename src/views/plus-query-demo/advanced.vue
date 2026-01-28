<template>
  <div class="plus-query-advanced">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>自动查询与持久化示例</span>
          </div>
          <div class="header-right">
            <el-switch
              v-model="autoSearch"
              active-text="自动查询"
              inactive-text="手动查询"
            />
            <el-tag type="info">
              当前模式：{{ autoSearch ? '自动查询' : '手动查询' }}
            </el-tag>
            <el-tag type="warning">
              防抖间隔：{{ autoSearchDebounce }}ms
            </el-tag>
            <el-tag type="success">
              持久化 Key：{{ persistKey }}
            </el-tag>
          </div>
        </div>
      </template>

      <PlusQuery
        ref="plusQueryRef"
        v-model="queryParams"
        :columns="queryColumns"
        :default-values="defaultValues"
        label-width="100px"
        footer-align="left"
        :has-reset="true"
        :auto-search="autoSearch"
        :auto-search-debounce="autoSearchDebounce"
        :persist-key="persistKey"
        @submit="handleSubmit"
        @search="handleSearch"
      />

      <div class="result-panel">
        <div class="result-header">
          <span>最近一次提交/查询参数</span>
          <el-tag type="warning">总查询次数：{{ searchCount }}</el-tag>
        </div>
        <pre>{{ lastSearchParams }}</pre>
      </div>
    </el-card>

    <el-card class="demo-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>实例 API 演示：setField / resetField / validateField</span>
        </div>
      </template>

      <div class="api-toolbar">
        <el-button @click="fillKeyword">
          setField：设置关键词
        </el-button>
        <el-button @click="resetKeyword">
          resetField：重置关键词
        </el-button>
        <el-button type="primary" @click="validateEmail">
          validateField：校验邮箱
        </el-button>
        <el-button @click="resetEmail">
          resetField：重置邮箱
        </el-button>
      </div>

      <div class="api-state">
        <div>当前 queryParams：</div>
        <pre>{{ queryParams }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import PlusQuery from '@/components/PlusQuery/src/index.vue'
import type { PlusColumn } from '@/components/PlusTable/types'
import { ElMessage } from 'element-plus'

const plusQueryRef = ref<InstanceType<typeof PlusQuery> | null>(null)

const autoSearch = ref(true)
const persistKey = 'plus-query-advanced-demo'
const autoSearchDebounce = 500

const queryParams = ref({
  keyword: '',
  status: '',
  email: ''
})

const defaultValues = {
  keyword: '',
  status: '',
  email: ''
}

const queryColumns = shallowRef<PlusColumn[]>([
  {
    label: '关键词',
    prop: 'keyword',
    valueType: 'input',
    fieldProps: {
      clearable: true,
      placeholder: '输入关键词触发查询'
    },
    order: 2,
    autoTriggerSearch: true
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ],
    fieldProps: {
      clearable: true,
      placeholder: '选择状态'
    },
    order: 1,
    autoTriggerSearch: true
  },
  {
    label: '邮箱',
    prop: 'email',
    valueType: 'input',
    required: true,
    rules: [
      { required: true, message: '邮箱不能为空', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    fieldProps: {
      clearable: true,
      placeholder: '用于 validateField 演示'
    },
    order: 3
  }
])

const searchCount = ref(0)
const lastSearchParams = ref<Record<string, any>>({})

const handleSubmit = (formData: Record<string, any>) => {
  lastSearchParams.value = formData
  ElMessage.info('触发 submit 事件')
}

const handleSearch = (formData: Record<string, any>) => {
  searchCount.value += 1
  lastSearchParams.value = formData
  ElMessage.success(autoSearch.value ? '自动查询已执行' : '手动查询已执行')
}

const fillKeyword = () => {
  plusQueryRef.value?.setField('keyword', '自动填充关键词')
}

const resetKeyword = () => {
  plusQueryRef.value?.resetField('keyword')
}

const validateEmail = async () => {
  const ok = await plusQueryRef.value?.validateField('email')
  if (ok) {
    ElMessage.success('邮箱校验通过')
  } else {
    ElMessage.error('邮箱校验未通过，请检查表单提示')
  }
}

const resetEmail = () => {
  plusQueryRef.value?.resetField('email')
}
</script>

<style lang="scss" scoped>
.plus-query-advanced {
  padding: 20px;
  background-color: var(--el-bg-color-page);

  .demo-card {
    :deep(.el-card__header) {
      padding: 15px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
  }

  .result-panel {
    margin-top: 16px;
    padding: 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    pre {
      margin: 0;
      padding: 8px;
      background-color: var(--el-bg-color);
      border-radius: 4px;
      max-height: 240px;
      overflow: auto;
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .api-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
  }

  .api-state {
    pre {
      margin: 0;
      padding: 8px;
      background-color: var(--el-bg-color);
      border-radius: 4px;
      max-height: 260px;
      overflow: auto;
      font-size: 12px;
      line-height: 1.4;
    }
  }
}
</style>
