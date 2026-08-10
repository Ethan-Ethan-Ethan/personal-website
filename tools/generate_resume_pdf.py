from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    PageBreak,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path("/Users/ethan/Documents/Obsidian Vault/04_Projects/個人網站")
OUT = ROOT / "website" / "assets" / "ethan-yang-resume.pdf"
PHOTO = Path("/Users/ethan/Downloads/Codex/2026-06-15/v-log/tmp/resume/profile.jpeg")


FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
pdfmetrics.registerFont(TTFont("ResumeFont", FONT_PATH))
FONT = "ResumeFont"


def p(text, style):
    return Paragraph(text, style)


def bullets(items, styles):
    return ListFlowable(
        [ListItem(p(item, styles["Body"]), leftIndent=0) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=12,
        bulletFontName=FONT,
        bulletFontSize=8,
        bulletColor=colors.HexColor("#28736f"),
    )


def skill_matrix_table(styles):
    data = [
        [p("<b>FAE / 客戶支援</b>", styles["Body"]), p("產品導入、量產異常、應用問題釐清、技術簡報、跨部門協調", styles["Body"])],
        [p("<b>電源設計</b>", styles["Body"]), p("Server VRD、DDR、POL、DC-DC、USB PD、Power tree、Power sequence", styles["Body"])],
        [p("<b>EMC / Layout</b>", styles["Body"]), p("EMI 輻射 / 傳導、ESD、EMI 濾波、PCB Layout review、EMC 對策", styles["Body"])],
        [p("<b>驗證 / 工具</b>", styles["Body"]), p("OrCAD、Allegro、Sigrity PowerDC / PowerSI、示波器、電子負載、GPIB", styles["Body"])],
    ]
    table = Table(data, colWidths=[35 * mm, 135 * mm])
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d9e1e8")),
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f4f7f9")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def section(title, body):
    return KeepTogether([body["heading"](title), *body["items"]])


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Name",
            fontName=FONT,
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1f2933"),
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Role",
            fontName=FONT,
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#28736f"),
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            fontName=FONT,
            fontSize=10.5,
            leading=14,
            textColor=colors.HexColor("#26323d"),
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            fontName=FONT,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#5f6b77"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="Section",
            fontName=FONT,
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1f2933"),
            spaceBefore=10,
            spaceAfter=6,
            borderWidth=0,
            borderPadding=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Job",
            fontName=FONT,
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#1f2933"),
            spaceBefore=5,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="RightSmall",
            parent=styles["Small"],
            alignment=TA_RIGHT,
        )
    )

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Ethan Yang Resume",
        author="Ethan Yang",
    )

    def heading(title):
        return p(title, styles["Section"])

    story = []

    header_left = [
        p("楊宥綸 Ethan Yang", styles["Name"]),
        p("資深 FAE / 硬體研發 / 電源與 EMC 設計", styles["Role"]),
        p("Email: isitoled@gmail.com  |  Location: 台灣  |  Website: ethanyang.dpdns.org", styles["Small"]),
        p("公開下載版：不含手機與詳細地址；正式投遞可另補完整聯絡資料。", styles["Small"]),
    ]
    if PHOTO.exists():
        photo = Image(str(PHOTO), width=24 * mm, height=30 * mm)
    else:
        photo = p("", styles["Small"])
    header = Table([[header_left, photo]], colWidths=[140 * mm, 30 * mm])
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LINEBELOW", (0, 0), (-1, -1), 0.6, colors.HexColor("#d9e1e8")),
            ]
        )
    )
    story.append(header)
    story.append(Spacer(1, 5))

    story += [
        heading("專業摘要"),
        p(
            "15+ 年硬體研發與 FAE 經驗，橫跨 EMC、Server/NB 電源設計、PCB Layout、客戶端量產支援。"
            "曾支援台達、群電、光寶、緯創、全漢等數十家客戶，參與 10+ 款 Dell Server 平台電源設計，電源轉換效率達 96-98%。"
            "開發自動化測試系統，將驗證時間縮短 50% 以上。具廈門 3 年駐點經驗。",
            styles["Body"],
        ),
    ]

    story += [
        section(
            "核心能力",
            {
                "heading": heading,
                "items": [skill_matrix_table(styles)],
            },
        ),
    ]

    jobs = [
        (
            "資深 FAE 應用工程師 | 偉詮電子 | 2020/10 - 2026/05",
            [
                "擔任重點客戶技術窗口，支援台達、群電、光寶、緯創、全漢等數十家客戶之產品導入與量產支援。",
                "協助客戶端 NPI 導入與試產驗證，協調 RD、製造、品保及業務團隊處理導入問題，平均縮短導入時程 2-3 週。",
                "處理量產異常分析，包含 OCP 燒錄不準、設備訊號異常、產線自動化流程錯誤等問題，協助釐清客戶端應用條件與產品行為。",
                "協助技術簡報、產品提案、競品比較與客戶需求回饋，支援專案爭取與產品改善。",
            ],
        ),
        (
            "研發工程師 | 雅蒂斯登 / 廈門 | 2017 - 2020",
            [
                "主導開發 2 款電源產品：自動噴水裝置控制系統、水循環系統電源模組，負責從規格定義到量產導入全流程。",
                "負責 USB PD 充電器、電源適配器等電源產品硬體開發與設計。",
                "主導 PCB Layout 設計與 EMC 對策最佳化，參與降低電磁干擾之 PCB 佈局設計方向。",
                "管理 2 人研發團隊，協調專案進度與技術指導。",
            ],
        ),
        (
            "硬體研發工程師 Power DC | 緯創資通 | 2011 - 2016",
            [
                "負責伺服器電源架構設計，涵蓋 VRD、DDR、POL、Power tree 與 Power sequence，電源轉換效率達 96-98%。",
                "使用 OrCAD / Allegro 進行 Schematic 與 PCB Layout 佈局協作，並以 Sigrity PowerDC 進行 PI/SI 驗證。",
                "執行電源時序量測、補償調校、Ripple/Transient 與穩定性驗證。",
                "開發 DC-DC 自動化量測程式，將電源驗證時間從 3-4 週縮短至 1-2 週，提升測試效率 50% 以上。",
            ],
        ),
        (
            "EMC 工程師 | 緯創資通 | 2007 - 2011",
            [
                "負責 Notebook 產品 EMC 設計與驗證，包含 EMI 輻射/傳導測試與 ESD 測試，確保產品通過 FCC、CE、BSMI 等國際認證。",
                "審查 PCB Layout，針對高速訊號與電源訊號提出 EMI 對策方案。",
                "設計 EMI 濾波電路，並在產品開發初期導入 EMC 設計考量以降低後期整改風險。",
            ],
        ),
    ]

    story.append(heading("工作經歷"))
    for title, items in jobs:
        story.append(p(title, styles["Job"]))
        story.append(bullets(items, styles))

    achievements = [
        (
            "深圳 / 台灣客戶產品導入與量產支援",
            "負責產品導入、異常分析、應用問題釐清與量產支援；協調內部 RD、製造、品保與業務團隊，將客戶現象轉化為可追蹤的內部問題與改善需求。",
        ),
        (
            "Dell Server 平台電源子系統設計",
            "參與 10+ 款 Dell Server 平台電源子系統設計，涵蓋 Grantley / Brickland 世代；負責 VR、Power tree、Power sequence、PI 驗證與 Bring-up 支援。",
        ),
        (
            "GPIB 自動化量測與電源驗證",
            "開發 GPIB 自動化量測程式，支援效率測試、抽載壓力測試與電源驗證流程，提升測試流程的一致性與可重複性。",
        ),
        (
            "EMC / PCB Layout 對策與電源產品開發",
            "具 Notebook EMC 設計驗證、EMI 濾波、ESD 測試與 Layout review 經驗；於雅蒂斯登參與 USB PD 充電器、電源適配器與 PCB Layout / EMC 對策。",
        ),
    ]

    story += [
        heading("學歷 / 其他"),
        p(
            "<b>學歷：</b>輔仁大學 電子工程碩士班 | 中華科技大學 電子工程與自動化 | 大安高工 電子科<br/>"
            "<b>證照：</b>普通駕照 / 國際駕照<br/>"
            "<b>語言：</b>中文母語；英文可支援技術文件、簡報與會議（TOEIC 成績待補）",
            styles["Body"],
        ),
    ]

    story.append(Spacer(1, 4))
    story.append(
        p(
            "註：本 PDF 為網站公開下載版；未放手機與詳細地址。",
            styles["Small"],
        )
    )

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(FONT, 8)
        canvas.setFillColor(colors.HexColor("#7b8794"))
        canvas.drawString(20 * mm, 10 * mm, "Ethan Yang Resume - Public download version")
        canvas.drawRightString(190 * mm, 10 * mm, f"Page {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT)


if __name__ == "__main__":
    main()
