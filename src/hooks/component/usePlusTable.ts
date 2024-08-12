import type { Ref } from 'vue'
import { ref, shallowRef, unref } from 'vue'
import { DefaultPageInfo } from '@/components/PlusTable/constants'
import type { ActionBarButtonsRow } from '@/components/PlusTable'
import type { PageInfo } from '@/components/PlusTable/types'

/**
 * 初始化表格基本数据
 *
 */
function usePlusTable<T extends Record<string, any>[] = any>(_pageInfo?: PageInfo | Ref<PageInfo>) {
  const defaultPageInfo = unref(_pageInfo) || DefaultPageInfo
  const tableData = ref<T>([] as any)
  const pageInfo = ref<PageInfo>({ ...defaultPageInfo })
  const total = ref<number>(0)
  const loadingStatus = ref<boolean>(false)
  const buttons = shallowRef<ActionBarButtonsRow[]>([])

  return {
    tableData,
    pageInfo,
    total,
    loadingStatus,
    buttons
  }
}

export default usePlusTable
