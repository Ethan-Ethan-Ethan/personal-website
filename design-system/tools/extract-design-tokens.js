// Website Design Token Extractor
// 在瀏覽器 Console 執行此腳本來提取設計系統資訊
//
// 使用方法：
// 1. 開啟目標網站（例如 https://linear.app）
// 2. 按 F12 開啟 DevTools
// 3. 切換到 Console 標籤
// 4. 複製貼上此腳本，按 Enter 執行
// 5. 複製輸出的 JSON 結果

(function() {
    console.log('🔍 開始提取設計 tokens...');

    const tokens = {
        domain: window.location.hostname,
        url: window.location.href,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        colors: { unique: [], hex: [] },
        typography: { headings: [], body: null },
        spacing: { values: [] },
        shadows: { values: [] },
        borders: { radius: [] },
        layout: { hero: null, sections: [], container: null }
    };

    // Helper: RGB to Hex
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return rgb;
        const parts = rgb.replace('rgb(', '').replace(')', '').split(',');
        if (parts.length < 3) return rgb;
        const r = parseInt(parts[0].trim());
        const g = parseInt(parts[1].trim());
        const b = parseInt(parts[2].trim());
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    // 1. Extract Colors
    const colorSet = new Set();
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, [class*="button"], [class*="card"], [class*="hero"], section, div');

    elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        [styles.color, styles.backgroundColor, styles.borderColor, styles.borderTopColor, styles.borderRightColor, styles.borderBottomColor, styles.borderLeftColor].forEach(color => {
            if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && color !== 'rgb(255, 255, 255)') {
                colorSet.add(color);
            }
        });
    });

    tokens.colors.unique = Array.from(colorSet).slice(0, 30);
    tokens.colors.hex = tokens.colors.unique.map(c => rgbToHex(c)).filter(c => c.startsWith('#'));

    // 2. Extract Typography
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((h, i) => {
        if (i < 15) {
            const styles = window.getComputedStyle(h);
            tokens.typography.headings.push({
                tag: h.tagName,
                text: h.textContent.trim().substring(0, 60),
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                lineHeight: styles.lineHeight,
                letterSpacing: styles.letterSpacing,
                color: rgbToHex(styles.color)
            });
        }
    });

    const bodyText = document.querySelector('p, li, span');
    if (bodyText) {
        const styles = window.getComputedStyle(bodyText);
        tokens.typography.body = {
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            letterSpacing: styles.letterSpacing,
            color: rgbToHex(styles.color)
        };
    }

    // 3. Extract Spacing
    const spacingSet = new Set();
    const spacingElements = document.querySelectorAll('div, section, article, [class*="container"], [class*="wrapper"], [class*="section"], main, header, footer');

    spacingElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        [styles.paddingTop, styles.paddingRight, styles.paddingBottom, styles.paddingLeft,
         styles.marginTop, styles.marginRight, styles.marginBottom, styles.marginLeft].forEach(val => {
            if (val && val !== '0px' && val !== 'auto') {
                spacingSet.add(val);
            }
        });
    });

    tokens.spacing.values = Array.from(spacingSet).slice(0, 20);

    // 4. Extract Shadows
    const shadowSet = new Set();
    const shadowElements = document.querySelectorAll('[class*="card"], [class*="button"], button, [class*="shadow"], div');

    shadowElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.boxShadow && styles.boxShadow !== 'none') {
            shadowSet.add(styles.boxShadow);
        }
    });

    tokens.shadows.values = Array.from(shadowSet).slice(0, 10);

    // 5. Extract Border Radius
    const radiusSet = new Set();
    const radiusElements = document.querySelectorAll('[class*="card"], [class*="button"], button, input, [class*="badge"], [class*="tag"], div');

    radiusElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.borderRadius && styles.borderRadius !== '0px') {
            radiusSet.add(styles.borderRadius);
        }
    });

    tokens.borders.radius = Array.from(radiusSet).slice(0, 15);

    // 6. Extract Layout
    const firstSection = document.querySelector('section, [class*="hero"], header, [class*="banner"]');
    if (firstSection) {
        const rect = firstSection.getBoundingClientRect();
        const styles = window.getComputedStyle(firstSection);
        tokens.layout.hero = {
            height: Math.round(rect.height) + 'px',
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            display: styles.display,
            alignItems: styles.alignItems,
            justifyContent: styles.justifyContent
        };
    }

    const sections = document.querySelectorAll('section, [class*="section"]');
    sections.forEach((section, i) => {
        if (i < 8) {
            const rect = section.getBoundingClientRect();
            tokens.layout.sections.push({
                index: i,
                height: Math.round(rect.height) + 'px',
                paddingTop: window.getComputedStyle(section).paddingTop,
                paddingBottom: window.getComputedStyle(section).paddingBottom
            });
        }
    });

    const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], main');
    containers.forEach(container => {
        const styles = window.getComputedStyle(container);
        if (styles.maxWidth && styles.maxWidth !== 'none' && styles.maxWidth !== '0px') {
            tokens.layout.container = {
                maxWidth: styles.maxWidth,
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight,
                margin: styles.margin
            };
        }
    });

    // 7. Extract Components
    tokens.components = {
        buttons: [],
        cards: [],
        navigation: null
    };

    const buttons = document.querySelectorAll('button, [class*="button"], [role="button"], a[class*="btn"]');
    buttons.forEach((btn, i) => {
        if (i < 10) {
            const styles = window.getComputedStyle(btn);
            tokens.components.buttons.push({
                text: btn.textContent.trim().substring(0, 30),
                backgroundColor: rgbToHex(styles.backgroundColor),
                color: rgbToHex(styles.color),
                borderRadius: styles.borderRadius,
                padding: styles.padding,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight
            });
        }
    });

    const nav = document.querySelector('nav, [class*="nav"], [class*="header"], header');
    if (nav) {
        const styles = window.getComputedStyle(nav);
        tokens.components.navigation = {
            height: Math.round(nav.getBoundingClientRect().height) + 'px',
            backgroundColor: rgbToHex(styles.backgroundColor),
            position: styles.position,
            display: styles.display,
            alignItems: styles.alignItems
        };
    }

    // Output
    console.log('\n✅ 設計 tokens 提取完成！');
    console.log('📊 統計：');
    console.log(`   顏色：${tokens.colors.hex.length} 個`);
    console.log(`   字體：${tokens.typography.headings.length} 個標題`);
    console.log(`   間距：${tokens.spacing.values.length} 個值`);
    console.log(`   陰影：${tokens.shadows.values.length} 個`);
    console.log(`   圓角：${tokens.borders.radius.length} 個值`);
    console.log('\n📋 複製以下 JSON：');
    console.log(JSON.stringify(tokens, null, 2));

    // Also copy to clipboard
    try {
        copy(JSON.stringify(tokens, null, 2));
        console.log('\n✅ 已複製到剪貼板！');
    } catch(e) {
        console.log('\n⚠️  無法自動複製，請手動複製上面的 JSON');
    }

    return tokens;
})();
