import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// 加载环境变量
config();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 导入路由
import balanceRoutes from './routes/balance.js';
import healthRoutes from './routes/health.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.deepseek.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: IS_PRODUCTION ? 50 : 100, // 生产环境更严格的限制
  message: {
    error: '请求过于频繁，请稍后再试',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 跳过健康检查端点的限制
    return req.path.startsWith('/api/v1/health');
  },
});

// 日志中间件
app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));

// 中间件配置
app.use(limiter);
app.use(cors({
  origin: IS_PRODUCTION
    ? (process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : ['https://your-vercel-app.vercel.app'])
    : true,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 请求ID中间件
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// API路由
app.use('/api/v1/balance', balanceRoutes);
app.use('/api/v1/health', healthRoutes);

// 前端路由 - 所有其他请求都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  // 记录错误详情
  console.error(`[${new Date().toISOString()}] Error:`, {
    requestId: req.requestId,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: err.message,
    stack: err.stack
  });
  
  // 根据错误类型返回不同的状态码
  let statusCode = 500;
  let message = '服务器内部错误';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '请求参数验证失败';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = '禁止访问';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = '资源不存在';
  }
  
  res.status(statusCode).json({
    success: false,
    error: message,
    requestId: req.requestId,
    ...(IS_PRODUCTION ? {} : { details: err.message, stack: err.stack })
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    requestId: req.requestId,
    path: req.path
  });
});

export default app;