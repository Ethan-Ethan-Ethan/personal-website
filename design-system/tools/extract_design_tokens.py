#!/usr/bin/env python3
"""
Website Design Token Extractor using Chrome DevTools Protocol (CDP)
Extracts CSS design tokens from a website for design system analysis.

Usage:
    1. Start Chrome in debug mode:
       ~/Documents/Obsidian Vault/04_Projects/Web Access 瀏覽器自動化/launch_chrome_debug.sh

    2. Run this script:
       python3 extract_design_tokens.py https://linear.app

Output:
    YAML file with design tokens (colors, typography, spacing, etc.)
"""

import json
import sys
import yaml
from urllib.request import urlopen, Request
from urllib.error import URLError

# CDP endpoint
CDP_URL = "http://localhost:9222"

def get_ws_url():
    """Get WebSocket URL for CDP connection."""
    try:
        req = Request(f"{CDP_URL}/json/version")
        with urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return data.get("webSocketDebuggerUrl")
    except URLError as e:
        print("❌ Cannot connect to Chrome CDP")
        print("   Make sure Chrome is running in debug mode:")
        print("   ~/Documents/Obsidian Vault/04_Projects/Web Access 瀏覽器自動化/launch_chrome_debug.sh")
        sys.exit(1)

def send_command(ws_url, method, params=None):
    """Send CDP command and get response."""
    import websocket
    ws = websocket.create_connection(ws_url)
    msg_id = 1
    ws.send(json.dumps({"id": msg_id, "method": method, "params": params or {}}))
    while True:
        response = json.loads(ws.recv())
        if response.get("id") == msg_id:
            ws.close()
            return response.get("result", {})

def navigate_to_url(ws_url, url):
    """Navigate Chrome to the target URL."""
    print(f"🌐 Navigating to {url}...")
    send_command(ws_url, "Page.enable")
    send_command(ws_url, "Page.navigate", {"url": url})
    import time
    time.sleep(3)  # Wait for page load
    print("✅ Page loaded")

def extract_computed_styles(ws_url, selectors):
    """Extract computed styles for given CSS selectors."""
    print("🎨 Extracting computed styles...")

    # JavaScript to extract design tokens
    js_code = """
    (function() {
        const tokens = {
            colors: {},
            typography: {},
            spacing: {},
            shadows: {},
            borders: {}
        };

        // Extract colors from computed styles
        const colorElements = document.querySelectorAll('h1, h2, h3, p, a, button, [class*="button"], [class*="card"]');
        const colorSet = new Set();

        colorElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const colors = {
                color: styles.color,
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor
            };

            Object.values(colors).forEach(color => {
                if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
                    colorSet.add(color);
                }
            });
        });

        tokens.colors.unique = Array.from(colorSet).slice(0, 20); // Limit to 20 colors

        // Extract typography
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        tokens.typography.headings = [];

        headings.forEach((h, i) => {
            if (i < 10) { // Limit to 10 headings
                const styles = window.getComputedStyle(h);
                tokens.typography.headings.push({
                    tag: h.tagName,
                    text: h.textContent.trim().substring(0, 50),
                    fontFamily: styles.fontFamily,
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    lineHeight: styles.lineHeight,
                    letterSpacing: styles.letterSpacing
                });
            }
        });

        // Extract body text
        const bodyText = document.querySelector('p, body');
        if (bodyText) {
            const styles = window.getComputedStyle(bodyText);
            tokens.typography.body = {
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                lineHeight: styles.lineHeight,
                letterSpacing: styles.letterSpacing
            };
        }

        // Extract spacing patterns
        const spacingElements = document.querySelectorAll('div, section, article, [class*="container"], [class*="wrapper"]');
        const spacingSet = new Set();

        spacingElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const paddings = [
                styles.paddingTop,
                styles.paddingRight,
                styles.paddingBottom,
                styles.paddingLeft
            ];

            paddings.forEach(p => {
                if (p && p !== '0px') {
                    spacingSet.add(p);
                }
            });
        });

        tokens.spacing.values = Array.from(spacingSet).slice(0, 15);

        // Extract shadows
        const shadowElements = document.querySelectorAll('[class*="card"], [class*="button"], button, div');
        const shadowSet = new Set();

        shadowElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.boxShadow && styles.boxShadow !== 'none') {
                shadowSet.add(styles.boxShadow);
            }
        });

        tokens.shadows.values = Array.from(shadowSet).slice(0, 10);

        // Extract border radius
        const radiusElements = document.querySelectorAll('[class*="card"], [class*="button"], button, input, div');
        const radiusSet = new Set();

        radiusElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.borderRadius && styles.borderRadius !== '0px') {
                radiusSet.add(styles.borderRadius);
            }
        });

        tokens.borders.radius = Array.from(radiusSet).slice(0, 10);

        return tokens;
    })()
    """

    result = send_command(ws_url, "Runtime.evaluate", {
        "expression": js_code,
        "returnByValue": True
    })

    return result.get("result", {}).get("value", {})

