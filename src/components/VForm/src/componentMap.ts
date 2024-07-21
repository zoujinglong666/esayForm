import type { Component } from 'vue'
import {
  ElAutocomplete,
  ElCascader,
  ElCheckbox,
  ElColorPicker,
  ElDivider,
  ElInput,
  ElLink,
  ElRadio,
  ElRate,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElText,
  ElTimePicker,
  ElTimeSelect,
  ElUpload,
} from 'element-plus'
import type { ComponentType } from './types'
import DataSelect from '@/components/DataSelect/DataSelect.vue'
import DateSelect from '@/components/DatePicker/DatePicker.vue'
import TimeSelect from '@/components/TimeSelect/TimeSelect.vue'
import RadioGroup from '@/components/RadioGroup/RadioGroup.vue'
import CheckBoxGroup from '@/components/CheckBoxGroup/CheckBoxGroup.vue'
import ImageUpload from '@/components/ImageUpload/index.vue'
import InputNumber from '@/components/InputNumber/InputNumber.vue'
import DataCheckBox from '@/components/DataCheckBox/DataCheckBox.vue'
import CheckBoxButton from '@/components/CheckBoxButton/CheckBoxButton.vue'
import RadioButton from '@/components/RadioButton/RadioButton.vue'
import DataInput from '@/components/DataInput/DataInput.vue'

/**
 * Component list, register here to setting it in the form
 */
const componentMap = new Map<any | string, Component> ()

componentMap.set ('Input', ElInput)
componentMap.set ('Autocomplete', ElAutocomplete)
componentMap.set ('InputNumber', InputNumber)
componentMap.set ('Select', ElSelect)
componentMap.set ('Switch', ElSwitch)
componentMap.set ('Text', ElText)
componentMap.set ('Link', ElLink)
componentMap.set ('Radio', ElRadio)
componentMap.set ('CheckBox', ElCheckbox)
componentMap.set ('Slider', ElSlider)
componentMap.set ('TimePicker', ElTimePicker)
componentMap.set ('Cascader', ElCascader)
componentMap.set ('DateSelect', DateSelect)
componentMap.set ('TimePicker', ElTimePicker)
componentMap.set ('TimeSelect', ElTimeSelect)
componentMap.set ('Switch', ElSwitch)
componentMap.set ('Upload', ElUpload)
componentMap.set ('Slider', ElSlider)
componentMap.set ('Rate', ElRate)
componentMap.set ('Divider', ElDivider)
componentMap.set ('ColorPicker', ElColorPicker)
componentMap.set ('DataSelect', DataSelect)
componentMap.set ('TimeSelect', TimeSelect)
componentMap.set ('RadioGroup', RadioGroup)
componentMap.set ('CheckBoxGroup', CheckBoxGroup)
componentMap.set ('ImageUpload', ImageUpload)
componentMap.set ('DataCheckBox', DataCheckBox)
componentMap.set ('CheckBoxButton', CheckBoxButton)
componentMap.set ('RadioButton', RadioButton)
componentMap.set ('DataInput', DataInput)

export function add<T extends string, R extends Component>(
  compName: ComponentType | T,
  component: R,
) {
  componentMap.set (compName, component)
}

export function del<T extends string>(compName: ComponentType | T) {
  componentMap.delete (compName)
}

export { componentMap }
