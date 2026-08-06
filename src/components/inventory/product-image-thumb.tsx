"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Package } from "lucide-react";

interface ProductImageThumbProps {
  name: string;
  imageUrl?: string;
  pending?: boolean;
  size?: "sm" | "md";
}

export function ProductImageThumb({
  name,
  imageUrl,
  pending = false,
  size = "sm",
}: ProductImageThumbProps) {
  const [hover, setHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const dimensions = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-4 w-4";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [imageUrl]);

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    if (!imageUrl || error) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({
      x: Math.min(rect.right + 12, window.innerWidth - 240),
      y: rect.top + rect.height / 2,
    });
    setHover(true);
  }

  if (!imageUrl || error) {
    return (
      <div
        className={`relative flex ${dimensions} shrink-0 items-center justify-center rounded-lg bg-accent-primary-light`}
        title={pending ? "Generating product image…" : name}
      >
        {pending ? (
          <Loader2 className={`${iconSize} animate-spin text-accent-primary`} />
        ) : (
          <Package className={`${iconSize} text-accent-primary`} />
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className="relative shrink-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHover(false)}
      >
        {!loaded && (
          <div
            className={`absolute inset-0 flex ${dimensions} items-center justify-center rounded-lg bg-accent-primary-light`}
          >
            <Loader2 className={`${iconSize} animate-spin text-accent-primary`} />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${dimensions} rounded-lg object-cover ring-1 ring-border transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {mounted &&
        hover &&
        loaded &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[300] transition-opacity duration-150"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translateY(-50%)",
            }}
          >
            <div className="overflow-hidden rounded-2xl bg-surface-elevated p-1.5 shadow-2xl ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${name} preview`}
                className="h-56 w-56 object-cover"
              />
              <p className="px-2 py-1.5 text-center text-xs font-medium text-text-secondary">
                {name}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
