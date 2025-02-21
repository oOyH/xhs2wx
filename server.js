import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import dotenv from 'dotenv';
import fs from 'fs';  // 添加 fs 模块

// 加载 .env 文件
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');
const indexPath = join(distPath, 'index.html');

// 检查 dist 目录和 index.html 是否存在
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('Error: index.html not found in dist directory. Please run "npm run build" first.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;  // 使用 .env 中的 PORT 或默认值

// 启用 gzip 压缩
app.use(compression());

// 安全相关的中间件
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 静态文件服务
app.use(express.static(distPath, {
  maxAge: '1y',  // 静态资源缓存1年
  etag: true
}));

// 所有路由都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 