<script setup lang="ts">
import { useRuleFormItem } from '@/hooks/component/useFormItem.ts'
const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
})
const emits = defineEmits(['input'])
const emitData = ref('')
const [state] = useRuleFormItem(props, 'modelValue', 'input', emitData)
function handleChange(val) {
  if (val === undefined || val === null)
    emits('input', '')

  emits('input', val)
}
</script>

<template>
  <el-radio-group v-bind="$attrs" v-model="state" @change="handleChange">
    <el-radio-button v-for="item in props.options" :key="item.label" :label="item.label" />
  </el-radio-group>
</template>


