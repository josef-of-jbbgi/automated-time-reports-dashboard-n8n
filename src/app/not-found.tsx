export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Page not found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}
