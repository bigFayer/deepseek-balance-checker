// DOM元素
const apiKeyInput = document.getElementById('apiKey');
const checkBtn = document.getElementById('checkBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const error = document.getElementById('error');

// 结果显示元素
const currentBalance = document.getElementById('currentBalance');
// eslint-disable-next-line no-unused-vars
const currency = document.getElementById('currency');
const totalGranted = document.getElementById('totalGranted');
const totalUsed = document.getElementById('totalUsed');
const usagePercentage = document.getElementById('usagePercentage');
const progressFill = document.getElementById('progressFill');
const expireInfo = document.getElementById('expireInfo');
const expireTime = document.getElementById('expireTime');
const errorMessage = document.getElementById('errorMessage');

// API密钥格式验证函数
const validateApiKeyFormat = (apiKey) => {
  if (typeof apiKey !== 'string') return false;
  if (!apiKey.startsWith('sk-')) return false;
  if (apiKey.length < 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey.substring(3))) return false;
  return true;
};

// 监听API密钥输入
apiKeyInput.addEventListener('input', function () {
  const value = this.value.trim();
  const hasValue = value.length > 0;
  const isValid = hasValue && validateApiKeyFormat(value);

  checkBtn.disabled = !isValid;

  if (isValid) {
    checkBtn.classList.add('active');
    this.parentElement.classList.remove('invalid');
    this.parentElement.classList.add('valid');
  } else if (hasValue) {
    checkBtn.classList.remove('active');
    this.parentElement.classList.add('invalid');
    this.parentElement.classList.remove('valid');
  } else {
    checkBtn.classList.remove('active');
    this.parentElement.classList.remove('invalid', 'valid');
  }
});

// 监听回车键
apiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !checkBtn.disabled) {
    checkBalance();
  }
});

// 切换密码可见性
window.togglePasswordVisibility = function () {
  const input = document.getElementById('apiKey');
  const toggleBtn = document.querySelector('.toggle-password i');

  if (input.type === 'password') {
    input.type = 'text';
    toggleBtn.classList.remove('fa-eye');
    toggleBtn.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    toggleBtn.classList.remove('fa-eye-slash');
    toggleBtn.classList.add('fa-eye');
  }
};

// 重试查询 - 导出供HTML使用
window.retryCheck = function () {
  const apiKey = document.getElementById('apiKey').value.trim();
  if (apiKey) {
    // 清除之前的错误信息
    const errorDiv = document.getElementById('error');
    const existingDetails = errorDiv.querySelector('.error-details');
    if (existingDetails) {
      errorDiv.removeChild(existingDetails);
    }
    const existingRetryBtn = errorDiv.querySelector('.retry-btn');
    if (existingRetryBtn) {
      errorDiv.removeChild(existingRetryBtn);
    }

    // 清除之前的结果显示
    const resultDiv = document.getElementById('result');
    resultDiv.style.opacity = '0';
    resultDiv.style.transform = 'translateY(20px)';

    // 重新执行查询
    checkBalance();
  } else {
    showError('请先输入API密钥');
  }
};

