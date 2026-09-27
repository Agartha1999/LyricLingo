import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import type { Card, Language, Song } from "./mock-data";

export type StoredCard = Card & {
  dueAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
};

export type AppData = {
  songs: Song[];
  cards: StoredCard[];
  reviewDates: string[];
};

export type NewSong = Omit<Song, "id">;
export type NewCard = Omit<
  StoredCard,
  "id" | "dueAt" | "interval" | "easeFactor" | "repetitions" | "level" | "dueInDays"
>;

const DB_NAME = "lyriclingo";
const WEB_KEY = "lyriclingo-data-v1";
const sqlite = new SQLiteConnection(CapacitorSQLite);
let database: SQLiteDBConnection | null = null;

const emptyData = (): AppData => ({ songs: [], cards: [], reviewDates: [] });
const today = () => new Date().toISOString().slice(0, 10);
const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

function isNative() {
  return Capacitor.isNativePlatform();
}

async function getDatabase() {
  if (database) return database;

  const consistency = await sqlite.checkConnectionsConsistency();
  const connected = await sqlite.isConnection(DB_NAME, false);
  if (consistency.result && connected.result) {
    database = await sqlite.retrieveConnection(DB_NAME, false);
  } else {
    database = await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
  }

  await database.open();
  await database.execute(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      language TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lyric_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id TEXT NOT NULL,
      text TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY NOT NULL,
      song_id TEXT NOT NULL,
      term TEXT NOT NULL,
      translation TEXT NOT NULL,
      context TEXT NOT NULL,
      line_index INTEGER NOT NULL,
      level INTEGER NOT NULL DEFAULT 0,
      due_at TEXT NOT NULL,
      interval_days INTEGER NOT NULL DEFAULT 0,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY NOT NULL,
      card_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      grade INTEGER NOT NULL,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_lyric_lines_song ON lyric_lines(song_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due_at);
  `);
  return database;
}

function loadWeb(): AppData {
  if (typeof window === "undefined") return emptyData();
  const raw = window.localStorage.getItem(WEB_KEY);
  if (!raw) return emptyData();
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return emptyData();
  }
}

function saveWeb(data: AppData) {
  window.localStorage.setItem(WEB_KEY, JSON.stringify(data));
}

export async function loadData(): Promise<AppData> {
  if (!isNative()) return loadWeb();

  const db = await getDatabase();
  const songRows = (await db.query("SELECT * FROM songs ORDER BY created_at DESC")).values ?? [];
  const lineRows =
    (await db.query("SELECT song_id, text FROM lyric_lines ORDER BY song_id, order_index")).values ?? [];
  const cardRows = (await db.query("SELECT * FROM cards ORDER BY created_at DESC")).values ?? [];
  const reviewRows =
    (await db.query("SELECT substr(reviewed_at, 1, 10) AS day FROM reviews ORDER BY reviewed_at DESC"))
      .values ?? [];

  const songs: Song[] = songRows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    artist: String(row.artist),
    language: row.language as Language,
    youtubeId: String(row.youtube_id),
    lines: lineRows.filter((line) => line.song_id === row.id).map((line) => String(line.text)),
  }));

  const cards: StoredCard[] = cardRows.map((row) => ({
    id: String(row.id),
    songId: String(row.song_id),
    term: String(row.term),
    translation: String(row.translation),
    context: String(row.context),
    lineIndex: Number(row.line_index),
    level: Number(row.level),
    dueAt: String(row.due_at),
    interval: Number(row.interval_days),
    easeFactor: Number(row.ease_factor),
    repetitions: Number(row.repetitions),
    dueInDays: 0,
  }));

  return { songs, cards, reviewDates: reviewRows.map((row) => String(row.day)) };
}

export async function insertSong(input: NewSong): Promise<string> {
  const songId = id("song");
  if (!isNative()) {
    const data = loadWeb();
    data.songs.unshift({ ...input, id: songId });
    saveWeb(data);
    return songId;
  }

  const db = await getDatabase();
  await db.run(
    "INSERT INTO songs (id, title, artist, language, youtube_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [songId, input.title, input.artist, input.language, input.youtubeId, new Date().toISOString()],
  );
  for (const [index, line] of input.lines.entries()) {
    await db.run("INSERT INTO lyric_lines (song_id, text, order_index) VALUES (?, ?, ?)", [
      songId,
      line,
      index,
    ]);
  }
  return songId;
}

export async function insertCard(input: NewCard): Promise<void> {
  const card: StoredCard = {
    ...input,
    id: id("card"),
    level: 0,
    dueAt: today(),
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    dueInDays: 0,
  };

  if (!isNative()) {
    const data = loadWeb();
    data.cards.unshift(card);
    saveWeb(data);
    return;
  }

  const db = await getDatabase();
  await db.run(
    `INSERT INTO cards
      (id, song_id, term, translation, context, line_index, level, due_at, interval_days, ease_factor, repetitions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      card.id,
      card.songId,
      card.term,
      card.translation,
      card.context,
      card.lineIndex,
      card.level,
      card.dueAt,
      card.interval,
      card.easeFactor,
      card.repetitions,
      new Date().toISOString(),
    ],
  );
}

export async function removeCard(cardId: string): Promise<void> {
  if (!isNative()) {
    const data = loadWeb();
    data.cards = data.cards.filter((card) => card.id !== cardId);
    saveWeb(data);
    return;
  }
  const db = await getDatabase();
  await db.run("DELETE FROM cards WHERE id = ?", [cardId]);
}

export async function reviewCard(card: StoredCard, grade: number): Promise<void> {
  let repetitions = card.repetitions;
  let easeFactor = card.easeFactor;
  let interval = card.interval;
  let level = card.level;

  if (grade === 0) {
    repetitions = 0;
    interval = 1;
    level = Math.max(0, level - 1);
  } else {
    repetitions += 1;
    if (grade === 1) {
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      interval = Math.max(1, Math.round(Math.max(interval, 1) * 1.2));
    } else if (grade === 2) {
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(interval * easeFactor);
      level = Math.min(5, level + 1);
    } else {
      easeFactor += 0.15;
      interval = Math.max(4, Math.round(Math.max(interval, 1) * easeFactor * 1.3));
      level = Math.min(5, level + 2);
    }
  }

  const due = new Date();
  due.setDate(due.getDate() + interval);
  const updated = { ...card, repetitions, easeFactor, interval, level, dueAt: due.toISOString().slice(0, 10) };

  if (!isNative()) {
    const data = loadWeb();
    data.cards = data.cards.map((item) => (item.id === card.id ? updated : item));
    data.reviewDates.unshift(today());
    saveWeb(data);
    return;
  }

  const db = await getDatabase();
  await db.run(
    "UPDATE cards SET level = ?, due_at = ?, interval_days = ?, ease_factor = ?, repetitions = ? WHERE id = ?",
    [level, updated.dueAt, interval, easeFactor, repetitions, card.id],
  );
  await db.run("INSERT INTO reviews (id, card_id, reviewed_at, grade) VALUES (?, ?, ?, ?)", [
    id("review"),
    card.id,
    new Date().toISOString(),
    grade,
  ]);
}
