# 变更记录

> 覆盖 **2026-08-02 → 2026-10-18**，共 **440 个提交**（`main` 分支）。
>
> 本文件由提交历史归并生成，不是逐条罗列。归并口径：
>
> - **合并 revert 对**：改动与回退成对的，净效果为零，归入「试过又撤回的方案」而非变更项
> - **剔除手动同步合并**：30 个 `Merge branch 'main' of https://...` 不含实际变更
> - **过滤无信息提交**：`1`、`e`、`eee`、`gh`、`md`、`commit`、`build error` 等 25 个纯噪声
> - **按阶段归并**：同一目标的连续微调（如 UI 一致性审计 85 处修复）合并为一条
>
> 日期为 UTC 口径。项目实际节奏是**一次性高强度建站 + 两个月后重构**，而非持续迭代。

---

## 阶段总览

| 阶段 | 时间 | 提交 | 主线 |
|---|---|---:|---|
| P1 建站 | 08-02 ~ 08-04 | 35 | Cloudflare Pages 静态导出、文档系统、代码复制、设置面板 |
| P2 i18n 与视觉体系 | 08-07 ~ 08-09 | 95 | 7 语言 i18n、玻璃拟态、插件系统、动画系统、书签/历史 |
| P3 架构与工程化 | 08-10 ~ 08-13 | 213 | 文档子模块化、组件拆分、memo 化、代码质量、CI 并行化 |
| P4 动效与演示 | 08-14 ~ 08-18 | 84 | UI 一致性审计、字体自托管、动画调参、演示视频工具链 |
| P5 静默期 | 08-19 ~ 10-04 | 0 | 无提交 |
| P6 内容回归与治理 | 10-05 ~ 10-18 | 13 | 移除 Supabase、内容回归 Git 子模块、仓库收敛 |

---

## P1 建站（2026-08-02 ~ 08-04，35 个）

**部署路线确定**：改用静态导出（`output: export`）部署 Cloudflare Pages，引入 `@opennextjs/cloudflare` 与 wrangler 配置，配 GitHub Actions 自动部署。

**文档系统**：16 篇 Bedrock 命令文档入库；侧边栏按分类自动分组并可折叠；列表分页 8 条/页；basics 与 commands 之间建立交叉引用；移除 alias 机制。

**阅读体验**：代码块一键复制与点击复制交互；MDX 渲染向 GitHub 风格靠拢；文档详情页收敛为单张玻璃卡片。

**导航与设置**：导航栏加入组织头像与 GitHub 入口；主题切换支持 light / dark / system 三态循环；设置面板从 tab 式改为极简式，**移除 framer-motion**，改用纯 CSS 过渡（这是后续所有动效方案的前提）。

---

## P2 i18n 与视觉体系（2026-08-07 ~ 08-09，95 个）

**国际化**：一次补齐 **7 种语言**（zh-CN / zh-TW / en / ja / ko / fr / de），自建 locale 下拉（未用第三方组件）；关于页面同步 7 语言。

**视觉体系**：
- 主色由 indigo `#6366f1` 改为 blue `#3b82f6`
- 玻璃拟态：降低玻璃不透明度、提高模糊度
- 新增海拔阴影体系、模糊层级、网格底纹与落地页组件类
- 引入 G2 连续曲率圆角（Houdini Paint API）
- 视差滚动；开关与卡片浮层补进入/退出动画

**插件系统**：设置面板内可启用/禁用的插件卡片，含背景图插件（预设 + 覆盖层控制）、主题色预设与自定义取色器。

**功能**：书签、最近浏览、快速参考浮层；文档卡片展示作者与日期；置顶文章支持折叠并持久化。

**动效基调**：把全局动画压到 80–120ms，页面过渡 120ms；动画系统重写为**纯 opacity**，从过渡中移除 transform/scale（解决批量卡顿）。

---

## P3 架构与工程化（2026-08-10 ~ 08-13，213 个）

> 本阶段提交量最大（占全仓 48%），核心是把原型级代码拆成可维护结构。

**关键架构决策：`content/docs` 迁移为 Git 子模块**，指向 `MCBECD/docs`，内容与站点代码彻底解耦。此后的文档变更都以子模块指针更新体现。

**组件拆分**：
- `DocsPageClient` → `DocCard` + `DocPagination`，自身只留搜索与分页逻辑
- `DocDetailClient` → `CopyDropdown`
- `AppShell` → `BackgroundLayer`

**性能**：`DocCard` / `DocPagination` / `CopyDropdown` / `BackgroundLayer` 全部加 `React.memo`；`plainText` 计算做记忆化；减少滚动位置的过度 `localStorage` 写入。

**样式治理**：CSS 拆分为模块；用 `color-mix()` 去重主题定义；删除死 CSS 类与重复的滚动恢复逻辑。

**CI 演进**：单体 workflow 拆为并行细粒度 job → 再改为**纯 CI 检查**，部署完全交给 Cloudflare Pages 自动构建；构建产物 artifact 在 quality 与 deploy 间共享，加 Next.js 缓存。

**代码质量**：清理全部 lint warning；移除生产代码 `console.log`；中文注释转英文；整理 `package.json` 与配置文件。

**依赖升级**：TypeScript 5 → 6（target ES2024）；lucide-react 0.400 → 1.31（替换已移除的 Github 图标）；jsdom 30；lint-staged 17。

**产品决策**：品牌落地页上线后**被删除**，`/` 直接重定向到 `/docs`（理由：落地页对内容站无价值）；404 页重设计；分页状态同步到 URL（`?page=2`）；主题切换器支持手指拖拽、中点双高亮。

---

## P4 动效与演示（2026-08-14 ~ 08-18，84 个）

