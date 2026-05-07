"use client";

import { useState } from "react";

type PostGalleryProps = {
  images: string[];
  altBase: string;
  fullBleed?: boolean;
};

export function PostGallery({ images, altBase, fullBleed = false }: PostGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={fullBleed ? "h-full w-full" : "p-2"}>
      <div className="relative h-full">
        <div
          className={`hide-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth ${fullBleed ? "" : "rounded-[1.1rem]"}`}
          onScroll={(event) => {
            const target = event.currentTarget;
            const nextIndex = Math.round(target.scrollLeft / Math.max(target.clientWidth, 1));
            if (nextIndex !== activeIndex) {
              setActiveIndex(nextIndex);
            }
          }}
        >
          {images.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="min-w-full snap-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${altBase} ${index + 1}`}
                className={fullBleed ? "h-full w-full object-cover" : "aspect-[9/16] w-full object-cover"}
              />
            </div>
          ))}
        </div>

        {images.length > 1 ? (
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className={`flex items-center justify-center gap-2 ${fullBleed ? "absolute inset-x-0 bottom-28 z-10" : "mt-3"}`}>
          {images.map((_, index) => (
            <span
              key={`dot-${index}`}
              className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-pink-500" : "bg-pink-200"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
