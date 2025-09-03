import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert, // 保留Alert用于忘记密码和社交登录功能
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../lib/constants';
import LoadingOverlay from '../components/LoadingOverlay';
import AuthInput from '../components/AuthInput';
import SocialButton, { SocialButtonGroup } from '../components/SocialButton';
import { AuthStackParamList } from '../types/navigation';

// 导航类型定义
type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

/**
 * 登录页面组件
 * 提供用户登录功能，符合应用现有设计风格
 */
const LoginScreen: React.FC = () => {
  // 导航钩子
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // 认证状态管理
  const { login, loading, error, clearError } = useAuth();
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  // 表单验证错误
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: '',
  });
  
  // 是否显示密码
  const [showPassword, setShowPassword] = useState(false);
  
  // 注意：rememberMe状态已移除，因为后端API不支持此字段
  // 登录状态的持久化通过HttpClient默认的token缓存机制实现

  /**
   * 更新表单数据
   */
  const updateFormData = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的验证错误
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 清除全局错误
    if (error) {
      clearError();
    }
  }, [validationErrors, error, clearError]);

  /**
   * 表单验证
   */
  const validateForm = useCallback((): boolean => {
    const errors = {
      username: '',
      password: '',
    };
    
    let isValid = true;

    // 验证用户名/邮箱
    if (!formData.username.trim()) {
      errors.username = '请输入用户名或邮箱';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少3个字符';
      isValid = false;
    }

    // 验证密码
    if (!formData.password) {
      errors.password = '请输入密码';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6个字符';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [formData]);

  /**
   * 处理登录
   */
  const handleLogin = useCallback(async () => {
    // 表单验证
    if (!validateForm()) {
      return;
    }

    try {
      const loginStartTime = Date.now();
      console.log('🚀 开始登录流程:', { timestamp: new Date().toISOString() });

      const success = await login({
        usernameOrEmail: formData.username.trim(),
        password: formData.password,
        // 注意：rememberMe字段已移除，因为后端API不接受此字段
      });

      if (success) {
        console.log('🎉 登录成功，等待自动跳转到主页面');
        console.log('⏱️ 登录耗时:', Date.now() - loginStartTime, 'ms');

        // 添加导航跳转监控和备用机制
        let navigationCheckCount = 0;
        const maxChecks = 30; // 最多检查3秒（每100ms检查一次）

        const checkNavigation = () => {
          navigationCheckCount++;
          console.log(`🔍 导航检查 ${navigationCheckCount}/${maxChecks}:`, {
            timestamp: new Date().toISOString(),
            currentRoute: navigation.getState()?.routes?.[navigation.getState()?.index || 0]?.name
          });

          // 如果检查次数超过限制，使用备用导航重置机制
          if (navigationCheckCount >= maxChecks) {
            console.warn('⚠️ 自动跳转超时，启用备用导航机制');
            try {
              // 使用导航重置强制跳转到主页面
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'TabLayout' as any }],
                })
              );
              console.log('✅ 备用导航重置完成');
            } catch (resetError) {
              console.error('❌ 备用导航重置失败:', resetError);
            }
            return;
          }

          // 继续检查
          setTimeout(checkNavigation, 100);
        };

        // 开始导航检查
        setTimeout(checkNavigation, 100);
      }
    } catch (error) {
      console.error('登录处理失败:', error);
    }
  }, [formData, validateForm, login, navigation]); // 添加navigation依赖

  /**
   * 切换密码显示状态
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // 注意：toggleRememberMe函数已移除，因为不再需要记住登录功能

  /**
   * 处理忘记密码
   */
  const handleForgotPassword = useCallback(() => {
    Alert.alert('忘记密码', '此功能正在开发中，请联系管理员重置密码。');
  }, []);

  /**
   * 导航到注册页面
   */
  const handleNavigateToRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  /**
   * 处理社交登录
   */
  const handleSocialLogin = useCallback((platform: string) => {
    Alert.alert('社交登录', `${platform} 登录功能正在开发中`);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Instagram风格渐变背景 */}
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#3730a3']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 头部标题区域 - 现代简洁风格 */}
            <View style={styles.header}>
              <Text style={styles.title}>欢迎回来</Text>
              <Text style={styles.subtitle}>登录您的账户以继续使用</Text>
            </View>

          {/* 登录表单 */}
          <View style={styles.formContainer}>
            {/* 用户名/邮箱输入框 */}
            <AuthInput
              label="用户名或邮箱"
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              placeholder="请输入用户名或邮箱"
              leftIcon="👤"
              error={validationErrors.username}
              hasError={!!validationErrors.username}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              editable={!loading}
              required
            />

            {/* 密码输入框 */}
            <AuthInput
              label="密码"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="请输入密码"
              leftIcon="🔒"
              error={validationErrors.password}
              hasError={!!validationErrors.password}
              isPassword
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!loading}
              required
            />

            {/* 注意：记住登录复选框已移除，因为后端API不支持rememberMe字段 */}
            {/* 登录状态的持久化通过HttpClient默认的token缓存机制实现 */}

            {/* 全局错误提示 */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.globalErrorText}>{error}</Text>
              </View>
            ) : null}

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? '登录中...' : '登录'}
              </Text>
            </TouchableOpacity>

            {/* 忘记密码链接 */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>忘记密码？</Text>
            </TouchableOpacity>
          </View>

          {/* 底部注册链接 */}
          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>还没有账号？</Text>
            <TouchableOpacity
              onPress={handleNavigateToRegister}
              disabled={loading}
            >
              <Text style={styles.registerLinkText}>立即注册</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 加载遮罩 */}
      <LoadingOverlay
        visible={loading}
        message="正在登录..."
      />
    </LinearGradient>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: Math.max(Dimensions.get('window').height - 100, 600), // 最小高度600，确保不超出屏幕
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2.5, // 增加底部间距
    paddingTop: SPACING.xl * 1.5, // 增加顶部间距
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: 1,
    // 现代化的文字阴影
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BORDER_RADIUS.xl + 4, // 增加圆角
    padding: SPACING.xl + 4, // 增加内边距
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: SPACING.xl,
    marginHorizontal: SPACING.xs, // 增加左右间距
    // 注意：React Native不支持backdropFilter，已移除
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  // 注意：rememberMe相关样式已移除，因为不再需要记住登录功能
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  globalErrorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    marginBottom: SPACING.md,
    // Instagram风格的按钮效果
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl, // 增加上下间距
    marginTop: SPACING.lg, // 增加顶部间距
  },
  bottomText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  registerLinkText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
