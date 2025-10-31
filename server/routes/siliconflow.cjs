const express = require('express');
const axios = require('axios');
const router = express.Router();

// SiliconFlow API配置
const SILICONFLOW_API_URL = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1/user/info';

// 查询余额
router.post('/', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API密钥不能为空' });
    }
    
    // 调用SiliconFlow API查询余额
    const response = await axios.get(SILICONFLOW_API_URL, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 处理SiliconFlow API返回的数据格式
    // API返回格式: { "code": 0, "data": { "balance": "100.00", "total_granted": "100.00", "total_used": "0.00" }, "msg": "success" }
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
    
    // 返回余额信息
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('查询SiliconFlow余额失败:', error.message);
    
    // 处理API错误
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.msg || error.response.data?.message || '查询失败';
      
      if (status === 401) {
        return res.status(401).json({ error: 'API密钥无效或已过期' });
      } else if (status === 429) {
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
      } else if (status >= 500) {
        return res.status(502).json({ error: 'SiliconFlow服务器错误，请稍后再试' });
      } else {
        return res.status(status).json({ error: message });
      }
    } else if (error.request) {
      return res.status(503).json({ error: '无法连接到SiliconFlow服务器，请检查网络连接' });
    } else {
      return res.status(500).json({ error: '服务器内部错误' });
    }
  }
});

module.exports = router;