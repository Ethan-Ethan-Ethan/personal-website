#!/usr/bin/env bash
# 安裝本機每 5 分鐘同步投資交易 → 個人網站 trading-snapshot.json
# 用法: ./scripts/install-trading-launchd.sh [--dry-run] [--uninstall]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.ethan.personal-website-trading-sync"
DEST="$HOME/Library/LaunchAgents/${LABEL}.plist"
TEMPLATE="$ROOT/scripts/launchd/${LABEL}.plist"
NODE="$(command -v node)"

DRY=0
UNINSTALL=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY=1 ;;
    --uninstall) UNINSTALL=1 ;;
    --help)
      echo "用法: $0 [--dry-run] [--uninstall]"
      exit 0
      ;;
  esac
done

if [[ -z "$NODE" ]]; then
  echo "FAIL: node 不在 PATH" >&2
  exit 1
fi

mkdir -p "$ROOT/work/logs"

if [[ "$UNINSTALL" == 1 ]]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$DEST"
  echo "OK: uninstalled $LABEL"
  exit 0
fi

TMP="$(mktemp)"
sed -e "s|__REPO_ROOT__|$ROOT|g" "$TEMPLATE" > "$TMP"
# 使用實際 node 路徑（模板第一個 ProgramArguments）
sed -i '' "1,/<string>\\/usr\\/local\\/bin\\/node<\\/string>/s|<string>/usr/local/bin/node</string>|<string>$NODE</string>|" "$TMP" 2>/dev/null || \
  perl -pi -e "s|/usr/local/bin/node|$NODE|" "$TMP"

if [[ "$DRY" == 1 ]]; then
  echo "DRY-RUN would install to $DEST"
  cat "$TMP"
  rm -f "$TMP"
  exit 0
fi

cp "$TMP" "$DEST"
rm -f "$TMP"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$DEST"
launchctl enable "gui/$(id -u)/$LABEL"
echo "OK: installed $LABEL → $DEST"
echo "信箱預設: $ROOT/../投資交易/outputs/website-trading-signal.json"
echo "手動測: cd \"$ROOT\" && npm run trading:local-sync"
