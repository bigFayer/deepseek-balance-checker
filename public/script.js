// DOM元素
const apiKeyInput = document.getElementById('apiKey');
const checkBtn = document.getElementById('checkBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const error = document.getElementById('error');

// 结果显示元素
const currentBalance = document.getElementById('currentBalance');
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
  checkBalance();
};

// 查询余额
async function checkBalance () {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showError('请输入API密钥');
    return;
  }

  // 显示加载状态
  showLoading();

  // 创建AbortController用于请求超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

  try {
    const startTime = performance.now();
    
    const response = await fetch('/api/check-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // 添加请求头标识AJAX请求
      },
      body: JSON.stringify({ apiKey }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = (performance.now() - startTime).toFixed(0);
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 添加响应时间到结果数据中
    if (data.success && data.data) {
      data.data.responseTime = `${responseTime}ms`;
    }

    if (data.success) {
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
    clearTimeout(timeoutId);
    console.error('请求错误:', err);

    // 提供更详细的错误信息
    const errorDetails = {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    };

    // 根据错误类型提供更友好的错误消息
    let errorMessage = '网络连接失败，请检查网络后重试';
    if (err.name === 'AbortError') {
      errorMessage = '请求超时，请稍后重试';
    } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
      errorMessage = '网络请求失败，请检查网络连接或服务器状态';
    } else if (err.message.includes('服务器响应错误')) {
      errorMessage = err.message;
    }

    showError(errorMessage, errorDetails);
  }
}

// 显示加载状态
function showLoading () {
  hideAllSections();
  loading.classList.remove('hidden');
  checkBtn.disabled = true;
  checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
  
  // 添加加载进度提示
  const loadingText = loading.querySelector('p');
  if (loadingText) {
    let dots = 0;
    const loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingText.textContent = '正在查询余额' + '.'.repeat(dots);
    }, 500);
    
    // 存储interval ID以便在加载完成后清除
    loading.dataset.intervalId = loadingInterval;
  }
}

// 显示结果
function showResult (data) {
  hideAllSections();
  result.classList.remove('hidden');

  // 更新余额信息
  currentBalance.textContent = formatCurrency(data.balance, data.currency);
  currency.textContent = data.currency || 'USD';
  totalGranted.textContent = formatCurrency(data.total_granted, data.currency);
  totalUsed.textContent = formatCurrency(data.total_used, data.currency);

  // 计算使用进度
  if (data.total_granted > 0) {
    const usagePercent = (data.total_used / data.total_granted) * 100;
    usagePercentage.textContent = usagePercent.toFixed(1) + '%';
    progressFill.style.width = Math.min(usagePercent, 100) + '%';

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

  // 添加响应时间信息（如果有）
  if (data.responseTime) {
    // 创建或更新响应时间显示元素
    let responseTimeElement = document.getElementById('responseTime');
    if (!responseTimeElement) {
      responseTimeElement = document.createElement('div');
      responseTimeElement.id = 'responseTime';
      responseTimeElement.className = 'response-time';
      
      // 添加到结果区域标题下方
      const resultHeader = document.querySelector('.result-header');
      resultHeader.insertAdjacentElement('afterend', responseTimeElement);
    }
    
    responseTimeElement.innerHTML = `<i class="fas fa-clock"></i> 响应时间: ${data.responseTime}`;
  }

  // 添加详细信息到控制台供调试
  console.log('DeepSeek API 响应数据:', data);

  // 如果所有余额都是0，显示提示信息
  if (data.balance === 0 && data.total_granted === 0 && data.total_used === 0) {
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
function showError (message, details = null) {
  hideAllSections();
  error.classList.remove('hidden');
  errorMessage.textContent = message;

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

// 显示Toast通知
function showToast(message, type = 'info') {
  // 创建toast元素
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // 添加样式
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '6px';
  toast.style.color = 'white';
  toast.style.fontWeight = '500';
  toast.style.zIndex = '1000';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'all 0.3s ease';
  
  // 根据类型设置背景色
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10b981';
      break;
    case 'error':
      toast.style.backgroundColor = '#ef4444';
      break;
    case 'warning':
      toast.style.backgroundColor = '#f59e0b';
      break;
    default:
      toast.style.backgroundColor = '#3b82f6';
  }
  
  // 添加到页面
  document.body.appendChild(toast);
  
  // 显示动画
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // 自动隐藏
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    
    // 移除元素
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// 隐藏所有区域
function hideAllSections () {
  // 清除加载动画的interval（如果有）
  if (loading.dataset.intervalId) {
    clearInterval(loading.dataset.intervalId);
    delete loading.dataset.intervalId;
  }
  
  loading.classList.add('hidden');
  result.classList.add('hidden');
  error.classList.add('hidden');
}


// 格式化货币
function formatCurrency (amount, currency = 'USD') {
  const num = parseFloat(amount) || 0;

  // 根据货币类型选择格式化选项
  if (currency === 'CNY' || currency === 'RMB') {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } else {
    // 默认使用USD格式
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }
}

// 格式化日期时间
function formatDateTime (timestamp) {
  if (!timestamp) return '未知';

  try {
    const date = new Date(timestamp);
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
    showToast('网络连接已恢复', 'success');
  });

  window.addEventListener('offline', () => {
    console.log('网络连接已断开');
    showError('网络连接已断开，请检查网络设置');
  });
  
  // 添加页面加载性能监控
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`页面加载完成，耗时: ${loadTime.toFixed(2)}ms`);
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
