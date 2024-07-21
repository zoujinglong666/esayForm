<script setup lang="ts">
import { ref } from 'vue'
import { useRuleFormItem } from '@/hooks/component/useFormItem.ts'

const props = withDefaults(defineProps<InputNumberPropsType>(), {
  modelValue: undefined,
})
const emits = defineEmits(['input'])
const emitData = ref('')

interface InputNumberPropsType {
  modelValue?: string | number | undefined
}
// Embedded in the form, just use the hook binding to perform form verification
const [state] = useRuleFormItem(props, 'modelValue', 'input', emitData)

function handleChange(val: string | number | undefined) {
  const value = val === undefined || val === null ? '' : Number(val)
  emits('input', value)
}
</script>

<template>
  <el-input-number
    v-model.number="state"
    style="width: 100%;"
    :min="-Infinity"
    :max="Infinity"
    @input="handleChange"
  />
</template>

<style scoped lang="scss">
</style>
