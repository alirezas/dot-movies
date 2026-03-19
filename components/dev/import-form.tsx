"use client";

import { Upload, Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function ImportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a zip file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/dev/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { slug } = await response.json();
      toast.success("Import started");
      router.push(`/dev/import/${slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFetch = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/dev/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "fetch" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fetch failed");
      }

      const { slug } = await response.json();
      toast.success("Fetch import started");
      router.push(`/dev/import/${slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Upload Letterboxd Export
        </h3>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200 dark:text-neutral-400 dark:file:bg-neutral-800 dark:file:text-neutral-300 dark:hover:file:bg-neutral-700"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Import
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Fetch from Letterboxd
        </h3>
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Requires LETTERBOXD_COOKIES env variable to be set
        </p>
        <button
          onClick={handleFetch}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          type="button"
        >
          {isFetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Globe className="size-4" />
          )}
          Fetch & Import
        </button>
      </div>
    </div>
  );
}
