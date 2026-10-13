"use client";

import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  url: string;
  title: string;
};

const buttonClassName =
  "inline-flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black text-lg transition-colors hover:bg-white/80";

// Turn a YouTube/Vimeo watch link into an autoplaying embed URL
function toEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  let youtubeId: string | null = null;

  if (host === "youtu.be") {
    youtubeId = parsed.pathname.slice(1);
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    youtubeId =
      parsed.searchParams.get("v") ??
      parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ??
      null;
  }

  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`;
  }

  if (host === "vimeo.com") {
    const vimeoId = parsed.pathname.match(/^\/(\d+)/)?.[1];
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  }

  return null;
}

export function TrailerButton({ url, title }: Props) {
  const embedUrl = toEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={buttonClassName}
      >
        <Play className="size-5 fill-current" />
        Trailer
      </a>
    );
  }

  return (
    <Dialog>
      <DialogTrigger className={buttonClassName}>
        <Play className="size-5 fill-current" />
        Trailer
      </DialogTrigger>
      <DialogContent className="aspect-video w-full max-w-[calc(100%-2rem)] overflow-hidden border-white/10 bg-black p-0 sm:max-w-5xl [&>[data-slot=dialog-close]]:z-10 [&>[data-slot=dialog-close]]:rounded-full [&>[data-slot=dialog-close]]:bg-black/60 [&>[data-slot=dialog-close]]:p-1.5 [&>[data-slot=dialog-close]]:text-white">
        <DialogTitle className="sr-only">{title} trailer</DialogTitle>
        {/* Mounted only while open, so closing the dialog stops playback */}
        <iframe
          src={embedUrl}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full"
        />
      </DialogContent>
    </Dialog>
  );
}
