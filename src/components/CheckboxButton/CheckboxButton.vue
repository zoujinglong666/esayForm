<script setup lang="ts">
import {useRuleFormItem} from "@/hooks/component/useFormItem.ts";
import {ref} from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
})
const emits = defineEmits(['update:modelValue'])

function handleChange(val) {
  if (val === undefined || val === null){
    emits('update:modelValue', [])
    return
  }
  console.log(val.map((item) => item.value).filter(Boolean), 'handleChange')
  emits('update:modelValue', val.map((item) => item.value).filter(Boolean))
}
const emitData = ref([])
const [state] = useRuleFormItem(props, 'modelValue', 'change', emitData)
</script>

<template>
  <el-checkbox-group
    v-bind="$attrs"
    v-model="state"
    @change="handleChange"
  >
    <el-checkbox-button v-for="(item, index) in props.options" :key="index" :label="item" :value="item">
      {{
        item
      }}
    </el-checkbox-button>
  </el-checkbox-group>
</template>

<style scoped lang="scss">

</style>
