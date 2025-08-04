import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createRef } from 'react';
import { RootStackParamList } from '../types/navigation';
import { isValidRoute } from '../config/routes';

// 创建全局导航引用，类似Web端的router实例
export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

// 路由导航工具类 - 提供类似Web端的导航API
export class Router {
  // 页面跳转 - 类似Web端的router.push()
  static navigate<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ): void {
    if (!isValidRoute(name)) {
      console.warn(`路由 "${name}" 不存在`);
      return;
    }

    if (navigationRef.current?.isReady()) {
      navigationRef.current.navigate(name as any, params);
    } else {
      console.warn('导航容器未准备就绪');
    }
  }

  // 返回上一页 - 类似Web端的router.back()
  static goBack(): void {
    if (navigationRef.current?.isReady() && navigationRef.current.canGoBack()) {
      navigationRef.current.goBack();
    } else {
      console.warn('无法返回上一页');
    }
  }

  // 替换当前页面 - 类似Web端的router.replace()
  static replace<T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T]
  ): void {
    if (!isValidRoute(name)) {
      console.warn(`路由 "${name}" 不存在`);
      return;
    }

    if (navigationRef.current?.isReady()) {
      navigationRef.current.dispatch(
        CommonActions.replace(name, params)
      );
    }
  }

  // 获取当前路由名称
  static getCurrentRouteName(): string | undefined {
    if (navigationRef.current?.isReady()) {
      return navigationRef.current.getCurrentRoute()?.name;
    }
    return undefined;
  }

  // 检查是否可以返回
  static canGoBack(): boolean {
    return navigationRef.current?.canGoBack() ?? false;
  }
}

// 导出便捷的导航函数，类似Web端的useRouter hook
export const useAppRouter = () => {
  return {
    push: Router.navigate,     // 页面跳转
    back: Router.goBack,       // 返回上一页
    replace: Router.replace,   // 替换当前页面
    getCurrentRoute: () => ({
      name: Router.getCurrentRouteName(),
    }),
    canGoBack: Router.canGoBack,
  };
};
