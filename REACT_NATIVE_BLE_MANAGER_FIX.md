# React Native BLE Manager 版本兼容性修复指南

## 问题描述

您遇到的编译错误是由于 `react-native-ble-manager` 版本与 React Native 0.73.3 不兼容导致的。错误信息显示：

```
E:\github\react_native_bluetooth\node_modules\react-native-ble-manager\android\src\main\java\it\innove\BleManager.java:43: 错误: 找不到符号
class BleManager extends NativeBleManagerSpec {
```

## 解决方案

### 步骤 1: 更新 package.json

已将 `react-native-ble-manager` 版本从 `^12.1.5` 降级到 `^11.5.3`，因为：

- **RN 0.60-0.75** 支持到 **11.X** 版本
- **RN 0.76+** 才支持 **12.X** 版本

### 步骤 2: 手动执行以下命令

请在项目根目录 `e:\github\react_native_bluetooth` 中依次执行：

```bash
# 1. 删除 node_modules 和 package-lock.json
rmdir /s node_modules
del package-lock.json

# 2. 重新安装依赖
npm install

# 3. 清理 Android 构建缓存
cd android
gradlew.bat clean

# 4. 返回项目根目录
cd ..

# 5. 重新构建项目
npx react-native run-android
```

### 步骤 3: 如果仍有问题

如果清理后仍有问题，请尝试：

```bash
# 清理 React Native 缓存
npx react-native start --reset-cache

# 或者完全重置项目
cd android
gradlew.bat clean
cd ..
rm -rf node_modules package-lock.json
npm install
npx react-native run-android
```

## 版本兼容性参考

| React Native 版本 | react-native-ble-manager 版本 |
|-------------------|-------------------------------|
| 0.76+            | 12.X                          |
| 0.60-0.75        | 11.X                          |
| 0.40-0.59        | 6.7.X                         |
| 0.30-0.39        | 2.4.3                         |

## 当前项目配置

- **React Native**: 0.73.3
- **react-native-ble-manager**: ^11.5.3 ✅
- **目标 SDK**: 34
- **最小 SDK**: 21

## 验证修复

修复完成后，应用应该能够：

1. 成功编译和安装
2. 正常初始化 BLE 管理器
3. 扫描和连接蓝牙设备
4. 显示设备列表和连接状态

## 注意事项

- 确保在真实设备上测试（模拟器不支持蓝牙）
- 确保已授予必要的蓝牙和定位权限
- 如果问题持续存在，请检查 Android 权限配置

## 相关文档

- [react-native-ble-manager GitHub](https://github.com/innoveit/react-native-ble-manager)
- [官方文档](https://innoveit.github.io/react-native-ble-manager/)
- 项目中的 `BLUETOOTH_SETUP.md` 和 `TROUBLESHOOTING.md`