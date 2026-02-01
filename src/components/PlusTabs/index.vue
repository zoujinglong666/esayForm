<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  type PropType,
  ref,
  shallowRef,
  watch,
  useSlots
} from 'vue'

interface TabOption {
  label: string
  value: string | number
  number?: number
  color?: string
  hideNum?: boolean
  badgeType?: 'dot' | 'number'
}

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  active: {
    type: [String, Number] as PropType<string | number>,
    default: undefined
  },
  showAll: { type: Boolean, default: true },
  statusOptions: {
    type: Array as PropType<TabOption[]>,
    default: () => []
  },
  api: {
    type: Function as PropType<() => Promise<any>>,
    default: null
  },
  postData: {
    type: Function as PropType<(data: any) => any>,
    default: null
  },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  numberKey: { type: String, default: 'number' },
  barStyle: {
    type: String as PropType<'thick' | 'thin'>,
    default: 'thin',
    validator: (val: string) => ['thick', 'thin'].includes(val)
  },
  backgroundColor: { type: String, default: '#fff' },
  activeTextColor: { type: String, default: '#30afa6' },
  activeBarColor: { type: String, default: '#30afa6' },
  badgeColor: { type: String, default: '#ff4d4f' },
  numberStyle: {
    type: String as PropType<'badge' | 'parentheses'>,
    default: 'parentheses',
    validator: (val: string) => ['badge', 'parentheses'].includes(val)
  },
  fallbackToLocal: { type: Boolean, default: true },
  size: { type: Number, default: 16 },
  badgeMaxCount: { type: Number, default: 99 },
  vertical: { type: Boolean, default: false },
  lazy: { type: Boolean, default: true }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'update:active', value: string | number): void
  (e: 'change', tab: TabOption): void
  (e: 'tab-change', tab: TabOption): void
  (e: 'load-success', tabs: TabOption[]): void
  (e: 'load-error', error: any): void
}>()

// ========== 状态管理 ==========
const slots = useSlots()

const externalActive = computed<string | number>(() => {
  const active = props.active as string | number | undefined
  if (active === undefined || active === null) {
    return props.modelValue
  }
  return active
})

const activeTab = ref<string | number>(externalActive.value)
const tabs = shallowRef<TabOption[]>([])
const loading = ref(false)
const isUnmounted = ref(false)
const tabElements = ref<Record<string | number, HTMLElement>>({})
const activeIndicatorTransform = ref('0px')
const activeIndicatorSize = ref('0px') // width or height
const isSwitching = ref(false)

let debounceTimer: number | null = null
const DEBOUNCE_DELAY = 150

const paneNodes = computed(() => {
  const children = slots.default ? slots.default() : []
  return children
})

const paneNames = computed<(string | number)[]>(() =>
  paneNodes.value.map((pane: any, index: number) => {
    const props = pane.props || {}
    const name = props.name
    if (name === 0 || name) return name as string | number
    const title = props.title
    if (title) return title as string
    return index
  })
)

const isPaneMode = computed(
  () =>
    paneNodes.value.length > 0 &&
    (!props.statusOptions || props.statusOptions.length === 0) &&
    !props.api
)

const activePaneIndex = computed(() => {
  const index = paneNames.value.findIndex(
    (name) => String(name) === String(activeTab.value)
  )
  if (index === -1) return 0
  return index
})

const lastPaneIndex = ref(activePaneIndex.value)

const paneTransitionName = computed(() => {
  if (activePaneIndex.value > lastPaneIndex.value) {
    return 'plus-tabs-slide-left'
  }
  if (activePaneIndex.value < lastPaneIndex.value) {
    return 'plus-tabs-slide-right'
  }
  return 'plus-tabs-slide-left'
})

// ========== 计算属性 ==========
const fontSize = computed(() => `${props.size}px`)
const containerStyle = computed(() => ({
  backgroundColor: props.backgroundColor,
  borderRadius: '0px'
}))

const activeIndicatorClass = computed(() =>
  props.vertical
    ? 'active-indicator-vertical'
    : props.barStyle === 'thick'
    ? 'active-indicator_thick'
    : 'active-indicator_thin'
)

const activeBarStyle = computed(() => {
  if (props.vertical) {
    return {
      transform: `translateY(${activeIndicatorTransform.value})`,
      height: activeIndicatorSize.value,
      backgroundColor: props.activeBarColor,
      right: '0',
      marginLeft: '-1px'
    }
  } else {
    return {
      transform: `translateX(${activeIndicatorTransform.value})`,
      width: activeIndicatorSize.value,
      backgroundColor: props.activeBarColor
    }
  }
})

