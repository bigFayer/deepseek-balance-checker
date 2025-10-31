import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>正在查询余额，请稍候...</p>
    </div>
  );
};

export default LoadingSpinner;