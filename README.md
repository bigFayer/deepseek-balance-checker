# DeepSeek API 余额查询工具 v3.0

一个现代化、安全高效的Web应用，用于查询DeepSeek API密钥的余额和使用情况。

## 🚀 新特性

- **模块化架构**: 采用清晰的项目结构和模块化设计
- **增强安全性**: 完善的安全中间件和输入验证
- **性能优化**: 响应缓存、错误边界处理和性能监控
- **开发者友好**: 完整的开发工具链和代码质量保证
- **生产就绪**: 健康检查、日志记录和监控端点

## ✨ 功能特性

- 🔍 **实时查询**: 快速查询DeepSeek API账户余额
- 📊 **详细统计**: 显示总授予额度、已使用额度和当前余额
- 📈 **使用进度**: 可视化显示API使用进度，支持颜色预警
- 🔒 **安全可靠**: 多层安全防护，API密钥仅在本地处理
- 📱 **响应式设计**: 支持桌面和移动设备
- ⚡ **性能优化**: 智能缓存和错误重试机制
- 🛡️ **生产就绪**: 完整的健康检查和监控系统

## 🏗️ 项目结构

```
deepseek-balance-checker/
├── src/                    # 后端源代码
│   ├── app.js             # Express应用配置
│   ├── server.js          # 服务器启动文件
│   ├── routes/            # API路由
│   │   ├── balance.js     # 余额查询路由
│   │   └── health.js      # 健康检查路由
│   ├── middleware/        # 中间件
│   │   └── cache.js       # 缓存中间件
│   └── utils/             # 工具函数
│       ├── validation.js  # 验证工具
│       └── balanceParser.js # 余额解析器
├── public/                # 前端静态文件
│   ├── index.html         # 主页面
│   ├── style.css          # 样式文件
│   └── script.js          # 前端逻辑
├── package.json           # 项目配置
├── .env.example           # 环境变量示例
├── .eslintrc.js          # ESLint配置
├── .prettierrc           # Prettier配置
└── README.md             # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js 16.0.0 或更高版本
- npm 8.0.0 或更高版本

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/deepseek-balance-checker.git
cd deepseek-balance-checker
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件配置环境变量
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **打开浏览器访问** `http://localhost:3000`

### 生产部署

```bash
# 构建和启动生产服务器
npm start

# 或使用PM2部署
npm install -g pm2
pm2 start src/server.js --name "deepseek-balance-checker"
```

### Vercel 部署

 1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

 2. **配置 Vercel**
 项目已包含 `vercel.json` 配置文件，配置了正确的构建和路由设置。

 3. **部署到 Vercel**
```bash
vercel --prod
```

 4. **环境变量配置**
 在 Vercel 控制台中设置必要的环境变量：
 - `NODE_ENV=production`
 - 其他必要的环境变量

 5. **自动部署**
 项目已配置为通过 Git 推送自动部署到 Vercel。只需推送代码到 GitHub 仓库，Vercel 将自动构建和部署最新版本。

## 📖 使用方法

1. 在输入框中输入您的DeepSeek API密钥
2. 点击"查询余额"按钮或按 `Enter` 键
3. 查看详细的余额信息和使用统计

### 快捷键

- `Enter`: 查询余额
- `Ctrl/Cmd + Enter`: 强制查询
- `Escape`: 清空输入框

### 获取API密钥

1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册并登录账户
3. 在API管理页面创建新的API密钥
4. 复制密钥并粘贴到查询工具中

## 🛠️ 开发指南

### 可用脚本

```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm start

# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm run test

# 清理并重新安装依赖
npm run clean
```

### API 文档

#### 查询余额

**POST** `/api/v1/balance/check`

**请求体:**
```json
{
  "apiKey": "your_deepseek_api_key"
}
```

**成功响应:**
```json
{
  "success": true,
  "data": {
    "balance": 10.50,
    "currency": "CNY",
    "total_granted": 50.00,
    "total_used": 39.50,
    "expire_time": "2024-12-31T23:59:59Z",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

**错误响应:**
```json
{
  "error": "API密钥无效或已过期",
  "success": false,
  "code": "UNAUTHORIZED"
}
```

#### 健康检查

**GET** `/api/v1/health`

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 3600,
  "memory": {
    "used": 12345678,
    "total": 23456789,
    "rss": 34567890
  },
  "application": {
    "name": "DeepSeek Balance Checker",
    "version": "3.0.0",
    "environment": "production"
  }
}
```

## 🔧 配置说明

### 环境变量

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 安全配置
ALLOWED_ORIGIN=https://your-domain.com

# 缓存配置
CACHE_TTL=60
```

### 安全特性

- **API密钥验证**: 严格的格式验证和字符集检查
- **请求频率限制**: 15分钟内最多100次请求
- **CORS保护**: 生产环境下的域名白名单
- **输入验证**: 多层输入验证和清理
- **安全头**: 完整的Helmet安全头配置
- **错误处理**: 结构化的错误响应，避免信息泄露

## 🐛 故障排除

### 常见问题

**Q: API密钥会被保存吗？**
A: 不会。API密钥仅在您的浏览器中临时处理，不会发送到任何第三方服务器。

**Q: 查询失败怎么办？**
A: 请检查：
1. API密钥是否正确（以"sk-"开头）
2. 网络连接是否正常
3. DeepSeek API服务是否可用
4. 查看浏览器控制台错误信息

**Q: 使用额度显示为0怎么办？**
A: 这可能是由于以下原因：
1. 账户确实无余额
2. API密钥权限问题
3. API响应格式变化

### 错误代码

| 错误代码 | 说明 | 解决方案 |
|---------|------|----------|
| INVALID_API_KEY | API密钥格式无效 | 检查密钥格式 |
| UNAUTHORIZED | API密钥无效或过期 | 重新生成密钥 |
| FORBIDDEN | API密钥权限不足 | 检查API权限 |
| RATE_LIMITED | 请求过于频繁 | 等待后重试 |
| TIMEOUT | 请求超时 | 检查网络连接 |
| NETWORK_ERROR | 网络连接失败 | 检查网络设置 |

## 📊 监控和日志

项目包含完整的监控功能：

- **健康检查**: `/api/v1/health`
- **详细健康信息**: `/api/v1/health/detailed`
- **就绪检查**: `/api/v1/health/ready`
- **存活检查**: `/api/v1/health/live`

## 🌐 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
