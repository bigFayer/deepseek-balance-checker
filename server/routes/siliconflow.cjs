const express = require('express');
const axios = require('axios');
const router = express.Router();

// SiliconFlow API配置
const SILICONFLOW_API_URL = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/user/info';

// 查询单个API密钥余额
const checkSingleBalance = async (apiKey) => {
  try {
    const response = await axios.get(SILICONFLOW_API_URL, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 处理SiliconFlow API返回的数据格式
    const responseData = response.data;
    
    // 转换为前端期望的格式
    let formattedData = {
      balance: 0,
      total_granted: 0,
      total_used: 0
    };
    
    if (responseData.data) {
      formattedData.balance = parseFloat(responseData.data.balance) || 0;
      formattedData.total_granted = parseFloat(responseData.data.total_granted) || 0;
      formattedData.total_used = parseFloat(responseData.data.total_used) || 0;
    }
    
    return {
      success: true,
      data: formattedData,
      apiKey: apiKey.substring(0, 8) + '...' // 只显示前8位，保护隐私
    };
  } catch (error) {
    let errorMessage = '查询失败';
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.msg || error.response.data?.message || '查询失败';
      
      if (status === 401) {
        errorMessage = 'API密钥无效或已过期';
      } else if (status === 429) {
        errorMessage = '请求过于频繁，请稍后再试';
      } else if (status >= 500) {
        errorMessage = 'SiliconFlow服务器错误，请稍后再试';
      } else {
        errorMessage = message;
      }
    } else if (error.request) {
      errorMessage = '无法连接到SiliconFlow服务器，请检查网络连接';
    } else {
      errorMessage = '服务器内部错误';
    }
    
    return {
      success: false,
      error: errorMessage,
      apiKey: apiKey.substring(0, 8) + '...' // 只显示前8位，保护隐私
    };
  }
};

// 查询余额
router.post('/', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API密钥不能为空' });
    }
    
    // 使用共享的查询函数
    const result = await checkSingleBalance(apiKey);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      // 根据错误类型返回适当的状态码
      if (result.error.includes('无效或已过期')) {
        return res.status(401).json({ error: result.error });
      } else if (result.error.includes('过于频繁')) {
        return res.status(429).json({ error: result.error });
      } else if (result.error.includes('服务器错误')) {
        return res.status(502).json({ error: result.error });
      } else if (result.error.includes('无法连接')) {
        return res.status(503).json({ error: result.error });
      } else {
        return res.status(400).json({ error: result.error });
      }
    }
  } catch (error) {
    console.error('查询SiliconFlow余额失败:', error.message);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

// 批量查询余额
router.post('/batch', async (req, res) => {
  try {
    const { apiKeys } = req.body;
    
    if (!apiKeys || !Array.isArray(apiKeys) || apiKeys.length === 0) {
      return res.status(400).json({ error: 'API密钥列表不能为空' });
    }
    
    // 限制批量查询数量，防止服务器过载
    if (apiKeys.length > 20) {
      return res.status(400).json({ error: '一次最多查询20个API密钥' });
    }
    
    // 并发查询所有API密钥
    const promises = apiKeys.map(apiKey => checkSingleBalance(apiKey));
    const results = await Promise.all(promises);
    
    // 统计成功和失败的数量
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    // 计算总余额
    let totalBalance = 0;
    let totalGranted = 0;
    let totalUsed = 0;
    
    results.forEach(result => {
      if (result.success) {
        totalBalance += result.data.balance;
        totalGranted += result.data.total_granted;
        totalUsed += result.data.total_used;
      }
    });
    
    res.json({
      success: true,
      summary: {
        total: results.length,
        success: successCount,
        failure: failureCount,
        totalBalance,
        totalGranted,
        totalUsed
      },
      details: results
    });
  } catch (error) {
    console.error('批量查询SiliconFlow余额失败:', error.message);
    return res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;