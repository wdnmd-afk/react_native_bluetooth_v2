import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BluetoothDevice } from '../utils/bluetoothUtils';

interface BluetoothDeviceItemProps {
  device: BluetoothDevice;
  onConnect: (device: BluetoothDevice) => void;
  disabled?: boolean;
}

// 使用React.memo优化的现代化设备卡片组件
const BluetoothDeviceItem: React.FC<BluetoothDeviceItemProps> = React.memo(({
  device,
  onConnect,
  disabled = false,
}) => {
  // 使用useMemo缓存信号强度颜色计算
  const signalStrengthColor = useMemo(() => {
    if (!device.rssi) return '#6b7280';
    if (device.rssi > -50) return '#10b981'; // 强信号
    if (device.rssi > -70) return '#f59e0b'; // 中等信号
    return '#ef4444'; // 弱信号
  }, [device.rssi]);

  // 使用useMemo缓存设备状态颜色
  const deviceStatusColor = useMemo(() => {
    if (device.isConnected) return '#10b981';
    if (device.isPaired) return '#3b82f6';
    return '#6b7280';
  }, [device.isConnected, device.isPaired]);

  // 使用useMemo缓存设备状态文本
  const deviceStatusText = useMemo(() => {
    if (device.isConnected) return '已连接';
    if (device.isPaired) return '已配对';
    return '未配对';
  }, [device.isConnected, device.isPaired]);

  return (
    <TouchableOpacity
      style={[styles.deviceCard, disabled && styles.deviceCardDisabled]}
      onPress={() => onConnect(device)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[
          'rgba(30, 58, 138, 0.15)',
          'rgba(59, 130, 246, 0.1)',
          'rgba(30, 58, 138, 0.05)'
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.deviceCardGradient}
      >
        {/* 设备信息主区域 */}
        <View style={styles.deviceMainInfo}>
          <View style={styles.deviceHeaderRow}>
            <View style={styles.deviceIconContainer}>
              <Text style={styles.deviceIcon}>
                {device.isConnected ? '🔗' : device.isPaired ? '📱' : '🔍'}
              </Text>
              <View style={[styles.statusIndicator, { backgroundColor: deviceStatusColor }]} />
            </View>
            
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName} numberOfLines={1}>
                {device.name || '未知设备'}
              </Text>
              <View style={styles.deviceMetaRow}>
                <Text style={styles.deviceId} numberOfLines={1}>
                  {device.id}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${deviceStatusColor}20` }]}>
                  <Text style={[styles.statusText, { color: deviceStatusColor }]}>
                    {deviceStatusText}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* 信号强度显示 */}
          {device.rssi && (
            <View style={styles.signalContainer}>
              <View style={styles.signalBars}>
                {[1, 2, 3, 4].map((bar) => (
                  <View
                    key={bar}
                    style={[
                      styles.signalBar,
                      {
                        backgroundColor: device.rssi && device.rssi > -50 - (bar * 10)
                          ? signalStrengthColor
                          : 'rgba(255, 255, 255, 0.2)',
                        height: bar * 3 + 4,
                      }
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.signalText, { color: signalStrengthColor }]}>
                {device.rssi} dBm
              </Text>
            </View>
          )}
        </View>
        
        {/* 连接按钮 */}
        <TouchableOpacity
          style={styles.connectButtonContainer}
          onPress={() => onConnect(device)}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={disabled 
              ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
              : device.isConnected
              ? ['#ef4444', '#dc2626']
              : ['#3b82f6', '#1d4ed8']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.connectButtonGradient}
          >
            <Text style={styles.connectButtonIcon}>
              {device.isConnected ? '🔌' : '🔗'}
            </Text>
            <Text style={styles.connectButtonText}>
              {device.isConnected ? '断开' : '连接'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  // 设备卡片主容器
  deviceCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    shadowColor: '#1e3a8a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  deviceCardDisabled: {
    opacity: 0.5,
  },
  deviceCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  // 设备信息主区域
  deviceMainInfo: {
    flex: 1,
    marginBottom: 12,
  },
  deviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceIconContainer: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
  },
  deviceIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  deviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceId: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // 信号强度显示
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 8,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  signalText: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  // 连接按钮
  connectButtonContainer: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 80,
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  connectButtonIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default BluetoothDeviceItem;