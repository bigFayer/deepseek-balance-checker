const axios = require('axios');

// 测试DeepSeek API调用
async function testDeepSeekAPI() {
  console.log('开始测试DeepSeek API...');

  // 这里需要你提供一个真实的API密钥进行测试
  const testApiKey = 'sk-your-test-api-key-here';

  if (testApiKey === 'sk-your-test-api-key-here') {
    console.log('请修改 testApiKey 为你的真实API密钥');
    return;
  }

  const endpoints = [
    'https://api.deepseek.com/v1/user/balance',
    'https://api.deepseek.com/user/balance',
    'https://api.deepseek.com/v1/balance',
    'https://api.deepseek.com/balance'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n测试端点: ${endpoint}`);

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${testApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`✅ 成功! 状态码: ${response.status}`);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));

      // 分析响应结构
      const data = response.data;
      console.log('\n📊 数据结构分析:');
      console.log('- 顶层键:', Object.keys(data));

      if (data.balance_infos) {
        console.log('- balance_infos 类型:', Array.isArray(data.balance_infos) ? '数组' : typeof data.balance_infos);
        if (Array.isArray(data.balance_infos) && data.balance_infos.length > 0) {
          console.log('- 第一个余额对象的键:', Object.keys(data.balance_infos[0]));
        }
      }

      break; // 找到工作的端点就停止

    } catch (error) {
      console.log(`❌ 失败: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log('错误详情:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// 运行测试
testDeepSeekAPI().catch(console.error);
