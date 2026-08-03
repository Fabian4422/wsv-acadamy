export const AGE_GROUPS = [
  "G-Junioren",
  "F-Junioren",
  "E-Junioren",
  "D-Junioren",
  "C-Junioren",
  "B-Junioren",
  "A-Junioren",
  "Herren",
] as const;

export const CATEGORIES = [
  "Passspiel",
  "Torschuss",
  "Dribbling",
  "Taktik",
  "Aufwärmen",
  "Athletik",
] as const;

export const FOCUS_AREAS = [
  "Aufwärmen",
  "Passspiel",
  "Torschuss",
  "Spielform",
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];
export type Category = (typeof CATEGORIES)[number];
export type FocusArea = (typeof FOCUS_AREAS)[number];

export type Drill = {
  id: string;
  title: string;
  category: string;
  focus: FocusArea[];
  ageGroups: AgeGroup[];
  thumbnailUrl: string;
  youtubeVideoId: string;
  description: string;
  coachingPoints: string[];
};

export function formatAgeGroupLabel(ageGroups: AgeGroup[]): string {
  if (ageGroups.length === 0) return "Alle";
  if (ageGroups.length === 1) return ageGroups[0];
  if (ageGroups.length === 2) return `${ageGroups[0]} · ${ageGroups[1]}`;
  return `${ageGroups[0]} +${ageGroups.length - 1}`;
}
