/**
 * DeepSeek API余额查询 - 前端逻辑
 * 优化版本，包含更好的错误处理、用户体验和性能优化
 */

// DOM元素缓存
const elements = {
  apiKeyInput: document.getElementById('apiKey'),
  checkBtn: document.getElementById('checkBtn'),
  loading: document.getElementById('loading'),
  result: document.getElementById('result'),
  error: document.getElementById('error'),
  currentBalance: document.getElementById('currentBalance'),
  totalGranted: document.getElementById('totalGranted'),
  totalUsed: document.getElementById('totalUsed'),
  usagePercentage: document.getElementById('usagePercentage'),
  progressFill: document.getElementById('progressFill'),
  expireInfo: document.getElementById('expireInfo'),
  expireTime: document.getElementById('expireTime'),
  errorMessage: document.getElementById('errorMessage')
};

// 应用状态管理
const appState = {
  isLoading: false,
  lastResult: null,
  apiKey: '',
  errorCount: 0
};

// API密钥验证
function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string') return false;
  if (!apiKey.startsWith('sk-')) return false;
  if (apiKey.length < 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey.substring(3))) return false;
  return true;
}

// 输入验证和UI更新
function handleInputValidation() {
  const value = elements.apiKeyInput.value.trim();
  const isValid = value.length > 0 && validateApiKey(value);
  
  elements.checkBtn.disabled = !isValid;
  
  if (isValid) {
    elements.checkBtn.classList.add('active');
    elements.apiKeyInput.parentElement.classList.add('valid');
    elements.apiKeyInput.parentElement.classList.remove('invalid');
  } else if (value.length > 0) {
    elements.checkBtn.classList.remove('active');
    elements.apiKeyInput.parentElement.classList.add('invalid');
    elements.apiKeyInput.parentElement.classList.remove('valid');
  } else {
    elements.checkBtn.classList.remove('active');
    elements.apiKeyInput.parentElement.classList.remove('valid', 'invalid');
  }
}

// 切换密码可见性
function togglePassword() {
  const input = elements.apiKeyInput;
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
}

// 查询余额
async function checkBalance() {
  const apiKey = elements.apiKeyInput.value.trim();

  if (!apiKey) {
    showError('请输入API密钥');
    return;
  }

  if (appState.isLoading) return;

  showLoading();
  appState.isLoading = true;
  appState.apiKey = apiKey;

  try {
    const response = await fetch('/api/v1/balance/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (data.success) {
      appState.lastResult = data.data;
      appState.errorCount = 0;
      showResult(data.data);
    } else {
      throw new Error(data.error || '查询失败');
    }
  } catch (err) {
    console.error('查询错误:', err);
    appState.errorCount++;
    
    let errorMessage = '网络连接失败，请检查网络后重试';
    
    if (err.message.includes('401') || err.message.includes('UNAUTHORIZED')) {
      errorMessage = 'API密钥无效或已过期';
    } else if (err.message.includes('403') || err.message.includes('FORBIDDEN')) {
      errorMessage = 'API密钥权限不足';
    } else if (err.message.includes('429') || err.message.includes('RATE_LIMITED')) {
      errorMessage = '请求过于频繁，请稍后再试';
    } else if (err.message.includes('TIMEOUT')) {
      errorMessage = '请求超时，请检查网络连接';
    } else if (err.message.includes('NETWORK_ERROR')) {
      errorMessage = '网络连接失败，请检查网络设置';
    }

    showError(errorMessage);
  } finally {
    appState.isLoading = false;
  }
}

// 重试查询
function retryCheck() {
  if (elements.apiKeyInput.value.trim()) {
    checkBalance();
  } else {
    showError('请先输入API密钥');
  }
}

// 显示加载状态
function showLoading() {
  hideAllSections();
  elements.loading.classList.remove('hidden');
  elements.checkBtn.disabled = true;
  elements.checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 查询中...';
}

