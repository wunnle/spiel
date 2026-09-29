export type Kind = "New" | "Expansion" | "Spin-off";

/** The hand-picked shortlist: press and community "most anticipated" games, with notes. */
export type Pick = {
  title: string;
  /** English name when the source listing is German. */
  en?: string;
  /** Title in the official novelties list, when it's neither `title` nor `en`. */
  listing?: string;
  publisher?: string;
  designers?: string;
  kind: Kind;
  /** Picked out by press / community "most anticipated" lists. */
  buzz?: boolean;
  blurb?: string;
  /** Booth ids as the official hall plan knows them, "<hall>.<stand>", e.g. "3.3U210". */
  booths?: string[];
  /** Exhibitor showing the game, when that isn't the publisher. */
  at?: string;
};

export const PICKS: Pick[] = [
  {
    title: "Queen Alice",
    publisher: "Combo Games",
    kind: "New",
   
    buzz: true,
    blurb:
      "Mid-heavy euro. You're advisors at the court beyond the Looking Glass, building an engine from chess pieces and cards. Early online plays marked it as the one for heavy-strategy fans.",
    booths: ["3.3U210"],
  },
  {
    title: "Kingdom Come: Deliverance – The Board Game",
    publisher: "Czech Games Edition",
    designers: "Tomáš Holek (co-designer)",
    kind: "New",
    buzz: true,
    blurb: "Board game adaptation of the Czech medieval RPG.",
    booths: ["3.3V400", "7.7E100"],
  },
  {
    title: "Carpet Racers",
    designers: "Tomáš Holek",
    kind: "New",
    buzz: true,
    blurb: "Chaotic racing game where players steer cards without knowing which one is theirs.",
    booths: ["4.4G515"],
    at: "Pink Troubadour",
  },
  {
    title: "Greenwood",
    publisher: "Feuerland",
    designers: "Christos Giannakoulas, Manolis Zachariadis",
    kind: "New",
   
    buzz: true,
    blurb: "Fantasy euro: primal spirits rescue creatures from a corrupted druid grove.",
    booths: ["3.3Q300"],
  },
  {
    title: "Stonesaga",
    designers: "Max Brooke, Luke Eddy",
    kind: "New",
   
    buzz: true,
    blurb: "Co-op exploration with survival crafting, played across several generations of characters.",
    booths: ["2.2C130"],
    at: "Board Game Circus",
  },
  {
    title: "Gaudí",
    designers: "Dani Garcia",
    kind: "New",
    buzz: true,
    blurb: "Tile placement about the architect, scoring across Nature, Catalonia and Religion.",
    booths: ["3.3D600", "6.6B300"],
    at: "DEVIR and HUCH!",
  },
  {
    title: "Personal Demons",
    designers: "Judson Cowan",
    kind: "New",
    buzz: true,
    blurb: "Group drafting: build demon summoning circles for points. Already on Kickstarter.",
  },
  {
    title: "Dust in the Wind",
    publisher: "PHALANX",
    designers: "Srdjan Jovanovski",
    kind: "New",
   
    buzz: true,
    blurb: "Story-driven co-op on the American frontier, with resource management and branching choices.",
    booths: ["3.3L500"],
   
  },
  {
    title: "Blood Hunt",
    kind: "New",
    buzz: true,
    blurb: "Four-player vampire game: secretly draft cards to claim citizens across the city's districts.",
    booths: ["6.6B201"],
    at: "Mandoo Games",
  },
  {
    title: "Aridnyk",
    publisher: "Boardova",
    kind: "New",
    buzz: true,
    blurb: "Tile game from Hutsul mythology: shepherd your flocks and deal with mythic creatures.",
    booths: ["4.4A425"],
    at: "Koalla",
  },
  {
    title: "Harmonies: Crescendo",
    publisher: "Libellud",
    kind: "Expansion",
    buzz: true,
    blurb: "New board layouts, scoring and animal cards, plus “Whisper Creatures”.",
  },

  { title: "Entropy", publisher: "Board & Dice (DE: Frosted Games)", kind: "New", booths: ["3.3G300"], at: "Frosted Games" },
  { title: "Thessaloniki", listing: "Thessaloniki: Handel im Zeitalter der Tetrarchie", publisher: "Board & Dice", kind: "New", booths: ["2.2E430", "2.2E440"], at: "B-Rex Entertainment" },
  { title: "Maestro", publisher: "Board & Dice", kind: "New", booths: ["2.2E430", "2.2E440"], at: "B-Rex Entertainment" },
  { title: "Windmill Valley Duel", publisher: "Board & Dice", kind: "Spin-off", booths: ["3.3G200"] },

  { title: "Flügelschlag: Mittel- und Südamerika", en: "Wingspan: Central & South America", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Flügelschlag: Regionen Fan-Set 1", en: "Wingspan: Regions fan pack 1", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Flossenschlag: Haie & Riffe", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Age of Innovation: Zukunft und Vergangenheit", en: "Age of Innovation: Future & Past", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Viticulture: Bordeaux", publisher: "Feuerland", kind: "Expansion", booths: ["3.3Q300"] },
  { title: "Melochs Duell", publisher: "Feuerland", kind: "New", booths: ["3.3Q300"] },

  { title: "Mischwald – Smoky Mountains", en: "Forest Shuffle: Smoky Mountains", publisher: "Lookout Spiele", kind: "Expansion", booths: ["3.3V300"] },
  { title: "Duell der Drachen", publisher: "Lookout Spiele", kind: "New", booths: ["3.3V300"] },

  { title: "Carcassonne 25 Jahre", listing: "Carcassonne - 25 year anniversary edition", en: "Carcassonne: 25-year anniversary edition", publisher: "Hans im Glück", kind: "Spin-off", booths: ["2.2B210"] },

  { title: "CATAN – Japan", publisher: "Kosmos", kind: "Expansion", booths: ["7.7E311"] },
  { title: "Andor – Ewige Kälte: Das Licht der Dunkelklinge", publisher: "Kosmos", kind: "Spin-off", booths: ["7.7E311"] },
  { title: "Fourth Wing – Das Spiel", en: "Fourth Wing – The Game: Choosing the Dragons", publisher: "Kosmos", kind: "New", booths: ["7.7E311"] },
  { title: "EXIT – Der perfekte Einbruch", listing: "EXIT® - The Game: The Perfect Heist", en: "EXIT: The Perfect Heist", publisher: "Kosmos", kind: "New", booths: ["7.7E311"] },

  { title: "Horrified: Dungeons & Dragons – Ravenloft", publisher: "Ravensburger", kind: "Spin-off", booths: ["7.7D311"] },
  { title: "Scotland Yard – Duel", publisher: "Ravensburger", kind: "Spin-off", booths: ["7.7D311"] },
  { title: "echoes – Das grüne Grab", publisher: "Ravensburger", kind: "New", booths: ["7.7D311"] },

  { title: "Dorfromantik Südsee", en: "Dorfromantik – South Seas", publisher: "Pegasus Spiele", kind: "Spin-off", booths: ["3.3K120", "3.3L110", "3.3M120"] },

  { title: "Minikin City", publisher: "Cranio Creations", kind: "New", booths: ["3.3T400"] },
  { title: "Crossing Heroes", publisher: "Cranio Creations", kind: "New", booths: ["3.3T400"] },

  { title: "La Cosecha", publisher: "Spielworxx", kind: "New", booths: ["3.3B300"] },
  { title: "Québec", publisher: "Spielworxx", kind: "New", booths: ["3.3B300"] },
  { title: "Molly House", publisher: "Spielworxx", kind: "New", booths: ["3.3B300"] },

  { title: "Spell", publisher: "Skellig Games", kind: "New", booths: ["3.3C300"] },
  { title: "Tinctura", publisher: "Skellig Games", kind: "New", booths: ["3.3C300"] },
  { title: "Riffwelten", publisher: "Strohmann Games", kind: "New", booths: ["3.3T600"] },
  { title: "Nacht im Zoo", en: "Night at the ZOO", publisher: "Albi", kind: "New", booths: ["4.4D400", "6.6E110"] },
  { title: "Yubibo", publisher: "Edition Spielwiese", kind: "New", booths: ["6.6A300"] },
  { title: "Wuselige Wiesen", publisher: "Frosted Games", kind: "New", booths: ["3.3G300"] },
];
