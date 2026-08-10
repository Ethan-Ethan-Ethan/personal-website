// Accessibility Checker - 無障礙性檢查腳本
// 在瀏覽器 Console 執行此腳本來檢查網站的無障礙性
//
// 使用方法：
// 1. 開啟目標網站
// 2. 按 F12 開啟 DevTools
// 3. 切換到 Console 標籤
// 4. 複製貼上此腳本，按 Enter 執行
// 5. 查看檢查結果

(function() {
    console.log('🔍 開始檢查無障礙性...\n');

    const results = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        checks: {
            color_contrast: { status: 'unknown', issues: [] },
            keyboard_navigation: { status: 'unknown', issues: [] },
            images: { status: 'unknown', issues: [] },
            forms: { status: 'unknown', issues: [] },
            headings: { status: 'unknown', issues: [] },
            links: { status: 'unknown', issues: [] },
            aria: { status: 'unknown', issues: [] }
        },
        score: 0,
        max_score: 0
    };

    // Helper: Calculate relative luminance
    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    // Helper: Calculate contrast ratio
    function getContrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // Helper: Parse RGB color
    function parseRGB(color) {
        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return null;
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }

    // 1. Check color contrast (sample check)
    console.log('📊 檢查色彩對比度...');
    results.max_score += 20;

    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, li');
    let contrastIssues = 0;
    let checked = 0;

    textElements.forEach(el => {
        if (checked >= 50) return; // Sample 50 elements max
        const styles = window.getComputedStyle(el);
        const fgColor = parseRGB(styles.color);
        const bgColor = parseRGB(styles.backgroundColor);

        if (fgColor && bgColor) {
            const fgLum = getLuminance(fgColor.r, fgColor.g, fgColor.b);
            const bgLum = getLuminance(bgColor.r, bgColor.g, bgColor.b);
            const ratio = getContrastRatio(fgLum, bgLum);

            if (ratio < 4.5) {
                contrastIssues++;
                results.checks.color_contrast.issues.push({
                    element: el.tagName,
                    text: el.textContent.substring(0, 30),
                    contrast_ratio: ratio.toFixed(2),
                    required: 4.5
                });
            }
            checked++;
        }
    });

    if (contrastIssues === 0) {
        results.checks.color_contrast.status = 'pass';
        results.score += 20;
        console.log('   ✅ 色彩對比度良好');
    } else {
        results.checks.color_contrast.status = 'fail';
        console.log(`   ⚠️  發現 ${contrastIssues} 個對比度問題`);
    }

    // 2. Check keyboard navigation
    console.log('\n⌨️  檢查鍵盤導航...');
    results.max_score += 20;

    const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    let hasFocusStyles = false;

    focusableElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.outline !== 'none' || styles.boxShadow !== 'none') {
            hasFocusStyles = true;
        }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]');
    if (skipLinks.length > 0) {
        results.score += 10;
        console.log('   ✅ 有跳過導覽連結');
    } else {
        results.checks.keyboard_navigation.issues.push({
            issue: '缺少 skip navigation link'
        });
        console.log('   ⚠️  缺少 skip navigation link');
    }

    if (hasFocusStyles) {
        results.score += 10;
        results.checks.keyboard_navigation.status = 'pass';
        console.log('   ✅ 有焦點樣式');
    } else {
        results.checks.keyboard_navigation.status = 'fail';
        results.checks.keyboard_navigation.issues.push({
            issue: '焦點樣式不明顯'
        });
        console.log('   ⚠️  焦點樣式不明顯');
    }

    // 3. Check images
    console.log('\n🖼️  檢查圖片...');
    results.max_score += 20;

    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;

    images.forEach(img => {
        if (img.alt && img.alt.trim() !== '') {
            imagesWithAlt++;
        } else {
            imagesWithoutAlt++;
            results.checks.images.issues.push({
                src: img.src.substring(0, 50),
                issue: '缺少 alt 屬性'
            });
        }
    });

    if (imagesWithoutAlt === 0) {
        results.score += 20;
        results.checks.images.status = 'pass';
        console.log(`   ✅ 所有 ${images.length} 張圖片都有 alt`);
    } else {
        results.checks.images.status = 'fail';
        console.log(`   ⚠️  ${imagesWithoutAlt}/${images.length} 張圖片缺少 alt`);
    }

    // 4. Check forms
    console.log('\n📝 檢查表單...');
    results.max_score += 20;

    const formElements = document.querySelectorAll('input, select, textarea');
    let formsWithLabels = 0;
    let formsWithoutLabels = 0;

    formElements.forEach(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
        const hasPlaceholder = input.placeholder;

        if (hasLabel || hasAriaLabel) {
            formsWithLabels++;
        } else {
            formsWithoutLabels++;
            results.checks.forms.issues.push({
                type: input.type,
                name: input.name,
                issue: '缺少標籤'
            });
        }
    });

    if (formElements.length === 0) {
        results.score += 20;
        results.checks.forms.status = 'pass';
        console.log('   ✅ 無表單元素');
    } else if (formsWithoutLabels === 0) {
        results.score += 20;
        results.checks.forms.status = 'pass';
        console.log(`   ✅ 所有 ${formElements.length} 個表單元素都有標籤`);
    } else {
        results.checks.forms.status = 'fail';
        console.log(`   ⚠️  ${formsWithoutLabels}/${formElements.length} 個表單元素缺少標籤`);
    }

    // 5. Check headings
    console.log('\n📑 檢查標題結構...');
    results.max_score += 10;

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingIssues = 0;
    let lastLevel = 0;

    headings.forEach(h => {
        const level = parseInt(h.tagName[1]);
        if (level > lastLevel + 1 && lastLevel > 0) {
            headingIssues++;
            results.checks.headings.issues.push({
                element: h.tagName,
                text: h.textContent.substring(0, 30),
                issue: '跳過標題層級'
            });
        }
        lastLevel = level;
    });

    if (headingIssues === 0) {
        results.score += 10;
        results.checks.headings.status = 'pass';
        console.log('   ✅ 標題結構正確');
    } else {
        results.checks.headings.status = 'fail';
        console.log(`   ⚠️  發現 ${headingIssues} 個標題層級問題`);
    }

    // 6. Check links
    console.log('\n🔗 檢查連結...');
    results.max_score += 10;

    const links = document.querySelectorAll('a');
    let emptyLinks = 0;

    links.forEach(link => {
        const text = link.textContent.trim();
        const ariaLabel = link.getAttribute('aria-label');
        if (!text && !ariaLabel) {
            emptyLinks++;
            results.checks.links.issues.push({
                href: link.href.substring(0, 50),
                issue: '連結缺少文字'
            });
        }
    });

    if (emptyLinks === 0) {
        results.score += 10;
        results.checks.links.status = 'pass';
        console.log(`   ✅ 所有 ${links.length} 個連結都有文字`);
    } else {
        results.checks.links.status = 'fail';
        console.log(`   ⚠️  ${emptyLinks}/${links.length} 個連結缺少文字`);
    }

    // 7. Check ARIA
    console.log('\n🏷️  檢查 ARIA 標籤...');
    results.max_score += 10;

    const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
    if (ariaElements.length > 0) {
        results.score += 10;
        results.checks.aria.status = 'pass';
        console.log(`   ✅ 發現 ${ariaElements.length} 個 ARIA 元素`);
    } else {
        results.checks.aria.status = 'unknown';
        console.log('   ℹ️  未發現 ARIA 元素（可能不需要）');
    }

    // Calculate final score
    const percentage = Math.round((results.score / results.max_score) * 100);

    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('📊 無障礙性檢查結果');
    console.log('='.repeat(60));
    console.log(`\n總分：${results.score}/${results.max_score} (${percentage}%)`);
    console.log(`\n评级：`);
    if (percentage >= 90) {
        console.log('   ✅ 優秀 (A)');
    } else if (percentage >= 75) {
        console.log('   ⚠️  良好 (B)');
    } else if (percentage >= 60) {
        console.log('   ⚠️  需要改進 (C)');
    } else {
        console.log('   ❌ 不及格 (D)');
    }

    console.log('\n📋 詳細結果：');
    Object.entries(results.checks).forEach(([key, value]) => {
        const statusIcon = value.status === 'pass' ? '✅' : value.status === 'fail' ? '❌' : '⚠️';
        console.log(`   ${statusIcon} ${key}: ${value.status}`);
        if (value.issues.length > 0) {
            value.issues.slice(0, 3).forEach(issue => {
                console.log(`      - ${issue.issue || issue.text || JSON.stringify(issue)}`);
            });
            if (value.issues.length > 3) {
                console.log(`      ... 還有 ${value.issues.length - 3} 個問題`);
            }
        }
    });

    console.log('\n💡 建議：');
    if (results.checks.color_contrast.status === 'fail') {
        console.log('   - 提高文字和背景的對比度（至少 4.5:1）');
    }
    if (results.checks.keyboard_navigation.status === 'fail') {
        console.log('   - 加入明顯的焦點樣式');
        console.log('   - 加入 skip navigation link');
    }
    if (results.checks.images.status === 'fail') {
        console.log('   - 為所有圖片加入描述性的 alt 屬性');
    }
    if (results.checks.forms.status === 'fail') {
        console.log('   - 為所有表單元素加入標籤');
    }
    if (results.checks.headings.status === 'fail') {
        console.log('   - 修正標題層級，不要跳過層級');
    }
    if (results.checks.links.status === 'fail') {
        console.log('   - 為所有連結加入描述性文字');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 檢查完成！');
    console.log('\n📋 複製以下 JSON 結果：');
    console.log(JSON.stringify(results, null, 2));

    try {
        copy(JSON.stringify(results, null, 2));
        console.log('\n✅ 已複製到剪貼板！');
    } catch(e) {
        console.log('\n⚠️  無法自動複製，請手動複製上面的 JSON');
    }

    return results;
})();
