/**
 * 应用配置文件
 * 根据运行环境自动选择合适的API地址
 */

import { Platform } from 'react-native';

// 开发环境配置
const DEV_CONFIG = {
  // 模拟器使用localhost
  SIMULATOR_API_URL: 'http://localhost:3000/api/v1',
  
  // 真机使用电脑IP地址
  DEVICE_API_URL: 'http://192.168.0.143:3000/api/v1',
  
  // 生产环境API地址
  PRODUCTION_API_URL: 'https://your-production-api.com/api/v1',
};

/**
 * 检测是否为真机设备
 * 在真机上，__DEV__ 为 true 但需要使用IP地址而非localhost
 */
const isPhysicalDevice = (): boolean => {
  // 这里可以添加更复杂的检测逻辑
  // 目前简单返回true，表示假设是真机
  return true;
};

/**
 * 获取当前环境的API基础URL
 */
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // 开发环境
    if (isPhysicalDevice()) {
      console.log('🔧 检测到真机环境，使用IP地址:', DEV_CONFIG.DEVICE_API_URL);
      return DEV_CONFIG.DEVICE_API_URL;
    } else {
      console.log('🔧 检测到模拟器环境，使用localhost:', DEV_CONFIG.SIMULATOR_API_URL);
      return DEV_CONFIG.SIMULATOR_API_URL;
    }
  } else {
    // 生产环境
    console.log('🔧 生产环境，使用生产API:', DEV_CONFIG.PRODUCTION_API_URL);
    return DEV_CONFIG.PRODUCTION_API_URL;
  }
};

/**
 * 应用配置
 */
export const AppConfig = {
  API_BASE_URL: getApiBaseUrl(),
  
  // 请求超时时间
  REQUEST_TIMEOUT: 10000,
  
  // 重试次数
  MAX_RETRIES: 3,
  
  // 调试模式
  DEBUG_MODE: __DEV__,
};

// 打印当前配置（仅开发环境）
if (__DEV__) {
  console.log('📱 应用配置信息:');
  console.log('🌐 API地址:', AppConfig.API_BASE_URL);
  console.log('⏱️ 请求超时:', AppConfig.REQUEST_TIMEOUT + 'ms');
  console.log('🔄 最大重试:', AppConfig.MAX_RETRIES);
  console.log('🐛 调试模式:', AppConfig.DEBUG_MODE);
}
