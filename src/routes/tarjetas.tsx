import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { languageFlag } from "@/lib/mock-data";
import { useAppData } from "@/lib/data-context";

export const Route = createFileRoute("/tarjetas")({
  head: () => ({
    meta: [
      { title: "Mis tarjetas — LyricLingo" },
      {
        name: "description",
        content: "Todas tus flashcards de vocabulario agrupadas por canción, con su contexto.",
      },
      { property: "og:title", content: "Mis tarjetas — LyricLingo" },
      {
        property: "og:description",
        content: "Revisa, edita y organiza el vocabulario que sacaste de tus canciones.",
      },
    ],
  }),
  component: CardsScreen,
});

function CardsScreen() {
  const { cards, songs, deleteCard } = useAppData();

  return (
    <AppShell
      title="Mis tarjetas"
      subtitle={`${cards.length} tarjetas guardadas`}
      action={
        <Button asChild variant="accent" size="sm">
          <Link to="/practica">
            <Zap className="size-4" />
            Practicar
          </Link>
        </Button>
      }
    >
      <div className="space-y-7">
        {songs.map((song) => {
          const group = cards.filter((c) => c.songId === song.id);
          if (group.length === 0) return null;
          return (
            <section key={song.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                  {languageFlag(song.language)} {song.title}
                </h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {group.length}
                </span>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {group.map((card) => (
                  <li
                    key={card.id}
                    className="rounded-3xl border border-border bg-card p-4 shadow-soft"
                  >
                    <p className="text-lg font-extrabold text-card-foreground">{card.term}</p>
                    <p className="text-sm font-semibold text-primary">{card.translation}</p>
                    <p className="mt-2 border-l-2 border-accent/50 pl-3 text-xs italic text-muted-foreground">
                      {card.context}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                        Nivel {card.level}/5
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast("Edición disponible en la demo próximamente")}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await deleteCard(card.id);
                              toast.success("Tarjeta eliminada");
                            } catch (error) {
                              console.error(error);
                              toast.error("No se pudo eliminar la tarjeta");
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {cards.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Todavía no tienes tarjetas. Abre una canción y traduce un verso.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}

