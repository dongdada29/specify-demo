# Taskify 部署指南

## 🚀 快速开始

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/dongdada29/specify-demo.git
cd specify-demo

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3000
```

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🌐 在线部署

### GitHub Pages 部署
1. 在GitHub仓库设置中启用GitHub Pages
2. 选择 `002-develop-taskify-a` 分支作为源
3. 选择 `/docs` 文件夹作为根目录
4. 将构建文件复制到 `docs` 文件夹：
   ```bash
   npm run build
   cp -r dist/* docs/
   git add docs/
   git commit -m "deploy: 更新GitHub Pages"
   git push origin 002-develop-taskify-a
   ```

### Vercel 部署
1. 连接GitHub仓库到Vercel
2. 选择 `002-develop-taskify-a` 分支
3. 构建命令：`npm run build`
4. 输出目录：`dist`
5. 部署

### Netlify 部署
1. 连接GitHub仓库到Netlify
2. 选择 `002-develop-taskify-a` 分支
3. 构建命令：`npm run build`
4. 发布目录：`dist`
5. 部署

## 📋 功能特性

- ✅ 用户选择（无登录）
- ✅ 项目管理
- ✅ Kanban看板
- ✅ 拖拽任务状态变更
- ✅ 任务分配
- ✅ 评论系统
- ✅ 实时更新
- ✅ 响应式设计

## 🛠️ 技术栈

- **前端**: Vite + 原生JavaScript + HTML5 + CSS3
- **数据库**: SQLite (本地存储)
- **实时通信**: WebSocket API
- **拖拽**: HTML5 Drag and Drop API
- **测试**: Jest + Playwright

## 📱 访问链接

- **GitHub仓库**: https://github.com/dongdada29/specify-demo
- **在线演示**: 待部署后更新

## 🔧 开发命令

```bash
# 开发服务器
npm run dev

# 构建
npm run build

# 预览
npm run preview

# 测试
npm test

# E2E测试
npm run e2e

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 📝 注意事项

1. 应用使用本地SQLite数据库，数据存储在浏览器中
2. 支持离线使用
3. 无需服务器端部署
4. 所有数据在用户浏览器中本地存储
