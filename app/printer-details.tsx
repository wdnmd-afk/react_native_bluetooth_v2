import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAppRouter } from '../utils/navigation';
import { RootStackParamList } from '../types/navigation';

type PrinterDetailsRouteProp = RouteProp<RootStackParamList, 'PrinterDetails'>;

const PrinterDetailsScreen: React.FC = () => {
  const route = useRoute<PrinterDetailsRouteProp>();
  const router = useAppRouter();
  const { deviceId, deviceName } = route.params;

  const [activeTab, setActiveTab] = useState('overview');

  // 模拟设备详细信息
  const deviceDetails = {
    id: deviceId,
    name: deviceName,
    model: 'HP LaserJet Pro M404dn',
    serialNumber: 'VNC8K12345',
    firmwareVersion: '2.41.0',
    status: 'online',
    batteryLevel: 85,
    paperLevel: 67,
    inkLevel: 42,
    totalPrints: 2847,
    lastMaintenance: '2024-01-10',
    connectionType: 'Bluetooth 5.0',
    ipAddress: '192.168.1.100',
    macAddress: '00:1B:44:11:3A:B7',
  };

  // 最近打印记录
  const recentPrints = [
    { id: 1, document: '报告.pdf', time: '2024-01-15 14:30', status: 'success', pages: 5 },
    { id: 2, document: '图片.jpg', time: '2024-01-15 13:15', status: 'success', pages: 1 },
    { id: 3, document: '表格.xlsx', time: '2024-01-15 11:45', status: 'failed', pages: 3 },
    { id: 4, document: '文档.docx', time: '2024-01-15 09:20', status: 'success', pages: 8 },
  ];

  // 维护记录
  const maintenanceHistory = [
    { id: 1, type: '清洁打印头', date: '2024-01-10', technician: '系统自动' },
    { id: 2, type: '更换墨盒', date: '2024-01-05', technician: '用户操作' },
    { id: 3, type: '校准打印', date: '2023-12-28', technician: '系统自动' },
    { id: 4, type: '固件更新', date: '2023-12-20', technician: '系统自动' },
  ];

  // 处理测试打印
  const handleTestPrint = () => {
    Alert.alert(
      '测试打印',
      '确定要执行测试打印吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            Alert.alert('成功', '测试打印已发送到设备');
          },
        },
      ]
    );
  };

  // 处理设备重启
  const handleRestart = () => {
    Alert.alert(
      '重启设备',
      '确定要重启打印机吗？这将中断当前的打印任务。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重启',
          style: 'destructive',
          onPress: () => {
            Alert.alert('成功', '设备重启命令已发送');
          },
        },
      ]
    );
  };

  // 跳转到设置页面（嵌套路由示例）
  const handleOpenSettings = () => {
    router.push('PrinterSettings', { deviceId });
  };

  // Tab内容渲染
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* 设备状态卡片 */}
            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>设备状态</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>状态</Text>
                  <Text style={[styles.statusValue, { color: '#10b981' }]}>在线</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>电量</Text>
                  <Text style={styles.statusValue}>{deviceDetails.batteryLevel}%</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>纸张</Text>
                  <Text style={styles.statusValue}>{deviceDetails.paperLevel}%</Text>
                </View>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>墨水</Text>
                  <Text style={styles.statusValue}>{deviceDetails.inkLevel}%</Text>
                </View>
              </View>
            </View>

            {/* 设备信息卡片 */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>设备信息</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>型号</Text>
                  <Text style={styles.infoValue}>{deviceDetails.model}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>序列号</Text>
                  <Text style={styles.infoValue}>{deviceDetails.serialNumber}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>固件版本</Text>
                  <Text style={styles.infoValue}>{deviceDetails.firmwareVersion}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>连接方式</Text>
                  <Text style={styles.infoValue}>{deviceDetails.connectionType}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>MAC地址</Text>
                  <Text style={styles.infoValue}>{deviceDetails.macAddress}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'history':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.cardTitle}>最近打印记录</Text>
            {recentPrints.map((print) => (
              <View key={print.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDocument}>{print.document}</Text>
                  <Text style={styles.historyTime}>{print.time}</Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyPages}>{print.pages} 页</Text>
                  <View style={[
                    styles.historyStatus,
                    { backgroundColor: print.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.historyStatusText,
                      { color: print.status === 'success' ? '#10b981' : '#ef4444' }
                    ]}>
                      {print.status === 'success' ? '成功' : '失败'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 'maintenance':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.cardTitle}>维护记录</Text>
            {maintenanceHistory.map((maintenance) => (
              <View key={maintenance.id} style={styles.maintenanceItem}>
                <View style={styles.maintenanceInfo}>
                  <Text style={styles.maintenanceType}>{maintenance.type}</Text>
                  <Text style={styles.maintenanceDate}>{maintenance.date}</Text>
                </View>
                <Text style={styles.maintenanceTechnician}>{maintenance.technician}</Text>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部信息 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>{deviceName}</Text>
          <Text style={styles.headerSubtitle}>设备ID: {deviceId}</Text>
          
          {/* 快速操作按钮 */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTestPrint}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>测试打印</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.settingsButton]}
              onPress={handleOpenSettings}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsButtonText}>设备设置</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.restartButton]}
              onPress={handleRestart}
              activeOpacity={0.7}
            >
              <Text style={styles.restartButtonText}>重启设备</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab导航 */}
        <View style={styles.tabNavigation}>
          {[
            { key: 'overview', label: '概览' },
            { key: 'history', label: '历史记录' },
            { key: 'maintenance', label: '维护记录' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab内容 */}
        {renderTabContent()}

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
    fontSize: 14,
    color: '#3b82f6',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  settingsButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  settingsButtonText: {
    color: '#3b82f6',
  },
  restartButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  restartButtonText: {
    color: '#ef4444',
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
  tabButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabButtonTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  historyInfo: {
    flex: 1,
  },
  historyDocument: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  historyDetails: {
    alignItems: 'flex-end',
  },
  historyPages: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  historyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  maintenanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  maintenanceDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  maintenanceTechnician: {
    fontSize: 12,
    color: '#3b82f6',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default PrinterDetailsScreen;
