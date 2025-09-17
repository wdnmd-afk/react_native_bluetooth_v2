import React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';
import { RootStackParamList, AuthStackParamList, MainStackParamList } from '../types/navigation';

// 导入认证相关页面组件
import LoginScreen from '../app/login';
import RegisterScreen from '../app/register';

// 导入主应用页面组件
import TabLayout from '../app/_layout';
import FeatureDemoScreen from '../app/feature-demo';
import DeviceManagementScreen from '../app/device-management';
import PrinterSettingsScreen from '../app/printer-settings';
import DataAnalyticsScreen from '../app/data-analytics';
import PrinterDetailsScreen from '../app/printer-details';
import LiveStreamingScreen from '../app/live-streaming';

// 路由配置项的类型定义
export interface RouteConfig {
  name: keyof RootStackParamList;           // 路由名称
  component: React.ComponentType<any>;      // 页面组件
  options?: StackNavigationOptions;         // 导航选项
  description?: string;                     // 路由描述
}

// 认证路由配置项的类型定义
export interface AuthRouteConfig {
  name: keyof AuthStackParamList;           // 认证路由名称
  component: React.ComponentType<any>;      // 页面组件
  options?: StackNavigationOptions;         // 导航选项
  description?: string;                     // 路由描述
}

// 主应用路由配置项的类型定义
export interface MainRouteConfig {
  name: keyof MainStackParamList;           // 主应用路由名称
  component: React.ComponentType<any>;      // 页面组件
  options?: StackNavigationOptions;         // 导航选项
  description?: string;                     // 路由描述
}

// 认证路由配置数组
export const authRouteConfigs: AuthRouteConfig[] = [
  {
    name: 'Login',
    component: LoginScreen,
    options: {
      headerShown: false,  // 使用自定义设计
      gestureEnabled: false, // 禁用手势返回
    },
    description: '登录页面 - 用户登录认证',
  },
  {
    name: 'Register',
    component: RegisterScreen,
    options: {
      headerShown: false,  // 使用自定义设计
      gestureEnabled: true, // 允许手势返回到登录页
    },
    description: '注册页面 - 用户注册账户',
  },
];

// 主应用路由配置数组
export const mainRouteConfigs: MainRouteConfig[] = [
  {
    name: 'TabLayout',
    component: TabLayout,
    options: {
      headerShown: false,  // 隐藏头部，使用Tab自己的导航
    },
    description: '主页面 - 包含底部Tab导航的页面组',
  },
  {
    name: 'FeatureDemo',
    component: FeatureDemoScreen,
    options: {
      headerShown: true,
      title: '功能展示',
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      gestureEnabled: true,
      // 自定义头部样式
      headerBackTitleVisible: false,  // 隐藏返回按钮文字
    },
    description: '功能展示页面 - 展示应用的所有功能特性',
  },
  {
    name: 'DeviceManagement',
    component: DeviceManagementScreen,
    options: {
      headerShown: true,
      title: '设备管理',
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      gestureEnabled: true,
    },
    description: '设备管理页面 - 管理所有蓝牙打印设备',
  },
  {
    name: 'PrinterSettings',
    component: PrinterSettingsScreen,
    options: {
      headerShown: true,
      title: '打印机设置',
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      gestureEnabled: true,
    },
    description: '打印机设置页面 - 配置打印机参数和选项',
  },
  {
    name: 'DataAnalytics',
    component: DataAnalyticsScreen,
    options: {
      headerShown: true,
      title: '数据分析',
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      gestureEnabled: true,
    },
    description: '数据分析页面 - 查看打印统计和使用分析',
  },
  {
    name: 'PrinterDetails',
    component: PrinterDetailsScreen,
    options: {
      headerShown: true,
      title: '设备详情',
      headerStyle: {
        backgroundColor: '#0f172a',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      gestureEnabled: true,
    },
    description: '打印机详情页面 - 查看设备详细信息和操作（嵌套路由示例）',
  },
  {
    name: 'LiveStreaming',
    component: LiveStreamingScreen,
    options: {
      headerShown: true,
      title: '实时监控',
      headerStyle: {
        backgroundColor: '#dc2626',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      gestureEnabled: true,
    },
    description: '实时视频监控页面 - WebRTC实时视频流传输和监控',
  },
];

// 兼容性路由配置数组（保持向后兼容）
export const routeConfigs: RouteConfig[] = mainRouteConfigs;

// 默认的Stack Navigator配置
export const defaultStackOptions: StackNavigationOptions = {
  headerShown: false,           // 默认隐藏头部
  gestureEnabled: true,         // 启用手势导航
  gestureDirection: 'horizontal', // 水平滑动手势
  // 页面切换动画配置
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

// 路由工具函数 - 根据名称获取路由配置
export const getRouteConfig = (routeName: keyof RootStackParamList): RouteConfig | undefined => {
  return routeConfigs.find(config => config.name === routeName);
};

// 获取所有路由名称
export const getAllRouteNames = (): (keyof RootStackParamList)[] => {
  return routeConfigs.map(config => config.name);
};

// 路由验证函数 - 检查路由是否存在
export const isValidRoute = (routeName: string): routeName is keyof RootStackParamList => {
  return routeConfigs.some(config => config.name === routeName);
};
