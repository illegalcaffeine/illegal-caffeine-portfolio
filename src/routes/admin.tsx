import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, LogOut, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GenreMediaPanel, SiteContentPanel, type SiteAdminSection } from "@/components/admin/site-content-panel";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Portfolio Admin — Illegal Caffeine" }, { name: "robots", content: "noindex,nofollow,noarchive" }] }),
  component: AdminPage,
});

type GalleryItem = { url: string; caption_en: string; caption_ko: string };
type ProjectFilter = "spawns" | "cities" | "fantasy" | "terrain" | "commissions";
type EditorProject = {
  id: string;
  slug: string;
  title: string;
  category_en: string;
  category_ko: string;
  filter: ProjectFilter;
  description_en: string[];
  description_ko: string[];
  cover_url: string;
  gallery: GalleryItem[];
  award_en: string;
  award_ko: string;
  published: boolean;
  sort_order: number;
};
type AdminTab = "projects" | SiteAdminSection;

const FILTERS: Array<{ id: ProjectFilter; label: string; genreId: string }> = [
  { id: "spawns", label: "SPAWNS & HUBS", genreId: "spawns" },
  { id: "cities", label: "SPECIAL EFFECTS", genreId: "special-effects" },
  { id: "fantasy", label: "FANTASY", genreId: "fantasy" },
  { id: "terrain", label: "TERRAIN", genreId: "terrain" },
  { id: "commissions", label: "STREAMER SERVERS", genreId: "streamer" },
];
const ADMIN_TABS: Array<{ id: AdminTab; label: string }> = [
  { id: "projects", label: "PROJECTS" },
  { id: "homepage", label: "HOMEPAGE" },
  { id: "faq", label: "FAQ" },
  { id: "payment", label: "PAYMENT" },
  { id: "contact", label: "CONTACT" },
  { id: "site", label: "SITE" },
];

const emptyProject = (): EditorProject => ({
  id: crypto.randomUUID(), slug: "", title: "Untitled Project", category_en: "", category_ko: "", filter: "fantasy",
  description_en: [], description_ko: [], cover_url: "", gallery: [], award_en: "", award_ko: "", published: false, sort_order: 0,
});

function normalizeProject(row: Record<string, unknown>): EditorProject {
  const gallery = Array.isArray(row.gallery) ? row.gallery : [];
  return {
    id: String(row.id ?? crypto.randomUUID()),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Untitled Project"),
    category_en: String(row.category_en ?? ""),
    category_ko: String(row.category_ko ?? ""),
    filter: (row.filter as ProjectFilter) ?? "fantasy",
    description_en: Array.isArray(row.description_en) ? row.description_en.map(String) : [],
    description_ko: Array.isArray(row.description_ko) ? row.description_ko.map(String) : [],
    cover_url: String(row.cover_url ?? ""),
    gallery: gallery.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object").map((x) => ({
      url: String(x.url ?? ""), caption_en: String(x.caption_en ?? ""), caption_ko: String(x.caption_ko ?? ""),
    })),
    award_en: String(row.award_en ?? ""), award_ko: String(row.award_ko ?? ""),
    published: Boolean(row.published), sort_order: Number(row.sort_order ?? 0),
  };
}

