import { Link } from "@tanstack/react-router";
import { Code2, LogIn } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { lang, setLang, t } = useI18n();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <Link to="/" aria-label="Afristore">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <div className="flex rounded-full bg-muted p-0.5 text-xs font-semibold" role="group" aria-label="Langue / Language">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-2.5 py-1 uppercase ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link
            to={user ? "/developpeur" : "/auth"}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary hover:bg-secondary"
          >
            {user ? <Code2 className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span className="hidden sm:inline">{user ? t("devSpace") : t("login")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-12 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Logo variant="light" />
        <p className="mt-2 text-sm opacity-90">{t("slogan")}</p>
        <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link to="/a-propos" className="hover:underline">{t("aboutPage")}</Link>
          <Link to="/contact" className="hover:underline">{t("contact")}</Link>
          <Link to="/confidentialite" className="hover:underline">{t("privacy")}</Link>
          <Link to="/conditions" className="hover:underline">{t("terms")}</Link>
          <Link to="/developpeur" className="hover:underline">{t("devSpace")}</Link>
        </nav>
        <p className="mt-6 text-xs opacity-75">© {new Date().getFullYear()} Afristore</p>
      </div>
    </footer>
  );
}
