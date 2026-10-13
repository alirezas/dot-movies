export default function Loading() {
  return (
    <main className="dark relative min-h-screen bg-background text-foreground">
      <section className="relative h-[85vh] min-h-[560px] w-full animate-pulse bg-muted/40">
        <div className="flex h-full max-w-2xl flex-col justify-end gap-5 px-6 pb-36 md:px-14">
          <div className="h-6 w-40 rounded-full bg-muted" />
          <div className="h-24 w-96 max-w-full rounded-md bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-32 rounded-md bg-muted" />
            <div className="h-11 w-36 rounded-md bg-muted" />
          </div>
        </div>
      </section>
    </main>
  );
}
