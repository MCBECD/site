import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">404</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">Page not found</p>
      <Link
        href="/docs"
        className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-white
          hover:bg-[var(--color-accent-hover)] transition-colors no-underline text-sm"
      >
        Back to Docs
      </Link>
    </div>
  );
}
