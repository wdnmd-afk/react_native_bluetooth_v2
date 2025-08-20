import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  // 获取认证状态和用户信息
  const { user, logout, loading } = useAuth();

  /**
   * 处理退出登录
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // 登出成功后，认证路由守卫会自动跳转到登录页面
            } catch (error) {
              console.error('登出失败:', error);
              Alert.alert('错误', '登出失败，请重试');
            }
          },
        },
      ]
    );
  }, [logout]);

  const menuItems = [
    { id: 1, title: '设备管理', subtitle: '管理已连接的蓝牙设备', icon: '📱' },
    { id: 2, title: '连接历史', subtitle: '查看设备连接记录', icon: '📊' },
    { id: 3, title: '应用设置', subtitle: '个性化设置选项', icon: '⚙️' },
    { id: 4, title: '帮助中心', subtitle: '使用指南和常见问题', icon: '❓' },
    { id: 5, title: '关于我们', subtitle: '应用信息和版本', icon: 'ℹ️' },
    { id: 6, title: '退出登录', subtitle: '安全退出当前账户', icon: '🚪', action: handleLogout, isLogout: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部个人信息区域 */}
        <View style={styles.headerSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.username || '用户名'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {user?.isActive ? '已激活' : '未激活'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 统计信息卡片 */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>已配对设备</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>48</Text>
              <Text style={styles.statLabel}>连接次数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>使用天数</Text>
            </View>
          </View>
        </View>

        {/* 菜单列表 */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === 0 && styles.firstMenuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
                (item as any).isLogout && styles.logoutMenuItem,
              ]}
              activeOpacity={0.7}
              onPress={(item as any).action || (() => console.log(`点击了${item.title}`))}
              disabled={loading}
            >
              <View style={styles.menuIcon}>
                <Text style={[
                  styles.menuIconText,
                  (item as any).isLogout && styles.logoutIcon
                ]}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={[
                  styles.menuTitle,
                  (item as any).isLogout && styles.logoutTitle
                ]}>{item.title}</Text>
                <Text style={[
                  styles.menuSubtitle,
                  (item as any).isLogout && styles.logoutSubtitle
                ]}>{item.subtitle}</Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={[
                  styles.arrowText,
                  (item as any).isLogout && styles.logoutArrow
                ]}>›</Text>
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
  profileCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(147, 197, 253, 0.5)',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  firstMenuItem: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastMenuItem: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  menuArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '300',
  },
  // 退出登录相关样式
  logoutMenuItem: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutIcon: {
    color: '#ef4444',
  },
  logoutTitle: {
    color: '#ef4444',
    fontWeight: '600',
  },
  logoutSubtitle: {
    color: 'rgba(239, 68, 68, 0.7)',
  },
  logoutArrow: {
    color: '#ef4444',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;