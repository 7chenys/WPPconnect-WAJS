# @yanmontain/wa-js

> 非官方固定版本，仅用于维护者自己的项目依赖管理。

## 项目说明

本仓库是 [WPPConnect WA-JS](https://github.com/wppconnect-team/wa-js) 的固定版本快照，当前对应上游版本 `4.6.0`。

建立此仓库和 npm 包的目的，是为个人项目提供可重复安装的固定依赖，避免上游版本变化意外影响现有项目。该快照不会自动跟随上游更新，也不承诺持续维护、兼容性更新、安全更新或技术支持。

发布到 npm 仅用于维护者自己的项目，不代表面向公众提供产品、服务或商业承诺。

## 非官方声明

- 本项目不是 WPPConnect Team 或 WhatsApp 的官方项目。
- 本项目未获得 WPPConnect Team、WhatsApp 或 Meta 的认可、赞助或背书。
- WPPConnect、WhatsApp、Meta 及相关名称和商标归各自权利人所有。
- 自用声明不构成对任何第三方权利、平台条款或适用法律的豁免，也不构成法律意见。

## 来源与许可证

原始项目：<https://github.com/wppconnect-team/wa-js>

原始版权归 WPPConnect Team 及其贡献者所有。本仓库继续遵循 Apache License 2.0，完整条款见 [LICENSE](./LICENSE)。再分发或修改时，应保留许可证、版权和归属声明，并按许可证要求说明修改。

## 安装

固定安装当前版本：

```bash
npm install @yanmontain/wa-js@4.6.0 --save-exact
```

如果现有项目仍通过 `@wppconnect/wa-js` 解析依赖，可以使用 npm alias：

```json
{
  "dependencies": {
    "@wppconnect/wa-js": "npm:@yanmontain/wa-js@4.6.0"
  }
}
```

## 使用风险

WA-JS 依赖 WhatsApp Web 的内部实现，平台更新可能随时导致部分或全部功能失效。使用者应自行评估技术、账号、数据、平台条款及适用法律风险，并自行承担使用后果。

本软件按“原样”提供，不附带任何明示或默示保证。具体免责声明和责任限制以 [Apache License 2.0](./LICENSE) 为准。
