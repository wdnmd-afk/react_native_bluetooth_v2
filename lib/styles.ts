import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from './constants';

// 通用样式工具函数
export const createStyles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // 卡片样式
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    ...SHADOWS.medium,
  },
  
  // 按钮样式
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonSuccess: {
    backgroundColor: COLORS.success,
  },
  buttonError: {
    backgroundColor: COLORS.error,
  },
  buttonWarning: {
    backgroundColor: COLORS.warning,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // 文本样式
  textPrimary: {
    color: COLORS.text,
  },
  textSecondary: {
    color: COLORS.textSecondary,
  },
  textDisabled: {
    color: COLORS.textDisabled,
  },
  textWhite: {
    color: COLORS.surface,
  },
  
  // 布局样式
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 间距样式
  marginXs: { margin: SPACING.xs },
  marginSm: { margin: SPACING.sm },
  marginMd: { margin: SPACING.md },
  marginLg: { margin: SPACING.lg },
  marginXl: { margin: SPACING.xl },
  
  paddingXs: { padding: SPACING.xs },
  paddingSm: { padding: SPACING.sm },
  paddingMd: { padding: SPACING.md },
  paddingLg: { padding: SPACING.lg },
  paddingXl: { padding: SPACING.xl },
});

// 平台特定样式
export const platformStyles = {
  tabBar: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
};

// 主题相关的样式生成器
export const createThemedStyles = (isDark: boolean = false) => {
  const colors = isDark ? {
    ...COLORS,
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#cccccc',
  } : COLORS;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      margin: SPACING.md,
      ...SHADOWS.medium,
    },
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
  });
};