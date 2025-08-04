import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// 模拟数据
const mockData = {
  totalPrints: 1247,
  successRate: 94.2,
  avgPrintTime: 3.5,
  paperSaved: 156,
  monthlyData: [
    { month: '1月', prints: 98, success: 92 },
    { month: '2月', prints: 124, success: 95 },
    { month: '3月', prints: 156, success: 93 },
    { month: '4月', prints: 189, success: 96 },
    { month: '5月', prints: 167, success: 94 },
    { month: '6月', prints: 203, success: 97 },
  ],
  deviceUsage: [
    { name: 'HP LaserJet Pro', usage: 45, prints: 561 },
    { name: 'Canon PIXMA', usage: 32, prints: 399 },
    { name: 'Epson WorkForce', usage: 23, prints: 287 },
  ],
  printTypes: [
    { type: '文档', count: 687, percentage: 55 },
    { type: '图片', count: 312, percentage: 25 },
    { type: '表格', count: 186, percentage: 15 },
    { type: '其他', count: 62, percentage: 5 },
  ],
};

const DataAnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // 简单的条形图组件
  const BarChart = ({ data, maxValue }: { data: any[]; maxValue: number }) => (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: (item.prints / maxValue) * 100,
                  backgroundColor: `hsl(${220 + index * 20}, 70%, 60%)`,
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{item.month}</Text>
          <Text style={styles.barValue}>{item.prints}</Text>
        </View>
      ))}
    </View>
  );

  // 环形进度条组件
  const CircularProgress = ({ 
    percentage, 
    size = 80, 
    strokeWidth = 8,
    color = '#3b82f6' 
  }: { 
    percentage: number; 
    size?: number; 
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={[styles.circularProgress, { width: size, height: size }]}>
        <View style={styles.circularProgressInner}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
        {/* 这里应该使用SVG，但为了简化，我们用View模拟 */}
        <View
          style={[
            styles.progressRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>数据分析</Text>
          <Text style={styles.headerSubtitle}>
            查看打印统计和使用分析
          </Text>

          {/* 时间段选择 */}
          <View style={styles.periodSelector}>
            {['week', 'month', 'year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextActive,
                  ]}
                >
                  {period === 'week' ? '本周' : period === 'month' ? '本月' : '本年'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 关键指标 */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{mockData.totalPrints}</Text>
              <Text style={styles.metricLabel}>总打印数</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{mockData.successRate}%</Text>
              <Text style={styles.metricLabel}>成功率</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{mockData.avgPrintTime}min</Text>
              <Text style={styles.metricLabel}>平均时长</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{mockData.paperSaved}</Text>
              <Text style={styles.metricLabel}>节省纸张</Text>
            </View>
          </View>
        </View>

        {/* 月度趋势图 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>月度打印趋势</Text>
          <View style={styles.chartWrapper}>
            <BarChart 
              data={mockData.monthlyData} 
              maxValue={Math.max(...mockData.monthlyData.map(d => d.prints))}
            />
          </View>
        </View>

        {/* 设备使用情况 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设备使用情况</Text>
          {mockData.deviceUsage.map((device, index) => (
            <View key={index} style={styles.deviceUsageItem}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.devicePrints}>{device.prints} 次打印</Text>
              </View>
              <View style={styles.usageBar}>
                <View
                  style={[
                    styles.usageProgress,
                    {
                      width: `${device.usage}%`,
                      backgroundColor: `hsl(${120 + index * 60}, 60%, 50%)`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.usagePercentage}>{device.usage}%</Text>
            </View>
          ))}
        </View>

        {/* 打印类型分布 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>打印类型分布</Text>
          <View style={styles.printTypesContainer}>
            <View style={styles.printTypesChart}>
              <CircularProgress percentage={mockData.successRate} size={120} />
            </View>
            <View style={styles.printTypesLegend}>
              {mockData.printTypes.map((type, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: `hsl(${index * 90}, 60%, 50%)` },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {type.type} ({type.percentage}%)
                  </Text>
                  <Text style={styles.legendCount}>{type.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 性能指标 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性能指标</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceTitle}>连接稳定性</Text>
              <CircularProgress percentage={96} size={60} color="#10b981" />
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceTitle}>打印速度</Text>
              <CircularProgress percentage={88} size={60} color="#f59e0b" />
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceTitle}>错误率</Text>
              <CircularProgress percentage={4} size={60} color="#ef4444" />
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceTitle}>用户满意度</Text>
              <CircularProgress percentage={92} size={60} color="#8b5cf6" />
            </View>
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
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
  },
  periodButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  periodButtonTextActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  chartWrapper: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  deviceUsageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  devicePrints: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  usageBar: {
    flex: 2,
    height: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 4,
    marginHorizontal: 16,
  },
  usageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  usagePercentage: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
  printTypesContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  printTypesChart: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  printTypesLegend: {
    flex: 1,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  legendCount: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressRing: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  performanceTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DataAnalyticsScreen;
