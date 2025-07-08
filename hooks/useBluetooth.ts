import {useState, useEffect, useRef, useCallback} from 'react';
import {
  AppState,
  NativeEventEmitter,
  NativeModules,
  Alert,
} from 'react-native';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {usePermissions} from './usePermissions';
import dayjs from 'dayjs';
import {
  logEnvironmentInfo,
  isBluetoothLibraryAvailable,
  BluetoothState,
  getBluetoothStateText,
  BluetoothDevice,
  scanConfig,
} from '../utils/bluetoothUtils';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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

  // 扫描状态
  const [isScanning, setIsScanning] = useState(false);
  // 扫描状态的引用，用于在回调中获取最新状态
  const isScanningRef = useRef(false);
  // 发现的设备列表
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  // 当前连接的设备
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);
  // 蓝牙状态
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>(
    BluetoothState.Unknown,
  );
  // 蓝牙是否开启
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  // 扫描超时定时器
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 连接状态
  const [isConnecting, setIsConnecting] = useState(false);

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

  /**
   * 开始扫描蓝牙设备
   */
  /**
   * 开始扫描蓝牙设备
   * @param scanConfig 扫描配置
   */
  const startScan = async () => {
    if (isScanning) {
      console.log('扫描已在进行中');
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

    try {
      // 扫描所有设备，不再按服务UUID过滤
      // 第二个参数（扫描时长）设置为0，表示持续扫描，由我们自己的超时控制停止
      BleManager.scan([], 5, true).then(() => {
        setIsScanning(true);
        isScanningRef.current = true;
        setDevices([]);
        console.log('开始扫描', dayjs().format('YYYY-MM-DD HH:mm:ss'));
      });

      const timeoutId = setTimeout(() => {
        stopScan();
      }, scanConfig.duration);
      scanTimeoutRef.current = timeoutId;
    } catch (error) {
      console.error('❌ BLE扫描失败:', error);
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  /**
   * 停止扫描蓝牙设备
   */
  const stopScan = useCallback(() => {
    console.log('stopScan方法:进行停止');
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    if (isScanningRef.current) {
      console.log(
        'isScanningRef.current为true，进行扫描停止',
        dayjs().format('YYYY-MM-DD HH:mm:ss'),
      );
      BleManager.stopScan()
        .catch(err =>
          console.error(
            `[${new Date().toISOString()}] BleManager.stopScan 失败`,
            err,
          ),
        )
        .finally(() => {
          console.log('扫描已停止', dayjs().format('YYYY-MM-DD HH:mm:ss'));
          // 立即更新UI状态，避免延迟
          setIsScanning(false);
          isScanningRef.current = false;
        });
    } else {
      // 如果没有在扫描，也确保状态是正确的
      console.log('isScanningRef.current为false，不进行扫描停止');
      setIsScanning(false);
      isScanningRef.current = false;
    }
  }, []);

  /**
   * 连接到指定设备
   * @param device 要连接的设备
   */
  const connectDevice = async (device: BluetoothDevice) => {
    if (isConnecting) {
      console.log('正在连接中，请稍候...');
      return;
    }

    setIsConnecting(true);
    try {
      // 如果已有连接，先断开
      if (connectedDevice?.id) {
        await BleManager.disconnect(connectedDevice.id);
        setConnectedDevice(null);
      }

      console.log(`正在连接到 ${device.id}...`);
      await BleManager.connect(device.id);
      console.log(`连接成功: ${device.id}`);

      requestAnimationFrame(() => {
        setConnectedDevice(device);
      });
      Alert.alert('连接成功', `已连接到 ${device.name || device.id}`);
    } catch (error) {
      console.error('连接失败:', error);
      Alert.alert('连接失败', `无法连接到 ${device.name || device.id}`);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * 断开当前连接的设备
   */
  const disconnectDevice = async () => {
    if (isConnecting) {
      console.log('正在连接中，无法断开');
      return;
    }
    if (connectedDevice) {
      try {
        console.log(`正在断开与 ${connectedDevice.id} 的连接...`);
        await BleManager.disconnect(connectedDevice.id);
        setConnectedDevice(null);
        console.log('已断开连接');
        Alert.alert('已断开连接');
      } catch (error) {
        console.error('断开连接失败:', error);
        Alert.alert('断开连接失败');
      }
    }
  };

  // 初始化 effect - 只运行一次
  useEffect(() => {
    logEnvironmentInfo();
    BleManager.start({showAlert: false});
    checkPermissions(); // Initial permission check
    checkBluetoothStatus();
  }, []); // 空依赖数组，只在组件挂载时运行一次

  // 事件监听器 effect - 只运行一次
  useEffect(() => {
    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
      if (!isScanningRef.current) {
        return;
      }
      console.log('发现新设备:', peripheral);

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

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        checkPermissions();
        checkBluetoothStatus();
      }
    };

    const handleStopScan = () => {
      if (isScanningRef.current) {
        setIsScanning(false);
        isScanningRef.current = false;
      }
    };

    const handleUpdateState = (data: {state: BluetoothState}) => {
      setBluetoothState(data.state);
      setIsBluetoothEnabled(data.state === BluetoothState.PoweredOn);
    };

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    const listeners = [
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateState',
        handleUpdateState,
      ),
    ];

    return () => {
      appStateSubscription.remove();
      listeners.forEach(listener => listener.remove());
    };
  }, []); // 空依赖数组，只在组件挂载时运行一次

  // 连接设备断开监听 effect
  useEffect(() => {
    const handleDisconnectedPeripheral = (data: {peripheral: string}) => {
      if (connectedDevice?.id === data.peripheral) {
        setConnectedDevice(null);
      }
    };

    const listener = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectedPeripheral,
    );

    return () => {
      listener.remove();
    };
  }, [connectedDevice]); // 只依赖 connectedDevice

  return {
    isScanning,
    devices,
    connectedDevice,
    bluetoothState,
    isBluetoothEnabled,
    isConnecting,
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
