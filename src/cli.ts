#!/usr/bin/env node
import { parse } from './parse.js';
import { formatAddress } from './format.js';
import type { ParsedAddress, ParseOptions } from './types.js';
import { version } from './index.js';

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (s: string, color: string): string =>
  useColor ? `${color}${s}${C.reset}` : s;

const HELP = `${paint('cnaddr', C.bold)} ${paint('v' + version, C.gray)} — 智能中文地址解析

${paint('用法', C.bold)}
  cnaddr [选项] "<地址>" ["<地址2>" ...]
  echo "<地址>" | cnaddr [选项]
  cat addresses.txt | cnaddr --json

${paint('选项', C.bold)}
  -j, --json          以 JSON 输出（多个地址输出数组）
  -f, --format        仅输出标准化后的完整地址字符串
      --field <name>  仅输出某个字段（province/city/district/town/detail/
                      name/mobile/phone/idCard/zipcode/confidence）
  -s, --strict        严格模式（省/市必须命中内置字典）
      --no-region     关闭内置行政区划字典，仅做结构化切分
  -v, --version       输出版本号
  -h, --help          显示帮助

${paint('示例', C.bold)}
  cnaddr "张三 13812345678 浙江省杭州市余杭区文一西路969号"
  cnaddr -j "北京朝阳区三里屯街道工体北路8号"
  cnaddr --field province "广东深圳南山区"
`;

interface CliArgs {
  json: boolean;
  format: boolean;
  field: string | null;
  options: ParseOptions;
  addresses: string[];
}

function parseArgs(
  argv: string[],
): CliArgs | { help: true } | { version: true } {
  const out: CliArgs = {
    json: false,
    format: false,
    field: null,
    options: {},
    addresses: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    switch (a) {
      case '-h':
      case '--help':
        return { help: true };
      case '-v':
      case '--version':
        return { version: true };
      case '-j':
      case '--json':
        out.json = true;
        break;
      case '-f':
      case '--format':
        out.format = true;
        break;
      case '--field':
        out.field = argv[++i] ?? null;
        break;
      case '-s':
      case '--strict':
        out.options.strict = true;
        break;
      case '--no-region':
        out.options.normalizeRegion = false;
        break;
      default:
        if (a.startsWith('-')) {
          process.stderr.write(paint(`未知选项: ${a}\n`, C.red));
          process.exit(2);
        }
        out.addresses.push(a);
    }
  }
  return out;
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

function confidenceColor(c: number): string {
  if (c >= 0.7) return C.green;
  if (c >= 0.4) return C.yellow;
  return C.red;
}

function prettyPrint(r: ParsedAddress): string {
  const rows: Array<[string, string]> = [
    ['省', r.province?.name ?? ''],
    ['市', r.city?.name ?? ''],
    ['区/县', r.district?.name ?? ''],
    ['乡镇/街道', r.town],
    ['详细', r.detail],
    ['姓名', r.name],
    ['手机', r.mobile],
    ['固话', r.phone],
    ['身份证', r.idCard],
    ['邮编', r.zipcode],
  ];
  const lines = rows
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `  ${paint(k.padEnd(5, '　'), C.cyan)} ${v}`);
  const conf = `  ${paint('置信度'.padEnd(5, '　'), C.cyan)} ${paint(
    String(r.confidence),
    confidenceColor(r.confidence),
  )}`;
  return [paint(r.raw, C.dim), ...lines, conf].join('\n');
}

function pickField(r: ParsedAddress, field: string): string {
  switch (field) {
    case 'province':
      return r.province?.name ?? '';
    case 'city':
      return r.city?.name ?? '';
    case 'district':
      return r.district?.name ?? '';
    case 'town':
      return r.town;
    case 'detail':
      return r.detail;
    case 'name':
      return r.name;
    case 'mobile':
      return r.mobile;
    case 'phone':
      return r.phone;
    case 'idCard':
      return r.idCard;
    case 'zipcode':
      return r.zipcode;
    case 'confidence':
      return String(r.confidence);
    default:
      process.stderr.write(paint(`未知字段: ${field}\n`, C.red));
      process.exit(2);
  }
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  if ('help' in parsed) {
    process.stdout.write(HELP);
    return;
  }
  if ('version' in parsed) {
    process.stdout.write(version + '\n');
    return;
  }

  let addresses = parsed.addresses;
  if (addresses.length === 0 && !process.stdin.isTTY) {
    const stdin = await readStdin();
    addresses = stdin
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (addresses.length === 0) {
    process.stdout.write(HELP);
    process.exit(1);
  }

  const results = addresses.map((a) => parse(a, parsed.options));

  if (parsed.json) {
    const payload = results.length === 1 ? results[0] : results;
    process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
    return;
  }

  if (parsed.field) {
    for (const r of results) {
      process.stdout.write(pickField(r, parsed.field) + '\n');
    }
    return;
  }

  if (parsed.format) {
    for (const r of results) process.stdout.write(formatAddress(r) + '\n');
    return;
  }

  process.stdout.write(results.map(prettyPrint).join('\n\n') + '\n');
}

main().catch((err: unknown) => {
  process.stderr.write(String(err instanceof Error ? err.stack : err) + '\n');
  process.exit(1);
});
