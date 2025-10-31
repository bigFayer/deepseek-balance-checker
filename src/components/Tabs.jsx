import React from 'react';

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === 'deepseek' ? 'active' : ''}`}
        onClick={() => setActiveTab('deepseek')}
      >
        DeepSeek
      </button>
      <button
        className={`tab ${activeTab === 'siliconflow' ? 'active' : ''}`}
        onClick={() => setActiveTab('siliconflow')}
      >
        SiliconFlow
      </button>
    </div>
  );
};

export default Tabs;