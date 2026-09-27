import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy, Clock, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { LANGUAGES, languageLabel, languageFlag } from "@/lib/mock-data";
import { useAppData } from "@/lib/data-context";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi progreso — LyricLingo" },
      {
        name: "description",
        content: "Racha de estudio, tarjetas dominadas y progreso por idioma.",
      },
      { property: "og:title", content: "Mi progreso — LyricLingo" },
      {
        property: "og:description",
        content: "Mira tu racha, tus logros y cuánto vocabulario dominas en cada idioma.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { songs, cards, reviewDates } = useAppData();
  const mastered = cards.filter((card) => card.level >= 5).length;
  const pending = cards.length - mastered;
  const total = cards.length;
  const uniqueReviewDays = [...new Set(reviewDates)].sort().reverse();
  let streak = 0;
  const cursor = new Date();
  for (let offset = 0; offset <= uniqueReviewDays.length; offset += 1) {
    const day = cursor.toISOString().slice(0, 10);
    if (!uniqueReviewDays.includes(day)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const value = date.toISOString().slice(0, 10);
    return {
      day: ["D", "L", "M", "X", "J", "V", "S"][date.getDay()] ?? "",
      cards: reviewDates.filter((reviewDate) => reviewDate === value).length,
    };
  });
  const maxWeek = Math.max(1, ...week.map((item) => item.cards));
  const byLanguage = LANGUAGES.map((language) => {
    const songIds = songs.filter((song) => song.language === language.code).map((song) => song.id);
    const languageCards = cards.filter((card) => songIds.includes(card.songId));
    return {
      language: language.code,
      mastered: languageCards.filter((card) => card.level >= 5).length,
      total: languageCards.length,
    };
  }).filter((item) => item.total > 0);

  return (
    <AppShell title="Mi progreso" subtitle={`${songs.length} canciones en este teléfono`}>
      <div className="space-y-6">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift">
          <div className="flex items-center gap-3">
            <Flame className="size-9" />
            <div>
              <p className="text-3xl font-extrabold leading-none">{streak} días</p>
              <p className="text-sm opacity-90">Racha actual de práctica</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, value: mastered, label: "Dominadas" },
            { icon: Target, value: pending, label: "Pendientes" },
            { icon: Clock, value: reviewDates.filter((day) => day === new Date().toISOString().slice(0, 10)).length, label: "Hoy" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-3xl border border-border bg-card p-4 text-center shadow-soft"
            >
              <Icon className="mx-auto size-5 text-accent" />
              <p className="mt-2 text-xl font-extrabold text-card-foreground">{value}</p>
              <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Dominio general
          </h2>
          <Progress value={total ? (mastered / total) * 100 : 0} className="mt-3 h-3" />
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            {mastered} de {total} tarjetas dominadas
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Progreso por idioma
          </h2>
          <ul className="mt-4 space-y-4">
            {byLanguage.map((l) => (
              <li key={l.language}>
                <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
                  <span>
                    {languageFlag(l.language)} {languageLabel(l.language)}
                  </span>
                  <span className="text-muted-foreground">
                    {l.mastered}/{l.total}
                  </span>
                </div>
                <Progress value={(l.mastered / l.total) * 100} className="h-2.5" />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Esta semana
          </h2>
          <div className="mt-4 flex h-32 items-end justify-between gap-2">
            {week.map((d, index) => (
              <div key={`${d.day}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-accent transition-all"
                  style={{ height: `${(d.cards / maxWeek) * 100}%` }}
                />
                <span className="text-[11px] font-bold text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
