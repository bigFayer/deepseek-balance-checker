// DOM元素
const apiKeyInput = document.getElementById('apiKey');
const checkBtn = document.getElementById('checkBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const error = document.getElementById('error');

// 结果显示元素
const currentBalance = document.getElementById('currentBalance');
const totalGranted = document.getElementById('totalGranted');
const totalUsed = document.getElementById('totalUsed');
const usagePercentage = document.getElementById('usagePercentage');
const progressFill = document.getElementById('progressFill');
const expireInfo = document.getElementById('expireInfo');
const expireTime = document.getElementById('expireTime');
const errorMessage = document.getElementById('errorMessage');

// API密钥验证
function validateApiKey(apiKey) {
  if (typeof apiKey !== 'string') return false;
  if (!apiKey.startsWith('sk-')) return false;
  if (apiKey.length < 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey.substring(3))) return false;
  return true;
}

// 监听API密钥输入
apiKeyInput.addEventListener('input', function() {
  const value = this.value.trim();
  const isValid = value.length > 0 && validateApiKey(value);
  
  checkBtn.disabled = !isValid;
  
  if (isValid) {
    checkBtn.classList.add('active');
    this.parentElement.classList.add('valid');
    this.parentElement.classList.remove('invalid');
  } else if (value.length > 0) {
    checkBtn.classList.remove('active');
    this.parentElement.classList.add('invalid');
    this.parentElement.classList.remove('valid');
  } else {
    checkBtn.classList.remove('active');
    this.parentElement.classList.remove('valid', 'invalid');
  }
});

// 监听回车键
apiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !checkBtn.disabled) {
    checkBalance();
  }
});

// 切换密码可见性
function togglePassword() {
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
}

// 查询余额
async function checkBalance() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showError('请输入API密钥');
    return;
  }

  showLoading();

  try {
    const response = await fetch('/api/check-balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });

    const data = await response.json();

    if (data.success) {
      showResult(data.data);
    } else {
      showError(data.error || '查询失败');
    }
  } catch (err) {
    console.error('请求错误:', err);
    showError('网络连接失败，请检查网络后重试');
  }
}

// 重试查询
function retryCheck() {
  if (apiKeyInput.value.trim()) {
    checkBalance();
  } else {
    showError('请先输入API密钥');
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
  currentBalance.textContent = formatCurrency(data.balance);
  totalGranted.textContent = formatCurrency(data.total_granted);
  totalUsed.textContent = formatCurrency(data.total_used);

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
function showError(message) {
  hideAllSections();
  error.classList.remove('hidden');
  errorMessage.textContent = message;

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
  // 从本地存储恢复API密钥
  try {
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey && validateApiKey(savedApiKey)) {
      apiKeyInput.value = savedApiKey;
      checkBtn.disabled = false;
      checkBtn.classList.add('active');
    } else {
      localStorage.removeItem('deepseek_api_key');
    }
  } catch (error) {
    console.warn('无法访问本地存储:', error);
  }

  // 保存API密钥到本地存储
  let saveTimeout;
  apiKeyInput.addEventListener('input', function() {
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

  // 检查网络状态
  window.addEventListener('offline', () => {
    showError('网络连接已断开，请检查网络设置');
  });
});