// 查询余额
async function checkBalance() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showError('请输入API密钥');
    return;
  }

  // 显示加载状态
  showLoading();

  try {
    const response = await fetch('/api/check-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    // 检查响应内容类型，确保是JSON
    const contentType = response.headers.get('content-type');
    let data;

    try {
      // 首先尝试解析JSON，即使content-type不正确
      const responseText = await response.text();

      // 记录响应详情以便调试
      // eslint-disable-next-line no-console
      console.log('响应详情:', {
        status: response.status,
        statusText: response.statusText,
        contentType: contentType,
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 200)
      });

      // 检查响应是否为空
      if (!responseText || responseText.trim() === '') {
        throw new Error('服务器返回了空响应');
      }

      // 尝试解析JSON
      data = JSON.parse(responseText);

      // 如果成功解析但content-type不正确，记录警告
      if (!contentType || !contentType.includes('application/json')) {
        // eslint-disable-next-line no-console
        console.warn('服务器返回了有效的JSON但content-type不正确:', contentType);
      }
    } catch (parseError) {
      // 如果JSON解析失败，检查content-type
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`服务器返回了非JSON响应。内容类型: ${contentType || '未知'}。错误: ${parseError.message}`);
      } else {
        throw new Error(`JSON解析失败: ${parseError.message}`);
      }
    }

    // 数据已在上面解析完成

    // 检查响应数据结构
    if (!data || typeof data !== 'object') {
      throw new Error('服务器返回了无效的数据格式');
    }

    // 检查success字段是否存在
    if (data.success === undefined) {
      // eslint-disable-next-line no-console
      console.warn('响应中缺少success字段，假设为成功');
      data.success = true;
    }

    if (data.success) {
      // 检查data字段是否存在
      if (!data.data) {
        throw new Error('成功响应中缺少data字段');
      }
      showResult(data.data);
    } else {
      // 如果有详细错误信息，传递给错误显示函数
      if (data.details) {
        showError(data.error || '查询失败', data.details);
      } else {
        showError(data.error || '查询失败');
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('请求错误:', err);

    // 提供更详细的错误信息
    const errorDetails = {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    };

    // 根据错误类型提供更友好的错误消息
    let errorMessage = '网络连接失败，请检查网络后重试';
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      errorMessage = '网络请求失败，请检查网络连接或服务器状态';
    } else if (err.name === 'AbortError') {
      errorMessage = '请求超时，请稍后重试';
    } else if (err.message.includes('JSON解析失败')) {
      errorMessage = '服务器返回了无效的JSON格式，请稍后重试';
    } else if (err.message.includes('非JSON响应')) {
      errorMessage = '服务器返回了非JSON格式响应，请稍后重试';
    } else if (err.message.includes('空响应')) {
      errorMessage = '服务器返回了空响应，请稍后重试';
    }

    showError(errorMessage, errorDetails);
  }
}

// 显示加载状态
function showLoading() {
  hideAllSections();
  loading.classList.remove('hidden');
  checkBtn.disabled = true;
  checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
}

// 显示结果
function showResult(data) {
  hideAllSections();
  result.classList.remove('hidden');

  // 更新余额信息
  const currencyType = data.currency || 'CNY';
  const currencySymbol = getCurrencySymbol(currencyType);

  // 使用正确的货币格式化函数
  currentBalance.textContent = formatCurrency(data.balance, currencyType);
  totalGranted.textContent = formatCurrency(data.total_granted, currencyType);
  totalUsed.textContent = formatCurrency(data.total_used, currencyType);

  // 更新所有货币符号显示
  document.querySelectorAll('.currency').forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.textContent = `${currencySymbol} ${currencyType}`;
  });

  // 计算使用进度
  if (data.total_granted > 0) {
    const usagePercent = (data.total_used / data.total_granted) * 100;
    usagePercentage.textContent = `${usagePercent.toFixed(1)}%`;
    progressFill.style.width = `${Math.min(usagePercent, 100)}%`;

    // 根据使用率设置进度条颜色
    if (usagePercent > 80) {
      progressFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (usagePercent > 60) {
      progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
      progressFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }
  } else {
    usagePercentage.textContent = '0%';
    progressFill.style.width = '0%';
  }

  // 显示到期时间
  if (data.expire_time) {
    expireInfo.classList.remove('hidden');
    expireTime.textContent = formatDateTime(data.expire_time);
  } else {
    expireInfo.classList.add('hidden');
  }

  // 只在开发环境中记录详细响应数据
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // eslint-disable-next-line no-console
    console.log('DeepSeek API 响应数据:', data);
  }

  // 如果所有余额都是0，显示提示信息
  if (data.balance === 0 && data.total_granted === 0 && data.total_used === 0) {
    // eslint-disable-next-line no-console
    console.warn('所有余额数据都是0，可能是API响应格式问题或账户无余额');
  }

  // 恢复按钮状态
  checkBtn.disabled = false;
  checkBtn.innerHTML = '<i class="fas fa-search"></i> 查询余额';

  // 添加成功动画
  result.style.opacity = '0';
  result.style.transform = 'translateY(20px)';
  setTimeout(() => {
    result.style.transition = 'all 0.5s ease';
    result.style.opacity = '1';
    result.style.transform = 'translateY(0)';
  }, 100);
}

