---
type: note
status: active
created: 2026-06-16
updated: 2026-06-17
tags:
  - project/personal-website
  - project/resume
---

# 履歷 PDF 生成工具

## 用途

用 Python + reportlab 從程式碼生成履歷 PDF，不需要開啟 Word 或 InDesign。
目前有三份版本，用途不同：

| 檔案 | 輸出路徑 | 用途 |
|------|----------|------|
| `generate_resume_pdf.py` | `website/assets/ethan-yang-resume.pdf` | **公開下載版**（不放手機、詳細地址） |
| `generate_local_resume_pdf.py` | `resume/Ethan-Yang-正式履歷-正式版-v3.pdf` | **正式投遞版 V3**（2 頁，含照片，供正式投遞與評分機構使用） |
| 舊版輸出 | `resume/Ethan-Yang-正式履歷-本地版.pdf`、`resume/Ethan-Yang-正式履歷-本地版-v2.pdf` | 歷史版本，保留參考 |

## 檔案位置

```
04_Projects/個人網站/tools/
├── generate_resume_pdf.py
└── generate_local_resume_pdf.py
```

## 執行方式

```bash
cd 04_Projects/個人網站
python3 tools/generate_resume_pdf.py
python3 tools/generate_local_resume_pdf.py
```

## 相依套件

```bash
pip install reportlab
```

字型使用 macOS 內建：`/System/Library/Fonts/Supplemental/Arial Unicode.ttf`

## 照片路徑

正式投遞版 V3 引用專案內穩定照片：
```
04_Projects/個人網站/履歷/profile.jpeg
```
照片來源：從 `履歷/02_學歷證照/照片.docx` 內嵌圖片抽出。若更換正式形象照，需要覆蓋 `profile.jpeg` 或修改腳本裡的 `PHOTO` 變數。

## 兩版差異

**公開下載版（generate_resume_pdf.py）**
- 簡化版，適合放在網站上供人下載
- 不含手機號碼與詳細地址
- 底部標註「Public download version」
- 用 SimpleDocTemplate，單頁為主

**正式投遞版（generate_local_resume_pdf.py）**
- V3 為目前最新正式版，適合正式投遞與履歷評分機構使用
- 版面控制為 2 頁 A4，避免第 3 頁孤尾
- 右上角附履歷照片
- 明確拆出「硬技能矩陣」與「軟技能與協作」，提升 ATS / 評分系統辨識
- 修正學歷年份留白、移除不貼 FAE 職缺的段落、縮短未來規劃等長段內容
- 用 BaseDocTemplate + Frame，支援多頁
- 底部標註「Ethan Yang Formal Resume」

## 2026-06-17 V3 正式版更新紀錄

輸入評分報告：`~/Downloads/20260616183928.pdf`

評分重點：
- 總分 88
- 內容、硬技能、日期格式、履歷長度均通過
- 主要缺口：軟技能段落未被辨識、條列式呈現需更精簡、部分語句偏空泛

已完成修正：
- 產出正式版：`04_Projects/個人網站/resume/Ethan-Yang-正式履歷-正式版-v3.pdf`
- 輸出改為 2 頁正式投遞版
- 加入履歷照片：`04_Projects/個人網站/履歷/profile.jpeg`
- 新增「軟技能與協作」表格，列出跨部門溝通、技術簡報、問題解決
- 壓縮重複內容，移除第 3 頁孤尾
- 補齊學歷年份，移除 `年份 / 論文題目` 留白
- 移除「照片」占位字，改為實際照片

後續建議：
- 正面：用 V3 再跑一次評分機構，確認是否高於 88 分。
- 反面：目前照片是既有大頭照，衣著偏生活照；若要提升正式感，可另做襯衫或西裝版本後覆蓋 `profile.jpeg`。

## 更新履歷流程

1. 用文字編輯器打開對應的 `.py` 檔案
2. 修改 `story` 列表中的內容（文字、項目、職稱等）
3. 執行腳本重新生成 PDF
4. 公開版要記得上傳到 Cloudflare Workers（`personal-site-starter.zip`）

## 待補欄位

- LinkedIn 連結
- TOEIC 成績
- 專利正式名稱與編號（目前以方向性描述呈現）
- 量化成果數字（案數、問題件數、平台數、良率/成本/時程）

## 相關筆記

- [[Cloudflare 與 API 部署紀錄]]
- [[個人網站建置工作流程]]
- [[Personal Website MOC]]
