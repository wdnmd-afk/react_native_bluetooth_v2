import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

const DiscoverScreen: React.FC = () => {
  const nearbyDevices = [
    { id: 1, name: 'iPhone 13', type: '手机', distance: '2m', signal: 85 },
    { id: 2, name: 'MacBook Pro', type: '电脑', distance: '5m', signal: 72 },
    { id: 3, name: 'AirPods Pro', type: '耳机', distance: '1m', signal: 95 },
    { id: 4, name: 'iPad Air', type: '平板', distance: '8m', signal: 58 },
  ];

  const getSignalColor = (signal: number) => {
    if (signal >= 80) return '#10b981';
    if (signal >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSignalBars = (signal: number) => {
    const bars = Math.ceil(signal / 25);
    return Array.from({ length: 4 }, (_, index) => (
      <View
        key={index}
        style={[
          styles.signalBar,
          {
            height: 4 + index * 3,
            backgroundColor: index < bars ? getSignalColor(signal) : 'rgba(255, 255, 255, 0.2)',
          },
        ]}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部标题 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>设备发现</Text>
          <Text style={styles.headerSubtitle}>扫描附近的蓝牙设备</Text>
        </View>

        {/* 扫描状态 */}
        <View style={styles.scanSection}>
          <View style={styles.scanCard}>
            <View style={styles.scanIndicator}>
              <View style={styles.scanRipple} />
              <View style={styles.scanCenter} />
            </View>
            <View style={styles.scanInfo}>
              <Text style={styles.scanTitle}>正在扫描...</Text>
              <Text style={styles.scanText}>已发现 {nearbyDevices.length} 个设备</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton}>
              <Text style={styles.refreshText}>刷新</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 附近设备列表 */}
        <View style={styles.devicesSection}>
          <Text style={styles.sectionTitle}>附近设备</Text>
          {nearbyDevices.map((device, index) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceItem,
                index === 0 && styles.firstDeviceItem,
                index === nearbyDevices.length - 1 && styles.lastDeviceItem,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.deviceIcon}>
                <Text style={styles.deviceIconText}>
                  {device.type === '手机' ? '📱' : 
                   device.type === '电脑' ? '💻' : 
                   device.type === '耳机' ? '🎧' : '📱'}
                </Text>
              </View>
              <View style={styles.deviceContent}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceType}>{device.type} • {device.distance}</Text>
              </View>
              <View style={styles.signalContainer}>
                <View style={styles.signalBars}>
                  {getSignalBars(device.signal)}
                </View>
                <Text style={styles.signalText}>{device.signal}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 快速操作 */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>配对设备</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>设置可见性</Text>
            </TouchableOpacity>
          </View>
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
  },
  scanSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  scanCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  scanIndicator: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  scanRipple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
    opacity: 0.6,
  },
  scanCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  scanInfo: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  scanText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  refreshButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  refreshText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  devicesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  deviceItem: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
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
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceIconText: {
    fontSize: 18,
  },
  deviceContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  signalContainer: {
    alignItems: 'center',
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  signalText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionsSection: {
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#3b82f6',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DiscoverScreen;