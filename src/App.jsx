import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BalanceChecker from './components/BalanceChecker';
import SiliconFlowChecker from './components/SiliconFlowChecker';
import BalanceResult from './components/BalanceResult';
import BatchResult from './components/BatchResult';
import LoadingSpinner from './components/LoadingSpinner';
import Tabs from './components/Tabs';

function App() {
  const [balanceData, setBalanceData] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('deepseek'); // 'deepseek' 或 'siliconflow'

  const handleCheckBalance = async (apiKeyOrKeys, isBatch = false) => {
    // 验证输入
    if (!isBatch && !apiKeyOrKeys.trim()) {
      setError('请输入API密钥');
      return;
    }
    
    if (isBatch && (!apiKeyOrKeys || !Array.isArray(apiKeyOrKeys) || apiKeyOrKeys.length === 0)) {
      setError('请输入有效的API密钥列表');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBatchResults(null); // 重置批量查询结果

    try {
      console.log('发送API请求...');
      
      // 根据当前选项卡和是否为批量查询选择不同的API端点
      let apiUrl;
      let requestBody;
      
      if (activeTab === 'deepseek') {
        // DeepSeek目前不支持批量查询
        apiUrl = '/api/balance';
        requestBody = { apiKey: isBatch ? apiKeyOrKeys[0] : apiKeyOrKeys }; // 如果是批量查询，只取第一个
      } else {
        // SiliconFlow支持批量查询
        apiUrl = isBatch ? '/api/siliconflow/batch' : '/api/siliconflow';
        requestBody = isBatch ? { apiKeys: apiKeyOrKeys } : { apiKey: apiKeyOrKeys };
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('收到响应:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (!response.ok) {
        throw new Error(data.error || '查询失败');
      }

      if (isBatch) {
        // 处理批量查询结果
        setBatchResults(data);
      } else {
        // 处理单个查询结果
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
      }
    } catch (err) {
      console.error('API请求错误:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBalanceData(null);
    setBatchResults(null);
    setError(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 切换选项卡时重置状态
    setBalanceData(null);
    setBatchResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <div className="container">
          <Tabs activeTab={activeTab} setActiveTab={handleTabChange} />
          
          {isLoading ? (
            <LoadingSpinner />
          ) : batchResults ? (
            <BatchResult 
              batchResults={batchResults} 
              onReset={handleReset} 
              provider={activeTab}
            />
          ) : balanceData || error ? (
            <BalanceResult 
              balanceData={balanceData} 
              error={error} 
              onReset={handleReset} 
              provider={activeTab}
            />
          ) : activeTab === 'deepseek' ? (
            <BalanceChecker 
              onCheckBalance={handleCheckBalance} 
              isLoading={isLoading} 
            />
          ) : (
            <SiliconFlowChecker 
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