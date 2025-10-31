const express = require('express');
const axios = require('axios');
const router = express.Router();

// DeepSeek API配置
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/user/balance';

// 查询余额
router.post('/', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API密钥不能为空' });
    }
    
    // 调用DeepSeek API查询余额
    const response = await axios.get(DEEPSEEK_API_URL, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 处理DeepSeek API返回的数据格式
    // API返回格式: { "is_available": true, "balance_infos": [ { "currency": "CNY", "total_balance": "110.00", "granted_balance": "10.00", "topped_up_balance": "100.00" } ] }
    const balanceData = response.data;
    
    // 转换为前端期望的格式
    let formattedData = {
      balance: 0,
      total_granted: 0,
      total_used: 0
    };
    
    if (balanceData.balance_infos && balanceData.balance_infos.length > 0) {
      const balanceInfo = balanceData.balance_infos[0];
      formattedData.balance = parseFloat(balanceInfo.total_balance) || 0;
      formattedData.total_granted = parseFloat(balanceInfo.granted_balance) || 0;
      formattedData.total_used = parseFloat(balanceInfo.topped_up_balance) || 0;
    }
    
    // 返回余额信息
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('查询余额失败:', error.message);
    
    // 处理API错误
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || '查询失败';
      
      if (status === 401) {
        return res.status(401).json({ error: 'API密钥无效或已过期' });
      } else if (status === 429) {
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
      } else if (status >= 500) {
        return res.status(502).json({ error: 'DeepSeek服务器错误，请稍后再试' });
      } else {
        return res.status(status).json({ error: message });
      }
    } else if (error.request) {
      return res.status(503).json({ error: '无法连接到DeepSeek服务器，请检查网络连接' });
    } else {
      return res.status(500).json({ error: '服务器内部错误' });
    }
  }
});

module.exports = router;