import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useAppRouter } from '../utils/navigation';

// 模拟设备数据
const mockDevices = [
  {
    id: '1',
    name: 'HP LaserJet Pro',
    type: 'Laser Printer',
    status: 'online',
    batteryLevel: 85,
    lastConnected: '2024-01-15 14:30',
    isAutoConnect: true,
  },
  {
    id: '2',
    name: 'Canon PIXMA',
    type: 'Inkjet Printer',
    status: 'offline',
    batteryLevel: 42,
    lastConnected: '2024-01-14 09:15',
    isAutoConnect: false,
  },
  {
    id: '3',
    name: 'Epson WorkForce',
    type: 'All-in-One',
    status: 'printing',
    batteryLevel: 67,
    lastConnected: '2024-01-15 16:45',
    isAutoConnect: true,
  },
];

const DeviceManagementScreen: React.FC = () => {
  const router = useAppRouter();
  const [devices, setDevices] = useState(mockDevices);

  // 处理设备连接/断开
  const handleDeviceToggle = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? {
              ...device,
              status: device.status === 'online' ? 'offline' : 'online',
              lastConnected: new Date().toLocaleString('zh-CN'),
            }
          : device
      )
    );
  };

  // 处理自动连接开关
  const handleAutoConnectToggle = (deviceId: string) => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.id === deviceId
          ? { ...device, isAutoConnect: !device.isAutoConnect }
          : device
      )
    );
  };

  // 删除设备
  const handleDeleteDevice = (deviceId: string, deviceName: string) => {
    Alert.alert(
      '删除设备',
      `确定要删除设备 "${deviceName}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setDevices(prevDevices =>
              prevDevices.filter(device => device.id !== deviceId)
            );
          },
        },
      ]
    );
  };

  // 跳转到设备详情页面
  const handleDeviceDetails = (device: any) => {
    router.push('PrinterDetails', {
      deviceId: device.id,
      deviceName: device.name,
    });
  };

  // 跳转到设备设置页面
  const handleDeviceSettings = (deviceId: string) => {
    router.push('PrinterSettings', { deviceId });
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'printing':
        return '#3b82f6';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '在线';
      case 'printing':
        return '打印中';
      case 'offline':
        return '离线';
      default:
        return '未知';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部统计 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>设备管理</Text>
          <Text style={styles.headerSubtitle}>
            管理您的蓝牙打印设备，配置连接和设置
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{devices.length}</Text>
              <Text style={styles.statLabel}>总设备</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {devices.filter(d => d.status === 'online').length}
              </Text>
              <Text style={styles.statLabel}>在线</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {devices.filter(d => d.isAutoConnect).length}
              </Text>
              <Text style={styles.statLabel}>自动连接</Text>
            </View>
          </View>
        </View>

        {/* 设备列表 */}
        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>设备列表</Text>
          {devices.map((device, index) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceItem,
                index === 0 && styles.firstDeviceItem,
                index === devices.length - 1 && styles.lastDeviceItem,
              ]}
              onPress={() => handleDeviceDetails(device)}
              activeOpacity={0.7}
            >
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceType}>{device.type}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(device.status)}20` }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(device.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(device.status) }
                  ]}>
                    {getStatusText(device.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.deviceDetails}>
                <Text style={styles.detailText}>
                  电量: {device.batteryLevel}%
                </Text>
                <Text style={styles.detailText}>
                  最后连接: {device.lastConnected}
                </Text>
              </View>

              <View style={styles.deviceActions}>
                <View style={styles.autoConnectRow}>
                  <Text style={styles.autoConnectLabel}>自动连接</Text>
                  <Switch
                    value={device.isAutoConnect}
                    onValueChange={() => handleAutoConnectToggle(device.id)}
                    trackColor={{ false: '#374151', true: '#3b82f6' }}
                    thumbColor={device.isAutoConnect ? '#ffffff' : '#9ca3af'}
                  />
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.connectButton]}
                    onPress={() => handleDeviceToggle(device.id)}
                  >
                    <Text style={styles.connectButtonText}>
                      {device.status === 'online' ? '断开' : '连接'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.settingsButton]}
                    onPress={() => handleDeviceSettings(device.id)}
                  >
                    <Text style={styles.settingsButtonText}>设置</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteDevice(device.id, device.name)}
                  >
                    <Text style={styles.deleteButtonText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  devicesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  deviceItem: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    padding: 16,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  firstDeviceItem: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastDeviceItem: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 0,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  deviceActions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.1)',
    paddingTop: 16,
  },
  autoConnectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  autoConnectLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  connectButtonText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  settingsButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  settingsButtonText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DeviceManagementScreen;
