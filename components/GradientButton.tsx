import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, FONT_WEIGHTS } from '../lib/constants';

/**
 * 渐变按钮组件属性接口
 */
interface GradientButtonProps {
  /** 按钮文本 */
  title: string;
  /** 点击事件处理函数 */
  onPress: () => void;
  /** 是否禁用按钮 */
  disabled?: boolean;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 渐变颜色数组 */
  gradientColors?: string[];
  /** 自定义容器样式 */
  style?: ViewStyle;
  /** 自定义文本样式 */
  textStyle?: TextStyle;
  /** 按钮类型 */
  variant?: 'primary' | 'secondary';
}

/**
 * 现代化渐变按钮组件
 * 支持Instagram风格的渐变效果和微交互动画
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  gradientColors = COLORS.login.buttonGradient,
  style,
  textStyle,
  variant = 'primary',
}) => {
  // 根据按钮类型获取样式
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButton);
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  // 根据按钮状态获取渐变颜色 - 现代商务科技风蓝色主题
  const getGradientColors = () => {
    if (disabled || loading) {
      return [COLORS.login?.buttonBackgroundDisabled || '#9ca3af', COLORS.login?.buttonBackgroundDisabled || '#9ca3af'];
    }

    if (variant === 'secondary') {
      // 次要按钮使用透明背景
      return ['transparent', 'transparent'];
    }

    // 主按钮使用天空蓝实心设计
    return [COLORS.login?.buttonBackground || '#3f72af', COLORS.login?.buttonBackground || '#3f72af'];
  };

  // 获取文本样式
  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText];
    
    if (variant === 'secondary') {
      baseTextStyle.push(styles.secondaryButtonText);
    }
    
    if (disabled || loading) {
      baseTextStyle.push(styles.disabledButtonText);
    }
    
    if (textStyle) {
      baseTextStyle.push(textStyle);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={getTextStyle()}>
          {loading ? '加载中...' : title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.xxl, // 圆弧形高圆角设计
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
    width: '100%',
    // 白色按钮阴影效果
    ...Platform.select({
      ios: {
        shadowColor: COLORS.login?.buttonShadow || 'rgba(255, 255, 255, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  
  secondaryButton: {
    borderWidth: 2,
    borderColor: COLORS.login?.buttonSecondaryBorder || '#FFFFFF',
    backgroundColor: COLORS.login?.buttonSecondaryBackground || 'transparent',
  },
  
  disabledButton: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  gradient: {
    paddingVertical: SPACING.lg + 2, // 稍微增加垂直内边距
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // 确保触摸区域
  },
  
  buttonText: {
    color: COLORS.login?.buttonText || '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.8,
    textAlign: 'center',
  },

  secondaryButtonText: {
    color: COLORS.login?.buttonSecondaryText || '#FFFFFF',
  },
  
  secondaryButtonText: {
    color: COLORS.textSecondary,
  },
  
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default GradientButton;
