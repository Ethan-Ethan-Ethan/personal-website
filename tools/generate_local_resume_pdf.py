from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path("/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站")
OUT_DIR = ROOT / "resume"
OUT = OUT_DIR / "Ethan-Yang-正式履歷-正式版-v3.pdf"
PHOTO = ROOT / "履歷" / "profile.jpeg"
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

pdfmetrics.registerFont(TTFont("ResumeFont", FONT_PATH))
FONT = "ResumeFont"
PAGE_W, PAGE_H = A4
CONTENT_W = PAGE_W - 40 * mm

NAVY = colors.HexColor("#17324d")
TEAL = colors.HexColor("#1f6f68")
DEEP_TEAL = colors.HexColor("#4db8ad")  # 日期區塊底色，淺綠色
INK = colors.HexColor("#23313d")
MUTED = colors.HexColor("#637182")
LINE = colors.HexColor("#cbd5df")
SOFT = colors.HexColor("#f3f6f8")
TAG = colors.HexColor("#e6f1ef")


def make_style(name, size, leading, color=INK, space_after=0, alignment=TA_LEFT):
    return ParagraphStyle(
        name=name,
        fontName=FONT,
        fontSize=size,
        leading=leading,
        textColor=color,
        spaceAfter=space_after,
        alignment=alignment,
    )


S = {
    "name": make_style("name", 22, 26, NAVY, 2),
    "role": make_style("role", 10.5, 13, TEAL, 4),
    "contact": make_style("contact", 9, 12, colors.white, 0),
    "h": make_style("heading", 12.5, 15, colors.HexColor("#1e3c72"), 4),
    "sub": make_style("sub", 9.8, 12.5, TEAL, 3),
    "body": make_style("body", 9.2, 12, INK, 3),
    "small": make_style("small", 8.3, 10.5, MUTED, 1),
    "label": make_style("label", 9, 12, MUTED, 0),
    "value": make_style("value", 8.8, 11.3, INK, 0),
    "job": make_style("job", 10.6, 13, colors.HexColor("#2a5298"), 1),
    "date": make_style("date", 8, 10, TEAL, 0, TA_CENTER),
    "date_inv": make_style("date_inv", 8, 10, colors.HexColor("#1f6f68"), 0, TA_CENTER),
}


def p(text, style="body"):
    return Paragraph(text, S[style])


def bullet_list(items, color=colors.HexColor("#667eea")):
    return ListFlowable(
        [ListItem(p(item), leftIndent=0) for item in items],
        bulletType="bullet",
        leftIndent=10,
        bulletFontName=FONT,
        bulletFontSize=6.8,
        bulletColor=color,
        spaceAfter=3,
    )


def bullet_paras(items):
    return [p(f'<font color="#667eea">▸</font> {item}', "body") for item in items]


def clean_table(data, widths, bg=None):
    table = Table(data, colWidths=widths, hAlign="LEFT")
    style = [
        ("FONTNAME", (0, 0), (-1, -1), FONT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
    ]
    if bg:
        style.append(("BACKGROUND", (0, 0), (-1, -1), bg))
    table.setStyle(TableStyle(style))
    return table


def section(title):
    return KeepTogether(
        [
            Spacer(1, 4),
            Table(
                [[p(f"<b>{title}</b>", "h")]],
                colWidths=[CONTENT_W],
                style=[
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.8, LINE),
                ],
            ),
            Spacer(1, 2),
        ]
    )


