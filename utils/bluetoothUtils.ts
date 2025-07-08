import {Platform} from 'react-native';
import BleManager from 'react-native-ble-manager';

// 环境检测：检查设备信息并识别模拟器，在模块加载时执行一次
const logEnvironmentInfoOnce = () => {
  // 仅在开发环境下输出日志，避免生产环境性能损耗
  if (__DEV__) {
    if (Platform.OS === 'android') {
      console.log('Android信息:', {
        Brand: Platform.constants.Brand,
        Manufacturer: Platform.constants.Manufacturer,
        Model: Platform.constants.Model,
        Release: Platform.constants.Release,
        SDK: Platform.constants.Version,
      });

      // 检测是否为模拟器：模拟器无法使用真实蓝牙功能
      const isEmulator =
        Platform.constants.Brand === 'google' ||
        Platform.constants.Manufacturer === 'Google' ||
        Platform.constants.Model?.includes('Emulator') ||
        Platform.constants.Model?.includes('Android SDK');

      console.log('疑似模拟器:', isEmulator);

      if (isEmulator) {
        console.warn('⚠️ 检测到可能在模拟器上运行，蓝牙功能在模拟器上不可用');
      }
    }

    console.log('=== 环境信息检测结束 ===');
  }
};

// 在模块加载时执行一次环境信息检测
logEnvironmentInfoOnce();

// 导出空函数，保持向后兼容性
export const logEnvironmentInfo = () => {
  // 环境信息已在模块加载时记录，无需重复执行
};

// 蓝牙库可用性检查：在模块加载时执行一次，避免重复检查
const checkBluetoothLibraryAvailability = (): boolean => {
  if (__DEV__) {
    console.log('=== 开始检查蓝牙库可用性 ===');
  }

  try {
    // 检查BleManager对象存在性
    if (!BleManager) {
      if (__DEV__) console.error('❌ BleManager对象不存在');
      return false;
    }

    // 验证关键方法存在性：确保基本功能可用
    const hasStart = typeof BleManager.start === 'function';
    const hasStartScan = typeof BleManager.scan === 'function';
    const hasStopScan = typeof BleManager.stopScan === 'function';
    const hasConnect = typeof BleManager.connect === 'function';
    const hasCheckState = typeof BleManager.checkState === 'function';

    if (__DEV__) {
      const methods = Object.keys(BleManager || {});
      console.log('可用方法列表:', methods);
      console.log('关键方法检查:', {
        start: hasStart,
        scan: hasStartScan,
        stopScan: hasStopScan,
        connect: hasConnect,
        checkState: hasCheckState,
      });
    }

    if (!hasStart || !hasStartScan || !hasStopScan || !hasConnect) {
      if (__DEV__) console.error('❌ 关键方法不可用');
      return false;
    }

    if (__DEV__) console.log('✅ 蓝牙库检查通过');
    return true;
  } catch (error: any) {
    if (__DEV__) {
      console.error('❌ 检查蓝牙库可用性失败:', error);
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  } finally {
    if (__DEV__) console.log('=== 蓝牙库检查结束 ===');
  }
};

// 在模块加载时执行一次检查，缓存结果
const _isBluetoothLibraryAvailable = checkBluetoothLibraryAvailability();

// 导出函数：返回缓存的检查结果，避免重复检查
export const isBluetoothLibraryAvailable = (): boolean => {
  return _isBluetoothLibraryAvailable;
};

// 蓝牙状态枚举：标准化状态管理
export enum BluetoothState {
  Unknown = 'Unknown',
  Resetting = 'Resetting',
  Unsupported = 'Unsupported',
  Unauthorized = 'Unauthorized',
  PoweredOff = 'PoweredOff',
  PoweredOn = 'PoweredOn',
}

// 状态文本映射：提供用户友好的状态描述
export const getBluetoothStateText = (state: BluetoothState): string => {
  const stateMap = {
    [BluetoothState.Unknown]: '未知',
    [BluetoothState.Resetting]: '重置中',
    [BluetoothState.Unsupported]: '不支持',
    [BluetoothState.Unauthorized]: '未授权',
    [BluetoothState.PoweredOff]: '已关闭',
    [BluetoothState.PoweredOn]: '已开启',
  };
  
  return stateMap[state] || '未知';
};

// 设备接口：强类型定义避免运行时错误
export interface BluetoothDevice {
  id: string;
  name?: string;
  rssi?: number;
  advertising?: {
    localName?: string;
    manufacturerData?: any;
    serviceUUIDs?: string[];
  };
}

// 扫描配置：集中管理扫描参数
export const scanConfig = {
  duration: 5000, // 5秒扫描时间，平衡设备发现率和电池消耗
};