import { useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type LightboxImage = { src: string; caption: string };

export function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, step]);

  if (!open || index === null) return null;
  const image = images[index];
  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.caption}
      className="fixed inset-0 z-100 flex flex-col bg-background/97 animate-fade-in"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
        <span className="label-mono">
          {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="flex h-11 min-w-11 items-center gap-2 px-2 label-mono text-foreground transition-opacity hover:opacity-60"
        >
          Close <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-4 md:p-10">
        <img
          src={image.src}
          alt={image.caption}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 md:px-10">
        <p className="label-mono truncate">{image.caption}</p>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous image"
            className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:bg-surface-2"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next image"
            className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:bg-surface-2"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
