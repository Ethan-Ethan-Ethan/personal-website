---
type: plan
status: active
project: personal-website
created: 2026-09-05
updated: 2026-09-05
tags:
  - project/personal-website
  - domain/ai-dev
  - architecture/refactor
source_exempt: true
---

# 個人網站 Site System 指令化重構設計

## 目標

將目前混合在單一 React 元件與 append-only CSS 的網站，重構為由 YAML 單一正本驅動的六類系統：**主幹、元素、功能、內容、指令、驗證**。維持現有視覺、路由、公開內容與互動行為，不在本輪重新設計首頁。

成功標準：

- `config/site-system.yaml` 是分類、command 名稱、element layer、功能依賴與驗證命令的唯一正本。
- Browser 不解析 YAML；build-time 產生帶水印與 source SHA 的 TypeScript registry。
- React interaction 只透過 Command Bus 改變 state，不直接散落呼叫多組 setter／history API。
- `scripts/site.mjs` 是 CLI 唯一主入口；既有 npm commands 保留 alias。
- `WorkspaceDesktop.tsx` 與 `workspace.css` 保留原 import path，但只作 facade／aggregator。
- CSS 每個 selector 只有一個現役定義，不再以後置 override 修補。
- 現有 Vitest、Playwright、content contract、DSH 與 Astro build 全部通過。

## 系統分類正本

### YAML 頂層

```yaml
version: 1
system:
  id: personal-website
  generated_types: src/generated/site-system.ts

trunk: {}
elements: {}
features: {}
content: {}
commands: {}
verification: {}
```

### 主幹 trunk

| ID | 責任 | 不負責 |
|---|---|---|
| `site-shell` | Astro adapter、頁面入口、資料注入 | 場景細節、互動規則 |
| `command-bus` | 驗證與 dispatch semantic command | React 視覺 rendering |
| `scene-state` | idle/projects/ai-lab/trading-lab/about | Window position |
| `window-state` | open/close/minimize/focus/move/reconcile | 場景色彩與素材 |
| `content-bridge` | PublicContent 載入與 section mapping | Vault 寫入 |

### 元素 elements

每項必須定義：`owner`、`component`、`layer`、`responsive`、`motion`、`reduced_motion`。

```text
galaxy               z=0/2  星空、星雲、流星
scene-atmosphere      z=2/3  暖光、微塵、反射
computer-foreground  z=4    遮擋背景粒子
plush-character      z=4/5  玩偶與反應光影
computer-hotspots    z=5    四個 HTML trigger
workspace-windows    z=20   浮動內容視窗
workspace-dock       z=40   視窗恢復入口
```

### 功能 features

```text
scene-preview
├── consumes scene-state
└── commands scene.preview / scene.reset

window-lifecycle
├── consumes window-state + browser-history
└── commands window.open / close / minimize / focus / move / reconcile

foreground-occlusion
├── consumes galaxy + computer-foreground + plush-character
└── invariant foreground z-index > animated sky z-index

public-content
├── consumes config/public-content.json
└── commands content.check / content.sync

responsive-fallback
├── desktop / tablet / mobile
└── WebGL unavailable / reduced-motion / no-JS
```

### 內容 content

- `projects`：跨領域精選案例。
- `ai-lab`：AI 系統、影音分析、Harness、Graphify、SearXNG。
- `trading-lab`：歷史研究與驗證邊界；禁止 live signal。
- `about`：公開 bio、技能與履歷連結。
- `articles`：Astro Content Collection；RSS/Gmail/manual 保持既有來源。

AI Lab 的網站組裝入口留在 `ai-lab/README.md`；原專案筆記維持各自 Canonical Source。

## Command Contract

### Runtime

```ts
type SiteCommand =
  | { type: 'scene.preview'; target: SceneState }
  | { type: 'scene.reset' }
  | { type: 'window.open'; id: WorkspaceWindowId; history: 'push' | 'replace' }
  | { type: 'window.close'; id: WorkspaceWindowId }
  | { type: 'window.minimize'; id: WorkspaceWindowId }
  | { type: 'window.focus'; id: WorkspaceWindowId }
  | { type: 'window.move'; id: WorkspaceWindowId; position: Point }
  | { type: 'window.reconcile'; id: WorkspaceWindowId | null };
```

