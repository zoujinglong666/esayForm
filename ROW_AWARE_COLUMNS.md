# Row-Aware Column Properties

This document describes the new row-aware column properties feature for PlusTable and PlusForm components.

## Overview

The row-aware column properties feature allows column definitions to access the full row data, enabling dynamic behavior based on other field values in the same row.

## Supported Properties

The following column properties now support row-aware functions:

- `fieldProps` - Dynamic field properties
- `formProps` - Dynamic form validation rules
- `formItemProps` - Dynamic form item properties
- `options` - Dynamic select/radio/checkbox options
- `disabled` - Dynamic disabled state (via fieldProps or standalone)
- `hideInForm` - Dynamic visibility in forms
- `hideInTable` - Dynamic visibility in tables
- `defaultValue` - Dynamic default values

## Function Signature

```typescript
type RowAwareFunction<T> = (
  row: RecordType,
  column: PlusColumn,
  rowIndex: number
) => T
```

### Parameters
- `row` - The complete row data object
- `column` - The column definition object
- `rowIndex` - The index of the current row

## Examples

### PlusTable Example

```typescript
const columns: PlusColumn[] = [
  {
    label: '姓名',
    prop: 'name',
    width: 150,
    // Dynamic validation based on status
    formProps: (row, column, rowIndex) => ({
      rules: row.status === '0'
        ? [{ required: true, message: '请输入姓名', trigger: 'blur' }]
        : []
    })
  },
  {
    label: '状态',
    prop: 'status',
    valueType: 'select',
    // Dynamic options based on name
    options: (row, column, rowIndex) => {
      if (row.name === 'admin') {
        return [{ label: '管理员', value: '1' }]
      }
      return [
        { label: '未解决', value: '0' },
        { label: '已解决', value: '1' }
      ]
    },
    // Dynamic disabled state
    fieldProps: (row, column, rowIndex) => ({
      disabled: row.name === 'Jerry'
    })
  },
  {
    label: '日期',
    prop: 'time',
    width: 180,
    valueType: 'date-picker',
    // Dynamic disabled based on multiple fields
    fieldProps: (row, column, rowIndex) => ({
      disabled: !row.name || row.status === '0'
    })
  },
  {
    label: '分类',
    prop: 'category',
    valueType: 'select',
    // Dynamic visibility
    hideInForm: (row, column, rowIndex) => row.name === 'Tom',
    options: [
      { label: 'A类', value: 'A' },
      { label: 'B类', value: 'B' }
    ]
  }
]
```

### PlusForm Example

```typescript
const columns: PlusColumn[] = [
  {
    label: '用户名',
    prop: 'username',
    valueType: 'input',
    // Dynamic validation based on role
    formProps: (formData, column, rowIndex) => ({
      rules: formData.role === 'admin'
        ? [{ required: true, message: '管理员必须填写用户名', trigger: 'blur' }]
        : [{ required: true, message: '请输入用户名', trigger: 'blur' }]
    }),
    // Dynamic placeholder
    fieldProps: (formData, column, rowIndex) => ({
      placeholder: formData.role === 'admin' ? '请输入管理员用户名' : '请输入用户名'
    })
  },
  {
    label: '角色',
    prop: 'role',
    valueType: 'select',
    options: [
      { label: '用户', value: 'user' },
      { label: '管理员', value: 'admin' }
    ],
    // Dynamic disabled state
    fieldProps: (formData, column, rowIndex) => ({
      disabled: formData.permissions === 'readonly'
    })
  },
  {
    label: '权限',
    prop: 'permissions',
    valueType: 'select',
    // Dynamic options based on role
    options: (formData, column, rowIndex) => {
      if (formData.role === 'admin') {
        return [
          { label: '读取', value: 'read' },
          { label: '读写', value: 'readwrite' }
        ]
      }
      return [{ label: '读取', value: 'read' }]
    }
  }
]
```

## Backward Compatibility

The new row-aware functions are fully backward compatible with existing code. The system automatically detects the function signature:

- Functions with 3 parameters `(row, column, rowIndex)` use the new signature
- Functions with 2 parameters `(value, { row, index })` use the old signature
- Objects and computed refs continue to work as before

## Utility Functions

For advanced use cases, you can use the provided utility functions:

```typescript
import {
  getFieldProps,
  getFormProps,
  getFormItemProps,
  getOptions,
  isDisabled,
  isHideInForm,
  isHideInTable,
  getDefaultValue,
  getLabel
} from '@/components/PlusTable'

// Example usage
const dynamicFieldProps = getFieldProps(column, row, rowIndex)
const dynamicOptions = await getOptions(column, row, rowIndex)
```

## Response Behavior

Since the functions receive reactive row data, any changes to the row will automatically trigger re-computation of the dynamic properties. This means:

- Changing a field value that affects another field's configuration will automatically update
- No manual refresh or re-render is needed
- The UI stays responsive and in sync with the data

## Performance Considerations

- Functions are called during render, so keep them lightweight
- Avoid heavy computations inside the functions
- Use watches or computed properties for complex logic
- Functions should be pure (same input always produces same output)

## Common Use Cases

1. **Conditional Validation** - Show validation rules based on other field values
2. **Dynamic Options** - Change dropdown/radio options based on other selections
3. **Conditional Disable** - Enable/disable fields based on complex business logic
4. **Dynamic Visibility** - Show/hide fields based on user roles or other factors
5. **Contextual Placeholders** - Change placeholder text based on current state
6. **Default Values** - Set intelligent defaults based on related fields