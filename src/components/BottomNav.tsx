import { Link } from "@tanstack/react-router";
import { Home, PlusCircle, Layers, Zap, User } from "lucide-react";

const items = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/agregar", label: "Agregar", icon: PlusCircle },
  { to: "/tarjetas", label: "Tarjetas", icon: Layers },
  { to: "/practica", label: "Práctica", icon: Zap },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md sm:mx-auto sm:mb-4 sm:max-w-lg sm:rounded-3xl sm:border sm:shadow-soft">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex flex-col items-center gap-1 rounded-2xl py-2.5 text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5 transition-transform duration-200 group-active:scale-90" />
              <span className="text-[10px] font-semibold tracking-tight">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