Command Bus 回傳統一結果：

```ts
type CommandResult =
  | { ok: true; command: string }
  | { ok: false; command: string; code: string; message: string };
```

不合法 command、target、payload 必須 fail-closed；不得靜默忽略。

### CLI

```text
site system validate
site system generate
site command list
site content check
site content sync --dry-run
site verify unit
site verify e2e
site verify contracts
site verify build
site verify all
```

CLI 規則：

- `--help`、preflight、非零 exit code、error hint。
- 寫入命令必須支援 `--dry-run` 且使用 lock file；正常或失敗均 cleanup。
- `site.mjs` 只路由，不承載 domain logic。
- 舊 `site-content.mjs` 保留 facade，轉送至新 command handler。

## 目標檔案結構

```text
config/
├── site-system.yaml                # 分類與 command 唯一正本
├── public-content.json             # Vault 白名單
└── automation.yaml

src/
├── generated/site-system.ts        # 禁止手改；含 generated_from + SHA
├── features/workspace/
│   ├── core/
│   │   ├── command-bus.ts
│   │   ├── contracts.ts
│   │   ├── scene-state.ts
│   │   └── window-state.ts
│   ├── elements/
│   │   ├── GalaxyCanvas.tsx
│   │   ├── SceneAtmosphere.tsx
│   │   ├── ForegroundOcclusion.tsx
│   │   ├── ComputerHotspots.tsx
│   │   └── PlushCharacter.tsx
│   ├── windows/
│   │   ├── WorkspaceWindows.tsx
│   │   ├── ProjectPanel.tsx
│   │   ├── AiLabPanel.tsx
│   │   ├── TradingPanel.tsx
│   │   └── AboutPanel.tsx
│   └── WorkspaceDesktop.tsx
├── data/generated/public-content.json
└── components/workspace/           # compatibility facades

src/styles/workspace/
├── tokens.css
├── shell.css
├── scene.css
├── elements.css
├── windows.css
└── responsive.css

scripts/
├── site.mjs                        # 唯一 CLI router
├── commands/
│   ├── system.mjs
│   ├── content.mjs
│   ├── rss.mjs
│   └── verify.mjs
└── lib/site-system.mjs

verification/
├── unit/
├── e2e/
└── contracts/site-system/
```

## 相容與遷移策略

1. 先凍結現有 23 個 unit tests、主要 Playwright journeys、content contract 與首頁截圖。
2. 先建立 YAML schema、Capability Contract、golden fixtures 與 rubric；通過 `validate-rubric`、`run-case`、`run` 後才產 generator。
3. 產生 TypeScript registry；執行 drift check，手改 generated file 必須失敗。
4. 純搬移共用 contracts/state；舊路徑 re-export，現有 callers 不變。
5. 抽 Scene elements，再抽 Window panels；每一步跑相關 unit tests。
6. 建立 Command Bus，將 handlers 一個 command 一個 command 遷移。
7. CSS 依責任重寫成六個檔案；原 `workspace.css` 只保留 imports。
8. 統一 CLI；package scripts 改為 alias。
9. 將 projection 移至 generated 目錄，更新 DSH、config、tests。
10. 以 TDD 修正 article slug 與 draft filtering；此項與純搬移分開驗證。
11. 全量驗證後才提出重複素材及舊 facade 的移除／封存提案；本輪不刪除。

## L1-L7 影響矩陣

| Layer | Impact | 驗證 |
|---|---|---|
| L1 治理 | 不修改共享規則 | `git diff` 排除 AGENTS.md |
| L2 Skills | 消費 yaml-gen、cli-dag-tool、TDD、code-review | Skill boundary 人工核對 |
| L3 Hooks | 不修改 | health check 確認無 hook drift |
| L4 Scripts | 新 CLI router、generator、commands | `--help`、dry-run、unit、lock cleanup |
| L5 Vault | 個人網站 Project、AI Lab index、plan | schema、wikilink、來源連結 |
| L6 Project | React/CSS/data/assets/tests 重構 | Vitest、Playwright、Astro build |
| L7 Config | 新 site-system YAML、package aliases | YAML schema、generated drift |

