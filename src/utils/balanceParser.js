/**
 * DeepSeek API余额响应解析器
 * 处理不同版本的API响应格式
 */

/**
 * 解析DeepSeek API余额响应
 * @param {object} data - API响应数据
 * @returns {object} 标准化的余额信息
 */
function parseBalanceResponse(data) {
  if (!data || typeof data !== 'object') {
    return createDefaultBalance();
  }

  try {
    // 处理不同的API响应格式
    const balanceInfo = extractBalanceInfo(data);
    
    return {
      balance: parseFloat(balanceInfo.total_balance || balanceInfo.balance || 0),
      currency: balanceInfo.currency || 'CNY',
      total_granted: parseFloat(balanceInfo.total_grant || balanceInfo.grant_balance || 0),
      total_used: parseFloat(balanceInfo.total_used || balanceInfo.used_balance || 0),
      expire_time: parseExpireTime(balanceInfo.expire_time),
      raw_data: data // 保留原始数据用于调试
    };
  } catch (error) {
    console.error('解析余额响应失败:', error);
    return createDefaultBalance();
  }
}

/**
 * 从API响应中提取余额信息
 * @param {object} data - API响应数据
 * @returns {object} 余额信息对象
 */
function extractBalanceInfo(data) {
  // 处理不同的API响应结构
  if (data.balance_infos && Array.isArray(data.balance_infos) && data.balance_infos.length > 0) {
    return data.balance_infos[0];
  }
  
  if (data.data) {
    return data.data;
  }
  
  if (data.balance !== undefined) {
    return data;
  }
  
  // 如果无法识别格式，返回默认结构
  return createDefaultBalance();
}

/**
 * 解析过期时间
 * @param {string|number} expireTime - 过期时间
 * @returns {string|null} 标准化的过期时间字符串
 */
function parseExpireTime(expireTime) {
  if (!expireTime) {
    return null;
  }

  try {
    // 处理时间戳（秒或毫秒）
    let timestamp = expireTime;
    
    if (typeof expireTime === 'string') {
      // 如果是ISO格式字符串
      if (expireTime.includes('T')) {
        return new Date(expireTime).toISOString();
      }
      // 尝试解析为数字
      timestamp = parseFloat(expireTime);
    }
    
    // 检查是否是秒级时间戳（10位）还是毫秒级（13位）
    if (timestamp > 1e12) { // 毫秒级时间戳
      return new Date(timestamp).toISOString();
    } else if (timestamp > 1e9) { // 秒级时间戳
      return new Date(timestamp * 1000).toISOString();
    }
    
    return null;
  } catch (error) {
    console.warn('解析过期时间失败:', error);
    return null;
  }
}

/**
 * 创建默认的余额信息对象
 * @returns {object} 默认余额信息
 */
function createDefaultBalance() {
  return {
    balance: 0,
    currency: 'CNY',
    total_granted: 0,
    total_used: 0,
    expire_time: null
  };
}

/**
 * 计算使用百分比
 * @param {number} used - 已使用额度
 * @param {number} granted - 总授予额度
 * @returns {number} 使用百分比
 */
function calculateUsagePercentage(used, granted) {
  if (!granted || granted <= 0) {
    return 0;
  }
  
  const percentage = (used / granted) * 100;
  return Math.min(Math.max(percentage, 0), 100); // 限制在0-100之间
}

/**
 * 格式化余额显示
 * @param {number} amount - 金额
 * @param {string} currency - 货币类型
 * @returns {string} 格式化后的金额字符串
 */
function formatBalanceDisplay(amount, currency = 'CNY') {
  const num = parseFloat(amount) || 0;
  
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch (error) {
    // 如果货币格式化失败，回退到简单格式
    return `${currency} ${num.toFixed(2)}`;
  }
}

export {
  parseBalanceResponse,
  extractBalanceInfo,
  parseExpireTime,
  calculateUsagePercentage,
  formatBalanceDisplay,
  createDefaultBalance
};