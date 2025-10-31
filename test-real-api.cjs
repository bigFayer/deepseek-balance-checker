const axios = require('axios');

// 测试DeepSeek API获取真实余额数据
async function testRealApi() {
  try {
    // 注意：这里需要替换为一个真实的API密钥
    const apiKey = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    
    console.log('正在测试DeepSeek API...');
    
    const response = await axios.get('https://api.deepseek.com/v1/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    // 检查数据结构
    if (response.data && response.data.balance !== undefined) {
      console.log('\n余额数据:');
      console.log('当前余额:', response.data.balance);
      console.log('总额度:', response.data.total_granted);
      console.log('已使用:', response.data.total_used);
      
      // 计算使用百分比
      const usagePercentage = response.data.total_granted > 0 
        ? (response.data.total_used / response.data.total_granted) * 100 
        : 0;
      console.log('使用百分比:', usagePercentage.toFixed(2) + '%');
    } else {
      console.log('API返回的数据结构不符合预期');
    }
  } catch (error) {
    console.error('API请求失败:', error.message);
    
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testRealApi();