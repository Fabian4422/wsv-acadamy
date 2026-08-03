import { formatAgeGroupLabel, type Drill } from "@/data/drills";

type DrillCardProps = {
  drill: Drill;
  onOpen: (drill: Drill) => void;
  isAdmin?: boolean;
  onEdit?: (drill: Drill) => void;
  onDelete?: (drill: Drill) => void;
};

export function DrillCard({
  drill,
  onOpen,
  isAdmin = false,
  onEdit,
  onDelete,
}: DrillCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={drill.thumbnailUrl}
          alt={`Vorschaubild: ${drill.title}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-3 text-lg font-bold leading-snug text-zinc-900">
          {drill.title}
        </h3>

        <span className="mb-5 inline-flex w-fit rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
          {formatAgeGroupLabel(drill.ageGroups)}
        </span>

        <button
          type="button"
          onClick={() => onOpen(drill)}
          className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Übung anzeigen
        </button>

        {isAdmin && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(drill)}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(drill)}
              className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Löschen
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
