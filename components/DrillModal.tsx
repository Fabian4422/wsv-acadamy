"use client";

import { useEffect, useId } from "react";
import { type Drill } from "@/data/drills";
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

  const tags = [
    ...drill.categories.map((label) => ({
      key: `category-${label}`,
      label,
      tone: "green" as const,
    })),
    ...drill.ageGroups.map((label) => ({
      key: `age-${label}`,
      label,
      tone: "zinc" as const,
    })),
    ...drill.focus.map((label) => ({
      key: `focus-${label}`,
      label,
      tone: "zinc" as const,
    })),
  ].filter((tag, index, list) => list.findIndex((item) => item.label === tag.label) === index);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden p-0 sm:items-center sm:p-4 md:p-6">
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
        className="page-card relative z-10 flex max-h-[min(92vh,100dvh)] w-full max-w-5xl min-w-0 flex-col overflow-hidden overflow-x-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl md:grid md:max-h-[85vh] md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:grid-rows-1"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900/80 text-white transition-colors hover:bg-zinc-900 md:h-9 md:w-9"
        >
          <CloseIcon />
        </button>

        <div className="relative flex w-full min-w-0 shrink-0 items-center justify-center overflow-hidden">
          <div className="relative aspect-video w-full overflow-hidden">
            <iframe
              key={drill.id}
              src={getYoutubeEmbedUrl(drill.youtubeVideoId)}
              title={drill.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 block h-full w-full border-0"
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6 md:h-0 md:min-h-full md:px-6 md:py-6 md:pt-12">
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 md:pr-10">
              {tags.map((tag) => (
                <span
                  key={tag.key}
                  className={
                    tag.tone === "green"
                      ? "inline-flex max-w-full rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                      : "inline-flex max-w-full rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700"
                  }
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          <h2
            id={titleId}
            className="mb-4 break-words text-xl font-bold leading-snug text-zinc-900 sm:text-2xl md:pr-10"
          >
            {drill.title}
          </h2>

          <section className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Beschreibung
            </h3>
            <p className="break-words text-sm leading-relaxed text-zinc-700">
              {drill.description}
            </p>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Coaching-Points
            </h3>
            <ul className="space-y-2.5">
              {drill.coachingPoints.map((point, index) => (
                <li
                  key={`${drill.id}-point-${index}`}
                  className="flex gap-2.5 text-sm leading-relaxed text-zinc-700"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">{point}</span>
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
