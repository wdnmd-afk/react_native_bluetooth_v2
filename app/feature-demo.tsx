import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

// 使用React.memo优化的功能卡片组件
const FeatureCard: React.FC<{
  feature: {
    id: number;
    title: string;
    description: string;
    icon: string;
    status: string;
  };
  onPress?: () => void;
}> = React.memo(({ feature, onPress }) => {
  // 使用useMemo缓存状态颜色计算，避免每次渲染时重新计算
  const statusColor = useMemo(() => {
    switch (feature.status) {
      case '已实现':
        return '#10b981';
      case '开发中':
        return '#f59e0b';
      case '计划中':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }, [feature.status]);

  const statusBgColor = useMemo(() => {
    switch (feature.status) {
      case '已实现':
        return 'rgba(16, 185, 129, 0.2)';
      case '开发中':
        return 'rgba(245, 158, 11, 0.2)';
      case '计划中':
        return 'rgba(107, 114, 128, 0.2)';
      default:
        return 'rgba(107, 114, 128, 0.2)';
    }
  }, [feature.status]);

  return (
    <TouchableOpacity
      style={styles.featureCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.featureHeader}>
        <Text style={styles.featureIcon}>{feature.icon}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: statusBgColor }
        ]}>
          <Text style={[
            styles.statusText,
            { color: statusColor }
          ]}>
            {feature.status}
          </Text>
        </View>
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </TouchableOpacity>
  );
});

type FeatureDemoNavigationProp = StackNavigationProp<RootStackParamList, 'FeatureDemo'>;

// 主功能展示组件
const FeatureDemoScreen: React.FC = () => {
  const navigation = useNavigation<FeatureDemoNavigationProp>();

  // 使用useMemo缓存功能列表，避免每次渲染时重新创建
  const features = useMemo(() => [
    {
      id: 1,
      title: '蓝牙设备扫描',
      description: '快速扫描附近的蓝牙设备，支持实时更新设备列表',
      icon: '📡',
      status: '已实现',
    },
    {
      id: 2,
      title: '设备自动配对',
      description: '智能识别未配对设备并自动完成配对流程',
      icon: '🔗',
      status: '已实现',
    },
    {
      id: 3,
      title: '权限智能管理',
      description: '自动检测并请求必要的蓝牙和定位权限',
      icon: '🔐',
      status: '已实现',
    },
    {
      id: 4,
      title: '实时状态监控',
      description: '实时显示蓝牙状态、连接状态和设备信息',
      icon: '📊',
      status: '已实现',
    },
    {
      id: 5,
      title: '打印功能',
      description: '支持多种格式的蓝牙打印功能',
      icon: '🖨️',
      status: '开发中',
    },
    {
      id: 6,
      title: '数据传输',
      description: '高速稳定的蓝牙数据传输功能',
      icon: '📤',
      status: '计划中',
    },
  ], []);

  // 使用useCallback优化返回事件处理函数，避免不必要的重新渲染
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 使用useCallback优化功能卡片点击事件
  const handleFeaturePress = useCallback((featureId: number) => {
    console.log(`点击了功能: ${featureId}`);
    // 这里可以添加具体的功能操作逻辑
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部介绍 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>功能展示</Text>
          <Text style={styles.headerSubtitle}>
            探索MyPrinterApp的强大功能特性
          </Text>
        </View>

        {/* 统计卡片 */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>已实现</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>开发中</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>计划中</Text>
            </View>
          </View>
        </View>

        {/* 功能列表 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>功能特性</Text>
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onPress={() => handleFeaturePress(feature.id)}
            />
          ))}
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// 使用React.memo优化组件，避免不必要的重新渲染
const MemoizedFeatureDemoScreen = React.memo(FeatureDemoScreen);

// 样式定义
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
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 16,
    padding: 20,
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
  featuresSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  // FeatureCard组件的样式
  featureCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MemoizedFeatureDemoScreen;
