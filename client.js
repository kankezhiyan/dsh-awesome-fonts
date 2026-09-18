// dsh-awesome-fonts — browser half (client plugin bundle).
//
// Hand-written CJS + ModuleLoader wrapper (zero build steps, the same shape
// as the shipped client bundles in this DSH generation): registers one
// Settings section of its own — the "全局字体" (Fonts) tab in the settings
// nav — holding the UI and code font selects, and applies the choice by
// overriding the two font CSS variables the web shell derives its text tokens
// from, persisting in localStorage.
//
// Bundle contract (verified against the shipped bundles of DSH built on
// @deepseek-ai/dsh-client-store 0.1.5-rc.1): `window.__ModuleLoader__.load`
// with a factory that receives the platform `require`; react / react/jsx-runtime
// and @deepseek-ai/dsh-client-store resolve from the shell's frozen module
// table (`PLATFORM_MODULES` in the web shell bundle — store now provides the
// `defineStore` the old @deepseek-ai/dsh-client-runtime used to export; that
// package no longer exists in this generation).
//
// Font variables (verified against the current ui-theme bundle):
//   :root { --dsw-font-family: ...; --ds-font-family-code: ...; }
// Every --dsw-font-* token (markdown base, headings, table, xs..xl scale)
// references --dsw-font-family; every code surface (code blocks, terminal,
// JSON tree, diff) references --ds-font-family-code. The override is declared
// as TWO SEPARATE valid rules — `:root:root` (0,2,0) and `html body` — each
// with `!important`, so it wins over the base `:root` (0,1,0) regardless of
// which stylesheet lands first. No component changes and no bundled font
// files: the stacks name fonts already installed on the system, so nothing is
// downloaded.
// The injected <style> carries the `data-plugin`/`data-plugin-css` markers
// the client-modules HMR driver inventories, exactly like shipped bundles.
//
// Persistence note: stored in localStorage. DSH's Host settings wire only
// exposes an allowlisted set of namespaces to browser clients, so a
// third-party namespace would answer `settings-not-exposed`; localStorage
// survives reloads on the same origin.
window.__ModuleLoader__.load({
	id: "dsh-awesome-fonts",
	factory: (require) => {
		'use strict';
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");
		let _client_store = require("@deepseek-ai/dsh-client-store");

		//#region dsh-awesome-fonts: definitions
		/** The settings section's locale namespace. */
		const SETTINGS_NS = "settings.font";
		/** localStorage key holding the UI font id. */
		const STORAGE_UI_KEY = "dsh-awesome-fonts:ui";
		/** localStorage key holding the code font id. */
		const STORAGE_CODE_KEY = "dsh-awesome-fonts:code";
		/** The injected <style> element's id (HMR driver inventories it). */
		const STYLE_ID = "dsh-awesome-fonts-style";
		/** `data-plugin` marker matching this module's identity, as shipped bundles use. */
		const PLUGIN_TAG = "dsh-awesome-fonts";
		/** `data-plugin-css` marker keying the style record inside the module (HMR). */
		const PLUGIN_CSS_TAG = "dsh-awesome-fonts/style";
		/** Sentinel meaning "no override — follow the built-in font". */
		const DEFAULT_FONT = "default";
		/**
		 * Selectors the override is declared on, one rule each. Both are valid
		 * CSS that matches the document root and the body element; `:root:root`
		 * (0,2,0) out-specifies the ui-theme base's `:root` (0,1,0), and
		 * `html body` puts the declaration on the body element itself. Never add
		 * a selector with a repeated type selector (`body:body`) — it is invalid
		 * and, inside a list, it would discard every rule in that list.
		 */
		const OVERRIDE_SELECTORS = [":root:root", "html body"];

		/**
		 * UI font catalog. Every entry pairs a primary family with a
		 * CJK/Latin fallback stack, so mixed-script text stays harmonious no
		 * matter which font is picked:
		 *   - a Chinese font lists a Latin companion last (e.g. SimSun →
		 *     Times New Roman, Microsoft YaHei → Segoe UI);
		 *   - a Latin font lists a Chinese companion last (e.g. Times New
		 *     Roman → SimSun, Calibri → Microsoft YaHei).
		 * Stacks only name system-installed fonts (WPS/Office classics
		 * included); an uninstalled family falls back to the next one.
		 * Entries carry both the Chinese and the English family name where
		 * they differ, so a font installed under either name still matches.
		 * Group order defines the optgroup order in the settings select.
		 */
		const UI_FONTS = [
			{ id: "default", group: "default", label: "默认", stack: null },
			// ---- Chinese · sans (黑体) ----
			{ id: "msyh", group: "zh-sans", label: "微软雅黑 Microsoft YaHei", stack: '"Microsoft YaHei", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif' },
			{ id: "noto-sans", group: "zh-sans", label: "思源黑体 Noto Sans SC", stack: '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", "Segoe UI", Arial, sans-serif' },
			{ id: "harmonyos", group: "zh-sans", label: "鸿蒙黑体 HarmonyOS Sans SC", stack: '"HarmonyOS Sans SC", "HarmonyOS Sans", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "pingfang", group: "zh-sans", label: "苹方 PingFang SC", stack: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif' },
			{ id: "puhuiti", group: "zh-sans", label: "阿里巴巴普惠体 Alibaba PuHuiTi", stack: '"Alibaba PuHuiTi 3.0", "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "misans", group: "zh-sans", label: "小米 MiSans", stack: '"MiSans", "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "oppo-sans", group: "zh-sans", label: "OPPO Sans", stack: '"OPPO Sans", "MiSans", "HarmonyOS Sans SC", "PingFang SC", sans-serif' },
			{ id: "vivo-sans", group: "zh-sans", label: "vivo Sans", stack: '"vivo Sans", "OPPO Sans", "MiSans", "PingFang SC", sans-serif' },
			{ id: "honor-sans", group: "zh-sans", label: "荣耀 Honor Sans SC", stack: '"Honor Sans SC", "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "smiley-sans", group: "zh-sans", label: "得意黑 Smiley Sans", stack: '"Smiley Sans", "得意黑", "HarmonyOS Sans SC", "PingFang SC", sans-serif' },
			{ id: "zcool-kuaile", group: "zh-sans", label: "站酷快乐体 ZCOOL KuaiLe", stack: '"站酷快乐体", "ZCOOL KuaiLe", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "zcool-wenyi", group: "zh-sans", label: "站酷文艺体 ZCOOL Wenyi", stack: '"站酷文艺体", "ZCOOL Wenyi", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "zcool-xiaowei", group: "zh-sans", label: "站酷小薇 LOGO 体 ZCOOL XiaoWei", stack: '"站酷小薇LOGO体", "ZCOOL XiaoWei", "PingFang SC", sans-serif' },
			{ id: "zcool-gaoduanhei", group: "zh-sans", label: "站酷高端黑 ZCOOL GaoDuanHei", stack: '"站酷高端黑", "ZCOOL GaoDuanHei", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "zcool-qingke", group: "zh-sans", label: "站酷庆科黄油体 ZCOOL QingKe HuangYou", stack: '"站酷庆科黄油体", "ZCOOL QingKe HuangYou", "PingFang SC", sans-serif' },
			{ id: "youshe-biao", group: "zh-sans", label: "优设标题黑 YouSheBiaoTiHei", stack: '"优设标题黑", "YouSheBiaoTiHei", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "pangmen", group: "zh-sans", label: "庞门正道标题体 PangMenZhengDao", stack: '"庞门正道标题体", "PangMenZhengDao", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "dingtalk", group: "zh-sans", label: "钉钉进步体 DingTalk JinBuTi", stack: '"DingTalk JinBuTi", "钉钉进步体", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "fz-hei", group: "zh-sans", label: "方正黑体 FZHei", stack: '"FZHei-B01", "SimHei", "Microsoft YaHei", sans-serif' },
			{ id: "fz-zhongdengxian", group: "zh-sans", label: "方正中等线 FZZhongDengXian", stack: '"FZZhongDengXian-Z02", "DengXian", "Microsoft YaHei", sans-serif' },
			{ id: "fz-lantinghei", group: "zh-sans", label: "方正兰亭黑 FZLanTingHei", stack: '"FZLanTingHeiS-R-GB", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "fz-zhunyuan", group: "zh-sans", label: "方正准圆 FZZhunYuan", stack: '"FZZhunYuan-M02S", "YouYuan", "Microsoft YaHei", sans-serif' },
			{ id: "hy-qihei", group: "zh-sans", label: "汉仪旗黑 HYQiHei", stack: '"HYQiHei-55S", "HYQiHei", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "hy-wenhei", group: "zh-sans", label: "汉仪文黑 HYWenHei", stack: '"HYWenHei-85W", "HYWenHei", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "stheiti", group: "zh-sans", label: "华文细黑 STHeiti", stack: '"STHeiti", "STXihei", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "sarasa-ui", group: "zh-sans", label: "更纱黑体 Sarasa UI SC", stack: '"Sarasa UI SC", "Sarasa Gothic SC", "PingFang SC", "Microsoft YaHei", sans-serif' },
			{ id: "simhei", group: "zh-sans", label: "黑体 SimHei", stack: '"SimHei", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "dengxian", group: "zh-sans", label: "等线 DengXian", stack: '"DengXian", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "youyuan", group: "zh-sans", label: "幼圆 YouYuan", stack: '"YouYuan", "幼圆", "Microsoft YaHei", "PingFang SC", sans-serif' },
			// ---- Chinese · serif (宋体) ----
			{ id: "simsun", group: "zh-serif", label: "宋体 SimSun", stack: '"SimSun", "NSimSun", "Times New Roman", serif' },
			{ id: "noto-serif", group: "zh-serif", label: "思源宋体 Noto Serif SC", stack: '"Noto Serif SC", "Source Han Serif SC", "SimSun", "Times New Roman", serif' },
			{ id: "stzhongsong", group: "zh-serif", label: "华文中宋 STZhongsong", stack: '"STZhongsong", "SimSun", "Times New Roman", serif' },
			{ id: "fz-xiaobiaosong", group: "zh-serif", label: "方正小标宋简体 FZXiaoBiaoSong", stack: '"FZXiaoBiaoSong-B05S", "STZhongsong", "SimSun", serif' },
			{ id: "fz-shusong", group: "zh-serif", label: "方正书宋简体 FZShuSong", stack: '"FZShuSong-Z01S", "SimSun", "Times New Roman", serif' },
			{ id: "jinghua", group: "zh-serif", label: "京华老宋体 JingHuaLaoSong", stack: '"京华老宋体", "JingHuaLaoSong", "SimSun", "Times New Roman", serif' },
			{ id: "yozai", group: "zh-serif", label: "悠哉明朝 Yozai", stack: '"悠哉明朝", "Yozai", "Noto Serif SC", "SimSun", serif' },
			{ id: "zhuangjia", group: "zh-serif", label: "装甲明朝 Armor Ming", stack: '"装甲明朝", "Armor Ming", "Noto Serif SC", "SimSun", serif' },
			// ---- Chinese · kai / fangsong (楷体仿宋) ----
			{ id: "kaiti", group: "zh-kai-fang", label: "楷体 KaiTi", stack: '"KaiTi", "STKaiti", "KaiTi_GB2312", serif' },
			{ id: "stkaiti", group: "zh-kai-fang", label: "华文楷体 STKaiti", stack: '"STKaiti", "KaiTi", serif' },
			{ id: "fangsong", group: "zh-kai-fang", label: "仿宋 FangSong", stack: '"FangSong", "FangSong_GB2312", "Times New Roman", serif' },
			{ id: "fangsong-gb2312", group: "zh-kai-fang", label: "仿宋_GB2312", stack: '"FangSong_GB2312", "FangSong", "Times New Roman", serif' },
			{ id: "fz-fangsong", group: "zh-kai-fang", label: "方正仿宋简体 FZFangSong", stack: '"FZFangSong-Z02S", "FangSong", "FangSong_GB2312", serif' },
			{ id: "zhuque", group: "zh-kai-fang", label: "朱雀仿宋 Zhuque Fangsong", stack: '"朱雀仿宋", "Zhuque Fangsong", "FangSong", serif' },
			{ id: "lxgw", group: "zh-kai-fang", label: "霞鹜文楷 LXGW WenKai", stack: '"LXGW WenKai", "LXGW WenKai Screen", "KaiTi", "STKaiti", serif' },
			{ id: "guwu", group: "zh-kai-fang", label: "孤鹜别体 GWBB", stack: '"孤鹜别体", "GWBB", "KaiTi", serif' },
			// ---- Chinese · display / handwriting (手写创意) ----
			{ id: "stxingkai", group: "zh-display", label: "华文行楷 STXingkai", stack: '"STXingkai", "KaiTi", "STKaiti", serif' },
			{ id: "sthupo", group: "zh-display", label: "华文琥珀 STHupo", stack: '"STHupo", "STXingkai", serif' },
			{ id: "stcaiyun", group: "zh-display", label: "华文彩云 STCaiyun", stack: '"STCaiyun", "STHupo", serif' },
			{ id: "lishu", group: "zh-display", label: "隶书 LiSu", stack: '"LiSu", "STLiti", "KaiTi", serif' },
			{ id: "fz-katong", group: "zh-display", label: "方正卡通体 FZKaiTong", stack: '"FZKaiTong-M10S", "FZKaiTong", "YouYuan", sans-serif' },
			{ id: "fz-zongyi", group: "zh-display", label: "方正综艺体 FZZongYi", stack: '"FZZongYi-M05S", "FZZongYi", "SimHei", sans-serif' },
			{ id: "fz-dao", group: "zh-display", label: "阿里巴巴刀隶体 AlibabaDaoshuTi", stack: '"AlibabaDaoshuTi", "阿里巴巴刀隶体", "LiSu", serif' },
			{ id: "hy-shangwei", group: "zh-display", label: "汉仪尚巍手书 HYShangWeiShouShu", stack: '"汉仪尚巍手书", "HYShangWeiShouShuW", "STXingkai", serif' },
			{ id: "yanshi-chunfeng", group: "zh-display", label: "演示春风楷 YSChunFengKai", stack: '"演示春风楷", "YSChunFengKai", "KaiTi", serif' },
			{ id: "muyao-suixin", group: "zh-display", label: "沐瑶随心手写体 Muyao-Softbrush", stack: '"沐瑶随心手写体", "Muyao-Softbrush", "KaiTi", serif' },
			{ id: "muyao-ruanbi", group: "zh-display", label: "沐瑶软笔手写体 Muyao-SoftPen", stack: '"沐瑶软笔手写体", "Muyao-SoftPen", "KaiTi", serif' },
			// ---- Latin · serif ----
			{ id: "times", group: "latin-serif", label: "Times New Roman", stack: '"Times New Roman", "SimSun", serif' },
			{ id: "cambria", group: "latin-serif", label: "Cambria", stack: '"Cambria", "Georgia", "SimSun", serif' },
			{ id: "georgia", group: "latin-serif", label: "Georgia", stack: '"Georgia", "Times New Roman", "SimSun", serif' },
			{ id: "garamond", group: "latin-serif", label: "Garamond", stack: '"Garamond", "EB Garamond", "SimSun", serif' },
			{ id: "palatino", group: "latin-serif", label: "Palatino Linotype", stack: '"Palatino Linotype", "Book Antiqua", "SimSun", serif' },
			{ id: "book-antiqua", group: "latin-serif", label: "Book Antiqua", stack: '"Book Antiqua", "Palatino Linotype", "Times New Roman", serif' },
			{ id: "baskerville", group: "latin-serif", label: "Baskerville", stack: '"Baskerville", "Times New Roman", "SimSun", serif' },
			{ id: "didot", group: "latin-serif", label: "Didot", stack: '"Didot", "Bodoni MT", "Times New Roman", serif' },
			{ id: "bodoni", group: "latin-serif", label: "Bodoni MT", stack: '"Bodoni MT", "Didot", "Times New Roman", serif' },
			{ id: "goudy", group: "latin-serif", label: "Goudy Old Style", stack: '"Goudy Old Style", "Times New Roman", "SimSun", serif' },
			{ id: "rockwell", group: "latin-serif", label: "Rockwell", stack: '"Rockwell", "Courier New", "Times New Roman", serif' },
			{ id: "century-schoolbook", group: "latin-serif", label: "Century Schoolbook", stack: '"Century Schoolbook", "Century", "SimSun", serif' },
			{ id: "bookman", group: "latin-serif", label: "Bookman Old Style", stack: '"Bookman Old Style", "Times New Roman", "SimSun", serif' },
			{ id: "constantia", group: "latin-serif", label: "Constantia", stack: '"Constantia", "Georgia", "SimSun", serif' },
			// ---- Latin · sans ----
			{ id: "arial", group: "latin-sans", label: "Arial", stack: '"Arial", "Helvetica Neue", "Microsoft YaHei", sans-serif' },
			{ id: "calibri", group: "latin-sans", label: "Calibri", stack: '"Calibri", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "verdana", group: "latin-sans", label: "Verdana", stack: '"Verdana", "Microsoft YaHei", sans-serif' },
			{ id: "tahoma", group: "latin-sans", label: "Tahoma", stack: '"Tahoma", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "segoe", group: "latin-sans", label: "Segoe UI", stack: '"Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif' },
			{ id: "helvetica", group: "latin-sans", label: "Helvetica", stack: '"Helvetica Neue", Helvetica, Arial, "Microsoft YaHei", sans-serif' },
			{ id: "trebuchet", group: "latin-sans", label: "Trebuchet MS", stack: '"Trebuchet MS", "Microsoft YaHei", sans-serif' },
			{ id: "futura", group: "latin-sans", label: "Futura", stack: '"Futura", "Century Gothic", "Arial", "Microsoft YaHei", sans-serif' },
			{ id: "century-gothic", group: "latin-sans", label: "Century Gothic", stack: '"Century Gothic", "Futura", "Arial", "Microsoft YaHei", sans-serif' },
			{ id: "gill-sans", group: "latin-sans", label: "Gill Sans", stack: '"Gill Sans", "Segoe UI", "Microsoft YaHei", sans-serif' },
			{ id: "franklin", group: "latin-sans", label: "Franklin Gothic", stack: '"Franklin Gothic Medium", "Franklin Gothic", "Arial", "Microsoft YaHei", sans-serif' },
			{ id: "lucida-sans", group: "latin-sans", label: "Lucida Sans", stack: '"Lucida Sans", "Lucida Grande", "Segoe UI", "Microsoft YaHei", sans-serif' },
			{ id: "candara", group: "latin-sans", label: "Candara", stack: '"Candara", "Calibri", "Segoe UI", "Microsoft YaHei", sans-serif' },
			{ id: "corbel", group: "latin-sans", label: "Corbel", stack: '"Corbel", "Segoe UI", "Microsoft YaHei", sans-serif' },
			{ id: "optima", group: "latin-sans", label: "Optima", stack: '"Optima", "Segoe UI", "Microsoft YaHei", sans-serif' },
			{ id: "avant-garde", group: "latin-sans", label: "Avant Garde", stack: '"Avant Garde", "Century Gothic", "Arial", "Microsoft YaHei", sans-serif' },
			{ id: "geneva", group: "latin-sans", label: "Geneva", stack: '"Geneva", "Tahoma", "Segoe UI", "Microsoft YaHei", sans-serif' },
			{ id: "arial-narrow", group: "latin-sans", label: "Arial Narrow", stack: '"Arial Narrow", "Arial", "Microsoft YaHei", sans-serif' },
			{ id: "bahnschrift", group: "latin-sans", label: "Bahnschrift", stack: '"Bahnschrift", "Arial", "Microsoft YaHei", sans-serif' },
			// ---- Latin · display / handwriting ----
			{ id: "comic-sans", group: "latin-display", label: "Comic Sans MS", stack: '"Comic Sans MS", "Comic Sans", "Microsoft YaHei", sans-serif' },
			{ id: "brush-script", group: "latin-display", label: "Brush Script MT", stack: '"Brush Script MT", "Segoe Script", "Segoe Print", cursive' },
			{ id: "lucida-handwriting", group: "latin-display", label: "Lucida Handwriting", stack: '"Lucida Handwriting", "Segoe Script", cursive' },
			{ id: "segoe-script", group: "latin-display", label: "Segoe Script", stack: '"Segoe Script", "Segoe Print", "Brush Script MT", cursive' },
			{ id: "segoe-print", group: "latin-display", label: "Segoe Print", stack: '"Segoe Print", "Segoe Script", cursive' },
			{ id: "copperplate", group: "latin-display", label: "Copperplate", stack: '"Copperplate", "Bodoni MT", "Times New Roman", serif' },
			{ id: "impact", group: "latin-display", label: "Impact", stack: '"Impact", "Arial Black", "Microsoft YaHei", sans-serif' },
			{ id: "arial-black", group: "latin-display", label: "Arial Black", stack: '"Arial Black", "Arial", "Microsoft YaHei", sans-serif' },
			{ id: "papyrus", group: "latin-display", label: "Papyrus", stack: '"Papyrus", "Segoe Script", cursive' }
		];

		/** Code font catalog (monospace surfaces: code blocks, terminal, JSON). */
		const CODE_FONTS = [
			{ id: "default", label: "默认", stack: null },
			{ id: "consolas", label: "Consolas", stack: '"Consolas", "Courier New", monospace' },
			{ id: "cascadia", label: "Cascadia Code", stack: '"Cascadia Code", "Cascadia Mono", Consolas, monospace' },
			{ id: "cascadia-mono", label: "Cascadia Mono", stack: '"Cascadia Mono", "Cascadia Code", Consolas, monospace' },
			{ id: "jetbrains", label: "JetBrains Mono", stack: '"JetBrains Mono", Consolas, "SF Mono", monospace' },
			{ id: "fira", label: "Fira Code", stack: '"Fira Code", Consolas, "SF Mono", monospace' },
			{ id: "fira-mono", label: "Fira Mono", stack: '"Fira Mono", Consolas, monospace' },
			{ id: "source-code-pro", label: "Source Code Pro", stack: '"Source Code Pro", Consolas, monospace' },
			{ id: "ibm-plex", label: "IBM Plex Mono", stack: '"IBM Plex Mono", Consolas, monospace' },
			{ id: "roboto-mono", label: "Roboto Mono", stack: '"Roboto Mono", Consolas, monospace' },
			{ id: "ubuntu-mono", label: "Ubuntu Mono", stack: '"Ubuntu Mono", Consolas, monospace' },
			{ id: "inconsolata", label: "Inconsolata", stack: '"Inconsolata", Consolas, monospace' },
			{ id: "hack", label: "Hack", stack: '"Hack", Consolas, monospace' },
			{ id: "droid-mono", label: "Droid Sans Mono", stack: '"Droid Sans Mono", Consolas, monospace' },
			{ id: "dejavu-mono", label: "DejaVu Sans Mono", stack: '"DejaVu Sans Mono", Consolas, monospace' },
			{ id: "liberation-mono", label: "Liberation Mono", stack: '"Liberation Mono", "Courier New", monospace' },
			{ id: "pt-mono", label: "PT Mono", stack: '"PT Mono", Consolas, monospace' },
			{ id: "space-mono", label: "Space Mono", stack: '"Space Mono", Consolas, monospace' },
			{ id: "victor-mono", label: "Victor Mono", stack: '"Victor Mono", Consolas, monospace' },
			{ id: "iosevka", label: "Iosevka", stack: '"Iosevka", Consolas, monospace' },
			{ id: "maple-mono", label: "Maple Mono", stack: '"Maple Mono", Consolas, monospace' },
			{ id: "sf-mono", label: "SF Mono", stack: '"SF Mono", "JetBrains Mono", Consolas, monospace' },
			{ id: "menlo", label: "Menlo", stack: 'Menlo, Consolas, "Courier New", monospace' },
			{ id: "monaco", label: "Monaco", stack: 'Monaco, Consolas, "Courier New", monospace' },
			{ id: "meslo", label: "Meslo", stack: '"Meslo LG S", "Meslo LG M", Consolas, monospace' },
			{ id: "courier", label: "Courier New", stack: '"Courier New", Consolas, monospace' },
			{ id: "cousine", label: "Cousine", stack: '"Cousine", Consolas, monospace' },
			{ id: "sarasa-mono", label: "更纱黑体 Sarasa Mono SC", stack: '"Sarasa Mono SC", "Sarasa Mono", "JetBrains Mono", Consolas, monospace' },
			{ id: "sarasa-term", label: "等距更纱黑体 Sarasa Term SC", stack: '"Sarasa Term SC", "Sarasa Term", "Sarasa Mono SC", Consolas, monospace' },
			{ id: "noto-mono", label: "思源等宽 Noto Sans Mono", stack: '"Noto Sans Mono", "Noto Sans Mono CJK SC", Consolas, monospace' },
			{ id: "lxgw-mono", label: "霞鹜文楷等宽 LXGW WenKai Mono", stack: '"LXGW WenKai Mono", "LXGW WenKai", "KaiTi", monospace' }
		];

		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"font.nav": "全局字体",
			"font.title": "全局字体",
			"font.desc": "界面与代码字体：界面字体作用于正文、按钮、侧边栏与标题，代码字体作用于代码块、终端与 JSON。仅使用本机已安装的字体，未安装的字体会自动回退，不影响显示。",
			"font.ui": "界面字体",
			"font.code": "代码字体",
			"font.default": "默认",
			"font.preview": "预览：设计字体 123 AaBb",
			"font.group.default": "默认",
			"font.group.zh-sans": "中文 · 黑体",
			"font.group.zh-serif": "中文 · 宋体",
			"font.group.zh-kai-fang": "中文 · 楷体仿宋",
			"font.group.zh-display": "中文 · 手写创意",
			"font.group.latin-serif": "西文 · 衬线",
			"font.group.latin-sans": "西文 · 无衬线",
			"font.group.latin-display": "西文 · 展示手写"
		};

		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"font.nav": "Fonts",
			"font.title": "Fonts",
			"font.desc": "Fonts for the UI and for code: the UI font styles body text, buttons, the sidebar and headings; the code font styles code blocks, the terminal and JSON. Only fonts installed on this machine are used — missing fonts fall back automatically.",
			"font.ui": "UI font",
			"font.code": "Code font",
			"font.default": "Default",
			"font.preview": "Preview: 设计字体 123 AaBb",
			"font.group.default": "Default",
			"font.group.zh-sans": "Chinese · Sans",
			"font.group.zh-serif": "Chinese · Serif",
			"font.group.zh-kai-fang": "Chinese · Kai / Fangsong",
			"font.group.zh-display": "Chinese · Display",
			"font.group.latin-serif": "Latin · Serif",
			"font.group.latin-sans": "Latin · Sans",
			"font.group.latin-display": "Latin · Display"
		};
		//#endregion

		//#region dsh-awesome-fonts: persistence
		/** Read a localStorage string value (null on absence or error). */
		function readStorage(key) {
			try {
				const value = window.localStorage.getItem(key);
				return typeof value === "string" ? value : null;
			} catch {
				return null;
			}
		}

		/** Write (or remove with null) a localStorage value. */
		function writeStorage(key, value) {
			try {
				if (value === null) window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, value);
			} catch {
				// storage unavailable / quota — the preference stays process-local
			}
		}

		/** Saved UI font id (validated against the catalog, default when unknown). */
		function readSavedUi() {
			const saved = readStorage(STORAGE_UI_KEY);
			return saved !== null && UI_FONTS.some((f) => f.id === saved) ? saved : DEFAULT_FONT;
		}

		/** Saved code font id (validated against the catalog, default when unknown). */
		function readSavedCode() {
			const saved = readStorage(STORAGE_CODE_KEY);
			return saved !== null && CODE_FONTS.some((f) => f.id === saved) ? saved : DEFAULT_FONT;
		}
		//#endregion

		//#region dsh-awesome-fonts: style application
		/** The injected style element (created lazily, id-keyed for HMR). */
		function getStyleEl() {
			let el = document.getElementById(STYLE_ID);
			if (el === null) {
				el = document.createElement("style");
				el.id = STYLE_ID;
				// Note: `HTMLElement.dataset` is a getter-only accessor — never
				// assign to it; mutate the returned DOMStringMap instead.
				el.dataset.plugin = PLUGIN_TAG;
				el.dataset.pluginCss = PLUGIN_CSS_TAG;
				document.head.appendChild(el);
			}
			return el;
		}

		/**
		 * Apply (or clear) the font override. Both variables are declared on
		 * `:root` by the built ui-theme base; re-declaring them must WIN the
		 * cascade, not merely come later — this <style> is appended while the
		 * plugin bundle materializes, which can be before ui-theme's base
		 * stylesheet reaches the document (ui-theme is a later boot tier), so an
		 * equal-specificity `:root` rule would lose on source order. `:root:root`
		 * (0,2,0) therefore deliberately out-specifies the base `:root` (0,1,0),
		 * and `html body` carries the declaration on the body element itself, so
		 * the body-scoped `--dsw-font-*` tokens (declared on `body` and resolving
		 * `var(--dsw-font-family)` at computed-value time there) follow the
		 * choice. `!important` keeps a later declaration from a skin or another
		 * plugin from winning on source order or specificity.
		 *
		 * The two selectors are emitted as SEPARATE rules on purpose. A selector
		 * list is discarded as a whole when any one selector in it is invalid —
		 * and `body:body` IS invalid (a type selector may appear only once in a
		 * compound selector; Chromium rejects it: `document.querySelectorAll(
		 * 'body:body')` throws "is not a valid selector", while `:root:root` is
		 * accepted). v1.0.0 shipped `:root:root, body:body { … }`, so Chromium
		 * dropped the entire rule (cssRules length 0) and the font never changed
		 * — the UI stayed fully interactive, which is exactly how the bug looked.
		 * Writing one selector per rule means a future edit to either one can
		 * never silently void the other.
		 *
		 * An empty rule set (both fonts default) leaves the built-in fonts
		 * untouched.
		 *
		 * The whole body is guarded: a non-DOM boot (tests, SSR-ish harnesses)
		 * must degrade to "no override" instead of throwing inside apply() and
		 * taking the plugin fiber down with it.
		 */
		function applyFonts(uiId, codeId) {
			if (typeof document === "undefined" || document === null) return;
			const ui = UI_FONTS.find((f) => f.id === uiId) || null;
			const code = CODE_FONTS.find((f) => f.id === codeId) || null;
			const declarations = [];
			if (ui !== null && ui.stack !== null) declarations.push(`--dsw-font-family: ${ui.stack} !important;`);
			if (code !== null && code.stack !== null) declarations.push(`--ds-font-family-code: ${code.stack} !important;`);
			getStyleEl().textContent = declarations.length === 0
				? ""
				: OVERRIDE_SELECTORS
					.map((selector) => `${selector} { ${declarations.join(" ")} }`)
					.join("\n");
		}

		/** Remove the injected style element (fiber unload). */
		function teardownStyle() {
			if (typeof document === "undefined" || document === null) return;
			document.getElementById(STYLE_ID)?.remove();
		}
		//#endregion

		//#region dsh-awesome-fonts: settings section
		/** Inline styles for the section, token-driven like the rest of the shell. */
		const styles = {
			page: {
				boxSizing: "border-box",
				width: "100%",
				maxWidth: "720px",
				color: "var(--dsw-alias-label-primary)",
				display: "flex",
				flexDirection: "column",
				gap: "12px"
			},
			heading: {
				color: "var(--dsw-alias-label-primary)",
				margin: 0,
				fontSize: "16px",
				fontWeight: 500,
				lineHeight: "24px"
			},
			desc: {
				color: "var(--dsw-alias-label-tertiary)",
				margin: 0,
				fontSize: "14px",
				lineHeight: "22px"
			},
			field: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				flexWrap: "wrap"
			},
			label: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "13px",
				whiteSpace: "nowrap",
				width: "64px"
			},
			select: {
				flex: 1,
				minWidth: "220px",
				height: "32px",
				padding: "0 10px",
				borderRadius: "8px",
				border: "1px solid var(--dsw-alias-border-l1)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				fontSize: "13px",
				font: "inherit",
				boxSizing: "border-box"
			},
			preview: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: "16px",
				lineHeight: "28px",
				padding: "8px 12px",
				borderRadius: "8px",
				background: "var(--dsw-alias-bg-layer-1)",
				border: "1px solid var(--dsw-alias-border-l1)"
			}
		};

		/**
		 * One labeled select. Options are rendered in their own font family
		 * (when the option has a stack), so the user sees a live specimen of
		 * each candidate; the preview strip below shows the actual result.
		 * Options carrying a `group` are folded into <optgroup>s (order =
		 * first appearance); options without one are rendered flat.
		 */
		function FontSelect({ label, value, options, t, onChange }) {
			const groups = [];
			const flat = [];
			for (const option of options) {
				if (option.group !== undefined) {
					let bucket = groups.find((g) => g.id === option.group);
					if (bucket === undefined) {
						bucket = { id: option.group, options: [] };
						groups.push(bucket);
					}
					bucket.options.push(option);
				} else {
					flat.push(option);
				}
			}
			const renderOption = (option) => (0, react_jsx_runtime.jsx)("option", {
				value: option.id,
				style: option.stack !== null ? { fontFamily: option.stack } : undefined,
				children: option.label
			}, option.id);
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.field,
				children: [
					(0, react_jsx_runtime.jsx)("span", { style: styles.label, children: label }),
					(0, react_jsx_runtime.jsx)("select", {
						value,
						style: styles.select,
						onChange: (event) => onChange(event.target.value),
						children: [
							flat.map(renderOption),
							groups.map((group) => (0, react_jsx_runtime.jsxs)("optgroup", {
								label: t(`font.group.${group.id}`),
								children: group.options.map(renderOption)
							}, group.id))
						]
					})
				]
			});
		}

		/**
		 * The plugin's own Settings section — the "全局字体" (Fonts) tab registered
		 * into settings.section: UI font and code font selects plus a live preview
		 * strip. Selection applies instantly and persists to localStorage.
		 */
		function FontsSection({ t, useStore, setUi, setCode }) {
			const ui = useStore((s) => s.ui);
			const code = useStore((s) => s.code);
			const uiFont = UI_FONTS.find((f) => f.id === ui) || null;
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.page,
				children: [
					(0, react_jsx_runtime.jsx)("h2", { style: styles.heading, children: t("font.title") }),
					(0, react_jsx_runtime.jsx)("p", { style: styles.desc, children: t("font.desc") }),
					(0, react_jsx_runtime.jsx)(FontSelect, {
						label: t("font.ui"),
						value: ui,
						options: UI_FONTS,
						t,
						onChange: setUi
					}),
					(0, react_jsx_runtime.jsx)(FontSelect, {
						label: t("font.code"),
						value: code,
						options: CODE_FONTS,
						t,
						onChange: setCode
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.preview,
							fontFamily: uiFont !== null && uiFont.stack !== null ? uiFont.stack : undefined
						},
						children: t("font.preview")
					})
				]
			});
		}
		//#endregion

		//#region dsh-awesome-fonts: client plugin body
		/**
		 * Required services: slots (the Settings section seat) and locale
		 * (section dictionaries). No settings transport is needed — persistence
		 * is localStorage.
		 */
		const inject = [
			"slots",
			"locale"
		];

		/**
		 * Client plugin body: restore the saved fonts, keep the section store in
		 * sync, apply on every change, and register the plugin's own Settings
		 * section — the "全局字体" (Fonts) tab — into settings.section.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			// Restore + apply once (before any user interaction).
			let uiId = readSavedUi();
			let codeId = readSavedCode();
			applyFonts(uiId, codeId);
			ctx.effect(() => teardownStyle, "dsh-awesome-fonts: style cleanup");

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh,
				en
			}), "dsh-awesome-fonts: settings section dictionaries");

			// Nav-label translator: section labels are projected through a thunk,
			// so a locale switch re-labels the nav without re-registering.
			const t = ctx.locale.bind(SETTINGS_NS);

			// Section store mirror; written only by this plugin's apply actions.
			const store = (0, _client_store.defineStore)({
				init: () => ({
					ui: DEFAULT_FONT,
					code: DEFAULT_FONT,
					revision: -1
				}),
				actions: {
					sync: (d, ui, code, revision) => {
						if (revision <= d.revision) return;
						d.ui = ui;
						d.code = code;
						d.revision = revision;
					}
				}
			});

			let revision = 0;
			let bound;
			const sync = () => {
				revision += 1;
				bound?.sync(uiId, codeId, revision);
			};

			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "dsh-awesome-fonts",
				order: 50,
				label: () => t("font.nav"),
				store,
				locale: SETTINGS_NS,
				inject: (actions) => {
					bound = actions;
					sync();
					return {
						setUi: (id) => {
							uiId = UI_FONTS.some((f) => f.id === id) ? id : DEFAULT_FONT;
							writeStorage(STORAGE_UI_KEY, uiId === DEFAULT_FONT ? null : uiId);
							applyFonts(uiId, codeId);
							sync();
						},
						setCode: (id) => {
							codeId = CODE_FONTS.some((f) => f.id === id) ? id : DEFAULT_FONT;
							writeStorage(STORAGE_CODE_KEY, codeId === DEFAULT_FONT ? null : codeId);
							applyFonts(uiId, codeId);
							sync();
						}
					};
				}
			}, FontsSection));
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.UI_FONTS = UI_FONTS;
		exports.CODE_FONTS = CODE_FONTS;
		exports.DEFAULT_FONT = DEFAULT_FONT;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