const setActive = (value: string | number) => {
  if (String(activeTab.value) === String(value)) return
  activeTab.value = value
  emit('update:modelValue', value)
  emit('update:active', value)
}

// ========== 方法定义 ==========
const debounceSwitchTab = (tab: TabOption, immediate = false) => {
  if (String(activeTab.value) === String(tab.value)) return
  if (isSwitching.value) return

  if (debounceTimer) {
    window.clearTimeout(debounceTimer)
    debounceTimer = null
  }

  if (immediate) {
    switchTab(tab)
    return
  }

  isSwitching.value = true
  debounceTimer = window.setTimeout(() => {
    switchTab(tab)
    debounceTimer = null
    isSwitching.value = false
  }, DEBOUNCE_DELAY)
}

const switchTab = (tab: TabOption) => {
  if (String(activeTab.value) === String(tab.value)) return

  setActive(tab.value)
  emit('change', tab)
  emit('tab-change', tab)

  requestAnimationFrame(updateActiveIndicator)
  nextTick(updateActiveIndicator)
}

const onClickPane = (index: number, disabled: boolean | undefined) => {
  if (disabled) return
  if (index === activePaneIndex.value) return
  const name = paneNames.value[index]
  if (name === undefined || name === null) return
  setActive(name)
  requestAnimationFrame(updateActiveIndicator)
  nextTick(updateActiveIndicator)
}

const updateActiveIndicator = () => {
  if (isUnmounted.value) return

  const activeTabValue = activeTab.value
  const activeTabEl = tabElements.value[activeTabValue]

  if (!activeTabEl) return

  const tabRect = activeTabEl.getBoundingClientRect()
  const containerRect = activeTabEl.parentElement!.getBoundingClientRect()

  if (props.vertical) {
    const top = tabRect.top - containerRect.top
    const height = tabRect.height
    activeIndicatorTransform.value = `${top}px`
    activeIndicatorSize.value = `${height}px`
  } else {
    const left = tabRect.left - containerRect.left
    const width = tabRect.width
    activeIndicatorTransform.value = `${left}px`
    activeIndicatorSize.value = `${width}px`
  }
}

const validateActiveTab = () => {
  if (tabs.value.length === 0) return

  const isActiveTabValid = tabs.value.some((tab) => String(tab.value) === String(activeTab.value))

  if (!isActiveTabValid) {
    const matchingTab = tabs.value.find((tab) => String(tab.value) === String(props.modelValue))
    activeTab.value = matchingTab ? matchingTab.value : tabs.value[0].value
    emit('update:modelValue', activeTab.value)
  }
}

const getLocalOptions = (): TabOption[] => {
  return props.statusOptions.map((item) => ({
    ...item,
    label: (item as any)[props.labelKey] || item.label || '未知',
    value: (item as any)[props.valueKey] || item.value,
    number: (item as any)[props.numberKey] ?? item.number ?? 0,
    color: item?.color,
    hideNum: item?.hideNum ?? false,
    badgeType:
      item.number && item.number > 0 ? ('number' as TabOption['badgeType']) : undefined
  }))
}

const updateTabsOptimistically = async (newTabs: TabOption[]) => {
  if (tabs.value.length === 0) {
    tabs.value = newTabs
    return
  }

  const tabMap = new Map<string | number, TabOption>()
  newTabs.forEach((tab) => {
    tabMap.set(tab.value, tab)
  })

  const updatedTabs = [...tabs.value].map((tab) => {
    const newTab = tabMap.get(tab.value)
    if (!newTab) return tab

    tabMap.delete(tab.value)
    return {
      ...tab,
      label: newTab.label,
      number: newTab.number,
      color: newTab.color ?? tab.color,
      hideNum: newTab.hideNum ?? tab.hideNum,
      badgeType:
        newTab.number && newTab.number > 0 ? ('number' as TabOption['badgeType']) : undefined
    }
  })

  tabMap.forEach((tab) => {
    updatedTabs.push({
      ...tab,
      badgeType:
        tab.number && tab.number > 0 ? ('number' as TabOption['badgeType']) : undefined
    })
  })

  tabs.value = updatedTabs
  await nextTick()
}

