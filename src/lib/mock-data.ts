export type Language = "en" | "fr" | "pt" | "it";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "Inglés", flag: "🇬🇧" },
  { code: "fr", label: "Francés", flag: "🇫🇷" },
  { code: "pt", label: "Portugués", flag: "🇧🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export const languageLabel = (code: Language) =>
  LANGUAGES.find((l) => l.code === code)?.label ?? code;

export const languageFlag = (code: Language) =>
  LANGUAGES.find((l) => l.code === code)?.flag ?? "🌐";

export type Song = {
  id: string;
  title: string;
  artist: string;
  language: Language;
  youtubeId: string;
  /** Letra de ejemplo: versos originales creados para la demo */
  lines: string[];
};

export type Card = {
  id: string;
  songId: string;
  term: string;
  translation: string;
  context: string;
  lineIndex: number;
  /** 0 = nueva, 5 = dominada */
  level: number;
  dueInDays: number;
};

export const songs: Song[] = [
  {
    id: "s1",
    title: "Paper Boats",
    artist: "The Quiet Hours",
    language: "en",
    youtubeId: "dQw4w9WgXcQ",
    lines: [
      "I keep my worries folded in a drawer",
      "Paper boats are sailing down the hall",
      "Every morning tastes a little softer now",
      "Tell me if you hear the river call",
      "We were younger than the streetlights then",
      "Counting all the reasons to stay up",
      "Hold the quiet like a borrowed coat",
      "And walk me home before the sun gives up",
    ],
  },
  {
    id: "s2",
    title: "Lumière Lente",
    artist: "Camille Ardor",
    language: "fr",
    youtubeId: "5qap5aO4i9A",
    lines: [
      "La lumière tombe lentement sur la ville",
      "Je marche sans compter les rues",
      "Tu me parles avec des mots tranquilles",
      "Le matin nous a déjà vus",
      "On garde le silence comme un trésor",
      "Rien ne presse, tout revient",
      "Les fenêtres chantent encore",
      "Demain sera un chemin",
    ],
  },
  {
    id: "s3",
    title: "Maré Devagar",
    artist: "Nina Sol",
    language: "pt",
    youtubeId: "jfKfPfyJRdk",
    lines: [
      "A maré chega devagar na minha porta",
      "Deixo o medo na areia молhada".replace("мол", "mol"),
      "Cada onda traz um nome que eu esqueci",
      "O sol acorda a rua inteira",
      "Vou cantando sem pressa nenhuma",
      "O vento sabe onde eu moro",
      "Guardo a saudade numa concha",
      "E devolvo ao mar o que eu choro",
    ],
  },
  {
    id: "s4",
    title: "Piccole Cose",
    artist: "Orso Bianco",
    language: "it",
    youtubeId: "hHW1oY26kxQ",
    lines: [
      "Le piccole cose mi salvano ancora",
      "Un caffè, una porta aperta",
      "Ti racconto la mia giornata lenta",
      "La città dorme scoperta",
      "Non ho fretta di capire tutto",
      "Ogni parola è una finestra",
      "Cammino piano dentro il rumore",
      "E il cuore fa la sua orchestra",
    ],
  },
];

export const cards: Card[] = [
  {
    id: "c1",
    songId: "s1",
    term: "folded",
    translation: "doblado / plegado",
    context: "I keep my worries folded in a drawer",
    lineIndex: 0,
    level: 2,
    dueInDays: 0,
  },
  {
    id: "c2",
    songId: "s1",
    term: "borrowed coat",
    translation: "abrigo prestado",
    context: "Hold the quiet like a borrowed coat",
    lineIndex: 6,
    level: 0,
    dueInDays: 0,
  },
  {
    id: "c3",
    songId: "s1",
    term: "gives up",
    translation: "se rinde",
    context: "And walk me home before the sun gives up",
    lineIndex: 7,
    level: 5,
    dueInDays: 12,
  },
  {
    id: "c4",
    songId: "s2",
    term: "lentement",
    translation: "lentamente",
    context: "La lumière tombe lentement sur la ville",
    lineIndex: 0,
    level: 3,
    dueInDays: 0,
  },
  {
    id: "c5",
    songId: "s2",
    term: "rien ne presse",
    translation: "no hay prisa",
    context: "Rien ne presse, tout revient",
    lineIndex: 5,
    level: 1,
    dueInDays: 0,
  },
  {
    id: "c6",
    songId: "s3",
    term: "devagar",
    translation: "despacio",
    context: "A maré chega devagar na minha porta",
    lineIndex: 0,
    level: 4,
    dueInDays: 3,
  },
  {
    id: "c7",
    songId: "s3",
    term: "saudade",
    translation: "nostalgia, añoranza",
    context: "Guardo a saudade numa concha",
    lineIndex: 6,
    level: 2,
    dueInDays: 0,
  },
  {
    id: "c8",
    songId: "s4",
    term: "piccole cose",
    translation: "pequeñas cosas",
    context: "Le piccole cose mi salvano ancora",
    lineIndex: 0,
    level: 5,
    dueInDays: 21,
  },
  {
    id: "c9",
    songId: "s4",
    term: "non ho fretta",
    translation: "no tengo prisa",
    context: "Non ho fretta di capire tutto",
    lineIndex: 4,
    level: 1,
    dueInDays: 0,
  },
];

export const getSong = (id: string) => songs.find((s) => s.id === id);
export const cardsForSong = (songId: string) => cards.filter((c) => c.songId === songId);
export const cardCount = (songId: string) => cardsForSong(songId).length;

export const thumbnail = (youtubeId: string) =>
  `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;

export const parseYouTubeId = (url: string): string | null => {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m?.[1]) return m[1];
  }
  return null;
};

export const stats = {
  streak: 12,
  bestStreak: 21,
  minutesToday: 18,
  mastered: cards.filter((c) => c.level >= 5).length,
  pending: cards.filter((c) => c.level < 5).length,
  byLanguage: [
    { language: "en" as Language, mastered: 1, total: 3 },
    { language: "fr" as Language, mastered: 0, total: 2 },
    { language: "pt" as Language, mastered: 0, total: 2 },
    { language: "it" as Language, mastered: 1, total: 2 },
  ],
  week: [
    { day: "L", cards: 8 },
    { day: "M", cards: 14 },
    { day: "X", cards: 6 },
    { day: "J", cards: 18 },
    { day: "V", cards: 11 },
    { day: "S", cards: 22 },
    { day: "D", cards: 9 },
  ],
};
