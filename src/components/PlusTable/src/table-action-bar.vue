<template>
  <el-table-column
    key="actionBar"
    class="plus-table-action-bar"
    :label="unref(label) || t('plus.table.action')"
    :fixed="fixed || 'right'"
    :width="width || 200"
    v-bind="actionBarTableColumnProps"
  >
    <template #default="{ row, $index, ...rest }">
      <!-- 显示出来的按钮 -->
      <template v-for="buttonRow in getSubButtons(row, $index).preButtons" :key="buttonRow.text">
        <component :is="() => render(row, buttonRow, $index, rest)" />
      </template>
      <!-- 隐藏的按钮 -->
      <el-dropdown
        v-if="getSubButtons(row, $index).showMore"
        trigger="click"
        class="plus-table-action-bar__dropdown"
      >
        <span class="plus-table-action-bar__dropdown__link">
          <span class="plus-table-action-bar__more-text"> {{ t('plus.table.more') }}</span>
          <slot name="action-bar-more-icon">
            <el-icon> <ArrowDownBold /> </el-icon>
          </slot>
        </span>

        <!-- 下拉按钮 -->
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="buttonRow in getSubButtons(row, $index).nextButtons"
              :key="unref(buttonRow.text) as string"
            >
              <component :is="() => render(row, buttonRow, $index, rest)" />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </el-table-column>
</template>

<script lang="ts" setup>
import type { AppContext, Component, ComputedRef, Ref, VNode } from 'vue'
import { h, inject, unref, withDirectives } from 'vue'
import { ArrowDownBold } from '@element-plus/icons-vue'
import type { ElMessageBoxOptions } from 'element-plus'
import type { RecordType } from '@/components/PlusTable/types'
import { isFunction, isPlainObject } from '@/utils/is'
import { TableFormRefInjectionKey } from '@/components/PlusTable/constants'
import type { ActionBarButtonsRow, ButtonsCallBackParams, TableFormRefRow } from './type'
import { ElButton, ElIcon, ElLink, ElMessageBox, ElTooltip } from 'element-plus'
const { t } = useI18n()
defineOptions({
  name: 'PlusTableActionBar'
})

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  fixed: {
    // 操作栏固定
    type: String,
    default: 'right'
  },
  type: {
    // 操作按钮的类型    默认值为 `'link'`

    type: String,
    default: 'link'
  },
  buttons: {
    // 操作按钮集合
    type: Array,
    default: () => []
  },
  width: {
    // 表格操作栏 el-table-column 的其width   默认值为 `200`
    type: [String, Number],
    default: 200
  },
  showNumber: {
    // 显示出来的按钮个数  默认值为 `3`
    type: Number,
    default: 3
  },
  actionBarTableColumnProps: {
    // 表格操作栏 el-table-column 的其他props   默认值为 `{}`
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['clickAction', 'clickActionConfirmCancel'])

const formRefs = inject(TableFormRefInjectionKey as symbol) as Ref<
  Record<string | number, TableFormRefRow[]>
>

const getSubButtons = (row: RecordType, index: number) => {
  const data = props.buttons?.filter((item) => {
    if (isFunction(item.show)) {
      const tempFunction = item.show as (
        row: RecordType,
        index: number,
        button: ActionBarButtonsRow
      ) => boolean | Ref<boolean> | ComputedRef<boolean>
      const isShow = tempFunction(row, index, item)
      return unref(isShow) !== false
    }
    return unref(item.show) !== false
  })
  // 获取'更多'之前的按钮组
  const preButtons = data.slice(0, props.showNumber)
  // 获取'更多'之后的按钮组
  const nextButtons = data.slice(props.showNumber)
  //  显示更多
  const showMore = data.length > props.showNumber
  return {
    showMore,
    preButtons,
    nextButtons
  }
}