## 測試與驗收

- YAML：未知 trunk/element/feature/command、重複 ID、循環 depends_on、非法 z-index 都失敗。
- Generator：輸出 deterministic，含 source SHA；修改 generated 檔後 `system validate` 失敗。
- Command Bus：每種 command 有 RED→GREEN unit test；未知 command 回傳明確 failure code。
- Scene：hover/focus/close/history 行為與重構前相同；computer/plush z-index 高於 star layers。
- Windows：drag、clamp、minimize、focus restore、Back/Forward 全通。
- Content：closed schema、安全 URL、duplicate ID、source freshness、Trading disclaimer 全通。
- Articles：manual/rss/gmail 代表 slug 可訪問；draft 不產生 route。
- Accessibility：no-JS、reduced-motion、WebGL fallback、keyboard journeys 全通。
- Final：`site verify all` 單一命令完成 unit、e2e、contracts、content、DSH、build。

## Scope / Out of Scope

**Scope**：分類、Command Bus、CLI、CSS 收斂、facade 遷移、generated registry、驗證統一、article 路徑修正。

**Out of scope**：視覺重新設計、重新生成玩偶素材、真正 cloth mesh、Gmail 雲端部署、Production push/deploy、刪除或封存既有檔案。

**Deferred**：重複 Galaxy assets、未使用 gsap dependency、舊 facade 移除。

**Revisit condition**：`site verify all` 通過且使用者完成新版視覺驗收後，再逐項提出 remove／keep／archive 提案。

## Rollback

- 修改前將目標檔案建立至 `/private/tmp/personal-site-system-pre-refactor/` 快照。
- 不執行 reset、stash、批次刪除或 archive。
- 每個階段以 facade 維持舊 import；任一步失敗可單獨恢復該階段檔案。
- 不將其他既有未提交變更加入本次 commit。

## 決策透明度

方案選擇：YAML canonical → generated TypeScript → Command Bus / CLI。

- 排除：Browser runtime 直接解析 YAML，避免增加 bundle 與解析失敗面。
- 替代：純 TypeScript registry 適合無 CLI、無生成物、無 drift gate 的小型網站。
- 路徑依賴：Future agents seeing generated TypeScript might assume it is editable source — the actual canonical source is `config/site-system.yaml`; generated output is replaceable and guarded by SHA drift validation.

## 核准修正：星空與電腦的真實景深（2026-09-06）

使用者完成本機 preview 視覺驗收後，確認「前景遮擋」的語意不是用 polygon 把星星裁掉，而是讓星空動畫實際位於電腦、玩偶與桌面物件後方。

```text
Layer 1：房間與窗外背景
Layer 2：Three.js 星空／星雲／流星
Layer 3：具 Alpha 的電腦、玩偶與桌面前景
Layer 4：HTML hotspots 與浮動視窗
```

### 素材契約

- 新增透明 Alpha 前景，不覆寫現有無 Alpha WebP，保留 rollback。
- 桌機與手機使用各自的透明前景素材，不能以桌機素材拉伸代替手機構圖。
- Alpha 必須同時包含透明與不透明像素，且尺寸與各自底圖一致。
- 電腦外殼、螢幕框、玩偶與桌緣必須保留；窗外與背景區域必須透明。
- 不再使用粗略 polygon／矩形 `clip-path` 作為電腦遮擋正本。

### 降級與驗收

- WebGL、靜態 fallback 與 `prefers-reduced-motion` 共用相同 layer order。
- 先用靜態高對比星點驗證遮擋，再開啟循環動畫。
- 自動 foreground segmentation 只可作為候選素材；必須通過人工視覺確認，否則改走精修 mask。
- 未通過桌機與手機視覺確認前，不合併 `main` 或部署 production。
