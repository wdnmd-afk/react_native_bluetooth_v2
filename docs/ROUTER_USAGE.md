# 路由系统使用指南

## 📁 文件结构

```
├── config/
│   └── routes.tsx          # 路由配置文件（类似Web端的路由配置）
├── utils/
│   └── navigation.ts       # 路由工具类（类似Web端的router实例）
├── types/
│   └── navigation.ts       # 路由类型定义
└── App.tsx                 # 应用入口，使用路由配置
```

## 🔧 路由配置 (`config/routes.tsx`)

### 添加新路由

```typescript
// 1. 首先在 types/navigation.ts 中添加路由类型
export type RootStackParamList = {
  TabLayout: undefined;
  FeatureDemo: undefined;
  Settings: { userId?: string };  // 新增：设置页面，可传递参数
  Profile: { userId: string };    // 新增：用户资料页面，必须传递userId
};

// 2. 在 config/routes.tsx 中添加路由配置
export const routeConfigs: RouteConfig[] = [
  // ... 现有路由
  {
    name: 'Settings',
    component: SettingsScreen,
    options: {
      headerShown: true,
      title: '设置',
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#ffffff',
    },
    description: '设置页面 - 应用配置和用户偏好',
  },
  {
    name: 'Profile',
    component: ProfileScreen,
    options: {
      headerShown: true,
      title: '用户资料',
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#ffffff',
    },
    description: '用户资料页面 - 显示用户详细信息',
  },
];
```

## 🚀 路由使用方法

### 1. 在组件中使用路由

```typescript
import React from 'react';
import { useAppRouter } from '../utils/navigation';

const MyComponent: React.FC = () => {
  const router = useAppRouter();

  const handleNavigation = () => {
    // 方法1：跳转到页面（类似Web端的router.push()）
    router.push('FeatureDemo');
    
    // 方法2：跳转并传递参数
    router.push('Profile', { userId: '123' });
    
    // 方法3：返回上一页（类似Web端的router.back()）
    router.back();
    
    // 方法4：替换当前页面（类似Web端的router.replace()）
    router.replace('Settings');
  };

  return (
    <TouchableOpacity onPress={handleNavigation}>
      <Text>跳转页面</Text>
    </TouchableOpacity>
  );
};
```

### 2. 使用全局路由工具

```typescript
import { Router } from '../utils/navigation';

// 在任何地方都可以使用的全局导航方法
class SomeService {
  static navigateToProfile(userId: string) {
    Router.navigate('Profile', { userId });
  }
  
  static goToSettings() {
    Router.navigate('Settings');
  }
  
  static goBack() {
    Router.goBack();
  }
}
```

### 3. 获取当前路由信息

```typescript
import { Router } from '../utils/navigation';

// 获取当前路由名称
const currentRoute = Router.getCurrentRouteName();
console.log('当前页面:', currentRoute);

// 检查是否可以返回
const canGoBack = Router.canGoBack();
if (canGoBack) {
  Router.goBack();
}
```

## 🎨 路由配置选项

### 常用配置选项

```typescript
{
  name: 'MyScreen',
  component: MyScreenComponent,
  options: {
    // 头部配置
    headerShown: true,              // 是否显示头部
    title: '页面标题',               // 头部标题
    headerBackTitleVisible: false,  // 隐藏返回按钮文字
    
    // 头部样式
    headerStyle: {
      backgroundColor: '#0f172a',   // 头部背景色
    },
    headerTintColor: '#ffffff',     // 头部文字颜色
    headerTitleStyle: {
      fontWeight: 'bold',           // 标题样式
    },
    
    // 手势配置
    gestureEnabled: true,           // 启用手势返回
    gestureDirection: 'horizontal', // 手势方向
    
    // 动画配置
    animationEnabled: true,         // 启用切换动画
  },
}
```

## 📱 实际使用示例

### 示例1：服务列表页面跳转

```typescript
// app/service.tsx
const ServiceScreen: React.FC = () => {
  const router = useAppRouter();

  const handleServicePress = (service: any) => {
    switch (service.title) {
      case '功能展示':
        router.push('FeatureDemo');
        break;
      case '设置':
        router.push('Settings');
        break;
      case '用户资料':
        router.push('Profile', { userId: 'current-user' });
        break;
      default:
        console.log(`点击了服务: ${service.title}`);
    }
  };

  // ... 组件其余部分
};
```

### 示例2：带参数的页面跳转

```typescript
// 跳转到用户资料页面
const navigateToUserProfile = (userId: string) => {
  router.push('Profile', { userId });
};

// 在目标页面接收参数
const ProfileScreen: React.FC = ({ route }) => {
  const { userId } = route.params;
  
  // 使用userId加载用户数据
  useEffect(() => {
    loadUserData(userId);
  }, [userId]);
};
```

## 🔍 调试和开发工具

### 路由调试

```typescript
// 在开发环境中添加路由监听
if (__DEV__) {
  import('./utils/navigation').then(({ navigationRef }) => {
    navigationRef.current?.addListener('state', (e) => {
      console.log('路由状态变化:', e.data.state);
    });
  });
}
```

### 路由验证

```typescript
import { isValidRoute } from '../config/routes';

// 验证路由是否存在
if (isValidRoute('SomeRoute')) {
  router.push('SomeRoute');
} else {
  console.warn('路由不存在');
}
```

## 🎯 最佳实践

1. **统一管理**: 所有路由配置都在 `config/routes.tsx` 中管理
2. **类型安全**: 使用TypeScript确保路由名称和参数的类型安全
3. **组件复用**: 使用 `useAppRouter` hook在组件中获取路由功能
4. **全局访问**: 使用 `Router` 类在非组件代码中进行导航
5. **参数传递**: 通过路由参数传递数据，避免全局状态污染

这样的路由系统提供了类似Web端的开发体验，同时保持了React Native的原生性能！
