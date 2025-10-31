/**
 * 缓存中间件
 * 为API响应提供简单的内存缓存
 */

import crypto from 'crypto';

const cache = new Map();
const DEFAULT_TTL = 60; // 默认缓存时间（秒）
const MAX_CACHE_SIZE = 1000; // 最大缓存条目数

/**
 * 内存缓存中间件
 * @param {number} ttlSeconds - 缓存生存时间（秒）
 * @returns {function} Express中间件
 */
function cacheMiddleware(ttlSeconds = DEFAULT_TTL) {
  return (req, res, next) => {
    // 只缓存GET和POST请求
    if (req.method !== 'GET' && req.method !== 'POST') {
      return next();
    }

    // 创建缓存键（基于方法和URL）
    const cacheKey = createCacheKey(req);
    
    // 检查缓存
    const cached = cache.get(cacheKey);
    
    if (cached && !isExpired(cached)) {
      // 更新命中次数
      cached.hits = (cached.hits || 0) + 1;
      
      // 添加缓存响应头
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Age', `${Math.floor((Date.now() - cached.timestamp) / 1000)}s`);
      
      // 返回缓存响应
      res.set(cached.headers);
      return res.status(cached.status).json({
        ...cached.body,
        _cached: true,
        _cacheTimestamp: cached.timestamp
      });
    }

    // 更新未命中次数
    if (cached) {
      cached.misses = (cached.misses || 0) + 1;
    }
    
    // 添加缓存未命中响应头
    res.set('X-Cache', 'MISS');

    // 缓存未命中，继续处理并缓存响应
    const originalSend = res.json;
    const originalStatus = res.status;
    
    let responseBody = null;
    let responseStatus = 200;
    const responseHeaders = {};
    
    // 拦截响应
    res.status = function(status) {
      responseStatus = status;
      return originalStatus.call(this, status);
    };
    
    res.json = function(body) {
      responseBody = body;
      
      // 只在成功时缓存
      if (responseStatus >= 200 && responseStatus < 400) {
        // 清理过期缓存
        cleanupExpiredCache();
        
        // 如果缓存已满，清理最旧的条目
        evictOldestEntries();
        
        const cacheEntry = {
          body: responseBody,
          status: responseStatus,
          headers: { ...responseHeaders },
          timestamp: Date.now(),
          ttl: ttlSeconds * 1000,
          hits: 1,
          misses: 0
        };
        
        cache.set(cacheKey, cacheEntry);
      }
      
      return originalSend.call(this, body);
    };
    
    // 复制响应头
    const originalSet = res.set;
    res.set = function(field, value) {
      if (typeof field === 'string') {
        responseHeaders[field] = value;
      } else if (typeof field === 'object') {
        Object.assign(responseHeaders, field);
      }
      return originalSet.call(this, field, value);
    };

    next();
  };
}

/**
 * 创建缓存键
 * @param {object} req - Express请求对象
 * @returns {string} 缓存键
 */
function createCacheKey(req) {
  const keyParts = [
    req.method,
    req.originalUrl,
    JSON.stringify(req.body || {}),
    JSON.stringify(req.query || {})
  ];
  
  // 使用crypto模块创建更安全的哈希
  return crypto.createHash('sha256').update(keyParts.join('|')).digest('hex');
}

/**
 * 检查缓存是否过期
 * @param {object} cached - 缓存条目
 * @returns {boolean} 是否过期
 */
function isExpired(cached) {
  return Date.now() - cached.timestamp > cached.ttl;
}

/**
 * 清理过期缓存
 */
function cleanupExpiredCache() {
  // 定期清理，避免内存泄漏
  if (Math.random() < 0.1) { // 10%的概率触发清理
    for (const [key, cached] of cache.entries()) {
      if (isExpired(cached)) {
        cache.delete(key);
      }
    }
  }
}

/**
 * 清理最旧的缓存条目（LRU策略）
 */
function evictOldestEntries() {
  if (cache.size <= MAX_CACHE_SIZE) {
    return;
  }
  
  // 将缓存条目按时间戳排序
  const sortedEntries = Array.from(cache.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  // 删除最旧的条目
  const entriesToDelete = sortedEntries.slice(0, cache.size - MAX_CACHE_SIZE + 10);
  entriesToDelete.forEach(([key]) => cache.delete(key));
}

/**
 * 手动清除缓存
 * @param {string} pattern - 缓存键模式（可选）
 */
function clearCache(pattern = null) {
  if (pattern) {
    for (const [key] of cache.entries()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

/**
 * 获取缓存统计信息
 * @returns {object} 缓存统计
 */
function getCacheStats() {
  cleanupExpiredCache();
  
  // 计算缓存命中率
  let hits = 0;
  let misses = 0;
  
  for (const entry of cache.values()) {
    if (entry.hits) hits += entry.hits;
    if (entry.misses) misses += entry.misses;
  }
  
  const total = hits + misses;
  const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) : '0.00';
  
  const stats = {
    totalEntries: cache.size,
    maxSize: MAX_CACHE_SIZE,
    memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    hits,
    misses,
    hitRate: `${hitRate}%`,
    defaultTtl: `${DEFAULT_TTL}秒`
  };
  
  return stats;
}

export {
  cacheMiddleware,
  clearCache,
  getCacheStats,
  cleanupExpiredCache,
  evictOldestEntries
};