import React, { useState, useMemo } from 'react';
import './BatchResult.css';

const BatchResult = ({ batchResults, onReset, provider }) => {
  const [sortOrder, setSortOrder] = useState('default'); // default, balance-asc, balance-desc, usage-asc, usage-desc
  const [filterStatus, setFilterStatus] = useState('all'); // all, success, error
  
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

  // 计算平均余额和使用率
  const averageBalance = success > 0 ? totalBalance / success : 0;
  const averageUsage = success > 0 ? totalUsed / success : 0;
  const averageUsagePercentage = success > 0 && totalGranted > 0 
    ? (totalUsed / totalGranted) * 100 
    : 0;

  // 筛选和排序结果
  const processedDetails = useMemo(() => {
    let filtered = details;
    
    // 应用筛选
    if (filterStatus === 'success') {
      filtered = details.filter(item => item.success);
    } else if (filterStatus === 'error') {
      filtered = details.filter(item => !item.success);
    }
    
    // 应用排序
    if (sortOrder === 'balance-asc') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.success) return 1;
        if (!b.success) return -1;
        return a.data.balance - b.data.balance;
      });
    } else if (sortOrder === 'balance-desc') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.success) return 1;
        if (!b.success) return -1;
        return b.data.balance - a.data.balance;
      });
    } else if (sortOrder === 'usage-asc') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.success) return 1;
        if (!b.success) return -1;
        const usageA = a.data.total_granted > 0 ? a.data.total_used / a.data.total_granted : 0;
        const usageB = b.data.total_granted > 0 ? b.data.total_used / b.data.total_granted : 0;
        return usageA - usageB;
      });
    } else if (sortOrder === 'usage-desc') {
      filtered = [...filtered].sort((a, b) => {
        if (!a.success) return 1;
        if (!b.success) return -1;
        const usageA = a.data.total_granted > 0 ? a.data.total_used / a.data.total_granted : 0;
        const usageB = b.data.total_granted > 0 ? b.data.total_used / b.data.total_granted : 0;
        return usageB - usageA;
      });
    }
    
    return filtered;
  }, [details, filterStatus, sortOrder]);

  // 导出结果为CSV
  const exportToCSV = () => {
    const headers = ['序号', 'API密钥', '状态', '余额', '授信额度', '使用额度', '使用率', '错误信息'];
    const rows = processedDetails.map((result, index) => {
      const apiKey = result.apiKey || '';
      const maskedKey = apiKey.length > 8 
        ? `${apiKey.substring(0, 8)}...` 
        : apiKey;
      
      const usagePercentage = result.success && result.data.total_granted > 0 
        ? (result.data.total_used / result.data.total_granted) * 100 
        : 0;
      
      return [
        index + 1,
        maskedKey,
        result.success ? '成功' : '失败',
        result.success ? result.data.balance.toFixed(2) : '-',
        result.success ? result.data.total_granted.toFixed(2) : '-',
        result.success ? result.data.total_used.toFixed(2) : '-',
        result.success ? `${usagePercentage.toFixed(2)}%` : '-',
        result.success ? '-' : (result.error || '')
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${getProviderName()}_批量查询结果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="batch-result">
      <div className="batch-result-header">
        <h2>{getProviderName()} 批量查询结果</h2>
        <div className="header-actions">
          <button className="export-button" onClick={exportToCSV}>
            导出CSV
          </button>
          <button className="reset-button" onClick={onReset}>
            重新查询
          </button>
        </div>
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
          <div className="stat-item">
            <span className="stat-label">成功率</span>
            <span className="stat-value">{total > 0 ? ((success / total) * 100).toFixed(1) : 0}%</span>
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

        <div className="summary-average">
          <div className="average-item">
            <span className="average-label">平均余额</span>
            <span className="average-value">¥{averageBalance.toFixed(2)}</span>
          </div>
          <div className="average-item">
            <span className="average-label">平均使用额度</span>
            <span className="average-value">¥{averageUsage.toFixed(2)}</span>
          </div>
          <div className="average-item">
            <span className="average-label">平均使用率</span>
            <span className="average-value">{averageUsagePercentage.toFixed(2)}%</span>
          </div>
        </div>

        <div className="usage-bar-container">
          <div className="usage-bar">
            <div 
              className={`usage-progress ${totalUsagePercentage > 80 ? 'high-usage' : totalUsagePercentage > 50 ? 'medium-usage' : 'low-usage'}`}
              style={{ width: `${Math.min(totalUsagePercentage, 100)}%` }}
            ></div>
          </div>
          <span className="usage-text">{totalUsagePercentage.toFixed(2)}%</span>
        </div>
      </div>

      <div className="batch-details">
        <div className="details-header">
          <h3>详细结果</h3>
          <div className="details-controls">
            <div className="filter-control">
              <label htmlFor="status-filter">筛选状态:</label>
              <select 
                id="status-filter" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">全部 ({total})</option>
                <option value="success">成功 ({success})</option>
                <option value="error">失败 ({failure})</option>
              </select>
            </div>
            <div className="sort-control">
              <label htmlFor="sort-order">排序方式:</label>
              <select 
                id="sort-order" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">默认顺序</option>
                <option value="balance-desc">余额从高到低</option>
                <option value="balance-asc">余额从低到高</option>
                <option value="usage-desc">使用率从高到低</option>
                <option value="usage-asc">使用率从低到高</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="details-table">
          <div className="table-header">
            <div className="table-cell">序号</div>
            <div className="table-cell">API密钥</div>
            <div className="table-cell">状态</div>
            <div className="table-cell">余额</div>
            <div className="table-cell">授信额度</div>
            <div className="table-cell">使用额度</div>
            <div className="table-cell">使用率</div>
            <div className="table-cell">错误信息</div>
          </div>
          {processedDetails.map((result, index) => {
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
                  {result.success ? `¥${result.data.total_granted.toFixed(2)}` : '-'}
                </div>
                <div className="table-cell">
                  {result.success ? `¥${result.data.total_used.toFixed(2)}` : '-'}
                </div>
                <div className="table-cell">
                  {result.success ? (
                    <span className={`usage-percentage ${usagePercentage > 80 ? 'high-usage' : usagePercentage > 50 ? 'medium-usage' : 'low-usage'}`}>
                      {usagePercentage.toFixed(2)}%
                    </span>
                  ) : '-'}
                </div>
                <div className="table-cell error-message">
                  {result.success ? '-' : (result.error || '未知错误')}
                </div>
              </div>
            );
          })}
        </div>
        
        {processedDetails.length === 0 && (
          <div className="no-results">
            <p>没有符合筛选条件的结果</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchResult;