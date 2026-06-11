// 简易基准：测量单条解析吞吐量。运行前请先 `pnpm build`。
import { parse } from '../dist/index.js';

const SAMPLES = [
  '张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号 311121',
  '收件人：王小明 13900139000 广东深圳南山区粤海街道科技园',
  '北京朝阳区三里屯街道工体北路8号院 李雷',
  '上海市浦东新区张江镇科苑路88号 021-38888888',
  '内蒙古呼和浩特市新城区新华大街63号',
  '湖北省恩施土家族苗族自治州利川市都亭街道',
];

function bench(label, fn, iterations) {
  // 预热
  for (let i = 0; i < 10000; i++) fn(i);
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn(i);
  const ns = Number(process.hrtime.bigint() - start);
  const opsPerSec = Math.round((iterations / ns) * 1e9);
  const usPerOp = (ns / iterations / 1000).toFixed(2);
  console.log(
    `${label.padEnd(22)} ${opsPerSec.toLocaleString().padStart(12)} ops/s  ` +
      `(${usPerOp} µs/op)`,
  );
}

const N = 200000;
console.log(
  `\ncnaddr benchmark · node ${process.version} · ${N.toLocaleString()} iters\n`,
);
bench('parse (混合样本)', (i) => parse(SAMPLES[i % SAMPLES.length]), N);
bench('parse (完整地址)', () => parse(SAMPLES[0]), N);
bench('parse (仅省市区)', () => parse('广东省深圳市南山区'), N);
console.log('');
