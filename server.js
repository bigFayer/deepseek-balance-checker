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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.deepseek.com"]
    }
  }
}));
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN || 'https://your-vercel-app.vercel.app']
    : true,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// API密钥验证和清理函数
function validateAndSanitizeApiKey (apiKey) {
  // 输入类型检查
  if (typeof apiKey !== 'string') {
    return { isValid: false, sanitizedKey: null, error: 'API密钥必须是字符串类型' };
  }

  // 去除首尾空白字符
  const trimmedKey = apiKey.trim();

  // 格式检查 - 必须在长度检查之前
  if (!trimmedKey.startsWith('sk-')) {
    return { isValid: false, sanitizedKey: null, error: 'API密钥必须以sk-开头' };
  }

  // 长度检查
  if (trimmedKey.length < 20) {
    return { isValid: false, sanitizedKey: null, error: 'API密钥长度过短' };
  }

  if (trimmedKey.length > 100) {
    return { isValid: false, sanitizedKey: null, error: 'API密钥长度过长' };
  }

  // 字符集检查 - 只允许字母、数字、下划线和连字符
  const keyBody = trimmedKey.substring(3);
  if (!/^[a-zA-Z0-9_-]+$/.test(keyBody)) {
    return { isValid: false, sanitizedKey: null, error: 'API密钥包含非法字符' };
  }

  // 返回验证通过和清理后的密钥
  return {
    isValid: true,
    sanitizedKey: trimmedKey,
    error: null
  };
}

// 余额数据标准化函数
function normalizeBalance (balance) {
  // 如果API返回了balance_infos数组，优先使用其中的数据
  if (balance.balance_infos && balance.balance_infos.length > 0) {
    const balanceInfo = balance.balance_infos[0];
    return {
      balance: parseFloat(balanceInfo.total_balance || balanceInfo.balance || balanceInfo.available_balance || 0),
      currency: balanceInfo.currency || balanceInfo.currency_code || balanceInfo.currency_type || 'CNY',
      total_granted: parseFloat(balanceInfo.total_grant || balanceInfo.grant_balance || 0),
      total_used: parseFloat(balanceInfo.total_used || balanceInfo.used_balance || 0),
      expire_time: balanceInfo.expire_time || null,
      grant_balance: parseFloat(balanceInfo.grant_balance || 0),
      cash_balance: parseFloat(balanceInfo.cash_balance || 0),
      available_balance: parseFloat(balanceInfo.available_balance || 0)
    };
  }
  
  // 否则使用顶级对象的数据
  return {
    balance: parseFloat(balance.total_balance || balance.balance || balance.available_balance || 0),
    currency: balance.currency || balance.currency_code || balance.currency_type || 'CNY',
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
  // 首先尝试从整个响应中提取货币类型
  let globalCurrency = data.currency || data.currency_code || data.currency_type || 'CNY';
  
  const parsers = [
    // 尝试从 balance_infos 数组解析
    () => {
      if (data.balance_infos && Array.isArray(data.balance_infos) && data.balance_infos.length > 0) {
        const balanceInfo = data.balance_infos[0];
        // 确保使用balance_infos中的货币类型，如果没有则使用全局货币类型
        balanceInfo.currency = balanceInfo.currency || balanceInfo.currency_code || globalCurrency;
        return normalizeBalance(balanceInfo);
      }
      return null;
    },
    // 尝试从 data 字段解析
    () => {
      if (data.data && typeof data.data === 'object') {
        // 确保使用data中的货币类型，如果没有则使用全局货币类型
        data.data.currency = data.data.currency || data.data.currency_code || globalCurrency;
        return normalizeBalance(data.data);
      }
      return null;
    },
    // 直接从顶层字段解析
    () => {
      // 确保使用顶层字段中的货币类型
      data.currency = data.currency || data.currency_code || globalCurrency;
      return normalizeBalance(data);
    }
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

  // 如果所有解析器都失败，返回默认值，但确保使用全局货币类型
  return normalizeBalance({ currency: globalCurrency });
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

  // 使用增强的验证和清理函数
  const validationResult = validateAndSanitizeApiKey(apiKey);
  if (!validationResult.isValid) {
    return res.status(400).json({
      error: validationResult.error,
      success: false
    });
  }

  const sanitizedApiKey = validationResult.sanitizedKey;

  try {
    console.log('开始查询DeepSeek API余额...');

    // 根据DeepSeek官方文档，使用正确的API端点
    const response = await fetchWithRetry('https://api.deepseek.com/v1/user/balance', {
      headers: {
        'Authorization': `Bearer ${sanitizedApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DeepSeek-Balance-Checker/1.0'
      },
      timeout: 15000 // 增加到15秒
    });

    console.log('API响应状态:', response.status);
    
    // 记录详细响应数据
    console.log('API响应数据:', JSON.stringify(response.data, null, 2));
    
    // 检查响应中的货币类型
    if (response.data.currency) {
      console.log('API返回的货币类型 (currency):', response.data.currency);
    }
    if (response.data.currency_code) {
      console.log('API返回的货币类型 (currency_code):', response.data.currency_code);
    }
    if (response.data.currency_type) {
      console.log('API返回的货币类型 (currency_type):', response.data.currency_type);
    }
    if (response.data.balance_infos && response.data.balance_infos.length > 0) {
      console.log('balance_infos[0]中的货币类型:', response.data.balance_infos[0].currency || response.data.balance_infos[0].currency_code);
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
    // 安全地记录错误信息，不泄露敏感数据
    const errorMessage = error.response?.data ? 
      `API响应错误: ${error.response.status} - ${JSON.stringify(error.response.data).substring(0, 200)}` : 
      `网络错误: ${error.message}`;
    
    console.error('查询余额时出错:', errorMessage);

    // 根据错误类型返回用户友好的消息
    if (error.response?.status === 401) {
      res.status(401).json({
        error: 'API密钥无效或已过期，请检查密钥是否正确',
        success: false
      });
    } else if (error.response?.status === 403) {
      res.status(403).json({
        error: 'API密钥权限不足，无法访问余额信息',
        success: false
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({
        error: '请求过于频繁，请等待15分钟后再试',
        success: false
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: '请求超时，请检查网络连接后重试',
        success: false
      });
    } else if (error.response?.status >= 500) {
      res.status(502).json({
        error: 'DeepSeek服务暂时不可用，请稍后再试',
        success: false
      });
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: '无法连接到DeepSeek服务器，请检查网络设置',
        success: false
      });
    } else {
      // 通用错误消息，不泄露具体错误详情
      res.status(500).json({
        error: '查询余额失败，请检查网络连接和API密钥',
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

// 启动服务器 - 仅在直接运行时启动
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DeepSeek余额查询服务器运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT} 开始使用`);
  });
}

// 导出app和函数供测试使用
module.exports = {
  app,
  validateAndSanitizeApiKey,
  normalizeBalance,
  parseBalanceResponse
};
