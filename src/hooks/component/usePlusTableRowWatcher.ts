// import { Ref } from 'vue'
// import {clone} from "lodash-es";
//
// /* ====================== 类型定义 ====================== */
// type Matcher<T> =
//   | number[]
//   | Partial<T>
//   | ((row: T, index: number) => boolean)
//
// export type RowWatchFlush = 'sync' | 'post' | 'idle' | 'micro'
//
// export interface RowChangeContext<T> {
//   prop: string
//   value: any
//   row: T
//   index: number
//   setRow: (index: number, data: Partial<T>) => void
//   updateRows: (
//     matcher: Matcher<T>,
//     data: Partial<T> | ((row: T, index: number) => Partial<T>)
//   ) => void
// }
//
// export interface WatchRowOptions {
//   once?: boolean
//   priority?: number
//   flush?: RowWatchFlush
//   debug?: boolean
// }
//
// interface WatchRule<T> {
//   id: number
//   props: string[]
//   handler: (ctx: RowChangeContext<T>) => void
//   once: boolean
//   used: boolean
//   priority: number
//   flush: RowWatchFlush
//   debug: boolean
// }
//
// /* ====================== Hook ====================== */
// export function usePlusTableRowWatcher<T>(
//   plusTableRef: Ref<any>,
//   tableData: Ref<T[]>,
//   globalOpt?: { debug?: boolean }
// ) {
//   /* ---------- rule store ---------- */
//   let uid = 0
//   const rules: WatchRule<T>[] = []
//
//   /* ---------- trigger queue (Fiber) ---------- */
//   type Trigger = { prop: string; value: any; index: number }
//   const triggerQueue = new Map<string, Trigger>()
//   let flushScheduled = false
//
//   /* ---------- loop protect ---------- */
//   const triggerStack = new Set<string>()
//   const makeKey = (i: number, p: string) => `${i}:${p}`
//
//   /* ---------- row patch batching ---------- */
//   const rowPatchQueue = new Map<number, Partial<T>>()
//   let rowFlushScheduled = false
//
//   const queueSetRow = (index: number, data: Partial<T>, flushType: RowWatchFlush = 'micro') => {
//     rowPatchQueue.set(index, {
//       ...(rowPatchQueue.get(index) || {}),
//       ...data
//     })
//     if (!rowFlushScheduled) {
//       rowFlushScheduled = true
//       if (flushType === 'sync' || flushType === 'micro') {
//         Promise.resolve().then(flushRowPatches)
//       } else if (flushType === 'post') {
//         requestAnimationFrame(flushRowPatches)
//       } else if (flushType === 'idle' && typeof requestIdleCallback === 'function') {
//         requestIdleCallback(flushRowPatches)
//       } else {
//         // fallback
//         flushRowPatches()
//       }
//     }
//   }
//
//   const flushRowPatches = () => {
//     rowFlushScheduled = false
//     rowPatchQueue.forEach((patch, index) => {
//       plusTableRef.value?.setCellRow(index, patch)
//     })
//     rowPatchQueue.clear()
//   }
//
//   /* ====================== 注册 watch ====================== */
//   const watchRowChange = (
//     source: string | string[],
//     cb: (ctx: RowChangeContext<T>) => void,
//     opt: WatchRowOptions = {}
//   ) => {
//     const rule: WatchRule<T> = {
//       id: ++uid,
//       props: Array.isArray(source) ? source : [source],
//       handler: cb,
//       once: !!opt.once,
//       used: false,
//       priority: opt.priority ?? 0,
//       flush: opt.flush ?? 'post',
//       debug: !!opt.debug
//     }
//
//     rules.push(rule)
//
//     /* Vue watch 行为：返回 stop */
//     return () => {
//       const i = rules.indexOf(rule)
//       if (i > -1) rules.splice(i, 1)
//     }
//   }
//
//   /* ====================== form-change 入口 ====================== */
//   const onFormChange = ({ prop, value, index }: any) => {
//     const row = tableData.value[index]
//     if (!row) return
//
//       ;(row as any)[prop] = value
//     const key = makeKey(index, prop)
//     triggerQueue.set(key, { prop, value, index })
//
//     if (!flushScheduled) {
//       flushScheduled = true
//       Promise.resolve().then(flushTriggers)
//     }
//   }
//
//   /* ====================== Fiber flush ====================== */
//   const flushTriggers = () => {
//     flushScheduled = false
//     const triggers = Array.from(triggerQueue.values())
//     triggerQueue.clear()
//
//     // 按 flush 类型分 lane
//     runLane(triggers, 'sync')
//     Promise.resolve().then(() => runLane(triggers, 'post'))
//     if (typeof requestIdleCallback === 'function') {
//       requestIdleCallback(() => runLane(triggers, 'idle'))
//     }
//   }
//
//   const runLane = (triggers: Trigger[], lane: RowWatchFlush) => {
//     triggers.forEach((t) => runRules(t, lane))
//   }
//
//   /* ====================== 执行规则 ====================== */
//   const runRules = (trigger: Trigger, lane: RowWatchFlush) => {
//     const { prop, value, index } = trigger
//     const row = tableData.value[index]
//     if (!row) return
//
//     const key = makeKey(index, prop)
//     if (triggerStack.has(key)) return
//
//     const matched = rules
//       .filter((r) => !r.used && r.flush === lane && r.props.includes(prop))
//       .sort((a, b) => b.priority - a.priority)
//
//     if (!matched.length) return
//
//     triggerStack.add(key)
//     try {
//       matched.forEach((rule) => {
//         rule.handler({
//           prop,
//           value,
//           row,
//           index,
//           setRow: (i, data) => queueSetRow(i, data, rule.flush),
//           updateRows: (matcher, data) => {
//             plusTableRef.value?.updateRows(matcher, data)
//           }
//         })
//
//         if (rule.once) rule.used = true
//
//         if (rule.debug || globalOpt?.debug) {
//           console.log(`[RowWatch] ${prop} @${index} → rule#${rule.id} (lane:${lane})`)
//         }
//       })
//     } finally {
//       triggerStack.delete(key)
//     }
//   }
//
//   /* ====================== reset ====================== */
//   const resetWatchers = () => {
//     rules.forEach((r) => (r.used = false))
//   }
//   /* ====================== 实用方法 ====================== */
//   const getRow = (index: number): T | undefined => {
//     return tableData.value[index]
//   }
//
//   const getRows = (matcher?: Matcher<T>): T[] => {
//     if (!matcher) return tableData.value
//
//     if (typeof matcher === 'number') {
//       return tableData.value[matcher] ? [tableData.value[matcher]] : []
//     }
//
//     if (Array.isArray(matcher)) {
//       return matcher.map(i => tableData.value[i]).filter(Boolean)
//     }
//
//     if (typeof matcher === 'function') {
//       return tableData.value.filter((row, idx) => matcher(row, idx))
//     }
//
//     if (typeof matcher === 'object') {
//       return tableData.value.filter(row =>
//         Object.keys(matcher).every(k => row[k] === (matcher as any)[k])
//       )
//     }
//
//     return []
//   }
//
//   const getTableData = (): T[] => {
//     return clone(tableData.value)
//   }
//
//
//
//   /* ====================== export ====================== */
//   return {
//     watchRowChange,
//     onFormChange,
//     resetWatchers,
//     getRow,
//     getRows,
//     getTableData
//   }
// }
import { Ref, nextTick } from 'vue'
import { clone } from 'lodash-es'

