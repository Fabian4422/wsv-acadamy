"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AGE_GROUPS,
  CATEGORIES,
  FOCUS_AREAS,
  type AgeGroup,
  type Category,
  type Drill,
  type FocusArea,
} from "@/data/drills";
import { supabase } from "@/lib/supabase";

type AdminExerciseFormProps = {
  onSuccess: () => void;
  initialDrill?: Drill | null;
  onCancelEdit?: () => void;
};

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600";

function youtubeUrlFromId(videoId: string): string {
  if (!videoId) return "";
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function AdminExerciseForm({
  onSuccess,
  initialDrill = null,
  onCancelEdit,
}: AdminExerciseFormProps) {
  const isEditing = Boolean(initialDrill);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [selectedAltersklassen, setSelectedAltersklassen] = useState<AgeGroup[]>(
    [],
  );
  const [schwerpunkt, setSchwerpunkt] = useState<FocusArea>("Passspiel");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [coachingPoints, setCoachingPoints] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(DEFAULT_THUMBNAIL);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialDrill) {
      setTitle("");
      setCategory(CATEGORIES[0]);
      setSelectedAltersklassen([]);
      setSchwerpunkt("Passspiel");
      setYoutubeUrl("");
      setDescription("");
      setCoachingPoints("");
      setThumbnailUrl(DEFAULT_THUMBNAIL);
      return;
    }

    setTitle(initialDrill.title);
    setCategory(
      CATEGORIES.includes(initialDrill.category as Category)
        ? (initialDrill.category as Category)
        : CATEGORIES[0],
    );
    setSelectedAltersklassen(initialDrill.ageGroups);
    setSchwerpunkt(initialDrill.focus[0] ?? "Passspiel");
    setYoutubeUrl(youtubeUrlFromId(initialDrill.youtubeVideoId));
    setDescription(initialDrill.description);
    setCoachingPoints(initialDrill.coachingPoints.join("\n"));
    setThumbnailUrl(initialDrill.thumbnailUrl || DEFAULT_THUMBNAIL);
  }, [initialDrill]);

  function handleCheckboxChange(group: AgeGroup) {
    setSelectedAltersklassen((current) =>
      current.includes(group)
        ? current.filter((item) => item !== group)
        : [...current, group],
    );
  }

  function resetCreateForm() {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setSelectedAltersklassen([]);
    setSchwerpunkt("Passspiel");
    setYoutubeUrl("");
    setDescription("");
    setCoachingPoints("");
    setThumbnailUrl(DEFAULT_THUMBNAIL);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedAltersklassen.length === 0) {
      setErrorMessage("Bitte mindestens eine Altersklasse auswählen.");
      return;
    }

    setSubmitting(true);

    const coachingList = coachingPoints
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const payload = {
      title,
      category,
      age_groups: selectedAltersklassen,
      schwerpunkt,
      youtube_url: youtubeUrl,
      description,
      coaching_points: coachingList,
      thumbnail_url: thumbnailUrl || DEFAULT_THUMBNAIL,
    };

    const { error } = isEditing && initialDrill
      ? await supabase.from("exercises").update(payload).eq("id", initialDrill.id)
      : await supabase.from("exercises").insert(payload);

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      isEditing ? "Übung erfolgreich aktualisiert." : "Übung erfolgreich gespeichert.",
    );

    if (isEditing) {
      onCancelEdit?.();
    } else {
      resetCreateForm();
    }

    onSuccess();
  }

  return (
    <section className="mb-8 rounded-xl border border-green-200 bg-white p-6 shadow-md">
      <h3 className="mb-1 text-lg font-bold text-zinc-900">
        {isEditing ? "Übung bearbeiten" : "Neue Übung hinzufügen"}
      </h3>
      <p className="mb-5 text-sm text-zinc-600">
        Nur für Admins – wird direkt in Supabase gespeichert.
      </p>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Titel
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Kategorie
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Schwerpunkt
          </label>
          <select
            value={schwerpunkt}
            onChange={(e) => setSchwerpunkt(e.target.value as FocusArea)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            {FOCUS_AREAS.map((focus) => (
              <option key={focus} value={focus}>
                {focus}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-zinc-800">
              Altersklassen
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AGE_GROUPS.map((group) => {
                const checked = selectedAltersklassen.includes(group);
                return (
                  <label
                    key={group}
                    className={[
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      checked
                        ? "border-green-600 bg-green-50 text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxChange(group)}
                      className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                    />
                    {group}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            YouTube-URL
          </label>
          <input
            required
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Bild-URL (optional)
          </label>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Beschreibung
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Coaching-Points (eine pro Zeile)
          </label>
          <textarea
            rows={4}
            value={coachingPoints}
            onChange={(e) => setCoachingPoints(e.target.value)}
            placeholder={"Punkt 1\nPunkt 2"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {errorMessage && (
          <p className="md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="md:col-span-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
            {successMessage}
          </p>
        )}

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
          >
            {submitting
              ? "Speichern…"
              : isEditing
                ? "Änderungen speichern"
                : "Übung speichern"}
          </button>
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
