<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed, ref, toRaw } from 'vue'
import { isEqual } from 'lodash-es'

const props = defineProps ({
  checkMark: Boolean,
  group: Boolean,
  bgColor: String,
  value: {
    type: [String, Number, Array, Boolean, Object] as PropType<any>,
    required: true,
  },
  options: { type: Array, default: () => [] as any[] },
  type: {
    type: String,
    default: 'single',
  },
  // 描述
  desc: String,
  cancelable: Boolean,
  disabled: Boolean,
  max: Number,
  round: Boolean,
  prop: { type: String },
  label: { type: String, default: 'label' },
  theme: {
    type: String,
    default: 'light',
  },
  noBorder: Boolean,
  color: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'large',
  },
  backgroundColor: String,
})
const emit = defineEmits (['update:value', 'click', 'change'])
const colorArr = ['primary', 'success', 'warning', 'danger']
const themeArr = ['dark', 'light']
const sizeArr = ['medium', 'small', 'large']
const singleData = ref ('')
const multipleDateList = ref<any[]> ([])
const checkBoxStyle = computed (() => ({
  group: props.group,
  round: props.round,
}))
const multipleDateListCom = computed (() => {
  if (Array.isArray (props.value) && props.type === 'multiple') {
    if (props.prop) {
      for (const item of props.options) {
        if (props.value.includes (item[props.label]))
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          multipleDateList.value.push (item)
      }
    }
    else {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      multipleDateList.value = props.value
    }
  }
  return multipleDateList.value
})

const singleDataCom = computed (() => {
  if (props.type === 'single') {
    if (props.prop) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      singleData.value = (props.options as any[])?.find (
        it => it[props.prop] === props.value,
      )
    }
    else {
      singleData.value = props.value
    }
  }
  return singleData.value
})

function modelValueChange(val: any, option?: any) {
  emit ('change', val, option)
  emit ('update:value', val)
}

function selectActiveByStyle(item: any) {
  const rawItem = toRaw (item)
  const rawSingleData = toRaw (singleDataCom.value)
  const rawMultipleDateList = toRaw (multipleDateListCom.value)
  if (
    isEqual (rawItem, rawSingleData)
    || rawMultipleDateList.some (it => it == toRaw (item))
  ) return 'select-active'
}

function disabledByStyle(item: any) {
  if (props.disabled || (Object.prototype.hasOwnProperty.call (item, 'disabled') && item.disabled))
    return 'disabled'
}

function iconStyle(item: any) {
  return `iconfont` + ` ${item.icon}`
}

function handleSelect(item: any) {
  if (
    props.disabled
    || (Object.prototype.hasOwnProperty.call (item, 'disabled') && item.disabled === true)
  ) return

  emit ('click', item)
  switch (props.type) {
    case 'multiple':
      if (!multipleDateListCom.value.includes (item)) {
        if (multipleDateListCom.value.length === props.max) {
          alert ('超出可选数量')
          return
        }
        multipleDateList.value.push (item)
      }
      else {
        multipleDateList.value = multipleDateListCom.value.filter (
          it => it !== item,
        )
      }
      if (props.prop) {
        const list = multipleDateList.value.map (item => item[props.prop as string]) || []
        emit ('change', list, multipleDateList.value)
        emit ('update:value', list)
      }
      else {
        modelValueChange (multipleDateList.value)
      }
      break
    case 'single':
      if (!props.cancelable)
        singleData.value = item
      else singleData.value = singleDataCom.value === item ? '' : item

      if (props.prop)
        modelValueChange (singleData.value[props.prop as string], singleData.value)
      else modelValueChange (singleData.value)

      break
  }
}
</script>

