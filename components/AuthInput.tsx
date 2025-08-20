import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../lib/constants';

/**
 * 认证输入框组件属性接口
 */
interface AuthInputProps extends TextInputProps {
  /** 输入框标签 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 是否显示错误状态 */
  hasError?: boolean;
  /** 左侧图标 */
  leftIcon?: string;
  /** 右侧图标 */
  rightIcon?: string;
  /** 右侧图标点击事件 */
  onRightIconPress?: () => void;
  /** 是否为密码输入框 */
  isPassword?: boolean;
  /** 输入框容器样式 */
  containerStyle?: any;
  /** 输入框样式 */
  inputStyle?: any;
  /** 是否必填 */
  required?: boolean;
}

/**
 * Instagram风格的认证输入框组件
 * 融合现有设计系统与Instagram简洁风格
 */
const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  hasError = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  containerStyle,
  inputStyle,
  required = false,
  ...textInputProps
}) => {
  // 密码显示状态
  const [showPassword, setShowPassword] = useState(false);
  
  // 焦点状态
  const [isFocused, setIsFocused] = useState(false);

  /**
   * 切换密码显示状态
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * 处理焦点事件
   */
  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  /**
   * 处理失焦事件
   */
  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 标签 */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* 输入框容器 */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        {/* 左侧图标 */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Text style={styles.iconText}>{leftIcon}</Text>
          </View>
        )}

        {/* 输入框 */}
        <TextInput
          {...textInputProps}
          style={[
            styles.textInput,
            leftIcon && styles.textInputWithLeftIcon,
            (rightIcon || isPassword) && styles.textInputWithRightIcon,
            inputStyle,
          ]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          selectionColor="#3b82f6"
        />

        {/* 右侧图标或密码切换按钮 */}
        {(rightIcon || isPassword) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={isPassword ? togglePasswordVisibility : onRightIconPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>
              {isPassword 
                ? (showPassword ? '🙈' : '👁️')
                : rightIcon
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 错误信息 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelContainer: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  required: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    minHeight: 50,
    // Instagram风格的渐变边框效果
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(59, 130, 246, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputContainerFocused: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    // Instagram风格的焦点效果
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainerError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  leftIconContainer: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: SPACING.md,
    paddingLeft: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  iconText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    // Instagram风格的字体
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  textInputWithLeftIcon: {
    paddingLeft: 0,
  },
  textInputWithRightIcon: {
    paddingRight: 0,
  },
  errorContainer: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    // Instagram风格的错误提示
    letterSpacing: 0.3,
  },
});

export default AuthInput;
