/**
 * 蓝牙打印机应用
 * 支持搜索和连接蓝牙打印机设备
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  AppState,
  Platform,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {usePermissions} from './hooks/usePermissions';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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
  } catch (error) {
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

// BLE状态枚举定义
enum BluetoothState {
  Unknown = 'unknown',
  Resetting = 'resetting',
  Unsupported = 'unsupported',
  Unauthorized = 'unauthorized',
  PoweredOff = 'poweredOff',
  PoweredOn = 'poweredOn',
}

// 获取BLE状态的文本描述
const getBluetoothStateText = (state: BluetoothState): string => {
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

// BLE设备接口定义
interface BluetoothDevice {
  id: string;
  name?: string;
  rssi?: number;
  advertising?: {
    localName?: string;
    manufacturerData?: any;
    serviceUUIDs?: string[];
  };
}

// 主应用组件
function App(): React.JSX.Element {
  // 使用权限管理 hook
  const {
    hasLocationPermission,
    hasBluetoothPermission,
    isCheckingPermissions,
    requestLocationPermission,
    requestBluetoothPermission,
    checkPermissions,
    openAppSettings,
  } = usePermissions();

  // 是否正在扫描蓝牙设备
  const [isScanning, setIsScanning] = useState(false);
  // 发现的蓝牙设备列表
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  // 当前连接的蓝牙设备
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);
  // 蓝牙状态
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>(
    BluetoothState.Unknown,
  );
  // 蓝牙是否已启用
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  // 扫描超时定时器
  const [scanTimeout, setScanTimeout] = useState<NodeJS.Timeout | null>(null);
  // 蓝牙库初始化失败提示是否已显示（避免重复弹窗）
  const [bluetoothLibraryErrorShown, setBluetoothLibraryErrorShown] =
    useState(false);

  // 重置蓝牙错误状态
  const resetBluetoothError = () => {
    setBluetoothLibraryErrorShown(false);
    console.log('蓝牙错误状态已重置，重新检查蓝牙库状态');

    // 显示当前状态信息给用户
    Alert.alert(
      '状态重置',
      `当前蓝牙状态: ${getBluetoothStateText(bluetoothState)}\n` +
        `蓝牙启用状态: ${isBluetoothEnabled ? '是' : '否'}\n` +
        `定位权限: ${hasLocationPermission ? '已授权' : '未授权'}\n` +
        `蓝牙权限: ${hasBluetoothPermission ? '已授权' : '未授权'}\n\n` +
        '正在重新检查状态...',
      [{text: '确定'}],
    );

    // 重新检查权限和蓝牙状态
    setTimeout(() => {
      checkAllPermissionsAndBluetooth();
    }, 500);
  };

  useEffect(() => {
    console.log('=== App组件初始化开始 ===');

    // 步骤1: 环境检测
    logEnvironmentInfo();

    // 步骤2: 蓝牙库可用性检查
    console.log('步骤2: 开始蓝牙库检查');
    if (!isBluetoothLibraryAvailable()) {
      console.error('❌ BleManager库未正确初始化');
      console.log('=== App组件初始化失败 ===');
      return;
    }

    // 步骤3: 初始化BLE管理器
    const initializeBleManager = async () => {
      try {
        console.log('初始化BleManager...');
        await BleManager.start({showAlert: false});
        console.log('✅ BleManager初始化成功');

        // 检查蓝牙状态
        await checkBluetoothStatus();
      } catch (error) {
        console.error('❌ BleManager初始化失败:', error);
      }
    };

    initializeBleManager();

    // 设置事件监听器
    const handleDiscoverPeripheral = (peripheral: any) => {
      console.log('发现设备:', peripheral);
      const device: BluetoothDevice = {
        id: peripheral.id,
        name:
          peripheral.name || peripheral.advertising?.localName || '未知设备',
        rssi: peripheral.rssi,
        advertising: peripheral.advertising,
      };

      setDevices(prevDevices => {
        const existingIndex = prevDevices.findIndex(d => d.id === device.id);
        if (existingIndex >= 0) {
          // 更新现有设备
          const newDevices = [...prevDevices];
          newDevices[existingIndex] = device;
          return newDevices;
        } else {
          // 添加新设备
          return [...prevDevices, device];
        }
      });
    };

    const handleStopScan = () => {
      console.log('扫描已停止');
      setIsScanning(false);
    };

    const handleUpdateValueForCharacteristic = (data: any) => {
      console.log('收到特征值更新:', data);
    };

    const handleDisconnectedPeripheral = (data: any) => {
      console.log('设备已断开连接:', data);
      if (connectedDevice && connectedDevice.id === data.peripheral) {
        setConnectedDevice(null);
      }
    };

    const handleConnectPeripheral = (data: any) => {
      console.log('设备已连接:', data);
    };

    // 添加事件监听器
    const listeners = [
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic,
      ),
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      ),
      bleManagerEmitter.addListener(
        'BleManagerConnectPeripheral',
        handleConnectPeripheral,
      ),
    ];

    // 处理应用状态变化的回调函数
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('应用回到前台，重新检查权限');
        checkAllPermissionsAndBluetooth();
      }
    };

    // 添加AppState监听器
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    console.log('=== App组件初始化完成 ===');

    return () => {
      // 清理事件监听器
      listeners.forEach(listener => listener.remove());
      subscription?.remove();

      // 组件卸载时停止扫描和清理定时器
      if (isScanning) {
        stopScan();
      }
      if (scanTimeout) {
        clearTimeout(scanTimeout);
      }
    };
  }, []);

  // 检查蓝牙状态
  const checkBluetoothStatus = async () => {
    console.log('=== 蓝牙状态检查开始 ===');

    try {
      // 检查BleManager是否可用
      if (!isBluetoothLibraryAvailable()) {
        console.warn('❌ BleManager库未正确初始化');
        setIsBluetoothEnabled(false);
        setBluetoothState(BluetoothState.Unsupported);

        // 只在第一次检测到问题时显示错误提示
        if (!bluetoothLibraryErrorShown) {
          console.log('显示BLE库初始化失败提示');
          setBluetoothLibraryErrorShown(true);
          Alert.alert(
            'BLE库初始化失败',
            'BLE功能初始化失败，请确保：\n1. 在真机上运行（模拟器不支持蓝牙）\n2. 重新安装应用\n3. 检查设备是否支持BLE功能',
            [
              {text: '我知道了', style: 'default'},
              {
                text: '查看解决方案',
                onPress: () => {
                  Alert.alert(
                    '解决步骤',
                    '1. 确保在真实设备上运行\n2. 重启应用\n3. 重新安装应用\n4. 检查设备是否支持BLE功能\n\n详细解决方案请查看BLUETOOTH_DIAGNOSTICS.md文件',
                  );
                },
              },
            ],
          );
        }
        console.log('=== 蓝牙状态检查结束（库不可用）===');
        return;
      }

      // 检查蓝牙状态
      const state = await BleManager.checkState();
      console.log('蓝牙状态:', state);

      const isOn = state === 'on';
      setIsBluetoothEnabled(isOn);
      setBluetoothState(
        isOn ? BluetoothState.PoweredOn : BluetoothState.PoweredOff,
      );

      console.log('=== 蓝牙状态检查完成 ===');
    } catch (error) {
      console.error('❌ 检查蓝牙状态失败:', error);
      setIsBluetoothEnabled(false);
      setBluetoothState(BluetoothState.Unknown);

      // 显示用户友好的错误提示
      Alert.alert(
        'BLE初始化失败',
        'BLE功能初始化失败，请确保设备支持BLE并重启应用。如果问题持续存在，请检查应用权限设置。',
      );

      console.log('=== 蓝牙状态检查结束（出现错误）===');
    }
  };

  // 检查所有必要权限和蓝牙状态
  const checkAllPermissionsAndBluetooth = async () => {
    // 检查蓝牙状态
    await checkBluetoothStatus();
    // 权限检查由 usePermissions hook 自动处理
  };

  // 提示用户启用蓝牙
  const promptEnableBluetooth = () => {
    Alert.alert(
      'BLE未启用',
      '请到设置中启用蓝牙功能以使用BLE设备扫描和连接功能。',
      [
        {text: '取消', style: 'cancel'},
        {text: '去设置', onPress: openAppSettings},
      ],
    );
  };

  // 开始扫描BLE设备
  const startScan = async () => {
    console.log('=== BLE设备扫描开始 ===');

    // 步骤1: 预检查
    console.log('步骤1: 扫描预检查');
    console.log('当前蓝牙状态:', bluetoothState);
    console.log('蓝牙是否启用:', isBluetoothEnabled);

    // 检查BleManager是否可用
    if (!isBluetoothLibraryAvailable()) {
      console.error('❌ BLE库不可用');
      Alert.alert('BLE功能不可用', 'BLE库未初始化，请重启应用');
      return;
    }

    if (!hasLocationPermission) {
      console.error('❌ 缺少定位权限');
      Alert.alert('权限不足', '请先授予定位权限', [
        {text: '去授权', onPress: requestLocationPermission},
        {text: '取消', style: 'cancel'},
      ]);
      return;
    }

    if (!hasBluetoothPermission) {
      console.error('❌ 缺少蓝牙权限');
      Alert.alert('权限不足', '请先授予蓝牙权限', [
        {text: '去授权', onPress: requestBluetoothPermission},
        {text: '取消', style: 'cancel'},
      ]);
      return;
    }

    if (bluetoothState !== BluetoothState.PoweredOn) {
      console.error('❌ 蓝牙未启用，无法开始扫描');
      Alert.alert('BLE未启用', '请先启用蓝牙功能', [
        {text: '去启用', onPress: promptEnableBluetooth},
        {text: '取消', style: 'cancel'},
      ]);
      return;
    }

    // 步骤2: 初始化扫描状态
    console.log('步骤2: 初始化扫描状态');
    setIsScanning(true);
    setDevices([]);
    console.log('✅ 扫描状态初始化完成');

    try {
      // 步骤3: 开始BLE扫描
      console.log('步骤3: 开始BLE扫描');
      console.log('调用BleManager.scan()...');
      await BleManager.scan([], 10, true); // 扫描所有设备，10秒超时，允许重复
      console.log('✅ 扫描命令发送成功');

      // 步骤4: 设置扫描超时
      console.log('步骤4: 设置10秒自动停止');
      const scanTimeoutId = setTimeout(() => {
        console.log('=== 扫描超时，自动停止 ===');
        stopScan();
        console.log('✅ BLE扫描已停止');
        console.log('=== 扫描超时处理完成 ===');
      }, 5000); // 10秒后自动停止扫描
      setScanTimeout(scanTimeoutId);

      console.log('=== BLE设备扫描启动完成 ===');
    } catch (error) {
      console.error('❌ BLE扫描失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      Alert.alert('扫描失败', 'BLE设备扫描失败，请检查蓝牙状态并重试');
      setIsScanning(false);
      console.log('=== BLE扫描失败结束 ===');
    }
  };

  // 停止BLE扫描 - 优化版本
  const stopScan = async () => {
    console.log('=== 停止BLE扫描开始 ===');

    try {
      // 🔥 关键改进：立即更新UI状态，提供即时反馈
      setIsScanning(false);

      // 清除超时定时器
      if (scanTimeout) {
        console.log('清除扫描超时定时器');
        clearTimeout(scanTimeout);
        setScanTimeout(null);
      }

      // 停止底层扫描
      if (isBluetoothLibraryAvailable()) {
        console.log('调用BleManager.stopScan()...');
        await BleManager.stopScan();
        console.log('✅ 扫描停止命令发送成功');
      } else {
        console.warn('BleManager不可用，无法停止扫描');
      }

      console.log('=== 停止BLE扫描完成 ===');
    } catch (error) {
      console.error('❌ 停止扫描失败:', error);
      // 即使出错也要确保UI状态正确
      setIsScanning(false);
      if (scanTimeout) {
        clearTimeout(scanTimeout);
        setScanTimeout(null);
      }
    }
  };

  // 连接到BLE设备
  const connectDevice = async (device: BluetoothDevice) => {
    console.log('=== 连接设备开始 ===', device.name, device.id);

    try {
      // 如果已有连接的设备，先断开
      if (connectedDevice) {
        console.log('断开当前连接的设备:', connectedDevice.name);
        await BleManager.disconnect(connectedDevice.id);
      }

      console.log('正在连接设备:', device.name);
      await BleManager.connect(device.id);
      console.log('✅ 设备连接成功');

      setConnectedDevice(device);
      Alert.alert('连接成功', `已成功连接到设备: ${device.name}`);

      console.log('=== 连接设备完成 ===');
    } catch (error) {
      console.error('❌ 连接设备失败:', error);
      Alert.alert('连接失败', `无法连接到设备: ${device.name}`);
      console.log('=== 连接设备失败结束 ===');
    }
  };

  // 断开设备连接
  const disconnectDevice = async () => {
    if (!connectedDevice) return;

    console.log('=== 断开设备连接开始 ===', connectedDevice.name);

    try {
      await BleManager.disconnect(connectedDevice.id);
      console.log('✅ 设备断开成功');

      setConnectedDevice(null);
      Alert.alert('断开成功', `已断开设备连接: ${connectedDevice.name}`);

      console.log('=== 断开设备连接完成 ===');
    } catch (error) {
      console.error('❌ 断开设备失败:', error);
      Alert.alert('断开失败', `无法断开设备连接: ${connectedDevice.name}`);
      console.log('=== 断开设备连接失败结束 ===');
    }
  };

  // 渲染设备列表项
  const renderDeviceItem = ({item}: {item: BluetoothDevice}) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectDevice(item)}
      disabled={isScanning}>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || '未知设备'}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        {item.rssi && (
          <Text style={styles.deviceRssi}>信号强度: {item.rssi} dBm</Text>
        )}
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>连接</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        {/* 标题区域 */}
        <View style={styles.header}>
          <Text style={styles.title}>蓝牙打印机扫描</Text>
          <Text style={styles.subtitle}>搜索并连接附近的蓝牙设备</Text>
        </View>

        {/* 状态信息区域 */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>蓝牙状态:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: isBluetoothEnabled ? '#28a745' : '#dc3545'},
              ]}>
              {getBluetoothStateText(bluetoothState)}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>定位权限:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: hasLocationPermission ? '#28a745' : '#dc3545'},
              ]}>
              {hasLocationPermission ? '已授权' : '未授权'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>蓝牙权限:</Text>
            <Text
              style={[
                styles.statusValue,
                {color: hasBluetoothPermission ? '#28a745' : '#dc3545'},
              ]}>
              {hasBluetoothPermission ? '已授权' : '未授权'}
            </Text>
          </View>
        </View>

        {/* 当前连接的设备 */}
        {connectedDevice && (
          <View style={styles.connectedSection}>
            <Text style={styles.sectionTitle}>当前连接设备</Text>
            <View style={styles.connectedDevice}>
              <Text style={styles.connectedDeviceName}>
                {connectedDevice.name}
              </Text>
              <Text style={styles.connectedDeviceId}>{connectedDevice.id}</Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectDevice}>
                <Text style={styles.disconnectButtonText}>断开连接</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 控制按钮区域 */}
        <View style={styles.controlSection}>
          {!isScanning ? (
            <TouchableOpacity
              style={[
                styles.scanButton,
                (!hasLocationPermission ||
                  !hasBluetoothPermission ||
                  bluetoothState !== BluetoothState.PoweredOn) &&
                  styles.scanButtonDisabled,
              ]}
              onPress={startScan}
              disabled={
                !hasLocationPermission ||
                !hasBluetoothPermission ||
                bluetoothState !== BluetoothState.PoweredOn
              }>
              <Text style={styles.scanButtonText}>开始扫描</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopScan}>
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loadingIndicator}
              />
              <Text style={styles.stopButtonText}>停止扫描</Text>
            </TouchableOpacity>
          )}

          {/* 权限请求按钮 */}
          {!hasLocationPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestLocationPermission}>
              <Text style={styles.permissionButtonText}>请求定位权限</Text>
            </TouchableOpacity>
          )}

          {!hasBluetoothPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestBluetoothPermission}>
              <Text style={styles.permissionButtonText}>请求蓝牙权限</Text>
            </TouchableOpacity>
          )}

          {/* 重置错误状态按钮 */}
          {bluetoothLibraryErrorShown && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetBluetoothError}>
              <Text style={styles.resetButtonText}>重新检查状态</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 设备列表区域 */}
        <View style={styles.deviceSection}>
          <Text style={styles.sectionTitle}>发现的设备 ({devices.length})</Text>

          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {isScanning ? '正在搜索设备...' : '暂无发现设备'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={renderDeviceItem}
              style={styles.deviceList}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007bff',
    borderBottomWidth: 1,
    borderBottomColor: '#0056b3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  statusSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectedSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  connectedDevice: {
    marginTop: 8,
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 4,
  },
  connectedDeviceId: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 12,
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlSection: {
    margin: 16,
    marginTop: 0,
  },
  scanButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  permissionButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionButtonText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceSection: {
    margin: 16,
    marginTop: 0,
    overflow: 'visible',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  deviceList: {
    overflow: 'visible',
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#6c757d',
  },
  connectButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default App;
