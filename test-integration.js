/**
 * 集成测试脚本
 * 用于测试HTTP客户端和登录功能
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/v1';

/**
 * 创建测试用户
 */
async function createTestUser() {
  console.log('🧪 创建测试用户...');
  
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123',  // 包含大小写字母和数字
    fullName: '测试用户',
    role: 'user'
  };

  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 测试用户创建成功:', result.username);
      return true;
    } else if (response.status === 409) {
      console.log('ℹ️ 测试用户已存在，跳过创建');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ 创建测试用户失败:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ 创建测试用户请求失败:', error.message);
    return false;
  }
}

/**
 * 测试登录功能
 */
async function testLogin() {
  console.log('🧪 测试登录功能...');
  
  const loginData = {
    usernameOrEmail: 'testuser',  // 使用正确的字段名
    password: 'TestPassword123',   // 使用正确的密码格式
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 登录测试成功');
      console.log('   Token类型:', result.token_type);
      console.log('   用户名:', result.user.username);
      console.log('   用户ID:', result.user.id);
      return result.access_token;
    } else {
      const error = await response.text();
      console.error('❌ 登录测试失败:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ 登录请求失败:', error.message);
    return null;
  }
}

/**
 * 测试获取用户信息
 */
async function testGetProfile(token) {
  console.log('🧪 测试获取用户信息...');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 获取用户信息成功');
      console.log('   用户名:', result.username);
      console.log('   邮箱:', result.email);
      console.log('   角色:', result.role);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ 获取用户信息失败:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ 获取用户信息请求失败:', error.message);
    return false;
  }
}

/**
 * 测试健康检查
 */
async function testHealthCheck() {
  console.log('🧪 测试健康检查...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 健康检查成功');
      console.log('   状态:', result.status);
      console.log('   运行时间:', Math.round(result.uptime), '秒');
      return true;
    } else {
      console.error('❌ 健康检查失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 健康检查请求失败:', error.message);
    return false;
  }
}

/**
 * 运行完整测试套件
 */
async function runIntegrationTests() {
  console.log('🚀 开始运行集成测试...\n');
  
  const results = {
    health: false,
    createUser: false,
    login: false,
    profile: false,
  };
  
  // 1. 健康检查
  results.health = await testHealthCheck();
  console.log('');
  
  // 2. 创建测试用户
  results.createUser = await createTestUser();
  console.log('');
  
  // 3. 测试登录
  const token = await testLogin();
  results.login = !!token;
  console.log('');
  
  // 4. 测试获取用户信息
  if (token) {
    results.profile = await testGetProfile(token);
  }
  console.log('');
  
  // 输出测试结果
  console.log('📊 集成测试结果汇总:');
  console.log(`健康检查: ${results.health ? '✅ 通过' : '❌ 失败'}`);
  console.log(`创建用户: ${results.createUser ? '✅ 通过' : '❌ 失败'}`);
  console.log(`用户登录: ${results.login ? '✅ 通过' : '❌ 失败'}`);
  console.log(`获取信息: ${results.profile ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\n总体结果: ${allPassed ? '🎉 全部通过' : '⚠️ 部分失败'}`);
  
  return results;
}

// 运行测试
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = {
  runIntegrationTests,
  testHealthCheck,
  createTestUser,
  testLogin,
  testGetProfile,
};
