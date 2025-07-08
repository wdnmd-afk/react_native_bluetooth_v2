import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View } from 'react-native';
import HomeScreen from './index';
import ProfileScreen from './profile';
import ServiceScreen from './service';
import DiscoverScreen from './discover';

const Tab = createBottomTabNavigator();

// Custom Home Icon
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      borderRadius: 6,
      backgroundColor: 'transparent',
      position: 'relative',
    }}
  >
    <View
      style={{
        position: 'absolute',
        top: 8,
        left: 6,
        width: 10,
        height: 6,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopWidth: 2,
        borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
      }}
    />
  </View>
);

// Custom Service Icon
const ServiceIcon = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      }}
    />
  </View>
);

// Custom Discover Icon
const DiscoverIcon = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
        backgroundColor: 'transparent',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
        top: 9,
        left: 9,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 8,
        height: 2,
        backgroundColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
        top: 11,
        right: 2,
        borderRadius: 1,
      }}
    />
  </View>
);

// Custom Profile Icon
const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      backgroundColor: 'transparent',
      position: 'relative',
    }}
  >
    <View
      style={{
        position: 'absolute',
        top: 4,
        left: 6,
        width: 10,
        height: 8,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 2,
        left: 2,
        width: 18,
        height: 8,
        borderTopLeftRadius: 9,
        borderTopRightRadius: 9,
        borderWidth: 1.5,
        borderBottomWidth: 0,
        borderColor: focused ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
      }}
    />
  </View>
);

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(30, 58, 138, 0.95)',
          borderTopWidth: 0,
          borderRadius: 20,
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 34 : 16,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          paddingHorizontal: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          borderRadius: 12,
          marginHorizontal: 4,
        },
      }}>
      <Tab.Screen
        name="首页"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ focused }) => (
            <HomeIcon focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="服务"
        component={ServiceScreen}
        options={{
          tabBarLabel: '服务',
          tabBarIcon: ({ focused }) => (
            <ServiceIcon focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="发现"
        component={DiscoverScreen}
        options={{
          tabBarLabel: '发现',
          tabBarIcon: ({ focused }) => (
            <DiscoverIcon focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="我的"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ focused }) => (
            <ProfileIcon focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}