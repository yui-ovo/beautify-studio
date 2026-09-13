# 参与维护

1. 使用 Node.js 22+，运行 `npm ci`。
2. 修改 `src/`；不要手改 `dist/`。
3. 转换规则变化需增加保护原主题、幂等性或真实失败案例的测试。
4. 运行 `npm run check`。UI 变更通过 `npm run dev` 检查桌面、窄屏、键盘和空状态。
5. 保持 `DESIGN.md` 的视觉规则，用户界面说明以中文为主。
6. 提交代码时同步提交构建产物和 `CHANGELOG.md`。

报告问题时请提供：工作室版本、酒馆与系统版本、复现步骤、预期与实际结果。可附布局诊断；发出前检查其中的主题名称与元素信息。无需提供角色聊天、API 密钥或完整酒馆设置。

浏览器回归：执行 `node scripts/build-browser-tests.mjs`，启动 `npm run dev` 后访问 `/preview/regression.html`。此测试页使用模拟聊天 DOM，不进入发布脚本。
