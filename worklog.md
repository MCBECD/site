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
