"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type AgeGroup, type Drill, type FocusArea } from "@/data/drills";
import { AdminExerciseForm } from "@/components/AdminExerciseForm";
import { DrillCard } from "@/components/DrillCard";
import { DrillModal } from "@/components/DrillModal";
import { FilterSidebar } from "@/components/FilterSidebar";
import { LoginForm } from "@/components/LoginForm";
import { TopNav } from "@/components/TopNav";
import { supabase } from "@/lib/supabase";
import { mapExercise } from "@/lib/mapExercise";
import { useAuth } from "@/lib/useAuth";

function filterDrills(
  drills: Drill[],
  selectedAgeGroups: AgeGroup[],
  selectedFocusAreas: FocusArea[],
): Drill[] {
  return drills.filter((drill) => {
    const matchesAge =
      selectedAgeGroups.length === 0 ||
      drill.ageGroups.some((age) => selectedAgeGroups.includes(age));

    const matchesFocus =
      selectedFocusAreas.length === 0 ||
      drill.focus.some((focus) => selectedFocusAreas.includes(focus));

    return matchesAge && matchesFocus;
  });
}

function toggleItem<T>(items: T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item];
}

export function AcademyPortal() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [exercises, setExercises] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedAgeGroups, setSelectedAgeGroups] = useState<AgeGroup[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<FocusArea[]>(
    [],
  );
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase.from("exercises").select("*");

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    if (data) {
      setExercises(data.map(mapExercise));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setExercises([]);
      setLoading(false);
      return;
    }

    fetchExercises();
  }, [user, fetchExercises]);

  const filteredDrills = useMemo(
    () => filterDrills(exercises, selectedAgeGroups, selectedFocusAreas),
    [exercises, selectedAgeGroups, selectedFocusAreas],
  );

  async function handleDelete(drill: Drill) {
    const confirmed = window.confirm(
      `Übung „${drill.title}“ wirklich löschen?`,
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("exercises")
      .delete()
      .eq("id", drill.id);

    if (error) {
      window.alert(`Löschen fehlgeschlagen: ${error.message}`);
      return;
    }

    if (editingDrill?.id === drill.id) {
      setEditingDrill(null);
    }
    if (activeDrill?.id === drill.id) {
      setActiveDrill(null);
    }
    await fetchExercises();
  }

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-zinc-100">
      <TopNav />

      {authLoading ? (
        <div className="flex flex-1 items-center justify-center px-3 py-12 sm:px-4">
          <p className="text-sm text-zinc-600">Sitzung wird geprüft…</p>
        </div>
      ) : !user ? (
        <main className="flex flex-1 items-center justify-center px-3 py-12 sm:px-4">
          <LoginForm />
        </main>
      ) : (
        <div className="page-shell mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            <div className="w-full min-w-0 lg:col-span-1">
              <FilterSidebar
                selectedAgeGroups={selectedAgeGroups}
                selectedFocusAreas={selectedFocusAreas}
                onAgeGroupToggle={(ageGroup) =>
                  setSelectedAgeGroups((current) =>
                    toggleItem(current, ageGroup),
                  )
                }
                onFocusToggle={(focus) =>
                  setSelectedFocusAreas((current) => toggleItem(current, focus))
                }
                onReset={() => {
                  setSelectedAgeGroups([]);
                  setSelectedFocusAreas([]);
                }}
              />
            </div>

            <main className="w-full min-w-0 lg:col-span-3">
              {isAdmin && (
                <AdminExerciseForm
                  key={editingDrill?.id ?? "create"}
                  initialDrill={editingDrill}
                  onCancelEdit={() => setEditingDrill(null)}
                  onSuccess={fetchExercises}
                />
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900">Übungen</h2>
                {!loading && !loadError && (
                  <p className="mt-1 text-sm text-zinc-600">
                    {filteredDrills.length}{" "}
                    {filteredDrills.length === 1 ? "Übung" : "Übungen"} gefunden
                  </p>
                )}
              </div>

              {loading && (
                <div className="page-card w-full rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-12 text-center shadow-sm sm:px-6 sm:py-16">
                  <p className="text-base font-medium text-zinc-800">Lädt…</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Übungen werden aus der Datenbank geladen.
                  </p>
                </div>
              )}

              {!loading && loadError && (
                <div className="page-card w-full rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center shadow-sm sm:px-6">
                  <p className="text-base font-semibold text-red-800">
                    Fehler beim Laden der Übungen
                  </p>
                  <p className="mt-2 break-words text-sm text-red-700">{loadError}</p>
                </div>
              )}

              {!loading && !loadError && filteredDrills.length > 0 && (
                <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDrills.map((drill) => (
                    <DrillCard
                      key={drill.id}
                      drill={drill}
                      onOpen={setActiveDrill}
                      isAdmin={isAdmin}
                      onEdit={(item) => {
                        setEditingDrill(item);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {!loading && !loadError && filteredDrills.length === 0 && (
                <div className="page-card w-full rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-12 text-center shadow-sm sm:px-6 sm:py-16">
                  <p className="text-base font-medium text-zinc-800">
                    Keine Übungen für diese Filter
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Passe die Altersklassen oder Schwerpunkte an, um weitere
                    Übungen zu sehen.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      <DrillModal drill={activeDrill} onClose={() => setActiveDrill(null)} />
    </div>
  );
}
