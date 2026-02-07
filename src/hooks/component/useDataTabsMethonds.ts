import { nextTick, Ref } from 'vue'

const useDataTabsMethonds = (dataTabsRef: Ref<any>) => {
  const tabsRefresh = () => {
    nextTick(() => {
      dataTabsRef.value?.refresh?.()
    })
  }

  return {
    tabsRefresh
  }
}

export default useDataTabsMethonds
