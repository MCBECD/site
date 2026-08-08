---
Task ID: 1
Agent: main
Task: 修复设置面板动画位置偏移 + 补充内部动画

Work Log:
- 定位问题根因：CSS @keyframes panelIn 中的 transform: translate(-50%,-50%) 覆盖了 Tailwind 的 -translate-x/y-1/2
- 修改 globals.css：keyframes 从 transform+scale 改为独立 scale 属性（不干扰 translate）
- 修改 SettingsPanel.tsx：面板居中从 translate(-50%,-50%) 改为 flex wrapper（fixed inset-0 + flex center），彻底消除 transform 冲突
- 添加 collapse-in 微动画（opacity + translateY(-4px)）用于插件展开
- 添加 tab-indicator 动画（scaleX 滑入）用于 tab 下划线
- PluginCard transition-colors 改为 transition-all duration-200 让边框/背景/透明度都有过渡
- Tab 下划线添加 key prop 确保切换时重新触发动画
- 验证构建通过

Stage Summary:
- 设置面板打开/关闭不再"跑偏"
- 插件卡片展开/收起、tab 切换都有了平滑过渡动画
---
Task ID: 1-10
Agent: Main
Task: 修复主题选择器初始化 bug + 内外圆角不匹配 + 全局 squircle 连续曲率圆角

Work Log:
- 诊断主题选择器点击不灵敏问题：SSR hydration mismatch 导致 useState 初始值与 localStorage 不一致
- 修复 SettingsContext.tsx：将 useState(() => loadSettings()) 改为 useState(defaultSettings) + useEffect mount 时从 localStorage 加载
- 安装 figma-squircle 库 (npm install figma-squircle)
- 创建 useSquircle hook (hooks/useSquircle.ts)：通过 ResizeObserver + SVG clipPath 实现 squircle
- 创建 Squircle 组件 (components/Squircle.tsx)：支持 borderColor/shadow/children，clipPath 在 body 中定义
- 创建 SquircleButton 组件 (components/SquircleButton.tsx)：简化按钮的 squircle 应用
- 全局应用 squircle：Navbar 主题组/GitHub/设置按钮、设置面板外框、PluginCard、ColorThemePluginCard 预设按钮、BackgroundImagePluginCard 按钮、文档列表卡片、搜索框、DocDetail 玻璃卡片、ToggleSwitch、LocaleDropdown、设置面板内主题/字体按钮
- 移除所有旧的 rounded-lg/rounded-xl/rounded-[var(--radius)] 等标准 border-radius
- 修复 Squircle 组件的 borderColor 渲染：设置 viewBox 匹配元素尺寸，strokeWidth=2 确保边框可见
- 浏览器验证：clip-path 正确应用、主题切换器初始化修复、无视觉故障
- 部署到 https://mcbecd-site.pages.dev

Stage Summary:
- 主题选择器 bug 修复：改为 SSR-safe 默认值 + useEffect mount 时同步
- 全局 squircle：所有圆角元素使用 figma-squircle G2 连续曲率
- 内外圆角匹配：PluginCard(cornerRadius=10)、ColorThemePluginCard 预设(cornerRadius=8)、设置面板(cornerRadius=12)
- 部署成功，已验证功能正常
