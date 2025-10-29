# 部署指南

## 本地部署

### 1. 环境准备
确保已安装 Node.js 14.0.0 或更高版本

### 2. 安装依赖
```bash
npm install
```

### 3. 启动服务
```bash
npm start
```

### 4. 访问应用
打开浏览器访问 `http://localhost:3000`

## Vercel部署

### 方法一：一键部署
1. 点击README中的"Deploy with Vercel"按钮
2. 连接GitHub账户
3. 选择仓库并配置项目
4. 点击"Deploy"

### 方法二：手动部署

#### 1. 准备GitHub仓库
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/deepseek-balance-checker.git
git push -u origin main
```

#### 2. Vercel配置
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击"New Project"
3. 导入GitHub仓库
4. 配置项目设置：
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm install`
   - Output Directory: `public`
   - Install Command: `npm install`

#### 3. 环境变量（可选）
在Vercel项目设置中添加环境变量：
- `NODE_ENV`: `production`

#### 4. 部署
点击"Deploy"按钮，等待部署完成。

## 其他平台部署

### Netlify
1. 连接GitHub仓库
2. 设置构建命令：`npm install`
3. 设置发布目录：`public`
4. 添加重定向规则到`_redirects`文件

### Railway
1. 连接GitHub仓库
2. 设置启动命令：`npm start`
3. 设置端口：`3000`

### Render
1. 创建Web Service
2. 连接GitHub仓库
3. 设置构建命令：`npm install`
4. 设置启动命令：`npm start`

## 自定义域名

### Vercel
1. 在项目设置中点击"Domains"
2. 添加自定义域名
3. 配置DNS记录

### 其他平台
参考各平台的域名配置文档。

## 故障排除

### 常见问题

#### 1. 部署失败
- 检查`package.json`中的依赖是否正确
- 确认`vercel.json`配置正确
- 查看部署日志获取详细错误信息

#### 2. API调用失败
- 检查API密钥格式（应以"sk-"开头）
- 确认网络连接正常
- 查看浏览器控制台错误信息

#### 3. 样式显示异常
- 确认静态文件路径正确
- 检查CSS文件是否正确加载
- 清除浏览器缓存

### 调试方法

#### 1. 本地调试
```bash
# 启动本地服务器
npm start

# 使用调试脚本
node debug-api.js sk-your-api-key-here
```

#### 2. 生产环境调试
- 查看Vercel函数日志
- 检查浏览器网络请求
- 使用浏览器开发者工具

## 性能优化

### 1. 前端优化
- 压缩CSS和JavaScript文件
- 优化图片资源
- 启用Gzip压缩

### 2. 后端优化
- 设置适当的缓存头
- 优化API响应时间
- 使用CDN加速静态资源

### 3. 部署优化
- 配置自动部署
- 设置环境变量
- 监控应用性能

## 安全考虑

### 1. API密钥安全
- 不在客户端代码中硬编码API密钥
- 使用HTTPS传输
- 定期轮换API密钥

### 2. 服务器安全
- 设置CORS策略
- 限制请求频率
- 验证输入数据

### 3. 部署安全
- 使用环境变量存储敏感信息
- 定期更新依赖包
- 监控安全漏洞

## 维护和更新

### 1. 依赖更新
```bash
npm update
npm audit fix
```

### 2. 代码更新
```bash
git pull origin main
npm install
```

### 3. 监控
- 设置应用监控
- 配置错误报告
- 定期检查日志

## 支持

如果遇到部署问题，请：
1. 查看本文档的故障排除部分
2. 检查项目的GitHub Issues
3. 联系技术支持