// 显示错误
function showError(message, details = null) {
  hideAllSections();
  error.classList.remove('hidden');
  errorMessage.textContent = message;

  // 记录错误详情到控制台
  // eslint-disable-next-line no-console
  console.error('显示错误:', message, details);

  // 如果有详细信息，添加到错误区域
  if (details) {
    const detailsElement = document.createElement('div');
    detailsElement.className = 'error-details';
    detailsElement.innerHTML = `
      <details>
        <summary>详细信息</summary>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      </details>
    `;

    // 移除之前的详细信息（如果有）
    const existingDetails = error.querySelector('.error-details');
    if (existingDetails) {
      error.removeChild(existingDetails);
    }

    error.appendChild(detailsElement);
  }

  // 添加重试按钮
  const retryBtn = document.createElement('button');
  retryBtn.className = 'retry-btn';
  retryBtn.innerHTML = '<i class="fas fa-redo"></i> 重试';
  retryBtn.onclick = window.retryCheck;

  // 移除之前的重试按钮（如果有）
  const existingRetryBtn = error.querySelector('.retry-btn');
  if (existingRetryBtn) {
    error.removeChild(existingRetryBtn);
  }

  error.appendChild(retryBtn);

  // 恢复按钮状态
  checkBtn.disabled = false;
  checkBtn.innerHTML = '<i class="fas fa-search"></i> 查询余额';

  // 添加错误动画
  error.style.opacity = '0';
  error.style.transform = 'translateY(20px)';
  setTimeout(() => {
    error.style.transition = 'all 0.5s ease';
    error.style.opacity = '1';
    error.style.transform = 'translateY(0)';
  }, 100);
}

// 隐藏所有区域
function hideAllSections() {
  loading.classList.add('hidden');
  result.classList.add('hidden');
  error.classList.add('hidden');
}


// 获取货币符号
function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$',
    'CNY': '¥',
    'RMB': '¥',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  };
  return symbols[currency] || '$';
}

// 格式化货币（不带符号） - 暂未使用但保留以备后用
// eslint-disable-next-line no-unused-vars
function formatCurrencyWithoutSymbol(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// 格式化货币
function formatCurrency(amount, currency = 'CNY') {
  const num = parseFloat(amount) || 0;

  // 根据货币类型选择格式化选项
  if (currency === 'CNY' || currency === 'RMB') {
    // eslint-disable-next-line no-undef
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } else {
    // 默认使用CNY格式
    // eslint-disable-next-line no-undef
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }
}

// 格式化日期时间
function formatDateTime(timestamp) {
  if (!timestamp) return '未知';

  try {
    const date = new Date(timestamp);
    // eslint-disable-next-line no-undef
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai'
    });
  } catch (err) {
    return '无效日期';
  }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
  // 安全地检查本地存储中是否有保存的API密钥
  try {
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey && validateApiKeyFormat(savedApiKey)) {
      apiKeyInput.value = savedApiKey;
      checkBtn.disabled = false;
      checkBtn.classList.add('active');
    } else {
      // 清除无效的API密钥
      localStorage.removeItem('deepseek_api_key');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('无法访问本地存储:', error);
  }

  // 添加输入框焦点效果
  apiKeyInput.addEventListener('focus', function () {
    this.parentElement.classList.add('focused');
  });

  apiKeyInput.addEventListener('blur', function () {
    this.parentElement.classList.remove('focused');
  });

  // 保存API密钥到本地存储（可选功能）
  let saveTimeout;
  apiKeyInput.addEventListener('input', function () {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (this.value.trim()) {
        localStorage.setItem('deepseek_api_key', this.value.trim());
      } else {
        localStorage.removeItem('deepseek_api_key');
      }
    }, 1000);
  });

  // 添加键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter 查询余额
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!checkBtn.disabled) {
        checkBalance();
      }
    }

    // Escape 清空输入
    if (e.key === 'Escape') {
      apiKeyInput.value = '';
      apiKeyInput.focus();
      checkBtn.disabled = true;
      checkBtn.classList.remove('active');
      localStorage.removeItem('deepseek_api_key');
      hideAllSections();
    }
  });

  // 添加页面可见性变化监听
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时停止任何正在进行的请求
      // 这里可以添加取消请求的逻辑
    }
  });

  // 检查网络状态
  window.addEventListener('online', () => {
    // eslint-disable-next-line no-console
    console.log('网络连接已恢复');
  });

  window.addEventListener('offline', () => {
    // eslint-disable-next-line no-console
    console.log('网络连接已断开');
    showError('网络连接已断开，请检查网络设置');
  });
});

// 添加一些实用工具函数
const utils = {
  // 复制文本到剪贴板
  copyToClipboard: async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('已复制到剪贴板');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('复制失败:', err);
      this.showToast('复制失败', 'error');
    }
  },

  // 显示提示消息
  showToast: function (message, type = 'success') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // 添加样式
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);

    // 自动隐藏
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
};

// 导出工具函数供全局使用
window.utils = utils;
