import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, PartyPopper } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cards, getSong, languageFlag } from "@/lib/mock-data";

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

const session = cards.filter((c) => c.dueInDays === 0);

const GRADES = [
  { label: "Otra vez", className: "bg-destructive text-destructive-foreground" },
  { label: "Difícil", className: "bg-accent text-accent-foreground" },
  { label: "Bien", className: "bg-primary text-primary-foreground" },
  { label: "Fácil", className: "bg-primary-soft text-primary" },
];

function Practice() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const card = session[index];
  const done = index >= session.length;

  const next = () => {
    setLeaving(true);
    setTimeout(() => {
      setFlipped(false);
      setLeaving(false);
      setIndex((i) => i + 1);
    }, 260);
  };

  if (done) {
    return (
      <AppShell title="Sesión completa">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <PartyPopper className="size-12 text-accent" />
          <h2 className="text-xl font-extrabold">¡Repasaste {session.length} tarjetas!</h2>
          <p className="text-sm text-muted-foreground">Vuelve mañana para mantener tu racha.</p>
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
      </AppShell>
    );
  }

  const song = getSong(card.songId);

  return (
    <AppShell title="Práctica" subtitle={`${session.length - index} tarjetas restantes`}>
      <div className="space-y-6">
        <Progress value={(index / session.length) * 100} className="h-3" />

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
              onClick={next}
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
    </AppShell>
  );
}
