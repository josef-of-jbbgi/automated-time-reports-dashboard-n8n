interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-[var(--text-muted)] text-sm font-medium">{title}</p>
      {description && (
        <p className="text-[var(--text-muted)] text-xs mt-1">{description}</p>
      )}
    </div>
  );
}
