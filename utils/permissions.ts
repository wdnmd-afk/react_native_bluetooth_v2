import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS, PermissionStatus } from 'react-native-permissions';

// 权限类型枚举
export enum PermissionType {
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  LOCATION = 'location',
  BLUETOOTH = 'bluetooth'
}

// 统一的权限管理类
export class PermissionManager {
  
  /**
   * 检查并请求实时直播所需的所有权限（摄像头和麦克风）
   * @returns Promise<boolean> 是否获得所有必需权限
   */
  static async ensureLiveStreamingPermissions(): Promise<boolean> {
    console.log('开始检查实时直播权限');
    
    try {
      // 检查摄像头权限
      const cameraPermission = await this.requestCameraPermission();
      if (!cameraPermission) {
        console.log('摄像头权限获取失败');
        return false;
      }
      
      // 检查麦克风权限
      const microphonePermission = await this.requestMicrophonePermission();
      if (!microphonePermission) {
        console.log('麦克风权限获取失败');
        return false;
      }
      
      console.log('所有实时直播权限获取成功');
      return true;
      
    } catch (error) {
      console.error('检查实时直播权限时发生错误:', error);
      Alert.alert('权限检查失败', '检查权限时发生错误，请重试');
      return false;
    }
  }
  
  /**
   * 请求摄像头权限
   * @returns Promise<boolean> 是否获得摄像头权限
   */
  static async requestCameraPermission(): Promise<boolean> {
    console.log('请求摄像头权限');
    
    try {
      let permission: string;
      
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.CAMERA;
      } else {
        permission = PERMISSIONS.ANDROID.CAMERA;
      }
      
      const result = await request(permission);
      const isGranted = result === RESULTS.GRANTED;
      
      if (isGranted) {
        console.log('摄像头权限已获得');
      } else {
        console.log('摄像头权限被拒绝:', result);
        this.showPermissionBlockedAlert(PermissionType.CAMERA);
      }
      
      return isGranted;
      
    } catch (error) {
      console.error('请求摄像头权限时出错:', error);
      Alert.alert('权限请求失败', '请求摄像头权限时发生错误，请重试');
      return false;
    }
  }
  
  /**
   * 请求麦克风权限
   * @returns Promise<boolean> 是否获得麦克风权限
   */
  static async requestMicrophonePermission(): Promise<boolean> {
    console.log('请求麦克风权限');
    
    try {
      let permission: string;
      
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.MICROPHONE;
      } else {
        permission = PERMISSIONS.ANDROID.RECORD_AUDIO;
      }
      
      const result = await request(permission);
      const isGranted = result === RESULTS.GRANTED;
      
      if (isGranted) {
        console.log('麦克风权限已获得');
      } else {
        console.log('麦克风权限被拒绝:', result);
        this.showPermissionBlockedAlert(PermissionType.MICROPHONE);
      }
      
      return isGranted;
      
    } catch (error) {
      console.error('请求麦克风权限时出错:', error);
      Alert.alert('权限请求失败', '请求麦克风权限时发生错误，请重试');
      return false;
    }
  }
  
  /**
   * 检查权限状态（不请求）
   * @param permissionType 权限类型
   * @returns Promise<boolean> 权限是否已授予
   */
  static async checkPermissionStatus(permissionType: PermissionType): Promise<boolean> {
    try {
      let permission: string;
      
      switch (permissionType) {
        case PermissionType.CAMERA:
          permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
          break;
        case PermissionType.MICROPHONE:
          permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
          break;
        default:
          return false;
      }
      
      const result = await request(permission);
      return result === RESULTS.GRANTED;
      
    } catch (error) {
      console.error('检查权限状态时出错:', error);
      return false;
    }
  }
  
  /**
   * 显示权限被拒绝的提示对话框
   * @param type 权限类型
   */
  private static showPermissionBlockedAlert(type: PermissionType): void {
    const permissionNames = {
      [PermissionType.CAMERA]: '摄像头',
      [PermissionType.MICROPHONE]: '麦克风',
      [PermissionType.LOCATION]: '定位',
      [PermissionType.BLUETOOTH]: '蓝牙'
    };
    
    const permissionName = permissionNames[type];
    
    Alert.alert(
      `${permissionName}权限被拒绝`,
      `应用需要${permissionName}权限才能正常使用实时监控功能。请在设置中手动开启权限。`,
      [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: this.openAppSettings }
      ]
    );
  }
  
  /**
   * 打开应用设置页面
   */
  private static openAppSettings(): void {
    Linking.openSettings().catch(err => {
      console.error('无法打开设置:', err);
      Alert.alert(
        '错误',
        '无法打开设置页面，请手动到系统设置中找到本应用并开启相应权限'
      );
    });
  }
}
