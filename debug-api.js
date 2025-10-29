const axios = require('axios');

// 调试DeepSeek API响应
async function debugDeepSeekAPI (apiKey) {
  console.log('🔍 开始调试DeepSeek API...');
  console.log('📝 API密钥前缀:', apiKey.substring(0, 7) + '...');

  try {
    const response = await axios.get('https://api.deepseek.com/v1/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('\n✅ API调用成功!');
    console.log('📊 状态码:', response.status);
    console.log('📋 响应头:', JSON.stringify(response.headers, null, 2));

    const data = response.data;
    console.log('\n📄 完整响应数据:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔍 数据结构分析:');
    console.log('- 顶层键名:', Object.keys(data));

    // 深度分析数据结构
    const analyzeObject = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          console.log(`- ${fullKey}: {对象} 键: [${Object.keys(value).join(', ')}]`);
          if (Object.keys(value).length <= 5) {
            analyzeObject(value, fullKey);
          }
        } else if (Array.isArray(value)) {
          console.log(`- ${fullKey}: [数组] 长度: ${value.length}`);
          if (value.length > 0 && typeof value[0] === 'object') {
            console.log(`  - 数组元素键: [${Object.keys(value[0]).join(', ')}]`);
          }
        } else {
          console.log(`- ${fullKey}: ${typeof value} = "${value}"`);
        }
      }
    };

    analyzeObject(data);

    // 查找可能的余额字段
    console.log('\n💰 查找余额相关字段:');
    const findBalanceFields = (obj, path = '') => {
      const balanceKeywords = ['balance', 'amount', 'credit', 'grant', 'used', 'total', 'available', 'remaining'];
      const results = [];

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        const keyLower = key.toLowerCase();

        // 检查键名是否包含余额相关关键词
        if (balanceKeywords.some(keyword => keyLower.includes(keyword))) {
          results.push({
            path: currentPath,
            key: key,
            value: value,
            type: typeof value
          });
        }

        // 递归检查嵌套对象
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          results.push(...findBalanceFields(value, currentPath));
        }
      }

      return results;
    };

    const balanceFields = findBalanceFields(data);
    console.log('找到的余额相关字段:');
    balanceFields.forEach(field => {
      console.log(`  - ${field.path}: ${field.type} = ${JSON.stringify(field.value)}`);
    });

    return data;

  } catch (error) {
    console.log('\n❌ API调用失败!');
    console.log('错误类型:', error.constructor.name);
    console.log('错误消息:', error.message);

    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应头:', JSON.stringify(error.response.headers, null, 2));
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2));
    }

    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const apiKey = process.argv[2];

  if (!apiKey) {
    console.log('❌ 请提供API密钥作为参数');
    console.log('用法: node debug-api.js sk-your-api-key-here');
    process.exit(1);
  }

  debugDeepSeekAPI(apiKey).catch(console.error);
}

module.exports = debugDeepSeekAPI;
