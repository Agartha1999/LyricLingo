import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Languages, Plus } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { languageFlag, languageLabel } from "@/lib/mock-data";
import { useAppData } from "@/lib/data-context";
import { OnDeviceTranslation } from "@/lib/translation";

export const Route = createFileRoute("/cancion/$songId")({
  head: () => ({ meta: [{ title: "Estudiar canción — LyricLingo" }] }),
  component: Player,
});

function Player() {
  const { songId } = Route.useParams();
  const { songs, cards, addCard } = useAppData();
  const song = songs.find((item) => item.id === songId);
  const existing = cards.filter((card) => card.songId === songId);
  const [cardLines, setCardLines] = useState<number[]>(existing.map((c) => c.lineIndex));
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [term, setTerm] = useState("");
  const [note, setNote] = useState("");
  const [translating, setTranslating] = useState(false);
  const [machineTranslated, setMachineTranslated] = useState(false);

  const open = (i: number) => {
    setSelected(i);
    setSelectedWords([]);
    setTerm("");
    setNote("");
    setTranslating(false);
    setMachineTranslated(false);
  };

  if (!song) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-xl font-extrabold">No encontramos esta canción</p>
        <Button asChild variant="hero">
          <Link to="/">Volver a la biblioteca</Link>
        </Button>
      </div>
    );
  }

  const selectedLine = selected !== null ? (song.lines[selected] ?? "") : "";
  const words =
    selectedLine.match(/[\p{L}\p{M}\p{N}]+(?:['’’-][\p{L}\p{M}\p{N}]+)*/gu) ?? [];

  const toggleWord = (wordIndex: number) => {
    const next = selectedWords.includes(wordIndex)
      ? selectedWords.filter((index) => index !== wordIndex)
      : [...selectedWords, wordIndex].sort((a, b) => a - b);
    setSelectedWords(next);
    setTerm(next.map((index) => words[index]).filter(Boolean).join(" "));
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
          Toca un verso y elige las palabras que quieres aprender
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
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="px-0">
            <SheetTitle className="text-left text-base">Selecciona una palabra o frase</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <p className="rounded-2xl bg-muted px-4 py-3 text-sm italic text-muted-foreground">
              “{selectedLine}”
            </p>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Toca una o varias palabras</Label>
              <div className="flex flex-wrap gap-2">
                {words.map((word, index) => {
                  const active = selectedWords.includes(index);
                  return (
                    <button
                      key={`${word}-${index}`}
                      type="button"
                      onClick={() => toggleWord(index)}
                      className={`tap rounded-full border px-3 py-2 text-sm font-bold active:scale-95 ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-card-foreground"
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term" className="text-sm font-bold">
                Palabra o frase para la tarjeta
              </Label>
              <Input
                id="term"
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setSelectedWords([]);
                }}
                placeholder="Selecciona arriba o escribe una frase"
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="translation" className="text-sm font-bold">
                Traducción o nota
              </Label>
              <Button
                type="button"
                variant="soft"
                className="w-full"
                disabled={!term.trim() || translating}
                onClick={async () => {
                  setTranslating(true);
                  try {
                    const result = await OnDeviceTranslation.translate({
                      text: term.trim(),
                      sourceLanguage: song.language,
                      targetLanguage: "es",
                    });
                    setNote(result.translation);
                    setMachineTranslated(true);
                  } catch (error) {
                    console.error(error);
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "No se pudo realizar la traducción automática",
                    );
                  } finally {
                    setTranslating(false);
                  }
                }}
              >
                <Languages className="size-4" />
                {translating ? "Descargando idioma y traduciendo…" : "Traducir con Google"}
              </Button>
              <Textarea
                id="translation"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe qué significa..."
                className="min-h-24 rounded-2xl"
              />
              {machineTranslated ? (
                <p className="text-center text-[11px] text-muted-foreground">
                  Traducción automática con la tecnología de{" "}
                  <a
                    href="https://translate.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary underline underline-offset-2"
                  >
                    Google Translate
                  </a>
                  . Puedes corregirla antes de guardar.
                </p>
              ) : null}
            </div>
            <Button
              variant="hero"
              className="w-full"
              disabled={!term.trim() || !note.trim()}
              onClick={async () => {
                if (selected === null) return;
                try {
                  await addCard({
                    songId: song.id,
                    term: term.trim(),
                    translation: note.trim(),
                    context: selectedLine,
                    lineIndex: selected,
                  });
                  setCardLines((lines) =>
                    lines.includes(selected) ? lines : [...lines, selected],
                  );
                  toast.success(`Tarjeta creada: ${term.trim()}`);
                  setSelected(null);
                } catch (error) {
                  console.error(error);
                  toast.error("No se pudo guardar la tarjeta");
                }
              }}
            >
              <Plus className="size-4" />
              Convertir en tarjeta
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}