/* ====================== 类型定义 ====================== */
type Matcher<T> =
  | number[]
  | Partial<T>
  | ((row: T, index: number) => boolean)

export type RowWatchFlush = 'sync' | 'post' | 'idle' | 'micro'

export interface RowChangeContext<T> {
  prop: string
  value: any
  oldValue: any
  row: T
  index: number
  diff: Partial<T>
  setRow: (index: number, data: Partial<T>) => void
  updateRows: (
    matcher: Matcher<T>,
    data: Partial<T> | ((row: T, index: number) => Partial<T>)
  ) => void
}

export interface WatchRowOptions {
  once?: boolean
  priority?: number
  flush?: RowWatchFlush
  debug?: boolean
}

interface WatchRule<T> {
  id: number
  props: string[]
  handler: (ctx: RowChangeContext<T>) => void
  once: boolean
  used: boolean
  priority: number
  flush: RowWatchFlush
  debug: boolean
}

/* ====================== Hook ====================== */
export function usePlusTableRowWatcher<T>(
  plusTableRef: Ref<any>,
  tableData: Ref<T[]>,
  globalOpt?: { debug?: boolean }
) {
  /* ---------- rule store ---------- */
  let uid = 0
  const rules: WatchRule<T>[] = []

  /* ---------- trigger queue (Fiber) ---------- */
  type Trigger = { prop: string; value: any; oldValue: any; index: number; diff?: Partial<T> }
  const triggerQueue = new Map<string, Trigger>()
  let flushScheduled = false

  /* ---------- loop protect ---------- */
  const triggerStack = new Set<string>()
  const makeKey = (i: number, p: string) => `${i}:${p}`

  /* ---------- row patch batching ---------- */
  const rowPatchQueue = new Map<number, Partial<T>>()
  let rowFlushScheduled = false

  const queueSetRow = (index: number, data: Partial<T>, flushType: RowWatchFlush = 'micro') => {
    rowPatchQueue.set(index, {
      ...(rowPatchQueue.get(index) || {}),
      ...data
    })
    if (!rowFlushScheduled) {
      rowFlushScheduled = true
      if (flushType === 'sync' || flushType === 'micro') {
        Promise.resolve().then(flushRowPatches)
      } else if (flushType === 'post') {
        requestAnimationFrame(flushRowPatches)
      } else if (flushType === 'idle' && typeof requestIdleCallback === 'function') {
        requestIdleCallback(flushRowPatches)
      } else {
        flushRowPatches()
      }
    }
  }

  const flushRowPatches = () => {
    rowFlushScheduled = false
    rowPatchQueue.forEach((patch, index) => {
      plusTableRef.value?.setCellRow(index, patch)
    })
    rowPatchQueue.clear()
  }

  /* ====================== 注册 watch ====================== */
  const watchRowChange = (
    source: string | string[],
    cb: (ctx: RowChangeContext<T>) => void,
    opt: WatchRowOptions = {}
  ) => {
    const rule: WatchRule<T> = {
      id: ++uid,
      props: Array.isArray(source) ? source : [source],
      handler: cb,
      once: !!opt.once,
      used: false,
      priority: opt.priority ?? 0,
      flush: opt.flush ?? 'post',
      debug: !!opt.debug
    }
    rules.push(rule)

    return () => {
      const i = rules.indexOf(rule)
      if (i > -1) rules.splice(i, 1)
    }
  }

  /* ====================== form-change 入口 ====================== */
  const onFormChange = ({ prop, value, index }: any) => {
    const row = unref(tableData)[index]
    if (!row) return

    const prev = row[prop]
    if (!Object.is(prev, value)) {
      row[prop] = value
    }

    const key = makeKey(index, prop)
    triggerQueue.set(key, { prop, value, oldValue: prev, index, diff: { [prop]: value } })

    if (!flushScheduled) {
      flushScheduled = true
      Promise.resolve().then(flushTriggers)
    }
  }

  /* ====================== Fiber flush ====================== */
  const flushTriggers = () => {
    flushScheduled = false
    const triggers = Array.from(triggerQueue.values())
    triggerQueue.clear()

    runLane(triggers, 'sync')
    Promise.resolve().then(() => runLane(triggers, 'post'))
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => runLane(triggers, 'idle'))
    }
  }

  const runLane = (triggers: Trigger[], lane: RowWatchFlush) => {
    triggers.forEach((t) => runRules(t, lane))
  }

  /* ====================== 执行规则 ====================== */
  const runRules = (trigger: Trigger, lane: RowWatchFlush) => {
    const { prop, value, oldValue, index, diff } = trigger
    const row = tableData.value[index]
    if (!row) return

    const key = makeKey(index, prop)
    if (triggerStack.has(key)) return

    const matched = rules
      .filter(
        (r) =>
          !r.used &&
          r.flush === lane &&
          (r.props.includes(prop) || r.props.includes('*'))
      )
      .sort((a, b) => b.priority - a.priority)

    if (!matched.length) return

    triggerStack.add(key)
    try {
      matched.forEach((rule) => {
        rule.handler({
          prop,
          value,
          oldValue,
          row,
          index,
          diff,
          setRow: (i, data) => queueSetRow(i, data, rule.flush),
          updateRows: (matcher, data) => {
            plusTableRef.value?.updateRows(matcher, data)
          }
        })

        if (rule.once) rule.used = true

        if (rule.debug || globalOpt?.debug) {
          console.log(`[RowWatch] ${prop} @${index} → rule#${rule.id} (lane:${lane})`)
        }
      })
    } finally {
      triggerStack.delete(key)
    }
  }

  /* ====================== reset ====================== */
  const resetWatchers = () => {
    rules.forEach((r) => (r.used = false))
  }

  /* ====================== 实用方法 ====================== */
  const getRow = (index: number): T | undefined => tableData.value[index]

  const getRows = (matcher?: Matcher<T>): T[] => {
    if (!matcher) return tableData.value

    if (typeof matcher === 'number') return tableData.value[matcher] ? [tableData.value[matcher]] : []
    if (Array.isArray(matcher)) return matcher.map(i => tableData.value[i]).filter(Boolean)
    if (typeof matcher === 'function') return tableData.value.filter((row, idx) => matcher(row, idx))
    if (typeof matcher === 'object') return tableData.value.filter(row =>
      Object.keys(matcher).every(k => row[k] === (matcher as any)[k])
    )

    return []
  }

  const getTableData = (): T[] => clone(tableData.value)

  return {
    watchRowChange,
    onFormChange,
    resetWatchers,
    getRow,
    getRows,
    getTableData
  }
}
