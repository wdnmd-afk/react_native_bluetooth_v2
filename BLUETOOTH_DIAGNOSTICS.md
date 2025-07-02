# 蓝牙库诊断工具

## 快速诊断检查清单

当遇到蓝牙相关错误时，请按以下顺序检查：

### ✅ 1. 环境检查
- [ ] **真机测试**：确保在真实设备上运行，不是模拟器
- [ ] **设备支持**：确认设备具有蓝牙功能
- [ ] **系统版本**：Android 5.0+ (API Level 21+)
- [ ] **应用权限**：检查应用是否有蓝牙相关权限

### ✅ 2. 依赖检查
```bash
# 检查依赖是否正确安装
npm list react-native-ble-manager

# 期望输出：
# └── react-native-ble-manager@12.1.5
```

### ✅ 3. 原生模块链接检查
```bash
# 清理并重新构建
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### ✅ 4. 权限配置检查
确保 `android/app/src/main/AndroidManifest.xml` 包含：
```xml
<!-- 基础蓝牙权限 -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />

<!-- Android 12+ 新权限 -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
                 android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- 定位权限（蓝牙扫描必需） -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- 硬件特性声明 -->
<uses-feature android:name="android.hardware.bluetooth" android:required="true" />
```

## 常见错误及解决方案

### 错误1: "Cannot read property 'requestBluetoothEnabled' of null"

**原因分析：**
- react-native-ble-manager 库未正确初始化
- 原生模块链接失败
- 在模拟器上运行

**解决步骤：**
1. **确认真机运行**
   ```bash
   adb devices  # 确保真机已连接
   ```

2. **重新安装依赖**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **清理构建缓存**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native clean
   ```

4. **检查Metro缓存**
   ```bash
   npx react-native start --reset-cache
   ```

5. **重新构建应用**
   ```bash
   npx react-native run-android
   ```

### 错误2: "Cannot read property 'isBluetoothEnabled' of null"

**解决方案：** 同错误1的解决步骤

### 错误3: 权限被拒绝

**检查步骤：**
1. 打开设备设置 → 应用 → [应用名] → 权限
2. 确保以下权限已开启：
   - 位置信息（精确位置）
   - 附近的设备（Android 12+）

### 错误4: 蓝牙扫描无结果

**检查清单：**
- [ ] 蓝牙已启用
- [ ] 位置服务已开启
- [ ] 目标设备处于可发现模式
- [ ] 应用具有所有必要权限

## 高级诊断

### 1. 日志分析
```bash
# 查看详细的Android日志
adb logcat | grep -E "(Bluetooth|bluetooth|BT)"

# 查看React Native日志
npx react-native log-android
```

### 2. 手动测试蓝牙库
在应用中添加测试代码：
```javascript
import BleManager from 'react-native-ble-manager';

// 测试库可用性
console.log('BleManager:', BleManager);
console.log('Type:', typeof BleManager);
console.log('Methods:', Object.keys(BleManager || {}));

// 测试状态监听
if (BleManager) {
  BleManager.start().then(() => {
    BleManager.checkState().then((state) => {
    .then(enabled => console.log('蓝牙启用状态:', enabled))
    .catch(error => console.error('检查蓝牙状态失败:', error));
}
```

### 3. 版本兼容性检查
```bash
# 检查React Native版本
npx react-native --version

# 检查蓝牙库版本
npm list react-native-ble-manager

# 检查Android编译版本
cat android/app/build.gradle | grep -E "(compileSdkVersion|targetSdkVersion)"
```

## 预防措施

### 1. 开发环境设置
- 始终在真机上测试蓝牙功能
- 使用支持蓝牙的测试设备
- 保持依赖版本更新

### 2. 代码最佳实践
- 在使用蓝牙API前始终检查库可用性
- 实现完善的错误处理
- 提供用户友好的错误提示

### 3. 测试策略
- 在不同Android版本上测试
- 测试权限被拒绝的场景
- 测试蓝牙关闭/开启的场景

## 获取帮助

如果以上步骤都无法解决问题，请收集以下信息：

1. **设备信息**
   - 设备型号
   - Android版本
   - 是否为模拟器

2. **应用信息**
   - React Native版本
   - react-native-ble-manager版本
   - 目标SDK版本

3. **错误信息**
   - 完整的错误堆栈
   - 相关的控制台日志
   - 重现步骤

4. **环境信息**
   - 开发环境（Windows/Mac/Linux）
   - Node.js版本
   - npm/yarn版本

## 参考资源

- [react-native-ble-manager GitHub](https://github.com/innoveit/react-native-ble-manager)
- [Android蓝牙开发文档](https://developer.android.com/guide/topics/connectivity/bluetooth)
- [React Native故障排除](https://reactnative.dev/docs/troubleshooting)