# 基础数据管理 - 路由配置说明

## ✅ 已完成

已为基础数据管理示例页面配置了完整的路由系统。

## 📍 访问方式

### 方式 1：通过前端路由

在项目中，导航到以下路径即可访问：

```
/feature_example/basic-data-management
```

### 方式 2：通过文件系统路由

如果项目启用了文件系统路由模式（默认），路由会自动根据文件路径生成，访问路径相同：

```
/feature_example/basic-data-management
```

## 🔧 路由配置

### 1. 前端路由配置

文件：`src/router/modules/feature.example.ts`

```typescript
{
  path: 'basic-data-management',
  name: 'featureExampleBasicDataManagement',
  component: () => import('@/views/feature_example/basic-data-management.vue'),
  meta: {
    title: '基础数据管理',
    icon: 'mdi:database-outline',
  },
}
```

### 2. 文件系统路由配置

文件：`src/views/feature_example/basic-data-management.vue`

```vue
<route lang="yaml">
meta:
  title: 基础数据管理
  icon: mdi:database-outline
  enabled: true
</route>
```

### 3. 组件配置

文件：`src/views/feature_example/basic-data-management.vue`

```typescript
// 设置组件名称，用于缓存
defineOptions({
  name: 'BasicDataManagement',
})
```

## 🎯 在菜单中的位置

基础数据管理示例位于：

```
演示 → 功能 → 基础数据管理
```

## 🚀 快速开始

1. **启动项目**

```bash
pnpm dev
```

2. **登录系统**

3. **导航到示例页面**

   方式 1：在左侧菜单中找到 `演示 → 功能 → 基础数据管理`

   方式 2：在浏览器地址栏中输入 `/feature_example/basic-data-management`

## 📱 功能展示

示例页面包含以下 5 个使用场景：

1. **场景 1: 字典下拉选择器**
   - 订单状态选择
   - 用户状态选择

2. **场景 2: 港口搜索选择器**
   - 支持关键词搜索
   - 智能缓存

3. **场景 3: 表格列显示 label**
   - 状态标签显示
   - 颜色类型映射

4. **场景 4: 获取关联数据**
   - 港口信息查询
   - 关联国家信息

5. **场景 5: 货币选择**
   - 货币列表选择

## 🔗 相关文档

- [基础数据管理方案](/src/composables/basicData/README.md)
- [详细使用指南](/BASIC_DATA_GUIDE.md)
- [实现总结](/IMPLEMENTATION_SUMMARY.md)
- [测试页面](/test-basic-data.html)

## 💡 提示

1. **路由模式**

   项目支持两种路由模式，可在设置中切换：
   - **前端路由**：基于 `src/router/routes.ts` 配置
   - **文件系统路由**：基于文件自动生成（默认）

2. **路由配置**

   两种模式都已配置，无需手动干预：
   - 前端路由：已在 `feature.example.ts` 中添加
   - 文件系统路由：已在组件中添加 `<route>` 标签

3. **缓存支持**

   组件已设置名称 `BasicDataManagement`，支持页面缓存功能

## 🎨 图标

路由图标使用 `mdi:database-outline`，显示为数据库图标。

## 📝 注意事项

1. 如果修改了路由配置，可能需要重新启动开发服务器
2. 首次访问时会加载模拟数据，请耐心等待
3. 示例使用的是模拟 API，实际使用时需要替换为真实 API

## 🎉 完成

现在您可以通过菜单或直接访问路径来体验基础数据管理方案的所有功能！
