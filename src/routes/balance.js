import express from 'express';
import axios from 'axios';
import { validateApiKey } from '../utils/validation.js';
import { parseBalanceResponse } from '../utils/balanceParser.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// 余额查询接口
router.post('/check', cacheMiddleware(60), async (req, res) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { apiKey } = req.body;

    // 验证API密钥
    if (!apiKey || !validateApiKey(apiKey)) {
      return res.status(400).json({
        error: '请输入有效的DeepSeek API密钥',
        success: false,
        code: 'INVALID_API_KEY',
        requestId,
        responseTime: Date.now() - startTime
      });
    }

    // 调用DeepSeek API
    const response = await axios.get('https://api.deepseek.com/v1/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DeepSeek-Balance-Checker/4.0.0',
        'X-Request-ID': requestId
      },
      timeout: 10000,
      validateStatus: (status) => status < 500
    });

    // 处理API响应
    if (response.status === 200) {
      const result = parseBalanceResponse(response.data);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId,
        responseTime: Date.now() - startTime
      });
    } else {
      handleApiError(response, res, requestId, startTime);
    }

  } catch (error) {
    handleRequestError(error, res, requestId, startTime);
  }
});

// 处理API错误响应
function handleApiError(response, res, requestId, startTime) {
  const statusCode = response.status;
  let errorMessage = '查询失败，请稍后重试';
  let errorCode = 'API_ERROR';

  switch (statusCode) {
    case 401:
      errorMessage = 'API密钥无效或已过期';
      errorCode = 'UNAUTHORIZED';
      break;
    case 403:
      errorMessage = 'API密钥权限不足';
      errorCode = 'FORBIDDEN';
      break;
    case 429:
      errorMessage = '请求过于频繁，请稍后再试';
      errorCode = 'RATE_LIMITED';
      break;
    case 404:
      errorMessage = 'API端点不存在';
      errorCode = 'NOT_FOUND';
      break;
    default:
      errorMessage = response.data?.message || errorMessage;
  }

  console.error(`[${new Date().toISOString()}] API错误响应:`, {
    requestId,
    statusCode,
    errorCode,
    errorMessage
  });

  res.status(statusCode).json({
    error: errorMessage,
    success: false,
    code: errorCode,
    requestId,
    responseTime: Date.now() - startTime
  });
}

// 处理请求错误
function handleRequestError(error, res, requestId, startTime) {
  console.error(`[${new Date().toISOString()}] 余额查询失败:`, {
    requestId,
    error: error.message,
    stack: error.stack
  });

  let errorMessage = '查询失败，请稍后重试';
  let statusCode = 500;
  let errorCode = 'REQUEST_ERROR';

  if (error.code === 'ECONNABORTED') {
    errorMessage = '请求超时，请检查网络连接';
    statusCode = 408;
    errorCode = 'TIMEOUT';
  } else if (error.code === 'ENOTFOUND') {
    errorMessage = '网络连接失败，请检查网络设置';
    statusCode = 503;
    errorCode = 'NETWORK_ERROR';
  } else if (error.response) {
    // 已经由handleApiError处理过的情况
    return;
  }

  res.status(statusCode).json({
    error: errorMessage,
    success: false,
    code: errorCode,
    requestId,
    responseTime: Date.now() - startTime
  });
}

export default router;