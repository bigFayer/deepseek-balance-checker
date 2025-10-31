import React, { useState } from 'react';

const BalanceChecker = ({ onCheckBalance, isLoading }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onCheckBalance(apiKey);
    }
  };

  const handleInputChange = (e) => {
    setApiKey(e.target.value);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="balance-checker">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="apiKey" className="label">
            DeepSeek API 密钥
          </label>
          <div className="input-container">
        <input
          type={showApiKey ? 'text' : 'password'}
          id="apiKey"
          className={`input ${isFocused ? 'focused' : ''}`}
          value={apiKey}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="请输入您的DeepSeek API密钥"
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
        </div>
        <button
          type="submit"
          className="button"
          disabled={!apiKey.trim() || isLoading}
        >
          {isLoading ? '查询中...' : '查询余额'}
        </button>
      </form>
    </div>
  );
};

export default BalanceChecker;