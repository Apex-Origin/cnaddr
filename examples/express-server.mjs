// 一个最小的 HTTP 解析服务（零框架，Node 原生 http）。
// 运行：先 `pnpm build`，再 `node examples/express-server.mjs`
// 测试：curl "http://localhost:3000/parse?q=浙江省杭州市余杭区文一西路969号"
import { createServer } from 'node:http';
import { parse } from '../dist/index.js';

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('content-type', 'application/json; charset=utf-8');

  if (url.pathname === '/parse') {
    const q = url.searchParams.get('q') ?? '';
    const result = parse(q);
    res.end(JSON.stringify({ code: 0, data: result }, null, 2));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ code: 404, msg: 'use /parse?q=<address>' }));
});

server.listen(3000, () => {
  console.log(
    'cnaddr demo server: http://localhost:3000/parse?q=北京朝阳区三里屯街道',
  );
});
