/**
 * 背景预设定义 —— 设置面板与 BackgroundLayer 共用同一份，避免两处各写一份走偏。
 *
 * 预设分两类：
 *   - 位图：直接是一个静态资源路径（三张猫娘插画）。
 *   - 弥散光（aurora）：不是单张图，而是"深色 / 浅色"两张渐变皮肤共用同一个选择值。
 *     选中后实际渲染哪一张，由当前主题（<html class="dark">）决定，用户不需要再选一次。
 *
 * @constraint 弥散光必须用 CSS 渐变而不是位图：它要随主题即时切换，位图得预载两张
 * （深色在浅色主题下白下几十 KB），而且大面积渐变用位图在深色下容易出现色带。
 * CSS 渐变零网络成本，且分辨率无关。
 */

export const AURORA_BG = "aurora";

export interface BgPreset {
  /** 存进 settings.bgImage 的值：位图是路径，弥散光是 AURORA_BG 这个哨兵值 */
  value: string;
  labelKey: string;
  /** true 表示该预设由两张渐变皮肤组成，按主题取其一 */
  aurora?: boolean;
}

export const BG_PRESETS: readonly BgPreset[] = [
  { value: "/bg/cargil-1.webp", labelKey: "settings.bgPreset1" },
  { value: "/bg/cargil-2.webp", labelKey: "settings.bgPreset2" },
  { value: "/bg/cargil-3.webp", labelKey: "settings.bgPreset3" },
  { value: AURORA_BG, labelKey: "settings.bgPreset4", aurora: true },
];

export function isAurora(value: string): boolean {
  return value === AURORA_BG;
}

/**
 * 校验背景值能否安全地塞进 <img src>。
 * @why 只放行站内相对路径、data:image/ 与弥散光哨兵值：其余（javascript:、外部域名、
 * 协议相对 //）都可能被用作脚本注入或第三方追踪。
 */
export function isSafeBgImage(url: string): boolean {
  if (isAurora(url)) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (url.startsWith("data:image/")) return true;
  return false;
}
