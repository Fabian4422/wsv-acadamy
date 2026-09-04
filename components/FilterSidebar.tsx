"use client";

import {
  AGE_GROUPS,
  FOCUS_AREAS,
  type AgeGroup,
  type FocusArea,
} from "@/data/drills";

type FilterSidebarProps = {
  selectedAgeGroups: AgeGroup[];
  selectedFocusAreas: FocusArea[];
  onAgeGroupToggle: (ageGroup: AgeGroup) => void;
  onFocusToggle: (focus: FocusArea) => void;
  onReset: () => void;
};

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-zinc-800">{title}</h3>
      {children}
    </section>
  );
}

function ageGroupButtonClass(selected: boolean): string {
  return [
    "w-full rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors sm:px-3",
    selected
      ? "bg-green-600 text-white shadow-sm"
      : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100",
  ].join(" ");
}

function focusButtonClass(selected: boolean): string {
  return [
    "w-full rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3",
    selected
      ? "bg-green-600 text-white shadow-sm"
      : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100",
  ].join(" ");
}

export function FilterSidebar({
  selectedAgeGroups,
  selectedFocusAreas,
  onAgeGroupToggle,
  onFocusToggle,
  onReset,
}: FilterSidebarProps) {
  const hasActiveFilters =
    selectedAgeGroups.length > 0 || selectedFocusAreas.length > 0;

  return (
    <aside className="page-card w-full max-w-full rounded-xl bg-gray-50 p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-zinc-900">Filter</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-xs font-medium text-green-700 hover:text-green-800"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      <div className="space-y-8">
        <FilterSection title="Altersklassen">
          <div className="grid w-full grid-cols-2 gap-2">
            {AGE_GROUPS.map((ageGroup) => {
              const selected = selectedAgeGroups.includes(ageGroup);
              return (
                <button
                  key={ageGroup}
                  type="button"
                  onClick={() => onAgeGroupToggle(ageGroup)}
                  className={ageGroupButtonClass(selected)}
                >
                  {ageGroup}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Schwerpunkte">
          <div className="grid w-full grid-cols-2 gap-2 lg:grid-cols-1">
            {FOCUS_AREAS.map((focus) => {
              const selected = selectedFocusAreas.includes(focus);
              return (
                <button
                  key={focus}
                  type="button"
                  onClick={() => onFocusToggle(focus)}
                  className={focusButtonClass(selected)}
                >
                  {focus}
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}


