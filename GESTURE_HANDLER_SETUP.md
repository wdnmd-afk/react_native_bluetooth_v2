# React Native Gesture Handler 配置指南

## 问题描述
在添加Stack Navigator后出现错误：
```
ERROR Invariant Violation: requireNativeComponent: "RNGestureHandlerRootView" was not found in the UIManager.
```

## 解决方案

### 1. 安装依赖
```bash
npm install react-native-gesture-handler
```

### 2. 配置入口文件
在 `index.js` 文件的最顶部添加导入：
```javascript
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### 3. Android配置
在 `android/app/src/main/java/com/myprinterapp/MainActivity.kt` 中添加：
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

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
```

### 4. 重新构建应用
```bash
# 清理Android缓存
cd android
./gradlew clean

# 重新启动Metro服务器
npm start --reset-cache

# 重新构建应用
npm run android
```

## 验证安装
运行以下命令验证gesture-handler是否正确安装：
```bash
# 检查依赖是否安装
npm list react-native-gesture-handler

# 检查模块文件是否存在
ls node_modules/react-native-gesture-handler
```

## 注意事项
1. **导入顺序很重要**：`react-native-gesture-handler` 必须在 `index.js` 的最顶部导入
2. **重新构建**：配置更改后必须重新构建原生应用
3. **清理缓存**：如果仍有问题，尝试清理所有缓存：
   ```bash
   rm -rf node_modules
   npm install
   cd android && ./gradlew clean
   npm run android
   ```

## 功能验证
配置完成后，应用应该能够：
- ✅ 正常启动不报错
- ✅ 在"服务"页面点击"功能展示"
- ✅ 成功跳转到功能展示页面
- ✅ 使用左上角返回按钮返回
- ✅ 使用手势滑动返回（从左边缘向右滑动）