def header_block():
    contact = Table(
        [
            [
                p("手機 0976-168-586", "contact"),
                p("Email isitoled@gmail.com", "contact"),
                p("所在地 台灣", "contact"),
            ]
        ],
        colWidths=[45 * mm, 65 * mm, 35 * mm],
    )
    contact.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )

    left = [
        p("楊宥綸 Ethan Yang", "name"),
        p("資深 FAE / 硬體研發 / 電源與 EMC 設計", "role"),
        contact,
            Spacer(1, 2),
        p("目標職務：資深 FAE / 應用工程師 / 電源與硬體系統技術支援", "small"),
        p("目標產業：IC 原廠、伺服器 / 電源產品、ODM/OEM 客戶技術支援", "small"),
    ]
    if PHOTO.exists():
        photo = Image(str(PHOTO), width=24 * mm, height=30 * mm)
    else:
        photo = p("", "small")

    table = Table([[left, photo]], colWidths=[135 * mm, 35 * mm])
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def info_grid():
    rows = [
        [p("LinkedIn / 個人網站", "label"), p("https://ethanyang.dpdns.org", "value"), p("可到職日", "label"), p("錄取後 4 週內", "value")],
        [p("希望地點", "label"), p("台灣；可配合長期外派泰國/越南/深圳/華南", "value"), p("英文程度", "label"), p("TOEIC 600，可進行技術簡報與會議", "value")],
        [p("期望職級", "label"), p("資深 FAE / 應用工程師", "value"), p("量化成果", "label"), p("80+ 件/年、導入 -33%、問題 -35%、良率 92%→97%", "value")],
    ]
    return clean_table(rows, [32 * mm, 68 * mm, 30 * mm, 50 * mm], SOFT)


def summary_box():
    text = (
        "15+ 年硬體研發與 FAE 經驗，涵蓋伺服器電源架構（VRD、DC-DC、Power tree、Power sequence）、"
        "EMC 對策、NPI 導入、Bring-up、量產異常分析與客戶技術支援。具備電路設計、PCB Layout review、"
        "RCA/8D、良率改善與跨部門協作能力；曾廈門駐點 3 年並支援亞洲客戶，可配合海外出差與長期外派。"
    )
    box = Table([[p(text, "body")]], colWidths=[CONTENT_W])
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return box


def content_box(text):
    """通用內容文本框"""
    box = Table([[p(text, "body")]], colWidths=[CONTENT_W])
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return box


def skill_matrix():
    rows = [
        [p("FAE / IC 支援", "label"), p("Field Application Support、IC 原廠技術支援、NPI 導入、Bring-up 支援、失效分析、量產支援、技術簡報、跨部門協調", "value")],
        [p("電源設計", "label"), p("Server VRD、DDR、POL、DC-DC、USB PD、Power tree、Power sequence", "value")],
        [p("EMC / Layout", "label"), p("EMI 輻射 / 傳導、ESD、EMI 濾波、PCB Layout review、EMC 對策", "value")],
        [p("驗證 / 自動化", "label"), p("OrCAD、Allegro、Sigrity PowerDC / PowerSI、示波器、電子負載、GPIB 自動化量測、Python 測試輔助", "value")],
    ]
    return clean_table(rows, [40 * mm, 140 * mm], None)


def soft_skill_matrix():
    rows = [
        [p("跨部門溝通", "label"), p("協調 RD、QA、製造、業務與客戶工程團隊，將現場問題轉成可追蹤的 RCA/8D 行動項；曾帶領 2 人研發團隊並支援跨廠區案件。", "value")],
        [p("技術簡報", "label"), p("以中文與英文進行產品導入、異常說明、教育訓練與客戶技術會議。", "value")],
        [p("問題解決", "label"), p("結合量測、失效分析、製程條件與應用線路檢查，推動良率改善與重複問題預防。", "value")],
    ]
    return clean_table(rows, [40 * mm, 140 * mm], None)


