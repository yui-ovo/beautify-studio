const THEME_KEYS = ['custom_css', 'main_text_color', 'blur_tint_color', 'chat_tint_color', 'font_scale', 'blur_strength', 'avatar_style', 'chat_display'];

export function validateTheme(theme) {
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)
      || typeof theme.name !== 'string' || !theme.name.trim()
      || !THEME_KEYS.some(key => Object.hasOwn(theme, key))) {
    throw new Error('请选择 UI 美化 JSON：需要主题名称和 UI 样式字段，角色卡、世界书或模型预设不适用。');
  }
  if (theme.custom_css != null && typeof theme.custom_css !== 'string') {
    throw new Error('主题的 custom_css 必须是文本。');
  }
  return theme;
}