def extract_layout_info(ws_url):
    """Extract layout information."""
    print("📐 Extracting layout info...")

    js_code = """
    (function() {
        const layout = {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            hero: null,
            sections: [],
            container: null
        };

        // Find hero section (usually first large section)
        const firstSection = document.querySelector('section, [class*="hero"], header');
        if (firstSection) {
            const rect = firstSection.getBoundingClientRect();
            const styles = window.getComputedStyle(firstSection);
            layout.hero = {
                height: rect.height + 'px',
                paddingTop: styles.paddingTop,
                paddingBottom: styles.paddingBottom,
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight,
                display: styles.display,
                alignItems: styles.alignItems,
                justifyContent: styles.justifyContent
            };
        }

        // Find all sections
        const sections = document.querySelectorAll('section, [class*="section"]');
        sections.forEach((section, i) => {
            if (i < 5) { // Limit to 5 sections
                const rect = section.getBoundingClientRect();
                layout.sections.push({
                    index: i,
                    height: rect.height + 'px',
                    paddingTop: window.getComputedStyle(section).paddingTop,
                    paddingBottom: window.getComputedStyle(section).paddingBottom
                });
            }
        });

        // Find container (max-width element)
        const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], main');
        containers.forEach(container => {
            const styles = window.getComputedStyle(container);
            if (styles.maxWidth && styles.maxWidth !== 'none') {
                layout.container = {
                    maxWidth: styles.maxWidth,
                    paddingLeft: styles.paddingLeft,
                    paddingRight: styles.paddingRight,
                    margin: styles.margin
                };
            }
        });

        return layout;
    })()
    """

    result = send_command(ws_url, "Runtime.evaluate", {
        "expression": js_code,
        "returnByValue": True
    })

    return result.get("result", {}).get("value", {})

def rgb_to_hex(rgb):
    """Convert RGB string to hex."""
    if rgb.startswith('rgb'):
        parts = rgb.replace('rgb(', '').replace(')', '').split(',')
        if len(parts) >= 3:
            r, g, b = [int(p.strip()) for p in parts[:3]]
            return f"#{r:02x}{g:02x}{b:02x}".upper()
    return rgb

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract_design_tokens.py <url>")
        print("Example: python3 extract_design_tokens.py https://linear.app")
        sys.exit(1)

    url = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "design-tokens.yaml"

    print(f"🔍 Website Design Token Extractor")
    print(f"   URL: {url}")
    print()

    # Connect to Chrome
    ws_url = get_ws_url()
    print(f"✅ Connected to Chrome CDP")

    # Navigate to URL
    navigate_to_url(ws_url, url)

    # Extract design tokens
    print()
    tokens = extract_computed_styles(ws_url, [])
    layout = extract_layout_info(ws_url)

    # Convert colors to hex
    if 'colors' in tokens and 'unique' in tokens['colors']:
        tokens['colors']['hex'] = [rgb_to_hex(c) for c in tokens['colors']['unique'] if c.startswith('rgb')]

    # Save to YAML
    output = {
        'domain': url.replace('https://', '').replace('http://', '').split('/')[0],
        'url': url,
        'viewport': layout.get('viewport', {}),
        'colors': tokens.get('colors', {}),
        'typography': tokens.get('typography', {}),
        'spacing': tokens.get('spacing', {}),
        'shadows': tokens.get('shadows', {}),
        'borders': tokens.get('borders', {}),
        'layout': {
            'hero': layout.get('hero'),
            'sections': layout.get('sections', []),
            'container': layout.get('container')
        }
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        yaml.dump(output, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

    print()
    print(f"✅ Design tokens saved to {output_file}")
    print()
    print("📊 Summary:")
    print(f"   Colors: {len(tokens.get('colors', {}).get('unique', []))}")
    print(f"   Typography: {len(tokens.get('typography', {}).get('headings', []))} headings")
    print(f"   Spacing: {len(tokens.get('spacing', {}).get('values', []))} values")
    print(f"   Shadows: {len(tokens.get('shadows', {}).get('values', []))} values")
    print(f"   Border radius: {len(tokens.get('borders', {}).get('radius', []))} values")

if __name__ == "__main__":
    main()
