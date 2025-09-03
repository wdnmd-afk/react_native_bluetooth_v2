import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
  Animated,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, ANIMATIONS } from '../lib/constants';

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

  // 动画值
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const labelPositionAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

    // 边框颜色动画
    Animated.timing(borderColorAnim, {
      toValue: 1,
      duration: ANIMATIONS.duration.fast,
      useNativeDriver: false,
    }).start();

    // 浮动标签动画
    if (label && !textInputProps.value) {
      Animated.timing(labelPositionAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.normal,
        useNativeDriver: false,
      }).start();
    }

    textInputProps.onFocus?.(e);
  };

  /**
   * 处理失焦事件
   */
  const handleBlur = (e: any) => {
    setIsFocused(false);

    // 边框颜色动画
    Animated.timing(borderColorAnim, {
      toValue: hasError ? 2 : 0,
      duration: ANIMATIONS.duration.fast,
      useNativeDriver: false,
    }).start();

    // 浮动标签动画
    if (label && !textInputProps.value) {
      Animated.timing(labelPositionAnim, {
        toValue: 0,
        duration: ANIMATIONS.duration.normal,
        useNativeDriver: false,
      }).start();
    }

    textInputProps.onBlur?.(e);
  };

  /**
   * 错误抖动动画
   */
  const triggerShakeAnimation = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // 当错误状态改变时触发抖动动画
  React.useEffect(() => {
    if (hasError) {
      triggerShakeAnimation();
    }
  }, [hasError]);

  // 处理浮动标签的初始状态
  React.useEffect(() => {
    const hasValue = textInputProps.value && textInputProps.value.length > 0;
    if (hasValue || isFocused) {
      labelPositionAnim.setValue(1);
    } else {
      labelPositionAnim.setValue(0);
    }
  }, [textInputProps.value, isFocused]); // 移除动画值依赖

  // 处理边框颜色的初始状态
  React.useEffect(() => {
    const targetValue = hasError ? 2 : (isFocused ? 1 : 0);
    borderColorAnim.setValue(targetValue);
  }, [hasError, isFocused]); // 移除动画值依赖

  // 动画插值
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [COLORS.border, COLORS.borderFocus, COLORS.error],
  });

  const labelTop = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -8],
  });

  const labelFontSize = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        { transform: [{ translateX: shakeAnim }] }
      ]}
    >
      {/* 浮动标签 */}
      {label && (
        <Animated.View
          style={[
            styles.floatingLabelContainer,
            {
              top: labelTop,
            }
          ]}
        >
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                fontSize: labelFontSize,
                color: hasError ? COLORS.error : isFocused ? COLORS.primary : COLORS.textSecondary,
              }
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        </Animated.View>
      )}

      {/* 输入框容器 */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: borderColor,
          },
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
      </Animated.View>

      {/* 错误信息 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  labelContainer: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  floatingLabelContainer: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
  },
  floatingLabel: {
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  required: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlpha,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    minHeight: 56,
    paddingHorizontal: SPACING.md,
    // 现代化的阴影效果
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputContainerError: {
    backgroundColor: COLORS.errorAlpha,
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
    color: COLORS.textSecondary,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
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
    color: COLORS.error,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default AuthInput;
