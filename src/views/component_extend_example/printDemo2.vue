<!--<template>-->
<!--  <div>-->
<!--    &lt;!&ndash; 正常页面内容 &ndash;&gt;-->
<!--    <button @click="printLabel">打印 50×30 标签</button>-->

<!--    &lt;!&ndash; 隐藏 iframe &ndash;&gt;-->
<!--    <iframe ref="printFrame" style="display:none;"></iframe>-->
<!--  </div>-->
<!--</template>-->
<!--<script setup lang="ts">-->

<!--import Code128Barcode from '@/components/Code128Barcode/index.vue'-->
<!--import { createApp, h } from 'vue'-->

<!--const printFrame = ref<HTMLIFrameElement>()-->

<!--const printLabel = () => {-->
<!--  const iframe = printFrame.value!-->
<!--  const doc = iframe.contentDocument!-->
<!--  const win = iframe.contentWindow!-->

<!--  // 1️⃣ 清空 iframe-->
<!--  doc.open()-->
<!--  doc.write(`-->
<!--<!DOCTYPE html>-->
<!--<html>-->
<!--<head>-->
<!--  <meta charset="UTF-8" />-->
<!--<style>-->
<!--  @page {-->
<!--    size: 50mm 30mm;-->
<!--    margin: 0;-->
<!--  }-->

<!--  html, body {-->
<!--    margin: 0;-->
<!--    padding: 0;-->
<!--    width: 50mm;-->
<!--    height: 30mm;-->
<!--  overflow: hidden;-->
<!--  }-->

<!--  body {-->
<!--    display: flex;-->
<!--    flex-direction: column;-->
<!--  }-->

<!--  canvas, svg {-->
<!--    display: block;-->
<!--  }-->
<!--</style>-->

<!--</head>-->
<!--<body>-->
<!--  <div id="app"></div>-->
<!--</body>-->
<!--</html>-->
<!--`)-->
<!--  doc.close()-->

<!--  // 2️⃣ 在 iframe 里 mount Vue-->
<!--  const mountEl = doc.getElementById('app')!-->

<!--  const app = createApp({-->
<!--    render() {-->
<!--      return h('div', {-->
<!--        style: {-->
<!--          width: '50mm',-->
<!--          height: '30mm',-->
<!--          boxSizing: 'border-box',-->
<!--          padding: '1mm', // 🔥 很多热敏机需要-->
<!--          fontFamily: 'monospace'-->
<!--        }-->
<!--      }, [-->
<!--        h(Code128Barcode, {-->
<!--          mode: 'print',-->
<!--          value: 'CDSN0797XYZ' ,-->
<!--          width: 1,-->
<!--          height: 30,-->
<!--          fontSize:8,-->
<!--          displayValue: true,-->
<!--          type:'svg',-->
<!--          style: {-->
<!--            display: 'block',-->
<!--            textAlign: 'center',-->
<!--            margin: '0',-->
<!--            padding: '0'-->
<!--          }-->
<!--        }),-->
<!--        h('div', {-->
<!--          style: {-->
<!--            textAlign: 'left',-->
<!--            marginLeft: '10px',-->
<!--            fontSize: '8px',-->
<!--            lineHeight: '8px',-->
<!--            padding: '0'-->
<!--          }-->
<!--        }, 'SKU：1234567890'),-->
<!--        h('div', {-->
<!--          style: {-->
<!--            textAlign: 'left',-->
<!--            marginLeft: '10px',-->
<!--            fontSize: '8px',-->
<!--            lineHeight: '8px',-->
<!--            padding: '0'-->
<!--          }-->
<!--        }, 'SKU：1234567890') ,-->
<!--        h('div', {-->
<!--          style: {-->
<!--            textAlign: 'left',-->
<!--            marginLeft: '10px',-->
<!--            fontSize: '8px',-->
<!--            lineHeight: '8px',-->
<!--            padding: '0'-->
<!--          }-->
<!--        }, 'SKU：1234567890') ,-->
<!--        h('div', {-->
<!--          style: {-->
<!--            textAlign: 'left',-->
<!--            marginLeft: '10px',-->
<!--            fontSize: '8px',-->
<!--            lineHeight: '8px',-->
<!--            padding: '0'-->
<!--          }-->
<!--        }, 'SKU：1234567890')-->


<!--      ])-->
<!--    }-->
<!--  })-->

<!--  app.mount(mountEl)-->

<!--  // 3️⃣ 等渲染完成再打印（非常重要）-->
<!--  requestAnimationFrame(() => {-->
<!--    win.focus()-->
<!--    win.print()-->
<!--    app.unmount()-->
<!--  })-->
<!--}-->

<!--</script>-->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { createApp, h } from 'vue'
import Code128Barcode from '@/components/Code128Barcode/index.vue'

const loading = ref(true)
const printFrame = ref<HTMLIFrameElement>()

const PRINT_CONFIG = {
  page: { widthMM: 50, heightMM: 30 },
  offset: { xMM: 2, yMM: 0 } // 👈 解决左边缺失
}

const printList = [
  { code: 'CDSN0797XYZ', sku: 'SKU-001' },
  { code: 'CDSN0798XYZ', sku: 'SKU-002' },
  { code: 'CDSN0799XYZ', sku: 'SKU-003' }
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

const printBatch = () => {
  const iframe = printFrame.value!
  const doc = iframe.contentDocument!
  const win = iframe.contentWindow!

  doc.open()
  doc.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@page {
  size: ${PRINT_CONFIG.page.widthMM}mm ${PRINT_CONFIG.page.heightMM}mm;
  margin: 0;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  width: ${PRINT_CONFIG.page.widthMM}mm;
}

.label {
  width: ${PRINT_CONFIG.page.widthMM}mm;
  height: ${PRINT_CONFIG.page.heightMM}mm;
  box-sizing: border-box;

  /* 🔥 打印机补偿 */
  padding-left: ${PRINT_CONFIG.offset.xMM}mm;
  padding-top: ${PRINT_CONFIG.offset.yMM}mm;

  page-break-after: always;
  font-family: monospace;
}
</style>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`)
  doc.close()

  const mountEl = doc.getElementById('app')!

  const app = createApp({
    render() {
      return h('div', {},
        printList.map(item =>
          h('div', { class: 'label' }, [
            h(Code128Barcode, {
              mode: 'print',
              type: 'svg',
              value: item.code,
              width: 1,
              height: 28,
              fontSize: 8,
              displayValue: true
            }),
            h('div', {
              style: {
                fontSize: '8px',
                lineHeight: '10px'
              }
            }, item.sku)
          ])
        )
      )
    }
  })

  app.mount(mountEl)

  // 等 SVG & DOM 完成
  requestAnimationFrame(() => {
    win.focus()
    win.print()
    app.unmount()
  })
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
}

.loading-spinner {
  padding: 20px;
  border-radius: 4px;
  background-color: #f5f5f5;
}
</style>
<style scoped>

</style>
<template>
  <div>
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>
    <div v-else>
      <button @click="printBatch">批量打印（50×30）</button>
      <iframe ref="printFrame" style="display:none;"></iframe>
    </div>
  </div>
</template>

