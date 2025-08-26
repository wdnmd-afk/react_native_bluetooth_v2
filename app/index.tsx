import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';

import {useBluetooth} from '../hooks/useBluetooth';
import {
  BluetoothDevice,
  BluetoothState,
  isBluetoothLibraryAvailable,
} from '../utils/bluetoothUtils';
import BluetoothDeviceItem from '../components/BluetoothDeviceItem';
import BluetoothStatus from '../components/BluetoothStatus';
import LoadingOverlay from '../components/LoadingOverlay';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../lib/constants';

// 模拟设备数据，确保最小显示3个设备
const mockDevices: BluetoothDevice[] = [
  {
    id: 'mock-1',
    name: 'HP LaserJet Pro',
    address: '00:1B:44:11:3A:B7',
    rssi: -45,
    isConnected: false,
    isPaired: true,
  },
  {
    id: 'mock-2',
    name: 'Canon PIXMA',
    address: '00:1B:44:11:3A:B8',
    rssi: -62,
    isConnected: false,
    isPaired: false,
  },
  {
    id: 'mock-3',
    name: 'Epson WorkForce',
    address: '00:1B:44:11:3A:B9',
    rssi: -58,
    isConnected: false,
    isPaired: true,
  },
];

// 主应用组件
function HomeScreen(): React.JSX.Element {
  const {
    isScanning,
    devices: scannedDevices,
    connectedDevice,
    bluetoothState,
    isBluetoothEnabled,
    hasLocationPermission,
    hasBluetoothPermission,
    isCheckingPermissions,
    isConnecting,
    startScan,
    stopScan,
    connectDevice,
    disconnectDevice,
    requestLocationPermission,
    requestBluetoothPermission,
    openAppSettings,
  } = useBluetooth();

  // 合并扫描到的设备和模拟设备，确保最小显示3个设备
  const devices = React.useMemo(() => {
    const allDevices = [...scannedDevices];

    // 如果扫描到的设备少于3个，用模拟设备补充
    if (allDevices.length < 3) {
      const neededMockDevices = mockDevices.slice(0, 3 - allDevices.length);
      allDevices.push(...neededMockDevices);
    }

    return allDevices;
  }, [scannedDevices]);

  if (!isBluetoothLibraryAvailable()) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          蓝牙库不可用，请检查是否正确安装和链接。
        </Text>
      </SafeAreaView>
    );
  }

  // 渲染设备列表项
  const renderDeviceItem = ({item}: {item: BluetoothDevice}) => (
    <BluetoothDeviceItem
      device={item}
      onConnect={connectDevice}
      disabled={isScanning}
    />
  );

  // 获取加载消息
  const getLoadingMessage = () => {
    if (isScanning) return '正在扫描设备...';
    if (isConnecting) return '正在连接设备...';
    if (isCheckingPermissions) return '正在检查权限...';
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* 固定头部区域 */}
      <View style={styles.header}>
        <Text style={styles.title}>蓝牙打印机扫描</Text>
        <Text style={styles.subtitle}>搜索并连接附近的蓝牙设备</Text>
      </View>

      {/* 全局加载遮罩 */}
      <LoadingOverlay
        visible={isScanning || isCheckingPermissions || isConnecting}
        message={getLoadingMessage()}
      />

      {/* 固定状态信息区域 */}
      <BluetoothStatus
        bluetoothState={bluetoothState}
        isBluetoothEnabled={isBluetoothEnabled}
        hasLocationPermission={hasLocationPermission}
        hasBluetoothPermission={hasBluetoothPermission}
      />

      {/* 当前连接的设备 */}
      {connectedDevice && (
        <View style={styles.connectedSection}>
          <Text style={styles.sectionTitle}>当前连接设备</Text>
          <View style={styles.connectedDevice}>
            <Text style={styles.connectedDeviceName}>
              {connectedDevice.name}
            </Text>
            <Text style={styles.connectedDeviceId}>
              {connectedDevice.id}
            </Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectDevice}>
              <View style={styles.buttonContent}>
                <Text style={styles.disconnectButtonIcon}>🔌</Text>
                <Text style={styles.disconnectButtonText}>断开连接</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 固定控制按钮区域 */}
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
            <View style={styles.buttonContent}>
              <Text style={styles.scanButtonIcon}>🔍</Text>
              <Text style={styles.scanButtonText}>开始扫描</Text>
            </View>
            {(!hasLocationPermission ||
              !hasBluetoothPermission ||
              bluetoothState !== BluetoothState.PoweredOn) && (
              <Text style={styles.disabledHint}>
                {!hasLocationPermission
                  ? '需要定位权限'
                  : !hasBluetoothPermission
                  ? '需要蓝牙权限'
                  : '请先开启蓝牙'}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopScan}>
            <View style={styles.buttonContent}>
              <Text style={styles.stopButtonIcon}>⏹️</Text>
              <Text style={styles.stopButtonText}>停止扫描</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 权限请求按钮 */}
      {(!hasLocationPermission || !hasBluetoothPermission) && (
        <View style={styles.permissionSection}>
          {!hasLocationPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestLocationPermission}>
              <View style={styles.buttonContent}>
                <Text style={styles.permissionButtonIcon}>📍</Text>
                <Text style={styles.permissionButtonText}>请求定位权限</Text>
              </View>
            </TouchableOpacity>
          )}
          {!hasBluetoothPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestBluetoothPermission}>
              <View style={styles.buttonContent}>
                <Text style={styles.permissionButtonIcon}>📶</Text>
                <Text style={styles.permissionButtonText}>请求蓝牙权限</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openAppSettings}>
            <View style={styles.buttonContent}>
              <Text style={styles.settingsButtonIcon}>⚙️</Text>
              <Text style={styles.settingsButtonText}>打开应用设置</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* 设备列表 */}
      <View style={styles.deviceListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            发现的设备 ({scannedDevices.length})
          </Text>
          {scannedDevices.length < devices.length && (
            <Text style={styles.mockDeviceHint}>
              包含 {devices.length - scannedDevices.length} 个示例设备
            </Text>
          )}
        </View>

        <FlatList
          data={devices}
          renderItem={renderDeviceItem}
          keyExtractor={item => item.id}
          style={styles.deviceList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.deviceListContent,
            { minHeight: 240 } // 确保最小高度能显示3个设备项
          ]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📱</Text>
              <Text style={styles.emptyStateText}>
                {isScanning ? '正在搜索设备...' : '暂无发现设备'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {isScanning
                  ? '请确保目标设备已开启蓝牙并处于可发现状态'
                  : '点击"开始扫描"按钮搜索附近的蓝牙设备'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  connectedSection: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  mockDeviceHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  connectedDevice: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connectedDeviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  connectedDeviceId: {
    fontSize: 14,
    color: 'rgba(16, 185, 129, 0.8)',
    marginBottom: 12,
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  disconnectButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  controlSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scanButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  permissionSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  permissionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  settingsButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceListContainer: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    paddingBottom: 20,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    margin: 16,
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});

export default HomeScreen;