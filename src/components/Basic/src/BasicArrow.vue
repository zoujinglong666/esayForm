<script lang="ts" setup>
import { computed } from 'vue'
import Icon from '@/components/Icon/Icon.vue'
import { useDesign } from '@/hooks/web/useDesign'
const props = defineProps({
  /**
   * Arrow expand state
   */
  expand: { type: Boolean },
  /**
   * Arrow up by default
   */
  up: { type: Boolean },
  /**
   * Arrow down by default
   */
  down: { type: Boolean },
  /**
   * Cancel padding/margin for inline
   */
  inset: { type: Boolean },
})

const { prefixCls } = useDesign('basic-arrow')

// get component class
const getClass = computed(() => {
  const { expand, up, down, inset } = props
  return [
    prefixCls,
    {
      [`${prefixCls}--active`]: expand,
      up,
      inset,
      down,
    },
  ]
})
</script>

<template>
  <span class="data-basic-arrow">
    <Icon icon="ion:chevron-forward" :style="$attrs.iconStyle" />
  </span>
</template>

<style lang="scss" scoped>
  .data-basic-arrow {
    display: inline-block;
    cursor: pointer;
    transition: all 0.3s ease 0.1s;
    transform: rotate(0deg);
    transform-origin: center center;

    &--active {
      transform: rotate(90deg);
    }

    &.inset {
      line-height: 0px;
    }

    &.up {
      transform: rotate(-90deg);
    }

    &.down {
      transform: rotate(90deg);
    }
  }
</style>
