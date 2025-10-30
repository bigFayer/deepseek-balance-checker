const axios = require('axios');

// 测试服务器响应格式
async function testJSONResponse() {
  console.log('🧪 测试服务器JSON响应格式...\n');

  const baseUrl = 'http://localhost:3000'; // 本地测试
  // const baseUrl = 'https://deepseek-balance-checker.vercel.app'; // 生产环境

  const tests = [
    {
      name: '健康检查接口',
      method: 'GET',
      url: `${baseUrl}/api/health`,
      data: null
    },
    {
      name: 'GET余额接口',
      method: 'GET', 
      url: `${baseUrl}/api/balance`,
      data: null
    },
    {
      name: 'POST余额检查 - 无API密钥',
      method: 'POST',
      url: `${baseUrl}/api/check-balance`,
      data: {}
    },
    {
      name: 'POST余额检查 - 无效API密钥',
      method: 'POST',
      url: `${baseUrl}/api/check-balance`,
      data: { apiKey: 'invalid-key' }
    },
    {
      name: '404路由',
      method: 'GET',
      url: `${baseUrl}/api/nonexistent`,
      data: null
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📋 测试: ${test.name}`);
      
      let response;
      if (test.method === 'GET') {
        response = await axios.get(test.url, {
          timeout: 10000,
          validateStatus: () => true // 接受所有状态码
        });
      } else {
        response = await axios.post(test.url, test.data, {
          timeout: 10000,
          validateStatus: () => true // 接受所有状态码
        });
      }

      // 检查Content-Type
      const contentType = response.headers['content-type'];
      console.log(`  ✅ 状态码: ${response.status}`);
      console.log(`  📄 Content-Type: ${contentType}`);

      // 检查是否为JSON格式
      if (contentType && contentType.includes('application/json')) {
        console.log(`  ✅ 响应格式正确 (JSON)`);
        
        // 尝试解析JSON
        try {
          const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
          console.log(`  ✅ JSON解析成功`);
          console.log(`  📊 响应结构:`, Object.keys(parsedData));
          
          // 检查必要字段
          if (parsedData.success !== undefined) {
            console.log(`  ✅ 包含success字段: ${parsedData.success}`);
          }
          if (parsedData.timestamp) {
            console.log(`  ✅ 包含timestamp字段`);
          }
        } catch (parseError) {
          console.log(`  ❌ JSON解析失败: ${parseError.message}`);
        }
      } else {
        console.log(`  ❌ 响应格式错误，期望JSON但得到: ${contentType}`);
        console.log(`  📄 响应内容:`, typeof response.data === 'string' ? response.data.substring(0, 200) : response.data);
      }

    } catch (error) {
      console.log(`  ❌ 请求失败: ${error.message}`);
      if (error.response) {
        console.log(`  📄 错误响应状态: ${error.response.status}`);
        console.log(`  📄 错误响应头: ${error.response.headers['content-type']}`);
      }
    }
    
    console.log(''); // 空行分隔
  }

  console.log('🎯 测试完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  testJSONResponse().catch(console.error);
}

module.exports = testJSONResponse;