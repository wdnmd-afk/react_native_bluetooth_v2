# React Native Gesture Handler 修复记录

## 问题描述
在添加Stack Navigator后出现错误：
```
ERROR Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNGestureHandlerModule' could not be found.
```

## 已执行的修改步骤

### 1. 安装依赖包
```bash
npm install react-native-gesture-handler
```
**原因**: Stack Navigator需要gesture-handler库支持手势导航

### 2. 修改 index.js
**文件**: `index.js`
**修改**: 在文件最顶部添加导入
```javascript
// 必须在最顶部导入，确保在React Native初始化之前加载gesture-handler
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```
**原因**: gesture-handler必须在React Native初始化之前加载，这是官方要求

### 3. 修改 MainApplication.kt
**文件**: `android/app/src/main/java/com/myprinterapp/MainApplication.kt`
**修改**: 手动添加gesture-handler包
```kotlin
// 添加gesture-handler包的导入
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage

class MainApplication : Application(), ReactApplication {
  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // 手动添加gesture-handler包，因为自动链接可能失败
              add(RNGestureHandlerPackage())
            }
      }
}
```
**原因**: 自动链接可能在某些情况下失败，手动添加确保包被正确注册

### 4. 修改 MainActivity.kt
**文件**: `android/app/src/main/java/com/myprinterapp/MainActivity.kt`
**修改**: 简化配置，移除不必要的导入
```kotlin
package com.myprinterapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "MyPrinterApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // 确保正确的生命周期处理
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
```
**原因**: 移除可能冲突的导入，使用标准的React Native配置

## 当前状态
- ✅ 依赖已安装
- ✅ index.js 已配置
- ✅ MainApplication.kt 已手动添加包
- ✅ MainActivity.kt 已简化配置
- ❌ 仍然报错：RNGestureHandlerModule 未找到

## 最终解决方案：正确配置gesture-handler版本

### 5. 版本兼容性问题解决
**问题**: React Native 0.73.3 与最新版本的gesture-handler不兼容

**解决步骤**:

#### 5.1 安装兼容版本
```bash
npm install react-native-gesture-handler@2.18.1
```
**原因**: 根据官方文档，React Native 0.73需要gesture-handler 2.18.1版本

#### 5.2 正确配置index.js
```javascript
// 必须在最顶部导入gesture-handler，这是官方要求
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
```

#### 5.3 Android配置 (MainActivity.kt)
```kotlin
// 对于React Native 0.73，gesture-handler会自动处理，不需要特殊配置
override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(null)
}
```
**原因**: React Native 0.73使用新的自动链接机制

#### 5.4 MainApplication.kt配置
```kotlin
// 使用自动链接，不需要手动添加包
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
      // 自动链接会处理gesture-handler
    }
```

#### 5.5 恢复Stack Navigator
```typescript
// App.tsx - 使用完整的Stack Navigator配置
<Stack.Navigator
  screenOptions={{
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  }}
>
  <Stack.Screen name="TabLayout" component={TabLayout} />
  <Stack.Screen
    name="FeatureDemo"
    component={FeatureDemoScreen}
    options={{
      headerShown: true,
      title: '功能展示',
      gestureEnabled: true,
    }}
  />
</Stack.Navigator>
```

### 关键配置要点
1. **版本匹配**: React Native 0.73.3 + gesture-handler 2.18.1
2. **导入顺序**: gesture-handler必须在index.js最顶部导入
3. **自动链接**: React Native 0.73使用新的自动链接，不需要手动配置
4. **清理重建**: 配置更改后必须清理缓存并重新构建
