import { getImportLogs } from "@/lib/queries/import-logs";
import { ImportForm } from "@/components/dev/import-form";
import { ImportList } from "@/components/dev/import-list";

export const metadata = { title: "Letterboxd Import" };

export default async function ImportPage() {
  const imports = await getImportLogs();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Letterboxd Import
      </h1>
      <ImportForm />
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          Past Imports
        </h2>
        <ImportList imports={imports} />
      </div>
    </div>
  );
}
