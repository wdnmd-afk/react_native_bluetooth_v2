import {useState, useEffect, useRef, useCallback} from 'react';
import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Platform,
  Alert,
} from 'react-native';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {usePermissions} from './usePermissions';

// 环境检测函数
const logEnvironmentInfo = () => {
  console.log('=== 环境信息检测 ===');
  console.log('平台:', Platform.OS);
  console.log('平台版本:', Platform.Version);
  console.log('是否开发模式:', __DEV__);

  if (Platform.OS === 'android') {
    console.log('Android信息:', {
      Brand: Platform.constants.Brand,
      Manufacturer: Platform.constants.Manufacturer,
      Model: Platform.constants.Model,
      Release: Platform.constants.Release,
      SDK: Platform.constants.Version,
    });

    // 检测是否为模拟器
    const isEmulator =
      Platform.constants.Brand === 'google' ||
      Platform.constants.Manufacturer === 'Google' ||
      Platform.constants.Model?.includes('Emulator') ||
      Platform.constants.Model?.includes('Android SDK');

    console.log('疑似模拟器:', isEmulator);

    if (isEmulator) {
      console.warn('⚠️ 检测到可能在模拟器上运行，蓝牙功能在模拟器上不可用');
    }
  }

  console.log('=== 环境信息检测结束 ===');
};

