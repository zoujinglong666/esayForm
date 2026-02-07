import { TableColumnCtx } from 'element-plus'
import { h, VNode } from 'vue'
// const { getSummaries } = useTableSummary(
//   [], // 不需要列汇总
//   '',
//   h(
//     'div',
//     {
//       style: {
//         color: '#E6A23C',
//         display: 'block',
//         width: '100%'
//       }
//     },
//     `总计 ${5} 元，共 ${5} 条记录`
//   ),
//   true // 启用整行显示模式
// )
interface SummaryMethodProps<T = any> {
  columns: TableColumnCtx<T>[]
  data: T[]
}

export interface ITotalColumns {
  column: string
  formatter?: (value: number) => any
  unit?: string // 单位
  defaultValue?: number | string // 默认值
}

const setTotalValue = (
  value: number | null | undefined,
  defaultValue: number | string | undefined
) => {
  return value ?? defaultValue ?? 0
}
// 通用 reduce 方法：传入数据和字段 key，返回数值总和
export function reduceTotal<T extends Record<string, any>>(data: T[], key: keyof T): number {
  return data.reduce((sum, item) => {
    const val = Number(item[key])
    return Number.isNaN(val) ? sum : sum + val
  }, 0)
}

function useTableSummary(
  totalColumns?: ITotalColumns[] | string[],
  commonUnit?: string,
  totalText?: string | VNode,
  isFullRowSummary = false // 新增参数：是否整行显示汇总
) {
  const getSummaries = (param: SummaryMethodProps) => {
    const { columns, data } = param
    const sums: (string | VNode)[] = []

    // 整行显示模式：只显示第一列，其他列留空
    if (isFullRowSummary && totalText) {
      sums[0] = h(
        'div',
        {
          class: 'el-table__summary-title table-summary-full-row',
          style: {
            display: 'flex',
            width: '100%',

            textAlign: 'center'
          }
        },
        [totalText]
      )

      // 填充空单元格（ElementPlus要求返回数组长度等于列数）
      for (let i = 1; i < columns.length; i++) {
        sums[i] = ''
      }
      return sums
    }

    // 原有逻辑
    columns.forEach((column, index) => {
      if (index === 0) {
        sums[index] = h('div', { class: 'el-table__summary-title' }, [totalText || '合计'])
        return
      }
      const totalColumn = Array.isArray(totalColumns)
        ? (totalColumns as ITotalColumns[]).find((tc) => tc.column === column.property)
        : undefined

      if (totalColumn) {
        const values = data.map((item) => Number(item[column.property]))
        const total = values.reduce((prev, curr) => {
          return Number.isNaN(curr) ? prev : prev + curr
        }, 0)

        const formattedTotal = totalColumn.formatter
          ? totalColumn.formatter(total)
          : setTotalValue(total, totalColumn?.defaultValue)
        sums[index] = `${formattedTotal}${totalColumn.unit || ''}`
      } else if (
        Array.isArray(totalColumns) &&
        (totalColumns as string[]).includes(column.property)
      ) {
        const values = data.map((item) => Number(item[column.property]))
        const total = values.reduce((prev, curr) => {
          return Number.isNaN(curr) ? prev : prev + curr
        }, 0)
        sums[index] = `${total.toString()}${commonUnit || ''}`
      } else {
        sums[index] = ''
      }
    })
    return sums
  }

  return {
    getSummaries,
    reduceTotal
  }
}

export default useTableSummary
