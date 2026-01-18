<template>
  <template v-if="layoutType == 'Form'">
    <el-form
      ref="formRef"
      :model="model"
      class="grid gap-col-4"
      label-width="auto"
      :style="{ 'grid-template-columns': `repeat(${cols},minmax(0,1fr))` }"
      v-bind="$attrs"
    >
      <FormItem v-for="item in columns" :column="item" :key="item.prop">
        <template v-for="slot in Object.keys($slots)" #[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </FormItem>
      <el-form-item v-if="submitter">
        <slot name="options"></slot>
        <el-button type="primary" @click="handleSubmit" :loading="btnLoading" native-type="submit">确认</el-button>
        <el-button @click="resetFields">重置</el-button>
      </el-form-item>
    </el-form>
  </template>
  <template v-if="layoutType == 'ModalForm'">
    <el-dialog v-model="open" v-bind="dialogProps">
      <el-form
        ref="formRef"
        :model="model"
        label-width="auto"
        class="grid gap-col-4"
        :style="{ 'grid-template-columns': `repeat(${cols},minmax(0,1fr))` }"
        v-bind="$attrs"
      >
        <FormItem v-for="item in columns" :column="item" :key="item.prop">
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </FormItem>
      </el-form>
      <template #footer v-if="submitter">
        <el-button @click="open = false" v-if="readonly">关闭</el-button>
        <template v-else>
          <slot name="options"></slot>
          <el-button @click="open = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="btnLoading" native-type="submit">确定</el-button>
        </template>
      </template>
    </el-dialog>
  </template>
</template>

<script setup lang="ts" name="ProForm">
import { computed, ref, watch, reactive, Ref, provide, inject } from "vue";
import type { FormInstance } from "element-plus";
import FormItem from "./FormItem.vue";

type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export interface FormColumn {
  el?:
    | "input"
    | "input-number"
    | "select"
    | "select-v2"
    | "tree-select"
    | "cascader"
    | "date-picker"
    | "time-picker"
    | "time-select"
    | "switch"
    | "slider"
    | "radio"
    | "text"
    | "dependency"
    | string;
  label?: string;
  prop?: string;
  span?: number | string; //grid布局中输入框占几列  默认为1
  rules?: any[]; //el-form-item上的rules
  enum?: SelectOption[] | Ref<SelectOption[]>;
  tooltip?: boolean; //文本溢出悬浮展示  如果需要此功能columns请传递响应
  formItemProps?: { [x: string]: any }; //透传给el-form-item的属性
  fieldProps?: { [x: string]: any }; //透传给el-input等输入组件的属性
  disabled?: boolean; //禁用
  columns?: (model: any) => FormColumn[]; //el为dependency时使用 来实现动态表单
  extra?: string; //显示在el-form-item下方的提示文字
}
export interface ProFormProps {
  layoutType?: "Form" | "ModalForm"; // 普通表单和弹窗表单
  modelValue?: any; //v-model绑定的表单对象，不传将使用内置的localModel，可在你传入的onFinish函数中拿到校验成功后的表单对象
  dialogProps?: { [x: string]: any }; //传给弹窗el-dialog的属性
  open?: boolean; //弹窗表单
  cols?: number | string; //grid布局下的总列数
  columns?: FormColumn[] | Reactive<FormColumn[]>;
  emptyText?: string; //查看模式下空值占位
  onFinish?: (params) => Promise<any>; //表单校验通过点提交时会执行你传入的这个函数，
  readonly?: boolean; //查看模式
  submitter?: boolean; // 是否关闭内置提交按钮
}
const props = withDefaults(defineProps<ProFormProps>(), {
  layoutType: "Form",
  cols: 1,
  emptyText: "--",
  submitter: true,
  columns: () => []
});

const emit = defineEmits(["update:model-value", "update:open"]);

const btnLoading = ref(false);
const formRef = ref<FormInstance>();
const open = computed({
  get() {
    return props.open;
  },
  set(val) {
    emit("update:open", val);
  }
});

const localModel = ref({});
const model = computed({
  get() {
    if (props.modelValue) return props.modelValue;
    else return localModel.value;
  },
  set(val) {
    if (props.modelValue) emit("update:model-value", val);
    else localModel.value = val;
  }
});
const isReadonly = computed(() => {
  return props.readonly;
});
provide( "model",  model);
provide( "readonly", isReadonly);
provide( "emptyText", props.emptyText);

//表单整个绑定对象被替换时，清空表单验证
watch(
  () => model.value,
  () => {
    formRef.value?.clearValidate();
  }
);

/** 表单提交方法 需绑定rules*/
const validate = () => {
  return new Promise(async (resolve, reject) => {
    if (!formRef.value) return;
    await formRef.value.validate((valid, fields) => {
      if (valid) {
        // console.log("submit!", valid);
        resolve("表单验证通过,提交成功");
      } else {
        // console.log("error submit!", fields);
        reject(fields);
      }
    });
  });
};

const handleSubmit = () => {
  formRef.value.validate(async (valid, fields) => {
    if (valid) {
      btnLoading.value = true;

      const params = JSON.parse(JSON.stringify(model.value));
      props
        .onFinish(params)
        .then(success => {
          if (success) open.value = false;
        })
        .finally(() => {
          btnLoading.value = false;
        });
    } else {
    }
  });
};

/**重置表单*/
const resetFields = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};
/**清空校验*/
const clearValidate = () => {
  if (!formRef.value) return;
  formRef.value.clearValidate();
};
defineExpose({ validate, resetFields, clearValidate });
</script>

<style scoped>
.gird {
  display: grid;
}
.gap-col-4 {
  column-gap: 1rem;
}
</style>

