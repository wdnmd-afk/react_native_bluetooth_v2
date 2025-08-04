# React Native Gesture Handler 最终配置指南

## 问题背景
在React Native 0.73.3项目中使用Stack Navigator时出现错误：
```
ERROR Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNGestureHandlerModule' could not be found.
```

## ✅ 最终成功解决方案

### 1. 使用稳定版本组合
**package.json配置**:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.3",
    "react-native-gesture-handler": "~2.14.0",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/stack": "^6.3.29",
    "@react-navigation/bottom-tabs": "^6.5.20"
  }
}
```
**关键点**: 使用gesture-handler 2.14.1版本（自动安装），完全依赖自动链接

### 2. 入口文件配置
**index.js**:
```javascript
/**
 * @format
 */

// 必须在最顶部导入gesture-handler，这是官方要求
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### 3. Android原生配置

#### MainApplication.kt
```kotlin
package com.myprinterapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.soloader.SoLoader
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // 依赖自动链接，React Native 0.60+会自动处理gesture-handler
              // 不需要手动添加包
            }

        override fun getJSMainModuleName(): String = "index"
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
    ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
  }
}
```

#### MainActivity.kt
```kotlin
package com.myprinterapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "MyPrinterApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
```

### 4. 重新构建步骤
```bash
# 1. 删除node_modules并重新安装
Remove-Item -Recurse -Force node_modules
npm install

# 2. 清理Android构建缓存
cd android
./gradlew clean

# 3. 重新启动Metro服务器
npm start --reset-cache

# 4. 重新构建应用
npm run android
```

## ✅ 关键成功要点

1. **版本兼容性**: gesture-handler 2.14.1 与 React Native 0.73.3 完美兼容
2. **自动链接**: React Native 0.60+ 的自动链接机制工作正常，无需手动配置
3. **简化配置**: 使用标准的DefaultReactActivityDelegate即可
4. **导入顺序**: gesture-handler必须在index.js最顶部导入
5. **完全重建**: 删除node_modules重新安装后必须清理并重新构建

## 🚫 避免的错误配置
- ❌ 不要手动添加RNGestureHandlerPackage
- ❌ 不要使用RNGestureHandlerEnabledRootView
- ❌ 不要手动导入gesture-handler相关的原生类

## 验证成功标志
- ✅ 应用正常启动，无gesture-handler错误
- ✅ Stack Navigator正常工作
- ✅ 手势导航（滑动返回）正常工作
- ✅ Tab Navigator和Stack Navigator可以正常切换
