import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BalanceChecker from './components/BalanceChecker';
import BalanceResult from './components/BalanceResult';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [balanceData, setBalanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckBalance = async (apiKey) => {
    if (!apiKey.trim()) {
      setError('请输入API密钥');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('发送API请求...');
      const response = await fetch('/api/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      console.log('收到响应:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (!response.ok) {
        throw new Error(data.error || '查询失败');
      }

      // 检查响应数据结构
      if (!data.data) {
        throw new Error('API返回数据格式不正确');
      }

      // 计算使用百分比
      const usagePercentage = data.data.total_granted > 0 
        ? (data.data.total_used / data.data.total_granted) * 100 
        : 0;
      
      console.log('设置余额数据:', {
        ...data.data,
        usage_percentage: usagePercentage
      });
      
      setBalanceData({
        ...data.data,
        usage_percentage: usagePercentage
      });
    } catch (err) {
      console.error('API请求错误:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBalanceData(null);
    setError(null);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <div className="container">
          {isLoading ? (
            <LoadingSpinner />
          ) : balanceData || error ? (
            <BalanceResult 
              balanceData={balanceData} 
              error={error} 
              onReset={handleReset} 
            />
          ) : (
            <BalanceChecker 
              onCheckBalance={handleCheckBalance} 
              isLoading={isLoading} 
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;