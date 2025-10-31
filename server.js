const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: '请求过于频繁，请稍后再试',
    success: false
  }
});

// 中间件
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN || 'https://your-vercel-app.vercel.app']
    : true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// API密钥验证
function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string') return false;
  if (!apiKey.startsWith('sk-')) return false;
  if (apiKey.length < 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey.substring(3))) return false;
  return true;
}

// 解析余额响应
function parseBalanceResponse(data) {
  const balanceInfo = data.balance_infos?.[0] || data.data || data;
  
  return {
    balance: parseFloat(balanceInfo.total_balance || balanceInfo.balance || 0),
    currency: balanceInfo.currency || 'CNY',
    total_granted: parseFloat(balanceInfo.total_grant || balanceInfo.grant_balance || 0),
    total_used: parseFloat(balanceInfo.total_used || balanceInfo.used_balance || 0),
    expire_time: balanceInfo.expire_time || null
  };
}

// 余额查询接口
app.post('/api/check-balance', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey || !validateApiKey(apiKey)) {
      return res.status(400).json({
        error: '请输入有效的API密钥',
        success: false
      });
    }

    const response = await axios.get('https://api.deepseek.com/v1/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const result = parseBalanceResponse(response.data);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('查询余额失败:', error.message);

    let errorMessage = '查询失败，请稍后重试';
    let statusCode = 500;

    if (error.response?.status === 401) {
      errorMessage = 'API密钥无效或已过期';
      statusCode = 401;
    } else if (error.response?.status === 403) {
      errorMessage = 'API密钥权限不足';
      statusCode = 403;
    } else if (error.response?.status === 429) {
      errorMessage = '请求过于频繁，请稍后再试';
      statusCode = 429;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接';
      statusCode = 408;
    }

    res.status(statusCode).json({
      error: errorMessage,
      success: false
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    success: false
  });
});

// 启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT}`);
  });
}

module.exports = app;
