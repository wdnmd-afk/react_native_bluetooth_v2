import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useAppRouter } from '../utils/navigation';
import { usePermissions } from '../hooks/usePermissions';
import { WebRTCManager, ConnectionState } from '../utils/webrtc';
import { useAuth } from '../hooks/useAuth';
import { NetworkTester, NetworkTestResult } from '../utils/networkTest';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const LiveStreamingScreen: React.FC = () => {
  // 路由和认证
  const router = useAppRouter();
  const { user } = useAuth();

  // 权限管理
  const { requestLiveStreamingPermissions } = usePermissions();

  // 状态管理
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [roomNumber, setRoomNumber] = useState<string>('0001');
  const [localStream, setLocalStream] = useState<any>(null);
  const [networkTestResults, setNetworkTestResults] = useState<NetworkTestResult[]>([]);
  const [isTestingNetwork, setIsTestingNetwork] = useState(false);

  // WebRTC管理器引用
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);

  // 房间号格式化函数
  const formatRoomNumber = (input: string) => {
    // 只保留数字
    const numbers = input.replace(/\D/g, '');
    // 限制为4位数字，不足4位前面补0
    if (numbers.length === 0) return '0001';
    if (numbers.length <= 4) {
      return numbers.padStart(4, '0');
    }
    return numbers.slice(0, 4);
  };

  // 房间号变更处理
  const handleRoomNumberChange = (input: string) => {
    const formatted = formatRoomNumber(input);
    setRoomNumber(formatted);
  };

  // 网络连接测试
  const handleNetworkTest = async () => {
    setIsTestingNetwork(true);
    try {
      console.log('🔍 开始网络诊断...');
      const tester = new NetworkTester('http://192.168.0.143:3000');
      const results = await tester.runFullDiagnostic();
      setNetworkTestResults(results);

      const allSuccess = results.every(r => r.success);
      Alert.alert(
        '网络诊断完成',
        allSuccess ? '✅ 所有网络测试通过' : '❌ 发现网络连接问题，请查看详细日志',
        [{ text: '确定' }]
      );
    } catch (error) {
      console.error('网络测试失败:', error);
      Alert.alert('网络测试失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsTestingNetwork(false);
    }
  };

  useEffect(() => {
    // 初始化WebRTC管理器
    webrtcManagerRef.current = new WebRTCManager('http://192.168.0.143:3000');

    // 设置连接状态变化回调
    webrtcManagerRef.current.setConnectionStateChangeCallback((state: ConnectionState) => {
      console.log('连接状态变化:', state);
      setConnectionState(state);
    });

    // 初始化房间号（从0001开始，可以手动修改）
    console.log('初始化房间号:', roomNumber);

    // 组件卸载时清理资源
    return () => {
      handleStopStreaming();
    };
  }, [user]);

  /**
   * 开始直播
   */
  const handleStartStreaming = async () => {
    console.log('用户点击开始直播');
    setIsLoading(true);

    try {
      // 检查用户登录状态
      if (!user?.id) {
        Alert.alert('错误', '请先登录后再使用直播功能');
        return;
      }

      // 请求权限
      console.log('检查直播权限');
      const hasPermissions = await requestLiveStreamingPermissions();
      if (!hasPermissions) {
        Alert.alert('权限不足', '需要摄像头和麦克风权限才能开始直播');
        return;
      }

      // 开始推流
      console.log('开始推流:', { roomNumber, userId: user.id });
      const manager = webrtcManagerRef.current;
      if (manager) {
        await manager.startStreaming(roomNumber, user.id);

        // 获取本地流用于预览
        const stream = manager.getCurrentLocalStream();
        setLocalStream(stream);
        setIsStreaming(true);

        console.log('直播启动成功');
        Alert.alert('直播已开始', `房间号: ${roomNumber}\n观看地址: http://192.168.0.143:3000/viewer.html`);
      }

    } catch (error) {
      console.error('启动直播失败:', error);
      Alert.alert('启动失败', error instanceof Error ? error.message : '启动直播时发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 停止直播
   */
  const handleStopStreaming = async () => {
    console.log('用户点击停止直播');
    setIsLoading(true);

    try {
      const manager = webrtcManagerRef.current;
      if (manager) {
        await manager.stopStreaming();
      }

      setLocalStream(null);
      setIsStreaming(false);
      setConnectionState(ConnectionState.DISCONNECTED);

      console.log('直播已停止');
      Alert.alert('直播已停止', '直播已成功结束');

    } catch (error) {
      console.error('停止直播失败:', error);
      Alert.alert('停止失败', '停止直播时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 返回上一页
   */
  const handleGoBack = () => {
    if (isStreaming) {
      Alert.alert(
        '确认退出',
        '当前正在直播中，退出将停止直播。确定要退出吗？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确定',
            onPress: async () => {
              await handleStopStreaming();
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  /**
   * 获取连接状态显示文本
   */
  const getConnectionStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return '连接中...';
      case ConnectionState.CONNECTED:
        return '已连接';
      case ConnectionState.FAILED:
        return '连接失败';
      default:
        return '未连接';
    }
  };

  /**
   * 获取连接状态颜色
   */
  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return '#f59e0b';
      case ConnectionState.CONNECTED:
        return '#10b981';
      case ConnectionState.FAILED:
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* 头部导航 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>实时监控</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 视频预览区域 */}
      <View style={styles.videoContainer}>
        {localStream ? (
          <RTCView
            style={styles.localVideo}
            streamURL={localStream.toURL()}
            objectFit="cover"
            mirror={true}
          />
        ) : (
          <View style={styles.placeholderVideo}>
            <Text style={styles.placeholderText}>摄像头预览</Text>
            <Text style={styles.placeholderSubtext}>点击开始直播以启用摄像头</Text>
          </View>
        )}

        {/* 直播状态指示器 */}
        {isStreaming && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>直播中</Text>
          </View>
        )}
      </View>

      {/* 控制面板 */}
      <View style={styles.controlPanel}>
        {/* 房间号设置 */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomLabel}>房间号:</Text>
          <TextInput
            style={styles.roomInput}
            value={roomNumber}
            onChangeText={handleRoomNumberChange}
            placeholder="输入房间号 (如: 0001)"
            placeholderTextColor="#9ca3af"
            editable={!isStreaming}
            maxLength={4}
            keyboardType="numeric"
          />
        </View>

        {/* 连接状态 */}
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>连接状态:</Text>
          <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
            {getConnectionStatusText()}
          </Text>
        </View>

        {/* 控制按钮 */}
        <View style={styles.buttonContainer}>
          {!isStreaming ? (
            <>
              <TouchableOpacity
                style={[styles.controlButton, styles.startButton]}
                onPress={handleStartStreaming}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>开始直播</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.testButton]}
                onPress={handleNetworkTest}
                disabled={isTestingNetwork || isLoading}
              >
                {isTestingNetwork ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>网络诊断</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStopStreaming}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>停止直播</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 使用说明 */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>使用说明:</Text>
          <Text style={styles.instructionText}>
            1. 设置房间号（默认0001，可自定义）{'\n'}
            2. 点击"开始直播"启动摄像头推流{'\n'}
            3. 观看者访问: http://192.168.0.143:3000/viewer.html{'\n'}
            4. 输入相同房间号即可观看直播
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 60, // 占位，保持标题居中
  },
  videoContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    position: 'relative',
  },
  localVideo: {
    flex: 1,
    backgroundColor: '#000000',
  },
  placeholderVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  liveIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  controlPanel: {
    padding: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.1)',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginRight: 8,
  },
  roomId: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  roomInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
    flex: 1,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default LiveStreamingScreen;