// 检查蓝牙库是否可用
const isBluetoothLibraryAvailable = (): boolean => {
  console.log('=== 开始检查蓝牙库可用性 ===');

  try {
    // 步骤1: 检查BleManager是否存在
    console.log('步骤1: 检查BleManager对象');
    console.log('BleManager存在:', !!BleManager);
    console.log('BleManager类型:', typeof BleManager);

    if (!BleManager) {
      console.error('❌ BleManager对象不存在');
      return false;
    }

    // 步骤2: 检查BleManager的方法
    console.log('步骤2: 检查BleManager方法');
    const methods = Object.keys(BleManager || {});
    console.log('可用方法列表:', methods);

    // 步骤3: 检查关键方法是否存在
    console.log('步骤3: 检查关键方法');
    const hasStart = typeof BleManager.start === 'function';
    const hasStartScan = typeof BleManager.scan === 'function';
    const hasStopScan = typeof BleManager.stopScan === 'function';
    const hasConnect = typeof BleManager.connect === 'function';
    const hasCheckState = typeof BleManager.checkState === 'function';

    console.log('start方法:', hasStart);
    console.log('scan方法:', hasStartScan);
    console.log('stopScan方法:', hasStopScan);
    console.log('connect方法:', hasConnect);
    console.log('checkState方法:', hasCheckState);

    if (!hasStart || !hasStartScan || !hasStopScan || !hasConnect) {
      console.error('❌ 关键方法不可用');
      return false;
    }

    console.log('✅ 蓝牙库检查通过');
    return true;
  } catch (error: any) {
    console.error('❌ 检查蓝牙库可用性失败:', error);
    console.error('错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return false;
  } finally {
    console.log('=== 蓝牙库检查结束 ===');
  }
};

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export enum BluetoothState {
  Unknown = 'Unknown',
  Resetting = 'Resetting',
  Unsupported = 'Unsupported',
  Unauthorized = 'Unauthorized',
  PoweredOff = 'PoweredOff',
  PoweredOn = 'PoweredOn',
}

// 获取BLE状态的文本描述
export const getBluetoothStateText = (state: BluetoothState): string => {
  switch (state) {
    case BluetoothState.Unknown:
      return '未知';
    case BluetoothState.Resetting:
      return '重置中';
    case BluetoothState.Unsupported:
      return '不支持';
    case BluetoothState.Unauthorized:
      return '未授权';
    case BluetoothState.PoweredOff:
      return '已关闭';
    case BluetoothState.PoweredOn:
      return '已开启';
    default:
      return '未知';
  }
};

export interface BluetoothDevice {
  id: string;
  name?: string;
  rssi?: number;
  advertising?: {
    localName?: string;
    manufacturerData?: any;
    serviceUUIDs?: string[];
  };
}

export const useBluetooth = () => {
  const {
    hasLocationPermission,
    hasBluetoothPermission,
    isCheckingPermissions,
    requestLocationPermission,
    requestBluetoothPermission,
    checkPermissions,
    openAppSettings,
  } = usePermissions();

  const [isScanning, setIsScanning] = useState(false);
  const isScanningRef = useRef(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>(
    BluetoothState.Unknown,
  );
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkBluetoothStatus = async () => {
    try {
      if (!isBluetoothLibraryAvailable()) {
        setBluetoothState(BluetoothState.Unsupported);
        setIsBluetoothEnabled(false);
        return;
      }
      const state = await BleManager.checkState();
      const isOn = state === 'on';
      setIsBluetoothEnabled(isOn);
      setBluetoothState(
        isOn ? BluetoothState.PoweredOn : BluetoothState.PoweredOff,
      );
    } catch (error) {
      console.error('❌ 检查蓝牙状态失败:', error);
      setIsBluetoothEnabled(false);
      setBluetoothState(BluetoothState.Unknown);
    }
  };

  const startScan = async () => {
    if (isScanning) {
      return;
    }

    if (
      !hasLocationPermission ||
      !hasBluetoothPermission ||
      bluetoothState !== BluetoothState.PoweredOn
    ) {
      Alert.alert('无法扫描', '请确保已授予定位和蓝牙权限，并已开启蓝牙。');
      return;
    }

    setIsScanning(true);
    isScanningRef.current = true;
    setDevices([]);

    try {
      await BleManager.scan([], 10, true);
      const timeoutId = setTimeout(() => {
        stopScan();
      }, 10000);
      scanTimeoutRef.current = timeoutId;
    } catch (error) {
      console.error('❌ BLE扫描失败:', error);
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const stopScan = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (isScanningRef.current) {
      BleManager.stopScan().catch(err => console.error('停止扫描失败', err));
    }
  }, []);

  const connectDevice = async (device: BluetoothDevice) => {
    try {
      if (connectedDevice) {
        await BleManager.disconnect(connectedDevice.id);
      }
      await BleManager.connect(device.id);
      setConnectedDevice(device);
      Alert.alert('连接成功', `已连接到 ${device.name || device.id}`);
    } catch (error) {
      Alert.alert('连接失败', `无法连接到 ${device.name || device.id}`);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await BleManager.disconnect(connectedDevice.id);
        setConnectedDevice(null);
        Alert.alert('已断开连接');
      } catch (error) {
        Alert.alert('断开连接失败');
      }
    }
  };

  useEffect(() => {
    logEnvironmentInfo();
    BleManager.start({showAlert: false});
    checkPermissions(); // Initial permission check

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        checkPermissions();
        checkBluetoothStatus();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
      if (!isScanningRef.current) {
        return;
      }
      const device: BluetoothDevice = {
        id: peripheral.id,
        name:
          peripheral.name || peripheral.advertising?.localName || '未知设备',
        rssi: peripheral.rssi,
        advertising: peripheral.advertising,
      };
      setDevices(prevDevices => {
        const existingIndex = prevDevices.findIndex(d => d.id === device.id);
        if (existingIndex > -1) {
          const newDevices = [...prevDevices];
          newDevices[existingIndex] = device;
          return newDevices;
        }
        return [...prevDevices, device];
      });
    };

    const handleStopScan = () => {
      if (isScanningRef.current) {
        setIsScanning(false);
        isScanningRef.current = false;
      }
    };

    const handleDisconnectedPeripheral = (data: {peripheral: string}) => {
      if (connectedDevice?.id === data.peripheral) {
        setConnectedDevice(null);
      }
    };

    const handleUpdateState = (data: {state: BluetoothState}) => {
      setBluetoothState(data.state);
      setIsBluetoothEnabled(data.state === BluetoothState.PoweredOn);
    };

    const listeners = [
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      ),
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateState',
        handleUpdateState,
      ),
    ];

    checkBluetoothStatus();

    return () => {
      stopScan();
      appStateSubscription.remove();
      listeners.forEach(listener => listener.remove());
    };
  }, [checkPermissions, stopScan]);

  return {
    isScanning,
    devices,
    connectedDevice,
    bluetoothState,
    isBluetoothEnabled,
    isBluetoothLibraryAvailable: isBluetoothLibraryAvailable(),
    startScan,
    stopScan,
    connectDevice,
    disconnectDevice,
    getBluetoothStateText,
    hasLocationPermission,
    hasBluetoothPermission,
    isCheckingPermissions,
    checkPermissions,
    requestLocationPermission,
    requestBluetoothPermission,
    openAppSettings,
  };
};
