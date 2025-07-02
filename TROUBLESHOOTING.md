# 蓝牙应用故障排除指南

## 常见错误及解决方案

### 1. "Cannot read property 'isBluetoothEnabled' of null" 错误

**错误描述：** BleManager对象为null，导致应用崩溃

**可能原因：**
- react-native-ble-manager库未正确安装
- 原生模块未正确链接
- Android权限配置不正确
- 设备不支持蓝牙功能

**解决步骤：**

#### 步骤1：重新安装依赖
```bash
# 清理node_modules
rm -rf node_modules
npm install

# 清理Android构建缓存
cd android
./gradlew clean
cd ..
```

#### 步骤2：检查Android配置
确保 `android/app/src/main/AndroidManifest.xml` 包含以下权限：
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<uses-feature android:name="android.hardware.bluetooth" android:required="true" />
```

#### 步骤3：手动链接（如果自动链接失败）
在 `android/settings.gradle` 中添加：
```gradle
include ':react-native-ble-manager'
project(':react-native-ble-manager').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-ble-manager/android')
```

在 `android/app/build.gradle` 的dependencies中添加：
```gradle
implementation project(':react-native-ble-manager')
```

在 `MainApplication.java` 中添加：
```java
import it.innove.BleManagerPackage;

// 在MainApplication.java的getPackages()方法中添加：
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
    new MainReactPackage(),
    new BleManagerPackage() // 添加这行
  );
}
```

#### 步骤4：重新构建应用
```bash
npx react-native run-android
```

### 2. 权限被拒绝错误

**解决方案：**
1. 确保在设备设置中手动授予所有必要权限
2. 对于Android 12+，确保授予BLUETOOTH_SCAN和BLUETOOTH_CONNECT权限
3. 重启应用以重新检查权限状态

### 3. 蓝牙扫描无结果

**可能原因：**
- 目标设备不在可发现模式
- 权限不足
- 蓝牙未启用

**解决方案：**
1. 确保目标蓝牙设备处于可发现模式
2. 检查所有权限是否已授予
3. 确认蓝牙已启用
4. 尝试在系统蓝牙设置中手动搜索设备

### 4. 设备连接失败

**解决方案：**
1. 确保设备支持所需的蓝牙协议
2. 尝试先在系统设置中配对设备
3. 检查设备是否被其他应用占用
4. 重启蓝牙功能

### 5. 应用在真机上无法运行

**注意事项：**
- 蓝牙功能必须在真实设备上测试
- 模拟器不支持蓝牙功能
- 确保测试设备支持蓝牙

## 调试技巧

### 1. 启用详细日志
在开发过程中，注意查看以下日志：
```bash
# Android日志
adb logcat | grep -i bluetooth

# React Native日志
npx react-native log-android
```

### 2. 检查库版本兼容性
确保使用的react-native-ble-manager版本与React Native版本兼容：

```bash
npm list react-native-ble-manager
``` list react-native
```

### 3. 测试基础功能
创建一个简单的测试来验证库是否正常工作：
```javascript
import BleManager from 'react-native-ble-manager';

// 测试库是否可用
console.log('BleManager available:', !!BleManager);

// 测试基本功能
BleManager.start().then(() => {
  BleManager.checkState().then((state) => {
  .then(enabled => console.log('Bluetooth enabled:', enabled))
  .catch(error => console.error('Error:', error));
```

## 联系支持

如果以上解决方案都无法解决问题，请提供以下信息：
1. 设备型号和Android版本
2. React Native版本
3. react-native-ble-manager版本
4. 完整的错误日志
5. 重现步骤

## 参考资源

- [react-native-ble-manager官方文档](https://github.com/innoveit/react-native-ble-manager)
- [Android蓝牙开发指南](https://developer.android.com/guide/topics/connectivity/bluetooth)
- [React Native权限处理](https://reactnative.dev/docs/permissionsandroid)