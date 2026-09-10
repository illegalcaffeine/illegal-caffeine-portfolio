import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { portfolioSeedRows } from "@/data/portfolio-cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/import")({
  head: () => ({
    meta: [
      { title: "Import Portfolio — Illegal Caffeine Admin" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: ImportPortfolioPage,
});

function ImportPortfolioPage() {
  const db = supabase as any;
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      const signedIn = Boolean(data.session);
      setAuthenticated(signedIn);
      setReady(true);
      if (!signedIn) return;
      const result = await db.from("portfolio_projects").select("id", { count: "exact", head: true });
      if (!result.error) setCount(result.count ?? 0);
    });
  }, []);

  async function importPortfolio() {
    setImporting(true);
    setMessage(null);
    const rows = portfolioSeedRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      category_en: row.category_en || null,
      category_ko: row.category_ko || null,
      filter: row.filter,
      description_en: row.description_en,
      description_ko: row.description_ko,
      cover_url: row.cover_url || null,
      gallery: row.gallery,
      award_en: row.award_en || null,
      award_ko: row.award_ko || null,
      published: row.published,
      sort_order: row.sort_order,
    }));

    const { error } = await db.from("portfolio_projects").upsert(rows, { onConflict: "slug" });
    setImporting(false);
    if (error) {
      setMessage(String(error.message ?? error));
      return;
    }
    setCount(rows.length);
    setDone(true);
    setMessage(`기존 포트폴리오 ${rows.length}개를 CMS에 연결했어.`);
  }

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="w-full max-w-lg border border-border p-6 md:p-8">
          <p className="label-mono">PRIVATE / IMPORT</p>
          <h1 className="display-md mt-3">SIGN IN FIRST</h1>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">먼저 /admin에서 로그인한 뒤 이 페이지로 돌아와줘.</p>
          <Link to="/admin" className="label-mono mt-7 inline-flex min-h-12 items-center bg-foreground px-6 text-background">GO TO ADMIN</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 pb-16 pt-28 text-foreground md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="label-mono">PRIVATE / ONE-TIME SETUP</p>
        <h1 className="display-md mt-3">IMPORT CURRENT PORTFOLIO</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
          현재 코드에 있는 기존 프로젝트를 Supabase CMS의 최초 데이터로 복사해. 기존 공개 사이트 이미지는 그대로 유지하고,
          이후 /admin에서 바꾼 내용이 INDEX, ARCHIVE, 프로젝트 상세페이지에 반영돼.
        </p>

        <div className="mt-8 border border-border p-5">
          <p className="label-mono">CMS STATUS</p>
          <p className="mt-3 text-sm text-muted-foreground">현재 CMS 프로젝트: <span className="text-foreground">{count ?? "확인 중"}</span></p>
          <p className="mt-2 text-sm text-muted-foreground">가져올 기존 프로젝트: <span className="text-foreground">{portfolioSeedRows.length}</span></p>
        </div>

        {message && (
          <div className="mt-4 flex items-start gap-3 border border-border px-4 py-4 text-sm text-muted-foreground">
            {done && <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />}
            <span>{message}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void importPortfolio()}
            disabled={importing}
            className="label-mono inline-flex min-h-12 items-center justify-center gap-3 bg-foreground px-6 text-background disabled:opacity-50"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {count && count > 0 ? "SYNC EXISTING PORTFOLIO" : "IMPORT EXISTING PORTFOLIO"}
          </button>
          <Link to="/admin" className="label-mono inline-flex min-h-12 items-center justify-center border border-border-strong px-6 text-foreground">
            BACK TO ADMIN
          </Link>
        </div>

        <p className="mt-6 text-xs leading-6 text-muted-foreground">
          같은 slug가 있으면 중복 생성하지 않고 현재 기본 데이터로 동기화돼. 최초 이전이 끝난 뒤에는 이 페이지를 다시 사용할 필요 없어.
        </p>
      </div>
    </div>
  );
}
