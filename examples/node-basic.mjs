// 基础用法。在已发布项目里请改成：import { parse } from 'cnaddr';
// 仓库内运行：先 `pnpm build`，再 `node examples/node-basic.mjs`
import { parse, formatAddress } from '../dist/index.js';

const r = parse(
  '张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号 311121',
);

console.log('省  :', r.province?.name, r.province?.code);
console.log('市  :', r.city?.name, r.city?.code);
console.log('区  :', r.district?.name);
console.log('镇  :', r.town);
console.log('详细:', r.detail);
console.log('姓名:', r.name);
console.log('手机:', r.mobile);
console.log('邮编:', r.zipcode);
console.log('置信:', r.confidence);
console.log('标准:', formatAddress(r));
