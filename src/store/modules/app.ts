import { defineStore } from 'pinia'
import type {
  HeaderSetting,
  MenuSetting,
  MultiTabsSetting,
  ProjectConfig,
  TransitionSetting,
} from '@/type/index'
import type { ApiAddress, BeforeMiniState } from '@/store'

import { API_ADDRESS, PROJ_CFG_KEY } from '@/enums/cacheEnum'
import { Persistent } from '@/utils/cache/persistent'
import { deepMerge } from '@/utils'

interface AppState {
  // Page loading status
  pageLoading: boolean
  // project config
  projectConfig: ProjectConfig | null
  // When the window shrinks, remember some states, and restore these states when the window is restored
  beforeMiniInfo: BeforeMiniState
}
let timeId: TimeoutHandle
export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    pageLoading: false,
    projectConfig: Persistent.getLocal(PROJ_CFG_KEY),
    beforeMiniInfo: {},
  }),
  getters: {
    getPageLoading(state): boolean {
      return state.pageLoading
    },

    getBeforeMiniInfo(state): BeforeMiniState {
      return state.beforeMiniInfo
    },

    getProjectConfig(state): ProjectConfig {
      return state.projectConfig || ({} as ProjectConfig)
    },

    getHeaderSetting(): HeaderSetting {
      return this.getProjectConfig.headerSetting
    },
    getMenuSetting(): MenuSetting {
      return this.getProjectConfig.menuSetting
    },
    getTransitionSetting(): TransitionSetting {
      return this.getProjectConfig.transitionSetting
    },
    getMultiTabsSetting(): MultiTabsSetting {
      return this.getProjectConfig.multiTabsSetting
    },
    getApiAddress() {
      return JSON.parse(localStorage.getItem(API_ADDRESS) || '{}')
    },
  },
  actions: {
    setPageLoading(loading: boolean): void {
      this.pageLoading = loading
    },

    setBeforeMiniInfo(state: BeforeMiniState): void {
      this.beforeMiniInfo = state
    },

    setProjectConfig(config: DeepPartial<ProjectConfig>): void {
      this.projectConfig = deepMerge(this.projectConfig || {}, config) as ProjectConfig
      Persistent.setLocal(PROJ_CFG_KEY, this.projectConfig)
    },
    setMenuSetting(setting: Partial<MenuSetting>): void {
      this.projectConfig!.menuSetting = deepMerge(this.projectConfig!.menuSetting, setting)
      Persistent.setLocal(PROJ_CFG_KEY, this.projectConfig)
    },

    async resetAllState() {
      Persistent.clearAll()
    },
    async setPageLoadingAction(loading: boolean): Promise<void> {
      if (loading) {
        clearTimeout(timeId)
        // Prevent flicker
        timeId = setTimeout(() => {
          this.setPageLoading(loading)
        }, 50)
      }
      else {
        this.setPageLoading(loading)
        clearTimeout(timeId)
      }
    },
    setApiAddress(config: ApiAddress): void {
      localStorage.setItem(API_ADDRESS, JSON.stringify(config))
    },
  },
})
