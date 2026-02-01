<template>
  <div>
    <h3>lazy（默认 true）</h3>
    <PlusTabs v-model:active="activeLazy">
      <PlusTabsPane title="标签 1">
        <LogPane label="lazy-pane-1" />
      </PlusTabsPane>
      <PlusTabsPane title="标签 2">
        <LogPane label="lazy-pane-2" />
      </PlusTabsPane>
      <PlusTabsPane title="标签 3">
        <LogPane label="lazy-pane-3" />
      </PlusTabsPane>
    </PlusTabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineComponent, onMounted, h } from 'vue'

const activeLazy = ref('标签 1')

const LogPane = defineComponent({
  name: 'LogPane',
  props: {
    label: {
      type: String,
      required: true
    }
  },
  setup(props) {
    console.log('LogPane setup:', props.label)
    onMounted(() => {
      console.log('LogPane mounted:', props.label)
    })
    return () => h('div', '内容：' + props.label)
  }
})
</script>