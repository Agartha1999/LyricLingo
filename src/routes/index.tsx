import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Layers, Flame } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  songs,
  cardCount,
  thumbnail,
  LANGUAGES,
  languageLabel,
  languageFlag,
  stats,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LyricLingo — Aprende idiomas con canciones" },
      {
        name: "description",
        content:
          "Tu biblioteca de canciones para aprender idiomas: letras, traducciones y flashcards con repetición espaciada.",
      },
      { property: "og:title", content: "LyricLingo — Aprende idiomas con canciones" },
      {
        property: "og:description",
        content: "Guarda canciones, traduce versos y repasa vocabulario con flashcards.",
      },
    ],
  }),
  component: Library,
});

function Library() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("all");

  const filtered = useMemo(
    () =>
      songs.filter((s) => {
        const matchLang = lang === "all" || s.language === lang;
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
        return matchLang && matchQuery;
      }),
    [query, lang],
  );

  return (
    <AppShell
      title="Mi biblioteca"
      subtitle={`${songs.length} canciones · ${stats.pending} tarjetas por repasar`}
      action={
        <div className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-extrabold text-accent-foreground">
          <Flame className="size-4" />
          {stats.streak}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canción o artista"
            className="h-12 rounded-2xl border-border bg-card pl-10"
          />
        </div>

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {[{ code: "all", label: "Todos", flag: "🌐" }, ...LANGUAGES].map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`tap shrink-0 rounded-full border px-4 py-2 text-sm font-bold active:scale-95 ${
                lang === l.code
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {filtered.map((song) => (
            <li key={song.id}>
              <Link
                to="/cancion/$songId"
                params={{ songId: song.id }}
                className="tap flex items-center gap-3 rounded-3xl border border-border bg-card p-3 shadow-soft active:scale-[0.98]"
              >
                <img
                  src={thumbnail(song.youtubeId)}
                  alt={song.title}
                  className="h-16 w-24 shrink-0 rounded-2xl object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-card-foreground">{song.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                      {languageFlag(song.language)} {languageLabel(song.language)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                      <Layers className="size-3.5" />
                      {cardCount(song.id)} tarjetas
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No encontramos canciones con ese filtro.
          </p>
        ) : null}
      </div>

      <Button asChild variant="hero" size="lg" className="fixed bottom-24 right-5 z-40 shadow-lift">
        <Link to="/agregar">
          <Plus className="size-5" />
          Agregar canción
        </Link>
      </Button>
    </AppShell>
  );
}
