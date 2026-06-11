# Changelog

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## 1.0.0

首个正式版本 🎉

### 新增

- `parse()` / `parseBatch()` 中文地址解析：省 / 市 / 区 / 乡镇街道四级切分。
- 由地级市反推省份；省份与城市简称补全。
- 抽取并剥离 姓名 / 手机号 / 固定电话 / 身份证 / 邮编。
- 内置 34 省级 + 333 地级行政区划字典（含国标编码）。
- `setDistrictProvider()` 可插拔区县级数据。
- `formatAddress()` 反向拼回标准化地址。
- `isValidIdCard()` 18 位身份证校验码校验。
- `cnaddr` 命令行工具（支持管道、批量、JSON、按字段输出）。
- 零运行时依赖，ESM + CJS 双格式，完整 TypeScript 类型。
- Vite + React 在线 Playground。
