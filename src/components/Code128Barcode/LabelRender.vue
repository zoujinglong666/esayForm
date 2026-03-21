<template>
  <div class="label" :style="labelStyle">
    <Code128Barcode
      :mode="mode"
      type="svg"
      :value="data.code"
      :width="barcode.moduleWidth"
      :height="barcode.barHeight"
      :fontSize="barcode.fontSize"
      :displayValue="true"
    />

    <div class="text">{{ data.sku }}</div>
  </div>
</template>

<script setup lang="ts">
import Code128Barcode from '@/components/Code128Barcode/index.vue'

interface LabelData {
  code: string
  sku: string
}

const props = defineProps<{
  data: LabelData
  mode: 'screen' | 'print'
  template: {
    widthMM: number
    heightMM: number
    offsetXMM: number
    offsetYMM: number
    barcode: {
      moduleWidth: number
      barHeight: number
      fontSize: number
    }
  }
}>()

const { template, mode } = props

const labelStyle = {
  width: `${template.widthMM}mm`,
  height: `${template.heightMM}mm`,
  paddingLeft: `${template.offsetXMM}mm`,
  paddingTop: `${template.offsetYMM}mm`,
  boxSizing: 'border-box',
  fontFamily: 'monospace'
}

const barcode = template.barcode
</script>

<style scoped>
.label {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.text {
  font-size: 8px;
  line-height: 10px;
}
</style>