const initTabs = async () => {
  loading.value = true
  try {
    let rawOptions: TabOption[] = []

    if (props.api && typeof props.api === 'function') {
      try {
        const res = await props.api()
        let data = Array.isArray(res) ? res : res?.data || []

        if (props.postData && typeof props.postData === 'function') {
          data = props.postData(data)
        }

        rawOptions = data.map((item: any) => ({
          ...item,
          label: item[props.labelKey] || item.label || '未知',
          value: item[props.valueKey] || item.value,
          number: item[props.numberKey] ?? item.number ?? 0
        }))
      } catch (err) {
        console.error('获取状态列表失败：', err)
        emit('load-error', err)

        if (props.fallbackToLocal) {
          rawOptions = getLocalOptions()
        } else {
          throw err
        }
      }
    } else {
      rawOptions = getLocalOptions()
    }

    if (props.showAll) {
      const hasAllOption = rawOptions.some(
        (opt) =>
          opt.value === undefined || opt.value === null || opt.value === '' || opt.label === '全部'
      )
      if (!hasAllOption) {
        const totalNumber = rawOptions.reduce(
          (sum, item) => sum + (item.number || 0) * (item.hideNum ? 0 : 1),
          0
        )
        rawOptions = [
          { label: '全部', value: '', number: totalNumber, hideNum: false },
          ...rawOptions
        ]
      }
    }

    await updateTabsOptimistically(rawOptions)
    validateActiveTab()
    emit('load-success', tabs.value)
  } catch (err) {
    tabs.value = []
    console.error('标签初始化失败:', err)
  } finally {
    loading.value = false
  }
}

// ========== 生命周期 ==========
onMounted(() => {
  if (!isUnmounted.value) {
    if (!isPaneMode.value) {
      initTabs()
    }
    requestAnimationFrame(() => {
      if (isPaneMode.value) {
        const names = paneNames.value
        if (names.length > 0) {
          const hasMatch = names.some(
            (name) => String(name) === String(activeTab.value)
          )
          if (!hasMatch) {
            const first = names[0]
            activeTab.value = first
            emit('update:modelValue', first)
            emit('update:active', first)
          }
        }
      }
      updateActiveIndicator()
    })
    window.addEventListener('resize', handleResize)
  }
})

let resizeTimer: number | null = null
const handleResize = () => {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    updateActiveIndicator()
    resizeTimer = null
  }, 100)
}

onBeforeUnmount(() => {
  isUnmounted.value = true
  window.removeEventListener('resize', handleResize)
  if (debounceTimer) window.clearTimeout(debounceTimer)
  if (resizeTimer) window.clearTimeout(resizeTimer)
})

// ========== 监听器 ==========
watch(
  () => externalActive.value,
  (newVal) => {
    if (String(newVal) !== String(activeTab.value)) {
      activeTab.value = newVal
      requestAnimationFrame(updateActiveIndicator)
    }
  },
  { flush: 'post' }
)

watch(
  () => tabs.value,
  () => {
    nextTick(updateActiveIndicator)
  }
)

watch(
  () => activePaneIndex.value,
  (val) => {
    lastPaneIndex.value = val
  }
)

// ========== 暴露方法 ==========
defineExpose({
  activeTab,
  tabs,
  initTabs,
  refresh: initTabs,
  updateActiveIndicator
})
</script>

