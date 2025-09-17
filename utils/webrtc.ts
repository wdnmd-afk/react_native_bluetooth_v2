import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  mediaDevices,
  RTCConfiguration,
} from 'react-native-webrtc';
import io, { Socket } from 'socket.io-client';

// WebRTC配置 - 优化STUN服务器配置，添加备选方案
const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.nextcloud.com:443' },
  ],
  iceCandidatePoolSize: 10, // 增加ICE候选者池大小
  iceTransportPolicy: 'all', // 允许所有传输策略
};

// 信令消息类型
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room';
  roomId: string;
  userId: string;
  data?: any;
}

// 连接状态枚举
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  FAILED = 'failed',
}

// 媒体流管理器
class StreamManager {
  private localStream: MediaStream | null = null;

  /**
   * 获取本地媒体流（摄像头和麦克风）
   * @returns Promise<MediaStream> 本地媒体流
   */
  async getLocalStream(): Promise<MediaStream> {
    console.log('获取本地媒体流');

    try {
      const stream = await mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 60 },
          facingMode: 'user', // 前置摄像头
        },
        audio: true, // 简化音频约束以避免类型问题
      });

      this.localStream = stream;
      console.log('本地媒体流获取成功');
      return stream;

    } catch (error) {
      console.error('获取本地媒体流失败:', error);
      throw new Error('无法访问摄像头或麦克风，请检查权限设置');
    }
  }

  /**
   * 停止本地媒体流
   */
  stopLocalStream(): void {
    if (this.localStream) {
      console.log('停止本地媒体流');
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  /**
   * 获取当前本地流
   */
  getCurrentStream(): MediaStream | null {
    return this.localStream;
  }
}

// 信令管理器
class SignalingManager {
  private socket: Socket | null = null;
  public serverUrl: string;

  constructor(serverUrl: string = 'http://192.168.0.143:3000') {
    this.serverUrl = serverUrl;
  }

  /**
   * 连接到信令服务器
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔄 开始连接到信令服务器:', this.serverUrl);

      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ 信令服务器连接成功，Socket ID:', this.socket?.id);
        resolve();
      });

      this.socket.on('connected', (data) => {
        console.log('📡 收到服务器连接确认:', data);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ 信令服务器连接失败:', error);
        console.error('❌ 错误详情:', {
          message: error.message || '未知错误',
          type: error.type || '连接错误',
          description: error.description || '无描述'
        });
        reject(new Error(`无法连接到服务器: ${error.message || '未知错误'}`));
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket连接断开，原因:', reason);
      });

      this.socket.on('error', (error) => {
        console.error('🚨 Socket错误:', error);
      });

      // 连接超时处理
      setTimeout(() => {
        if (!this.socket?.connected) {
          console.error('⏰ 连接超时');
          reject(new Error('连接超时'));
        }
      }, 15000);
    });
  }

  /**
   * 断开信令服务器连接
   */
  disconnect(): void {
    if (this.socket) {
      console.log('断开信令服务器连接');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * 发送信令消息
   */
  sendMessage(message: SignalingMessage): void {
    if (this.socket) {
      console.log('发送信令消息:', message.type);
      this.socket.emit('signaling', message);  // 修复：使用正确的事件名称
    }
  }

  /**
   * 监听信令消息
   */
  onMessage(callback: (message: SignalingMessage) => void): void {
    if (this.socket) {
      this.socket.on('signaling', callback);  // 修复：使用正确的事件名称
    }
  }

  /**
   * 加入房间
   */
  joinRoom(roomId: string, userId: string): void {
    const message: SignalingMessage = {
      type: 'join-room',
      roomId,
      userId,
    };
    this.sendMessage(message);
  }

  /**
   * 离开房间
   */
  leaveRoom(roomId: string, userId: string): void {
    const message: SignalingMessage = {
      type: 'leave-room',
      roomId,
      userId,
    };
    this.sendMessage(message);
  }
}

// 连接管理器
class ConnectionManager {
  private peerConnection: RTCPeerConnection | null = null;
  private onConnectionStateChange?: (state: ConnectionState) => void;

  /**
   * 创建RTCPeerConnection
   */
  createPeerConnection(): RTCPeerConnection {
    console.log('创建RTCPeerConnection');

    this.peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

    // 监听连接状态变化 (React Native WebRTC语法)
    (this.peerConnection as any).onconnectionstatechange = () => {
      const state = (this.peerConnection as any)?.connectionState;
      console.log('🔄 WebRTC连接状态变化:', state);

      if (this.onConnectionStateChange) {
        switch (state) {
          case 'connected':
            console.log('✅ WebRTC连接已建立');
            this.onConnectionStateChange(ConnectionState.CONNECTED);
            break;
          case 'connecting':
            console.log('🔄 WebRTC连接中...');
            this.onConnectionStateChange(ConnectionState.CONNECTING);
            break;
          case 'failed':
            console.log('❌ WebRTC连接失败');
            this.onConnectionStateChange(ConnectionState.FAILED);
            break;
          case 'disconnected':
            console.log('🔌 WebRTC连接断开');
            this.onConnectionStateChange(ConnectionState.FAILED);
            break;
          default:
            console.log('⚪ WebRTC连接状态:', state);
            this.onConnectionStateChange(ConnectionState.DISCONNECTED);
        }
      }
    };

    return this.peerConnection;
  }

  /**
   * 关闭连接
   */
  closePeerConnection(): void {
    if (this.peerConnection) {
      console.log('关闭RTCPeerConnection');
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  /**
   * 获取当前连接
   */
  getCurrentConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  /**
   * 设置连接状态变化回调
   */
  setConnectionStateChangeCallback(callback: (state: ConnectionState) => void): void {
    this.onConnectionStateChange = callback;
  }
}

// 主WebRTC管理器
export class WebRTCManager {
  private streamManager: StreamManager;
  private signalingManager: SignalingManager;
  private connectionManager: ConnectionManager;
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;
  private isStreaming: boolean = false;

  constructor(serverUrl?: string) {
    this.streamManager = new StreamManager();
    this.signalingManager = new SignalingManager(serverUrl);
    this.connectionManager = new ConnectionManager();
  }

  /**
   * 开始推流
   * @param roomId 房间ID
   * @param userId 用户ID
   */
  async startStreaming(roomId: string, userId: string): Promise<void> {
    console.log('🚀 开始推流:', { roomId, userId });
    console.log('🌐 服务器地址:', this.signalingManager.serverUrl);

    try {
      // 连接信令服务器
      console.log('📡 步骤1: 连接信令服务器...');
      await this.signalingManager.connect();

      // 获取本地媒体流
      console.log('📹 步骤2: 获取本地媒体流...');
      const localStream = await this.streamManager.getLocalStream();
      console.log('✅ 本地媒体流获取成功');

      // 创建RTCPeerConnection
      console.log('🔗 步骤3: 创建RTCPeerConnection...');
      const peerConnection = this.connectionManager.createPeerConnection();
      console.log('✅ RTCPeerConnection创建成功');

      // 添加本地流到连接
      console.log('🎵 步骤4: 添加本地流到连接...');
      localStream.getTracks().forEach(track => {
        console.log(`📺 添加轨道: ${track.kind}`);
        peerConnection.addTrack(track, localStream);
      });
      console.log('✅ 本地流添加完成');

      // 设置ICE候选处理
      (peerConnection as any).onicecandidate = (event: any) => {
        if (event.candidate) {
          console.log('🧊 发送ICE候选者');
          this.signalingManager.sendMessage({
            type: 'ice-candidate',
            roomId,
            userId,
            data: event.candidate,
          });
        } else {
          console.log('🧊 ICE候选者收集完成');
        }
      };

      // 监听信令消息
      console.log('👂 步骤5: 设置信令消息监听...');
      this.signalingManager.onMessage(this.handleSignalingMessage.bind(this));

      // 加入房间
      console.log('🏠 步骤6: 加入房间...');
      this.signalingManager.joinRoom(roomId, userId);

      // 等待一下让房间加入完成，然后创建Offer
      setTimeout(async () => {
        try {
          console.log('📝 步骤7: 创建Offer...');
          const offer = await peerConnection.createOffer();
          console.log('✅ Offer创建成功');

          console.log('💾 设置本地描述...');
          await peerConnection.setLocalDescription(offer);
          console.log('✅ 本地描述设置成功');

          console.log('📤 发送Offer到房间:', roomId);
          this.signalingManager.sendMessage({
            type: 'offer',
            roomId,
            userId,
            data: offer,
          });
          console.log('✅ Offer发送完成');
        } catch (error) {
          console.error('❌ 创建Offer失败:', error);
          throw error;
        }
      }, 1000);

      this.currentRoomId = roomId;
      this.currentUserId = userId;
      this.isStreaming = true;

      console.log('推流启动成功');

    } catch (error) {
      console.error('启动推流失败:', error);
      await this.stopStreaming();
      throw error;
    }
  }

  /**
   * 停止推流
   */
  async stopStreaming(): Promise<void> {
    console.log('停止推流');

    if (this.currentRoomId && this.currentUserId) {
      this.signalingManager.leaveRoom(this.currentRoomId, this.currentUserId);
    }

    this.streamManager.stopLocalStream();
    this.connectionManager.closePeerConnection();
    this.signalingManager.disconnect();

    this.currentRoomId = null;
    this.currentUserId = null;
    this.isStreaming = false;

    console.log('推流已停止');
  }

  /**
   * 处理信令消息
   */
  private async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    console.log('处理信令消息:', message.type);

    const peerConnection = this.connectionManager.getCurrentConnection();
    if (!peerConnection) return;

    try {
      switch (message.type) {
        case 'offer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          this.signalingManager.sendMessage({
            type: 'answer',
            roomId: message.roomId,
            userId: this.currentUserId!,
            data: answer,
          });
          break;

        case 'answer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
          break;

        case 'ice-candidate':
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
          break;
      }
    } catch (error) {
      console.error('处理信令消息失败:', error);
    }
  }

  /**
   * 获取当前本地流
   */
  getCurrentLocalStream(): MediaStream | null {
    return this.streamManager.getCurrentStream();
  }

  /**
   * 获取推流状态
   */
  getStreamingStatus(): boolean {
    return this.isStreaming;
  }

  /**
   * 设置连接状态变化回调
   */
  setConnectionStateChangeCallback(callback: (state: ConnectionState) => void): void {
    this.connectionManager.setConnectionStateChangeCallback(callback);
  }
}
