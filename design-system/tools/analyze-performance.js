// Performance Analyzer - 效能分析腳本
// 在瀏覽器 Console 執行此腳本來分析網站效能
//
// 使用方法：
// 1. 開啟目標網站
// 2. 按 F12 開啟 DevTools
// 3. 切換到 Console 標籤
// 4. 複製貼上此腳本，按 Enter 執行
// 5. 查看分析結果

(function() {
    console.log('🚀 開始分析效能...\n');

    const results = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        timing: {},
        resources: {
            total: 0,
            by_type: {},
            total_size: 0,
            largest_resources: []
        },
        images: {
            total: 0,
            lazy_loaded: 0,
            optimized: 0,
            issues: []
        },
        scripts: {
            total: 0,
            async: 0,
            defer: 0,
            total_size: 0
        },
        css: {
            total: 0,
            total_size: 0,
            inline: 0
        },
        dom: {
            nodes: 0,
            depth: 0,
            width: 0
        },
        score: 0,
        max_score: 0,
        recommendations: []
    };

    // 1. Check page load timing
    console.log('⏱️  檢查載入時間...');
    results.max_score += 20;

    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        const firstPaint = performance.getEntriesByType('paint')[0];

        results.timing = {
            load_time_ms: loadTime,
            dom_content_loaded_ms: domContentLoaded,
            first_paint_ms: firstPaint ? firstPaint.startTime : null
        };

        if (loadTime < 3000) {
            results.score += 20;
            console.log(`   ✅ 載入時間良好：${(loadTime / 1000).toFixed(2)}s`);
        } else if (loadTime < 5000) {
            results.score += 10;
            console.log(`   ⚠️  載入時間普通：${(loadTime / 1000).toFixed(2)}s`);
            results.recommendations.push('載入時間超過 3 秒，考慮優化');
        } else {
            console.log(`   ❌ 載入時間過長：${(loadTime / 1000).toFixed(2)}s`);
            results.recommendations.push('載入時間超過 5 秒，需要立即優化');
        }
    } else {
        console.log('   ℹ️  無法取得效能資料');
    }

    // 2. Check resources
    console.log('\n📦 分析資源...');
    results.max_score += 20;

    const resources = performance.getEntriesByType('resource');
    results.resources.total = resources.length;

    const byType = {};
    let totalSize = 0;

    resources.forEach(resource => {
        const type = resource.initiatorType;
        if (!byType[type]) {
            byType[type] = { count: 0, size: 0 };
        }
        byType[type].count++;
        const size = resource.transferSize || 0;
        byType[type].size += size;
        totalSize += size;

        // Track largest resources
        if (size > 100000) { // > 100KB
            results.resources.largest_resources.push({
                name: resource.name.split('/').pop().substring(0, 50),
                type: type,
                size_kb: Math.round(size / 1024)
            });
        }
    });

    results.resources.by_type = byType;
    results.resources.total_size = totalSize;

    const totalSizeKB = totalSize / 1024;
    if (totalSizeKB < 1000) {
        results.score += 20;
        console.log(`   ✅ 總資源大小良好：${totalSizeKB.toFixed(0)}KB`);
    } else if (totalSizeKB < 3000) {
        results.score += 10;
        console.log(`   ⚠️  總資源大小普通：${totalSizeKB.toFixed(0)}KB`);
        results.recommendations.push('總資源大小超過 1MB，考慮壓縮或延遲載入');
    } else {
        console.log(`   ❌ 總資源大小過大：${totalSizeKB.toFixed(0)}KB`);
        results.recommendations.push('總資源大小超過 3MB，需要立即優化');
    }

    // Sort and show largest resources
    results.resources.largest_resources.sort((a, b) => b.size_kb - a.size_kb);
    results.resources.largest_resources = results.resources.largest_resources.slice(0, 5);

    // 3. Check images
    console.log('\n🖼️  分析圖片...');
    results.max_score += 20;

    const images = document.querySelectorAll('img');
    results.images.total = images.length;
    let lazyLoaded = 0;
    let optimized = 0;

    images.forEach(img => {
        // Check lazy loading
        if (img.loading === 'lazy' || img.dataset.src || img.classList.contains('lazyload')) {
            lazyLoaded++;
        }

        // Check if using modern formats
        const src = img.src || img.dataset.src || '';
        if (src.includes('.webp') || src.includes('.avif')) {
            optimized++;
        }

        // Check dimensions
        if (!img.width && !img.height && !img.style.width && !img.style.height) {
            results.images.issues.push({
                src: src.substring(0, 50),
                issue: '未設定尺寸（會導致 CLS）'
            });
        }
    });

    results.images.lazy_loaded = lazyLoaded;
    results.images.optimized = optimized;

    const lazyPercentage = (lazyLoaded / images.length) * 100;
    if (lazyPercentage > 50) {
        results.score += 20;
        console.log(`   ✅ ${lazyLoaded}/${images.length} 張圖片使用 lazy loading`);
    } else if (lazyPercentage > 0) {
        results.score += 10;
        console.log(`   ⚠️  只有 ${lazyLoaded}/${images.length} 張圖片使用 lazy loading`);
        results.recommendations.push('更多圖片應該使用 lazy loading');
    } else if (images.length > 0) {
        console.log(`   ❌ 沒有圖片使用 lazy loading`);
        results.recommendations.push('所有圖片都應該使用 lazy loading');
    } else {
        results.score += 20;
        console.log('   ✅ 無圖片');
    }

    // 4. Check scripts
    console.log('\n📜 分析腳本...');
    results.max_score += 15;

    const scripts = document.querySelectorAll('script');
    results.scripts.total = scripts.length;
    let asyncCount = 0;
    let deferCount = 0;

    scripts.forEach(script => {
        if (script.async) asyncCount++;
        if (script.defer) deferCount++;
        if (script.src) {
            results.scripts.total_size += script.transferSize || 0;
        }
    });

    results.scripts.async = asyncCount;
    results.scripts.defer = deferCount;

    const optimizedScripts = asyncCount + deferCount;
    if (scripts.length === 0) {
        results.score += 15;
        console.log('   ✅ 無外部腳本');
    } else if (optimizedScripts / scripts.length > 0.7) {
        results.score += 15;
        console.log(`   ✅ ${optimizedScripts}/${scripts.length} 個腳本使用 async/defer`);
    } else {
        results.score += 5;
        console.log(`   ⚠️  只有 ${optimizedScripts}/${scripts.length} 個腳本使用 async/defer`);
        results.recommendations.push('更多腳本應該使用 async 或 defer 屬性');
    }

    // 5. Check CSS
    console.log('\n🎨 分析 CSS...');
    results.max_score += 10;

    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    const inlineStyles = document.querySelectorAll('style');
    results.css.total = stylesheets.length;
    results.css.inline = inlineStyles.length;

    stylesheets.forEach(stylesheet => {
        results.css.total_size += stylesheet.transferSize || 0;
    });

    if (stylesheets.length < 5) {
        results.score += 10;
        console.log(`   ✅ CSS 檔案數量良好：${stylesheets.length} 個`);
    } else {
        results.score += 5;
        console.log(`   ⚠️  CSS 檔案數量過多：${stylesheets.length} 個`);
        results.recommendations.push('考慮合併 CSS 檔案');
    }

    // 6. Check DOM size
    console.log('\n🌳 分析 DOM 大小...');
    results.max_score += 15;

    const allElements = document.querySelectorAll('*');
    results.dom.nodes = allElements.length;

    // Calculate DOM depth
    function getDepth(element) {
        let depth = 0;
        let current = element;
        while (current.parentElement) {
            depth++;
            current = current.parentElement;
        }
        return depth;
    }

    let maxDepth = 0;
    allElements.forEach(el => {
        const depth = getDepth(el);
        if (depth > maxDepth) maxDepth = depth;
    });

    results.dom.depth = maxDepth;

    if (results.dom.nodes < 1500) {
        results.score += 15;
        console.log(`   ✅ DOM 節點數量良好：${results.dom.nodes} 個`);
    } else if (results.dom.nodes < 3000) {
        results.score += 7;
        console.log(`   ⚠️  DOM 節點數量普通：${results.dom.nodes} 個`);
        results.recommendations.push('DOM 節點超過 1500 個，考慮簡化頁面結構');
    } else {
        console.log(`   ❌ DOM 節點數量過多：${results.dom.nodes} 個`);
        results.recommendations.push('DOM 節點超過 3000 個，需要立即優化');
    }

    // Calculate final score
    const percentage = Math.round((results.score / results.max_score) * 100);

    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('📊 效能分析結果');
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
    console.log(`   載入時間：${results.timing.load_time_ms ? (results.timing.load_time_ms / 1000).toFixed(2) + 's' : 'N/A'}`);
    console.log(`   總資源大小：${(results.resources.total_size / 1024).toFixed(0)}KB`);
    console.log(`   圖片數量：${results.images.total}（lazy: ${results.images.lazy_loaded}）`);
    console.log(`   腳本數量：${results.scripts.total}（async: ${results.scripts.async}, defer: ${results.scripts.defer}）`);
    console.log(`   CSS 檔案：${results.css.total}`);
    console.log(`   DOM 節點：${results.dom.nodes}（深度：${results.dom.depth}）`);

    if (results.resources.largest_resources.length > 0) {
        console.log('\n📦 最大資源：');
        results.resources.largest_resources.forEach(resource => {
            console.log(`   - ${resource.name} (${resource.type}): ${resource.size_kb}KB`);
        });
    }

    if (results.recommendations.length > 0) {
        console.log('\n💡 建議：');
        results.recommendations.forEach(rec => {
            console.log(`   - ${rec}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 分析完成！');
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
