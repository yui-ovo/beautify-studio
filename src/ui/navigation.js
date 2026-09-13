const libraryIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const editorIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3v18M12 3v18M19 3v18M2 8h6M9 16h6M16 9h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="5" cy="8" r="2" fill="currentColor"/><circle cx="12" cy="16" r="2" fill="currentColor"/><circle cx="19" cy="9" r="2" fill="currentColor"/></svg>';
export function workspaceNavigation(active) {
  return `<nav class="workspace-nav" aria-label="工作室页面"><button type="button" data-workspace="library"${active === 'library' ? ' aria-current="page"' : ''}>${libraryIcon}<span>美化适配</span></button><button type="button" data-workspace="editor"${active === 'editor' ? ' aria-current="page"' : ''}>${editorIcon}<span>可视化微调</span></button></nav>`;
}
