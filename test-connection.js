// 简单的网络连接测试脚本
const io = require('socket.io-client');

console.log('开始测试WebRTC服务器连接...');

const socket = io('http://192.168.0.143:3000', {
  transports: ['websocket'],
  timeout: 10000,
});

socket.on('connect', () => {
  console.log('✅ Socket.IO连接成功，ID:', socket.id);
  
  // 测试加入房间
  console.log('📡 测试加入房间0001...');
  socket.emit('signaling', {
    type: 'join-room',
    roomId: '0001',
    userId: 'test_android_client'
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket.IO连接失败:', error.message);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket.IO连接断开');
});

socket.on('signaling', (message) => {
  console.log('📨 收到信令消息:', message.type, 'from', message.fromUserId || 'unknown');
});

socket.on('user-joined', (data) => {
  console.log('👤 用户加入:', data);
});

socket.on('user-left', (data) => {
  console.log('👋 用户离开:', data);
});

socket.on('error', (error) => {
  console.error('❌ Socket错误:', error);
});

// 10秒后断开连接
setTimeout(() => {
  console.log('🔚 测试完成，断开连接');
  socket.disconnect();
  process.exit(0);
}, 10000);
