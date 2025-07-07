/**
 * 蓝牙打印机应用
 * 支持搜索和连接蓝牙打印机设备
 *
 * @format
 */

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
} from './hooks/useBluetooth';

// 主应用组件
function App(): React.JSX.Element {
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
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loadingIndicator}
              />
              <Text style={styles.stopButtonText}>停止扫描</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 权限请求按钮 */}
        {!hasLocationPermission && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}>
            <View style={styles.buttonContent}>
              <Text style={styles.permissionButtonIcon}>📍</Text>
              <Text style={styles.permissionButtonText}>
                请求定位权限
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {!hasBluetoothPermission && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestBluetoothPermission}>
            <View style={styles.buttonContent}>
              <Text style={styles.permissionButtonIcon}>📶</Text>
              <Text style={styles.permissionButtonText}>
                请求蓝牙权限
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 设备列表标题 */}
      <View style={styles.deviceListHeader}>
        <Text style={styles.deviceListTitle}>
          发现的设备 ({devices.length})
        </Text>
      </View>

      {/* 独立滚动的设备列表 */}
      <View style={styles.deviceListContainer}>
        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={renderDeviceItem}
          scrollEnabled={!isScanning && !isConnecting}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {isScanning ? '正在搜索设备...' : '暂无发现设备'}
              </Text>
            </View>
          }
          style={styles.deviceList}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eaf6',
  },
  listContainer: {
    paddingVertical: 8,
  },
  header: {
    backgroundColor: 'rgba(26, 35, 126, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 0,
    shadowColor: '#1a237e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  statusSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 16,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#3f51b5',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  connectedSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 16,
    marginTop: 0,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#4caf50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  connectedDevice: {
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  connectedDeviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 6,
  },
  connectedDeviceId: {
    fontSize: 13,
    color: '#5e7e61',
    marginBottom: 10,
  },
  disconnectButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#f44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disconnectButtonIcon: {
    fontSize: 16,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  controlSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 16,
    marginTop: 0,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.1)',
  },
  scanButton: {
    backgroundColor: 'rgba(63, 81, 181, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    backgroundColor: 'rgba(158, 158, 158, 0.7)',
    shadowColor: '#9e9e9e',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  disabledHint: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#f44336',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#ffc107',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  permissionButtonIcon: {
    fontSize: 18,
  },
  permissionButtonText: {
    color: '#1a237e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 14,
  },
  deviceListHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(63, 81, 181, 0.1)',
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  deviceListContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  deviceList: {
    flex: 1,
  },
  deviceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 18,
    borderRadius: 14,
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 6,
  },
  deviceId: {
    fontSize: 13,
    color: '#5c6bc0',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  deviceRssi: {
    fontSize: 13,
    color: '#3f51b5',
    marginBottom: 10,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#3f51b5',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#3f51b5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7986cb',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0,0,0,0.3)`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#1a237e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(63, 81, 181, 0.2)',
  },
  loadingText: {
    color: '#1a237e',
    fontSize: 17,
    marginTop: 16,
    fontWeight: '600',
  },
});

export default App;
