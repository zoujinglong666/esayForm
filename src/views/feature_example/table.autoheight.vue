<route lang="yaml">
meta:
  enabled: false
</route>

<script setup lang="ts">
defineOptions({
  name: 'FeatureExampleTableautoheight',
})

const dataList = ref([
  {
    date: '2016-05-02',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1518 弄',
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄',
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄',
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄',
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄',
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄',
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
  {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄',
  },
  {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄',
  },
  {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄',
  },
])

function filterDataVertical(arr, key, key2) {
  // 存储每列单元格是否需要合并的数组
  const spanOneArr = []
  // 记录当前需要合并的单元格位置
  let concatOne = 0

  // 遍历数组
  for (let col = 0; col < arr[0].length; col++) {
    // 第一列默认需要合并
    if (col === 0) {
      spanOneArr.push(1)
    }
    else {
      // 检查当前列的指定键值是否与上一列相同
      if (arr.every(row => row[col][key] === row[col - 1][key])) {
        // 如果指定了第二个键（key2），则继续检查该键值
        if (key2) {
          if (arr.every(row => row[col][key2] === row[col - 1][key2])) {
            // 如果相同，累加合并的数量
            spanOneArr[concatOne] += 1
            // 标记下一个位置不需要合并
            spanOneArr.push(0)
          }
          else {
            // 如果不相同，标记下一个位置需要合并，并更新合并的起始位置
            spanOneArr.push(1)
            concatOne = col
          }
        }
        else {
          // 如果没有指定第二个键，直接累加合并的数量
          spanOneArr[concatOne] += 1
          // 标记下一个位置不需要合并
          spanOneArr.push(0)
        }
      }
      else {
        // 如果指定的键值不相同，标记下一个位置需要合并，并更新合并的起始位置
        spanOneArr.push(1)
        concatOne = col
      }
    }
  }
  return spanOneArr
}
const data = [
  { theater_id: 1, province_id: 'A', city_id: 'X' },
  { theater_id: 2, province_id: 'A', city_id: 'Y' },
  { theater_id: 3, province_id: 'B', city_id: 'X' },
  { theater_id: 4, province_id: 'B', city_id: 'Y' },
  { theater_id: 5, province_id: 'B', city_id: 'Z' },
]
function filterDataVertical1(arr, key, key2) {
  // 存储每列单元格是否需要合并的数组
  const spanOneArr = []
  // 记录当前需要合并的单元格位置
  let concatOne = 0

  // 遍历数组
  for (let col = 0; col < arr[0].length; col++) {
    // 第一列默认需要合并
    if (col === 0) {
      spanOneArr.push(1)
    }
    else {
      // 检查当前列的指定键值是否与上一列相同
      if (arr.every((row, rowIndex) => row[col][key] === arr[rowIndex][col - 1][key])) {
        // 如果指定了第二个键（key2），则继续检查该键值
        if (key2) {
          if (arr.every((row, rowIndex) => row[col][key2] === arr[rowIndex][col - 1][key2])) {
            // 如果相同，累加合并的数量
            spanOneArr[concatOne] += 1
            // 标记下一个位置不需要合并
            spanOneArr.push(0)
          }
          else {
            // 如果不相同，标记下一个位置需要合并，并更新合并的起始位置
            spanOneArr.push(1)
            concatOne = col
          }
        }
        else {
          // 如果没有指定第二个键，直接累加合并的数量
          spanOneArr[concatOne] += 1
          // 标记下一个位置不需要合并
          spanOneArr.push(0)
        }
      }
      else {
        // 如果指定的键值不相同，标记下一个位置需要合并，并更新合并的起始位置
        spanOneArr.push(1)
        concatOne = col
      }
    }
  }

  return spanOneArr
}

function objSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (rowIndex === 0) {
    const result = filterDataVertical1(data, 'theater_id', 'city_id')
    console.log(result)
    const rowspan = result[columnIndex]
    console.log (rowspan, 'rowspan')
    const colspan = rowspan > 0 ? 1 : 0
    return {
      rowspan,
      colspan,
    }
  }
}
</script>

<template>
  <div class="absolute-container">
    <PageHeader title="表格高度自适应" />
    <PageMain>
      <ElTable :data="data" stripe highlight-current-row border height="100%" :span-method="objSpanMethod">
        <ElTableColumn prop="theater_id" width="50" label="theater_id" />
        <ElTableColumn prop="province_id" label="日期" width="180" />
        <ElTableColumn prop="city_id" label="地址" />
      </ElTable>
    </PageMain>
  </div>
</template>

<style lang="scss" scoped>
.absolute-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .page-header {
    margin-bottom: 0;
  }

  // 让 page-main 的高度自适应
  .page-main {
    flex: 1;
    overflow: auto;

    :deep(.main-container) {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: auto;
    }
  }
}
</style>
