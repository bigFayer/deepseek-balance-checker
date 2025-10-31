import React from 'react';

const BalanceResult = ({ balanceData, error, onReset }) => {
  if (error) {
    return (
      <div className="result error">
        <h3>查询失败</h3>
        <p>{error}</p>
        <button className="button" onClick={onReset}>
          重新查询
        </button>
      </div>
    );
  }

  if (!balanceData) {
    return null;
  }

  const { balance, total_granted, total_used, usage_percentage } = balanceData;

  // 安全地格式化数字，避免undefined错误
  const formatNumber = (num) => {
    return num !== undefined && !isNaN(num) ? num.toFixed(2) : '0.00';
  };

  const formatPercentage = (num) => {
    return num !== undefined && !isNaN(num) ? num.toFixed(2) : '0.00';
  };

  return (
    <div className="result">
      <h3>余额信息</h3>
      <div className="balance-info">
        <div className="info-item">
          <span className="label">当前余额:</span>
          <span className="value">¥{formatNumber(balance)}</span>
        </div>
        <div className="info-item">
          <span className="label">总额度:</span>
          <span className="value">¥{formatNumber(total_granted)}</span>
        </div>
        <div className="info-item">
          <span className="label">已使用:</span>
          <span className="value">¥{formatNumber(total_used)}</span>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-label">
          <span>使用进度</span>
          <span>{formatPercentage(usage_percentage)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${usage_percentage !== undefined && !isNaN(usage_percentage) ? usage_percentage : 0}%` }}
          ></div>
        </div>
      </div>
      
      <button className="button" onClick={onReset}>
        重新查询
      </button>
    </div>
  );
};

export default BalanceResult;