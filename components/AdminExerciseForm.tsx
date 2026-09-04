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

function extractYoutubeId(input: string): string {
  const match = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{6,}$/.test(input)) return input;
  return "";
}

function resolveThumbnailUrl(thumbnailUrl: string, youtubeUrl: string): string {
  const trimmed = thumbnailUrl.trim();
  if (trimmed) return trimmed;

  const videoId = extractYoutubeId(youtubeUrl);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return DEFAULT_THUMBNAIL;
}

function toggleItem<T>(items: T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((current) => current !== item)
    : [...items, item];
}

export function AdminExerciseForm({
  onSuccess,
  initialDrill = null,
  onCancelEdit,
}: AdminExerciseFormProps) {
  const isEditing = Boolean(initialDrill);

  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedAltersklassen, setSelectedAltersklassen] = useState<AgeGroup[]>(
    [],
  );
  const [schwerpunkt, setSchwerpunkt] = useState<FocusArea>("Passspiel");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [coachingPoints, setCoachingPoints] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialDrill) {
      setTitle("");
      setSelectedCategories([]);
      setSelectedAltersklassen([]);
      setSchwerpunkt("Passspiel");
      setYoutubeUrl("");
      setDescription("");
      setCoachingPoints("");
      setThumbnailUrl("");
      return;
    }

    setTitle(initialDrill.title);
    setSelectedCategories(
      initialDrill.categories.filter((item): item is Category =>
        (CATEGORIES as readonly string[]).includes(item),
      ),
    );
    setSelectedAltersklassen(initialDrill.ageGroups);
    setSchwerpunkt(initialDrill.focus[0] ?? "Passspiel");
    setYoutubeUrl(youtubeUrlFromId(initialDrill.youtubeVideoId));
    setDescription(initialDrill.description);
    setCoachingPoints(
      initialDrill.coachingPoints
        .map((point) => point.trim())
        .filter((point) => point.length > 0)
        .join("\n"),
    );
    setThumbnailUrl(initialDrill.thumbnailUrl || "");
  }, [initialDrill]);

  function resetCreateForm() {
    setTitle("");
    setSelectedCategories([]);
    setSelectedAltersklassen([]);
    setSchwerpunkt("Passspiel");
    setYoutubeUrl("");
    setDescription("");
    setCoachingPoints("");
    setThumbnailUrl("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedCategories.length === 0) {
      setErrorMessage("Bitte mindestens eine Kategorie auswählen.");
      return;
    }

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
      category: selectedCategories,
      age_groups: selectedAltersklassen,
      schwerpunkt,
      youtube_url: youtubeUrl,
      description,
      // Als Zeilen-Text speichern, damit keine JSON-Artefakte in text-Spalten entstehen
      coaching_points: coachingList.join("\n"),
      thumbnail_url: resolveThumbnailUrl(thumbnailUrl, youtubeUrl),
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
    <section className="page-card mb-6 w-full max-w-full rounded-xl border border-green-200 bg-white p-4 shadow-md sm:mb-8 sm:p-6">
      <h3 className="mb-1 text-lg font-bold text-zinc-900">
        {isEditing ? "Übung bearbeiten" : "Neue Übung hinzufügen"}
      </h3>
      <p className="mb-5 text-sm text-zinc-600">
        Nur für Admins – wird direkt in Supabase gespeichert.
      </p>

      <form className="grid w-full grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="w-full md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Titel
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full max-w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="w-full md:col-span-2">
          <fieldset className="w-full">
            <legend className="mb-2 text-sm font-medium text-zinc-800">
              Kategorien
            </legend>
            <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
              {CATEGORIES.map((item) => {
                const checked = selectedCategories.includes(item);
                return (
                  <label
                    key={item}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors sm:px-3",
                      checked
                        ? "border-green-600 bg-green-50 text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedCategories((current) =>
                          toggleItem(current, item),
                        )
                      }
                      className="h-4 w-4 shrink-0 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="min-w-0 break-words">{item}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="w-full">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Schwerpunkt
          </label>
          <select
            value={schwerpunkt}
            onChange={(e) => setSchwerpunkt(e.target.value as FocusArea)}
            className="w-full max-w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            {FOCUS_AREAS.map((focus) => (
              <option key={focus} value={focus}>
                {focus}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:col-span-2">
          <fieldset className="w-full">
            <legend className="mb-2 text-sm font-medium text-zinc-800">
              Altersklassen
            </legend>
            <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
              {AGE_GROUPS.map((group) => {
                const checked = selectedAltersklassen.includes(group);
                return (
                  <label
                    key={group}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors sm:px-3",
                      checked
                        ? "border-green-600 bg-green-50 text-zinc-900"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedAltersklassen((current) =>
                          toggleItem(current, group),
                        )
                      }
                      className="h-4 w-4 shrink-0 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="min-w-0 break-words">{group}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="w-full md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            YouTube-URL
          </label>
          <input
            required
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full max-w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="w-full md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Bild-URL (optional)
          </label>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Leer lassen = YouTube-Vorschaubild"
            className="w-full max-w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="w-full md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Beschreibung
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full max-w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="w-full md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-zinc-800">
            Coaching-Points (eine pro Zeile)
          </label>
          <textarea
            rows={4}
            value={coachingPoints}
            onChange={(e) => setCoachingPoints(e.target.value)}
            placeholder={"Punkt 1\nPunkt 2"}
            className="w-full max-w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {errorMessage && (
          <p className="w-full md:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm break-words text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="w-full md:col-span-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
            {successMessage}
          </p>
        )}

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60 sm:w-auto"
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
              className="w-full rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
