import { useRef, useState, type ReactNode } from 'react';
import {
  parseCloud,
  type ParsedAddress,
  type CloudParsed,
  type CloudEndpoint,
} from 'cnaddr';
import { highlightTokens, TOKEN_LABEL, type TokenType } from './highlight.js';
import {
  Cloud,
  Copy,
  Check,
  Download,
  ArrowUpRight,
} from './icons.js';

const APIZERO = 'https://apizero.cn';
export const KEYS_URL = `${APIZERO}/account/keys`;

export interface CloudCfg {
  apiKey: string;
  endpoint: CloudEndpoint;
}

/* ----------------------------- 编辑器式输入 ----------------------------- */

export function AddressEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(1);

  const lines = value === '' ? 1 : value.split('\n').length;
  const chars = value.length;

  const syncScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };
  const updateActive = () => {
    const el = taRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? 0;
    setActive(value.slice(0, pos).split('\n').length);
  };

  return (
    <div className={`editor${focused ? ' focused' : ''}`}>
      <div className="editor-bar">
        <span className="dots">
          <i />
          <i />
          <i />
        </span>
        <span className="efile">addresses.txt</span>
        <span className="spacer" />
        <span className="ecount">
          {lines} 行 · {chars} 字
        </span>
      </div>
      <div className="editor-body">
        <div className="gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className={`ln${i + 1 === active ? ' active' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={taRef}
          className="editor-ta"
          value={value}
          wrap="off"
          spellCheck={false}
          placeholder="粘贴中文地址，可多行批量…"
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyUp={updateActive}
          onClick={updateActive}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}

/* ----------------------------- 基础原子组件 ----------------------------- */

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = '复制',
  small,
}: {
  text: string;
  label?: string;
  small?: boolean;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`copy-btn${small ? ' sm' : ''}${done ? ' ok' : ''}`}
      onClick={async () => {
        if (await copy(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? '已复制' : label}
    </button>
  );
}

export function ConfidenceRing({ value }: { value: number }) {
  const cls = value >= 0.7 ? 'high' : value >= 0.4 ? 'mid' : 'low';
  const r = 18;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div className={`ring ${cls}`} title={`置信度 ${value}`}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} className="ring-bg" />
        <circle
          cx="24"
          cy="24"
          r={r}
          className="ring-fg"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className="ring-val">{Math.round(value * 100)}</span>
    </div>
  );
}

export function Breadcrumb({ r }: { r: ParsedAddress }) {
  const items = [r.province, r.city, r.district].filter(Boolean) as {
    code: string;
    name: string;
  }[];
  if (items.length === 0 && !r.town) return null;
  return (
    <div className="crumbs">
      {items.map((it, i) => (
        <span className="crumb" key={i}>
          <span className="crumb-name">{it.name}</span>
          {it.code && <span className="crumb-code">{it.code}</span>}
        </span>
      ))}
      {r.town && (
        <span className="crumb">
          <span className="crumb-name">{r.town}</span>
        </span>
      )}
    </div>
  );
}

const LEGEND: Array<Exclude<TokenType, 'plain'>> = [
  'name',
  'mobile',
  'phone',
  'idCard',
  'zipcode',
  'region',
  'town',
  'detail',
];

export function TokenizedRaw({ r }: { r: ParsedAddress }) {
  const tokens = highlightTokens(r);
  return (
    <div className="raw-hl">
      <div className="raw-line">
        {tokens.map((t, i) =>
          t.type === 'plain' ? (
            <span key={i}>{t.text}</span>
          ) : (
            <mark key={i} className={`tok tok-${t.type}`}>
              {t.text}
            </mark>
          ),
        )}
      </div>
      <div className="legend">
        {LEGEND.map((t) => (
          <span className="legend-item" key={t}>
            <span className={`dot tok-${t}`} />
            {TOKEN_LABEL[t]}
          </span>
        ))}
      </div>
    </div>
  );
}

function Field({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`cell ${accent ? 'accent' : ''}`}>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

/* ----------------------------- 结构化卡片 ----------------------------- */

export function StructuredCard({
  r,
  cloud,
}: {
  r: ParsedAddress;
  cloud: CloudCfg | null;
}) {
  const [pro, setPro] = useState<CloudParsed | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const rows: Array<[string, string, boolean]> = [
    ['省', r.province?.name ?? '', true],
    ['市', r.city?.name ?? '', true],
    ['区/县', r.district?.name ?? '', true],
    ['乡镇/街道', r.town, false],
    ['详细地址', r.detail, false],
    ['姓名', r.name, false],
    ['手机', r.mobile, false],
    ['固话', r.phone, false],
    ['身份证', r.idCard, false],
    ['邮编', r.zipcode, false],
  ];

  async function runCloud() {
    if (!cloud) return;
    setLoading(true);
    setErr('');
    setPro(null);
    try {
      setPro(
        await parseCloud(r.raw, {
          apiKey: cloud.apiKey || undefined,
          endpoint: cloud.endpoint,
        }),
      );
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : '云端调用失败（浏览器 CORS 限制，请在服务端调用）',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="rcard">
      <header className="rcard-top">
        <ConfidenceRing value={r.confidence} />
        <div className="rcard-raw">
          <TokenizedRaw r={r} />
        </div>
      </header>

      <Breadcrumb r={r} />

      <div className="grid">
        {rows
          .filter(([, v]) => v)
          .map(([k, v, a]) => (
            <Field key={k} k={k} v={v} accent={a} />
          ))}
      </div>

      <footer className="rcard-foot">
        <CopyButton text={JSON.stringify(r, null, 2)} label="复制 JSON" small />
        {cloud && (
          <button className="cloud-btn" onClick={runCloud} disabled={loading}>
            {loading ? (
              '解析中…'
            ) : (
              <>
                <Cloud size={14} /> 云端增强 (Pro)
              </>
            )}
          </button>
        )}
      </footer>

      {pro && (
        <div className="pro-result">
          <div className="pro-head">
            <Cloud size={15} /> 云端 Pro{' '}
            <span className="pro-tag">{pro.source}</span>
          </div>
          <div className="grid">
            {(
              [
                ['省', pro.province?.name ?? ''],
                ['市', pro.city?.name ?? ''],
                ['区/县', pro.district?.name ?? ''],
                ['乡镇/街道', pro.town],
                ['详细', pro.detail],
              ] as Array<[string, string]>
            )
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <Field key={k} k={k} v={v} accent />
              ))}
          </div>
          {pro.ids && <pre className="json sm">{JSON.stringify(pro.ids, null, 2)}</pre>}
        </div>
      )}

      {err && (
        <div className="pro-err">
          <span>{err}</span>
          <a className="cta-inline" href={KEYS_URL} target="_blank" rel="noreferrer">
            免费获取 API Key <ArrowUpRight size={13} />
          </a>
        </div>
      )}
    </article>
  );
}

