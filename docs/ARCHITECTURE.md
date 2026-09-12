# 架构与宿主约定

## 数据流

文件 / 已保存美化 → 结构校验 → 原始主题对象 → 风险分析 → 深拷贝转换 → 唯一命名 → 下载 / 原生导入切换 → 副本保存核实。

原始主题对象不原地修改。重复转换先剥离原兼容标记区，再写一份补丁。选项保持原 v2 存储键以迁移既有偏好，但仅接受当前选项中明确的布尔字段。

## 酒馆内美化

通过 `window.parent` / `window.top` 定位同源宿主，调用宿主 `fetch`，确保 Tauri 的本地路由接管仍生效。使用 `SillyTavern.getContext().getRequestHeaders`，缺少时走宿主 CSRF token 路径。读取 `/api/settings/get` 后只把 `themes` 返回给界面，其余设置不持久化、不日志输出、不导出。

不能使用 `getThemeObject(name)` 查找已有主题：官方实现是当前 power_user 状态的快照，仅把传入名称赋给快照。为读取某主题而临时切换当前主题同样不合适，会修改用户状态。

## 原生导入

将生成的 File 交给原生 `#ui_preset_import_file`，等待 `#themes` 中出现新名称；触发原生 change，核对当前主题和 `#custom-style` 补丁。通过 `/api/settings/get` 验证保存副本的名称与 CSS。

验证副本保存不等于验证所有角色/聊天绑定的未来行为，也不等于所有主题都完全适配。宿主负责其原有的绑定和设置持久化机制。面板在导入时暂时隐藏以让原生确认对话框可用，结束后恢复。

## 样式安全

工作台挂载在宿主 ShadowRoot 内。美化名称通过 `textContent` 写入；色块经 `CSS.supports('color', value)` 校验后写入颜色变量。不会把主题自定义 CSS 插进工作台。主题应用本身沿用酒馆原生流程。

## 上游核对来源

核对日期：2026-09-12。

- [SillyTavern power-user.js](https://github.com/SillyTavern/SillyTavern/blob/release/public/scripts/power-user.js)
- [SillyTavern settings endpoint](https://github.com/SillyTavern/SillyTavern/blob/release/src/endpoints/settings.js)
- [TauriTavern power-user.js](https://github.com/Darkatse/TauriTavern/blob/main/src/scripts/power-user.js)
- [SillyTavern 扩展上下文说明](https://docs.sillytavern.app/for-contributors/writing-extensions/)

上述接口与 DOM 是兼容约定，需随上游变化复查。
