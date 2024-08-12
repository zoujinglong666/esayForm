import type { PaginationProps } from 'element-plus'
import type { PageInfo, RecordType, Mutable } from '@/components/PlusTable/types'

export interface PlusPaginationSelfProps {
  modelValue?: PageInfo
  total?: number
  pageSizeList?: number[]
  align?: 'left' | 'right',
  background?: boolean,
}

export type PlusPaginationProps = PlusPaginationSelfProps &
  Partial<Mutable<PaginationProps>> &
  RecordType
