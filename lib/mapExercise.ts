import type { AgeGroup, Drill, FocusArea } from "@/data/drills";

type ExerciseRow = Record<string, unknown>;

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : String(item ?? "")))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string" && value.length > 0) {
    // Komma- oder Pipe-separierte Strings ebenfalls erlauben
    if (value.includes(",") || value.includes("|")) {
      return value
        .split(/[,|]/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [value];
  }
  return [];
}

function extractYoutubeId(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return "";
  const match = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  if (match) return match[1];
  // Falls schon eine reine ID übergeben wurde
  if (/^[A-Za-z0-9_-]{6,}$/.test(input)) return input;
  return "";
}

export function mapExercise(row: ExerciseRow): Drill {
  const focus = asStringArray(
    row.focus ?? row.focus_areas ?? row.schwerpunkte ?? row.schwerpunkt,
  ) as FocusArea[];

  const ageGroups = asStringArray(
    row.age_groups ?? row.ageGroups ?? row.altersklassen ?? row.altersklasse,
  ) as AgeGroup[];

  const youtubeVideoId =
    firstString(row.youtube_video_id, row.youtubeVideoId, row.video_id) ||
    extractYoutubeId(row.youtube_url ?? row.video_url ?? row.url);

  return {
    id: firstString(row.id, row.uuid, row.exercise_id) || crypto.randomUUID(),
    title: firstString(row.title, row.name, row.titel) || "Unbenannte Übung",
    category: firstString(row.category, row.kategorie, focus[0]),
    focus,
    ageGroups,
    thumbnailUrl: firstString(
      row.thumbnail_url,
      row.thumbnailUrl,
      row.image_url,
      row.image,
      row.bild,
    ),
    youtubeVideoId,
    description: firstString(row.description, row.beschreibung, row.summary),
    coachingPoints: asStringArray(
      row.coaching_points ?? row.coachingPoints ?? row.coaching,
    ),
  };
}