// 渲染
const render = (
  row: RecordType,
  buttonRow: ActionBarButtonsRow,
  index: number,
  rest: RecordType
): VNode => {
  if (props.type === 'icon') {
    return h(
      ElTooltip,
      { placement: 'top', content: unref(buttonRow.text) as string, ...buttonRow.tooltipProps },
      () =>
        withDirectives(
          h(
            ElIcon,
            {
              size: 16,
              ...buttonRow.props,
              onClick: (event: MouseEvent) => handleClickAction(row, buttonRow, index, event, rest)
            },
            () => (buttonRow.icon ? h(buttonRow.icon) : '')
          ),
          buttonRow.directives || []
        )
    )
  } else {
    const Tag = props.type === 'button' ? ElButton : ElLink

    // FIXME: fix SSR click it auto scrollTo page top
    const defaultProps = props.type === 'link' ? { href: 'javaScript:;' } : {}
    return withDirectives(
      h(
        Tag as Component,
        {
          size: 'small',
          ...defaultProps,
          ...buttonRow.props,
          onClick: (event: MouseEvent) => handleClickAction(row, buttonRow, index, event, rest)
        },
        () => {
          if (isFunction(buttonRow.text)) {
            const tempFunction = buttonRow.text as (
              row: RecordType,
              index: number,
              button: ActionBarButtonsRow
            ) => string | Ref<string> | ComputedRef<string>
            const text = tempFunction(row, index, buttonRow)
            return unref(text)
          } else {
            return unref(buttonRow.text)
          }
        }
      ),
      buttonRow.directives || []
    )
  }
}

// 分发按钮事件
const handleClickAction = (
  row: RecordType,
  buttonRow: ActionBarButtonsRow,
  index: number,
  e: MouseEvent,
  rest: RecordType
) => {
  const callbackParams = {
    row,
    buttonRow,
    index,
    rowIndex: index,
    e,
    formRefs: formRefs.value[index],
    ...rest
  } as ButtonsCallBackParams

  /**
   * add self onClick event support
   * @version v0.1.8
   */
  if (buttonRow.onClick && isFunction(buttonRow.onClick)) {
    buttonRow.onClick(callbackParams)
  }

  if (buttonRow.confirm) {
    let message = t('plus.table.confirmToPerformThisOperation')
    let title = t('plus.table.prompt')
    let options: ElMessageBoxOptions | undefined = undefined
    let appContext: AppContext | undefined | null = null

    if (isPlainObject(buttonRow.confirm) && typeof buttonRow.confirm !== 'boolean') {
      const tempTitle = isFunction(buttonRow.confirm.title)
        ? (buttonRow.confirm.title as (data: ButtonsCallBackParams) => string)(callbackParams)
        : (buttonRow.confirm.title as string)

      if (tempTitle) {
        title = tempTitle
      }

      const tempMessage = isFunction(buttonRow.confirm.message)
        ? (buttonRow.confirm.message as (data: ButtonsCallBackParams) => string)(callbackParams)
        : (buttonRow.confirm.message as string)

      if (tempMessage) {
        message = tempMessage
      }

      options = buttonRow.confirm?.options
      appContext = buttonRow.confirm?.appContext
    }

    ElMessageBox.confirm(message, title, options, appContext)
      .then(() => {
        /**
         * add self onConfirm event support
         * @version v0.1.8
         */
        if (buttonRow.onConfirm && isFunction(buttonRow.onConfirm)) {
          buttonRow.onConfirm(callbackParams)
        }

        emit('clickAction', callbackParams)
      })
      .catch(() => {
        /**
         * add self onCancel event support
         * @version v0.1.8
         */
        if (buttonRow.onCancel && isFunction(buttonRow.onCancel)) {
          buttonRow.onCancel(callbackParams)
        }

        emit('clickActionConfirmCancel', callbackParams)
      })
  } else {
    emit('clickAction', callbackParams)
  }
}
</script>

<style lang="scss" scoped></style>
