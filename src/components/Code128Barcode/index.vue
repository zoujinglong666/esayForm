<template>
    <canvas
      v-if="type === 'canvas'"
      ref="barcodeCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      style="display:block"
    />
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      :width="canvasWidth"
      :height="canvasHeight"
      style="display:block"
      v-html="svgContent"
    />

</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

/* ================= props ================= */
// labelTemplates.ts
export interface LabelTemplate {
  name: string
  widthMM: number
  heightMM: number
  dpi: number
  barcode: {
    moduleWidth: number
    barHeight: number
    margin: number
    fontSize: number
  }
}


const props = defineProps({
  value: { type: String, required: true },
  type: { type: String as () => 'canvas' | 'svg', default: 'canvas' },
  width: { type: Number, default: 2 },   // module width
  height: { type: Number, default: 100 },
  displayValue: { type: Boolean, default: true },
  fontSize: { type: Number, default: 14 },
  margin: { type: Number, default: 10 },
  mode: {
    type: String as () => 'screen' | 'print',
    default: 'screen'
  }
})

/* ================= refs ================= */
const px = (v: number) => Math.round(v) + 0.5

const barcodeCanvas = ref<HTMLCanvasElement | null>(null)
const svgContent = ref('')

/* ================= Code128 encoding table =================
   index = symbol value (0~106)
   string = 11 modules (1 = bar, 0 = space)
   source: ISO/IEC 15417
=========================================================== */

const CODE128_PATTERNS: string[] = [
  '11011001100','11001101100','11001100110','10010011000','10010001100',
  '10001001100','10011001000','10011000100','10001100100','11001001000',
  '11001000100','11000100100','10110011100','10011011100','10011001110',
  '10111001100','10011101100','10011100110','11001110010','11001011100',
  '11001001110','11011100100','11001110100','11101101110','11101001100',
  '11100101100','11100100110','11101100100','11100110100','11100110010',
  '11011011000','11011000110','11000110110','10100011000','10001011000',
  '10001000110','10110001000','10001101000','10001100010','11010001000',
  '11000101000','11000100010','10110111000','10110001110','10001101110',
  '10111011000','10111000110','10001110110','11101110110','11010001110',
  '11000101110','11011101000','11011100010','11011101110','11101011000',
  '11101000110','11100010110','11101101000','11101100010','11100011010',
  '11101111010','11001000010','11110001010','10100110000','10100001100',
  '10010110000','10010000110','10000101100','10000100110','10110010000',
  '10110000100','10011010000','10011000010','10000110100','10000110010',
  '11000010010','11001010000','11110111010','11000010100','10001111010',
  '10100111100','10010111100','10010011110','10111100100','10011110100',
  '10011110010','11110100100','11110010100','11110010010','11011011110',
  '11011110110','11110110110','10101111000','10100011110','10001011110',
  '10111101000','10111100010','11110101000','11110100010','10111011110',
  '10111101110','11101011110','11110101110','11010000100','11010010000',
  '11010011100','1100011101011' // 106 STOP (13 modules)
]

/* ================= constants ================= */

const START_A = 103
const START_B = 104
const START_C = 105
const CODE_A = 101
const CODE_B = 100
const CODE_C = 99
const STOP = 106

/* ================= utilities ================= */

const isNumeric = (s: string) => /^\d+$/.test(s)
const hasLowerCase = (s: string) => /[a-z]/.test(s)
const hasControlChar = (s: string) =>
  [...s].some(c => c.charCodeAt(0) < 32)

/* ================= encoding ================= */

function chooseStartSet(value: string) {
  if (isNumeric(value) && value.length % 2 === 0) return 'C'
  if (hasControlChar(value)) return 'A'
  return 'B'
}

