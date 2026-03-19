import { notFound } from "next/navigation";
import { getImportBySlug, getImportLogEntries } from "@/lib/queries/import-logs";
import { ImportLogViewer } from "@/components/dev/import-log-viewer";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ImportDetailPage({ params }: Props) {
  const { slug } = await params;
  const importLog = await getImportBySlug(slug);

  if (!importLog) {
    notFound();
  }

  const entries = await getImportLogEntries(importLog.id);

  return (
    <div>
      <ImportLogViewer initialLog={importLog} initialEntries={entries} slug={slug} />
    </div>
  );
}
