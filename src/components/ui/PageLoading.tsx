export function PageLoading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