function encodeToSymbols(value: string): number[] {
  if (!value) return []

  let set = chooseStartSet(value)
  const symbols: number[] = []

  symbols.push(set === 'A' ? START_A : set === 'B' ? START_B : START_C)

  let i = 0
  while (i < value.length) {
    if (set === 'C') {
      if (i + 1 < value.length && /\d\d/.test(value.slice(i, i + 2))) {
        symbols.push(parseInt(value.slice(i, i + 2), 10))
        i += 2
        continue
      } else {
        set = 'B'
        symbols.push(CODE_B)
        continue
      }
    }

    const code = value.charCodeAt(i)

    if (set === 'B') {
      if (code >= 32 && code <= 127) {
        symbols.push(code - 32)
      } else {
        console.warn('Illegal character:', value[i])
      }
    }

    if (set === 'A') {
      if (code <= 95) {
        symbols.push(code)
      } else {
        console.warn('Illegal character:', value[i])
      }
    }

    i++
  }

  // checksum
  let checksum = symbols[0]
  for (let i = 1; i < symbols.length; i++) {
    checksum += symbols[i] * i
  }
  checksum %= 103

  symbols.push(checksum, STOP)
  return symbols
}

/* ================= rendering ================= */

function toNumber(val: unknown, fallback = 0): number {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

const moduleWidth = computed(() => toNumber(props.width, 2))
const barHeight   = computed(() => toNumber(props.height, 100))
const fontSize    = computed(() => toNumber(props.fontSize, 14))
const margin      = computed(() => toNumber(props.margin, 10))


const encodedPatterns = computed(() => {
  const symbols = encodeToSymbols(<string>props.value)
  return symbols.map(v => CODE128_PATTERNS[v])
})

const totalModules = computed(() =>
  encodedPatterns.value.reduce((s, p) => s + p.length, 0)
)

const canvasWidth = computed(() =>
  totalModules.value * moduleWidth.value + margin.value * 2
)

const canvasHeight = computed(() => {
  return (
    barHeight.value +
    (props.displayValue ? fontSize.value : 0) +
    margin.value * 2
  )
})

const totalHeight = computed(() => {
  return (
    barHeight.value +
    (props.displayValue ? fontSize.value : 0) +
    margin.value * 2
  )
})

function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  mode: 'screen' | 'print'
) {
  const dpr =
    mode === 'print'
      ? 1
      : window.devicePixelRatio || 1

  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.imageSmoothingEnabled = false

  return ctx
}

function drawCanvas() {
  const canvas = barcodeCanvas.value
  if (!canvas) return

  const totalWidth =
    totalModules.value * moduleWidth.value + margin.value * 2

  const totalHeight =
    barHeight.value +
    (props.displayValue ? fontSize.value + 6 : 0) +
    margin.value * 2

  const ctx = setupCanvas(
    canvas,
    totalWidth,
    totalHeight,
    props.mode
  )

  ctx.clearRect(0, 0, totalWidth, totalHeight)
  ctx.fillStyle = '#000'

  let x = margin.value

  for (const pattern of encodedPatterns.value) {
    for (const bit of pattern) {
      if (bit === '1') {
        ctx.fillRect(
          Math.round(x),
          margin.value,
          moduleWidth.value,
          barHeight.value
        )
      }
      x += moduleWidth.value
    }
  }

  if (props.displayValue) {
    ctx.font = `${fontSize.value}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    const textY =
      margin.value +
      barHeight.value +
      fontSize.value   // 👈 字体只占 fontSize，不留尾巴

    ctx.fillText(
      props.value,
      totalWidth / 2,
      textY
    )
  }

}



function buildSVG() {
  let x = margin.value
  let rects = ''

  for (const pattern of encodedPatterns.value) {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        rects += `<rect x="${x}" y="${margin.value}" width="${moduleWidth.value}" height="${barHeight.value}" fill="black"/>`
      }
      x += moduleWidth.value
    }
  }

  if (props.displayValue) {
    rects += `
    <text
      x="${canvasWidth.value / 2}"
      y="${margin.value + barHeight.value + fontSize.value}"
      font-family="monospace"
      font-size="${fontSize.value}"
      dominant-baseline="alphabetic"
      text-anchor="middle"
    >${props.value}</text>
  `
  }


  svgContent.value = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="${canvasWidth.value}"
      height="${canvasHeight.value}">
      ${rects}
    </svg>
  `
}

/* ================= lifecycle ================= */

const redraw = () => {
  props.type === 'canvas' ? drawCanvas() : buildSVG()
}

onMounted(redraw)
watch(() => [props.value, props.width, props.height], redraw)
</script>
