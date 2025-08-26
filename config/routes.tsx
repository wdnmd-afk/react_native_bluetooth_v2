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
      // 隐藏返回按钮文字，统一视觉风格
      headerBackTitleVisible: false,
      // 专门为功能展示页面优化的动画配置
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                // 使用更快更流畅的滑入动画
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.3, 0], // 减少滑入距离
                  extrapolate: 'clamp',
                }),
              },
              {
                // 轻微的缩放效果，增强视觉效果
                scale: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1],
                  extrapolate: 'clamp',
                }),
              },
            ],
            // 快速透明度清晰，提升视觉响应
            opacity: current.progress.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 0.9, 1],
              extrapolate: 'clamp',
            }),
          },
        };
      },
      // 专门优化的过渡时长，更快更流畅
      transitionSpec: {
        open: {
          animation: 'spring',
          config: {
            stiffness: 400,      // 更高的刚度，更快的响应
            damping: 25,         // 较低的阻尼，更灵效
            mass: 0.8,           // 较小的质量，更轻快
            overshootClamping: false,
            restDisplacementThreshold: 0.005,
            restSpeedThreshold: 0.005,
          },
        },
        close: {
          animation: 'spring',
          config: {
            stiffness: 400,
            damping: 25,
            mass: 0.8,
            overshootClamping: false,
            restDisplacementThreshold: 0.005,
            restSpeedThreshold: 0.005,
          },
        },
      },
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
];

// 兼容性路由配置数组（保持向后兼容）
export const routeConfigs: RouteConfig[] = mainRouteConfigs;

// 默认的Stack Navigator配置
export const defaultStackOptions: StackNavigationOptions = {
  headerShown: false,           // 默认隐藏头部
  gestureEnabled: true,         // 启用手势导航
  gestureDirection: 'horizontal', // 水平滑动手势
  // 启用原生驱动以提升性能
  animationEnabled: true,
  // 优化的页面切换动画配置 - 使用弹簧动画提升丝滑度
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            // 使用更流畅的弹簧动画曲线
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
              extrapolate: 'clamp',
            }),
          },
          {
            // 添加轻微的缩放效果增加层次感
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
              extrapolate: 'clamp',
            }),
          },
        ],
        // 添加透明度渐变效果
        opacity: current.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.8, 1],
          extrapolate: 'clamp',
        }),
      },
      // 优化覆盖层效果
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.15],
          extrapolate: 'clamp',
        }),
      },
    };
  },
  // 优化过渡时长，使动画更流畅
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 300,      // 弹簧刚度，控制动画速度
        damping: 30,         // 阻尼，控制弹跳效果
        mass: 1,             // 质量，影响动画惯性
        overshootClamping: false, // 允许轻微过冲
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 300,
        damping: 30,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  // 手势配置优化
  gestureResponseDistance: 50,     // 手势识别距离
  gestureVelocityImpact: 0.3,      // 手势速度影响
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