function AdminPage() {
  const db = supabase as any;
  const [ready, setReady] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<EditorProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<ProjectFilter | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [setupMissing, setSetupMissing] = useState(false);

  const selected = useMemo(() => projects.find((project) => project.id === selectedId) ?? null, [projects, selectedId]);
  const projectOptions = useMemo(() => projects.map(({ slug, title }) => ({ slug, title })), [projects]);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSessionEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSessionEmail(session?.user.email ?? null));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!sessionEmail) { setProjects([]); setSelectedId(null); return; }
    void loadProjects();
  }, [sessionEmail]);

  async function loadProjects() {
    setLoading(true); setMessage(null); setSetupMissing(false);
    const { data, error } = await db.from("portfolio_projects").select("*").order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      const text = String(error.message ?? error);
      if (text.includes("does not exist") || text.includes("schema cache")) setSetupMissing(true);
      setMessage(text); return;
    }
    const next = ((data ?? []) as Record<string, unknown>[]).map(normalizeProject);
    setProjects(next);
    if (!selectedId && next[0]) setSelectedId(next[0].id);
  }

  function patchSelected(patch: Partial<EditorProject>) {
    if (!selectedId) return;
    setProjects((current) => current.map((project) => project.id === selectedId ? { ...project, ...patch } : project));
  }

  async function createProject(filter: ProjectFilter = "fantasy") {
    const draft = emptyProject(); draft.filter = filter; draft.sort_order = projects.length;
    const { data, error } = await db.from("portfolio_projects").insert({
      id: draft.id, slug: `new-project-${Date.now()}`, title: draft.title, category_en: null, category_ko: null,
      filter: draft.filter, description_en: [], description_ko: [], cover_url: null, gallery: [], award_en: null,
      award_ko: null, published: false, sort_order: draft.sort_order,
    }).select("*").single();
    if (error) { setMessage(String(error.message ?? error)); return; }
    const created = normalizeProject(data as Record<string, unknown>);
    setProjects((current) => [...current, created]); setSelectedGenre(null); setSelectedId(created.id); setMessage("새 프로젝트 초안을 만들었어.");
  }

  async function saveSelected() {
    if (!selected) return;
    if (!selected.slug.trim()) { setMessage("slug를 입력해줘."); return; }
    setSaving(true); setMessage(null);
    const { data, error } = await db.from("portfolio_projects").update({
      slug: selected.slug.trim(), title: selected.title.trim(), category_en: selected.category_en.trim() || null,
      category_ko: selected.category_ko.trim() || null, filter: selected.filter, description_en: selected.description_en,
      description_ko: selected.description_ko, cover_url: selected.cover_url.trim() || null, gallery: selected.gallery,
      award_en: selected.award_en.trim() || null, award_ko: selected.award_ko.trim() || null,
      published: selected.published, sort_order: selected.sort_order,
    }).eq("id", selected.id).select("*").single();
    setSaving(false);
    if (error) { setMessage(String(error.message ?? error)); return; }
    const saved = normalizeProject(data as Record<string, unknown>);
    setProjects((current) => current.map((project) => project.id === saved.id ? saved : project));
    setMessage("저장 완료. 공개 페이지에서 최신 데이터가 사용돼.");
  }

  async function deleteSelected() {
    if (!selected || !window.confirm(`'${selected.title}' 프로젝트를 삭제할까?`)) return;
    const { error } = await db.from("portfolio_projects").delete().eq("id", selected.id);
    if (error) { setMessage(String(error.message ?? error)); return; }
    const next = projects.filter((project) => project.id !== selected.id);
    setProjects(next); setSelectedId(null); setSelectedGenre(selected.filter); setMessage("삭제했어.");
  }

  async function uploadImage(file: File, kind: "cover" | "gallery") {
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("JPG, PNG, WebP만 업로드할 수 있어."); return; }
    if (file.size > 15 * 1024 * 1024) { setMessage("이미지는 장당 15MB 이하로 올려줘."); return; }
    setMessage("이미지 업로드 중...");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${selected.id}/${kind}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) { setMessage(String(error.message ?? error)); return; }
    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    if (kind === "cover") patchSelected({ cover_url: data.publicUrl });
    else patchSelected({ gallery: [...selected.gallery, { url: data.publicUrl, caption_en: "", caption_ko: "" }] });
    setMessage("업로드 완료. SAVE를 눌러 반영해줘.");
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!sessionEmail) return <AdminLogin />;

  return <div className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground md:px-8 md:pt-28"><div className="mx-auto max-w-[1500px]">
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div><p className="label-mono">PRIVATE / CMS</p><h1 className="display-md mt-2">PORTFOLIO ADMIN</h1><p className="mt-3 text-sm text-muted-foreground">{sessionEmail}</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setTab("projects"); void createProject(); }} className="label-mono inline-flex min-h-11 items-center gap-2 border border-border-strong px-4 hover:bg-foreground hover:text-background"><Plus className="h-4 w-4" /> NEW PROJECT</button><button type="button" onClick={() => void supabase.auth.signOut()} className="label-mono inline-flex min-h-11 items-center gap-2 border border-border px-4"><LogOut className="h-4 w-4" /> LOG OUT</button></div>
    </div>

    <div className="mt-6 flex flex-wrap gap-2">{ADMIN_TABS.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setMessage(null); }} className={`label-mono min-h-10 border px-4 ${tab === item.id ? "border-foreground bg-foreground text-background" : "border-border hover:border-border-strong"}`}>{item.label}</button>)}</div>

    {setupMissing && <div className="mt-6 border border-border-strong p-5 text-sm leading-7 text-muted-foreground">CMS 테이블이 아직 없어. GitHub 루트의 <span className="text-foreground">ADMIN_CMS_SETUP.sql</span>을 Supabase SQL Editor에서 한 번 실행하면 돼.</div>}
    {message && tab === "projects" && <div className="mt-4 border border-border px-4 py-3 text-sm text-muted-foreground">{message}</div>}

    {tab !== "projects" ? <div className="mt-6"><SiteContentPanel section={tab} projects={projectOptions} /></div> :
      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="border border-border bg-surface/30">
          <div className="border-b border-border px-4 py-3 label-mono">PROJECT LIBRARY / {projects.length}</div>
          {loading ? <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : projects.length === 0 ? <p className="p-5 text-sm text-muted-foreground">아직 CMS 프로젝트가 없어.</p> : <div>{FILTERS.map((group) => {
            const items = projects.filter((project) => project.filter === group.id);
            const genreActive = selectedGenre === group.id && !selectedId;
            return <section key={group.id} className="border-b border-border">
              <div className={`flex items-center justify-between px-4 py-3 ${genreActive ? "bg-foreground text-background" : "bg-surface/60"}`}>
                <button type="button" onClick={() => { setSelectedGenre(group.id); setSelectedId(null); setMessage(null); }} className="min-w-0 flex-1 text-left"><span className="label-mono">{group.label}</span><span className="ml-2 text-xs opacity-60">{items.length}</span><span className="mt-1 block text-[10px] opacity-60">CLICK TO EDIT GENRE IMAGES</span></button>
                <button type="button" onClick={() => void createProject(group.id)} className={`label-mono ml-3 border px-2 py-1 text-[10px] ${genreActive ? "border-background/40" : "border-border"}`}>+ ADD</button>
              </div>
              {items.length === 0 ? <p className="px-4 py-3 text-xs text-muted-foreground">NO PROJECTS</p> : items.map((project) => <button type="button" key={project.id} onClick={() => { setSelectedGenre(project.filter); setSelectedId(project.id); setMessage(null); }} className={`block w-full border-t border-border px-5 py-3 text-left transition-colors ${selectedId === project.id ? "bg-foreground text-background" : "hover:bg-surface"}`}><span className="block text-sm font-semibold">{project.title}</span><span className="mt-1 block text-xs opacity-65">/{project.slug} · {project.published ? "PUBLIC" : "DRAFT"}</span></button>)}
            </section>;
          })}</div>}
        </aside>

        <main className="min-w-0">
          {selectedGenre && !selectedId ? <GenreMediaPanel genreId={FILTERS.find((item) => item.id === selectedGenre)?.genreId ?? selectedGenre} title={FILTERS.find((item) => item.id === selectedGenre)?.label ?? selectedGenre} /> : !selected ? <div className="flex min-h-[420px] items-center justify-center border border-border p-8 text-center text-sm text-muted-foreground">왼쪽에서 장르명을 누르면 장르 이미지를 관리하고, 그 아래 프로젝트명을 누르면 프로젝트를 편집할 수 있어.</div> : <ProjectEditor selected={selected} saving={saving} patchSelected={patchSelected} deleteSelected={deleteSelected} saveSelected={saveSelected} uploadImage={uploadImage} />}
        </main>
      </div>}
  </div></div>;
}

