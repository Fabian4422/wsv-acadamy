import {
  CATEGORIES,
  type AgeGroup,
  type Category,
  type Drill,
  type FocusArea,
} from "@/data/drills";

type ExerciseRow = Record<string, unknown>;

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "bigint") return value.toString();
  }
  return "";
}

function isJunkToken(value: string): boolean {
  return value.length === 0 || /^[\s,\[\]{}\\'"`]+$/.test(value);
}

/** Entfernt JSON-/Array-Artefakte wie Anführungszeichen, Klammern und Backslashes. */
export function cleanTextItem(value: string): string {
  let current = value.trim();
  if (!current) return "";

  // Mehrfach escaped Quotes/Backslashes aus kaputten JSON-Speicherungen
  for (let i = 0; i < 4; i += 1) {
    const next = current
      .replace(/\\+"/g, '"')
      .replace(/\\+'/g, "'")
      .replace(/\\\\/g, "\\");
    if (next === current) break;
    current = next;
  }

  current = current.trim();

  while (
    (current.startsWith("[") && current.endsWith("]")) ||
    (current.startsWith("{") && current.endsWith("}")) ||
    (current.startsWith("(") && current.endsWith(")"))
  ) {
    current = current.slice(1, -1).trim();
  }

  while (
    (current.startsWith('"') && current.endsWith('"')) ||
    (current.startsWith("'") && current.endsWith("'"))
  ) {
    current = current.slice(1, -1).trim();
  }

  current = current.replace(/^[,\[\]{}]+|[,\[\]{}]+$/g, "").trim();
  return isJunkToken(current) ? "" : current;
}

function tryParseJsonArray(value: string): unknown[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function tryParsePostgresArray(value: string): string[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  // JSON-Objekte nicht als Postgres-Array behandeln
  if (trimmed.includes(":")) return null;

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];

  const items: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < inner.length; i += 1) {
    const char = inner[i];
    if (char === '"' && inner[i - 1] !== "\\") {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      items.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  items.push(current);
  return items;
}

function asStringArray(value: unknown): string[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") {
          const trimmed = item.trim();
          if (
            (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
            (trimmed.startsWith("{") && trimmed.endsWith("}"))
          ) {
            return asStringArray(trimmed);
          }
          return [cleanTextItem(item)];
        }
        if (item == null) return [];
        return asStringArray(item);
      })
      .map(cleanTextItem)
      .filter((item) => !isJunkToken(item));
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return [String(value)];
  }

  if (typeof value !== "string" || value.length === 0) return [];

  const trimmed = value.trim();

  const jsonArray = tryParseJsonArray(trimmed);
  if (jsonArray) return asStringArray(jsonArray);

  // Doppelt als JSON-String gespeichert: "[\"a\",\"b\"]"
  if (trimmed.startsWith('"') && trimmed.includes("[")) {
    try {
      const unquoted = JSON.parse(trimmed);
      if (typeof unquoted === "string" || Array.isArray(unquoted)) {
        return asStringArray(unquoted);
      }
    } catch {
      // weiter
    }
  }

  const pgArray = tryParsePostgresArray(trimmed);
  if (pgArray) return asStringArray(pgArray);

  if (trimmed.includes("\n")) {
    return trimmed
      .split("\n")
      .map(cleanTextItem)
      .filter((item) => !isJunkToken(item));
  }

  if (trimmed.includes(",") || trimmed.includes("|")) {
    return trimmed
      .split(/[,|]/)
      .map(cleanTextItem)
      .filter((item) => !isJunkToken(item));
  }

  const cleaned = cleanTextItem(trimmed);
  return cleaned ? [cleaned] : [];
}

function extractYoutubeId(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return "";
  const match = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/,
  );
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{6,}$/.test(input)) return input;
  return "";
}

function toCategories(values: string[]): Category[] {
  const allowed = new Set<string>(CATEGORIES);
  const result: Category[] = [];
  for (const value of values) {
    const match = CATEGORIES.find(
      (category) => category.toLowerCase() === value.toLowerCase(),
    );
    if (match && !result.includes(match)) {
      result.push(match);
      continue;
    }
    // Unbekannte Werte verwerfen, keine Artefakte behalten
    if (allowed.has(value) && !result.includes(value as Category)) {
      result.push(value as Category);
    }
  }
  return result;
}

export function mapExercise(row: ExerciseRow): Drill {
  const focus = asStringArray(
    row.focus ?? row.focus_areas ?? row.schwerpunkte ?? row.schwerpunkt,
  ) as FocusArea[];

  const ageGroups = asStringArray(
    row.age_groups ?? row.ageGroups ?? row.altersklassen ?? row.altersklasse,
  ) as AgeGroup[];

  const rawCategories = asStringArray(
    row.categories ?? row.category ?? row.kategorien ?? row.kategorie,
  );

  const categories = toCategories(rawCategories);

  const youtubeVideoId =
    firstString(row.youtube_video_id, row.youtubeVideoId, row.video_id) ||
    extractYoutubeId(row.youtube_url ?? row.video_url ?? row.url);

  return {
    id: firstString(row.id, row.uuid, row.exercise_id),
    title: firstString(row.title, row.name, row.titel) || "Unbenannte Übung",
    categories:
      categories.length > 0
        ? categories
        : focus[0] && CATEGORIES.includes(focus[0] as Category)
          ? [focus[0] as Category]
          : [],
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
