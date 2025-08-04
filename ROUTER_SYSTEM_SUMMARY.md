# 🎯 React Native 路由系统重构总结

## 📋 重构内容

### 1. **创建路由配置文件** (`config/routes.tsx`)
```typescript
// 类似Web端的路由配置，统一管理所有非TabBar路由
export const routeConfigs: RouteConfig[] = [
  {
    name: 'TabLayout',
    component: TabLayout,
    options: { headerShown: false },
    description: '主页面 - 包含底部Tab导航的页面组',
  },
  {
    name: 'FeatureDemo',
    component: FeatureDemoScreen,
    options: {
      headerShown: true,
      title: '功能展示',
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#ffffff',
      gestureEnabled: true,
    },
    description: '功能展示页面 - 展示应用的所有功能特性',
  },
];
```

### 2. **创建路由工具类** (`utils/navigation.ts`)
```typescript
// 提供类似Web端的导航API
export class Router {
  static navigate()    // 类似 router.push()
  static goBack()      // 类似 router.back()
  static replace()     // 类似 router.replace()
  static getCurrentRouteName()  // 获取当前路由
  static canGoBack()   // 检查是否可以返回
}

// Hook形式的路由工具
export const useAppRouter = () => ({
  push: Router.navigate,
  back: Router.goBack,
  replace: Router.replace,
  getCurrentRoute: () => ({ name: Router.getCurrentRouteName() }),
  canGoBack: Router.canGoBack,
});
```

### 3. **重构App.tsx** - 使用配置化路由
```typescript
// 从手动配置改为动态配置
<Stack.Navigator screenOptions={defaultStackOptions}>
  {routeConfigs.map((route) => (
    <Stack.Screen
      key={route.name}
      name={route.name}
      component={route.component}
      options={route.options}
    />
  ))}
</Stack.Navigator>
```

### 4. **更新组件使用方式** (`app/service.tsx`)
```typescript
// 从 React Navigation Hook 改为统一的路由工具
// 修改前：
const navigation = useNavigation<ServiceNavigationProp>();
navigation.navigate('FeatureDemo');

// 修改后：
const router = useAppRouter();
router.push('FeatureDemo');
```

## 🎨 新路由系统的优势

### 1. **类似Web端的开发体验**
- ✅ 统一的路由配置文件
- ✅ 类似 `router.push()` 的API
- ✅ 集中管理所有路由

### 2. **更好的可维护性**
- ✅ 所有路由配置在一个文件中
- ✅ 路由信息包含描述和选项
- ✅ 类型安全的路由参数

### 3. **灵活的使用方式**
- ✅ Hook形式：`useAppRouter()` 在组件中使用
- ✅ 类形式：`Router.navigate()` 在任何地方使用
- ✅ 支持路由验证和调试

### 4. **扩展性强**
- ✅ 轻松添加新路由
- ✅ 支持路由守卫（预留）
- ✅ 支持复杂的导航逻辑

## 📁 文件结构

```
├── config/
│   └── routes.tsx          # 🆕 路由配置文件
├── utils/
│   └── navigation.ts       # 🔄 路由工具类（重构）
├── types/
│   └── navigation.ts       # ✅ 路由类型定义
├── docs/
│   └── ROUTER_USAGE.md     # 🆕 使用指南
├── App.tsx                 # 🔄 使用配置化路由（重构）
└── app/service.tsx         # 🔄 使用新路由API（重构）
```

## 🚀 如何添加新路由

### 步骤1：添加类型定义
```typescript
// types/navigation.ts
export type RootStackParamList = {
  // ... 现有路由
  Settings: { userId?: string };  // 新增路由
};
```

### 步骤2：添加路由配置
```typescript
// config/routes.tsx
{
  name: 'Settings',
  component: SettingsScreen,
  options: {
    headerShown: true,
    title: '设置',
    headerStyle: { backgroundColor: '#0f172a' },
    headerTintColor: '#ffffff',
  },
  description: '设置页面',
},
```

### 步骤3：使用路由
```typescript
// 在任何组件中
const router = useAppRouter();
router.push('Settings', { userId: '123' });
```

## 🎯 使用示例

### 基础导航
```typescript
const router = useAppRouter();

// 跳转页面
router.push('FeatureDemo');

// 返回上一页
router.back();

// 替换当前页面
router.replace('Settings');
```

### 带参数导航
```typescript
// 跳转并传递参数
router.push('Profile', { userId: '123' });

// 在目标页面接收参数
const ProfileScreen = ({ route }) => {
  const { userId } = route.params;
  // 使用参数...
};
```

### 全局导航
```typescript
import { Router } from '../utils/navigation';

// 在任何地方都可以使用
Router.navigate('Settings');
Router.goBack();
```

## 🔧 配置选项

### 路由选项
```typescript
options: {
  headerShown: true,              // 显示头部
  title: '页面标题',               // 头部标题
  headerStyle: { backgroundColor: '#0f172a' },
  headerTintColor: '#ffffff',     // 头部文字颜色
  gestureEnabled: true,           // 启用手势返回
  headerBackTitleVisible: false,  // 隐藏返回按钮文字
}
```

### 全局选项
```typescript
export const defaultStackOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  // 自定义页面切换动画
  cardStyleInterpolator: ({ current, layouts }) => ({...}),
};
```

## 📱 实际效果

1. **在服务页面点击"功能展示"** → `router.push('FeatureDemo')`
2. **在功能展示页面点击返回** → 自动返回服务页面
3. **手势滑动返回** → 从左边缘向右滑动返回

## 🎉 总结

这个路由系统提供了：
- ✅ **Web端般的开发体验** - 类似Vue Router或React Router的配置方式
- ✅ **类型安全** - 完整的TypeScript支持
- ✅ **易于维护** - 集中的路由配置和统一的API
- ✅ **灵活扩展** - 轻松添加新路由和功能
- ✅ **原生性能** - 基于React Navigation，保持原生性能

现在你可以像开发Web应用一样管理React Native的路由了！
