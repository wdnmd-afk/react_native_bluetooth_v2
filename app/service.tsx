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

const ServiceScreen: React.FC = () => {
  const services = [
    { id: 1, title: '设备配对', description: '快速配对蓝牙设备', status: '可用' },
    { id: 2, title: '数据传输', description: '高速数据传输服务', status: '可用' },
    { id: 3, title: '远程控制', description: '远程设备控制功能', status: '维护中' },
    { id: 4, title: '文件共享', description: '设备间文件共享', status: '可用' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部标题 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>蓝牙服务</Text>
          <Text style={styles.headerSubtitle}>管理和使用蓝牙相关服务</Text>
        </View>

        {/* 服务状态卡片 */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusIndicator} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>服务状态</Text>
              <Text style={styles.statusText}>所有服务正常运行</Text>
            </View>
          </View>
        </View>

        {/* 服务列表 */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>可用服务</Text>
          {services.map((service, index) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceItem,
                index === 0 && styles.firstServiceItem,
                index === services.length - 1 && styles.lastServiceItem,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <View style={[
                styles.serviceBadge,
                service.status === '可用' ? styles.availableBadge : styles.maintenanceBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  service.status === '可用' ? styles.availableText : styles.maintenanceText
                ]}>{service.status}</Text>
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
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statusCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  servicesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  serviceItem: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  firstServiceItem: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastServiceItem: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 0,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  serviceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  maintenanceBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  availableText: {
    color: '#10b981',
  },
  maintenanceText: {
    color: '#f59e0b',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ServiceScreen;