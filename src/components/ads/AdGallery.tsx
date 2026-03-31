"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface AdGalleryProps {
  images: { id: string; url: string; thumbnailUrl: string | null }[];
}

const SWIPE_THRESHOLD = 50;

export function AdGallery({ images }: AdGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevLightbox = useCallback(
    () => setLightboxIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const nextLightbox = useCallback(
    () => setLightboxIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  // Swipe handlers pentru galeria principala
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const diff = Math.abs(touchStartX.current - touchEndX.current);
    if (diff > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) >= SWIPE_THRESHOLD && images.length > 1) {
      if (diff > 0) {
        // Swipe stanga = urmatoarea imagine
        setCurrent((c) => (c + 1) % images.length);
      } else {
        // Swipe dreapta = imaginea anterioara
        setCurrent((c) => (c - 1 + images.length) % images.length);
      }
    }
  }, [images.length]);

  // Swipe handlers pentru lightbox
  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
  }, []);

  const handleLightboxTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const diff = Math.abs(touchStartX.current - touchEndX.current);
    if (diff > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleLightboxTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) >= SWIPE_THRESHOLD && images.length > 1) {
      if (diff > 0) {
        nextLightbox();
      } else {
        prevLightbox();
      }
    }
  }, [images.length, nextLightbox, prevLightbox]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, closeLightbox, prevLightbox, nextLightbox]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-[#1E1E1E] rounded-xl flex items-center justify-center">
        <span className="text-[#666]">Fara imagini</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-[16/10] bg-[#1E1E1E] rounded-xl overflow-hidden cursor-zoom-in select-none touch-pan-y"
        onClick={() => {
          if (!isSwiping.current) openLightbox(current);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[current].url}
          alt=""
          fill
          className="object-contain transition-opacity duration-200"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
          draggable={false}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition hidden sm:block"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition hidden sm:block"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === current ? "border-gold" : "border-transparent hover:border-[#444]"
              }`}
            >
              <img src={img.thumbnailUrl || img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none"
          onClick={closeLightbox}
          onTouchStart={handleLightboxTouchStart}
          onTouchMove={handleLightboxTouchMove}
          onTouchEnd={handleLightboxTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-[#ccc] transition z-10"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt=""
              fill
              className="object-contain transition-opacity duration-200"
              sizes="100vw"
              priority
              draggable={false}
            />
          </div>

          {/* Navigation arrows - ascunse pe mobil */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition hidden sm:block"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition hidden sm:block"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gold text-sm font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
