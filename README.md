# DeepSeek API 余额查询工具

一个简单易用的Web应用，用于查询DeepSeek API密钥的余额和使用情况。

## 功能特性

- 🔍 **实时查询**: 快速查询DeepSeek API账户余额
- 📊 **详细统计**: 显示总授予额度、已使用额度和当前余额
- 📈 **使用进度**: 可视化显示API使用进度
- 🔒 **安全可靠**: API密钥仅在本地处理，不会发送到第三方服务器
- 📱 **响应式设计**: 支持桌面和移动设备
- ⚡ **快速部署**: 支持Vercel一键部署

## 在线演示

[点击这里查看在线演示](https://deepseek-balance-checker.vercel.app)

## 本地运行

### 环境要求

- Node.js 14.0.0 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/bigFayer/deepseek-balance-checker.git
cd deepseek-balance-checker
```

2. 安装依赖
```bash
npm install
```

3. 启动服务器
```bash
npm start
```

4. 打开浏览器访问 `http://localhost:3000`

## 使用方法

1. 在输入框中输入您的DeepSeek API密钥
2. 点击"查询余额"按钮
3. 查看详细的余额信息和使用统计

### 获取API密钥

1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册并登录账户
3. 在API管理页面创建新的API密钥
4. 复制密钥并粘贴到查询工具中

## 部署到Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bigFayer/deepseek-balance-checker)

### 手动部署

1. 将代码推送到GitHub仓库
2. 登录 [Vercel](https://vercel.com/)
3. 点击"New Project"
4. 选择您的GitHub仓库
5. 配置项目设置（默认即可）
6. 点击"Deploy"

## 项目结构

```
deepseek-balance-checker/
├── public/                 # 静态文件
│   ├── index.html         # 主页面
│   ├── style.css          # 样式文件
│   └── script.js          # 前端逻辑
├── server.js              # Express服务器
├── package.json           # 项目配置
├── .env                   # 环境变量
└── README.md              # 项目说明
```

## 环境变量

创建 `.env` 文件并配置以下变量：

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# CORS配置
ALLOWED_ORIGIN=https://your-vercel-app.vercel.app

# DeepSeek API配置
DEEPSEEK_API_URL=https://api.deepseek.com/v1/user/balance
DEEPSEEK_API_URL_FALLBACK=https://api.deepseek.com/v1/user/info

# 请求限制配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 请求超时配置
REQUEST_TIMEOUT=30000

# 安全配置
# 是否启用安全响应头 (默认: true)
ENABLE_SECURITY_HEADERS=true

# 是否启用请求日志 (默认: true)
ENABLE_REQUEST_LOGGING=true

# 是否验证请求来源 (默认: false)
VALIDATE_ORIGIN=false

# IP白名单 (逗号分隔，留空表示不限制)
ALLOWED_IPS=

# API密钥最小长度 (默认: 40)
MIN_API_KEY_LENGTH=40
```

### 安全配置说明

- **ENABLE_SECURITY_HEADERS**: 启用Helmet安全中间件，添加安全HTTP头
- **ENABLE_REQUEST_LOGGING**: 记录所有请求的详细信息
- **VALIDATE_ORIGIN**: 验证请求的Origin和Referer头
- **ALLOWED_IPS**: 限制只有特定IP可以访问API
- **MIN_API_KEY_LENGTH**: 设置API密钥的最小长度要求

## API接口

### 查询余额

**POST** `/api/check-balance`

**请求体:**
```json
{
  "apiKey": "your_deepseek_api_key"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "balance": 10.50,
    "currency": "USD",
    "total_granted": 50.00,
    "total_used": 39.50,
    "expire_time": "2024-12-31T23:59:59Z"
  }
}
```

**错误响应:**
```json
{
  "success": false,
  "error": "API密钥无效或已过期"
}
```

### 健康检查

**GET** `/api/health`

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 技术栈

- **后端**: Node.js, Express
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS Variables
- **图标**: Font Awesome
- **部署**: Vercel

## 安全说明

- API密钥仅在用户浏览器中临时存储，不会发送到第三方服务器
- 所有API请求直接发送到DeepSeek官方API
- 不记录或存储任何用户数据
- 支持本地存储API密钥（可选）

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 安全改进

### 🔒 已修复的安全问题
- **API密钥验证**: 添加了严格的API密钥格式验证
- **请求频率限制**: 实施了IP级别的速率限制
- **输入验证**: 服务器端和客户端双重验证
- **CORS配置**: 生产环境限制允许的源
- **错误处理**: 改进了错误信息泄露防护
- **重试机制**: 添加了指数退避重试策略

### 安全特性

- **API密钥验证**：增强的API密钥验证，包括长度检查、字符集验证和熵检查
- **请求频率限制**：防止API滥用，支持自定义窗口时间和最大请求数
- **输入验证**：防止恶意输入和注入攻击
- **安全响应头**：使用Helmet中间件添加安全HTTP头
- **IP白名单**：可选的IP访问控制
- **请求来源验证**：可选的Origin和Referer头验证
- **请求日志记录**：详细的请求和安全事件日志
- **错误处理**：不暴露敏感信息，提供详细的错误分类
- **请求ID跟踪**：每个请求都有唯一ID，便于调试和审计
- **缓存机制**：减少API调用次数，提高性能和安全性

## 更新日志

### v1.1.0 (2024-01-01)
- 🔒 重大安全更新
- ✨ 添加API密钥格式验证
- 🚀 实施请求频率限制
- 🔄 改进错误处理和重试机制
- 📝 添加ESLint代码规范检查
- 🎨 优化用户界面反馈
- 📱 改进移动端体验

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持DeepSeek API余额查询
- 响应式设计
- Vercel部署支持

## 常见问题

### Q: API密钥会被保存吗？
A: 不会。API密钥仅在您的浏览器中临时处理，不会发送到任何第三方服务器。

### Q: 查询出来的使用额度都是0怎么办？
A: 这可能是由于以下原因：
1. **API响应格式变化**: DeepSeek API可能更新了响应格式
2. **账户确实无余额**: 新创建的账户可能需要充值才能使用
3. **API密钥权限问题**: 某些API密钥可能没有余额查询权限

**调试步骤**:
1. 打开浏览器开发者工具(F12)
2. 查看Console标签页中的详细日志
3. 查看Network标签页中的API响应
4. 使用提供的调试脚本进行详细分析：

```bash
# 使用调试脚本分析API响应
node debug-api.js sk-your-api-key-here
```

### Q: 查询失败怎么办？
A: 请检查：
1. API密钥是否正确（以"sk-"开头）
2. 网络连接是否正常
3. DeepSeek API服务是否可用
4. 查看服务器控制台日志获取详细错误信息

### Q: 支持哪些浏览器？
A: 支持所有现代浏览器，包括Chrome、Firefox、Safari和Edge的最新版本。

## 调试工具

项目包含以下调试工具：

### 1. API调试脚本
```bash
# 测试API响应格式
node debug-api.js sk-your-api-key-here
```

### 2. 测试脚本
```bash
# 测试多个API端点
node test-api.js
```

### 3. 浏览器调试
- 按F12打开开发者工具
- 查看Console标签页的详细日志
- 查看Network标签页的API请求和响应

## DeepSeek API信息

### 官方文档
- [DeepSeek API文档](https://platform.deepseek.com/api-docs/)
- [余额查询API](https://platform.deepseek.com/api-docs/#/user/get_balance)

### API端点
- 主要端点: `https://api.deepseek.com/v1/user/balance`
- 备用端点: `https://api.deepseek.com/user/balance`

### 认证方式
```
Authorization: Bearer sk-your-api-key-here
```

### 预期响应格式
```json
{
  "balance_infos": [
    {
      "total_balance": 10.50,
      "grant_balance": 10.00,
      "cash_balance": 0.50,
      "total_grant": 50.00,
      "total_used": 39.50,
      "currency": "USD",
      "expire_time": "2024-12-31T23:59:59Z"
    }
  ]
}
```

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/your-username/deepseek-balance-checker/issues)
- Email: your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
