/**
 * Tag colours for the official categories, by family, so a game's kind reads at a glance.
 * Class strings are spelled out in full so Tailwind finds them.
 */
const FAMILIES: { tone: string; categories: string[] }[] = [
  {
    // Thinky
    tone: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
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
    tone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    categories: ["Party game", "Communication game", "Quiz game", "Word game", "Knowledge game"],
  },
  {
    // Together, or through a story
    tone: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
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
    tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
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
    tone: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    categories: ["Card Game", "Dice game", "Game of luck", "Trading card game", "Numbers game"],
  },
  {
    tone: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    categories: ["Solo game"],
  },
];

const TONE = new Map(FAMILIES.flatMap((f) => f.categories.map((c) => [c, f.tone] as const)));

/** Anything else (miniatures, hybrid, accessories, new ones) stays grey. */
export function categoryTone(category: string) {
  return TONE.get(category) ?? "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}
