import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import {
  useBluetooth,
  BluetoothDevice,
  BluetoothState,
  getBluetoothStateText,
} from '../../hooks/useBluetooth';

// 主应用组件
function HomeScreen(): React.JSX.Element {
  const {
    isScanning,
    devices,
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
    isBluetoothLibraryAvailable,
  } = useBluetooth();

  if (!isBluetoothLibraryAvailable) {
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
        <Text style={styles.connectButtonIcon}>🔗</Text>
        <Text style={styles.connectButtonText}>连接</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* 固定头部区域 */}
      <View style={styles.header}>
        <Text style={styles.title}>蓝牙打印机扫描</Text>
        <Text style={styles.subtitle}>搜索并连接附近的蓝牙设备</Text>
      </View>

      {/* 全局加载遮罩 */}
      {(isScanning || isCheckingPermissions || isConnecting) && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3f51b5" />
            <Text style={styles.loadingText}>
              {isScanning
                ? '正在扫描设备...'
                : isConnecting
                ? '正在连接设备...'
                : '正在检查权限...'}
            </Text>
          </View>
        </View>
      )}

      {/* 固定状态信息区域 */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>蓝牙状态:</Text>
          <Text
            style={[
              styles.statusValue,
              {color: isBluetoothEnabled ? '#4caf50' : '#f44336'},
            ]}>
            {getBluetoothStateText(bluetoothState)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>定位权限:</Text>
          <Text
            style={[
              styles.statusValue,
              {color: hasLocationPermission ? '#4caf50' : '#f44336'},
            ]}>
            {hasLocationPermission ? '已授权' : '未授权'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>蓝牙权限:</Text>
          <Text
            style={[
              styles.statusValue,
              {color: hasBluetoothPermission ? '#4caf50' : '#f44336'},
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

      {/* 可滚动设备列表 */}
      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>未发现设备</Text>
          </View>
        )}
      />

      {/* 权限请求按钮 */}
      <View style={styles.permissionButtonsContainer}>
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
        {(!hasLocationPermission || !hasBluetoothPermission) && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={openAppSettings}>
            <Text style={styles.permissionButtonText}>打开应用设置</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#1a237e',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#c5cae9',
  },
  statusSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlSection: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  scanButton: {
    backgroundColor: '#3f51b5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonDisabled: {
    backgroundColor: '#9fa8da',
  },
  stopButton: {
    backgroundColor: '#c62828',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButtonIcon: {
    color: '#ffffff',
    fontSize: 20,
    marginRight: 10,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButtonIcon: {
    color: '#ffffff',
    fontSize: 20,
    marginRight: 10,
  },
  disabledHint: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  deviceItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  deviceId: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8eaf6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  connectButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  connectButtonText: {
    fontSize: 14,
    color: '#3f51b5',
    fontWeight: 'bold',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: '#888',
  },
  connectedSection: {
    backgroundColor: '#e8f5e9',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#4caf50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 10,
  },
  connectedDevice: {
    alignItems: 'center',
  },
  connectedDeviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  connectedDeviceId: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 15,
  },
  disconnectButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disconnectButtonIcon: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // 确保在最上层
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  loadingText: {
    marginLeft: 20,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
  },
  permissionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  permissionButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;