import { Link } from "@tanstack/react-router";
import { useT } from "@/i18n";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="label-mono text-foreground">ILLEGAL CAFFEINE - DESIGNER -</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t(
                "Independent worldbuilding studio.\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 Commissions for servers, creators and individuals.",
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="label-mono">{t("Navigate")}</p>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              {t("Index")}
            </Link>
            <Link to="/work" className="text-sm text-muted-foreground hover:text-foreground">
              {t("archive")}
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              {t("Start a Project")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("EDITION / JAVA")}</p>
            <p className="text-sm text-muted-foreground">{t("COMMISSIONS / OPEN")}</p>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-border pt-6 md:flex-row">
          <p className="label-mono">© 2018{"\u00a0"}ILLEGAL CAFFEINE - DESIGNER -</p>
          <p className="label-mono">{t("NOT AFFILIATED WITH MOJANG OR MICROSOFT")}</p>
        </div>
      </div>
    </footer>
  );
}
