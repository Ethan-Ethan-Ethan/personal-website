tell application "Google Chrome"
    activate
    open location "file:///Users/ethan/Documents/Obsidian%20Vault/04_Projects/%E5%80%8B%E4%BA%BA%E7%B6%B2%E7%AB%99/%E5%B1%A5%E6%AD%B7/%E5%B1%A5%E6%AD%B7.html"
    delay 2
    tell application "System Events"
        keystroke "p" using command down
        delay 1
    end tell
end tell
