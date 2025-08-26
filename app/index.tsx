import React, { useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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

// 主应用组件 - 使用React性能优化
const HomeScreen: React.FC = () => {
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

  // 使用useMemo缓存设备列表计算，提升性能
  const devices = useMemo(() => {
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

  // 使用useCallback优化渲染设备项函数，避免不必要的重新渲染
  const renderDeviceItem = useCallback(({item}: {item: BluetoothDevice}) => (
    <BluetoothDeviceItem
      device={item}
      onConnect={connectDevice}
      disabled={isScanning}
    />
  ), [connectDevice, isScanning]);

  // 使用useCallback优化加载消息获取函数
  const getLoadingMessage = useCallback(() => {
    if (isScanning) return '正在扫描设备...';
    if (isConnecting) return '正在连接设备...';
    if (isCheckingPermissions) return '正在检查权限...';
    return '';
  }, [isScanning, isConnecting, isCheckingPermissions]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Instagram风格的渐变头部区域 */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#6366f1']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>📱</Text>
            <View style={styles.scanPulse} />
          </View>
          <Text style={styles.title}>蓝牙设备中心</Text>
          <Text style={styles.subtitle}>发现并连接您的智能设备</Text>
          
          {/* 快速状态指示器 */}
          <View style={styles.quickStatusContainer}>
            <View style={[styles.statusDot, {
              backgroundColor: isBluetoothEnabled ? '#10b981' : '#ef4444'
            }]} />
            <Text style={styles.quickStatusText}>
              {isBluetoothEnabled ? '蓝牙已开启' : '蓝牙未开启'}
            </Text>
            <View style={[styles.statusDot, {
              backgroundColor: hasLocationPermission && hasBluetoothPermission ? '#10b981' : '#f59e0b'
            }]} />
            <Text style={styles.quickStatusText}>
              {hasLocationPermission && hasBluetoothPermission ? '权限正常' : '需要权限'}
            </Text>
          </View>
        </View>
      </LinearGradient>

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

      {/* 现代化控制按钮区域 */}
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
            activeOpacity={0.8}
            disabled={
              !hasLocationPermission ||
              !hasBluetoothPermission ||
              bluetoothState !== BluetoothState.PoweredOn
            }>
            <LinearGradient
              colors={(!hasLocationPermission ||
                !hasBluetoothPermission ||
                bluetoothState !== BluetoothState.PoweredOn) 
                ? ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
                : ['#3b82f6', '#1d4ed8', '#1e40af']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.scanButtonGradient}
            >
              <View style={styles.buttonContent}>
                <View style={styles.scanIconContainer}>
                  <Text style={styles.scanButtonIcon}>🔍</Text>
                  <View style={styles.scanRipple} />
                </View>
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
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={stopScan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626', '#b91c1c']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.stopButtonGradient}
            >
              <View style={styles.buttonContent}>
                <View style={styles.stopIconContainer}>
                  <Text style={styles.stopButtonIcon}>⏹️</Text>
                  <View style={styles.scanningAnimation} />
                </View>
                <Text style={styles.stopButtonText}>停止扫描</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* 现代化权限请求区域 */}
      {(!hasLocationPermission || !hasBluetoothPermission) && (
        <View style={styles.permissionSection}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionTitle}>🔒 需要权限</Text>
            <Text style={styles.permissionSubtitle}>为了提供更好的使用体验，请允许以下权限</Text>
          </View>
          
          <View style={styles.permissionCards}>
            {!hasLocationPermission && (
              <TouchableOpacity
                style={styles.permissionCard}
                onPress={requestLocationPermission}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706', '#b45309']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.permissionButtonGradient}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.permissionButtonIcon}>📍</Text>
                    <View style={styles.permissionTextContainer}>
                      <Text style={styles.permissionButtonText}>定位权限</Text>
                      <Text style={styles.permissionButtonSubtext}>用于扫描蓝牙设备</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {!hasBluetoothPermission && (
              <TouchableOpacity
                style={styles.permissionCard}
                onPress={requestBluetoothPermission}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#06b6d4', '#0891b2', '#0e7490']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.permissionButtonGradient}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.permissionButtonIcon}>📶</Text>
                    <View style={styles.permissionTextContainer}>
                      <Text style={styles.permissionButtonText}>蓝牙权限</Text>
                      <Text style={styles.permissionButtonSubtext}>用于连接设备</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.settingsCard}
              onPress={openAppSettings}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.settingsButtonGradient}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.settingsButtonIcon}>⚙️</Text>
                  <View style={styles.permissionTextContainer}>
                    <Text style={styles.settingsButtonText}>应用设置</Text>
                    <Text style={styles.settingsButtonSubtext}>手动修改权限</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 设备列表 */}
      <View style={styles.deviceListContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.deviceCountContainer}>
            <Text style={styles.sectionTitle}>
              📡 设备列表 ({scannedDevices.length})
            </Text>
            {isScanning && (
              <View style={styles.scanningIndicator}>
                <View style={styles.scanningDot} />
                <Text style={styles.scanningText}>扫描中</Text>
              </View>
            )}
          </View>
          {scannedDevices.length < devices.length && (
            <View style={styles.mockDeviceNotice}>
              <Text style={styles.mockDeviceHint}>
                ✨ 包含 {devices.length - scannedDevices.length} 个示例设备
              </Text>
            </View>
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
};

// 使用React.memo优化组件，避免不必要的重新渲染
const MemoizedHomeScreen = React.memo(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  
  // Instagram风格渐变头部样式
  headerGradient: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  headerContent: {
    padding: 24,
    alignItems: 'center',
  },
  headerIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 40,
  },
  scanPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -10,
    left: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  quickStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  quickStatusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 16,
  },
  
  // 控制按钮区域样式
  controlSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  scanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scanButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  scanIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  scanRipple: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: -4,
    left: -4,
  },
  stopButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  stopButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  stopIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  scanningAnimation: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: -2,
    left: -2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    fontSize: 18,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButtonIcon: {
    fontSize: 18,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // 权限区域样式
  permissionSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  permissionHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  permissionCards: {
    gap: 12,
  },
  permissionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingsButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  permissionButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  settingsButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  
  // 设备列表区域样式
  deviceListContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  deviceListGradient: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  deviceCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  scanningText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  mockDeviceNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  mockDeviceHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    paddingBottom: 20,
  },
  
  // 空状态样式
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateAnimation: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
  },
  searchPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    top: -6,
    left: -6,
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
    marginBottom: 20,
  },
  emptyStateTips: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  tipsTitle: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  
  // 其他样式
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
  connectedDevice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 16,
  },
  disconnectButtonIcon: {
    fontSize: 14,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scanButtonDisabled: {
    opacity: 0.5,
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

export default MemoizedHomeScreen;