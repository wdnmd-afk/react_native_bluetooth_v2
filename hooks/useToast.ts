// 重新导出ToastProvider中的类型和Hook
export { ToastType, useToast } from '../components/ToastProvider';

/**
 * 静态Toast工具类
 * 用于在没有Hook上下文的地方使用Toast
 * 注意：这个类需要在ToastProvider包装的组件树中才能正常工作
 */
let globalToastRef: any = null;

export const setGlobalToastRef = (ref: any) => {
  globalToastRef = ref;
};

export class Toast {
  /**
   * 显示成功提示
   */
  static success(message: string, duration?: number) {
    console.log(`✅ Toast Success: ${message}`);
    if (globalToastRef) {
      globalToastRef.showSuccess(message, duration);
    } else {
      console.warn('Toast: globalToastRef not set, falling back to console');
    }
  }

  /**
   * 显示错误提示
   */
  static error(message: string, duration?: number) {
    console.log(`❌ Toast Error: ${message}`);
    if (globalToastRef) {
      globalToastRef.showError(message, duration);
    } else {
      console.warn('Toast: globalToastRef not set, falling back to console');
    }
  }

  /**
   * 显示警告提示
   */
  static warning(message: string, duration?: number) {
    console.log(`⚠️ Toast Warning: ${message}`);
    if (globalToastRef) {
      globalToastRef.showWarning(message, duration);
    } else {
      console.warn('Toast: globalToastRef not set, falling back to console');
    }
  }

  /**
   * 显示信息提示
   */
  static info(message: string, duration?: number) {
    console.log(`ℹ️ Toast Info: ${message}`);
    if (globalToastRef) {
      globalToastRef.showInfo(message, duration);
    } else {
      console.warn('Toast: globalToastRef not set, falling back to console');
    }
  }
}