def blank_text_box(lines=4, label=""):
    if label:
        rows = [[p(label, "body")]] + [[p(" ", "body")] for _ in range(lines - 1)]
    else:
        rows = [[p(" ", "body")] for _ in range(lines)]
    table = Table(rows, colWidths=[CONTENT_W], rowHeights=[9 * mm] * lines)
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.55, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#e2e8ef")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def job_block(title, company, period, items):
    card = Table(
        [
            [[p(f"<b>{title}</b>", "job"), p(company, "small")], p(period, "date_inv")],
            [bullet_paras(items), ""],
        ],
        colWidths=[130 * mm, 40 * mm],
    )
    card.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.65, LINE),
                ("BACKGROUND", (0, 0), (0, 0), SOFT),
                ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#f0f4f5")),  # 淺灰背景，不搶眼
                ("SPAN", (0, 1), (1, 1)),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("VALIGN", (1, 0), (1, 0), "MIDDLE"),  # 日期單獨置中
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LINEBELOW", (0, 0), (-1, 0), 0.45, LINE),
            ]
        )
    )
    return KeepTogether([card, Spacer(1, 5)])


def project_block(title, role, period, detail):
    card = Table(
        [
            [[p(f"<b>{title}</b>", "job"), p(role, "small")], p(period, "date_inv")],
            [p(detail, "body"), ""],
        ],
        colWidths=[130 * mm, 40 * mm],
    )
    card.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.65, LINE),
                ("BACKGROUND", (0, 0), (0, 0), SOFT),
                ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#f0f4f5")),
                ("SPAN", (0, 1), (1, 1)),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("VALIGN", (1, 0), (1, 0), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, 0), (-1, 0), 0.45, LINE),
            ]
        )
    )
    return KeepTogether([card, Spacer(1, 5)])


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(20 * mm, 12 * mm, PAGE_W - 20 * mm, 12 * mm)
    canvas.setFont(FONT, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 7 * mm, "Ethan Yang Formal Resume")
    canvas.drawRightString(PAGE_W - 20 * mm, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title="Ethan Yang Formal Resume",
        author="Ethan Yang",
    )
    frame = Frame(20 * mm, 15 * mm, PAGE_W - 40 * mm, PAGE_H - 30 * mm, showBoundary=0)
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_page)])

    story = [header_block()]

    story += [section("個人摘要"), summary_box()]
    story += [section("目標職務與核心價值")]
    story.append(
        bullet_list(
            [
                "<b>目標職務：</b>資深 FAE / 應用工程師，負責 IC、電源產品與硬體系統之客戶技術支援。",
                "<b>核心價值：</b>以量測、失效分析與跨部門協作縮短問題定位時間，推動 NPI、試產與量產問題閉環。",
                "<b>量化成果：</b>年度支援 80+ 件、導入時程 -33%、重複問題 -35%、主要客戶良率 92%→97%。",
                "<b>海外能力：</b>廈門 3 年駐點，長期支援亞洲客戶，可用英文進行技術簡報與會議。",
            ]
        )
    )
    story += [section("基本資料與補充欄位"), info_grid()]
    story += [section("重點成果")]
    story.append(
        bullet_list(
            [
                "擔任亞洲區 IC 原廠技術窗口，負責電源 IC 產品導入、異常分析與量產支援。",
                "深圳駐點期間協助台灣團隊處理客戶技術問題，推動跨部門協調與問題閉環。",
                "完成 15+ 款 Dell Server 平台電源架構設計（VRD、DDR、POL），涵蓋 Intel Grantley/Haswell 與 AMD 平台。",
                "主導客戶端新產品從開發到量產之全程技術支援，將新產品導入時程由 12 週縮短至 8 週（-33%）。",
                "建立 RCA/8D 報告機制，使重複性問題發生率下降 35%，協助主要客戶將良率由 92% 提升至 97%。",
                "開發 GPIB 自動化量測程式，將電源驗證時間由 3-4 週縮短至 1-2 週。",
            ]
        )
    )
    story += [section("硬技能矩陣"), skill_matrix()]
    story += [section("軟技能與協作"), soft_skill_matrix()]

    story += [section("工作經歷")]
    story.append(
        job_block(
            "資深 FAE 應用工程師",
            "偉詮電子股份有限公司",
            "2020/10 - 至今",
            [
                "擔任亞洲區 IC 原廠技術窗口，負責亞洲地區客戶之電源 IC 產品導入、異常分析與量產支援，年度支援案件超過 80 件。",
                "主導客戶端 NPI 導入與試產驗證，與 RD、製造、品保及業務團隊協作，將新產品導入時程由 12 週縮短至 8 週（-33%）。",
                "處理量產異常、客訴與退貨分析，建立 RCA/8D 報告機制，使重複性問題發生率下降 35%。",
                "針對客戶製程與應用條件進行參數優化，協助主要客戶將良率由 92% 提升至 97%。",
                "定期至海外客戶現場提供故障排除、設備調校、產品驗證與教育訓練，以英文進行技術簡報與會議。",
                "深圳駐點期間，除負責個人案件外，主動協助台灣同仁處理客戶技術問題，跨部門協調並成功解決所有專案問題。",
                "與工廠及總部技術團隊協作，建立 troubleshooting 流程，縮短現場問題回應時間 40%。",
                "協助業務團隊進行技術簡報、產品提案與競品分析，成功導入 3 個新客戶平台案。",
            ],
        )
    )
    story.append(
        job_block(
            "研發工程師",
            "雅蒂斯登 Addtistn / 廈門",
            "2017 - 2020",
            [
                "設計電源產品硬體開發，包括 USB PD 充電器、電源適配器。",
                "開發降低電磁干擾之 PCB 佈局技術，透過優化 MOSFET 佈局位置降低 EMI 輻射 3-5dB，解決產品認證問題。",
                "帶領 2 人研發團隊，協調專案進度與技術指導，按期交付產品。",
            ],
        )
    )
    story.append(
        job_block(
            "硬體研發工程師 Power DC",
            "緯創資通 Wistron / 台灣",
            "2011 - 2016",
            [
                "完成 15+ 款 Dell Server 平台電源架構設計（VRD、DDR、POL），涵蓋 Intel Grantley/Haswell 與 AMD 平台。",
                "建立 Power tree 規劃與驗證流程，確保多電源軌架構最佳化。",
                "設計 Power sequence 時序控制，支援平台 Bring-up 與系統整合驗證。",
                "使用 OrCAD 繪製 Vcore/DDR/POL 電源線路圖，並以 Allegro 進行 PCB Layout 佈局。",
                "使用 Sigrity PowerDC 進行 PI/SI 模擬驗證，並開發 GPIB 自動化量測程式提升驗證效率。",
                "帶領 2 人團隊，按期完成專案里程碑。",
            ],
        )
    )
    story.append(
        job_block(
            "EMC 工程師",
            "緯創資通 Wistron / 台灣",
            "2007 - 2011",
            [
                "負責 Notebook 產品 EMC 設計與驗證（Intel Sandy Bridge 平台），確保通過 FCC、CE、BSMI 認證。",
                "審查 PCB Layout，針對高速訊號與電源訊號提出 EMI 對策方案。",
                "設計 EMI 濾波電路（OrCAD），執行 EMI 輻射/傳導測試（EN55022）與 ESD 測試（EN61000-4-2）。",
                "與設計團隊協作，在產品開發初期導入 EMC 考量，降低後期整改成本與週期。",
            ],
        )
    )

    story += [section("學歷")]
    story.append(
        clean_table(
            [
                [p("輔仁大學", "label"), p("電子工程碩士班學分班；2014 - 2016", "value")],
                [p("中華科技大學", "label"), p("電子工程與自動化學士；2007 - 2011", "value")],
                [p("大安高工", "label"), p("電子科；2003 - 2005", "value")],
            ],
            [40 * mm, 140 * mm],
            None,
        )
    )

    story += [section("證照 / 專利 / 語言")]
    story.append(
        clean_table(
            [
                [p("證照", "label"), p("普通駕照 / 國際駕照", "value")],
                [p("語言", "label"), p("中文母語；英文 TOEIC 600，可進行技術簡報、會議與海外客戶溝通", "value")],
            ],
            [40 * mm, 140 * mm],
            None,
        )
    )

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    main()
