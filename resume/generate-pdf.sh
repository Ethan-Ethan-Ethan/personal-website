#!/bin/bash
# 產生 PDF 腳本
# 使用 Chrome 無頭模式將 HTML 轉成 PDF

OUTPUT="$HOME/Documents/Obsidian Vault/04_Projects/個人網站/resume/Ethan-Yang-正式履歷-正式版-v4.pdf"
HTML="$HOME/Documents/Obsidian Vault/04_Projects/個人網站/履歷/履歷.html"
TEMP_DIR="$TMPDIR/chrome-pdf-$$"

mkdir -p "$TEMP_DIR"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --disable-dev-shm-usage \
  --allow-file-access-from-files \
  --user-data-dir="$TEMP_DIR" \
  --print-to-pdf="$OUTPUT" \
  --no-pdf-header-footer \
  --virtual-time-budget=3000 \
  "file://$HTML"

rm -rf "$TEMP_DIR"

if [ -f "$OUTPUT" ]; then
    echo "✓ PDF 已產生：$OUTPUT"
    open "$OUTPUT"
else
    echo "✗ PDF 產生失敗，請改用瀏覽器列印"
    echo "  1. 打開 $HTML"
    echo "  2. Cmd + P"
    echo "  3. 目的地：另存為 PDF"
    echo "  4. 邊界：無"
    echo "  5. 選項：勾選「背景圖形」"
fi
