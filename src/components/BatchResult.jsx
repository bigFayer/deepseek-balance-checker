import React from 'react';
import './BatchResult.css';

const BatchResult = ({ batchResults, onReset, provider }) => {
  if (!batchResults || !batchResults.summary) {
    return null;
  }

  const { summary, details } = batchResults;
  const { total, success, failure, totalBalance, totalGranted, totalUsed } = summary;

  // 计算总使用百分比
  const totalUsagePercentage = totalGranted > 0 
    ? (totalUsed / totalGranted) * 100 
    : 0;

  const getProviderName = () => {
    return provider === 'siliconflow' ? '硅基流动' : 'DeepSeek';
  };

  return (
    <div className="batch-result">
      <div className="batch-result-header">
        <h2>{getProviderName()} 批量查询结果</h2>
        <button className="reset-button" onClick={onReset}>
          重新查询
        </button>
      </div>

      <div className="batch-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">总数量</span>
            <span className="stat-value">{total}</span>
          </div>
          <div className="stat-item success">
            <span className="stat-label">成功</span>
            <span className="stat-value">{success}</span>
          </div>
          <div className="stat-item error">
            <span className="stat-label">失败</span>
            <span className="stat-value">{failure}</span>
          </div>
        </div>

        <div className="summary-balance">
          <div className="balance-item">
            <span className="balance-label">总余额</span>
            <span className="balance-value">¥{totalBalance.toFixed(2)}</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">总授信额度</span>
            <span className="balance-value">¥{totalGranted.toFixed(2)}</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">总使用额度</span>
            <span className="balance-value">¥{totalUsed.toFixed(2)}</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">使用率</span>
            <span className="balance-value">{totalUsagePercentage.toFixed(2)}%</span>
          </div>
        </div>

        <div className="usage-bar-container">
          <div className="usage-bar">
            <div 
              className="usage-progress" 
              style={{ width: `${Math.min(totalUsagePercentage, 100)}%` }}
            ></div>
          </div>
          <span className="usage-text">{totalUsagePercentage.toFixed(2)}%</span>
        </div>
      </div>

      <div className="batch-details">
        <h3>详细结果</h3>
        <div className="details-table">
          <div className="table-header">
            <div className="table-cell">序号</div>
            <div className="table-cell">API密钥</div>
            <div className="table-cell">状态</div>
            <div className="table-cell">余额</div>
            <div className="table-cell">使用率</div>
          </div>
          {details.map((result, index) => {
            const apiKey = result.apiKey || '';
            const maskedKey = apiKey.length > 8 
              ? `${apiKey.substring(0, 8)}...` 
              : apiKey;
            
            const usagePercentage = result.success && result.data.total_granted > 0 
              ? (result.data.total_used / result.data.total_granted) * 100 
              : 0;

            return (
              <div key={index} className={`table-row ${result.success ? 'success' : 'error'}`}>
                <div className="table-cell">{index + 1}</div>
                <div className="table-cell key-cell">{maskedKey}</div>
                <div className="table-cell">
                  {result.success ? (
                    <span className="status-success">成功</span>
                  ) : (
                    <span className="status-error" title={result.error}>
                      失败
                    </span>
                  )}
                </div>
                <div className="table-cell">
                  {result.success ? `¥${result.data.balance.toFixed(2)}` : '-'}
                </div>
                <div className="table-cell">
                  {result.success ? `${usagePercentage.toFixed(2)}%` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BatchResult;