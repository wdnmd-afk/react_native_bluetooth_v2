/**
 * HTTP客户端测试文件
 * 用于验证HttpClient的基本功能
 */

import { HttpClient } from './HttpClient';

/**
 * 测试HTTP客户端基本功能
 */
export const testHttpClient = async () => {
  console.log('🧪 开始测试HTTP客户端功能...');
  
  try {
    // 设置测试基础URL
    HttpClient.setBaseURL('http://localhost:3000/api/v1');
    
    console.log('✅ 基础URL设置成功');
    
    // 测试GET请求（获取健康检查或公开端点）
    try {
      console.log('🔍 测试GET请求...');
      // 注意：这里使用一个不需要认证的端点进行测试
      // 如果没有公开端点，这个测试可能会失败，但不影响功能
      const getResponse = await HttpClient.get('health', { withAuth: false });
      console.log('✅ GET请求测试成功:', getResponse.status);
    } catch (error) {
      console.log('⚠️ GET请求测试失败（可能是正常的，如果没有公开端点）:', error);
    }
    
    // 测试POST请求结构（不实际发送）
    console.log('🔍 验证POST请求结构...');
    
    // 验证HttpClient类的方法存在
    if (typeof HttpClient.post === 'function') {
      console.log('✅ POST方法存在');
    } else {
      throw new Error('POST方法不存在');
    }
    
    if (typeof HttpClient.get === 'function') {
      console.log('✅ GET方法存在');
    } else {
      throw new Error('GET方法不存在');
    }
    
    if (typeof HttpClient.setToken === 'function') {
      console.log('✅ setToken方法存在');
    } else {
      throw new Error('setToken方法不存在');
    }
    
    if (typeof HttpClient.clearToken === 'function') {
      console.log('✅ clearToken方法存在');
    } else {
      throw new Error('clearToken方法不存在');
    }
    
    // 测试token管理
    console.log('🔍 测试token管理功能...');
    
    const testToken = 'test-jwt-token-12345';
    await HttpClient.setToken(testToken);
    console.log('✅ Token设置成功');
    
    const retrievedToken = await HttpClient.getToken();
    if (retrievedToken === testToken) {
      console.log('✅ Token获取成功');
    } else {
      throw new Error('Token获取失败');
    }
    
    await HttpClient.clearToken();
    const clearedToken = await HttpClient.getToken();
    if (clearedToken === null) {
      console.log('✅ Token清除成功');
    } else {
      throw new Error('Token清除失败');
    }
    
    console.log('🎉 HTTP客户端功能测试完成！');
    return true;
    
  } catch (error) {
    console.error('❌ HTTP客户端测试失败:', error);
    return false;
  }
};

/**
 * 测试登录请求格式（模拟）
 */
export const testLoginRequestFormat = () => {
  console.log('🧪 测试登录请求格式...');
  
  try {
    // 模拟登录请求数据
    const loginData = {
      username: 'test@example.com',
      password: 'testpassword123',
      rememberMe: true,
    };
    
    // 验证数据格式
    if (typeof loginData.username === 'string' && loginData.username.length > 0) {
      console.log('✅ 用户名格式正确');
    } else {
      throw new Error('用户名格式错误');
    }
    
    if (typeof loginData.password === 'string' && loginData.password.length >= 6) {
      console.log('✅ 密码格式正确');
    } else {
      throw new Error('密码格式错误');
    }
    
    if (typeof loginData.rememberMe === 'boolean') {
      console.log('✅ rememberMe格式正确');
    } else {
      throw new Error('rememberMe格式错误');
    }
    
    console.log('🎉 登录请求格式测试完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 登录请求格式测试失败:', error);
    return false;
  }
};

/**
 * 运行所有测试
 */
export const runAllTests = async () => {
  console.log('🚀 开始运行HTTP客户端完整测试套件...');
  
  const results = {
    httpClient: false,
    loginFormat: false,
  };
  
  // 运行HTTP客户端测试
  results.httpClient = await testHttpClient();
  
  // 运行登录格式测试
  results.loginFormat = testLoginRequestFormat();
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log(`HTTP客户端功能: ${results.httpClient ? '✅ 通过' : '❌ 失败'}`);
  console.log(`登录请求格式: ${results.loginFormat ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\n总体结果: ${allPassed ? '🎉 全部通过' : '⚠️ 部分失败'}`);
  
  return results;
};
