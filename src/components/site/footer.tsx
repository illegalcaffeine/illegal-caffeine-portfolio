import { Link } from "@tanstack/react-router";
import { useLanguage, useT } from "@/i18n";

export function SiteFooter() {
  const t = useT();
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="label-mono text-foreground">ILLEGAL CAFFEINE - DESIGNER -</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t(
                "Independent worldbuilding studio.                Commissions for servers, creators and individuals.",
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="label-mono underline">{t("Navigate")}</p>
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

        <div className="mt-14 border-t border-border pt-6">
          <p className="label-mono text-foreground">
            {lang === "ko" ? "COPYRIGHT / 사용 안내" : "COPYRIGHT / USAGE NOTICE"}
          </p>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {lang === "ko"
              ? "이 사이트에 게시된 건축물, 이미지와 디자인은 ILLEGAL CAFFEINE의 포트폴리오 자료입니다. 별도의 허가 없이 이미지 또는 작업물을 재배포하거나 자신의 작업물로 표시하는 행위는 허용되지 않습니다. 의뢰를 통해 전달된 작업의 사용 범위는 해당 프로젝트의 합의 조건을 따릅니다."
              : "Builds, images and designs presented on this site are portfolio material of ILLEGAL CAFFEINE. Redistribution of images or work, or presenting them as your own, is not permitted without authorization. Usage rights for commissioned work follow the terms agreed for that project."}
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-border pt-6 md:flex-row">
          <p className="label-mono">© 2018{" "}ILLEGAL CAFFEINE - DESIGNER -</p>
          <p className="label-mono">{t("NOT AFFILIATED WITH MOJANG OR MICROSOFT")}</p>
        </div>
      </div>
    </footer>
  );
}
