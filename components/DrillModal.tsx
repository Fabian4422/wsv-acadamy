"use client";

import { useEffect, useId } from "react";
import type { Drill } from "@/data/drills";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type DrillModalProps = {
  drill: Drill | null;
  onClose: () => void;
};

export function DrillModal({ drill, onClose }: DrillModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!drill) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [drill, onClose]);

  if (!drill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Pop-up schließen"
        className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:max-h-[85vh] lg:flex-row"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/80 text-white transition-colors hover:bg-zinc-900"
        >
          <CloseIcon />
        </button>

        <div className="w-full shrink-0 bg-black lg:w-[58%]">
          <div className="aspect-video w-full lg:min-h-[320px]">
            <iframe
              key={drill.id}
              src={getYoutubeEmbedUrl(drill.youtubeVideoId)}
              title={drill.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-5 pt-12 sm:p-6 sm:pt-12 lg:p-6">
          <span className="mb-2 inline-flex w-fit rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            {drill.category}
          </span>

          <h2
            id={titleId}
            className="mb-4 text-xl font-bold leading-snug text-zinc-900 sm:text-2xl"
          >
            {drill.title}
          </h2>

          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Beschreibung
            </h3>
            <p className="text-sm leading-relaxed text-zinc-700">
              {drill.description}
            </p>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Coaching-Points
            </h3>
            <ul className="space-y-2">
              {drill.coachingPoints.map((point, index) => (
                <li
                  key={`${drill.id}-point-${index}`}
                  className="flex gap-2 text-sm leading-relaxed text-zinc-700"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
