import express from 'express';
import os from 'os';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

const router = express.Router();

// 健康检查接口
router.get('/', (req, res) => {
  const memUsage = process.memoryUsage();
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.requestId,
    memory: {
      used: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg().map(avg => avg.toFixed(2))
    },
    application: {
      name: 'DeepSeek Balance Checker',
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development'
    }
  };

  res.json(healthInfo);
});

// 详细健康检查（包含更多系统信息）
router.get('/detailed', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const loadAvg = os.loadavg();
  
  const detailedHealth = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
        arrayBuffers: `${Math.round(memUsage.arrayBuffers / 1024 / 1024)} MB`
      },
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      hostname: os.hostname(),
      cpus: os.cpus().length,
      loadAverage: {
        '1min': loadAvg[0].toFixed(2),
        '5min': loadAvg[1].toFixed(2),
        '15min': loadAvg[2].toFixed(2)
      },
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
      networkInterfaces: Object.keys(os.networkInterfaces())
    },
    application: {
      name: 'DeepSeek Balance Checker',
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development'
    }
  };

  res.json(detailedHealth);
});

// 就绪检查（用于负载均衡器）
router.get('/ready', (req, res) => {
  // 检查应用是否准备好接收流量
  const isReady = true; // 这里可以添加更多的就绪检查逻辑
  
  if (isReady) {
    res.json({ 
      status: 'ready',
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      message: '应用尚未准备好接收流量'
    });
  }
});

// 存活检查（用于Kubernetes等）
router.get('/live', (req, res) => {
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

export default router;