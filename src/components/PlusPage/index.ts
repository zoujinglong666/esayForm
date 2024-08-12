import Page from './src/index.vue'

export type PlusPageInstance = InstanceType<typeof Page>
// @ts-ignore
export type { PlusPageProps } from './src/index.vue'

export const PlusPage = Page