/* ----------------------------- 批量表格视图 ----------------------------- */

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(results: ParsedAddress[]): string {
  const head = [
    '原文',
    '省',
    '省编码',
    '市',
    '市编码',
    '区县',
    '乡镇街道',
    '详细',
    '姓名',
    '手机',
    '固话',
    '身份证',
    '邮编',
    '置信度',
  ];
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = results.map((r) =>
    [
      r.raw,
      r.province?.name ?? '',
      r.province?.code ?? '',
      r.city?.name ?? '',
      r.city?.code ?? '',
      r.district?.name ?? '',
      r.town,
      r.detail,
      r.name,
      r.mobile,
      r.phone,
      r.idCard,
      r.zipcode,
      r.confidence,
    ]
      .map((v) => esc(String(v)))
      .join(','),
  );
  return [head.map(esc).join(','), ...lines].join('\n');
}

export function TableView({ results }: { results: ParsedAddress[] }) {
  return (
    <div className="tablewrap">
      <div className="table-toolbar">
        <span className="muted">{results.length} 条</span>
        <div className="spacer" />
        <button
          className="ghost-btn"
          onClick={() => download('cnaddr.csv', '\uFEFF' + toCsv(results), 'text/csv')}
        >
          <Download size={14} /> 导出 CSV
        </button>
        <button
          className="ghost-btn"
          onClick={() =>
            download(
              'cnaddr.json',
              JSON.stringify(results, null, 2),
              'application/json',
            )
          }
        >
          <Download size={14} /> 导出 JSON
        </button>
      </div>
      <div className="table-scroll">
        <table className="dtable">
          <thead>
            <tr>
              <th>省</th>
              <th>市</th>
              <th>区/县</th>
              <th>乡镇/街道</th>
              <th>详细</th>
              <th>姓名</th>
              <th>手机</th>
              <th className="num">置信度</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.province?.name ?? ''}</td>
                <td>{r.city?.name ?? ''}</td>
                <td>{r.district?.name ?? ''}</td>
                <td>{r.town}</td>
                <td className="detail-col">{r.detail}</td>
                <td>{r.name}</td>
                <td className="mono">{r.mobile}</td>
                <td className="num">
                  <span
                    className={`pill ${
                      r.confidence >= 0.7 ? 'high' : r.confidence >= 0.4 ? 'mid' : 'low'
                    }`}
                  >
                    {r.confidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- JSON / 代码视图 ----------------------------- */

export function JsonView({ results }: { results: ParsedAddress[] }) {
  const payload = results.length === 1 ? results[0] : results;
  const text = JSON.stringify(payload, null, 2);
  return (
    <div className="codewrap">
      <div className="code-toolbar">
        <span className="muted">application/json</span>
        <div className="spacer" />
        <CopyButton text={text} small />
      </div>
      <pre className="json big">{text}</pre>
    </div>
  );
}

export function CodeView({
  sample,
  strict,
  normalizeRegion,
}: {
  sample: string;
  strict: boolean;
  normalizeRegion: boolean;
}) {
  const opts: string[] = [];
  if (strict) opts.push('strict: true');
  if (!normalizeRegion) opts.push('normalizeRegion: false');
  const optStr = opts.length ? `, { ${opts.join(', ')} }` : '';
  const code = `import { parse } from 'cnaddr';

const result = parse(
  ${JSON.stringify(sample)}${optStr},
);

console.log(result.province?.name); // 省
console.log(result.city?.name);     // 市
console.log(result.district?.name); // 区/县`;
  return (
    <div className="codewrap">
      <div className="code-toolbar">
        <span className="muted">TypeScript</span>
        <div className="spacer" />
        <CopyButton text={code} small />
      </div>
      <pre className="json big">{code}</pre>
    </div>
  );
}

/* ----------------------------- 杂项 ----------------------------- */

export function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="stat">
      {icon && <span className="stat-ico">{icon}</span>}
      <div className="stat-body">
        <span className="stat-val">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
