import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { COLORS, SPACING } from '../lib/constants';

// 导入页面组件
import LoginScreen from '../app/login';
import RegisterScreen from '../app/register';
import TabLayout from '../app/_layout';

// 导入类型定义
import { AuthStackParamList, MainStackParamList } from '../types/navigation';

/**
 * 认证相关页面的Stack Navigator
 */
const AuthStack = createStackNavigator<AuthStackParamList>();

/**
 * 主应用页面的Stack Navigator  
 */
const MainStack = createStackNavigator<MainStackParamList>();

/**
 * 认证页面导航组件
 * 包含登录、注册等未认证用户可访问的页面
 */
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false, // 隐藏导航栏，使用自定义设计
        cardStyle: { backgroundColor: 'transparent' },
        animationEnabled: true,
        gestureEnabled: true,
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: '登录',
          animationTypeForReplace: 'push',
        }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: '注册',
          animationTypeForReplace: 'push',
        }}
      />
    </AuthStack.Navigator>
  );
};

/**
 * 主应用导航组件
 * 包含已认证用户可访问的所有页面
 */
const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false, // 使用TabLayout自己的导航
        cardStyle: { backgroundColor: 'transparent' },
        animationEnabled: true,
      }}
      initialRouteName="TabLayout"
    >
      <MainStack.Screen 
        name="TabLayout" 
        component={TabLayout}
        options={{
          title: '主页面',
        }}
      />
      {/* 这里可以添加其他需要认证的页面 */}
    </MainStack.Navigator>
  );
};

/**
 * 加载状态组件
 * 在检查认证状态时显示
 */
const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>正在加载...</Text>
      </View>
    </View>
  );
};

/**
 * 根认证导航组件
 * 根据用户认证状态决定显示认证页面还是主应用页面
 */
const RootAuthNavigator: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // 显示加载状态
  if (loading) {
    return <LoadingScreen />;
  }

  // 根据认证状态返回对应的导航组件
  if (isAuthenticated && user) {
    console.log('用户已认证，显示主应用页面:', { userId: user.id, username: user.username });
    return <MainNavigator />;
  } else {
    console.log('用户未认证，显示认证页面');
    return <AuthNavigator />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default RootAuthNavigator;
export { AuthNavigator, MainNavigator, LoadingScreen };
