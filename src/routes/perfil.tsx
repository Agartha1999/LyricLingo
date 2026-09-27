import { createFileRoute } from "@tanstack/react-router";
import { Flame, Trophy, Clock, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { stats, languageLabel, languageFlag } from "@/lib/mock-data";

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
  const total = stats.mastered + stats.pending;
  const maxWeek = Math.max(...stats.week.map((w) => w.cards));

  return (
    <AppShell title="Mi progreso" subtitle="Johana · aprendiendo 4 idiomas">
      <div className="space-y-6">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift">
          <div className="flex items-center gap-3">
            <Flame className="size-9" />
            <div>
              <p className="text-3xl font-extrabold leading-none">{stats.streak} días</p>
              <p className="text-sm opacity-90">Racha actual · récord {stats.bestStreak}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, value: stats.mastered, label: "Dominadas" },
            { icon: Target, value: stats.pending, label: "Pendientes" },
            { icon: Clock, value: `${stats.minutesToday}m`, label: "Hoy" },
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
          <Progress value={(stats.mastered / total) * 100} className="mt-3 h-3" />
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            {stats.mastered} de {total} tarjetas dominadas
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            Progreso por idioma
          </h2>
          <ul className="mt-4 space-y-4">
            {stats.byLanguage.map((l) => (
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
            {stats.week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
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
