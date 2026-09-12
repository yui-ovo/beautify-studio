# 发布到 GitHub

## 首次发布

1. 确认原脚本的分发授权，补充 LICENSE、作者和来源（参见 NOTICE.md）。
2. 运行 `npm ci`、`npm run check`。
3. 按 `VALIDATION.md` 在真实酒馆验证，更新测试记录。
4. 项目仓库为 `https://github.com/yui-ovo/beautify-studio`；如维护自己的分支，可创建另一空仓库。
5. 把本地仓库推送到自己创建的远程仓库：

```sh
git add .
git commit -m "feat: release Beautify Studio 1.0.0"
git remote add origin https://github.com/YOUR_ACCOUNT/beautify-studio.git
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```

`YOUR_ACCOUNT` 需替换成自己的账号；已有远程仓库时无需再次 `git remote add`。

## 后续版本

同步更新 `src/config.js` 的 VERSION、`package.json` 与 CHANGELOG，运行 `npm install --package-lock-only` 更新锁文件，再运行 `npm run check`。提交源码、锁文件和 dist。

CI 在 push / pull_request 上运行测试与构建。`v*` 标签触发 Release 工作流，验证标签与源码版本一致，附上 `美化工作室.json`、JS 文件和完整项目 ZIP。

Release 标注这是“标准 SillyTavern 扩展”，说明先停用旧版全局脚本。最终用户可直接粘贴 GitHub 仓库 URL 安装；旧版酒馆助手用户也可下载 JSON，无需安装 Node.js。
