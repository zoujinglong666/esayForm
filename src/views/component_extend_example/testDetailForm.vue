<template>
  <div style="padding: 20px">
    <h3>测试详情表单简化版本</h3>
    <p>这是一个简化的测试页面，用于排查问题</p>
    <div>
      <p>当前计数: {{ count }}</p>
      <el-button @click="count++">增加计数</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'TestDetailForm'
})

const count = ref(0)

console.log('TestDetailForm 组件已加载')
</script>
