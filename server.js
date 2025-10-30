const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const helmet = require('helmet');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全配置
const SECURITY_CONFIG = {
  // IP白名单，如果设置了，只有这些IP可以访问API
  allowedIPs: process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [],
  // 是否启用请求日志
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
  // 是否启用安全响应头
  enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS !== 'false',
  // API密钥最小长度
  minApiKeyLength: parseInt(process.env.MIN_API_KEY_LENGTH) || 40,
  // 是否验证请求来源
  validateOrigin: process.env.VALIDATE_ORIGIN === 'true'
};

// 请求日志中间件
function requestLogger(req, res, next) {
  if (SECURITY_CONFIG.enableRequestLogging) {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const method = req.method;
    const url = req.url;
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);
  }
  next();
}

// IP白名单验证中间件
function ipWhitelist(req, res, next) {
  if (SECURITY_CONFIG.allowedIPs.length > 0) {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!SECURITY_CONFIG.allowedIPs.includes(clientIP)) {
      console.warn(`拒绝来自IP ${clientIP}的请求，不在白名单中`);
      return res.status(403).json({
        error: '访问被拒绝',
        success: false
      });
    }
  }
  next();
}

// 请求来源验证中间件
function originValidator(req, res, next) {
  if (SECURITY_CONFIG.validateOrigin && req.path.startsWith('/api/')) {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.ALLOWED_ORIGIN || 'https://your-vercel-app.vercel.app']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    // 检查Origin或Referer头
    const isAllowed = (origin && allowedOrigins.includes(origin)) || 
                     (referer && allowedOrigins.some(allowed => referer.startsWith(allowed)));
    
    if (!isAllowed) {
      console.warn(`拒绝来自Origin ${origin} 或 Referer ${referer}的请求`);
      return res.status(403).json({
        error: '请求来源不被允许',
        success: false
      });
    }
  }
  next();
}

// 创建缓存实例，TTL为5分钟
const balanceCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// API配置
const API_CONFIG = {
  baseURL: 'https://api.deepseek.com',
  timeout: parseInt(process.env.API_TIMEOUT) || 15000,
  retries: parseInt(process.env.API_RETRIES) || 3,
  endpoints: {
    balance: '/v1/user/balance',
    fallback: '/user/balance'
  }
};

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 限制每个IP 100次请求
  message: {
    error: '请求过于频繁，请稍后再试',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 使用IP和用户代理作为键，更精确的限制
    return req.ip + ':' + (req.get('User-Agent') || '');
  }
});

// 安全中间件
if (SECURITY_CONFIG.enableSecurityHeaders) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'", "https://api.deepseek.com"]
      }
    },
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false
  }));
}

// 基础中间件
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(limiter);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN || 'https://your-vercel-app.vercel.app']
    : true,
  credentials: true
}));

// 安全验证中间件（仅对API路由）
app.use('/api', ipWhitelist);
app.use('/api', originValidator);

// 静态文件服务
app.use(express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// API密钥验证函数（增强版）
function validateApiKey (apiKey) {
  // 基本类型检查
  if (typeof apiKey !== 'string') return false;
  
  // 长度检查
  if (apiKey.length < SECURITY_CONFIG.minApiKeyLength) {
    console.warn(`API密钥长度不足: ${apiKey.length} < ${SECURITY_CONFIG.minApiKeyLength}`);
    return false;
  }
  
  // 前缀检查
  if (!apiKey.startsWith('sk-')) {
    console.warn('API密钥前缀无效');
    return false;
  }
  
  // 字符集检查
  const keyPart = apiKey.substring(3);
  if (!/^[a-zA-Z0-9_-]+$/.test(keyPart)) {
    console.warn('API密钥包含非法字符');
    return false;
  }
  
  // 熵检查（防止简单密钥）
  const uniqueChars = new Set(keyPart).size;
  if (uniqueChars < keyPart.length * 0.3) {
    console.warn('API密钥熵过低，可能不是有效密钥');
    return false;
  }
  
  return true;
}

// 生成请求ID用于跟踪
function generateRequestId() {
  return crypto.randomBytes(16).toString('hex');
}

// 安全日志记录
function logSecurityEvent(event, details) {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp} - ${event}:`, details);
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
async function fetchWithRetry (url, options, maxRetries = API_CONFIG.retries) {
  const axiosInstance = axios.create({
    timeout: API_CONFIG.timeout,
    headers: {
      'User-Agent': 'DeepSeek-Balance-Checker/1.1',
      'Accept': 'application/json',
      ...options.headers
    }
  });

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axiosInstance(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 只对网络错误和5xx错误进行重试
      if (error.response && error.response.status < 500) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, i), 5000); // 指数退避，最大5秒
      console.log(`请求失败，${delay}ms后重试 (${i + 1}/${maxRetries}): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 生成缓存键
function getCacheKey(apiKey) {
  // 使用API密钥的哈希值作为缓存键，避免存储敏感信息
  const crypto = require('crypto');
  return 'balance:' + crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 16);
}

