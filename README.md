# dsh-awesome-fonts

**此项目基于[dsh-font](https://github.com/tianyhjg-lab/dsh-font)重置，因原项目作者失联，项目长期缺乏维护已无法使用，特新开此项目**

为 DeepSeek Harness Web GUI 换字体的插件。零构建、零网络请求、不打包任何字体文件：
**99 个界面字体**（98 个可选 + 「默认」）+ **31 个代码字体**（30 个等宽 + 「默认」），
中文（黑体 / 宋体 / 楷体仿宋 / 手写创意）+ 西文（衬线 / 无衬线 / 展示手写）全分组覆盖，
每个候选都自带中西文搭配栈，选中立即全局生效，刷新后自动恢复。

| 开关 | 覆盖的 CSS 变量 | 影响范围 |
| --- | --- | --- |
| 界面字体 | `--dsw-font-family` | 正文、标题、markdown、表格、按钮、侧边栏、菜单等所有走 `--dsw-font-*` / `--dsw-font-markdown-*` 排版的文字 |
| 代码字体 | `--ds-font-family-code` | 代码块、行内代码、终端、JSON 树、Read/Web/Diff 块 |

---

## 安装

插件是标准的 DSH 双面插件包：`dsh.bundle.patch` 指向 `cordis.patch.yml`（host 侧 loader 入口），
`dsh.client` 声明浏览器半侧。安装 = 把包装进 profile + 让 profile 组合它的 patch。

### 装到 DSH 的 profile

```powershell
# 1) 把插件装进当前 profile（profile 目录由 $DSH_HOME 决定）
#dsh plugin --profile <Your Profile Name> add "file:<Your Path of This Plus>"

# 2) 在 profile 的 package.json 里把包名加进 dsh.profile.bundles，
#    这样 dsh.bundle.patch -> cordis.patch.yml 才会被组合进去：
#      "dsh": { "profile": { "bundles": [ ..., "dsh-awesome-fonts" ] } }

# 3) 重启 DSH（或让 profile 重新加载），打开 设置 → 全局字体
```

也可以手工等价操作：在 `$env:DSH_HOME\profiles\<profile>\package.json` 的 `dependencies`
里加 `"dsh-awesome-fonts": "file:<本仓库路径>"`，把包名追加到同文件 `dsh.profile.bundles`
数组，然后在该 profile 目录执行 `pnpm install --no-frozen-lockfile`。

### 版本兼容

- 面向 **DSH Desktop 2.0.x**（客户端模块基座 `@deepseek-ai/dsh-client-store ≥ 0.1.2-alpha`；
  本仓库按随包的 `0.1.5-rc.1` 校验）。
- 浏览器半侧的 `require` 只依赖 shell 的**冻结静态模块表**
  （`react` / `react/jsx-runtime` / `@deepseek-ai/dsh-client-store`），不引入任何额外运行时依赖。
- 在更老的 DSH 上，`@deepseek-ai/dsh-client-store` 不在模块表里，而本插件声明
  `immediately: true`，bundle 会在启动期物化 —— 找不到该模块会直接抛错 **并让整个 Web GUI 启动失败**。
  升级/降级 DSH 前请先确认该模块存在（见下方「错误与风险」）。

---

## 使用

打开 **设置**，左侧导航出现 **「全局字体」** 标签页（`settings.section`，`order: 50`，
排在 常规(0) / 模型(10) / 插件(15) / 预设(20) 之后）：

- **界面字体**：99 个选项，按下拉分组（默认 / 中文黑体 / 中文宋体 / 中文楷体仿宋 /
  中文手写创意 / 西文衬线 / 西文无衬线 / 西文展示手写），每个选项用它自己的字体渲染，
  先看到字样再选。
- **代码字体**：31 个选项（默认 + 30 个等宽字体）。
- 下方**预览条**实时显示当前界面字体的效果；选择立即全局生效，无需确认。
- 选「默认」= 清除该项覆盖，恢复 DSH 内置字体；两项都选「默认」时注入的 `<style>` 内容清空，
  对样式零影响。

选择存在浏览器 `localStorage`（`dsh-awesome-fonts:ui` / `dsh-awesome-fonts:code`），
同一 origin 刷新/重启后自动恢复；读取到未知字体 id 时按「默认」处理。

---

## 字体清单

> 清单由 `client.js` 的字体目录直接生成，与代码保持同步。

### 界面字体 / UI fonts

共 98 项，按分组排列（下拉框中每组一个 `<optgroup>`）：

**中文 · 黑体（29）**

微软雅黑 Microsoft YaHei、思源黑体 Noto Sans SC、鸿蒙黑体 HarmonyOS Sans SC、苹方 PingFang SC、阿里巴巴普惠体 Alibaba PuHuiTi、小米 MiSans、OPPO Sans、vivo Sans、荣耀 Honor Sans SC、得意黑 Smiley Sans、站酷快乐体 ZCOOL KuaiLe、站酷文艺体 ZCOOL Wenyi、站酷小薇 LOGO 体 ZCOOL XiaoWei、站酷高端黑 ZCOOL GaoDuanHei、站酷庆科黄油体 ZCOOL QingKe HuangYou、优设标题黑 YouSheBiaoTiHei、庞门正道标题体 PangMenZhengDao、钉钉进步体 DingTalk JinBuTi、方正黑体 FZHei、方正中等线 FZZhongDengXian、方正兰亭黑 FZLanTingHei、方正准圆 FZZhunYuan、汉仪旗黑 HYQiHei、汉仪文黑 HYWenHei、华文细黑 STHeiti、更纱黑体 Sarasa UI SC、黑体 SimHei、等线 DengXian、幼圆 YouYuan

**中文 · 宋体（8）**

宋体 SimSun、思源宋体 Noto Serif SC、华文中宋 STZhongsong、方正小标宋简体 FZXiaoBiaoSong、方正书宋简体 FZShuSong、京华老宋体 JingHuaLaoSong、悠哉明朝 Yozai、装甲明朝 Armor Ming

**中文 · 楷体仿宋（8）**

楷体 KaiTi、华文楷体 STKaiti、仿宋 FangSong、仿宋_GB2312、方正仿宋简体 FZFangSong、朱雀仿宋 Zhuque Fangsong、霞鹜文楷 LXGW WenKai、孤鹜别体 GWBB

**中文 · 手写创意（11）**

华文行楷 STXingkai、华文琥珀 STHupo、华文彩云 STCaiyun、隶书 LiSu、方正卡通体 FZKaiTong、方正综艺体 FZZongYi、阿里巴巴刀隶体 AlibabaDaoshuTi、汉仪尚巍手书 HYShangWeiShouShu、演示春风楷 YSChunFengKai、沐瑶随心手写体 Muyao-Softbrush、沐瑶软笔手写体 Muyao-SoftPen

**西文 · 衬线（14）**

Times New Roman、Cambria、Georgia、Garamond、Palatino Linotype、Book Antiqua、Baskerville、Didot、Bodoni MT、Goudy Old Style、Rockwell、Century Schoolbook、Bookman Old Style、Constantia

**西文 · 无衬线（19）**

Arial、Calibri、Verdana、Tahoma、Segoe UI、Helvetica、Trebuchet MS、Futura、Century Gothic、Gill Sans、Franklin Gothic、Lucida Sans、Candara、Corbel、Optima、Avant Garde、Geneva、Arial Narrow、Bahnschrift

**西文 · 展示手写（9）**

Comic Sans MS、Brush Script MT、Lucida Handwriting、Segoe Script、Segoe Print、Copperplate、Impact、Arial Black、Papyrus

### 代码字体 / Code fonts

共 30 项等宽字体：

Consolas、Cascadia Code、Cascadia Mono、JetBrains Mono、Fira Code、Fira Mono、Source Code Pro、IBM Plex Mono、Roboto Mono、Ubuntu Mono、Inconsolata、Hack、Droid Sans Mono、DejaVu Sans Mono、Liberation Mono、PT Mono、Space Mono、Victor Mono、Iosevka、Maple Mono、SF Mono、Menlo、Monaco、Meslo、Courier New、Cousine、更纱黑体 Sarasa Mono SC、等距更纱黑体 Sarasa Term SC、思源等宽 Noto Sans Mono、霞鹜文楷等宽 LXGW WenKai Mono

`LXGW WenKai Mono` 的栈里回退到 `KaiTi` 以保证中文对齐；若装了「霞鹜文楷等宽」等可选字体，
会出现得比回退字体更靠前。

---

## 原理

Web shell 的 `ui-theme` 基座在 `:root` 上声明两个字体变量：

```css
:root {
  --dsw-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", ...;
  --ds-font-family-code: "SF Mono", "JetBrains Mono", ..., Consolas, ...;
}
```

所有字号排版 token（`--dsw-font-xs-13`、`--dsw-font-base-16`、`--dsw-font-markdown-*`、…）
都以 `var(--dsw-font-family)` 收尾，代码面统一用 `var(--ds-font-family-code)`。
插件往 `<head>` 注入一个带 `data-plugin` / `data-plugin-css` 标记的 `<style>`：

```css
:root:root, body:body { --dsw-font-family: <所选栈>; --ds-font-family-code: <所选栈>; }
```

选择器**故意重复写**：`:root:root` 的特异性是 (0,2,0)，高于基座的 `:root` (0,1,0)，
所以与样式表先后无关。这一点必须这么处理 —— 插件 bundle 一物化就把 `<style>` 追加进
`document.head`，而 `ui-theme` 属于更晚的启动层级，两者顺序并不保证；若用同特异性的 `:root`，
就会在源顺序上输给基座。改动只涉及一个文本节点，不触碰任何组件与 DOM 结构。

- 字体目录每条都带 `group`（决定 `<optgroup>`）与 `stack`（主字体 + 中西文回退栈）；
  列表里同时写中文名与英文名，字体安装在任一名下都能命中；
- 未安装的字体会被浏览器按栈内顺序回退，**不会报错、不会下载**；
- 卸载/热更新时 `ctx.effect` 的清理函数移除注入的 `<style>`，不留残留。

## 开发

```powershell
npm run check   # node --check index.js && node --check client.js
npm test        # test/smoke.mjs：18 项静态 + 运行时契约检查
node test/install-check.mjs "$env:DSH_HOME\profiles\Test"   # 装好后的解析/加载校验
```

> 如果 PowerShell 提示「禁止运行脚本」（npm.ps1），用 `npm.cmd run check` / `npm.cmd test`，
> 或直接 `node test/smoke.mjs`。

`test/smoke.mjs` 用真实 bundle 做端到端冒烟：捕获 `window.__ModuleLoader__.load` 的注册、
用 shell 的静态模块表 mock `require`、跑 `apply(ctx)`、断言目录计数 / 分组 / i18n 键对齐 /
注入的 CSS 与选择器特异性 / localStorage 读写 / 非法 id 回退 / 卸载清理 / 分区组件渲染。
改字体表或文案后跑一次即可，无需启动 DSH。

`test/install-check.mjs` 针对「装进 profile 之后」的路径：用 profile 目录做 `require.resolve`、
读包清单校验 `exports["./client"]` 与 `dsh.client`、导入 host 半侧、用 fake `window` 执行
bundle、并从已安装 DSH 的 `app.asar` 里取出 shell 的静态模块表逐个核对 `require` 目标。

文件分工：

| 文件 | 作用 |
| --- | --- |
| `cordis.patch.yml` | host 侧 loader 入口：`{ id: dsh-awesome-fonts, name: 'dsh-awesome-fonts' }` |
| `index.js` | host 半侧（空实现）——全部功能在浏览器半侧 |
| `client.js` | 浏览器半侧：字体目录、注入样式、设置分区、localStorage 持久化 |
| `test/smoke.mjs` | bundle 的静态 + 运行时冒烟测试 |
| `test/install-check.mjs` | 针对已安装 profile 的解析 / 加载校验 |

浏览器半侧对外的依赖只有 shell 冻结模块表里的 `react` / `react/jsx-runtime` /
`@deepseek-ai/dsh-client-store`（`defineStore`），并要求 `slots`（分区席位）与 `locale`
（字典）两个服务，声明在导出的 `inject` 里。

### 变更记录

- **v1.0.0** — 首个版本：设置面板中单开「全局字体」标签页（`settings.section`，
  `id: dsh-awesome-fonts`，`order: 50`），两个字体下拉 + 预览条，99 / 31 字体目录，
  中英双语文案，`localStorage` 持久化。

---

## 错误与风险

已经核对过的点：

| 项 | 结论 |
| --- | --- |
| `require` 解析 | `react`、`react/jsx-runtime`、`@deepseek-ai/dsh-client-store` 全在 shell 的静态模块表（`PLATFORM_MODULES`）里，无未解析依赖 |
| 与服务/事件交互 | 只用 `ctx.slots` / `ctx.locale` / `ctx.effect`，都已在 `inject` 中声明或是 cordis 生命周期 API；未使用未声明的 `ctx.xxx` |
| 分区注册契约 | `settings.section` 是 `list` slot，需要 `id`；`label` 用 thunk 以便跟随语言切换；`inject(actions)` 的返回值即分区 props，与 shell 的 `standardKit` 一致 |
| `defineStore` 用法 | 与随包的 `@deepseek-ai/dsh-client-store` 同形（`init` + `actions` 草稿改写）；`store` 句柄经 `register` 的 store 席位解析为 `useStore` + `actions`，分区组件拿到 uSES 选择器 hook |
| CSS 优先级 | `:root:root, body:body`（0,2,0）压过基座 `:root`（0,1,0），与样式表顺序无关；冒烟测试会断言这个特异性，防止被改回同特异性的 `:root, body` |
| 数据来源 | 字体栈全部是仓库内的字面量，不含用户输入，不存在 CSS 注入面；`localStorage` 读写都有 try/catch，隐私模式/超额时仅退化为「本次会话内有效」 |
| 生命周期 | 样式元素由 `ctx.effect` 清理；选择失败（未知 id）按默认值处理，不抛错 |

仍需留意的点：

- **`immediately: true`（启动期加载）**：换字体要在首屏前生效，代价是 bundle 物化失败会
  拖挂整个 Web GUI 启动。因此不要混合新旧 DSH 版本使用；若启动白屏，先看控制台是否有
  `client-modules` / 模块解析报错，再回退到不加载本插件的 profile。
- **`dsh.client.inject: ["@deepseek-ai/dsh-client-locale"]`**：该包随 web profile 组合提供，
  正常情况恒在；但如果你在同一个 profile 里把 `@deepseek-ai/dsh-client-locale` 那一行 row 禁用掉，
  组合会报「缺失提供方」。要么保留 locale row，要么删掉这行 `inject`。
- **字体是否真的存在**：插件只输出 `font-family` 名称，实际渲染取决于本机安装的字体。
  未安装时按钮/下拉里仍是这个名字，但画面会回退到栈内下一个字体（这是设计行为，不是 bug）。
- **上游改名风险**：变量名 `--dsw-font-family` / `--ds-font-family-code` 取自当前
  `ui-theme` 基座；DSH 若重命名这两个变量，本插件会静默失效（界面不换肤但不报错）。
  升级 DSH 后如发现失效，按 `--dsw-font-*` token 的实际 `var()` 指向改名即可。

## 字体授权声明

- 本插件**不包含任何字体文件**，仓库中只有代码与字体名称字符串；
  字体名称引用（`font-family`）是行业标准做法，不构成对字体版权的复制或分发。
- 列表中的字体由**用户自行安装**，实际渲染使用用户本机已安装的字体；
  各字体的使用授权（尤其商用场景）由用户自行确认与负责。
- 字体授权速览（仅作提示，以各家官方协议为准）：
  - **开源可再分发**（OFL/Apache 等）：思源黑体/宋体、霞鹜文楷、得意黑、
    更纱黑体、孤鹜别体、朱雀仿宋、Cascadia Code、JetBrains Mono、Fira Code、
    IBM Plex、Source Code Pro、Iosevka、Maple Mono 等；
  - **免费商用（打包需遵守各家协议）**：MiSans、OPPO Sans、vivo Sans、
    HarmonyOS Sans、阿里巴巴普惠体、钉钉进步体、站酷系列、优设标题黑、
    演示/沐瑶系列等；
  - **不可再分发（随系统/Office 授权，商用需评估）**：方正全系、汉仪全系、
    华文全系、微软雅黑/宋体/黑体/仿宋/楷体/等线等系统字体、
    Times New Roman / Arial / Calibri 等 Office 字体、SF Mono / Menlo / Monaco。

## License

MIT（插件代码本身）。
