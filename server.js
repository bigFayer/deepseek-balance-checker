const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: {
    error: '请求过于频繁，请稍后再试',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 中间件
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN || 'https://your-vercel-app.vercel.app']
    : true,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// API密钥验证函数
function validateApiKey (apiKey) {
  if (typeof apiKey !== 'string') return false;
  if (!apiKey.startsWith('sk-')) return false;
  if (apiKey.length < 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey.substring(3))) return false;
  return true;
}

// 余额数据标准化函数
function normalizeBalance (balance) {
  return {
    balance: parseFloat(balance.total_balance || balance.balance || balance.available_balance || 0),
    currency: balance.currency || 'USD',
    total_granted: parseFloat(balance.total_grant || balance.grant_balance || 0),
    total_used: parseFloat(balance.total_used || balance.used_balance || 0),
    expire_time: balance.expire_time || null,
    grant_balance: parseFloat(balance.grant_balance || 0),
    cash_balance: parseFloat(balance.cash_balance || 0),
    available_balance: parseFloat(balance.available_balance || 0)
  };
}

// 解析余额响应的统一函数
function parseBalanceResponse (data) {
  const parsers = [
    // 尝试从 balance_infos 数组解析
    () => {
      if (data.balance_infos && Array.isArray(data.balance_infos) && data.balance_infos.length > 0) {
        return normalizeBalance(data.balance_infos[0]);
      }
      return null;
    },
    // 尝试从 data 字段解析
    () => {
      if (data.data && typeof data.data === 'object') {
        return normalizeBalance(data.data);
      }
      return null;
    },
    // 直接从顶层字段解析
    () => normalizeBalance(data)
  ];

  for (const parser of parsers) {
    try {
      const result = parser();
      if (result && (result.balance > 0 || result.total_granted > 0 || result.total_used > 0)) {
        return result;
      }
    } catch (error) {
      console.warn('解析器失败:', error.message);
    }
  }

  // 如果所有解析器都失败，返回默认值
  return normalizeBalance({});
}

// 带重试机制的请求函数
async function fetchWithRetry (url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 只对网络错误进行重试
      if (!error.response && error.code !== 'ECONNABORTED') {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, i), 5000); // 指数退避，最大5秒
      console.log(`请求失败，${delay}ms后重试 (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// DeepSeek API余额查询接口
app.post('/api/check-balance', async (req, res) => {
  const { apiKey } = req.body;

  // 输入验证
  if (!apiKey) {
    return res.status(400).json({
      error: 'API密钥是必需的',
      success: false
    });
  }

  if (!validateApiKey(apiKey)) {
    return res.status(400).json({
      error: 'API密钥格式无效',
      success: false
    });
  }

  try {
    console.log('开始查询DeepSeek API余额...');

    // 根据DeepSeek官方文档，使用正确的API端点
    const response = await fetchWithRetry('https://api.deepseek.com/v1/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DeepSeek-Balance-Checker/1.0'
      },
      timeout: 15000 // 增加到15秒
    });

    console.log('API响应状态:', response.status);
    
    // 只在开发环境中记录详细响应数据
    if (process.env.NODE_ENV !== 'production') {
      console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    }

    const result = parseBalanceResponse(response.data);
    
    // 只在开发环境中记录解析后的数据
    if (process.env.NODE_ENV !== 'production') {
      console.log('解析后的余额数据:', result);
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('查询余额时出错:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      res.status(401).json({
        error: 'API密钥无效或已过期',
        success: false
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        success: false
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: '请求超时，请检查网络连接',
        success: false
      });
    } else if (error.response?.status >= 500) {
      res.status(502).json({
        error: 'DeepSeek服务暂时不可用，请稍后再试',
        success: false
      });
    } else {
      res.status(500).json({
        error: '查询余额失败，请检查网络连接或API密钥',
        success: false
      });
    }
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`DeepSeek余额查询服务器运行在端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT} 开始使用`);
});

module.exports = app;
