import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <p className="text-6xl font-bold text-[var(--color-text-tertiary)] mb-4">404</p>
      <p className="text-sm text-[var(--color-text-tertiary)] mb-6">页面未找到</p>
      <Link
        href="/docs"
        className="text-sm text-[var(--color-accent)] hover:underline no-underline"
      >
        返回命令列表
      </Link>
    </div>
  );
}
