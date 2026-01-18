<template>
  <template v-if="column.el === 'dependency'">
    <FormItem
      v-for="item in (() => {
        if (!column.columns) return [];
        if (Array.isArray(column.columns)) return column.columns;
        if (typeof column.columns === 'function') return column.columns(model);
      })()"
      :key="item.prop"
      :column="item"
    >
      <template #[item.prop]> <slot :name="item.prop"></slot> </template>
    </FormItem>
  </template>

  <el-form-item
    v-else
    :prop="column.prop"
    :label="column.label"
    :rules="column.rules"
    v-bind="column.formItemProps"
    :style="column.span ? itemStyle(column.span) : {}"
  >
    <slot :name="column.prop">
      <template v-if="readonly">
        <el-tooltip :visible="!!column.tooltip" :content="model[column.prop]" placement="top">
          <span
            :class="column.fieldProps?.ellipsis ? 'truncate' : 'break-all'"
            :style="{ color: column.fieldProps?.color ?? '#606266' }"
            @mouseover="handleMouseOver($event.target, column)"
            @mouseout="column.tooltip = false"
          >
            {{ formatText(column) }}<span>{{ column?.fieldProps?.suffix }}</span>
          </span>
        </el-tooltip>
      </template>

      <template v-else>
        <template v-if="column.el == 'select'">
          <el-select v-model="model[column.prop]" :disabled="column.disabled" v-bind="column.fieldProps">
            <el-option
              v-for="(option, i) in column.enum"
              :key="i"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            ></el-option>
          </el-select>
        </template>
        <template v-else-if="column.el == 'radio'">
          <el-radio-group v-model="model[column.prop]" :disabled="column.disabled" v-bind="column.fieldProps">
            <el-radio :value="option.value" v-for="(option, i) in column.enum" :key="i" :disabled="option.disabled">{{
                option.label
              }}</el-radio>
          </el-radio-group>
        </template>
        <template v-else-if="column.el == 'input'">
          <el-tooltip :visible="!!column.tooltip" :content="model[column.prop]" placement="top">
            <el-input
              v-model="model[column.prop]"
              :disabled="column.disabled"
              @mouseover="handleMouseOver($event.target, column)"
              @mouseout="column.tooltip = false"
              v-bind="column.fieldProps"
            >
              <template #suffix>
                {{ column.fieldProps?.suffix }}
              </template>
            </el-input>
          </el-tooltip>
        </template>

        <template v-else-if="column.el == 'text'">
          <el-tooltip :visible="!!column.tooltip" :content="model[column.prop]" placement="top">
            <span
              :class="column.fieldProps?.ellipsis ? 'truncate' : 'break-all'"
              :style="{ color: column.fieldProps?.color ?? '#606266' }"
              @mouseover="handleMouseOver($event.target, column)"
              @mouseout="column.tooltip = false"
            >
              {{ model[column.prop] ?? emptyText }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <component
            :is="`el-${column.el}`"
            v-model="model[column.prop]"
            :disabled="column.disabled"
            v-bind="column.fieldProps"
          />
        </template>
      </template>
    </slot>
    <span class="text-red-500 text-3 w-full" v-if="column.extra">{{ column.extra }}</span>
  </el-form-item>
</template>

<script setup lang="ts">
import { Ref, inject } from "vue";
const props = defineProps(["column"]);
const model: Ref<any> | undefined = inject("model");
const emptyText = inject("emptyText");
const readonly = inject("readonly");

// 处理文本过长显示tooltip
const handleMouseOver = (target: any, item: any) => {
  if (target.scrollWidth > target.clientWidth) {
    item.tooltip = true;
  }
};

const itemStyle = (span: number | string) => {
  return { "grid-column": `span ${span} / span ${span}` };
};

const formatText = column => {
  if (column.prop === undefined) return "";
  if (column.enum) {
    return column.enum.find(item => item.value == model.value[column.prop])?.label ?? model.value[column.prop];
  }
  return model.value[column.prop] ?? "--";
};
</script>

<style scoped lang="scss">
:deep(.el-form-item__content) {
  align-items: start;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.break-all {
  word-break: break-all;
}
</style>