function ProjectEditor({ selected, saving, patchSelected, deleteSelected, saveSelected, uploadImage }: {
  selected: EditorProject; saving: boolean; patchSelected: (patch: Partial<EditorProject>) => void;
  deleteSelected: () => Promise<void>; saveSelected: () => Promise<void>; uploadImage: (file: File, kind: "cover" | "gallery") => Promise<void>;
}) {
  return <div className="space-y-8 border border-border p-5 md:p-8">
    <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="label-mono">EDIT PROJECT / {FILTERS.find((item) => item.id === selected.filter)?.label}</p><h2 className="mt-2 text-xl font-semibold">{selected.title}</h2></div><div className="flex gap-2"><button type="button" onClick={() => void deleteSelected()} className="label-mono inline-flex min-h-11 items-center gap-2 border border-border px-4"><Trash2 className="h-4 w-4" /> DELETE</button><button type="button" disabled={saving} onClick={() => void saveSelected()} className="label-mono inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-background disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE</button></div></div>
    <div className="grid gap-5 md:grid-cols-2"><AdminField label="TITLE" value={selected.title} onChange={(value) => patchSelected({ title: value })} /><AdminField label="SLUG" value={selected.slug} onChange={(value) => patchSelected({ slug: value })} /><AdminField label="CATEGORY / EN" value={selected.category_en} onChange={(value) => patchSelected({ category_en: value })} /><AdminField label="CATEGORY / KO" value={selected.category_ko} onChange={(value) => patchSelected({ category_ko: value })} /><label><span className="label-mono">PARENT GENRE</span><select value={selected.filter} onChange={(e) => patchSelected({ filter: e.target.value as ProjectFilter })} className="mt-2 min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-foreground">{FILTERS.map((filter) => <option key={filter.id} value={filter.id}>{filter.label}</option>)}</select></label><AdminField label="SORT ORDER" type="number" value={String(selected.sort_order)} onChange={(value) => patchSelected({ sort_order: Number(value) || 0 })} /></div>
    <div className="grid gap-5 md:grid-cols-2"><AdminTextarea label="DESCRIPTION / EN" value={selected.description_en.join("\n\n")} onChange={(value) => patchSelected({ description_en: splitParagraphs(value) })} /><AdminTextarea label="DESCRIPTION / KO" value={selected.description_ko.join("\n\n")} onChange={(value) => patchSelected({ description_ko: splitParagraphs(value) })} /></div>
    <div className="grid gap-5 md:grid-cols-2"><AdminField label="AWARD / EN" value={selected.award_en} onChange={(value) => patchSelected({ award_en: value })} /><AdminField label="AWARD / KO" value={selected.award_ko} onChange={(value) => patchSelected({ award_ko: value })} /></div>
    <section><div className="flex items-center justify-between gap-3"><p className="label-mono">COVER IMAGE</p><label className="label-mono inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3"><ImagePlus className="h-4 w-4" /> REPLACE<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file, "cover"); e.currentTarget.value = ""; }} /></label></div><div className="mt-3 aspect-[16/9] overflow-hidden border border-border bg-surface">{selected.cover_url ? <img src={selected.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">NO COVER</div>}</div></section>
    <section><div className="flex items-center justify-between gap-3"><p className="label-mono">GALLERY / {selected.gallery.length}</p><label className="label-mono inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3"><ImagePlus className="h-4 w-4" /> ADD IMAGES<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { Array.from(e.target.files ?? []).forEach((file) => void uploadImage(file, "gallery")); e.currentTarget.value = ""; }} /></label></div><div className="mt-4 space-y-4">{selected.gallery.map((item, index) => <div key={`${item.url}-${index}`} className="grid gap-4 border border-border p-3 md:grid-cols-[220px_minmax(0,1fr)_auto]"><div className="aspect-[4/3] overflow-hidden bg-surface"><img src={item.url} alt="" className="h-full w-full object-cover" /></div><div className="space-y-3"><AdminField label="CAPTION / EN" value={item.caption_en} onChange={(value) => patchGallery(selected, index, { caption_en: value }, patchSelected)} /><AdminField label="CAPTION / KO" value={item.caption_ko} onChange={(value) => patchGallery(selected, index, { caption_ko: value }, patchSelected)} /></div><div className="flex gap-2 md:flex-col"><IconButton label="위로" onClick={() => moveGallery(selected, index, -1, patchSelected)}><ArrowUp className="h-4 w-4" /></IconButton><IconButton label="아래로" onClick={() => moveGallery(selected, index, 1, patchSelected)}><ArrowDown className="h-4 w-4" /></IconButton><IconButton label="삭제" onClick={() => patchSelected({ gallery: selected.gallery.filter((_, i) => i !== index) })}><X className="h-4 w-4" /></IconButton></div></div>)}</div></section>
    <label className="flex items-center gap-3 border-t border-border pt-6 text-sm"><input type="checkbox" checked={selected.published} onChange={(e) => patchSelected({ published: e.target.checked })} className="h-4 w-4" /><span>Published — 공개 사이트에 표시</span></label>
  </div>;
}

