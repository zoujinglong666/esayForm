import { ElImage, ElLink, ElTag, ElProgress, ElAvatar } from 'element-plus'
import { formatDate } from '@/utils/dateUtil'
import type { TableValueType } from '@/components/PlusTable/types'
import type { Component } from 'vue'
import { formatMoney } from '@/utils'

export type DisplayComponentType = {
  /**
   * parent Component
   */
  component: Component | string
  /**
   *  parent Props
   */

  format?: (...arg: any[]) => string

  class?: string

  hasSlots?: boolean
}

export type DisplayComponentMapType = Record<
  Exclude<TableValueType & 'date-picker', undefined | '' | 'copy'>,
  DisplayComponentType
>

export const DisplayComponentMap: DisplayComponentMapType = {
  img: {
    component: ElImage,
    class: 'plus-display-item__image',
    hasSlots: true
  },
  link: {
    component: ElLink,
    class: 'plus-display-item__link',
    hasSlots: true
  },
  tag: {
    component: ElTag,
    hasSlots: true
  },
  progress: {
    component: ElProgress,
    hasSlots: true
  },
  avatar: {
    component: ElAvatar,
    hasSlots: true
  },
  'date-picker': {
    component: 'span',
    format: formatDate
  },
  money: {
    component: 'span',
    format: formatMoney
  },
  code: {
    component: 'span',
    class: 'plus-display-item__pre'
  }
}

/**
 * has component
 * @param valueType
 * @returns
 */
export const hasDisplayComponent = (valueType?: string) =>
  Object.keys(DisplayComponentMap).includes(valueType as Exclude<TableValueType, undefined>)
/**
 * get component
 * @param valueType
 * @returns
 */
export const getDisplayComponent = (valueType?: string): DisplayComponentType =>
  Reflect.get(DisplayComponentMap, valueType as string) || {}
