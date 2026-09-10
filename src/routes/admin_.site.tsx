import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { defaultSiteContent, fetchSiteContent, saveSiteSection, type BilingualText, type SiteContent } from "@/data/site-cms";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/site")({
  head: () => ({ meta: [{ title: "Site CMS — Illegal Caffeine" }, { name: "robots", content: "noindex,nofollow,noarchive" }] }),
  component: SiteAdminPage,
});

type Tab = keyof SiteContent;
type ProjectOption = { slug: string; title: string };

function SiteAdminPage() {
  const db = supabase as any;
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("homepage");
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      setEmail(session?.user.email ?? null);
      setReady(true);
      if (!session) return;
      const [site, projectResult] = await Promise.all([
        fetchSiteContent(),
        db.from("portfolio_projects").select("slug,title").order("sort_order", { ascending: true }),
      ]);
      setContent(site);
      if (!projectResult.error) setProjects((projectResult.data ?? []) as ProjectOption[]);
    });
  }, []);

  function patchSection<K extends Tab>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function saveCurrent() {
    setSaving(true);
    setMessage(null);
    const result = await saveSiteSection(tab, content[tab] as never);
    setSaving(false);
    if (result.error) {
      setMessage(String(result.error.message ?? result.error));
      return;
    }
    setMessage(`${tab.toUpperCase()} 저장 완료. 공개 페이지에 바로 반영돼.`);
  }

  async function uploadImage(file: File, onDone: (url: string) => void) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setMessage("JPG, PNG, WebP만 업로드할 수 있어.");
    if (file.size > 15 * 1024 * 1024) return setMessage("이미지는 장당 15MB 이하로 올려줘.");
    setMessage("이미지 업로드 중...");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `site/${tab}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) return setMessage(String(error.message ?? error));
    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    onDone(data.publicUrl);
    setMessage("업로드 완료. SAVE CHANGES를 눌러 반영해줘.");
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!email) return <div className="flex min-h-screen items-center justify-center bg-background px-5"><div className="border border-border p-8"><p className="label-mono">PRIVATE / SITE CMS</p><p className="mt-4 text-sm text-muted-foreground">먼저 /admin에서 로그인해줘.</p><Link to="/admin" className="label-mono mt-6 inline-flex min-h-12 items-center bg-foreground px-6 text-background">GO TO ADMIN</Link></div></div>;

  return (
    <div className="min-h-screen bg-background px-4 pb-20 pt-24 text-foreground md:px-8 md:pt-28">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div><p className="label-mono">PRIVATE / SITE CMS</p><h1 className="display-md mt-2">SITE CONTENT</h1><p className="mt-3 text-sm text-muted-foreground">{email}</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/admin" className="label-mono inline-flex min-h-11 items-center border border-border px-4">PROJECT CMS</Link><button type="button" onClick={() => void saveCurrent()} disabled={saving} className="label-mono inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-background disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE CHANGES</button></div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["homepage","faq","payment","contact","site"] as Tab[]).map((key) => <button key={key} type="button" onClick={() => { setTab(key); setMessage(null); }} className={`label-mono min-h-10 border px-4 ${tab === key ? "border-foreground bg-foreground text-background" : "border-border"}`}>{key.toUpperCase()}</button>)}
        </div>
        {message && <div className="mt-4 border border-border px-4 py-3 text-sm text-muted-foreground">{message}</div>}

        <div className="mt-6 border border-border p-5 md:p-8">
          {tab === "homepage" && <HomepageEditor value={content.homepage} projects={projects} patch={(value) => patchSection("homepage", value)} upload={uploadImage} />}
          {tab === "faq" && <FaqEditor value={content.faq} patch={(value) => patchSection("faq", value)} />}
          {tab === "payment" && <PaymentEditor value={content.payment} patch={(value) => patchSection("payment", value)} />}
          {tab === "contact" && <ContactEditor value={content.contact} patch={(value) => patchSection("contact", value)} />}
          {tab === "site" && <SiteEditor value={content.site} patch={(value) => patchSection("site", value)} />}
        </div>
      </div>
    </div>
  );
}

function HomepageEditor({ value, projects, patch, upload }: { value: SiteContent["homepage"]; projects: ProjectOption[]; patch: (value: SiteContent["homepage"]) => void; upload: (file: File, onDone: (url: string) => void) => Promise<void> }) {
  const p = <K extends keyof SiteContent["homepage"]>(key: K, next: SiteContent["homepage"][K]) => patch({ ...value, [key]: next });
  return <div className="space-y-10">
    <SectionTitle title="HERO" note="메인 첫 화면 문구와 배경 이미지" />
    <BiField label="HERO TITLE" value={value.hero_title} onChange={(v) => p("hero_title", v)} />
    <BiField label="HERO TAGLINE" value={value.hero_tagline} onChange={(v) => p("hero_tagline", v)} />
    <ImageField label="HERO BACKGROUND" url={value.hero_image_url} upload={(file) => upload(file, (url) => p("hero_image_url", url))} clear={() => p("hero_image_url", "")} />

    <SectionTitle title="SELECTED WORK" note="메인에 노출할 대표작 3개를 직접 선택" />
    <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map((index) => <label key={index}><span className="label-mono">PROJECT {index + 1}</span><select value={value.selected_work_slugs[index] ?? ""} onChange={(e) => { const next=[...value.selected_work_slugs]; next[index]=e.target.value; p("selected_work_slugs", next); }} className="mt-2 min-h-12 w-full border border-border bg-surface px-3 text-sm"><option value="">— NONE —</option>{projects.map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}</select></label>)}</div>

    <SectionTitle title="INTRO" note="선택 작품 위의 스튜디오 소개" />
    <BiField label="TITLE LINE 1" value={value.intro_title_1} onChange={(v) => p("intro_title_1", v)} /><BiField label="TITLE LINE 2" value={value.intro_title_2} onChange={(v) => p("intro_title_2", v)} /><BiArea label="BODY" value={value.intro_body} onChange={(v) => p("intro_body", v)} />

    <SectionTitle title="WHAT WE BUILD" note="건축 분류별 이름·설명·대표 이미지" />
    <div className="space-y-6">{value.disciplines.map((item, index) => <div key={item.id} className="border border-border p-4 md:p-6"><p className="label-mono">{String(index+1).padStart(2,"0")} / {item.id}</p><div className="mt-4 space-y-4"><BiField label="CATEGORY" value={item.label} onChange={(label) => p("disciplines", value.disciplines.map((d,i)=>i===index?{...d,label}:d))} /><BiArea label="NOTE" value={item.note} onChange={(note) => p("disciplines", value.disciplines.map((d,i)=>i===index?{...d,note}:d))} /><ImageField label="CATEGORY IMAGE" url={item.image_url} upload={(file)=>upload(file,(image_url)=>p("disciplines",value.disciplines.map((d,i)=>i===index?{...d,image_url}:d)))} clear={()=>p("disciplines",value.disciplines.map((d,i)=>i===index?{...d,image_url:""}:d))} /></div></div>)}</div>

    <SectionTitle title="ABOUT" note="소개 문구와 이미지" /><BiField label="TITLE LINE 1" value={value.about_title_1} onChange={(v)=>p("about_title_1",v)} /><BiField label="TITLE LINE 2" value={value.about_title_2} onChange={(v)=>p("about_title_2",v)} /><BiArea label="BODY" value={value.about_body} onChange={(v)=>p("about_body",v)} /><ImageField label="ABOUT IMAGE" url={value.about_image_url} upload={(file)=>upload(file,(url)=>p("about_image_url",url))} clear={()=>p("about_image_url","")} />

    <SectionTitle title="FINAL CTA" note="메인 하단 문의 유도 영역" /><BiField label="TITLE LINE 1" value={value.final_title_1} onChange={(v)=>p("final_title_1",v)} /><BiField label="TITLE LINE 2" value={value.final_title_2} onChange={(v)=>p("final_title_2",v)} /><BiArea label="BODY" value={value.final_body} onChange={(v)=>p("final_body",v)} /><ImageField label="BACKGROUND" url={value.final_image_url} upload={(file)=>upload(file,(url)=>p("final_image_url",url))} clear={()=>p("final_image_url","")} />
  </div>;
}

function FaqEditor({ value, patch }: { value: SiteContent["faq"]; patch: (value: SiteContent["faq"]) => void }) {
  return <div className="space-y-8"><SectionTitle title="FAQ PAGE" note="질문 추가·삭제·순서 변경 가능" /><BiField label="EYEBROW" value={value.eyebrow} onChange={(eyebrow)=>patch({...value,eyebrow})}/><BiField label="TITLE" value={value.title} onChange={(title)=>patch({...value,title})}/><BiArea label="INTRO" value={value.intro} onChange={(intro)=>patch({...value,intro})}/><BiArea label="SIDE NOTE" value={value.side_note} onChange={(side_note)=>patch({...value,side_note})}/><div className="space-y-4">{value.items.map((item,index)=><div key={index} className="border border-border p-4 md:p-6"><div className="flex items-center justify-between"><p className="label-mono">FAQ {index+1}</p><div className="flex gap-2"><SmallButton onClick={()=>move(value.items,index,-1,(items)=>patch({...value,items}))}><ArrowUp className="h-4 w-4"/></SmallButton><SmallButton onClick={()=>move(value.items,index,1,(items)=>patch({...value,items}))}><ArrowDown className="h-4 w-4"/></SmallButton><SmallButton onClick={()=>patch({...value,items:value.items.filter((_,i)=>i!==index)})}><Trash2 className="h-4 w-4"/></SmallButton></div></div><div className="mt-4 space-y-4"><BiField label="QUESTION" value={item.question} onChange={(question)=>patch({...value,items:value.items.map((x,i)=>i===index?{...x,question}:x)})}/><BiArea label="ANSWER" value={item.answer} onChange={(answer)=>patch({...value,items:value.items.map((x,i)=>i===index?{...x,answer}:x)})}/></div></div>)}</div><button type="button" onClick={()=>patch({...value,items:[...value.items,{question:{en:"New question",ko:"새 질문"},answer:{en:"",ko:""}}]})} className="label-mono inline-flex min-h-11 items-center gap-2 border border-border-strong px-4"><Plus className="h-4 w-4"/> ADD FAQ</button></div>;
}

function PaymentEditor({ value, patch }: { value: SiteContent["payment"]; patch:(value:SiteContent["payment"])=>void }) { return <div className="space-y-6"><SectionTitle title="PAYMENT PAGE" note="결제 페이지 문구" />{(["provider","title","heading","body_1","body_2","body_3"] as const).map((key)=>key.startsWith("body")?<BiArea key={key} label={key.toUpperCase()} value={value[key]} onChange={(v)=>patch({...value,[key]:v})}/>:<BiField key={key} label={key.toUpperCase()} value={value[key]} onChange={(v)=>patch({...value,[key]:v})}/>)}</div>; }
function ContactEditor({ value, patch }: { value: SiteContent["contact"]; patch:(value:SiteContent["contact"])=>void }) { return <div className="space-y-6"><SectionTitle title="CONTACT PAGE" note="문의 폼 상단 소개 문구. 폼 기능은 그대로 유지" /><BiField label="EYEBROW" value={value.eyebrow} onChange={(v)=>patch({...value,eyebrow:v})}/><BiField label="TITLE" value={value.title} onChange={(v)=>patch({...value,title:v})}/><BiArea label="INTRO" value={value.intro} onChange={(v)=>patch({...value,intro:v})}/></div>; }
function SiteEditor({ value, patch }: { value: SiteContent["site"]; patch:(value:SiteContent["site"])=>void }) { return <div className="space-y-6"><SectionTitle title="SITE-WIDE" note="공통 브랜드/연락처 정보" /><TextField label="BRAND" value={value.brand} onChange={(brand)=>patch({...value,brand})}/><TextField label="DISCORD" value={value.discord} onChange={(discord)=>patch({...value,discord})}/><TextField label="EMAIL" value={value.email} onChange={(email)=>patch({...value,email})}/></div>; }

function SectionTitle({ title, note }: { title:string; note:string }) { return <div className="border-b border-border pb-4"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{note}</p></div>; }
function TextField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="block"><span className="label-mono">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-foreground"/></label>; }
function BiField({label,value,onChange}:{label:string;value:BilingualText;onChange:(v:BilingualText)=>void}) { return <div className="grid gap-4 md:grid-cols-2"><TextField label={`${label} / EN`} value={value.en} onChange={(en)=>onChange({...value,en})}/><TextField label={`${label} / KO`} value={value.ko} onChange={(ko)=>onChange({...value,ko})}/></div>; }
function BiArea({label,value,onChange}:{label:string;value:BilingualText;onChange:(v:BilingualText)=>void}) { return <div className="grid gap-4 md:grid-cols-2"><Area label={`${label} / EN`} value={value.en} onChange={(en)=>onChange({...value,en})}/><Area label={`${label} / KO`} value={value.ko} onChange={(ko)=>onChange({...value,ko})}/></div>; }
function Area({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="block"><span className="label-mono">{label}</span><textarea rows={5} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 w-full resize-y border border-border bg-surface px-3 py-3 text-sm leading-6 outline-none focus:border-foreground"/></label>; }
function ImageField({label,url,upload,clear}:{label:string;url:string;upload:(file:File)=>void;clear:()=>void}) { return <div><div className="flex flex-wrap items-center justify-between gap-3"><span className="label-mono">{label}</span><div className="flex gap-2"><label className="label-mono inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3"><ImagePlus className="h-4 w-4"/> {url?"REPLACE":"UPLOAD"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e)=>{const f=e.target.files?.[0];if(f)upload(f);e.currentTarget.value="";}}/></label>{url&&<button type="button" onClick={clear} className="label-mono min-h-10 border border-border px-3">USE DEFAULT</button>}</div></div>{url?<div className="mt-3 aspect-[16/7] max-w-2xl overflow-hidden border border-border bg-surface"><img src={url} alt="" className="h-full w-full object-cover"/></div>:<p className="mt-3 text-xs text-muted-foreground">현재 기본 사이트 이미지를 사용 중. 업로드하면 CMS 이미지로 교체돼.</p>}</div>; }
function SmallButton({onClick,children}:{onClick:()=>void;children:React.ReactNode}) { return <button type="button" onClick={onClick} className="flex h-9 w-9 items-center justify-center border border-border">{children}</button>; }
function move<T>(items:T[],index:number,direction:-1|1,set:(items:T[])=>void){const target=index+direction;if(target<0||target>=items.length)return;const next=[...items];const a=next[index];const b=next[target];if(a===undefined||b===undefined)return;next[index]=b;next[target]=a;set(next);}
