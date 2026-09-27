import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Layers3, PartyPopper, RotateCcw, Shuffle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { languageFlag } from "@/lib/mock-data";
import { useAppData } from "@/lib/data-context";

export const Route = createFileRoute("/practica")({
  head: () => ({
    meta: [
      { title: "Modo práctica — LyricLingo" },
      {
        name: "description",
        content: "Repasa tus flashcards con repetición espaciada y tarjetas que se voltean.",
      },
      { property: "og:title", content: "Modo práctica — LyricLingo" },
      {
        property: "og:description",
        content: "Sesión de repaso estilo Anki con las palabras de tus canciones favoritas.",
      },
    ],
  }),
  component: Practice,
});

const GRADES = [
  { label: "Otra vez", grade: 0, className: "bg-destructive text-destructive-foreground" },
  { label: "Difícil", grade: 1, className: "bg-accent text-accent-foreground" },
  { label: "Bien", grade: 2, className: "bg-primary text-primary-foreground" },
  { label: "Fácil", grade: 3, className: "bg-primary-soft text-primary" },
];

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

type PracticeMode = "match" | "cards";

function Practice() {
  const { cards, songs, gradeCard } = useAppData();
  const [mode, setMode] = useState<PracticeMode>("match");
  const [sessionIds] = useState(() => {
    const currentDay = new Date().toISOString().slice(0, 10);
    return cards.filter((card) => card.dueAt <= currentDay).map((card) => card.id);
  });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);

  return (
    <AppShell title="Práctica" subtitle="Relaciona palabras o repasa tus tarjetas">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
        <Button variant={mode === "match" ? "default" : "ghost"} onClick={() => setMode("match")}>
          <Shuffle className="size-4" /> Emparejar
        </Button>
        <Button variant={mode === "cards" ? "default" : "ghost"} onClick={() => setMode("cards")}>
          <Layers3 className="size-4" /> Tarjetas
        </Button>
      </div>
      {mode === "match" ? (
        <MatchingPractice cards={cards} />
      ) : (
        <FlashcardPractice
          cards={cards}
          songs={songs}
          gradeCard={gradeCard}
          sessionIds={sessionIds}
          index={index}
          setIndex={setIndex}
          flipped={flipped}
          setFlipped={setFlipped}
          leaving={leaving}
          setLeaving={setLeaving}
        />
      )}
    </AppShell>
  );
}

type FlashcardPracticeProps = {
  cards: ReturnType<typeof useAppData>["cards"];
  songs: ReturnType<typeof useAppData>["songs"];
  gradeCard: ReturnType<typeof useAppData>["gradeCard"];
  sessionIds: string[];
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  flipped: boolean;
  setFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  leaving: boolean;
  setLeaving: React.Dispatch<React.SetStateAction<boolean>>;
};

