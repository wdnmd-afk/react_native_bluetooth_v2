import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type PrinterSettingsRouteProp = RouteProp<RootStackParamList, 'PrinterSettings'>;

const PrinterSettingsScreen: React.FC = () => {
  const route = useRoute<PrinterSettingsRouteProp>();
  const { deviceId } = route.params || {};

  // 设置状态
  const [settings, setSettings] = useState({
    deviceName: 'HP LaserJet Pro',
    autoConnect: true,
    printQuality: 'high',
    paperSize: 'A4',
    orientation: 'portrait',
    copies: '1',
    enableNotifications: true,
    autoSleep: true,
    sleepTime: '30',
    enableEncryption: true,
    maxRetries: '3',
    connectionTimeout: '10',
  });

  // 更新设置
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 保存设置
  const handleSaveSettings = () => {
    Alert.alert(
      '保存成功',
      '打印机设置已保存',
      [{ text: '确定', style: 'default' }]
    );
  };

  // 重置设置
  const handleResetSettings = () => {
    Alert.alert(
      '重置设置',
      '确定要重置所有设置为默认值吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            setSettings({
              deviceName: 'HP LaserJet Pro',
              autoConnect: false,
              printQuality: 'normal',
              paperSize: 'A4',
              orientation: 'portrait',
              copies: '1',
              enableNotifications: false,
              autoSleep: false,
              sleepTime: '30',
              enableEncryption: false,
              maxRetries: '3',
              connectionTimeout: '10',
            });
          },
        },
      ]
    );
  };

  // 设置项组件
  const SettingItem = ({ 
    title, 
    subtitle, 
    children 
  }: { 
    title: string; 
    subtitle?: string; 
    children: React.ReactNode;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );

  // 选择器组件
  const Picker = ({ 
    value, 
    options, 
    onSelect 
  }: { 
    value: string; 
    options: { label: string; value: string }[]; 
    onSelect: (value: string) => void;
  }) => (
    <View style={styles.pickerContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.pickerOption,
            value === option.value && styles.pickerOptionSelected,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[
            styles.pickerOptionText,
            value === option.value && styles.pickerOptionTextSelected,
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部信息 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>打印机设置</Text>
          <Text style={styles.headerSubtitle}>
            配置打印机参数和连接选项
          </Text>
          {deviceId && (
            <Text style={styles.deviceId}>设备ID: {deviceId}</Text>
          )}
        </View>

        {/* 基本设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本设置</Text>
          
          <SettingItem title="设备名称" subtitle="自定义设备显示名称">
            <TextInput
              style={styles.textInput}
              value={settings.deviceName}
              onChangeText={(text) => updateSetting('deviceName', text)}
              placeholder="输入设备名称"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </SettingItem>

          <SettingItem title="自动连接" subtitle="启动时自动连接此设备">
            <Switch
              value={settings.autoConnect}
              onValueChange={(value) => updateSetting('autoConnect', value)}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor={settings.autoConnect ? '#ffffff' : '#9ca3af'}
            />
          </SettingItem>
        </View>

        {/* 打印设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>打印设置</Text>
          
          <SettingItem title="打印质量" subtitle="选择打印质量级别">
            <Picker
              value={settings.printQuality}
              options={[
                { label: '草稿', value: 'draft' },
                { label: '普通', value: 'normal' },
                { label: '高质量', value: 'high' },
              ]}
              onSelect={(value) => updateSetting('printQuality', value)}
            />
          </SettingItem>

          <SettingItem title="纸张大小" subtitle="默认纸张尺寸">
            <Picker
              value={settings.paperSize}
              options={[
                { label: 'A4', value: 'A4' },
                { label: 'A3', value: 'A3' },
                { label: 'Letter', value: 'Letter' },
              ]}
              onSelect={(value) => updateSetting('paperSize', value)}
            />
          </SettingItem>

          <SettingItem title="打印方向" subtitle="页面打印方向">
            <Picker
              value={settings.orientation}
              options={[
                { label: '纵向', value: 'portrait' },
                { label: '横向', value: 'landscape' },
              ]}
              onSelect={(value) => updateSetting('orientation', value)}
            />
          </SettingItem>

          <SettingItem title="默认份数" subtitle="每次打印的默认份数">
            <TextInput
              style={styles.numberInput}
              value={settings.copies}
              onChangeText={(text) => updateSetting('copies', text)}
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </SettingItem>
        </View>

        {/* 高级设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>高级设置</Text>
          
          <SettingItem title="推送通知" subtitle="接收打印状态通知">
            <Switch
              value={settings.enableNotifications}
              onValueChange={(value) => updateSetting('enableNotifications', value)}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor={settings.enableNotifications ? '#ffffff' : '#9ca3af'}
            />
          </SettingItem>

          <SettingItem title="自动休眠" subtitle="空闲时自动进入休眠模式">
            <Switch
              value={settings.autoSleep}
              onValueChange={(value) => updateSetting('autoSleep', value)}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor={settings.autoSleep ? '#ffffff' : '#9ca3af'}
            />
          </SettingItem>

          {settings.autoSleep && (
            <SettingItem title="休眠时间" subtitle="空闲多少分钟后休眠">
              <TextInput
                style={styles.numberInput}
                value={settings.sleepTime}
                onChangeText={(text) => updateSetting('sleepTime', text)}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
              />
            </SettingItem>
          )}

          <SettingItem title="数据加密" subtitle="启用蓝牙数据传输加密">
            <Switch
              value={settings.enableEncryption}
              onValueChange={(value) => updateSetting('enableEncryption', value)}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor={settings.enableEncryption ? '#ffffff' : '#9ca3af'}
            />
          </SettingItem>

          <SettingItem title="最大重试次数" subtitle="连接失败时的重试次数">
            <TextInput
              style={styles.numberInput}
              value={settings.maxRetries}
              onChangeText={(text) => updateSetting('maxRetries', text)}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </SettingItem>

          <SettingItem title="连接超时" subtitle="连接超时时间（秒）">
            <TextInput
              style={styles.numberInput}
              value={settings.connectionTimeout}
              onChangeText={(text) => updateSetting('connectionTimeout', text)}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </SettingItem>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>保存设置</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>重置为默认</Text>
          </TouchableOpacity>
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  deviceId: {
    fontSize: 14,
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    padding: 16,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  textInput: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 14,
    minWidth: 120,
  },
  numberInput: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  pickerOptionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default PrinterSettingsScreen;
