import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './utils/navigation';
import RootAuthNavigator from './components/AuthNavigator';
import { ToastProvider, useToast } from './components/ToastProvider';
import { setGlobalToastRef } from './hooks/useToast';
import { AuthProvider } from './components/AuthProvider';

/**
 * 内部App组件，用于设置全局Toast引用
 */
const InnerApp: React.FC = () => {
  const toast = useToast();

  useEffect(() => {
    // 设置全局Toast引用，供静态方法使用
    setGlobalToastRef(toast);
  }, [toast]);

  return (
    // NavigationContainer是React Navigation的根容器，绑定全局导航引用
    <NavigationContainer ref={navigationRef}>
      {/* 使用认证路由守卫组件，自动处理认证状态切换 */}
      <RootAuthNavigator />
    </NavigationContainer>
  );
};

/**
 * 应用根组件
 * 集成认证导航系统、Toast提供者和认证状态提供者
 */
function App(): React.JSX.Element {
  return (
    <ToastProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
