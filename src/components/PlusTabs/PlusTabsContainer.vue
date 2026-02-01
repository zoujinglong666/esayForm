<template>
  <div class="plus-tabs">
    <div class="plus-tabs__nav">
      <div
        v-for="(pane, index) in panes"
        :key="pane.key ?? index"
        :class="[
          'plus-tabs__nav-item',
          {
            'plus-tabs__nav-item--active': activeIndex === index,
            'plus-tabs__nav-item--disabled': pane.props?.disabled
          }
        ]"
        @click="onClick(index, pane.props?.disabled)"
      >
        <span class="plus-tabs__nav-title">
          {{ pane.props?.title ?? `Tab ${index + 1}` }}
        </span>
      </div>
    </div>
    <div class="plus-tabs__content">
      <component
        v-for="(pane, index) in panes"
        :is="pane"
        :key="pane.key ?? index"
        :active="activeIndex === index"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, useSlots, watch, type PropType } from 'vue'

type TabName = string | number

const props = defineProps({
  active: {
    type: [String, Number] as PropType<TabName>,
    default: 0
  }
})

const emit = defineEmits<{
  (e: 'update:active', value: TabName): void
  (e: 'change', value: TabName): void
}>()

const slots = useSlots()

const innerActive = ref<TabName>(props.active)

watch(
  () => props.active,
  (val: TabName) => {
    innerActive.value = val
  }
)

const panes = computed(() => {
  const children = slots.default ? slots.default() : []
  return children
})

const paneNames = computed(() =>
  panes.value.map((pane, index) => {
    const name = pane.props && pane.props.name
    if (name === 0 || name) return name as TabName
    return index
  })
)

const activeIndex = computed(() => {
  const index = paneNames.value.findIndex(
    (name) => String(name) === String(innerActive.value)
  )
  if (index === -1) return 0
  return index
})

const setActiveByIndex = (index: number) => {
  const name = paneNames.value[index]
  innerActive.value = name
  emit('update:active', name)
  emit('change', name)
}

const onClick = (index: number, disabled: boolean | undefined) => {
  if (disabled) return
  if (index === activeIndex.value) return
  setActiveByIndex(index)
}
</script>

<style lang="scss" scoped>
.plus-tabs {
  display: flex;
  flex-direction: column;
}

.plus-tabs__nav {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.plus-tabs__nav-item {
  position: relative;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.plus-tabs__nav-item--active {
  color: var(--el-color-primary);
}

.plus-tabs__nav-item--active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: var(--el-color-primary);
}

.plus-tabs__nav-item--disabled {
  cursor: not-allowed;
  color: var(--el-text-color-disabled);
}

.plus-tabs__nav-title {
  white-space: nowrap;
}

.plus-tabs__content {
  padding-top: 8px;
}
</style>
