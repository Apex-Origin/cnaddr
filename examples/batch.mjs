// 批量解析并以表格输出。运行：先 `pnpm build`，再 `node examples/batch.mjs`
import { parseBatch } from '../dist/index.js';

const list = [
  '广东深圳南山区科技园',
  '收件人：王小明 13900139000 福建省厦门市思明区软件园二期',
  '上海市浦东新区张江镇科苑路88号 李雷',
  '内蒙古呼和浩特市新城区新华大街63号',
];

const rows = parseBatch(list).map((r) => ({
  省: r.province?.name ?? '',
  市: r.city?.name ?? '',
  区县: r.district?.name ?? '',
  姓名: r.name,
  手机: r.mobile,
  置信度: r.confidence,
}));

console.table(rows);
