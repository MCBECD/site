import { notFound } from "next/navigation";

/**
 * /editor 404 桩。
 *
 * @why 编辑器在本轮重构中已彻底删除（app/editor 原本的两个文件已移除）。但 Cloudflare
 * Pages 对 HTML 默认 `s-maxage=604800`（7 天），旧构建里 `/editor/` 的 200 响应会一直
 * 在边缘缓存到 TTL 过期。不重新放一个 `/editor` 路由，CF 不会清掉这条旧缓存，用户
 * 在 7 天内仍能打开那个早该消失的编辑器页面。
 *
 * @why 这里只调用 notFound()：返回一个 404，不渲染任何编辑器 UI。源码里没有任何编辑器
 * 逻辑，只是用来让新部署包含 `/editor/` 这条路由，从而触发 CF 清掉旧缓存。
 */
export default function EditorStub() {
  notFound();
}
