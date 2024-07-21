import { computed, onMounted, ref } from 'vue'
import { responsiveMap } from '@/components/VForm/src/constant'
const cols = { xs: 24, sm: 12, md: 12, lg: 8, xl: 6, xxl: 6 }
// const allSlotsName = computed(() => Object.keys(toRaw(slots)))
const colArr = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']
function useAutoLayout() {
  const currentBreakpoint = ref ('')
  // 计算当前页面尺寸下一行中可以有几个元素
  const resultCol = computed (() => {
    let res = 1
    for (let i = 0; i < colArr.length; i++) {
      const breakpoint = colArr[i]
      currentBreakpoint.value = breakpoint
      if (screens[breakpoint] || breakpoint === 'xs') {
        res = cols[breakpoint]
        break
      }
    }
    return res
  })

  const matchHandlers = {}
  onMounted (() => {
    Object.keys (responsiveMap).forEach ((screen) => {
      const matchMediaQuery = responsiveMap[screen]
      if (!matchMediaQuery)
        return
      const listener = ({ matches }) => {
        screens[screen] = matches
      }
      const mql = window.matchMedia (matchMediaQuery)
      if (mql.addEventListener)
        mql.addEventListener ('change', listener)
      else mql.addListener (listener)

      matchHandlers[matchMediaQuery] = {
        mql,
        listener,
      }
      listener (mql)
    })
  })
  onUnmounted (() => {
    // 移除监听器
    Object.keys (responsiveMap).forEach ((screen) => {
      const matchMediaQuery = responsiveMap[screen]
      if (!matchMediaQuery)
        return
      const handler = matchHandlers[matchMediaQuery]
      if (handler && handler.mql && handler.listener) {
        if (handler.mql.removeEventListener)
          handler.mql.removeEventListener ('change', handler.listener)
        else handler.mql.removeListener (handler.listener)
      }
    })
  })

  return {
    currentBreakpoint,
    col: resultCol,
  }
}

export default useAutoLayout
