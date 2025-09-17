# Android Build Tools 34.0.0 修复指南

## 🔍 **问题诊断**

**错误信息**: `Failed to find Build Tools revision 34.0.0`

**根本原因**: 
- 项目配置要求 Build Tools 34.0.0
- 当前 Android SDK 只安装了 Build Tools 33.0.1
- react-native-permissions 库需要匹配的 Build Tools 版本

## 🎯 **解决方案**

### **方案一：安装 Build Tools 34.0.0（推荐）**

#### **步骤1: 通过 Android Studio 安装**

1. **打开 Android Studio**
2. **进入 SDK Manager**:
   - 点击 `File` → `Settings` (Windows) 或 `Android Studio` → `Preferences` (Mac)
   - 选择 `Appearance & Behavior` → `System Settings` → `Android SDK`
3. **安装 Build Tools**:
   - 切换到 `SDK Tools` 标签页
   - 勾选 `Show Package Details`
   - 找到 `Android SDK Build-Tools`
   - 展开并勾选 `34.0.0`
   - 点击 `Apply` 开始下载安装

#### **步骤2: 通过命令行安装（备选）**

如果您有 Android Studio 的 SDK Manager，也可以使用命令行：

```bash
# 设置环境变量（如果还没有设置）
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools

# 安装 Build Tools 34.0.0
sdkmanager "build-tools;34.0.0"
```

### **方案二：降级项目配置（临时方案）**

如果无法安装新版本，可以临时降级项目配置：

#### **修改 android/build.gradle**

```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.1"  // 改为已安装的版本
        minSdkVersion = 21
        compileSdkVersion = 33        // 相应降级
        targetSdkVersion = 33         // 相应降级
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.8.0"
    }
    // ... 其他配置保持不变
}
```

## 🔧 **完整修复步骤**

### **第一步：验证当前配置**

```bash
# 检查当前安装的 Build Tools 版本
dir "C:\Users\%USERNAME%\AppData\Local\Android\Sdk\build-tools"
```

### **第二步：设置环境变量**

在系统环境变量中添加：

```
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
```

在 PATH 中添加：
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

### **第三步：清理并重新构建**

```bash
# 清理项目
cd android
.\gradlew clean

# 返回项目根目录
cd ..

# 清理 React Native 缓存
npx react-native start --reset-cache

# 重新构建
npx react-native run-android
```

## 🚀 **验证修复**

### **检查 Build Tools 安装**

```bash
# 验证 Build Tools 34.0.0 已安装
dir "C:\Users\%USERNAME%\AppData\Local\Android\Sdk\build-tools\34.0.0"
```

### **测试构建**

```bash
# 清理并重新构建
cd android
.\gradlew clean
.\gradlew assembleDebug
```

如果构建成功，说明问题已解决。

## 🔍 **常见问题排查**

### **问题1: 环境变量未生效**

**解决方案**: 重启命令行工具或重启计算机

### **问题2: 权限问题**

**解决方案**: 以管理员身份运行命令行

### **问题3: 网络问题**

**解决方案**: 
- 检查网络连接
- 配置代理（如果需要）
- 使用 Android Studio 的 SDK Manager（通常更稳定）

### **问题4: 磁盘空间不足**

**解决方案**: 
- 清理不需要的 SDK 版本
- 确保有足够的磁盘空间（至少 2GB）

## 📱 **针对 react-native-permissions 的特殊处理**

### **检查库版本兼容性**

```bash
# 检查 react-native-permissions 版本
npm list react-native-permissions
```

### **如果版本过旧，考虑升级**

```bash
# 升级到最新版本
npm install react-native-permissions@latest

# 重新链接（如果需要）
npx react-native unlink react-native-permissions
npx react-native link react-native-permissions
```

## 🎯 **推荐的最终配置**

### **android/build.gradle（推荐配置）**

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.8.0"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.4")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}
```

## 📞 **如果问题仍然存在**

1. **检查 Android Studio 版本**: 确保使用最新稳定版
2. **重新安装 Android SDK**: 如果问题持续，考虑重新安装
3. **检查项目依赖**: 确保所有 React Native 依赖都是兼容版本
4. **查看详细错误日志**: 使用 `--verbose` 标志获取更多信息

```bash
npx react-native run-android --verbose
```

## ✅ **修复完成检查清单**

- [ ] Build Tools 34.0.0 已安装
- [ ] 环境变量已正确设置
- [ ] 项目配置文件已更新
- [ ] 缓存已清理
- [ ] 构建测试成功
- [ ] 应用可以正常运行

---

**修复完成后，您的实时视频监控功能应该可以正常构建和运行了！**