// DeepSeek API余额查询接口（增强安全性）
app.post('/api/check-balance', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const { apiKey } = req.body;
  
  // 记录请求开始
  console.log(`[${requestId}] 开始处理余额查询请求 - IP: ${clientIP}`);

  // 输入验证
  if (!apiKey) {
    logSecurityEvent('缺少API密钥', { IP: clientIP, userAgent });
    return res.status(400).json({
      error: 'API密钥是必需的',
      success: false,
      requestId
    });
  }

  if (!validateApiKey(apiKey)) {
    logSecurityEvent('无效的API密钥', { 
      IP: clientIP, 
      userAgent, 
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + '...'
    });
    return res.status(400).json({
      error: 'API密钥格式无效',
      success: false,
      requestId
    });
  }

  // 检查缓存
  const cacheKey = getCacheKey(apiKey);
  const cachedBalance = balanceCache.get(cacheKey);
  if (cachedBalance) {
    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] 从缓存返回余额数据，耗时: ${responseTime}ms`);
    return res.json({
      success: true,
      data: cachedBalance,
      cached: true,
      responseTime,
      requestId
    });
  }

  try {
    console.log('开始查询DeepSeek API余额...');

    // 尝试主端点
    let response;
    try {
      response = await fetchWithRetry(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.balance}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (primaryError) {
      console.warn('主端点失败，尝试备用端点:', primaryError.message);
      // 尝试备用端点
      response = await fetchWithRetry(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.fallback}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    }

    const responseTime = Date.now() - startTime;
    console.log(`[${requestId}] API响应状态: ${response.status}, 耗时: ${responseTime}ms`);
    
    // 不记录完整的API响应数据，只记录关键信息
    console.log(`[${requestId}] API响应数据类型: ${typeof response.data}`);

    const result = parseBalanceResponse(response.data);
    console.log(`[${requestId}] 解析后的余额数据: 余额=${result.balance}, 已用=${result.total_used}`);

    // 缓存结果
    balanceCache.set(cacheKey, result);

    res.json({
      success: true,
      data: result,
      cached: false,
      responseTime,
      requestId
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error.response?.data || error.message;
    
    // 记录错误，但不记录敏感信息
    console.error(`[${requestId}] 查询余额时出错 (耗时: ${responseTime}ms):`, errorMessage);
    
    // 记录安全相关错误
    if (error.response?.status === 401) {
      logSecurityEvent('API密钥认证失败', { 
        IP: clientIP, 
        userAgent, 
        requestId,
        error: errorMessage
      });
      res.status(401).json({
        error: 'API密钥无效或已过期',
        success: false,
        responseTime,
        requestId
      });
    } else if (error.response?.status === 429) {
      logSecurityEvent('API请求频率限制', { 
        IP: clientIP, 
        userAgent, 
        requestId,
        error: errorMessage
      });
      res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        success: false,
        responseTime,
        requestId
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: '请求超时，请检查网络连接',
        success: false,
        responseTime,
        requestId
      });
    } else if (error.response?.status >= 500) {
      res.status(502).json({
        error: 'DeepSeek服务暂时不可用，请稍后再试',
        success: false,
        responseTime,
        requestId
      });
    } else {
      logSecurityEvent('未知错误', { 
        IP: clientIP, 
        userAgent, 
        requestId,
        error: errorMessage
      });
      res.status(500).json({
        error: '查询余额失败，请检查网络连接或API密钥',
        success: false,
        responseTime,
        requestId
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
