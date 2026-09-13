import { VERSION } from '../config.js';
const star = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C22 14 26 18 40 20C26 22 22 26 20 40C18 26 14 22 0 20C14 18 18 14 20 0Z" fill="currentColor"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const upload = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></svg>';

export function panelMarkup(detected) {
  return `<div class="backdrop" role="presentation">
    <section class="panel" role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <header class="header">
        <div class="brand-mark">${star}</div>
        <div class="titlebox"><h1 id="studio-title">美化工作室</h1><span class="wordmark">BEAUTIFY STUDIO</span></div>
        <span class="version">VOL. 01 <i>/</i> v${VERSION}</span>
        <button class="close-x icon-button" type="button" aria-label="关闭工作室">×</button>
      </header>
      <div class="body">
        <div class="masthead"><span>YOUR THEME, YOUR WAY</span><span>${star} THE STUDIO ${star}</span><span>MADE FOR TAVERN</span></div>
        <div class="intro"><span class="connection" data-connected="${detected}"><i></i>${detected ? 'TauriTavern 已连接' : '美化适配工作台'}</span></div>
        <button class="visual-edit" type="button"><span>✥</span><div><b>可视化微调</b><small>点选当前美化的头像，用手柄边看边调</small></div><span>体验新版 ↗</span></button>
        <div class="workspace">
          <section class="source-section">
            <div class="section-heading"><h3><span>01</span> 选择美化</h3><span class="caption">THE COLLECTION</span></div>
            <div class="source-card">
              <div class="source-tabs" role="tablist" aria-label="美化来源"><button type="button" id="tab-installed" role="tab" aria-controls="source-installed" aria-selected="true" data-source="installed">酒馆内的美化</button><button type="button" id="tab-upload" role="tab" aria-controls="source-upload" aria-selected="false" tabindex="-1" data-source="upload">上传 JSON</button></div>
              <div id="source-installed" role="tabpanel" aria-labelledby="tab-installed"><div class="collection-meta"><span class="library-count">正在读取美化…</span><span class="collection-actions"><button class="search-toggle icon-button" type="button" aria-label="搜索美化" aria-expanded="false">⌕</button><button class="batch-delete icon-button danger" type="button" aria-label="删除当前列表中的美化">⌫</button><button class="refresh text-button" type="button" aria-label="刷新酒馆美化列表">↻ 刷新</button></span></div><div class="theme-search" hidden><label><span class="sr-only">按名称搜索美化</span><input type="search" class="search-input" placeholder="搜索美化名称…" autocomplete="off"></label></div><div class="library" aria-label="已导入的美化"></div></div>
              <div id="source-upload" role="tabpanel" aria-labelledby="tab-upload" hidden><input class="file-input" type="file" accept=".json,application/json" hidden><button class="choose" type="button"><span class="upload-icon">${upload}</span><strong>把喜欢的美化放进来</strong><span>点击选择，或将 JSON 拖到这里</span><span class="upload-pill">选择美化文件 ${arrow}</span></button><p class="upload-note">支持 SillyTavern UI 美化 JSON · 最大 10 MB</p></div>
              <div class="selection"><span class="selection-star">${star}</span><div><span class="tiny-label">SELECTED THEME</span><div class="filename">还没有选择美化</div></div><span class="selected-indicator" aria-hidden="true">↗</span></div>
            </div>
          </section>
          <section class="settings-section"><div class="section-heading"><h3><span>02</span> 调整适配</h3><span class="caption">MAKE IT FIT</span></div><div class="settings-card"><div class="options">
            <label class="option"><span class="option-number">01</span><span><b>隐藏快速扮演按钮</b><small>隐藏墨镜黑衣人，不影响发送与角色回复。</small></span><input data-option="hideImpersonate" type="checkbox" role="switch" aria-label="隐藏快速扮演按钮"></label>
            <label class="option"><span class="option-number">02</span><span><b>保持隐藏按钮的状态</b><small>防止美化让已经隐藏的按钮重新出现。</small></span><input data-option="preserveHiddenControls" type="checkbox" role="switch" aria-label="保持隐藏按钮的状态"></label>
            <label class="option"><span class="option-number">03</span><span><b>修复布局冲突</b><small>适配聊天区域、顶部抽屉与悬浮输入栏。</small></span><input data-option="mobileGeometry" type="checkbox" role="switch" aria-label="修复布局冲突"></label>
            <label class="option"><span class="option-number">04</span><span><b>段落首行缩进</b><small>给聊天内容的每个段落增加 2em 首行缩进。</small></span><input data-option="indentParagraphs" type="checkbox" role="switch" aria-label="段落首行缩进"></label>
          </div><div class="settings-note"><span>♡</span> 保留原来的美化，所有调整写入新副本。</div></div>
          <div class="check-card"><div class="check-heading"><h3>${star} 兼容检查</h3><span class="check-count">等待选择</span></div><div class="report"><div class="risk" data-level="idle"><b>好看的开始，从选择开始</b><span>选择一款美化后，在这里查看适配建议。</span></div></div></div>
          </section>
        </div>
        <div class="bulk-modal" hidden role="dialog" aria-modal="true" aria-labelledby="bulk-title"><div class="bulk-modal-card"><div class="bulk-modal-header"><div><span class="eyebrow">THEME LIBRARY</span><h2 id="bulk-title">管理酒馆美化</h2></div><button class="bulk-close icon-button" type="button" aria-label="关闭批量管理">×</button></div><div class="bulk-toolbar"><label class="bulk-search"><span class="sr-only">搜索美化名称</span><span>⌕</span><input type="search" class="bulk-search-input" placeholder="搜索美化名称…" autocomplete="off"></label><button class="bulk-select-all text-button" type="button">全选</button></div><div class="bulk-list" role="group" aria-label="可删除的美化"></div><div class="bulk-footer"><span class="bulk-selected-count">已选 0 款</span><div><button class="bulk-cancel action" type="button">取消</button><button class="bulk-confirm-delete action danger-button" type="button" disabled>删除已选</button></div></div></div></div>
        <footer class="actions"><div class="action-buttons"><button class="action primary import-apply needs-theme" type="button" disabled>生成并应用 ${arrow}</button><div class="secondary-actions"><button class="action batch-import needs-host" type="button">批量生成并导入</button><button class="action download needs-theme" type="button" disabled>↓ 仅下载适配版</button><button class="action diagnose" type="button">布局诊断 ↗</button></div></div></footer>
        <div class="status" role="status" aria-live="polite">选择美化后即可开始。原主题会完整保留。</div>
        <div class="colophon"><span>BEAUTIFY STUDIO</span><span>WITH A LITTLE ${star} & A LOT OF CARE</span><span>美化工作室</span></div>
      </div>
    </section>
  </div>`;
}