<template>
  <div
    :class="checkBoxStyle"
    class="data-check-box"
  >
    <div
      v-for="(item, index) in options"
      :key="index"
      :class="[
        props.size,
        theme,
        color,
        checkBoxStyle,
        disabledByStyle(item),
        selectActiveByStyle(item),
        { 'check-mark': checkMark, 'round': round, 'noBorder': noBorder },
      ]"
      class="check-box-item"
      :style="{
        backgroundColor: selectActiveByStyle(item) ? backgroundColor : '',
        borderColor: selectActiveByStyle(item) ? backgroundColor : '',
      }"
      @click="handleSelect(item)"
    >
      <span
        v-if="item.icon"
        style="margin-right: 2px; font-size: 12px;"
      >
        <i :class="iconStyle(item)" />
      </span>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style=" text-align: left;white-space: pre-wrap;">
          {{ prop ? item[label] : item }}
        </div>
        <div
          v-if="item.desc"
          style="white-space: pre-wrap;"
        >
          {{ item.desc }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-check-box {
  &.group {
    //类似element ui
    margin: 0 !important;
    border-radius: 4px;
    box-shadow: 0 0 0 0.5px #c0c4cc;
  }

  &.round {
    border-radius: 40px !important;
  }

  .check-box-item {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    margin-right: 8px;
    line-height: 1;
    color: #606266;
    text-align: center;
    letter-spacing: normal;
    background-color: #eee;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    padding: 8px 16px;

    &.noBorder {
      border: none !important;
      border: 0;
    }

    &.group {
      margin: 0 !important;
      box-shadow: -0.5px 0 0 0 #c0c4cc;
    }

    &.round {
      border-radius: 40px !important;
    }

    &.disabled {
      cursor: not-allowed !important;
      opacity: 0.6 !important;
    }

    &.small {
      height: 32px;
      padding: 0 12px;
    }

    &.medium {
      height: 48px;
      padding: 0 16px;
    }

    &.large {
      height: 56px;
      padding: 0 24px;
    }
  }

  .select-active {
    position: relative;
    overflow: hidden;
    box-shadow: none !important;

    &.small {
      height: 32px;
      padding: 0 12px;
    }

    &.medium {
      height: 48px;
      padding: 0 16px;
    }

    &.large {
      height: 56px;
      padding: 0 24px;
    }

    &.check-mark {
      z-index: 1;
      height: 12px;
      padding: 6px;

      &.dark {
        &::before {
          position: absolute;
          right: 0;
          bottom: 0;
          content: "";
          border: 8px solid #fff;
          border-top-color: transparent;
          border-left-color: transparent;
          opacity: 0.85;
        }

        &.primary {
          &::after {
            position: absolute;
            right: 3px;
            bottom: 2px;
            width: 2px;
            height: 6px;
            content: "";
            border: 1px solid #305dff;
            border-top-color: transparent;
            border-left-color: transparent;
            transform: rotate(45deg);
          }
        }

        &.success {
          &::after {
            position: absolute;
            right: 3px;
            bottom: 2px;
            width: 2px;
            height: 6px;
            content: "";
            border: 1px solid #07c160;
            border-top-color: transparent;
            border-left-color: transparent;
            transform: rotate(45deg);
          }
        }

        &.danger {
          &::before {
            position: absolute;
            right: 0;
            bottom: 0;
            content: "";
            border: 8px solid #fff;
            border-top-color: transparent;
            border-left-color: transparent;
          }

          &::after {
            position: absolute;
            right: 3px;
            bottom: 2px;
            width: 2px;
            height: 6px;
            content: "";
            border: 1px solid #eb5144;
            border-top-color: transparent;
            border-left-color: transparent;
            transform: rotate(45deg);
          }
        }

        &.warning {
          &::after {
            position: absolute;
            right: 3px;
            bottom: 2px;
            width: 2px;
            height: 6px;
            content: "";
            border: 1px solid #ff976a;
            border-top-color: transparent;
            border-left-color: transparent;
            transform: rotate(45deg);
          }
        }
      }

      &.light {
        &::after {
          position: absolute;
          right: 3px;
          bottom: 2px;
          width: 2px;
          height: 6px;
          content: "";
          border: 1px solid #fff;
          border-top-color: transparent;
          border-left-color: transparent;
          transform: rotate(45deg);
        }

        &.primary {
          &::before {
            position: absolute;
            right: 0;
            bottom: 0;
            content: "";
            border: 8px solid #1989fa;
            border-top-color: transparent;
            border-left-color: transparent;
          }
        }

        &.success {
          &::before {
            position: absolute;
            right: 0;
            bottom: 0;
            content: "";
            border: 8px solid #07c160;
            border-top-color: transparent;
            border-left-color: transparent;
          }
        }

        &.danger {
          &::before {
            position: absolute;
            right: 0;
            bottom: 0;
            content: "";
            border: 8px solid #eb5144;
            border-top-color: transparent;
            border-left-color: transparent;
          }
        }

        &.warning {
          &::before {
            position: absolute;
            right: 0;
            bottom: 0;
            content: "";
            border: 8px solid #ff976a;
            border-top-color: transparent;
            border-left-color: transparent;
          }
        }
      }
    }

    &.primary {
      color: #1989fa;
      background-color: #ecf5ff;
      border-color: #1989fa;

      &.dark {
        color: #fff;
        background-color: #1989fa;
        border-color: #1989fa;
      }
    }

    &.success {
      color: #07c160;
      background-color: #f0f9eb;
      border-color: #07c160;

      &.dark {
        color: #fff;
        background-color: #07c160;
        border-color: #07c160;
      }
    }

    &.warning {
      color: #ff976a;
      background-color: #fdf6ec;
      border-color: #ff976a;

      &.dark {
        color: #fff;
        background-color: #ff976a;
        border-color: #ff976a;
      }
    }

    &.danger {
      color: #eb5144;
      background-color: #fef0f0;
      border-color: #eb5144;

      &.dark {
        color: #fff;
        background-color: #eb5144;
        border-color: #eb5144;
      }
    }
  }
}
</style>
