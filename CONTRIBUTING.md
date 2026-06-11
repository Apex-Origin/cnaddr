# 贡献指南 · Contributing

感谢你愿意为 **cnaddr** 出一份力！🎉

## 开发环境

- Node ≥ 18
- pnpm ≥ 9

```bash
git clone https://github.com/Apex-Origin/cnaddr.git
cd cnaddr
pnpm install
```

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm test` | 运行单元测试 |
| `pnpm test:watch` | 监听模式 |
| `pnpm test:cov` | 覆盖率报告 |
| `pnpm typecheck` | 类型检查 |
| `pnpm lint` | ESLint 检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm build` | 构建产物 |
| `pnpm bench` | 基准测试（先 `pnpm build`） |
| `pnpm playground` | 启动在线 Playground |

## 提交一个「识别不准」的用例

地址写法千变万化，**最有价值的贡献就是补样例**：

1. 在 `test/fixtures.ts` 里加一条 `{ input, expect }`。
2. 跑 `pnpm test`，确认你的用例确实失败（复现问题）。
3. 调整 `src/` 下的规则 / 数据，使其通过，并确保**其它用例不回归**。
4. 提交 PR，描述这类地址的特点。

## 补充行政区划数据

- 省级：`src/data/provinces.ts`
- 地级：`src/data/cities.ts`（请使用 6 位国标行政区划代码）

## 代码规范

- 提交前请运行 `pnpm lint && pnpm typecheck && pnpm test`。
- 遵循现有代码风格（Prettier 已配置）。
- 公共 API 改动请同步更新 README 与类型注释。

## 变更集（Changesets）

涉及发布的改动请附带一个 changeset：

```bash
pnpm changeset
```

按提示选择语义化版本类型并填写说明即可。

## 行为准则

参与本项目即表示你同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。
