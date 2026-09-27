import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getSong, cardsForSong, languageFlag, languageLabel } from "@/lib/mock-data";

export const Route = createFileRoute("/cancion/$songId")({
  loader: ({ params }) => {
    const song = getSong(params.songId);
    if (!song) throw notFound();
    return { song };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Canción no encontrada — LyricLingo" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.song.title} — LyricLingo`;
    const d = `Estudia "${loaderData.song.title}" de ${loaderData.song.artist} verso por verso y crea tus flashcards.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  component: Player,
});

function Player() {
  const { song } = Route.useLoaderData();
  const existing = cardsForSong(song.id);
  const [cardLines, setCardLines] = useState<number[]>(existing.map((c) => c.lineIndex));
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [autoTranslated, setAutoTranslated] = useState(false);

  const open = (i: number) => {
    setSelected(i);
    setNote("");
    setAutoTranslated(false);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0 rounded-full">
            <Link to="/">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="truncate font-extrabold leading-tight">{song.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {song.artist} · {languageFlag(song.language)} {languageLabel(song.language)}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <iframe
            className="aspect-video w-full rounded-3xl shadow-soft"
            src={`https://www.youtube.com/embed/${song.youtubeId}`}
            title={song.title}
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 pt-2">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Toca un verso para traducirlo
        </p>
        <ul className="space-y-2">
          {song.lines.map((line, i) => {
            const hasCard = cardLines.includes(i);
            return (
              <li key={i}>
                <button
                  onClick={() => open(i)}
                  className={`tap w-full rounded-2xl border px-4 py-3 text-left text-[15px] leading-relaxed active:scale-[0.99] ${
                    hasCard
                      ? "border-accent/40 bg-accent-soft font-semibold text-accent-foreground"
                      : "border-transparent bg-card text-card-foreground"
                  }`}
                >
                  {line}
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="px-0">
            <SheetTitle className="text-left text-base">
              {selected !== null ? song.lines[selected] : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <Button
              variant="soft"
              className="w-full"
              onClick={() => {
                setAutoTranslated(true);
                setNote("Traducción sugerida automáticamente (demo)");
              }}
            >
              <Sparkles className="size-4" />
              Traducir automáticamente
            </Button>
            {autoTranslated ? (
              <p className="rounded-2xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
                Traducción sugerida automáticamente (demo)
              </p>
            ) : null}
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe tu propia traducción o nota..."
              className="min-h-24 rounded-2xl"
            />
            <Button
              variant="hero"
              className="w-full"
              disabled={!note.trim()}
              onClick={() => {
                if (selected !== null && !cardLines.includes(selected)) {
                  setCardLines([...cardLines, selected]);
                }
                toast.success("Tarjeta creada");
                setSelected(null);
              }}
            >
              {selected !== null && cardLines.includes(selected) ? (
                <Check className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              Convertir en tarjeta
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}
