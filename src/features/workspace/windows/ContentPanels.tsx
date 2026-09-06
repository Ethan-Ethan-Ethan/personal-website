import { useState } from 'react';
import type { ArticleLink, PublicContent } from '../core/contracts';
import type { WorkspaceWindowId } from '../core/window-state';

function ProjectCards({ items }: { items: PublicContent[] }) {
  return <div className="project-grid">{items.map((item) => <article className="project-card" key={item.id}>
    <div className="card-meta"><span>{item.status}</span><time>{item.updatedAt}</time></div>
    <h3>{item.title}</h3><p>{item.summary}</p>
    {item.highlights.length > 0 && <ul>{item.highlights.slice(0, 3).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
    <div className="tag-row">{item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
    {(item.demoUrl || item.repoUrl) && <div className="card-links">
      {item.demoUrl && <a href={item.demoUrl}>查看成果 ↗</a>}{item.repoUrl && <a href={item.repoUrl}>Repository ↗</a>}
    </div>}
  </article>)}</div>;
}

function TradingPanel({ items }: { items: PublicContent[] }) {
  const [consented, setConsented] = useState(false);
  return <>
    <div className="window-intro"><span>RESEARCH, NOT SIGNALS</span><p>用歷史資料、回放與驗證邊界檢查交易想法；這裡不提供即時訊號或投資建議。</p></div>
    <div className="market-frame">{consented ? <iframe title="BTCUSDT market overview" src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=D&theme=dark&style=1&locale=zh_TW&hideideas=1" loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups" /> : <div className="market-consent"><span>第三方市場圖表</span><p>載入後瀏覽器會直接連線 TradingView。你也可以跳過，直接閱讀研究摘要。</p><button type="button" onClick={() => setConsented(true)}>Load TradingView</button></div>}</div>
    <ProjectCards items={items}/><a className="primary-link" href="/trading/">開啟完整研究圖表 →</a>
  </>;
}

export default function ContentPanel({ id, content, recentArticles }: { id: WorkspaceWindowId; content: PublicContent[]; recentArticles: ArticleLink[] }) {
  if (id === 'projects') return <><div className="window-intro"><span>SELECTED WORK</span><p>從問題、方法到可驗證成果，這些是目前最能代表我的系統作品。</p></div><ProjectCards items={content.filter((item) => item.section === 'projects' || item.featured).slice(0, 6)} /></>;
  if (id === 'ai-lab') return <>
    <div className="window-intro"><span>AI SYSTEMS</span><p>研究如何讓 Agent、知識與多媒體分析變得可測試、可組合，也能持續改進。</p></div>
    <ProjectCards items={content.filter((item) => item.section === 'ai-lab')} />
    <section className="window-link-section"><h3>Field notes</h3><div className="article-list">{recentArticles.slice(0, 4).map((article) => <a href={article.href} key={article.href}><span>{article.category || 'Article'}</span>{article.title}</a>)}</div><a className="text-link" href="/articles/">瀏覽全部文章 →</a><a className="text-link" href="/protected/vlog">進入 AI Vlog →</a></section>
  </>;
  if (id === 'trading-lab') return <TradingPanel items={content.filter((item) => item.section === 'trading-lab')} />;
  return <>
    <div className="about-layout"><div className="about-orbit" aria-hidden="true"><span>EY</span></div><div><span className="about-kicker">AI SYSTEM BUILDER</span><h3>在工程現場、AI 與知識系統之間搭橋。</h3><p>我把長期硬體與 FAE 經驗帶進 AI 系統設計，專注於可驗證的 Agent、知識圖譜、影音理解與研究工具。比起只展示結果，我更重視系統如何留下證據、處理失敗並持續演化。</p><div className="skill-cloud">{['Agent Systems','Evaluation','Knowledge Graph','Swift','Astro','Trading Research','Automation','Technical Writing'].map((skill) => <span key={skill}>{skill}</span>)}</div></div></div>
    <div className="contact-panel"><div><span>CONTACT</span><strong>公開聯絡信箱設定中</strong><p>私人履歷信箱與手機不會顯示於公開網站。</p></div><a href="/resume">查看公開履歷 →</a></div>
  </>;
}
