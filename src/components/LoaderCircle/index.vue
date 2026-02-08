<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'

type SpinSize = 'small' | 'default' | 'large'
type SpinPercent = number | 'auto'

interface SpinInfo {
  spinning: boolean
  fullscreen: boolean
  size: SpinSize
  percent?: SpinPercent
}

type SpinClassNamesMap = Partial<{
  root: string
  container: string
  indicator: string
  tip: string
  progress: string
}>

type SpinStylesMap = Partial<{
  root: CSSProperties
  container: CSSProperties
  indicator: CSSProperties
  tip: CSSProperties
  progress: CSSProperties
}>

type SpinClassNamesType = SpinClassNamesMap | ((info: SpinInfo) => SpinClassNamesMap)
type SpinStylesType = SpinStylesMap | ((info: SpinInfo) => SpinStylesMap)

const props = withDefaults(
  defineProps<{
    spinning?: boolean
    size?: SpinSize
    tip?: any
    delay?: number
    wrapperClassName?: string
    indicator?: any
    fullscreen?: boolean
    percent?: SpinPercent
    rootClass?: string
    classes?: SpinClassNamesType
    styles?: SpinStylesType
    blur?: number
    maskBackground?: string
    offsetY?: number
    color?: string
    tipColor?: string
    timeout?: number
    timeoutTip?: string
    closable?: boolean
  }>(),
  {
    spinning: true,
    size: 'default',
    delay: 0,
    fullscreen: false,
    blur: 1,
    maskBackground: 'rgba(0, 0, 0, 0.45)',
    offsetY: 0,
    color: '#40a9ff',
    closable: false,
  },
)

defineOptions({
  name: 'Spin',
})

const slots = useSlots()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const displaySpinning = ref(false)
let delayTimer: number | undefined

const updateDisplaySpinning = () => {
  const { spinning, delay } = props
  if (delay && delay > 0 && spinning) {
    if (delayTimer) {
      window.clearTimeout(delayTimer)
      delayTimer = undefined
    }
    delayTimer = window.setTimeout(() => {
      displaySpinning.value = true
      delayTimer = undefined
    }, delay)
  }
  else {
    if (delayTimer) {
      window.clearTimeout(delayTimer)
      delayTimer = undefined
    }
    displaySpinning.value = !!spinning
  }
}

watch(
  () => props.spinning,
  () => {
    updateDisplaySpinning()
  },
  { immediate: true },
)
const setupTimeout = () => {
  clearTimeoutTimer()
  timeoutReached.value = false
  if (displaySpinning.value && props.timeout && props.timeout > 0) {
    timeoutTimer = window.setTimeout(() => {
      timeoutReached.value = true
    }, props.timeout)
  }
}


const percentValue = ref<number | undefined>(undefined)
let percentTimer: number | undefined

const clearPercentTimer = () => {
  if (percentTimer) {
    window.clearInterval(percentTimer)
    percentTimer = undefined
  }
}

const startAutoPercent = () => {
  clearPercentTimer()
  percentValue.value = 0
  percentTimer = window.setInterval(() => {
    const current = percentValue.value ?? 0
    const inc = 5 + Math.random() * 15
    let next = current + inc
    if (next >= 99) {
      next = 99
    }
    percentValue.value = next
  }, 300)
}

const spinInfo = computed<SpinInfo>(() => ({
  spinning: displaySpinning.value,
  fullscreen: props.fullscreen,
  size: props.size,
  percent: props.percent,
}))

const timeoutReached = ref(false)
let timeoutTimer: number | undefined

const clearTimeoutTimer = () => {
  if (timeoutTimer) {
    window.clearTimeout(timeoutTimer)
    timeoutTimer = undefined
  }
}



watch(
  [() => props.percent, () => displaySpinning.value],
  ([percent, spinning]) => {
    clearPercentTimer()
    if (!spinning) {
      percentValue.value = undefined
      return
    }
    if (percent === 'auto') {
      startAutoPercent()
      return
    }
    if (typeof percent === 'number') {
      const n = Math.min(100, Math.max(0, percent))
      percentValue.value = n
      return
    }
    percentValue.value = undefined
  },
  { immediate: true },
)

const mergedClasses = computed<SpinClassNamesMap>(() => {
  const { classes } = props
  if (!classes) return {}
  if (typeof classes === 'function') return classes(spinInfo.value) || {}
  return classes
})

const mergedStyles = computed<SpinStylesMap>(() => {
  const { styles } = props
  if (!styles) return {}
  if (typeof styles === 'function') return styles(spinInfo.value) || {}
  return styles
})

const rootCls = computed(() => [
  'data-spin',
  props.rootClass,
  `data-spin-${props.size}`,
  props.fullscreen && displaySpinning.value && 'data-spin-fullscreen',
  displaySpinning.value && 'data-spin-spinning',
  mergedClasses.value.root,
])

const containerCls = computed(() => [
  'data-spin-container',
  props.wrapperClassName,
  mergedClasses.value.container,
])

const indicatorCls = computed(() => [
  'data-spin-indicator',
  mergedClasses.value.indicator,
])

const tipCls = computed(() => [
  'data-spin-tip',
  mergedClasses.value.tip,
])

const progressCls = computed(() => [
  'data-spin-progress',
  mergedClasses.value.progress,
])

