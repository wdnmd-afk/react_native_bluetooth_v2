import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types/navigation';
import { routeConfigs, defaultStackOptions } from './config/routes';
import { navigationRef } from './utils/navigation';

// 创建Stack Navigator实例，用于页面间的跳转导航
const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    // NavigationContainer是React Navigation的根容器，绑定全局导航引用
    <NavigationContainer ref={navigationRef}>
      {/* Stack Navigator配置，使用统一的路由配置 */}
      <Stack.Navigator screenOptions={defaultStackOptions}>
        {/* 动态渲染所有路由配置 */}
        {routeConfigs.map((route) => (
          <Stack.Screen
            key={route.name}
            name={route.name}
            component={route.component}
            options={route.options}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
