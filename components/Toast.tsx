import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';

/**
 * Toast类型枚举
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Toast配置接口
 */
export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  onPress?: () => void;
  onHide?: () => void;
}

/**
 * Toast组件属性
 */
interface ToastProps extends ToastConfig {
  visible: boolean;
  onHide: () => void;
}

/**
 * Toast组件
 * 用于显示各种类型的提示信息
 */
const ToastComponent: React.FC<ToastProps> = ({
  visible,
  message,
  type = ToastType.INFO,
  duration = 3000,
  position = 'top',
  onPress,
  onHide,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // 显示动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 自动隐藏
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case ToastType.SUCCESS:
        return styles.successToast;
      case ToastType.ERROR:
        return styles.errorToast;
      case ToastType.WARNING:
        return styles.warningToast;
      case ToastType.INFO:
      default:
        return styles.infoToast;
    }
  };

  const getIconText = () => {
    switch (type) {
      case ToastType.SUCCESS:
        return '✅';
      case ToastType.ERROR:
        return '❌';
      case ToastType.WARNING:
        return '⚠️';
      case ToastType.INFO:
      default:
        return 'ℹ️';
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'center':
        return styles.centerPosition;
      case 'bottom':
        return styles.bottomPosition;
      case 'top':
      default:
        return styles.topPosition;
    }
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, getPositionStyle()]}>
      <Animated.View
        style={[
          styles.toast,
          getToastStyle(),
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.toastContent}
          onPress={onPress || hideToast}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>{getIconText()}</Text>
          <Text style={styles.message}>{message}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

/**
 * Toast管理类
 * 提供静态方法来显示各种类型的Toast
 */
class ToastManager {
  private static instance: ToastManager;
  private toastRef: React.RefObject<any> = React.createRef();
  private currentToast: ToastConfig | null = null;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * 显示Toast
   */
  show(config: ToastConfig) {
    this.currentToast = config;
    // 这里需要通过全局状态管理或事件系统来触发Toast显示
    // 简化实现，直接使用Alert作为fallback
    console.log(`🍞 Toast [${config.type}]: ${config.message}`);
  }

  /**
   * 显示成功Toast
   */
  static success(message: string, duration?: number) {
    ToastManager.getInstance().show({
      message,
      type: ToastType.SUCCESS,
      duration,
    });
  }

  /**
   * 显示错误Toast
   */
  static error(message: string, duration?: number) {
    ToastManager.getInstance().show({
      message,
      type: ToastType.ERROR,
      duration,
    });
  }

  /**
   * 显示警告Toast
   */
  static warning(message: string, duration?: number) {
    ToastManager.getInstance().show({
      message,
      type: ToastType.WARNING,
      duration,
    });
  }

  /**
   * 显示信息Toast
   */
  static info(message: string, duration?: number) {
    ToastManager.getInstance().show({
      message,
      type: ToastType.INFO,
      duration,
    });
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topPosition: {
    top: Platform.OS === 'ios' ? 60 : 40,
  },
  centerPosition: {
    top: '50%',
    marginTop: -30,
  },
  bottomPosition: {
    bottom: Platform.OS === 'ios' ? 100 : 80,
  },
  toast: {
    maxWidth: width - 40,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: 22,
  },
  successToast: {
    backgroundColor: '#10b981',
  },
  errorToast: {
    backgroundColor: '#ef4444',
  },
  warningToast: {
    backgroundColor: '#f59e0b',
  },
  infoToast: {
    backgroundColor: '#3b82f6',
  },
});

export default ToastComponent;
export { ToastManager as Toast };
