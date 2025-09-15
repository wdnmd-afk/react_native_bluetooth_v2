import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useAuthContext } from './AuthProvider';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, FONT_WEIGHTS } from '../lib/constants';

/**
 * 退出登录按钮组件属性接口
 */
interface LogoutButtonProps {
  /** 按钮文本 */
  title?: string;
  /** 是否显示确认对话框 */
  showConfirmDialog?: boolean;
  /** 按钮样式变体 */
  variant?: 'primary' | 'secondary' | 'danger';
  /** 自定义样式 */
  style?: any;
  /** 自定义文本样式 */
  textStyle?: any;
}

/**
 * 退出登录按钮组件
 * 提供完整的退出登录功能，包含确认对话框和加载状态
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({
  title = '退出登录',
  showConfirmDialog = true,
  variant = 'danger',
  style,
  textStyle,
}) => {
  const { logout, loading } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('退出登录失败:', error);
      // 错误处理已在useAuth中完成，这里不需要额外处理
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * 显示确认对话框
   */
  const showLogoutConfirmation = () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确认退出',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * 处理按钮点击
   */
  const handlePress = () => {
    if (showConfirmDialog) {
      showLogoutConfirmation();
    } else {
      handleLogout();
    }
  };

  /**
   * 获取按钮样式
   */
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
    }
    
    if (loading || isLoggingOut) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  /**
   * 获取文本样式
   */
  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText];
    
    switch (variant) {
      case 'primary':
        baseTextStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseTextStyle.push(styles.secondaryButtonText);
        break;
      case 'danger':
        baseTextStyle.push(styles.dangerButtonText);
        break;
    }
    
    if (loading || isLoggingOut) {
      baseTextStyle.push(styles.disabledButtonText);
    }
    
    if (textStyle) {
      baseTextStyle.push(textStyle);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={loading || isLoggingOut}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>
        {loading || isLoggingOut ? '退出中...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
  },
  
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
  },
  
  dangerButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
    ...SHADOWS.small,
  },
  
  disabledButton: {
    backgroundColor: COLORS.textDisabled,
    borderColor: COLORS.textDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
  
  primaryButtonText: {
    color: COLORS.text,
  },
  
  secondaryButtonText: {
    color: COLORS.textSecondary,
  },
  
  dangerButtonText: {
    color: COLORS.text,
  },
  
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default LogoutButton;
