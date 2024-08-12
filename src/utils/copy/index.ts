
import {useMessage} from "@/hooks/web/useMessage.ts";
const message = useMessage()

const copyText = (text: string) => {
  return new Promise((resolve) => {
    if (navigator.clipboard?.writeText) {
      return resolve(navigator.clipboard.writeText(text))
    }
    // 创建输入框
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    // 隐藏此输入框
    textarea.style.position = 'absolute'
    textarea.style.clip = 'rect(0 0 0 0)'
    // 赋值
    textarea.value = text
    // 选中
    textarea.select()
    // 复制
    document.execCommand('copy', true)
    textarea.remove()
    message.success('复制成功')
    return resolve(true)
  })
}

export { copyText }
