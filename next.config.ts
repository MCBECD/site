import type { NextConfig } from "next";
import { execSync } from "node:child_process";

/**
 * @why 构建号必须在构建期确定并内联进 bundle，不能靠客户端 fetch("/version.json")：
 * 那个文件由 CI 生成，而部署是 Cloudflare Pages 独立构建，产物里从来没有它——
 * 线上 /version.json 是 404，"关于"页的版本行因此永远不显示，还白搭一次请求。
 *
 * 取值优先级：Pages 注入的 CF_PAGES_COMMIT_SHA → 本地 git 短哈希 → 空串。
 * 都没有时留空，UI 隐藏这一行，而不是显示一个假编号。
 */
function resolveBuildId(): string {
  const fromPages = process.env.CF_PAGES_COMMIT_SHA;
  if (fromPages) return fromPages.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // @gotcha 构建环境不带 .git（例如从 tarball 构建）时 git 会失败，这里必须吞掉。
    return "";
  }
}

/**
 * @why 写回 process.env 供 layout.tsx 在**服务端**读取（渲染成 <meta>）。
 * 不走客户端 DefinePlugin 内联：实测 `env` 字段与 process.env 两条路在 App Router 的
 * 客户端 chunk 里都替换不出来，产物里搜不到这个值。服务端读 + meta 传递是确定的。
 */
process.env.NEXT_PUBLIC_BUILD_ID = resolveBuildId();

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_BUILD_ID: resolveBuildId(),
  },
};

export default nextConfig;
