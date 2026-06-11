import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { parse, version, type CloudEndpoint } from 'cnaddr';
import {
  AddressEditor,
  StructuredCard,
  TableView,
  JsonView,
  CodeView,
  Stat,
  KEYS_URL,
  type CloudCfg,
} from './components.js';
import {
  Logo,
  Sun,
  Moon,
  GitHub,
  Cloud,
  Compass,
  Key,
  ArrowUpRight,
  IconStructured,
  IconTable,
  IconJson,
  IconCode,
  IconList,
  IconGauge,
  IconTarget,
} from './icons.js';

const APIZERO = 'https://apizero.cn';
const GITHUB = 'https://github.com/Apex-Origin/cnaddr';

const SAMPLES = [
  '张三 13812345678 浙江省杭州市余杭区五常街道文一西路969号 311121',
  '收件人：王小明 13900139000 广东深圳南山区粤海街道科技园',
  '北京朝阳区三里屯街道工体北路8号院 李雷',
  '上海市浦东新区张江镇科苑路88号 021-38888888',
  '苏州市姑苏区干将东路1号 欧阳娜娜',
  '内蒙古呼和浩特市新城区新华大街63号',
];

type View = 'structured' | 'table' | 'json' | 'code';
type Theme = 'dark' | 'light';

const VIEWS: Array<{ id: View; label: string; icon: ReactNode }> = [
  { id: 'structured', label: '结构化', icon: <IconStructured /> },
  { id: 'table', label: '批量表格', icon: <IconTable /> },
  { id: 'json', label: 'JSON', icon: <IconJson /> },
  { id: 'code', label: '代码', icon: <IconCode /> },
];

export function App() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('cnaddr-theme') as Theme) || 'dark',
  );
  const [text, setText] = useState(SAMPLES.join('\n'));
  const [strict, setStrict] = useState(false);
  const [normalizeRegion, setNormalize] = useState(true);
  const [view, setView] = useState<View>('structured');

  const [cloudOn, setCloudOn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState<CloudEndpoint>('jd-address');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cnaddr-theme', theme);
  }, [theme]);

  const results = useMemo(
    () =>
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => parse(l, { strict, normalizeRegion })),
    [text, strict, normalizeRegion],
  );

  const stats = useMemo(() => {
    const n = results.length;
    const avg = n
      ? Math.round((results.reduce((s, r) => s + r.confidence, 0) / n) * 100)
      : 0;
    const hit = n
      ? Math.round(
          (results.filter((r) => r.province && r.city).length / n) * 100,
        )
      : 0;
    return { n, avg, hit };
  }, [results]);

  const cloudCfg: CloudCfg | null = cloudOn ? { apiKey, endpoint } : null;
  const firstSample = results[0]?.raw ?? SAMPLES[0]!;

  return (
    <div className="wb">
      <header className="topbar">
        <div className="tb-left">
          <Logo size={26} />
          <span className="logo">cnaddr</span>
          <span className="ver">v{version}</span>
          <span className="tb-sub">中文地址解析工作台</span>
        </div>
        <div className="tb-right">
          <button
            className="icon-btn"
            title="切换主题"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <a className="tb-link" href={GITHUB} target="_blank" rel="noreferrer">
            <GitHub size={15} /> GitHub
          </a>
          <code className="tb-install">npm i cnaddr</code>
          <a className="tb-cta" href={APIZERO} target="_blank" rel="noreferrer">
            极数本源 ApiZero <ArrowUpRight size={13} />
          </a>
        </div>
      </header>

      <div className="workbench">
        {/* 左侧：输入 + 选项 */}
        <aside className="left">
          <div className="card editor-card">
            <AddressEditor value={text} onChange={setText} />
            <div className="editor-foot">
              <div className="chips">
                {SAMPLES.map((s, i) => (
                  <button key={i} className="chip" onClick={() => setText(s)}>
                    示例 {i + 1}
                  </button>
                ))}
                <button
                  className="chip"
                  onClick={() => setText(SAMPLES.join('\n'))}
                >
                  全部示例
                </button>
                <button className="chip ghost" onClick={() => setText('')}>
                  清空
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <span>选项</span>
            </div>
            <div className="opts">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={normalizeRegion}
                  onChange={(e) => setNormalize(e.target.checked)}
                />
                <span className="track" />
                <span className="tlabel">内置字典补全</span>
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={strict}
                  onChange={(e) => setStrict(e.target.checked)}
                />
                <span className="track" />
                <span className="tlabel">严格模式</span>
              </label>
            </div>
          </div>

          <div className="card cloud-card">
            <div className="card-h">
              <span className="h-ico">
                <Cloud size={15} /> 云端增强 (Pro)
              </span>
              <label className="toggle mini">
                <input
                  type="checkbox"
                  checked={cloudOn}
                  onChange={(e) => setCloudOn(e.target.checked)}
                />
                <span className="track" />
              </label>
            </div>
            <p className="muted small">
              四级行政区 + 京东级纠错，由 极数本源 ApiZero 提供。
            </p>
            {cloudOn && (
              <div className="cloud-cfg">
                <select
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value as CloudEndpoint)}
                >
                  <option value="jd-address">jd-address（四级 + ID）</option>
                  <option value="address-parse">address-parse（自研）</option>
                </select>
                <input
                  type="password"
                  value={apiKey}
                  placeholder="API Key（可留空匿名试用）"
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            )}
            <a className="cta-block" href={KEYS_URL} target="_blank" rel="noreferrer">
              <Key size={15} /> 免费获取 API Key <ArrowUpRight size={13} />
            </a>
          </div>
        </aside>

        {/* 右侧：结果 */}
        <main className="right">
          <div className="stat-strip">
            <Stat label="解析条数" value={stats.n} icon={<IconList />} />
            <Stat label="平均置信度" value={`${stats.avg}%`} icon={<IconGauge />} />
            <Stat label="省市命中率" value={`${stats.hit}%`} icon={<IconTarget />} />
          </div>

          <div className="tabs">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                className={`tab ${view === v.id ? 'active' : ''}`}
                onClick={() => setView(v.id)}
              >
                <span className="tab-i">{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>

          <div className="view">
            {results.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  <Compass size={42} />
                </div>
                在左侧输入地址，结果会实时显示在这里
              </div>
            ) : view === 'structured' ? (
              <div className="cards">
                {results.map((r, i) => (
                  <StructuredCard key={i} r={r} cloud={cloudCfg} />
                ))}
              </div>
            ) : view === 'table' ? (
              <TableView results={results} />
            ) : view === 'json' ? (
              <JsonView results={results} />
            ) : (
              <CodeView
                sample={firstSample}
                strict={strict}
                normalizeRegion={normalizeRegion}
              />
            )}
          </div>
        </main>
      </div>

      <footer className="statusbar">
        <span>cnaddr v{version}</span>
        <span className="dot-sep">·</span>
        <span>零依赖 · 本地解析，地址不出浏览器</span>
        <div className="spacer" />
        <a href={APIZERO} target="_blank" rel="noreferrer">
          Powered by 极数本源 ApiZero
        </a>
      </footer>
    </div>
  );
}