function FlashcardPractice({
  cards,
  songs,
  gradeCard,
  sessionIds,
  index,
  setIndex,
  flipped,
  setFlipped,
  leaving,
  setLeaving,
}: FlashcardPracticeProps) {

  const card = cards.find((item) => item.id === sessionIds[index]);
  const done = index >= sessionIds.length || !card;

  const next = async (grade: number) => {
    if (!card) return;
    await gradeCard(card, grade);
    setLeaving(true);
    setTimeout(() => {
      setFlipped(false);
      setLeaving(false);
      setIndex((i) => i + 1);
    }, 260);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <PartyPopper className="size-12 text-accent" />
          <h2 className="text-xl font-extrabold">
            {sessionIds.length === 0 ? "No tienes tarjetas pendientes" : `¡Repasaste ${sessionIds.length} tarjetas!`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sessionIds.length === 0
              ? "Crea tarjetas desde una canción o vuelve cuando toque el siguiente repaso."
              : "Vuelve mañana para mantener tu racha."}
          </p>
          <div className="flex gap-2">
            <Button
              variant="soft"
              onClick={() => {
                setIndex(0);
                setFlipped(false);
              }}
            >
              <RotateCcw className="size-4" />
              Repetir
            </Button>
            <Button asChild variant="hero">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
      </div>
    );
  }

  const song = songs.find((item) => item.id === card.songId);

  return (
      <div className="space-y-6">
        <p className="text-center text-xs font-bold text-muted-foreground">
          {sessionIds.length - index} tarjetas restantes
        </p>
        <Progress value={(index / sessionIds.length) * 100} className="h-3" />

        <div
          className={`[perspective:1400px] transition-all duration-250 ${
            leaving ? "-translate-x-16 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <button
            onClick={() => setFlipped((f) => !f)}
            className="flip-3d relative block h-80 w-full text-left"
            style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
            aria-label="Voltear tarjeta"
          >
            <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-border bg-card p-8 text-center shadow-lift">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                {languageFlag(song?.language ?? "en")} {song?.title}
              </span>
              <p className="text-3xl font-extrabold text-card-foreground">{card.term}</p>
              <p className="text-sm italic text-muted-foreground">“{card.context}”</p>
              <p className="text-xs font-bold text-muted-foreground">Toca para ver la traducción</p>
            </div>
            <div
              className="backface-hidden absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-primary p-8 text-center text-primary-foreground shadow-lift"
              style={{ transform: "rotateY(180deg)" }}
            >
              <p className="text-sm font-bold opacity-80">{card.term}</p>
              <p className="text-3xl font-extrabold">{card.translation}</p>
              <p className="text-xs opacity-80">Nivel {card.level}/5</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button
              key={g.label}
              onClick={() => void next(g.grade)}
              disabled={!flipped}
              className={`tap rounded-2xl px-3 py-3.5 text-sm font-extrabold shadow-soft active:scale-95 disabled:opacity-40 ${g.className}`}
            >
              {g.label}
            </button>
          ))}
        </div>
        {!flipped ? (
          <p className="text-center text-xs font-semibold text-muted-foreground">
            Voltea la tarjeta para calificarla
          </p>
        ) : null}
      </div>
  );
}

function MatchingPractice({ cards }: { cards: ReturnType<typeof useAppData>["cards"] }) {
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => shuffled(cards).slice(0, 5), [cards, round]);
  const meanings = useMemo(() => shuffled(pairs), [pairs]);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);

  const restart = () => {
    setSelectedTerm(null);
    setSelectedMeaning(null);
    setMatched([]);
    setWrong(false);
    setRound((value) => value + 1);
  };

  const choose = (termId: string | null, meaningId: string | null) => {
    setSelectedTerm(termId);
    setSelectedMeaning(meaningId);
    if (!termId || !meaningId) return;
    if (termId === meaningId) {
      setMatched((current) => [...current, termId]);
      setSelectedTerm(null);
      setSelectedMeaning(null);
      setWrong(false);
    } else {
      setWrong(true);
      setTimeout(() => {
        setSelectedTerm(null);
        setSelectedMeaning(null);
        setWrong(false);
      }, 650);
    }
  };

  if (cards.length < 2) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="font-extrabold">Necesitas al menos 2 tarjetas</p>
        <p className="mt-2 text-sm text-muted-foreground">Crea palabras y significados desde una canción.</p>
      </div>
    );
  }

  if (matched.length === pairs.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <PartyPopper className="size-12 text-accent" />
        <h2 className="text-xl font-extrabold">¡Completaste los {pairs.length} pares!</h2>
        <Button variant="hero" onClick={restart}>
          <Shuffle className="size-4" /> Mezclar otra vez
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted-foreground">
          Une cada palabra con su significado · {matched.length}/{pairs.length}
        </p>
        <Button variant="ghost" size="icon" onClick={restart} aria-label="Mezclar de nuevo">
          <Shuffle className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {pairs.map((card) => {
            const complete = matched.includes(card.id);
            const selected = selectedTerm === card.id;
            return (
              <button
                key={card.id}
                disabled={complete || wrong}
                onClick={() => choose(card.id, selectedMeaning)}
                className={`min-h-16 w-full rounded-2xl border p-3 text-sm font-extrabold shadow-soft transition ${
                  complete
                    ? "border-primary/30 bg-primary-soft text-primary opacity-50"
                    : selected
                      ? wrong
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card"
                }`}
              >
                {complete ? <Check className="mx-auto mb-1 size-4" /> : null}
                {card.term}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {meanings.map((card) => {
            const complete = matched.includes(card.id);
            const selected = selectedMeaning === card.id;
            return (
              <button
                key={card.id}
                disabled={complete || wrong}
                onClick={() => choose(selectedTerm, card.id)}
                className={`min-h-16 w-full rounded-2xl border p-3 text-sm font-bold shadow-soft transition ${
                  complete
                    ? "border-primary/30 bg-primary-soft text-primary opacity-50"
                    : selected
                      ? wrong
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-accent bg-accent-soft text-accent-foreground"
                      : "border-border bg-card"
                }`}
              >
                {complete ? <Check className="mx-auto mb-1 size-4" /> : null}
                {card.translation}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
