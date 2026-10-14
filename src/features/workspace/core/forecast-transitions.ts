/**
 * forecast-transitions.ts — forecast 疊加層過場語義唯一正本。
 * `.fc-node`／`.fc-node.is-open`（含 clip-path 終態＋reduced-motion 終態）只在此定義一次；
 * ForecastSideRail 與 ForecastGlass 皆以 FC_TRANSITION_CSS 引用，禁各自 inline 第二份。
 * 單測以 fs grep 斷言源碼單一性（見 forecast-transitions.test.ts）。
 */
export const FC_TRANSITION_CSS = [
  ".fc-node{opacity:0;visibility:hidden;transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1),clip-path .8s cubic-bezier(0.22,0.61,0.36,1),visibility 0s .7s;}",
  ".fc-node.is-open{opacity:1;visibility:visible;transform:none;clip-path:inset(0 0 0 0);transition:opacity .7s cubic-bezier(0.16,1,0.3,1),transform .7s cubic-bezier(0.16,1,0.3,1),clip-path .8s cubic-bezier(0.22,0.61,0.36,1),visibility 0s;}",
  "@media (prefers-reduced-motion: reduce){.fc-node{transition:none;transition-delay:0s !important;}.fc-node.is-open{opacity:1;visibility:visible;transform:none;clip-path:inset(0 0 0 0);}}",
].join("");
