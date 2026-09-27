import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Music4, Link2, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, parseYouTubeId } from "@/lib/mock-data";
import { useAppData } from "@/lib/data-context";
import type { Language } from "@/lib/mock-data";

export const Route = createFileRoute("/agregar")({
  head: () => ({
    meta: [
      { title: "Agregar canción — LyricLingo" },
      {
        name: "description",
        content:
          "Pega el enlace de YouTube y la letra de una canción para empezar a estudiar vocabulario.",
      },
      { property: "og:title", content: "Agregar canción — LyricLingo" },
      {
        property: "og:description",
        content: "Pega un enlace de YouTube y la letra para crear tus flashcards.",
      },
    ],
  }),
  component: AddSong,
});

function AddSong() {
  const navigate = useNavigate();
  const { addSong } = useAppData();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [language, setLanguage] = useState("");
  const [saving, setSaving] = useState(false);
  const videoId = useMemo(() => parseYouTubeId(url), [url]);

  const ready = Boolean(videoId && title.trim() && artist.trim() && lyrics.trim() && language);

  return (
    <AppShell title="Agregar canción" subtitle="Pega el enlace y la letra">
      <div className="space-y-6">
        <section className="space-y-2">
          <Label htmlFor="yt" className="text-sm font-bold">
            Enlace de YouTube
          </Label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="yt"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="h-12 rounded-2xl pl-9"
            />
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-muted">
            {videoId ? (
              <iframe
                key={videoId}
                className="aspect-video w-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Vista previa"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 text-muted-foreground">
                <Music4 className="size-7" />
                <p className="text-xs font-semibold">La vista previa aparece aquí</p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la canción"
              className="h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist" className="text-sm font-bold">
              Artista
            </Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nombre del artista"
              className="h-12 rounded-2xl"
            />
          </div>
        </section>

        <section className="space-y-2">
          <Label htmlFor="lang" className="text-sm font-bold">
            Idioma de la canción
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="lang" className="h-12 rounded-2xl">
              <SelectValue placeholder="Elige un idioma" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-2">
          <Label htmlFor="lyrics" className="text-sm font-bold">
            Letra completa
          </Label>
          <Textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder={"Pega aquí la letra, una línea por verso..."}
            className="min-h-56 rounded-3xl leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            {lyrics.trim() ? lyrics.trim().split("\n").filter(Boolean).length : 0} líneas
            detectadas
          </p>
        </section>

        <Button
          size="lg"
          variant="hero"
          className="w-full"
          disabled={!ready || saving}
          onClick={async () => {
            if (!videoId) return;
            setSaving(true);
            try {
              const songId = await addSong({
                title: title.trim(),
                artist: artist.trim(),
                language: language as Language,
                youtubeId: videoId,
                lines: lyrics
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              });
              toast.success("Canción guardada en este teléfono");
              navigate({ to: "/cancion/$songId", params: { songId } });
            } catch (error) {
              console.error(error);
              toast.error("No se pudo guardar la canción");
            } finally {
              setSaving(false);
            }
          }}
        >
          <Check className="size-5" />
          {saving ? "Guardando…" : "Guardar y empezar a estudiar"}
        </Button>
      </div>
    </AppShell>
  );
}
