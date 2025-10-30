# 贡献指南

感谢您对DeepSeek余额查询工具的关注！我们欢迎任何形式的贡献，包括但不限于：

- 报告错误
- 提出新功能建议
- 提交代码改进
- 改进文档

## 开发环境设置

1. Fork 本仓库
2. 克隆您的Fork:
   ```bash
   git clone https://github.com/yourusername/deepseek-balance-checker.git
   cd deepseek-balance-checker
   ```

3. 安装依赖:
   ```bash
   npm install
   ```

4. 创建 `.env` 文件，参考 `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. 启动开发服务器:
   ```bash
   npm run dev
   ```

## 代码规范

### JavaScript/Node.js

- 使用ES6+语法
- 使用2个空格缩进
- 使用单引号
- 每行最大长度为80个字符
- 使用ESLint进行代码检查:
  ```bash
  npm run lint
  ```

### 提交信息格式

使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)格式:

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括:
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改bug的代码变动）
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

示例:
```
feat(api): 添加请求重试机制

- 添加指数退避算法
- 增加最大重试次数限制
- 添加重试状态日志

Closes #123
```

## 分支策略

- `main`: 主分支，包含生产就绪的代码
- `develop`: 开发分支，包含最新的开发代码
- `feature/*`: 功能分支，用于开发新功能
- `bugfix/*`: 修复分支，用于修复bug
- `release/*`: 发布分支，用于准备发布版本

## Pull Request 流程

1. 从`develop`分支创建新分支:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. 进行开发，确保:
   - 代码通过ESLint检查
   - 添加必要的测试
   - 更新相关文档

3. 提交代码:
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   git push origin feature/your-feature-name
   ```

4. 创建Pull Request:
   - 标题使用约定式提交格式
   - 描述中详细说明变更内容和原因
   - 关联相关的Issue
   - 请求合并到`develop`分支

5. 代码审查:
   - 至少需要一位维护者的审查
   - 解决所有审查意见
   - 确保CI/CD检查通过

6. 合并代码:
   - 使用Squash and merge合并方式
   - 删除功能分支

## 测试

在提交代码前，请确保:

1. 所有现有测试通过:
   ```bash
   npm test
   ```

2. 如果添加了新功能，请添加相应的测试

3. 手动测试关键功能:
   - API密钥验证
   - 余额查询
   - 错误处理

## 安全注意事项

1. 不要在代码中硬编码API密钥或其他敏感信息

2. 确保所有用户输入都经过验证和清理

3. 遵循最小权限原则

4. 在处理敏感数据时使用HTTPS

5. 定期更新依赖项以修复安全漏洞

## 发布流程

1. 更新版本号:
   ```bash
   npm version patch|minor|major
   ```

2. 更新CHANGELOG.md

3. 创建发布标签:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

## 获取帮助

如果您有任何问题或需要帮助，请:

1. 查看现有的[Issues](https://github.com/yourusername/deepseek-balance-checker/issues)

2. 创建新的Issue，详细描述您的问题

3. 加入我们的讨论区

## 行为准则

请遵循我们的[行为准则](CODE_OF_CONDUCT.md)，确保一个友好、包容的社区环境。

感谢您的贡献！
