export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-jsyellow border-t-transparent" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
