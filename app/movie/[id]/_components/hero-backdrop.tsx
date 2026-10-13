"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

const ROTATE_MS = 8000;

export function HeroBackdrop({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === current ? alt : ""}
          fill
          sizes="100vw"
          priority={i === 0}
          className={cn(
            "object-cover object-top transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  );
}
