import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '../components/AuthProvider';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../lib/constants';
import LoadingOverlay from '../components/LoadingOverlay';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';
import { AuthStackParamList } from '../types/navigation';

// 导航类型定义
type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

/**
 * Instagram风格的注册页面组件
 * 融合现有深蓝色风格与Instagram简洁设计
 */
const RegisterScreen: React.FC = () => {
  // 导航钩子
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  // 认证状态管理
  const { register, loading, error, clearError } = useAuthContext();
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 表单验证错误
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // 同意条款状态
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    let isValid = true;

    // 验证用户名
    if (!formData.username.trim()) {
      errors.username = '请输入用户名';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少3个字符';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = '用户名只能包含字母、数字和下划线';
      isValid = false;
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱地址';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 验证密码
    if (!formData.password) {
      errors.password = '请输入密码';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6个字符';
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = '密码必须包含大小写字母和数字';
      isValid = false;
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [formData]);

  /**
   * 处理注册
   */
  const handleRegister = useCallback(async () => {
    // 表单验证
    if (!validateForm()) {
      return;
    }

    // 检查是否同意条款
    if (!agreeToTerms) {
      Alert.alert('提示', '请先同意用户协议和隐私政策');
      return;
    }

    try {
      const success = await register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (success) {
        Alert.alert('Registration Successful', 'Welcome to our platform!', [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Navigate to main page or login page
              console.log('Registration successful, navigating to main page');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('注册处理失败:', error);
    }
  }, [formData, agreeToTerms, validateForm, register]);



  /**
   * 切换条款同意状态
   */
  const toggleAgreeToTerms = useCallback(() => {
    setAgreeToTerms(prev => !prev);
  }, []);

  /**
   * 导航到登录页面
   */
  const navigateToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 深海蓝到天空蓝的对角渐变背景 - 与登录界面一致 */}
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
            <Text style={styles.registerTitle}>MEMBER REGISTER</Text>

            {/* 注册表单 */}
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
              returnKeyType="next"
              required
            />

            {/* Email input */}
            <AuthInput
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Email"
              leftIcon="📧"
              error={validationErrors.email}
              hasError={!!validationErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
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
              returnKeyType="next"
              required
            />

            {/* Confirm Password input */}
            <AuthInput
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm Password"
              leftIcon="🔐"
              error={validationErrors.confirmPassword}
              hasError={!!validationErrors.confirmPassword}
              isPassword
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              required
            />

            {/* Terms agreement */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={toggleAgreeToTerms}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the
                <Text style={styles.termsLink}> Terms of Service </Text>
                and
                <Text style={styles.termsLink}> Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Global error message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.globalErrorText}>{error}</Text>
              </View>
            ) : null}

            {/* Register button */}
            <GradientButton
              title={loading ? "Creating..." : "Create Account"}
              onPress={handleRegister}
              disabled={loading || !agreeToTerms}
              loading={loading}
              gradientColors={[COLORS.login.buttonBackground, COLORS.login.buttonBackground]}
              variant="primary"
            />

            {/* Login link section */}
            <View style={styles.loginSection}>
              <Text style={styles.loginPrompt}>Already a member?</Text>
              <TouchableOpacity
                onPress={navigateToLogin}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading overlay */}
      <LoadingOverlay
        visible={loading}
        message="Creating account..."
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
    minHeight: Math.max(Dimensions.get('window').height - 100, 650),
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

  // 注册标题
  registerTitle: {
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

  // 极简表单容器 - 无背景无边框
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  // 用户协议区域
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    width: '100%',
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: COLORS.login.checkboxBorder,
    backgroundColor: COLORS.login.checkboxBackground,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  checkboxChecked: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: COLORS.login.checkboxBorder,
  },

  checkmark: {
    color: COLORS.login.checkboxCheck,
    fontSize: 12,
    fontWeight: FONT_WEIGHTS.bold,
  },

  termsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.login.secondaryText,
    lineHeight: 20,
    flex: 1,
  },

  termsLink: {
    color: COLORS.login.linkText,
    fontWeight: FONT_WEIGHTS.medium,
    textDecorationLine: 'underline',
  },

  // 错误容器样式
  errorContainer: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  globalErrorText: {
    color: COLORS.login.errorText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
    lineHeight: 20,
  },
  // 登录链接区域
  loginSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },

  loginPrompt: {
    color: COLORS.login.secondaryText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    marginBottom: SPACING.sm,
  },
  loginLink: {
    color: COLORS.login.linkText,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
