<script setup lang="ts">
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
const valueCom = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val.map((item) => item.value))
  },
})
function handleChange(val) {
  if (val === undefined || val === null){
    emits('update:modelValue', [])
    return
  }
  console.log(val, 'handleChange')
  emits('update:modelValue', val.map((item) => item.value))
}
</script>

<template>
  <el-checkbox-group
    v-bind="$attrs"
    v-model="valueCom"
    @change="handleChange"
  >
    <el-checkbox v-for="(item, index) in props.options" :key="index" :label="item">
      {{
        item.label
      }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<style scoped lang="scss">

</style>
