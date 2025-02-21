import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.VITE_APP_PORT || 3000;

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
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1y',  // 静态资源缓存1年
  etag: true
}));

// 所有路由都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 