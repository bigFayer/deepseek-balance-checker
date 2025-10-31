import app from './app.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

console.log('开始加载服务器...');

try {
  console.log('模块导入成功');

  // 获取当前文件的目录路径
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  console.log('路径解析完成');

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  console.log(`配置端口: ${PORT}, 主机: ${HOST}`);

  // 优雅关闭处理
  const gracefulShutdown = (server) => {
    console.log('正在关闭服务器...');
    
    server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
    
    // 强制关闭超时
    setTimeout(() => {
      console.error('强制关闭服务器');
      process.exit(1);
    }, 10000);
  };

  // 启动服务器
  const startServer = () => {
    console.log('正在启动服务器...');
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 服务器运行在 http://${HOST}:${PORT}`);
      console.log(`📱 本地访问: http://localhost:${PORT}`);
      console.log(`⚡ 环境: ${process.env.NODE_ENV || 'development'}`);
      
      // 健康检查端点信息
      console.log(`💚 健康检查: http://localhost:${PORT}/api/v1/health`);
      console.log(`📊 详细健康检查: http://localhost:${PORT}/api/v1/health/detailed`);
      
      // API端点信息
      console.log(`🔑 余额查询: POST http://localhost:${PORT}/api/v1/balance/check`);
    });
    
    // 设置服务器超时
    server.timeout = 30000; // 30秒
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('未捕获的异常:', error);
      gracefulShutdown(server);
    });
    
    // 处理未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('未处理的Promise拒绝:', reason);
      gracefulShutdown(server);
    });
    
    // 处理SIGTERM信号（例如Kubernetes终止）
    process.on('SIGTERM', () => {
      console.log('收到SIGTERM信号');
      gracefulShutdown(server);
    });
    
    // 处理SIGINT信号（Ctrl+C）
    process.on('SIGINT', () => {
      console.log('收到SIGINT信号');
      gracefulShutdown(server);
    });
    
    return server;
  };

  // 直接启动服务器
  console.log('正在启动服务器...');
  const server = startServer();
  console.log('服务器启动成功');

} catch (error) {
  console.error('服务器初始化失败:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}

export default app;