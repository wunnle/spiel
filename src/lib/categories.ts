/** The official categories, grouped into families so the sidebar's long list has some shape. */
export const FAMILIES: { name: string; categories: string[] }[] = [
  {
    name: "Strategy & puzzles",
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
    name: "Social & party",
    categories: ["Party game", "Communication game", "Quiz game", "Word game", "Knowledge game"],
  },
  {
    name: "Co-op & story",
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
    name: "Family & kids",
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
    name: "Cards & dice",
    categories: ["Card Game", "Dice game", "Game of luck", "Trading card game", "Numbers game"],
  },
  { name: "Solo", categories: ["Solo game"] },
];

/**
 * The given categories grouped by family, in family order and alphabetical within each; anything not
 * in a family (miniatures, hybrid, accessories, new ones) lands in "Other". Empty families are left out.
 */
export function groupByFamily(categories: string[]) {
  const known = new Set(FAMILIES.flatMap((f) => f.categories));
  const by = (a: string, b: string) => categoryLabel(a).localeCompare(categoryLabel(b));
  return [
    ...FAMILIES.map((f) => ({ name: f.name, categories: f.categories.filter((c) => categories.includes(c)).sort(by) })),
    { name: "Other", categories: categories.filter((c) => !known.has(c)).sort(by) },
  ].filter((g) => g.categories.length);
}

const LABELS: Record<string, string> = { "Childrens game": "Children's", "4x game": "4X" };

/** "Strategy game" → "Strategy", "Game of luck" → "Luck", "Game accessories" → "Accessories". */
export function categoryLabel(category: string) {
  if (LABELS[category]) return LABELS[category];
  const short = category.replace(/^game (of )?/i, "").replace(/\s+games?$/i, "");
  return short.charAt(0).toUpperCase() + short.slice(1);
}
