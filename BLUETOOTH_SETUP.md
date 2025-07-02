# 蓝牙打印机应用设置指南

## 概述
这是一个React Native蓝牙打印机应用，支持搜索、配对和连接蓝牙设备。

## 依赖安装

### 1. 安装npm依赖
```bash
npm install
```

### 2. 安装原生依赖
对于Android平台，需要额外配置react-native-ble-manager库：

```bash
# 自动链接（React Native 0.60+）
npx react-native run-android
```

### 3. Android配置

#### 权限配置
`android/app/src/main/AndroidManifest.xml` 已包含以下权限：
- `BLUETOOTH` - 基础蓝牙功能
- `BLUETOOTH_ADMIN` - 蓝牙管理
- `BLUETOOTH_SCAN` - 蓝牙扫描（Android 12+）
- `BLUETOOTH_CONNECT` - 蓝牙连接（Android 12+）
- `ACCESS_FINE_LOCATION` - 精确定位（蓝牙扫描必需）
- `ACCESS_COARSE_LOCATION` - 粗略定位

#### 硬件特性声明
```xml
<uses-feature android:name="android.hardware.bluetooth" android:required="true" />
<uses-feature android:name="android.hardware.bluetooth_le" android:required="false" />
```

## 功能特性

### 1. 权限管理
- 自动检查蓝牙、定位权限状态
- 动态请求缺失的权限
- 支持引导用户到设置页面手动开启权限

### 2. 蓝牙功能
- 检查蓝牙启用状态
- 请求启用蓝牙功能
- 扫描附近的蓝牙设备
- 显示已配对和未配对设备
- 自动配对未配对设备
- 连接和断开蓝牙设备

### 3. 用户界面
- 现代化的Material Design风格
- 实时显示权限和蓝牙状态
- 设备列表显示配对状态和信号强度
- 扫描进度指示和停止功能

## 使用说明

### 1. 启动应用
```bash
# 启动Metro服务器
npm start

# 运行Android应用
npm run android
```

### 2. 权限授权
1. 首次启动时，应用会检查权限状态
2. 点击"请求"按钮授予定位和蓝牙权限
3. 如果权限被永久拒绝，点击"去设置"手动开启

### 3. 蓝牙扫描
1. 确保蓝牙已启用（如未启用，点击"启用"按钮）
2. 点击"🔍 搜索蓝牙设备"开始扫描
3. 扫描过程中可点击"停止扫描"提前结束
4. 扫描会自动在30秒后超时停止

### 4. 设备连接
1. 在设备列表中点击要连接的设备
2. 未配对设备会自动进行配对
3. 连接成功后设备状态会更新
4. 点击"断开"按钮可断开连接

## 故障排除

### 1. 蓝牙库初始化失败
如果遇到 "Cannot read property 'isBluetoothEnabled' of null" 错误：
- 重新安装依赖：`rm -rf node_modules && npm install`
- 清理Android构建缓存：`cd android && ./gradlew clean`
- 检查AndroidManifest.xml权限配置
- 确保在真机上测试（模拟器不支持蓝牙）

详细解决方案请参考：[故障排除指南](./TROUBLESHOOTING.md)

### 2. 权限问题
- 确保已授予定位和蓝牙权限
- Android 12+需要BLUETOOTH_SCAN和BLUETOOTH_CONNECT权限
- 如权限被拒绝，到设置中手动开启

### 3. 扫描问题
- 确保蓝牙已启用
- 确保目标设备处于可发现状态
- 尝试重新启动蓝牙功能

### 4. 连接问题
- 确保设备支持所需的蓝牙协议
- 尝试先在系统设置中配对设备
- 检查设备是否已被其他应用占用

## 技术栈
- React Native 0.73.3
- react-native-ble-manager ^12.1.5
- TypeScript
- Android API Level 21+

## 注意事项
- 此应用主要针对Android平台开发
- iOS平台需要额外的配置和权限处理
- 蓝牙功能需要在真机上测试，模拟器不支持蓝牙