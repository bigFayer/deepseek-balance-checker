# DeepSeek API 余额查询工具

一个简洁高效的Web应用，用于查询DeepSeek API密钥的余额和使用情况。

## 功能特性

- 🔍 **实时查询**: 快速查询DeepSeek API账户余额
- 📊 **详细统计**: 显示总授予额度、已使用额度和当前余额
- 📈 **使用进度**: 可视化显示API使用进度
- 🔒 **安全可靠**: API密钥仅在本地处理，不会发送到第三方服务器
- 📱 **响应式设计**: 支持桌面和移动设备
- ⚡ **快速部署**: 支持Vercel一键部署

## 在线演示

[点击这里查看在线演示](https://deepseek-balance-checker.vercel.app)

## 快速开始

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

## 项目结构

```
deepseek-balance-checker/
├── public/                 # 静态文件
│   ├── index.html         # 主页面
│   ├── style.css          # 样式文件
│   └── script.js          # 前端逻辑
├── server.js              # Express服务器
├── package.json           # 项目配置
└── README.md              # 项目说明
```

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
    "currency": "CNY",
    "total_granted": 50.00,
    "total_used": 39.50,
    "expire_time": "2024-12-31T23:59:59Z"
  }
}
```

### 健康检查

**GET** `/api/health`

**响应:**
```json
{
  "status": "ok"
}
```

## 技术栈

- **后端**: Node.js, Express
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Grid, Flexbox, CSS Variables
- **图标**: Font Awesome
- **部署**: Vercel

## 安全特性

- API密钥格式验证（sk-开头，长度≥20，合法字符）
- 请求频率限制（15分钟内最多100次请求）
- 输入大小限制（最大10KB）
- 生产环境CORS限制
- 结构化错误处理

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 常见问题

### Q: API密钥会被保存吗？
A: 不会。API密钥仅在您的浏览器中临时处理，不会发送到任何第三方服务器。

### Q: 查询出来的使用额度都是0怎么办？
A: 这可能是由于以下原因：
1. 账户确实无余额
2. API密钥权限问题
3. API响应格式变化

### Q: 查询失败怎么办？
A: 请检查：
1. API密钥是否正确（以"sk-"开头）
2. 网络连接是否正常
3. DeepSeek API服务是否可用

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

⭐ 如果这个项目对您有帮助，请给它一个星标！
