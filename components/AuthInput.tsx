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

  // 获取简洁图标 - 将emoji图标转换为更简洁的符号
  const getSimpleIcon = (icon: string) => {
    switch (icon) {
      case '👤':
        return '👤'; // 用户图标保持，但会在样式中优化显示
      case '🔒':
        return '🔒'; // 锁定图标保持，但会在样式中优化显示
      case '📧':
        return '@'; // 邮箱图标使用@符号
      case '📱':
        return '📱'; // 手机图标保持
      default:
        return icon;
    }
  };
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

  // 动画插值 - 使用白色主题的边框颜色
  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      COLORS.login?.inputBorder || '#FFFFFF', // 默认状态：白色边框
      COLORS.login?.inputBorderFocus || '#FFFFFF', // 聚焦状态：白色边框
      COLORS.login?.errorBorder || '#FFFFFF', // 错误状态：白色边框
    ],
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
          isFocused && styles.inputContainerFocus,
          hasError && styles.inputContainerError,
        ]}
      >
        {/* 左侧圆形图标容器 - 与输入区域缝合设计 */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{getSimpleIcon(leftIcon)}</Text>
            </View>
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
          placeholderTextColor={COLORS.login?.inputPlaceholder || 'rgba(255, 255, 255, 0.7)'}
          selectionColor={COLORS.login?.inputText || '#FFFFFF'} // 白色光标
          cursorColor={COLORS.login?.inputText || '#FFFFFF'} // 白色光标（新版本RN）
          underlineColorAndroid="transparent" // 移除Android默认下划线
          textAlignVertical="center" // 垂直居中对齐
          multiline={false} // 确保单行输入
          numberOfLines={1} // 限制为单行
          blurOnSubmit={true} // 提交时失去焦点
          // 额外的样式控制属性 - 完全移除所有可能的默认样式
          autoComplete="off" // 关闭自动完成
          autoCorrect={false} // 关闭自动纠错
          spellCheck={false} // 关闭拼写检查
          textContentType="none" // iOS: 移除内容类型提示
          importantForAutofill="no" // Android: 关闭自动填充
          disableFullscreenUI={true} // Android: 禁用全屏UI
          // Platform特定的样式控制
          {...Platform.select({
            android: {
              underlineColorAndroid: 'transparent',
              selectionColor: COLORS.login?.inputText || '#FFFFFF',
              textAlignVertical: 'center',
            },
            ios: {
              clearButtonMode: 'never', // iOS: 移除清除按钮
              enablesReturnKeyAutomatically: false,
            },
          })}
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
    // 圆弧形白色边框设计 - 半透明白色背景
    backgroundColor: COLORS.login?.inputBackground || 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.xxl, // 高圆角设计 (28px)
    borderWidth: 2,
    borderColor: COLORS.login?.inputBorder || '#FFFFFF',
    minHeight: 56,
    paddingHorizontal: 0, // 移除水平内边距，让左侧图标容器贴边
    marginBottom: SPACING.lg,
    width: '100%',
    overflow: 'hidden', // 确保圆形图标容器不会超出边界
    // 轻微白色阴影效果
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputContainerFocus: {
    backgroundColor: COLORS.login?.inputBackgroundFocus || 'rgba(255, 255, 255, 0.15)',
    borderColor: COLORS.login?.inputBorderFocus || '#FFFFFF',
    // 聚焦时的白色阴影增强
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  inputContainerError: {
    backgroundColor: COLORS.login?.errorBackground || 'rgba(255, 255, 255, 0.1)',
    borderColor: COLORS.login?.errorBorder || '#FFFFFF',
  },
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // 左侧小间距，让圆形图标贴近边框
  },

  // 圆形图标容器 - 与输入框缝合设计
  iconCircle: {
    width: 48, // 圆形图标容器宽度
    height: 48, // 圆形图标容器高度
    borderRadius: 24, // 完美圆形
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // 半透明白色背景
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md, // 与输入文字区域的间距
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
    fontSize: 20, // 稍微增大图标尺寸
    color: COLORS.login?.inputText || '#FFFFFF', // 白色图标
    fontWeight: '400',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.login?.inputText || '#FFFFFF', // 白色文本
    paddingHorizontal: SPACING.md, // 右侧内边距
    paddingVertical: SPACING.md,
    fontWeight: '400',
    letterSpacing: 0.3,
    // 强制移除所有可能的默认样式和边框
    borderWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    backgroundColor: 'transparent',
    textDecorationLine: 'none',
    // 移除任何可能的阴影（仅适用于React Native的有效属性）
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  textInputWithLeftIcon: {
    paddingLeft: 0, // 左侧无内边距，因为已经有图标容器的间距
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