// 显示结果
function showResult(data) {
  hideAllSections();
  elements.result.classList.remove('hidden');

  // 更新余额信息
  elements.currentBalance.textContent = formatCurrency(data.balance);
  elements.totalGranted.textContent = formatCurrency(data.total_granted);
  elements.totalUsed.textContent = formatCurrency(data.total_used);

  // 计算使用进度
  if (data.total_granted > 0) {
    const usagePercent = (data.total_used / data.total_granted) * 100;
    elements.usagePercentage.textContent = `${usagePercent.toFixed(1)}%`;
    elements.progressFill.style.width = `${Math.min(usagePercent, 100)}%`;

    // 根据使用率设置进度条颜色
    if (usagePercent > 90) {
      elements.progressFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else if (usagePercent > 75) {
      elements.progressFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else if (usagePercent > 50) {
      elements.progressFill.style.background = 'linear-gradient(90deg, #eab308, #ca8a04)';
    } else {
      elements.progressFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }
  } else {
    elements.usagePercentage.textContent = '0%';
    elements.progressFill.style.width = '0%';
  }

  // 显示到期时间
  if (data.expire_time) {
    elements.expireInfo.classList.remove('hidden');
    elements.expireTime.textContent = formatDateTime(data.expire_time);
  } else {
    elements.expireInfo.classList.add('hidden');
  }

  // 恢复按钮状态
  elements.checkBtn.disabled = false;
  elements.checkBtn.innerHTML = '<i class="fas fa-search"></i> 查询余额';

  // 添加成功动画
  animateElement(elements.result);
}

// 显示错误
function showError(message) {
  hideAllSections();
  elements.error.classList.remove('hidden');
  elements.errorMessage.textContent = message;

  // 恢复按钮状态
  elements.checkBtn.disabled = false;
  elements.checkBtn.innerHTML = '<i class="fas fa-search"></i> 查询余额';

  // 添加错误动画
  animateElement(elements.error);
}

// 隐藏所有区域
function hideAllSections() {
  elements.loading.classList.add('hidden');
  elements.result.classList.add('hidden');
  elements.error.classList.add('hidden');
}

// 格式化货币
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// 格式化日期时间
function formatDateTime(timestamp) {
  if (!timestamp) return '未知';

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let relativeTime = '';
    if (diffDays < 0) {
      relativeTime = '（已过期）';
    } else if (diffDays === 0) {
      relativeTime = '（今天）';
    } else if (diffDays === 1) {
      relativeTime = '（明天）';
    } else if (diffDays <= 7) {
      relativeTime = `（${diffDays}天后）`;
    } else if (diffDays <= 30) {
      relativeTime = `（${Math.ceil(diffDays / 7)}周后）`;
    } else {
      relativeTime = `（${Math.ceil(diffDays / 30)}月后）`;
    }

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai'
    }) + relativeTime;
  } catch (err) {
    return '无效日期';
  }
}

// 元素动画
function animateElement(element) {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    element.style.transition = 'all 0.5s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, 100);
}

// 本地存储管理
function saveToLocalStorage(key, value) {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('本地存储访问失败:', error);
  }
}

function getFromLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('本地存储访问失败:', error);
    return null;
  }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
  // 从本地存储恢复API密钥
  const savedApiKey = getFromLocalStorage('deepseek_api_key');
  if (savedApiKey && validateApiKey(savedApiKey)) {
    elements.apiKeyInput.value = savedApiKey;
    handleInputValidation();
  }

  // 事件监听器
  elements.apiKeyInput.addEventListener('input', () => {
    handleInputValidation();
    
    // 防抖保存到本地存储
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      const value = elements.apiKeyInput.value.trim();
      if (value) {
        saveToLocalStorage('deepseek_api_key', value);
      } else {
        saveToLocalStorage('deepseek_api_key', null);
      }
    }, 1000);
  });

  // 回车键查询
  elements.apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !elements.checkBtn.disabled) {
      checkBalance();
    }
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter 查询余额
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!elements.checkBtn.disabled) {
        checkBalance();
      }
    }

    // Escape 清空输入
    if (e.key === 'Escape') {
      elements.apiKeyInput.value = '';
      elements.apiKeyInput.focus();
      handleInputValidation();
      saveToLocalStorage('deepseek_api_key', null);
      hideAllSections();
    }
  });

  // 网络状态监听
  window.addEventListener('offline', () => {
    showError('网络连接已断开，请检查网络设置');
  });

  window.addEventListener('online', () => {
    if (elements.error.classList.contains('hidden') === false) {
      hideAllSections();
    }
  });

  // 自动聚焦输入框
  elements.apiKeyInput.focus();
});

// 全局函数导出（用于HTML onclick）
window.togglePassword = togglePassword;
window.checkBalance = checkBalance;
window.retryCheck = retryCheck;
