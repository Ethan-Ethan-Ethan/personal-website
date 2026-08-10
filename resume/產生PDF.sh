#!/bin/bash
# 點擊此腳本自動產生 PDF
cd "$(dirname "$0")/.."
cd 履歷

OUTPUT="$HOME/Documents/Obsidian Vault/04_Projects/個人網站/resume/Ethan-Yang-正式履歷-正式版-v4.pdf"

echo "正在產生 PDF..."
cupsfilter \
    -o media=A4 \
    -o print-scaling=fit \
    -o page-left=0 \
    -o page-right=0 \
    -o page-top=0 \
    -o page-bottom=0 \
    履歷.html > "$OUTPUT" 2>/dev/null

if [ -f "$OUTPUT" ] && [ -s "$OUTPUT" ]; then
    echo "✓ PDF 已產生！"
    echo "位置：$OUTPUT"
    open "$OUTPUT"
else
    echo "✗ cupsfilter 失敗，改用瀏覽器..."
    echo ""
    echo "請用以下設定列印："
    echo "  1. 打開：履歷.html"
    echo "  2. Cmd + P"
    echo "  3. 目的地：另存為 PDF"
    echo "  4. 紙張：A4"
    echo "  5. 邊界：無 (全部設 0)"
    echo "  6. 縮放： fit to page"
    echo "  7. ✅ 背景圖形"
    open "履歷.html"
fi
