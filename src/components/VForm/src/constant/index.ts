const responsiveMap = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
}
const labelWidthMap = {
  xs: '70px',
  sm: '80px',
  md: '90px',
  lg: '100px',
  xl: '110px',
  xxl: '120px',
}
const labelWidthAutoMap = {
  xs: 'auto',
  sm: 'auto',
  md: 'auto',
  lg: 'auto',
  xl: 'auto',
  xxl: 'auto',
}

const cols = { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
// const allSlotsName = computed(() => Object.keys(toRaw(slots)))
const colArr = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']

// 用来保存当前页面尺寸处于哪个尺寸区间
const screens = reactive ({
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: true,
  xxl: true,
})

export {
  responsiveMap,
  labelWidthMap,
  labelWidthAutoMap,
}