const rootStyle = computed<CSSProperties | undefined>(() => {
  const base = (mergedStyles.value.root || {}) as CSSProperties
  const style: CSSProperties = { ...base }

  if (displaySpinning.value && props.blur !== undefined) {
    ;(style as any)['--spin-blur'] = `${props.blur}px`
  }

  if (props.maskBackground) {
    ;(style as any)['--spin-mask-bg'] = props.maskBackground
  }

  if (props.offsetY) {
    ;(style as any)['--spin-offset-y'] = `${props.offsetY}px`
  }

  if (props.color) {
    ;(style as any)['--spin-color'] = props.color
  }

  if (props.tipColor) {
    ;(style as any)['--spin-tip-color'] = props.tipColor
  }

  return style
})
const containerStyle = computed<CSSProperties | undefined>(() => mergedStyles.value.container)
const indicatorStyle = computed<CSSProperties | undefined>(() => mergedStyles.value.indicator)
const tipStyle = computed<CSSProperties | undefined>(() => mergedStyles.value.tip)
const progressStyle = computed<CSSProperties | undefined>(() => mergedStyles.value.progress)

const mergedPercent = computed(() => percentValue.value)

const displayTip = computed(() => {
  if (timeoutReached.value && props.timeoutTip)
    return props.timeoutTip

  return props.tip
})

const hasContent = computed(() => !!slots.default)
watch(
  () => displaySpinning.value,
  () => {
    setupTimeout()
  },
  { immediate: true },
)

watch(
  () => props.timeout,
  () => {
    setupTimeout()
  },
)
const handleClose = () => {
  emit('close')
}

onBeforeUnmount(() => {
  if (delayTimer) {
   clearTimeout(delayTimer)
    delayTimer = undefined
  }
  clearPercentTimer()
})
</script>

<template>
  <div :class="rootCls" :style="rootStyle">
    <div v-if="hasContent" :class="containerCls" :style="containerStyle">
      <slot />
    </div>
    <div v-if="displaySpinning" :class="indicatorCls" :style="indicatorStyle">
      <slot v-if="$slots.indicator" name="indicator" />
      <component :is="indicator" v-else-if="indicator" />
      <span v-else class="data-spin-dot">
        <span v-for="item in 4" :key="item" class="data-spin-dot-item" />
      </span>
      <div v-if="$slots.tip || displayTip" :class="tipCls" :style="tipStyle">
        <slot name="tip">
          {{ displayTip }}
        </slot>
      </div>
      <div v-if="mergedPercent !== undefined" :class="progressCls" :style="progressStyle">
        <div class="data-spin-progress-outer">
          <div class="data-spin-progress-inner" :style="{ width: `${mergedPercent}%` }" />
        </div>
      </div>
      <button
        v-if="fullscreen && closable"
        type="button"
        class="data-spin-close"
        @click="handleClose"
      >
        取消
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-spin {
  position: relative;
  display: inline-block;
}

.data-spin-container {
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.data-spin-spinning .data-spin-container {
  filter: blur(var(--spin-blur, 1px));
  opacity: 0.6;
  pointer-events: none;
}

.data-spin-indicator {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(var(--spin-offset-y, 0));
}

.data-spin-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--spin-mask-bg, rgba(0, 0, 0, 0.45));
  backdrop-filter: blur(var(--spin-blur, 1px));
}

.data-spin-fullscreen .data-spin-indicator {
  position: static;
}

.data-spin-dot {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 32px;
  animation: data-spin-rotate 1s infinite linear;
  transform-origin: center center;
}

.data-spin-small .data-spin-dot {
  width: 20px;
  height: 20px;
}

.data-spin-large .data-spin-dot {
  width: 40px;
  height: 40px;
}

.data-spin-dot-item {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--spin-color, #40a9ff);
  border-radius: 100%;
  opacity: 0.25;
  animation: data-spin-fade 1s infinite linear;
}

.data-spin-small .data-spin-dot-item {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: var(--spin-color, #40a9ff);
  border-radius: 100%;
  opacity: 0.25;
  animation: data-spin-fade 1s infinite linear;
}

.data-spin-large .data-spin-dot-item {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: var(--spin-color, #40a9ff);
  border-radius: 100%;
  opacity: 0.25;
  animation: data-spin-fade 1s infinite linear;
}

.data-spin-dot-item:nth-child(1) {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.data-spin-dot-item:nth-child(2) {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  animation-delay: 0.25s;
}

.data-spin-dot-item:nth-child(3) {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.5s;
}

.data-spin-dot-item:nth-child(4) {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  animation-delay: 0.75s;
}

.data-spin-tip {
  margin-top: 8px;
  color: var(--spin-tip-color, rgba(0, 0, 0, 0.65));
  font-size: 14px;
}

.data-spin-progress {
  margin-top: 8px;
  width: 100%;
}

.data-spin-progress-outer {
  width: 140px;
  height: 2px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 100px;
}

.data-spin-progress-inner {
  width: 0;
  height: 100%;
  background-color: var(--spin-color, #40a9ff);
  transition: width 0.3s ease;
}

.data-spin-close {
  margin-top: 12px;
  padding: 4px 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.85);
  font-size: 12px;
  cursor: pointer;
}

.data-spin-close:hover {
  background-color: #f5f5f5;
}

@keyframes data-spin-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes data-spin-fade {
  0% {
    opacity: 0.25;
  }
  25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.75;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0.25;
  }
}
</style>