**UI 一致性审计**：两轮全量审计，覆盖 20 个文件、分别修复 85 处与 70 处；统一 17 个组件与样式表的 UI token；补齐触摸目标尺寸、深色模式 `--color-bg-elevated`、`--color-on-accent` 等语义变量。

**字体（走过弯路）**：先自托管 PingFang SC，因 **20MB 字体导致全站变慢**而弃用；改用 HarmonyOS Sans SC，并用 `unicode-range` 分包按需加载。

**动效调参**：spring 单次 overshoot 方案定型；修复加载时动画 double-play；设置面板 scale-in/out 与 tab 内容交错淡入；tab 指示器按左右方向位移。

**演示视频**：建 `demo-video-kit` + GitHub Actions 渲染 workflow；**放弃 Remotion**（改为真实录屏），后期用 ffmpeg 做运动补偿模糊（`minterpolate` 120fps + `tmix`），因 minterpolate 耗时过长最终回退到纯 `tmix`。

**MDX 迁移**：`.mdx` → `.md` 重构并清理遗留 import；命令块图标统一 PascalCase（修掉问号图标）。

---

## P5 静默期（2026-08-19 ~ 10-04）

无提交。期间 Dependabot 持续开 PR（next / jsdom / lucide-react / wrangler 等），绝大多数未合并。

---

## P6 内容回归与治理（2026-10-05 ~ 10-18，13 个）

**10-05**：3 个无信息提交（`gh`、`lock aHHHHH`、`aHHHHH`），无可追溯变更。

**10-17**：**移除 Supabase**，内容来源回归 Git 子模块；修复表格描边与翻页卡顿。

**10-18**：
- 清理死代码，修复分页与 404，README 拆分为三语（`README.md` / `README.en.md` / `README.zh-TW.md`）
- 修复 standards 路由在子模块缺目录时导致整站构建失败
- 子模块跟到 docs 主干
- 修掉 lychee 无效参数 `--exclude-localhost`（此前 PR 中的「修正」并未生效，每次 push 必红）
- link-check 改为仅校验 https 外链（子模块内相对链接是路由，非文件路径）
- Dependabot 配额 5 → 2，忽略 5 个对应 workflow 已删除的 action 升级
- 合并 actions/cache 4→6、react 组、linting 组

---

## 试过又撤回的方案（23 个 revert）

这一节是本文档最有价值的部分：**这些方向已经验证过，不要再走一遍**。

| 被撤回的内容 | 时间 | 结论 |
|---|---|---|
| 设置面板/标签页的 stiff fade + spring 缩放 | 08-16 | 观感僵硬，回归原始动画 |
| spring / scale 动效整体方案 | 08-16 | 只保留单次 overshoot，其余移除 |
| 「清洁细腻」入场动画组合 | 08-15 | 撤销，回到更简单的入场 |
| PingFang SC 自托管 | 08-15 | 20MB 拖垮全站，改 HarmonyOS Sans SC |
| 主色改为绿色 | 08-15 | 回退蓝色主色 |
| 快速参考浮层插件 | 08-09 | 移除插件，仅保留书签与历史 |
| segmented control 改 pill 形状 | 08-11 | 观感不符，整体撤销 |
| 7 语言 `doc.pinned/basics/commands` 翻译 | 08-10 | 批量撤销（7 个语言全撤） |
| `SettingsContext` / `storage.ts` / `lib/docs.ts` / `DocsPageClient` / 测试文件改动 | 08-10 | 全部回滚到 `c50f5129`（一次错误改动的集中清理） |
| 文档误加 `author` / `updatedAt` 字段 | 08-08 | 撤回，改为 frontmatter 统一管理 |
| Remotion 动画方案 | 08-17 | 弃用，改真实录屏 |

---

## 提交质量附录

**身份分布（site，440 个提交 / 10 种身份）**

| 次数 | 身份 | 邮箱 | 性质 |
|---:|---|---|---|
| 175 | `Z User` | `z@container` | 容器内默认身份 |
| 102 | `3-1415f` | `F3-1415f@outlook.com` | 另一台机器 |
| 158 | `DingdingOvO` | 5 个不同邮箱 | 主账号 |
| 3 | `dependabot[bot]` | — | 自动 |
| 1 | `Super Z` | `super-z@z.ai` | AI 工具 |
| 2 | `Fix Bot` / `fix-bot` | — | 机器人 |

已通过 `.mailmap` 将前 6 种归并为 `DingdingOvO` 单一身份，机器人与 AI 身份保留独立。

**信息质量**

- 440 个提交中，**129 个（29%）无规范类型前缀**
- 其中 25 个为纯噪声，无任何可追溯信息：`1`、`3`、`a`、`d`、`e`、`eee`、`gh`、`md`、`mdx`、`css`、`wi`、`单独的`、`aHHHHH`、`commit`、`just sth`、`Oh I changed sth`、`better style`、`超级大改`、`build error`（5 次）等
- 另有 30 个手动同步合并（`Merge branch 'main' of https://...`），为本地 pull 产生
- `docs` 仓库同口径：80 个提交，34 个（42%）无规范前缀，8 个手动同步合并

**回退密度**：23 个 revert / 440 提交 = 5.2%，集中在 P4 动效调参阶段（UI 抖动属正常探索成本）。

---

## 附：仓库结构约定

- 站点代码与内容分离：内容在 `MCBECD/docs` 子模块（`content/docs`），站点仓库只管代码
- 部署由 Cloudflare Pages 自动构建，CI 只做检查（lint / typecheck / test / build）
- 现有 workflow 仅两个：`ci.yml`（检查）、`link-check.yml`（外链死链，仅 https）
- Dependabot：npm 每周（配额 2）、actions 每月（配额 2）
