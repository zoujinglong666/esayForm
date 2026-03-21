<!--&lt;!&ndash;<template>&ndash;&gt;-->
<!--&lt;!&ndash;  <div>&ndash;&gt;-->
<!--&lt;!&ndash;    &lt;!&ndash; 正常页面内容 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    <button @click="printLabel">打印 50×30 标签</button>&ndash;&gt;-->

<!--&lt;!&ndash;    &lt;!&ndash; 隐藏 iframe &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    <iframe ref="printFrame" style="display:none;"></iframe>&ndash;&gt;-->
<!--&lt;!&ndash;  </div>&ndash;&gt;-->
<!--&lt;!&ndash;</template>&ndash;&gt;-->
<!--&lt;!&ndash;<script setup lang="ts">&ndash;&gt;-->

<!--&lt;!&ndash;import Code128Barcode from '@/components/Code128Barcode/index.vue'&ndash;&gt;-->
<!--&lt;!&ndash;import { createApp, h } from 'vue'&ndash;&gt;-->

<!--&lt;!&ndash;const printFrame = ref<HTMLIFrameElement>()&ndash;&gt;-->

<!--&lt;!&ndash;const printLabel = () => {&ndash;&gt;-->
<!--&lt;!&ndash;  const iframe = printFrame.value!&ndash;&gt;-->
<!--&lt;!&ndash;  const doc = iframe.contentDocument!&ndash;&gt;-->
<!--&lt;!&ndash;  const win = iframe.contentWindow!&ndash;&gt;-->

<!--&lt;!&ndash;  // 1️⃣ 清空 iframe&ndash;&gt;-->
<!--&lt;!&ndash;  doc.open()&ndash;&gt;-->
<!--&lt;!&ndash;  doc.write(`&ndash;&gt;-->
<!--&lt;!&ndash;<!DOCTYPE html>&ndash;&gt;-->
<!--&lt;!&ndash;<html>&ndash;&gt;-->
<!--&lt;!&ndash;<head>&ndash;&gt;-->
<!--&lt;!&ndash;  <meta charset="UTF-8" />&ndash;&gt;-->
<!--&lt;!&ndash;<style>&ndash;&gt;-->
<!--&lt;!&ndash;  @page {&ndash;&gt;-->
<!--&lt;!&ndash;    size: 50mm 30mm;&ndash;&gt;-->
<!--&lt;!&ndash;    margin: 0;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->

<!--&lt;!&ndash;  html, body {&ndash;&gt;-->
<!--&lt;!&ndash;    margin: 0;&ndash;&gt;-->
<!--&lt;!&ndash;    padding: 0;&ndash;&gt;-->
<!--&lt;!&ndash;    width: 50mm;&ndash;&gt;-->
<!--&lt;!&ndash;    height: 30mm;&ndash;&gt;-->
<!--&lt;!&ndash;  overflow: hidden;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->

<!--&lt;!&ndash;  body {&ndash;&gt;-->
<!--&lt;!&ndash;    display: flex;&ndash;&gt;-->
<!--&lt;!&ndash;    flex-direction: column;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->

<!--&lt;!&ndash;  canvas, svg {&ndash;&gt;-->
<!--&lt;!&ndash;    display: block;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;</style>&ndash;&gt;-->

<!--&lt;!&ndash;</head>&ndash;&gt;-->
<!--&lt;!&ndash;<body>&ndash;&gt;-->
<!--&lt;!&ndash;  <div id="app"></div>&ndash;&gt;-->
<!--&lt;!&ndash;</body>&ndash;&gt;-->
<!--&lt;!&ndash;</html>&ndash;&gt;-->
<!--&lt;!&ndash;`)&ndash;&gt;-->
<!--&lt;!&ndash;  doc.close()&ndash;&gt;-->

<!--&lt;!&ndash;  // 2️⃣ 在 iframe 里 mount Vue&ndash;&gt;-->
<!--&lt;!&ndash;  const mountEl = doc.getElementById('app')!&ndash;&gt;-->

<!--&lt;!&ndash;  const app = createApp({&ndash;&gt;-->
<!--&lt;!&ndash;    render() {&ndash;&gt;-->
<!--&lt;!&ndash;      return h('div', {&ndash;&gt;-->
<!--&lt;!&ndash;        style: {&ndash;&gt;-->
<!--&lt;!&ndash;          width: '50mm',&ndash;&gt;-->
<!--&lt;!&ndash;          height: '30mm',&ndash;&gt;-->
<!--&lt;!&ndash;          boxSizing: 'border-box',&ndash;&gt;-->
<!--&lt;!&ndash;          padding: '1mm', // 🔥 很多热敏机需要&ndash;&gt;-->
<!--&lt;!&ndash;          fontFamily: 'monospace'&ndash;&gt;-->
<!--&lt;!&ndash;        }&ndash;&gt;-->
<!--&lt;!&ndash;      }, [&ndash;&gt;-->
<!--&lt;!&ndash;        h(Code128Barcode, {&ndash;&gt;-->
<!--&lt;!&ndash;          mode: 'print',&ndash;&gt;-->
<!--&lt;!&ndash;          value: 'CDSN0797XYZ' ,&ndash;&gt;-->
<!--&lt;!&ndash;          width: 1,&ndash;&gt;-->
<!--&lt;!&ndash;          height: 30,&ndash;&gt;-->
<!--&lt;!&ndash;          fontSize:8,&ndash;&gt;-->
<!--&lt;!&ndash;          displayValue: true,&ndash;&gt;-->
<!--&lt;!&ndash;          type:'svg',&ndash;&gt;-->
<!--&lt;!&ndash;          style: {&ndash;&gt;-->
<!--&lt;!&ndash;            display: 'block',&ndash;&gt;-->
<!--&lt;!&ndash;            textAlign: 'center',&ndash;&gt;-->
<!--&lt;!&ndash;            margin: '0',&ndash;&gt;-->
<!--&lt;!&ndash;            padding: '0'&ndash;&gt;-->
<!--&lt;!&ndash;          }&ndash;&gt;-->
<!--&lt;!&ndash;        }),&ndash;&gt;-->
<!--&lt;!&ndash;        h('div', {&ndash;&gt;-->
<!--&lt;!&ndash;          style: {&ndash;&gt;-->
<!--&lt;!&ndash;            textAlign: 'left',&ndash;&gt;-->
<!--&lt;!&ndash;            marginLeft: '10px',&ndash;&gt;-->
<!--&lt;!&ndash;            fontSize: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            lineHeight: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            padding: '0'&ndash;&gt;-->
<!--&lt;!&ndash;          }&ndash;&gt;-->
<!--&lt;!&ndash;        }, 'SKU：1234567890'),&ndash;&gt;-->
<!--&lt;!&ndash;        h('div', {&ndash;&gt;-->
<!--&lt;!&ndash;          style: {&ndash;&gt;-->
<!--&lt;!&ndash;            textAlign: 'left',&ndash;&gt;-->
<!--&lt;!&ndash;            marginLeft: '10px',&ndash;&gt;-->
<!--&lt;!&ndash;            fontSize: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            lineHeight: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            padding: '0'&ndash;&gt;-->
<!--&lt;!&ndash;          }&ndash;&gt;-->
<!--&lt;!&ndash;        }, 'SKU：1234567890') ,&ndash;&gt;-->
<!--&lt;!&ndash;        h('div', {&ndash;&gt;-->
<!--&lt;!&ndash;          style: {&ndash;&gt;-->
<!--&lt;!&ndash;            textAlign: 'left',&ndash;&gt;-->
<!--&lt;!&ndash;            marginLeft: '10px',&ndash;&gt;-->
<!--&lt;!&ndash;            fontSize: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            lineHeight: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            padding: '0'&ndash;&gt;-->
<!--&lt;!&ndash;          }&ndash;&gt;-->
<!--&lt;!&ndash;        }, 'SKU：1234567890') ,&ndash;&gt;-->
<!--&lt;!&ndash;        h('div', {&ndash;&gt;-->
<!--&lt;!&ndash;          style: {&ndash;&gt;-->
<!--&lt;!&ndash;            textAlign: 'left',&ndash;&gt;-->
<!--&lt;!&ndash;            marginLeft: '10px',&ndash;&gt;-->
<!--&lt;!&ndash;            fontSize: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            lineHeight: '8px',&ndash;&gt;-->
<!--&lt;!&ndash;            padding: '0'&ndash;&gt;-->
<!--&lt;!&ndash;          }&ndash;&gt;-->
<!--&lt;!&ndash;        }, 'SKU：1234567890')&ndash;&gt;-->


<!--&lt;!&ndash;      ])&ndash;&gt;-->
<!--&lt;!&ndash;    }&ndash;&gt;-->
<!--&lt;!&ndash;  })&ndash;&gt;-->

<!--&lt;!&ndash;  app.mount(mountEl)&ndash;&gt;-->

<!--&lt;!&ndash;  // 3️⃣ 等渲染完成再打印（非常重要）&ndash;&gt;-->
<!--&lt;!&ndash;  requestAnimationFrame(() => {&ndash;&gt;-->
<!--&lt;!&ndash;    win.focus()&ndash;&gt;-->
<!--&lt;!&ndash;    win.print()&ndash;&gt;-->
<!--&lt;!&ndash;    app.unmount()&ndash;&gt;-->
<!--&lt;!&ndash;  })&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;</script>&ndash;&gt;-->
<!--<script setup lang="ts">-->
<!--import { ref } from 'vue'-->
<!--import { createApp, h } from 'vue'-->
<!--import Code128Barcode from '@/components/Code128Barcode/index.vue'-->

<!--const printFrame = ref<HTMLIFrameElement>()-->

<!--const PRINT_CONFIG = {-->
<!--  page: { widthMM: 50, heightMM: 30 },-->
<!--  offset: { xMM: 2, yMM: 0 } // 👈 解决左边缺失-->
<!--}-->

<!--// 模拟要打印的数据-->
<!--const printList = [-->
<!--  { code: 'CDSN0797XYZ', sku: 'SKU-001' },-->
<!--  { code: 'CDSN0798XYZ', sku: 'SKU-002' },-->
<!--  { code: 'CDSN0799XYZ', sku: 'SKU-003' }-->
<!--]-->

<!--const printBatch = () => {-->
<!--  const iframe = printFrame.value!-->
<!--  const doc = iframe.contentDocument!-->
<!--  const win = iframe.contentWindow!-->

<!--  doc.open()-->
<!--  doc.write(`-->
<!--<!DOCTYPE html>-->
<!--<html>-->
<!--<head>-->
<!--<meta charset="UTF-8" />-->
<!--<style>-->
<!--@page {-->
<!--  size: ${PRINT_CONFIG.page.widthMM}mm ${PRINT_CONFIG.page.heightMM}mm;-->
<!--  margin: 0;-->
<!--}-->

<!--html, body {-->
<!--  margin: 0;-->
<!--  padding: 0;-->
<!--}-->

<!--body {-->
<!--  width: ${PRINT_CONFIG.page.widthMM}mm;-->
<!--}-->

<!--.label {-->
<!--  width: ${PRINT_CONFIG.page.widthMM}mm;-->
<!--  height: ${PRINT_CONFIG.page.heightMM}mm;-->
<!--  box-sizing: border-box;-->

<!--  /* 🔥 打印机补偿 */-->
<!--  padding-left: ${PRINT_CONFIG.offset.xMM}mm;-->
<!--  padding-top: ${PRINT_CONFIG.offset.yMM}mm;-->

<!--  page-break-after: always;-->
<!--  font-family: monospace;-->
<!--}-->
<!--</style>-->
<!--</head>-->
<!--<body>-->
<!--  <div id="app"></div>-->
<!--</body>-->
<!--</html>-->
<!--`)-->
<!--  doc.close()-->

<!--  const mountEl = doc.getElementById('app')!-->

<!--  const app = createApp({-->
<!--    render() {-->
<!--      return h('div', {},-->
<!--        printList.map(item =>-->
<!--          h('div', { class: 'label' }, [-->
<!--            h(Code128Barcode, {-->
<!--              mode: 'print',-->
<!--              type: 'svg',-->
<!--              value: item.code,-->
<!--              width: 1,-->
<!--              height: 28,-->
<!--              fontSize: 8,-->
<!--              displayValue: true-->
<!--            }),-->
<!--            h('div', {-->
<!--              style: {-->
<!--                fontSize: '8px',-->
<!--                lineHeight: '10px'-->
<!--              }-->
<!--            }, item.sku)-->
<!--          ])-->
<!--        )-->
<!--      )-->
<!--    }-->
<!--  })-->

<!--  app.mount(mountEl)-->

<!--  // 等 SVG & DOM 完成-->
<!--  requestAnimationFrame(() => {-->
<!--    win.focus()-->
<!--    win.print()-->
<!--    app.unmount()-->
<!--  })-->
<!--}-->
<!--</script>-->
<!--<style scoped>-->

<!--</style>-->
<!--<template>-->
<!--  <button @click="printBatch">批量打印（50×30）</button>-->
<!--  <iframe ref="printFrame" style="display:none;"></iframe>-->
<!--</template>-->
<template>
  <div>
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>
    <div v-else class="preview-wrapper">
      <LabelRender
        v-for="item in printList"
        :key="item.code"
        :data="item"
        mode="screen"
        :template="TEMPLATE"
      />
    </div>
    <button @click="printBatch">打印</button>
  </div>
</template>

<script setup lang="ts">
import { createApp, h, nextTick, onMounted, ref } from 'vue'  // ✅ 添加导入
import LabelRender from "@/components/Code128Barcode/LabelRender.vue";

const loading = ref(true)

const TEMPLATE = {
  widthMM: 50,
  heightMM: 30,
  offsetXMM: 2,
  offsetYMM: 0,
  barcode: {
    moduleWidth: 1,
    barHeight: 28,
    fontSize: 8
  }
}

const printList = [
  { code: 'CDSN0797XYZ', sku: 'SKU-001' },
  { code: 'CDSN0798XYZ', sku: 'SKU-002' }
]

// 组件挂载后确保所有依赖加载完成
onMounted(async () => {
  // 等待下一帧确保组件完全渲染
  await nextTick()
  // 额外延迟确保所有异步操作完成
  setTimeout(() => {
    loading.value = false
  }, 100)
})

const printBatch = async () => {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument!
  const win = iframe.contentWindow!

  // 1. 先准备完整的 HTML 结构（包含组件的 CSS）
  doc.open()
  doc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@page { size: 50mm 30mm; margin: 0; }
html, body { margin: 0; padding: 0; }
.label {
  page-break-after: always;
  width: 50mm;
  height: 30mm;
  box-sizing: border-box;
}
/* 这里需要注入 LabelRender 组件的样式 */
</style>
</head>
<body>
<div id="app"></div>
</body>
</html>
  `)
  doc.close()

  // 2. 在 iframe 中动态创建并注册组件
  const mountEl = doc.getElementById('app')!

  // ✅ 纯 Vue 3 组合式写法
  const app = createApp({
    setup() {
      return () => h('div', {}, printList.map(item =>
        h(LabelRender, {
          data: item,
          mode: 'print',
          template: TEMPLATE
        })
      ))
    }
  })

  app.mount(mountEl)

  // 3. 等待 Vue 渲染完成 + 图片/字体加载
  await nextTick()

  // 如果有条形码图片，需要额外等待
  await new Promise(resolve => {
    const images = doc.querySelectorAll('img')
    if (images.length === 0) return resolve(null)

    let loaded = 0
    images.forEach(img => {
      if (img.complete) {
        loaded++
      } else {
        img.onload = () => {
          loaded++
          if (loaded === images.length) resolve(null)
        }
        img.onerror = () => {
          loaded++
          if (loaded === images.length) resolve(null)
        }
      }
    })
    if (loaded === images.length) resolve(null)
  })

  // 4. 触发打印
  win.focus()
  win.print()

  // 5. 清理
  setTimeout(() => {
    app.unmount()
    document.body.removeChild(iframe)
  }, 100)
}
</script>
