"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function ImportDialogTrigger() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast.error("Please select a .zip file");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

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
      setOpen(false);
      setSelectedFile(null);
      toast.success("Import started");
      router.push(`/dev/import/${slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <Upload className="size-3.5" />
          Import
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Letterboxd</DialogTitle>
          <DialogDescription>
            Export your data from Letterboxd, then upload the zip file below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <a
            href="https://letterboxd.com/data/export/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            <ExternalLink className="size-3.5" />
            Download your Letterboxd export
          </a>

          <button
            type="button"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                : selectedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
            }`}
          >
            <Upload
              className={`mb-2 size-6 ${
                selectedFile
                  ? "text-green-500"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            />
            {selectedFile ? (
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {selectedFile.name}
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Drop your zip file here
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  or click to browse
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {isUploading ? "Importing..." : "Upload & Import"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
