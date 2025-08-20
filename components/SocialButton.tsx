import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SPACING, BORDER_RADIUS } from '../lib/constants';

/**
 * 社交登录平台类型
 */
export type SocialPlatform = 'facebook' | 'google' | 'apple' | 'wechat' | 'qq';

/**
 * 社交按钮组件属性接口
 */
interface SocialButtonProps {
  /** 社交平台类型 */
  platform: SocialPlatform;
  /** 按钮文本 */
  title?: string;
  /** 点击事件 */
  onPress: () => void;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义样式 */
  style?: any;
  /** 是否为图标模式（只显示图标） */
  iconOnly?: boolean;
}

/**
 * 社交平台配置
 */
const socialConfigs: Record<SocialPlatform, {
  icon: string;
  backgroundColor: string;
  textColor: string;
  defaultTitle: string;
}> = {
  facebook: {
    icon: '📘',
    backgroundColor: '#1877f2',
    textColor: '#ffffff',
    defaultTitle: '使用 Facebook 登录',
  },
  google: {
    icon: '🔍',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    defaultTitle: '使用 Google 登录',
  },
  apple: {
    icon: '🍎',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    defaultTitle: '使用 Apple 登录',
  },
  wechat: {
    icon: '💬',
    backgroundColor: '#07c160',
    textColor: '#ffffff',
    defaultTitle: '使用微信登录',
  },
  qq: {
    icon: '🐧',
    backgroundColor: '#12b7f5',
    textColor: '#ffffff',
    defaultTitle: '使用 QQ 登录',
  },
};

/**
 * Instagram风格的社交登录按钮组件
 * 支持多种社交平台，可配置图标和文本模式
 */
const SocialButton: React.FC<SocialButtonProps> = ({
  platform,
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  iconOnly = false,
}) => {
  const config = socialConfigs[platform];
  const buttonTitle = title || config.defaultTitle;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        iconOnly ? styles.iconOnlyContainer : styles.fullContainer,
        { backgroundColor: config.backgroundColor },
        isDisabled && styles.disabledContainer,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={config.textColor}
          style={iconOnly ? undefined : styles.loadingIndicator}
        />
      ) : (
        <>
          {/* 平台图标 */}
          <View style={iconOnly ? styles.iconOnlyIcon : styles.icon}>
            <Text style={styles.iconText}>{config.icon}</Text>
          </View>

          {/* 按钮文本 */}
          {!iconOnly && (
            <Text
              style={[
                styles.title,
                { color: config.textColor },
                isDisabled && styles.disabledTitle,
              ]}
            >
              {buttonTitle}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * 社交按钮组合组件
 * 用于显示多个社交登录选项
 */
interface SocialButtonGroupProps {
  /** 支持的平台列表 */
  platforms: SocialPlatform[];
  /** 点击事件处理 */
  onPress: (platform: SocialPlatform) => void;
  /** 加载状态 */
  loadingPlatform?: SocialPlatform;
  /** 是否为图标模式 */
  iconOnly?: boolean;
  /** 组合样式 */
  style?: any;
}

export const SocialButtonGroup: React.FC<SocialButtonGroupProps> = ({
  platforms,
  onPress,
  loadingPlatform,
  iconOnly = false,
  style,
}) => {
  return (
    <View style={[iconOnly ? styles.iconGroup : styles.buttonGroup, style]}>
      {platforms.map((platform) => (
        <SocialButton
          key={platform}
          platform={platform}
          onPress={() => onPress(platform)}
          loading={loadingPlatform === platform}
          iconOnly={iconOnly}
          style={iconOnly ? styles.iconGroupItem : styles.buttonGroupItem}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Instagram风格的阴影效果
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  fullContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 50,
  },
  iconOnlyContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  iconOnlyIcon: {
    // 图标居中
  },
  iconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  disabledTitle: {
    opacity: 0.7,
  },
  loadingIndicator: {
    marginRight: SPACING.sm,
  },
  buttonGroup: {
    gap: SPACING.md,
  },
  buttonGroupItem: {
    // 按钮组中的单个按钮样式
  },
  iconGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  iconGroupItem: {
    // 图标组中的单个图标样式
  },
});

export default SocialButton;
