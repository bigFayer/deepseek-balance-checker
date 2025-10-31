import React, { useState } from 'react';

const SiliconFlowChecker = ({ onCheckBalance, isLoading }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeys, setApiKeys] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBatchMode) {
      // 批量模式：分割多个API密钥
      const keys = apiKeys.split('\n').filter(key => key.trim());
      if (keys.length > 0) {
        onCheckBalance(keys, true); // 第二个参数表示是否为批量查询
      }
    } else {
      // 单个模式
      if (apiKey.trim()) {
        onCheckBalance(apiKey, false);
      }
    }
  };

  const handleInputChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleBatchInputChange = (e) => {
    setApiKeys(e.target.value);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const toggleMode = () => {
    setIsBatchMode(!isBatchMode);
  };

  return (
    <div className="balance-checker">
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-button ${!isBatchMode ? 'active' : ''}`}
          onClick={() => setIsBatchMode(false)}
          disabled={isLoading}
        >
          单个查询
        </button>
        <button
          type="button"
          className={`mode-button ${isBatchMode ? 'active' : ''}`}
          onClick={() => setIsBatchMode(true)}
          disabled={isLoading}
        >
          批量查询
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="apiKey" className="label">
            {isBatchMode ? 'SiliconFlow API 密钥 (每行一个)' : 'SiliconFlow API 密钥'}
          </label>
          
          {isBatchMode ? (
            <textarea
              id="apiKeys"
              className="textarea"
              value={apiKeys}
              onChange={handleBatchInputChange}
              placeholder="请输入多个SiliconFlow API密钥，每行一个"
              disabled={isLoading}
              rows={5}
              required
            />
          ) : (
            <div className="input-container">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="apiKey"
                className={`input ${isFocused ? 'focused' : ''}`}
                value={apiKey}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="请输入您的SiliconFlow API密钥"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={toggleApiKeyVisibility}
                disabled={isLoading}
              >
                {showApiKey ? '隐藏' : '显示'}
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="button"
          disabled={(!isBatchMode && !apiKey.trim()) || (isBatchMode && !apiKeys.trim()) || isLoading}
        >
          {isLoading ? '查询中...' : (isBatchMode ? '批量查询余额' : '查询余额')}
        </button>
      </form>
    </div>
  );
};

export default SiliconFlowChecker;