<template>
  <div v-if="!isPaneMode" :style="containerStyle" class="options-container">
    <div
      :class="{
        'tabs-wrapper': !vertical,
        'tabs-wrapper-vertical': vertical
      }"
    >
      <div
        v-for="tab in tabs"
        :key="`${tab.value}`"
        :ref="(el) => (tabElements[tab.value] = el as HTMLElement)"
        :class="{ active: activeTab === tab.value }"
        :style="{
          fontSize,
          color: activeTab === tab.value ? activeTextColor : undefined,
        }"
        class="tab-item"
        @click="debounceSwitchTab(tab)"
      >
        <span :style="{ color: tab.color }" class="tab-label">{{ tab.label }}</span>

        <div v-if="!tab.hideNum && tab.number != null && tab.number > 0" class="badge-container">
          <div
            v-if="numberStyle === 'badge'"
            :style="{ backgroundColor: badgeColor }"
            class="badge-num"
          >
            {{ tab.number > badgeMaxCount ? `${badgeMaxCount}+` : tab.number }}
          </div>
          <span v-else-if="numberStyle === 'parentheses'" class="badge-text">
            ({{ tab.number > badgeMaxCount ? `${badgeMaxCount}+` : tab.number }})
          </span>
        </div>
      </div>

      <div
        v-if="vertical"
        class="active-indicator-vertical"
        :style="{
          backgroundColor: activeBarColor,
          height: activeIndicatorSize,
          transform: `translateY(${activeIndicatorTransform})`
        }"
      ></div>
      <div v-else :class="[activeIndicatorClass, 'active-indicator']" :style="activeBarStyle"></div>
    </div>
  </div>
  <div v-else class="plus-tabs-pane-wrapper">
    <div :style="containerStyle" class="options-container">
      <div class="tabs-wrapper">
        <div
          v-for="(pane, index) in paneNodes"
          :key="pane.key ?? index"
          :ref="(el) => (tabElements[paneNames[index]] = el as HTMLElement)"
          :class="{ active: activePaneIndex === index }"
          :style="{
            fontSize,
            color: activePaneIndex === index ? activeTextColor : undefined,
            padding: vertical ? '8px 12px' : '8px 20px'
          }"
          class="tab-item"
          @click="onClickPane(index, pane.props?.disabled)"
        >
          <span class="tab-label">
            {{ pane.props?.title ?? `Tab ${index + 1}` }}
          </span>
        </div>

        <div
          v-if="vertical"
          class="active-indicator-vertical"
          :style="{
            backgroundColor: activeBarColor,
            height: activeIndicatorSize,
            transform: `translateY(${activeIndicatorTransform})`
          }"
        ></div>
        <div v-else :class="[activeIndicatorClass, 'active-indicator']" :style="activeBarStyle"></div>
      </div>

      <div class="plus-tabs__content">
        <template v-if="lazy">
          <transition :name="paneTransitionName" mode="out-in">
            <keep-alive>
              <component
                :is="paneNodes[activePaneIndex]"
                :key="paneNames[activePaneIndex]"
                :active="true"
              />
            </keep-alive>
          </transition>
        </template>
        <template v-else>
          <component
            v-for="(pane, index) in paneNodes"
            :is="pane"
            :key="pane.key ?? index"
            :active="activePaneIndex === index"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$options-padding: 4px;
$tab-padding: 8px 20px;
$transition-duration: 0.3s;
$transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

.options-container {
  contain: layout paint;
}

.tabs-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  contain: layout;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: var(--el-border-color-light);
    z-index: 8;
    will-change: transform;
  }
}

.tabs-wrapper-vertical {
  position: relative;
  display: flex;
  flex-direction: column;
  contain: layout;

  &:after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: var(--el-border-color-light);
    z-index: 8;
    will-change: transform;
  }
}

.tab-item {
  position: relative;
  cursor: pointer;
  z-index: 1;
  transition: color $transition-duration $transition-easing;
  contain: content;
  white-space: nowrap;

  &:active {
    opacity: 0.85;
  }

  &.active {
    font-weight: 900;
    background-color: var(--el-color-primary-light-9);
  }
}

.tab-label {
  display: inline-block;
}

.badge-container {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.badge-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  background-color: var(--el-color-danger);
  color: white;
  font-size: 12px;
  line-height: 1;
  transform: translate(0, -1px);
}

.badge-text {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.active-indicator {
  position: absolute;
  bottom: 0;
  z-index: 9;
  height: 2px;
  will-change: transform, width;
  transition: transform $transition-duration $transition-easing,
    width $transition-duration $transition-easing,
    background-color $transition-duration $transition-easing;

  &_thick {
    top: 0;
    bottom: 0;
    height: auto;
    background-color: white;
    border-radius: 8px;
  }

  &_thin {
    height: 2px;
  }
}

.active-indicator-vertical {
  position: absolute;
  right: 0;
  top: 0;
  width: 2px;
  z-index: 9;
  will-change: transform, height;
  transition: transform $transition-duration $transition-easing,
    height $transition-duration $transition-easing,
    background-color $transition-duration $transition-easing;
}

.plus-tabs__content {
  padding-top: 8px;
}

.plus-tabs-slide-left-enter-active,
.plus-tabs-slide-left-leave-active,
.plus-tabs-slide-right-enter-active,
.plus-tabs-slide-right-leave-active {
  transition:
    transform $transition-duration $transition-easing,
    opacity $transition-duration $transition-easing;
}

.plus-tabs-slide-left-enter-from,
.plus-tabs-slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.plus-tabs-slide-left-leave-to,
.plus-tabs-slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
