/**
 * 现代化设计系统常量
 * 包含颜色、间距、圆角、阴影等设计系统常量
 */

// 现代化色彩系统
export const COLORS = {
  // 主色调 - 蓝色系
  primary: '#3b82f6',
  primaryDark: '#1e40af',
  primaryLight: '#60a5fa',
  primaryLighter: '#93c5fd',
  primaryAlpha: 'rgba(59, 130, 246, 0.1)',

  // 辅助色 - 紫色系
  secondary: '#6366f1',
  secondaryDark: '#4338ca',
  secondaryLight: '#818cf8',
  secondaryAlpha: 'rgba(99, 102, 241, 0.1)',

  // 中性色系 - 深色主题
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  surface: '#1e293b',
  surfaceLight: '#334155',
  surfaceLighter: '#475569',
  surfaceAlpha: 'rgba(30, 41, 59, 0.8)',

  // 文本颜色层次
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  textDisabled: '#64748b',
  textInverse: '#0f172a',

  // 状态颜色 - 更丰富的层次
  success: '#10b981',
  successLight: '#34d399',
  successAlpha: 'rgba(16, 185, 129, 0.1)',

  error: '#ef4444',
  errorLight: '#f87171',
  errorAlpha: 'rgba(239, 68, 68, 0.1)',

  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningAlpha: 'rgba(245, 158, 11, 0.1)',

  info: '#3b82f6',
  infoLight: '#60a5fa',
  infoAlpha: 'rgba(59, 130, 246, 0.1)',

  // 边框颜色
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.2)',
  borderFocus: 'rgba(59, 130, 246, 0.5)',

  // 透明色和遮罩
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'rgba(15, 23, 42, 0.8)',
  glass: 'rgba(255, 255, 255, 0.1)',

  // 渐变色
  gradientPrimary: ['#0f172a', '#1e3a8a', '#3730a3'],
  gradientSecondary: ['#1e293b', '#334155', '#475569'],
  gradientSuccess: ['#10b981', '#34d399'],
  gradientError: ['#ef4444', '#f87171'],
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 15,
  xl: 20,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 28,
};

// 现代化阴影系统
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  colored: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// 动画常量
export const ANIMATIONS = {
  // 动画时长
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // 缓动函数
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // 常用动画配置
  fadeIn: {
    duration: 250,
    useNativeDriver: true,
  },
  slideUp: {
    duration: 300,
    useNativeDriver: true,
  },
  bounce: {
    duration: 400,
    useNativeDriver: true,
  },
} as const;