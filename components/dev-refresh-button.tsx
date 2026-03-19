"use client";

import { updateMovieData } from "@/actions/update-movie-data";
import { Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DevRefreshButton({ movieId }: { movieId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      await updateMovieData(movieId);
      toast.success("TVDB data updated");
      router.refresh();
    } catch {
      toast.error("Error getting TVDB data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="size-6 rounded grid place-items-center backdrop-blur-md backdrop-brightness-25"
      type="button"
      onClick={handleRefresh}
    >
      {isLoading ? (
        <Loader2 className="size-4 text-blue-500 animate-spin" />
      ) : (
        <RefreshCcw className="size-4 text-blue-500" />
      )}
    </button>
  );
}
