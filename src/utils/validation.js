/**
 * API密钥验证工具
 * 验证DeepSeek API密钥的格式和有效性
 */

/**
 * 验证DeepSeek API密钥格式
 * @param {string} apiKey - 要验证的API密钥
 * @returns {boolean} 是否有效
 */
function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string') {
    return false;
  }

  // 基本格式检查
  if (!apiKey.startsWith('sk-')) {
    return false;
  }

  // 长度检查 - 更灵活的范围，适应不同版本的API密钥
  if (apiKey.length < 10 || apiKey.length > 300) {
    return false;
  }

  // 字符集检查（只允许字母、数字、下划线、连字符）
  const keyBody = apiKey.substring(3);
  if (!/^[a-zA-Z0-9_-]+$/.test(keyBody)) {
    return false;
  }

  return true;
}

/**
 * 清理和标准化API密钥
 * @param {string} apiKey - 原始API密钥
 * @returns {string} 清理后的API密钥
 */
function sanitizeApiKey(apiKey) {
  if (typeof apiKey !== 'string') {
    return '';
  }
  
  return apiKey.trim();
}

/**
 * 验证请求体结构
 * @param {object} body - 请求体
 * @returns {object} 验证结果 { isValid: boolean, errors: string[] }
 */
function validateRequestBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('请求体必须为JSON对象');
    return { isValid: false, errors };
  }

  if (!body.apiKey) {
    errors.push('apiKey字段是必需的');
  } else if (typeof body.apiKey !== 'string') {
    errors.push('apiKey必须是字符串');
  } else if (!validateApiKey(body.apiKey)) {
    errors.push('apiKey格式无效');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证环境变量配置
 * @returns {object} 验证结果 { isValid: boolean, missing: string[] }
 */
function validateEnvironment() {
  const required = ['NODE_ENV'];
  const missing = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing
  };
}

export {
  validateApiKey,
  sanitizeApiKey,
  validateRequestBody,
  validateEnvironment
};