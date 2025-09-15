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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '../components/AuthProvider';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES, FONT_WEIGHTS } from '../lib/constants';
import LoadingOverlay from '../components/LoadingOverlay';
import AuthInput from '../components/AuthInput';
import SocialButton, { SocialButtonGroup } from '../components/SocialButton';
import GradientButton from '../components/GradientButton';
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
  const { login, loading, error, clearError } = useAuthContext();
  
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
   * 处理登录 - 改进用户体验和错误处理
   */
  const handleLogin = useCallback(async () => {
    // 表单验证
    if (!validateForm()) {
      return;
    }

    // 清除之前的错误
    clearError();

    try {
      const loginStartTime = Date.now();
      console.log('🚀 开始登录流程:', {
        timestamp: new Date().toISOString(),
        username: formData.username.trim()
      });

      const success = await login({
        usernameOrEmail: formData.username.trim(),
        password: formData.password,
      });

      if (success) {
        console.log('🎉 登录成功，等待AuthNavigator自动切换到主页面');
        console.log('⏱️ 登录耗时:', Date.now() - loginStartTime, 'ms');
        console.log('📋 登录流程完成，由AuthNavigator负责页面切换');

        // 清空表单（可选）
        // setFormData({ username: '', password: '' });
      } else {
        console.log('❌ 登录失败，显示错误信息');
        // 错误信息已经在useAuth中处理并显示
      }
    } catch (error) {
      console.error('❌ 登录处理失败:', error);
      // 显示通用错误信息
      Alert.alert('登录失败', '登录过程中发生错误，请重试');
    }
  }, [formData, validateForm, login, clearError]);

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
      {/* 深海蓝到天空蓝的对角渐变背景 - 现代商务科技风 */}
      <LinearGradient
        colors={COLORS.login.backgroundGradient}
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
            {/* 极简居中布局容器 */}
            <View style={styles.centerContainer}>
              {/* 圆形用户图标 */}
              <View style={styles.userIconContainer}>
                <View style={styles.userIcon}>
                  <Text style={styles.userIconText}>👤</Text>
                </View>
              </View>

              {/* 标题 */}
              <Text style={styles.loginTitle}>MEMBER LOGIN</Text>

              {/* 登录表单 */}
              <View style={styles.formContainer}>

                {/* Username input */}
                <AuthInput
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  placeholder="Username"
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

                {/* Password input */}
                <AuthInput
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  placeholder="Password"
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

                {/* Remember me checkbox */}
                <View style={styles.rememberMeContainer}>
                  <TouchableOpacity style={styles.checkboxContainer}>
                    <View style={styles.checkbox}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={loading}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Global error message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.globalErrorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Login button */}
                <GradientButton
                  title="Login"
                  onPress={handleLogin}
                  disabled={loading}
                  loading={loading}
                  gradientColors={[COLORS.login.buttonBackground, COLORS.login.buttonBackground]}
                  variant="primary"
                />

                {/* Registration section */}
                <View style={styles.registerSection}>
                  <Text style={styles.registerPrompt}>Not a member?</Text>
                  <TouchableOpacity
                    style={styles.createAccountButton}
                    onPress={handleNavigateToRegister}
                    disabled={loading}
                  >
                    <Text style={styles.createAccountText}>Create account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading overlay */}
      <LoadingOverlay
        visible={loading}
        message="Logging in..."
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: Math.max(Dimensions.get('window').height - 100, 600),
  },
  // 极简居中布局容器
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },

  // 圆形用户图标容器
  userIconContainer: {
    marginBottom: SPACING.xl,
  },

  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.login.userIconBackground,
    borderWidth: 3,
    borderColor: COLORS.login.userIconBorder,
    justifyContent: 'center',
    alignItems: 'center',
    // 图标阴影效果
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(255, 255, 255, 0.3)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  userIconText: {
    fontSize: 32,
    color: COLORS.login.userIconColor,
  },

  // 登录标题
  loginTitle: {
    fontSize: FONT_SIZES.xl + 2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.login.titleText,
    textAlign: 'center',
    marginBottom: SPACING.xl * 1.5,
    letterSpacing: 2,
    // 文字阴影效果
    ...Platform.select({
      ios: {
        shadowColor: COLORS.login.titleTextShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        textShadowColor: COLORS.login.titleTextShadow,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
  // 移除title和subtitle样式，采用极简设计
  // 极简表单容器 - 无背景无边框
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // 移除不再需要的输入框样式，使用AuthInput组件
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
  // 优化的错误提示样式
  errorContainer: {
    backgroundColor: COLORS.login.errorBackground, // 使用设计系统中的错误背景色
    borderRadius: BORDER_RADIUS.lg, // 使用更大的圆角
    padding: SPACING.lg, // 增加内边距
    marginBottom: SPACING.lg,
    borderWidth: 1.5, // 增加边框宽度
    borderColor: COLORS.login.errorBorder, // 使用设计系统中的错误边框色
    // 添加微妙的阴影
    ...Platform.select({
      ios: {
        shadowColor: COLORS.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorText: {
    color: COLORS.error, // 使用设计系统中的错误颜色
    fontSize: FONT_SIZES.xs, // 使用设计系统中的字体大小
    fontWeight: FONT_WEIGHTS.medium, // 添加字体权重
    marginTop: SPACING.xs,
    lineHeight: 16, // 添加行高
  },
  globalErrorText: {
    color: COLORS.login.errorText, // 使用设计系统中的登录错误文本色
    fontSize: FONT_SIZES.sm, // 使用设计系统中的字体大小
    fontWeight: FONT_WEIGHTS.medium, // 添加字体权重
    textAlign: 'center',
    lineHeight: 20, // 添加行高，提升可读性
    letterSpacing: 0.3, // 添加字母间距
  },
  // 登录按钮样式已移至GradientButton组件中
  // 记住我和忘记密码行
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: COLORS.login.checkboxBorder,
    backgroundColor: COLORS.login.checkboxBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },

  checkmark: {
    color: COLORS.login.checkboxCheck,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
  },

  rememberMeText: {
    color: COLORS.login.secondaryText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
  },

  forgotPasswordText: {
    color: COLORS.login.linkText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    textDecorationLine: 'underline',
  },

  // 注册区域
  registerSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },

  registerPrompt: {
    color: COLORS.login.secondaryText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    marginBottom: SPACING.sm,
  },

  createAccountButton: {
    borderWidth: 1.5,
    borderColor: COLORS.login.buttonSecondaryBorder,
    borderRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.login.buttonSecondaryBackground,
  },

  createAccountText: {
    color: COLORS.login.buttonSecondaryText,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
