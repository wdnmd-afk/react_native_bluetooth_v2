/**
 * 网络连接测试工具
 * 用于诊断Android设备到WebRTC服务器的连接问题
 */

export interface NetworkTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export class NetworkTester {
  private serverUrl: string;

  constructor(serverUrl: string = 'http://192.168.0.143:3000') {
    this.serverUrl = serverUrl;
  }

  /**
   * 测试HTTP连接
   */
  async testHttpConnection(): Promise<NetworkTestResult> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🌐 测试HTTP连接到:', this.serverUrl);
      
      const response = await fetch(this.serverUrl, {
        method: 'GET',
        timeout: 10000,
      });

      if (response.ok) {
        return {
          success: true,
          message: 'HTTP连接成功',
          details: {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          },
          timestamp
        };
      } else {
        return {
          success: false,
          message: `HTTP连接失败: ${response.status} ${response.statusText}`,
          details: { status: response.status, statusText: response.statusText },
          timestamp
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `HTTP连接错误: ${error.message}`,
        details: { error: error.toString() },
        timestamp
      };
    }
  }

  /**
   * 测试Socket.IO连接
   */
  async testSocketConnection(): Promise<NetworkTestResult> {
    const timestamp = new Date().toISOString();
    
    return new Promise((resolve) => {
      try {
        console.log('🔌 测试Socket.IO连接到:', this.serverUrl);
        
        // 动态导入socket.io-client
        import('socket.io-client').then((io) => {
          const socket = io.default(this.serverUrl, {
            transports: ['websocket'],
            timeout: 10000,
            forceNew: true,
          });

          const timeout = setTimeout(() => {
            socket.disconnect();
            resolve({
              success: false,
              message: 'Socket.IO连接超时',
              details: { timeout: '10秒' },
              timestamp
            });
          }, 10000);

          socket.on('connect', () => {
            clearTimeout(timeout);
            console.log('✅ Socket.IO连接成功，ID:', socket.id);
            
            socket.disconnect();
            resolve({
              success: true,
              message: 'Socket.IO连接成功',
              details: { socketId: socket.id },
              timestamp
            });
          });

          socket.on('connect_error', (error: any) => {
            clearTimeout(timeout);
            console.error('❌ Socket.IO连接失败:', error);
            
            socket.disconnect();
            resolve({
              success: false,
              message: `Socket.IO连接失败: ${error.message}`,
              details: { error: error.toString() },
              timestamp
            });
          });

        }).catch((importError) => {
          resolve({
            success: false,
            message: `Socket.IO模块导入失败: ${importError.message}`,
            details: { error: importError.toString() },
            timestamp
          });
        });

      } catch (error: any) {
        resolve({
          success: false,
          message: `Socket.IO测试错误: ${error.message}`,
          details: { error: error.toString() },
          timestamp
        });
      }
    });
  }

  /**
   * 测试WebRTC STUN服务器连接
   */
  async testStunConnection(): Promise<NetworkTestResult> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🧊 测试STUN服务器连接...');
      
      // 动态导入react-native-webrtc
      const { RTCPeerConnection } = await import('react-native-webrtc');
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          pc.close();
          resolve({
            success: false,
            message: 'STUN服务器连接超时',
            details: { timeout: '15秒' },
            timestamp
          });
        }, 15000);

        let candidateReceived = false;

        (pc as any).onicecandidate = (event: any) => {
          if (event.candidate && !candidateReceived) {
            candidateReceived = true;
            clearTimeout(timeout);
            pc.close();
            
            resolve({
              success: true,
              message: 'STUN服务器连接成功',
              details: { candidate: event.candidate.candidate },
              timestamp
            });
          }
        };

        // 创建一个offer来触发ICE收集
        pc.createOffer().then((offer) => {
          return pc.setLocalDescription(offer);
        }).catch((error) => {
          clearTimeout(timeout);
          pc.close();
          resolve({
            success: false,
            message: `STUN测试失败: ${error.message}`,
            details: { error: error.toString() },
            timestamp
          });
        });
      });

    } catch (error: any) {
      return {
        success: false,
        message: `STUN测试错误: ${error.message}`,
        details: { error: error.toString() },
        timestamp
      };
    }
  }

  /**
   * 运行完整的网络诊断
   */
  async runFullDiagnostic(): Promise<NetworkTestResult[]> {
    console.log('🔍 开始完整网络诊断...');
    
    const results: NetworkTestResult[] = [];
    
    // 测试HTTP连接
    const httpResult = await this.testHttpConnection();
    results.push(httpResult);
    console.log('HTTP测试结果:', httpResult.success ? '✅' : '❌', httpResult.message);
    
    // 测试Socket.IO连接
    const socketResult = await this.testSocketConnection();
    results.push(socketResult);
    console.log('Socket.IO测试结果:', socketResult.success ? '✅' : '❌', socketResult.message);
    
    // 测试STUN连接
    const stunResult = await this.testStunConnection();
    results.push(stunResult);
    console.log('STUN测试结果:', stunResult.success ? '✅' : '❌', stunResult.message);
    
    console.log('🏁 网络诊断完成');
    return results;
  }
}

/**
 * 快速网络测试函数
 */
export async function quickNetworkTest(serverUrl?: string): Promise<void> {
  const tester = new NetworkTester(serverUrl);
  const results = await tester.runFullDiagnostic();
  
  console.log('\n📊 网络诊断报告:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.success ? '✅' : '❌'} ${result.message}`);
    if (result.details) {
      console.log('   详情:', result.details);
    }
  });
  
  const allSuccess = results.every(r => r.success);
  console.log(`\n🎯 总体结果: ${allSuccess ? '✅ 所有测试通过' : '❌ 存在连接问题'}`);
}
