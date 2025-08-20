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
import { useAuth } from '../hooks/useAuth';
import { COLORS, SPACING, BORDER_RADIUS } from '../lib/constants';
import LoadingOverlay from '../components/LoadingOverlay';
import AuthInput from '../components/AuthInput';
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
  const { register, loading, error, clearError } = useAuth();
  
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
        Alert.alert('注册成功', '欢迎加入我们！', [
          {
            text: '确定',
            onPress: () => {
              // TODO: 导航到主页面或登录页面
              console.log('注册成功，导航到主页面');
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
            <Text style={styles.title}>创建账户</Text>
            <Text style={styles.subtitle}>加入我们，开始您的智能打印之旅</Text>
          </View>

          {/* 注册表单 */}
          <View style={styles.formContainer}>
            {/* 用户名输入框 */}
            <AuthInput
              label="用户名"
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              placeholder="请输入用户名"
              leftIcon="👤"
              error={validationErrors.username}
              hasError={!!validationErrors.username}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              required
            />

            {/* 邮箱输入框 */}
            <AuthInput
              label="邮箱地址"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="请输入邮箱地址"
              leftIcon="📧"
              error={validationErrors.email}
              hasError={!!validationErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
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
              returnKeyType="next"
              required
            />

            {/* 确认密码输入框 */}
            <AuthInput
              label="确认密码"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="请再次输入密码"
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

            {/* 用户协议 */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={toggleAgreeToTerms}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                我已阅读并同意
                <Text style={styles.termsLink}> 用户协议 </Text>
                和
                <Text style={styles.termsLink}> 隐私政策</Text>
              </Text>
            </TouchableOpacity>

            {/* 全局错误提示 */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.globalErrorText}>{error}</Text>
              </View>
            ) : null}

            {/* 注册按钮 */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? '注册中...' : '注册'}
              </Text>
            </TouchableOpacity>



            {/* 登录链接 */}
            <TouchableOpacity
              style={styles.loginLinkContainer}
              onPress={navigateToLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>
                已有账户？
                <Text style={styles.loginLink}> 立即登录</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 加载遮罩 */}
      <LoadingOverlay
        visible={loading}
        message="正在注册..."
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
    paddingVertical: SPACING.lg, // 增加垂直间距，更友好
    minHeight: Math.max(Dimensions.get('window').height - 100, 650), // 适当增加最小高度
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 1.5, // 适中的底部间距
    paddingTop: SPACING.lg, // 适中的顶部间距
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
    flex: 1,
    paddingHorizontal: SPACING.xs, // 轻微的左右间距
    justifyContent: 'space-between', // 均匀分布表单元素
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginTop: SPACING.xl, // 增加顶部间距，更友好
    marginBottom: SPACING.xl, // 增加底部间距
    paddingHorizontal: SPACING.sm, // 增加左右间距
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    flex: 1,
  },
  termsLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  globalErrorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    borderRadius: BORDER_RADIUS.lg, // 增加圆角
    paddingVertical: SPACING.md + 4, // 增加垂直间距
    alignItems: 'center',
    // marginTop: SPACING.md, // 添加顶部间距
    // marginBottom: SPACING.lg,
    marginHorizontal: SPACING.xs, // 添加左右间距
    // 更好的阴影效果
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
  registerButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  loginLinkContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl, // 增加上下间距，更友好
    // marginTop: SPACING.lg, // 增加顶部间距
  },
  loginLinkText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLink: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default RegisterScreen;
