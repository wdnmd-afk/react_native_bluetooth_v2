import {useState, useEffect} from 'react';
import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';

export interface PermissionState {
  hasLocationPermission: boolean;
  hasBluetoothPermission: boolean;
  isCheckingPermissions: boolean;
}

export const usePermissions = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasBluetoothPermission, setHasBluetoothPermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  // 请求定位权限
  const requestLocationPermission = async (): Promise<boolean> => {
    console.log('开始请求定位权限');
    if (Platform.OS === 'android') {
      try {
        console.log('显示定位权限请求对话框');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '定位权限请求',
            message:
              '应用需要定位权限来搜索附近的蓝牙设备。这是Android系统的要求，我们不会收集您的位置信息。',
            buttonNeutral: '稍后询问',
            buttonNegative: '拒绝',
            buttonPositive: '允许',
          },
        );

        console.log('定位权限请求结果:', granted);
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(isGranted);

        if (isGranted) {
          console.log('定位权限已获得');
          Alert.alert('权限授予成功', '定位权限已获得，现在可以搜索蓝牙设备了');
        } else {
          console.log('定位权限被拒绝');
          Alert.alert(
            '权限被拒绝',
            '没有定位权限将无法搜索蓝牙设备，请重新授权或在设置中手动开启权限',
            [
              {text: '取消', style: 'cancel'},
              {text: '去设置', onPress: openAppSettings},
            ],
          );
        }

        return isGranted;
      } catch (err) {
        console.error('请求定位权限时出错:', err);
        Alert.alert('权限请求失败', '请求权限时发生错误，请重试');
        return false;
      }
    }
    return true; // iOS 不需要显式请求定位权限用于蓝牙
  };

  // 请求蓝牙权限 (Android 12+)
  const requestBluetoothPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];

        console.log('请求蓝牙权限 (Android 12+):', permissions);
        const results = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED,
        );

        setHasBluetoothPermission(allGranted);

        if (allGranted) {
          console.log('蓝牙权限已获得');
          Alert.alert('权限授予成功', '蓝牙权限已获得');
        } else {
          console.log('蓝牙权限被拒绝');
          Alert.alert(
            '蓝牙权限被拒绝',
            '没有蓝牙权限将无法使用蓝牙功能，请在设置中手动开启权限',
            [
              {text: '取消', style: 'cancel'},
              {text: '去设置', onPress: openAppSettings},
            ],
          );
        }

        return allGranted;
      } catch (err) {
        console.error('请求蓝牙权限时出错:', err);
        Alert.alert('权限请求失败', '请求蓝牙权限时发生错误，请重试');
        return false;
      }
    }

    // Android 11 及以下版本不需要显式的蓝牙权限
    setHasBluetoothPermission(true);
    return true;
  };

  // 打开应用设置页面
  const openAppSettings = () => {
    Linking.openSettings().catch(err => {
      console.error('无法打开设置:', err);
      Alert.alert(
        '错误',
        '无法打开设置页面，请手动到系统设置中找到本应用并开启定位权限',
      );
    });
  };

  // 检查权限状态
  const checkPermissions = async (): Promise<void> => {
    setIsCheckingPermissions(true);
    console.log('检查权限状态, Android版本:', Platform.Version);

    try {
      // 检查定位权限
      if (Platform.OS === 'android') {
        const locationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        console.log('定位权限状态:', locationGranted);
        setHasLocationPermission(locationGranted);
      } else {
        setHasLocationPermission(true);
      }

      // 检查蓝牙权限 (Android 12+)
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const bluetoothScanGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        );
        const bluetoothConnectGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );

        const bluetoothPermissionGranted =
          bluetoothScanGranted && bluetoothConnectGranted;
        console.log('蓝牙权限状态:', bluetoothPermissionGranted);
        setHasBluetoothPermission(bluetoothPermissionGranted);
      } else {
        setHasBluetoothPermission(true);
      }
    } catch (error) {
      console.error('检查权限状态失败:', error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  // 组件挂载时检查权限
  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    // 状态
    hasLocationPermission,
    hasBluetoothPermission,
    isCheckingPermissions,

    // 方法
    requestLocationPermission,
    requestBluetoothPermission,
    checkPermissions,
    openAppSettings,
  };
};
