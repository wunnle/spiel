/**
 * Tag colours for the official categories, by family, so a game's kind reads at a glance.
 * Class strings are spelled out in full so Tailwind finds them.
 */
const FAMILIES: { tone: string; categories: string[] }[] = [
  {
    // Thinky
    tone: "bg-violet-500/10 text-violet-800/90 dark:text-violet-200/80",
    categories: [
      "Strategy game",
      "Euro game",
      "4x game",
      "Planning game",
      "Tile placement game",
      "Logic game",
      "Brain game",
      "Puzzle",
      "Riddle",
    ],
  },
  {
    // Around a table of friends
    tone: "bg-fuchsia-500/10 text-fuchsia-800/90 dark:text-fuchsia-200/80",
    categories: ["Party game", "Communication game", "Quiz game", "Word game", "Knowledge game"],
  },
  {
    // Together, or through a story
    tone: "bg-indigo-500/10 text-indigo-800/90 dark:text-indigo-200/80",
    categories: [
      "Cooperative",
      "Campaign game",
      "Legacy",
      "Story game",
      "Roleplaying game",
      "Escape game",
      "Crime and detective game",
    ],
  },
  {
    // Family and kids
    tone: "bg-amber-500/10 text-amber-800/90 dark:text-amber-200/80",
    categories: [
      "Childrens game",
      "Educative game",
      "Memo game",
      "Dexterity game",
      "Action game",
      "Outdoor game",
      "Traveling game",
    ],
  },
  {
    // Cards and dice
    tone: "bg-orange-500/10 text-orange-800/90 dark:text-orange-200/80",
    categories: ["Card Game", "Dice game", "Game of luck", "Trading card game", "Numbers game"],
  },
  {
    tone: "bg-teal-500/10 text-teal-800/90 dark:text-teal-200/80",
    categories: ["Solo game"],
  },
];

const TONE = new Map(FAMILIES.flatMap((f) => f.categories.map((c) => [c, f.tone] as const)));

/** Anything else (miniatures, hybrid, accessories, new ones) stays grey. */
export function categoryTone(category: string) {
  return TONE.get(category) ?? "bg-slate-500/10 text-slate-800/90 dark:text-slate-200/80";
}

const LABELS: Record<string, string> = { "Childrens game": "Children's", "4x game": "4X" };

/** "Strategy game" → "Strategy", "Game of luck" → "Luck", "Game accessories" → "Accessories". */
export function categoryLabel(category: string) {
  if (LABELS[category]) return LABELS[category];
  const short = category.replace(/^game (of )?/i, "").replace(/\s+games?$/i, "");
  return short.charAt(0).toUpperCase() + short.slice(1);
}
