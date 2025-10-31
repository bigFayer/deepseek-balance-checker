const axios = require('axios');

// 测试修改后的API
async function testFixedAPI() {
  try {
    console.log('测试修改后的API...');
    
    // 发送请求到我们的后端API
    const response = await axios.post('http://localhost:3000/api/balance', {
      apiKey: 'sk-test123456789' // 使用测试API密钥
    });
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    // 检查数据格式
    if (response.data.success && response.data.data) {
      const { balance, total_granted, total_used } = response.data.data;
      console.log('\n格式化后的余额信息:');
      console.log('余额:', balance);
      console.log('总授予:', total_granted);
      console.log('已使用:', total_used);
      
      // 计算使用百分比
      const usage_percentage = total_granted > 0 ? (total_used / total_granted * 100) : 0;
      console.log('使用百分比:', usage_percentage.toFixed(2) + '%');
    }
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testFixedAPI();