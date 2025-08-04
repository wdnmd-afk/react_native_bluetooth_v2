// Stack Navigator的路由参数类型定义
export type RootStackParamList = {
  TabLayout: undefined;           // 主页面（包含Tab导航），无需传递参数
  FeatureDemo: undefined;         // 功能展示页面，无需传递参数
  DeviceManagement: undefined;    // 设备管理页面，无需传递参数
  PrinterSettings: { deviceId?: string }; // 打印机设置页面，可选设备ID参数
  DataAnalytics: undefined;       // 数据分析页面，无需传递参数
  PrinterDetails: { deviceId: string; deviceName: string }; // 打印机详情页面，必需设备信息
};

// Tab Navigator的路由参数类型定义
export type TabParamList = {
  首页: undefined;  // 首页Tab，显示蓝牙设备管理
  服务: undefined;  // 服务Tab，显示可用服务列表
  发现: undefined;  // 发现Tab，预留功能
  我的: undefined;  // 我的Tab，用户相关功能
};

// 导航相关的通用类型（用于组件props）
export type NavigationProps = {
  navigation: any;  // 导航对象，包含navigate、goBack等方法
  route: any;       // 路由对象，包含参数和路由信息
};
