import React, { createContext, useContext, useState, useCallback } from 'react';
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
}

/**
 * Toast上下文接口
 */
interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

/**
 * Toast上下文
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast项目接口
 */
interface ToastItem extends ToastConfig {
  id: string;
}

/**
 * Toast组件属性
 */
interface ToastItemProps {
  item: ToastItem;
  onHide: (id: string) => void;
}

/**
 * 单个Toast项目组件
 */
const ToastItemComponent: React.FC<ToastItemProps> = ({ item, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  React.useEffect(() => {
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
    }, item.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(item.id);
    });
  };

  const getToastStyle = () => {
    switch (item.type) {
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
    switch (item.type) {
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

  return (
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
        onPress={hideToast}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{getIconText()}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Toast提供者组件
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = {
      id,
      ...config,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast({ message, type: ToastType.SUCCESS, duration });
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast({ message, type: ToastType.ERROR, duration });
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast({ message, type: ToastType.WARNING, duration });
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast({ message, type: ToastType.INFO, duration });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast容器 */}
      <View style={styles.container}>
        {toasts.map(toast => (
          <ToastItemComponent
            key={toast.id}
            item={toast}
            onHide={hideToast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

/**
 * 使用Toast的Hook
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    maxWidth: width - 40,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
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
