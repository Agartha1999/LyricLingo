import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  insertCard,
  insertSong,
  loadData,
  removeCard,
  reviewCard,
  saveLineTranslation,
  type AppData,
  type NewCard,
  type NewSong,
  type StoredCard,
} from "./data-store";

type DataContextValue = AppData & {
  ready: boolean;
  addSong: (song: NewSong) => Promise<string>;
  addCard: (card: NewCard) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  gradeCard: (card: StoredCard, grade: number) => Promise<void>;
  setLineTranslation: (songId: string, lineIndex: number, translation: string) => Promise<void>;
};

const DataContext = createContext<DataContextValue | null>(null);
const initial: AppData = { songs: [], cards: [], reviewDates: [], lineTranslations: [] };

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initial);
  const [ready, setReady] = useState(false);

  const refresh = async () => setData(await loadData());

  useEffect(() => {
    refresh()
      .catch((error) => console.error("No se pudo abrir el almacenamiento local", error))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      ...data,
      ready,
      addSong: async (song) => {
        const songId = await insertSong(song);
        await refresh();
        return songId;
      },
      addCard: async (card) => {
        await insertCard(card);
        await refresh();
      },
      deleteCard: async (cardId) => {
        await removeCard(cardId);
        await refresh();
      },
      gradeCard: async (card, grade) => {
        await reviewCard(card, grade);
        await refresh();
      },
      setLineTranslation: async (songId, lineIndex, translation) => {
        await saveLineTranslation(songId, lineIndex, translation);
        await refresh();
      },
    }),
    [data, ready],
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <p className="text-2xl font-extrabold text-primary">LyricLingo</p>
          <p className="mt-2 text-sm text-muted-foreground">Preparando tu biblioteca…</p>
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useAppData debe usarse dentro de DataProvider");
  return context;
}
