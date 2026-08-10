// SEO Analyzer - SEO 分析腳本
// 在瀏覽器 Console 執行此腳本來分析網站 SEO
//
// 使用方法：
// 1. 開啟目標網站
// 2. 按 F12 開啟 DevTools
// 3. 切換到 Console 標籤
// 4. 複製貼上此腳本，按 Enter 執行
// 5. 查看分析結果

(function() {
    console.log('🔍 開始分析 SEO...\n');

    const results = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        meta_tags: {},
        headings: {},
        content: {},
        links: {},
        images: {},
        technical: {},
        score: 0,
        max_score: 0,
        recommendations: []
    };

    // 1. Check meta tags
    console.log('🏷️  檢查 Meta 標籤...');
    results.max_score += 30;

    // Title
    const title = document.querySelector('title');
    if (title && title.textContent.trim()) {
        results.meta_tags.title = title.textContent.trim();
        results.meta_tags.title_length = title.textContent.trim().length;

        if (results.meta_tags.title_length >= 30 && results.meta_tags.title_length <= 60) {
            results.score += 10;
            console.log(`   ✅ 標題長度良好：${results.meta_tags.title_length} 字元`);
        } else {
            results.score += 5;
            console.log(`   ⚠️  標題長度不理想：${results.meta_tags.title_length} 字元（建議 30-60）`);
            results.recommendations.push('標題長度應該在 30-60 字元之間');
        }
    } else {
        console.log('   ❌ 缺少標題');
        results.recommendations.push('加入 descriptive 的標題標籤');
    }

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content) {
        results.meta_tags.description = metaDesc.content;
        results.meta_tags.description_length = metaDesc.content.length;

        if (results.meta_tags.description_length >= 120 && results.meta_tags.description_length <= 160) {
            results.score += 10;
            console.log(`   ✅ Meta description 長度良好：${results.meta_tags.description_length} 字元`);
        } else {
            results.score += 5;
            console.log(`   ⚠️  Meta description 長度不理想：${results.meta_tags.description_length} 字元（建議 120-160）`);
            results.recommendations.push('Meta description 長度應該在 120-160 字元之間');
        }
    } else {
        console.log('   ❌ 缺少 meta description');
        results.recommendations.push('加入 meta description 標籤');
    }

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        results.meta_tags.canonical = canonical.href;
        results.score += 5;
        console.log('   ✅ 有 canonical URL');
    } else {
        console.log('   ⚠️  缺少 canonical URL');
        results.recommendations.push('加入 canonical URL 避免重複內容');
    }

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    results.meta_tags.open_graph = {
        title: ogTitle ? ogTitle.content : null,
        description: ogDesc ? ogDesc.content : null,
        image: ogImage ? ogImage.content : null
    };

    if (ogTitle && ogDesc && ogImage) {
        results.score += 5;
        console.log('   ✅ Open Graph 標籤完整');
    } else {
        console.log('   ⚠️  Open Graph 標籤不完整');
        results.recommendations.push('補齊 Open Graph 標籤（title, description, image）');
    }

    // 2. Check headings structure
    console.log('\n📑 檢查標題結構...');
    results.max_score += 15;

    const headings = {
        h1: document.querySelectorAll('h1'),
        h2: document.querySelectorAll('h2'),
        h3: document.querySelectorAll('h3'),
        h4: document.querySelectorAll('h4'),
        h5: document.querySelectorAll('h5'),
        h6: document.querySelectorAll('h6')
    };

    results.headings = {
        h1_count: headings.h1.length,
        h2_count: headings.h2.length,
        h3_count: headings.h3.length,
        h1_texts: Array.from(headings.h1).map(h => h.textContent.trim()).slice(0, 3)
    };

    if (headings.h1.length === 1) {
        results.score += 10;
        console.log('   ✅ 只有一個 H1 標籤（最佳實踐）');
    } else if (headings.h1.length === 0) {
        console.log('   ❌ 缺少 H1 標籤');
        results.recommendations.push('加入一個 H1 標籤作為頁面主標題');
    } else {
        results.score += 5;
        console.log(`   ⚠️  有 ${headings.h1.length} 個 H1 標籤（建議只有一個）`);
        results.recommendations.push('每個頁面應該只有一個 H1 標籤');
    }

    if (headings.h2.length > 0) {
        results.score += 5;
        console.log(`   ✅ 有 ${headings.h2.length} 個 H2 標籤`);
    } else {
        console.log('   ⚠️  缺少 H2 標籤');
        results.recommendations.push('使用 H2 標籤組織內容結構');
    }

    // 3. Check content
    console.log('\n📝 檢查內容...');
    results.max_score += 20;

    const bodyText = document.body.innerText;
    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;

    results.content = {
        word_count: wordCount,
        character_count: bodyText.length
    };

    if (wordCount >= 300) {
        results.score += 15;
        console.log(`   ✅ 內容豐富：${wordCount} 字`);
    } else if (wordCount >= 150) {
        results.score += 10;
        console.log(`   ⚠️  內容普通：${wordCount} 字（建議 300+ 字）`);
        results.recommendations.push('增加更多有意義的內容（至少 300 字）');
    } else {
        results.score += 5;
        console.log(`   ⚠️  內容過少：${wordCount} 字`);
        results.recommendations.push('內容過少，需要增加更多有意義的文字');
    }

    // Check for duplicate content (simple check)
    const paragraphs = document.querySelectorAll('p');
    const uniqueTexts = new Set();
    let duplicates = 0;

    paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.length > 50) { // Only check substantial paragraphs
            if (uniqueTexts.has(text)) {
                duplicates++;
            } else {
                uniqueTexts.add(text);
            }
        }
    });

    if (duplicates === 0) {
        results.score += 5;
        console.log('   ✅ 沒有發現重複內容');
    } else {
        console.log(`   ⚠️  發現 ${duplicates} 個重複段落`);
        results.recommendations.push('移除重複的內容段落');
    }

    // 4. Check links
    console.log('\n🔗 檢查連結...');
    results.max_score += 15;

    const links = document.querySelectorAll('a');
    const internalLinks = [];
    const externalLinks = [];
    const nofollowLinks = [];

    links.forEach(link => {
        const href = link.href;
        const rel = link.rel;

        if (href.includes(window.location.hostname)) {
            internalLinks.push(href);
        } else if (href.startsWith('http')) {
            externalLinks.push(href);
            if (rel.includes('nofollow')) {
                nofollowLinks.push(href);
            }
        }
    });

    results.links = {
        total: links.length,
        internal: internalLinks.length,
        external: externalLinks.length,
        nofollow: nofollowLinks.length
    };

    if (internalLinks.length >= 3) {
        results.score += 10;
        console.log(`   ✅ 內部連結充足：${internalLinks.length} 個`);
    } else {
        results.score += 5;
        console.log(`   ⚠️  內部連結不足：${internalLinks.length} 個（建議 3+ 個）`);
        results.recommendations.push('增加更多內部連結');
    }

    // Check for descriptive link text
    let genericLinks = 0;
    links.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        if (text === 'click here' || text === 'read more' || text === 'more' || text === 'link' || text === '') {
            genericLinks++;
        }
    });

    if (genericLinks === 0) {
        results.score += 5;
        console.log('   ✅ 所有連結都有描述性文字');
    } else {
        console.log(`   ⚠️  ${genericLinks} 個連結使用通用文字（如 "click here"）`);
        results.recommendations.push('使用描述性的連結文字，避免 "click here" 或 "read more"');
    }

    // 5. Check images
    console.log('\n🖼️  檢查圖片...');
    results.max_score += 10;

    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;

    images.forEach(img => {
        if (img.alt && img.alt.trim() !== '') {
            imagesWithAlt++;
        }
    });

    results.images = {
        total: images.length,
        with_alt: imagesWithAlt
    };

    if (images.length === 0) {
        results.score += 10;
        console.log('   ✅ 無圖片');
    } else if (imagesWithAlt === images.length) {
        results.score += 10;
        console.log(`   ✅ 所有 ${images.length} 張圖片都有 alt`);
    } else {
        results.score += 5;
        console.log(`   ⚠️  ${imagesWithAlt}/${images.length} 張圖片有 alt`);
        results.recommendations.push('為所有圖片加入描述性的 alt 屬性');
    }

    // 6. Check technical SEO
    console.log('\n⚙️  檢查技術 SEO...');
    results.max_score += 10;

    // Check for robots meta
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
        results.technical.robots = robotsMeta.content;
        if (!robotsMeta.content.includes('noindex')) {
            results.score += 5;
            console.log('   ✅ 頁面可被索引');
        } else {
            console.log('   ⚠️  頁面設定為 noindex');
            results.recommendations.push('移除 noindex 設定以允許搜尋引擎索引');
        }
    } else {
        results.score += 5;
        console.log('   ✅ 沒有 robots 限制（預設可索引）');
    }

    // Check for structured data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length > 0) {
        results.technical.structured_data = true;
        results.score += 5;
        console.log(`   ✅ 有結構化資料（${structuredData.length} 個）`);
    } else {
        console.log('   ⚠️  沒有結構化資料');
        results.recommendations.push('加入結構化資料（JSON-LD）提升搜尋結果展示');
    }

    // Calculate final score
    const percentage = Math.round((results.score / results.max_score) * 100);

    // Output results
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEO 分析結果');
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
    console.log(`   標題：${results.meta_tags.title || '無'}`);
    console.log(`   Meta description：${results.meta_tags.description ? '有' : '無'}`);
    console.log(`   H1 標籤：${results.headings.h1_count} 個`);
    console.log(`   H2 標籤：${results.headings.h2_count} 個`);
    console.log(`   字數：${results.content.word_count}`);
    console.log(`   內部連結：${results.links.internal} 個`);
    console.log(`   外部連結：${results.links.external} 個`);
    console.log(`   圖片：${results.images.total} 張（${results.images.with_alt} 張有 alt）`);

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