function AdminLogin() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  async function login(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(null); const result = await supabase.auth.signInWithPassword({ email, password }); setLoading(false); if (result.error) setError(result.error.message); }
  return <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground"><form onSubmit={login} className="w-full max-w-md border border-border p-6 md:p-8"><p className="label-mono">PRIVATE / AUTH</p><h1 className="display-md mt-3">PORTFOLIO ADMIN</h1><div className="mt-8 space-y-5"><AdminField label="EMAIL" type="email" value={email} onChange={setEmail} /><AdminField label="PASSWORD" type="password" value={password} onChange={setPassword} /></div>{error && <p className="mt-4 text-sm text-destructive">{error}</p>}<button type="submit" disabled={loading} className="label-mono mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-foreground px-5 text-background disabled:opacity-50">{loading && <Loader2 className="h-4 w-4 animate-spin" />} SIGN IN</button></form></div>;
}
function AdminField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block"><span className="label-mono">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 min-h-12 w-full border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-foreground" /></label>; }
function AdminTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="label-mono">{label}</span><textarea rows={9} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full resize-y border border-border bg-surface px-3 py-3 text-sm leading-6 text-foreground outline-none focus:border-foreground" /></label>; }
function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-label={label} onClick={onClick} className="flex h-10 w-10 items-center justify-center border border-border hover:bg-foreground hover:text-background">{children}</button>; }
function splitParagraphs(value: string) { return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean); }
function patchGallery(project: EditorProject, index: number, patch: Partial<GalleryItem>, update: (patch: Partial<EditorProject>) => void) { update({ gallery: project.gallery.map((item, i) => i === index ? { ...item, ...patch } : item) }); }
function moveGallery(project: EditorProject, index: number, direction: -1 | 1, update: (patch: Partial<EditorProject>) => void) { const target = index + direction; if (target < 0 || target >= project.gallery.length) return; const next = [...project.gallery]; const current = next[index], other = next[target]; if (!current || !other) return; next[index] = other; next[target] = current; update({ gallery: next }); }
