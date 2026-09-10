import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  defaultSiteContent,
  fetchSiteContent,
  saveSiteSection,
  type BilingualText,
  type DisciplineContent,
  type SiteContent,
} from "@/data/site-cms";
import { supabase } from "@/integrations/supabase/client";

export type SiteAdminSection = keyof SiteContent;
export type ProjectOption = { slug: string; title: string };

type UploadFn = (file: File, onDone: (url: string) => void) => Promise<void>;

export function SiteContentPanel({ section, projects }: { section: SiteAdminSection; projects: ProjectOption[] }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void fetchSiteContent().then((next) => {
      if (!mounted) return;
      setContent(next);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  function patchSection<K extends SiteAdminSection>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function saveCurrent() {
    setSaving(true);
    setMessage(null);
    const result = await saveSiteSection(section, content[section] as never);
    setSaving(false);
    setMessage(result.error ? String(result.error.message ?? result.error) : `${section.toUpperCase()} 저장 완료.`);
  }

  async function uploadImage(file: File, onDone: (url: string) => void) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("JPG, PNG, WebP만 업로드할 수 있어."); return; }
    if (file.size > 15 * 1024 * 1024) { setMessage("이미지는 장당 15MB 이하로 올려줘."); return; }
    setMessage("이미지 업로드 중...");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `site/${section}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) { setMessage(String(error.message ?? error)); return; }
    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    onDone(data.publicUrl);
    setMessage("업로드 완료. SAVE CHANGES를 눌러 반영해줘.");
  }

  if (loading) return <div className="flex min-h-[360px] items-center justify-center border border-border"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return <div>
    <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="label-mono">EDIT SITE CONTENT</p><h2 className="mt-2 text-xl font-semibold">{section.toUpperCase()}</h2></div>
      <button type="button" onClick={() => void saveCurrent()} disabled={saving} className="label-mono inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-background disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE CHANGES</button>
    </div>
    {message && <div className="mb-5 border border-border px-4 py-3 text-sm text-muted-foreground">{message}</div>}
    <div className="border border-border p-5 md:p-8">
      {section === "homepage" && <HomepageEditor value={content.homepage} projects={projects} patch={(value) => patchSection("homepage", value)} upload={uploadImage} />}
      {section === "faq" && <FaqEditor value={content.faq} patch={(value) => patchSection("faq", value)} />}
      {section === "payment" && <PaymentEditor value={content.payment} patch={(value) => patchSection("payment", value)} />}
      {section === "contact" && <ContactEditor value={content.contact} patch={(value) => patchSection("contact", value)} />}
      {section === "site" && <SiteEditor value={content.site} patch={(value) => patchSection("site", value)} />}
    </div>
  </div>;
}

export function GenreMediaPanel({ genreId, title }: { genreId: string; title: string }) {
  const [home, setHome] = useState<SiteContent["homepage"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void fetchSiteContent().then((content) => setHome(content.homepage)); }, [genreId]);
  const index = useMemo(() => home?.disciplines.findIndex((item) => item.id === genreId) ?? -1, [home, genreId]);
  const item = index >= 0 && home ? home.disciplines[index] : null;
  if (!home || !item) return <div className="flex min-h-[360px] items-center justify-center border border-border"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const images = disciplineImages(item);
  function patchItem(next: DisciplineContent) {
    if (!home || index < 0) return;
    setHome({ ...home, disciplines: home.disciplines.map((entry, i) => i === index ? next : entry) });
  }
  async function upload(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("JPG, PNG, WebP만 업로드할 수 있어."); return; }
    if (file.size > 15 * 1024 * 1024) { setMessage("이미지는 장당 15MB 이하로 올려줘."); return; }
    setMessage("장르 이미지 업로드 중...");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `site/genre-${genreId}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) { setMessage(String(error.message ?? error)); return; }
    const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    const nextImages = [...images, data.publicUrl];
    patchItem({ ...item, image_urls: nextImages, image_url: nextImages[0] ?? "" });
    setMessage("업로드 완료. SAVE GENRE를 눌러 반영해줘.");
  }
  async function save() {
    if (!home) return;
    setSaving(true); setMessage(null);
    const result = await saveSiteSection("homepage", home);
    setSaving(false);
    setMessage(result.error ? String(result.error.message ?? result.error) : `${title} 장르 설정 저장 완료.`);
  }
  function setImages(nextImages: string[]) { patchItem({ ...item, image_urls: nextImages, image_url: nextImages[0] ?? "" }); }

  return <div className="space-y-6 border border-border p-5 md:p-8">
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="label-mono">GENRE / MEDIA</p><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">이 장르의 대표 이미지를 여러 장 관리해. 첫 번째 이미지가 홈 WHAT WE BUILD의 대표 이미지로 사용돼.</p></div><button type="button" onClick={() => void save()} disabled={saving} className="label-mono inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-background disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} SAVE GENRE</button></div>
    {message && <div className="border border-border px-4 py-3 text-sm text-muted-foreground">{message}</div>}
    <BiField label="GENRE NAME" value={item.label} onChange={(label) => patchItem({ ...item, label })} />
    <div><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="label-mono">GENRE IMAGES / {images.length}</p><p className="mt-2 text-xs text-muted-foreground">위에서부터 순서대로 관리돼. 01번이 홈 대표 이미지야.</p></div><label className="label-mono inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3"><ImagePlus className="h-4 w-4" /> ADD IMAGES<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const files = Array.from(e.target.files ?? []); files.forEach((file) => void upload(file)); e.currentTarget.value = ""; }} /></label></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.map((url, imageIndex) => <div key={`${url}-${imageIndex}`} className="border border-border p-3"><div className="relative aspect-4/3 overflow-hidden bg-surface"><img src={url} alt="" className="h-full w-full object-cover" />{imageIndex === 0 && <span className="label-mono absolute left-2 top-2 bg-background/85 px-2 py-1 text-[10px] text-foreground">HOME COVER</span>}</div><div className="mt-3 flex items-center justify-between"><span className="label-mono">{String(imageIndex + 1).padStart(2, "0")}</span><div className="flex gap-2"><SmallButton onClick={() => setImages(moveArray(images, imageIndex, -1))}><ArrowUp className="h-4 w-4" /></SmallButton><SmallButton onClick={() => setImages(moveArray(images, imageIndex, 1))}><ArrowDown className="h-4 w-4" /></SmallButton><SmallButton onClick={() => setImages(images.filter((_, i) => i !== imageIndex))}><X className="h-4 w-4" /></SmallButton></div></div></div>)}</div>
      {images.length === 0 && <p className="mt-4 border border-dashed border-border p-6 text-sm text-muted-foreground">CMS 장르 이미지가 없어. 홈에서는 기존 기본 이미지를 사용해.</p>}
    </div>
  </div>;
}

function HomepageEditor({ value, projects, patch, upload }: { value: SiteContent["homepage"]; projects: ProjectOption[]; patch: (value: SiteContent["homepage"]) => void; upload: UploadFn }) {
  const p = <K extends keyof SiteContent["homepage"]>(key: K, next: SiteContent["homepage"][K]) => patch({ ...value, [key]: next });
  return <div className="space-y-10">
    <SectionTitle title="HERO" note="메인 첫 화면 문구와 배경 이미지" /><BiField label="HERO TITLE" value={value.hero_title} onChange={(v) => p("hero_title", v)} /><BiField label="HERO TAGLINE" value={value.hero_tagline} onChange={(v) => p("hero_tagline", v)} /><ImageField label="HERO BACKGROUND" url={value.hero_image_url} upload={(file) => upload(file, (url) => p("hero_image_url", url))} clear={() => p("hero_image_url", "")} />
    <SectionTitle title="SELECTED WORK" note="메인에 노출할 대표작 3개를 직접 선택" /><div className="grid gap-4 md:grid-cols-3">{[0,1,2].map((index) => <label key={index}><span className="label-mono">PROJECT {index + 1}</span><select value={value.selected_work_slugs[index] ?? ""} onChange={(e) => { const next=[...value.selected_work_slugs]; next[index]=e.target.value; p("selected_work_slugs", next); }} className="mt-2 min-h-12 w-full border border-border bg-surface px-3 text-sm"><option value="">— NONE —</option>{projects.map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}</select></label>)}</div>
    <SectionTitle title="INTRO" note="선택 작품 위의 스튜디오 소개" /><BiField label="TITLE LINE 1" value={value.intro_title_1} onChange={(v) => p("intro_title_1", v)} /><BiField label="TITLE LINE 2" value={value.intro_title_2} onChange={(v) => p("intro_title_2", v)} /><BiArea label="BODY" value={value.intro_body} onChange={(v) => p("intro_body", v)} />
    <SectionTitle title="WHAT WE BUILD" note="장르 이름과 대표 이미지. 각 장르 이미지는 PROJECTS 탭에서 장르명을 눌러 여러 장 관리할 수 있어." />
    <div className="space-y-5">{value.disciplines.map((item, index) => { const images = disciplineImages(item); return <div key={item.id} className="border border-border p-4 md:p-6"><p className="label-mono">{String(index+1).padStart(2,"0")} / {item.id}</p><div className="mt-4"><BiField label="CATEGORY" value={item.label} onChange={(label) => p("disciplines", value.disciplines.map((d,i)=>i===index?{...d,label}:d))} /></div><p className="mt-4 text-xs text-muted-foreground">등록된 장르 이미지: {images.length}장 · 첫 번째 이미지가 홈 대표 이미지</p></div>; })}</div>
    <SectionTitle title="ABOUT" note="소개 문구와 이미지" /><BiField label="TITLE LINE 1" value={value.about_title_1} onChange={(v)=>p("about_title_1",v)} /><BiField label="TITLE LINE 2" value={value.about_title_2} onChange={(v)=>p("about_title_2",v)} /><BiArea label="BODY" value={value.about_body} onChange={(v)=>p("about_body",v)} /><ImageField label="ABOUT IMAGE" url={value.about_image_url} upload={(file)=>upload(file,(url)=>p("about_image_url",url))} clear={()=>p("about_image_url","")} />
    <SectionTitle title="FINAL CTA" note="메인 하단 문의 유도 영역" /><BiField label="TITLE LINE 1" value={value.final_title_1} onChange={(v)=>p("final_title_1",v)} /><BiField label="TITLE LINE 2" value={value.final_title_2} onChange={(v)=>p("final_title_2",v)} /><BiArea label="BODY" value={value.final_body} onChange={(v)=>p("final_body",v)} /><ImageField label="BACKGROUND" url={value.final_image_url} upload={(file)=>upload(file,(url)=>p("final_image_url",url))} clear={()=>p("final_image_url","")} />
  </div>;
}

function FaqEditor({ value, patch }: { value: SiteContent["faq"]; patch: (value: SiteContent["faq"]) => void }) { return <div className="space-y-8"><SectionTitle title="FAQ PAGE" note="질문 추가·삭제·순서 변경 가능" /><BiField label="EYEBROW" value={value.eyebrow} onChange={(eyebrow)=>patch({...value,eyebrow})}/><BiField label="TITLE" value={value.title} onChange={(title)=>patch({...value,title})}/><BiArea label="INTRO" value={value.intro} onChange={(intro)=>patch({...value,intro})}/><BiArea label="SIDE NOTE" value={value.side_note} onChange={(side_note)=>patch({...value,side_note})}/><div className="space-y-4">{value.items.map((item,index)=><div key={index} className="border border-border p-4 md:p-6"><div className="flex items-center justify-between"><p className="label-mono">FAQ {index+1}</p><div className="flex gap-2"><SmallButton onClick={()=>patch({...value,items:moveArray(value.items,index,-1)})}><ArrowUp className="h-4 w-4"/></SmallButton><SmallButton onClick={()=>patch({...value,items:moveArray(value.items,index,1)})}><ArrowDown className="h-4 w-4"/></SmallButton><SmallButton onClick={()=>patch({...value,items:value.items.filter((_,i)=>i!==index)})}><Trash2 className="h-4 w-4"/></SmallButton></div></div><div className="mt-4 space-y-4"><BiField label="QUESTION" value={item.question} onChange={(question)=>patch({...value,items:value.items.map((x,i)=>i===index?{...x,question}:x)})}/><BiArea label="ANSWER" value={item.answer} onChange={(answer)=>patch({...value,items:value.items.map((x,i)=>i===index?{...x,answer}:x)})}/></div></div>)}</div><button type="button" onClick={()=>patch({...value,items:[...value.items,{question:{en:"New question",ko:"새 질문"},answer:{en:"",ko:""}}]})} className="label-mono inline-flex min-h-11 items-center gap-2 border border-border-strong px-4"><Plus className="h-4 w-4"/> ADD FAQ</button></div>; }
function PaymentEditor({ value, patch }: { value: SiteContent["payment"]; patch:(value:SiteContent["payment"])=>void }) { return <div className="space-y-6"><SectionTitle title="PAYMENT PAGE" note="결제 페이지 문구" />{(["provider","title","heading","body_1","body_2","body_3"] as const).map((key)=>key.startsWith("body")?<BiArea key={key} label={key.toUpperCase()} value={value[key]} onChange={(v)=>patch({...value,[key]:v})}/>:<BiField key={key} label={key.toUpperCase()} value={value[key]} onChange={(v)=>patch({...value,[key]:v})}/>)}</div>; }
function ContactEditor({ value, patch }: { value: SiteContent["contact"]; patch:(value:SiteContent["contact"])=>void }) { return <div className="space-y-6"><SectionTitle title="CONTACT PAGE" note="문의 폼 상단 소개 문구. 폼 기능은 그대로 유지" /><BiField label="EYEBROW" value={value.eyebrow} onChange={(v)=>patch({...value,eyebrow:v})}/><BiField label="TITLE" value={value.title} onChange={(v)=>patch({...value,title:v})}/><BiArea label="INTRO" value={value.intro} onChange={(v)=>patch({...value,intro:v})}/></div>; }
function SiteEditor({ value, patch }: { value: SiteContent["site"]; patch:(value:SiteContent["site"])=>void }) { return <div className="space-y-6"><SectionTitle title="SITE-WIDE" note="공통 브랜드/연락처 정보" /><TextField label="BRAND" value={value.brand} onChange={(brand)=>patch({...value,brand})}/><TextField label="DISCORD" value={value.discord} onChange={(discord)=>patch({...value,discord})}/><TextField label="EMAIL" value={value.email} onChange={(email)=>patch({...value,email})}/></div>; }
function disciplineImages(item: DisciplineContent) { return item.image_urls?.length ? item.image_urls : item.image_url ? [item.image_url] : []; }
function SectionTitle({ title, note }: { title:string; note:string }) { return <div className="border-b border-border pb-4"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{note}</p></div>; }
function TextField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="block"><span className="label-mono">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 min-h-12 w-full border border-border bg-surface px-3 text-sm outline-none focus:border-foreground"/></label>; }
function BiField({label,value,onChange}:{label:string;value:BilingualText;onChange:(v:BilingualText)=>void}) { return <div className="grid gap-4 md:grid-cols-2"><TextField label={`${label} / EN`} value={value.en} onChange={(en)=>onChange({...value,en})}/><TextField label={`${label} / KO`} value={value.ko} onChange={(ko)=>onChange({...value,ko})}/></div>; }
function BiArea({label,value,onChange}:{label:string;value:BilingualText;onChange:(v:BilingualText)=>void}) { return <div className="grid gap-4 md:grid-cols-2"><Area label={`${label} / EN`} value={value.en} onChange={(en)=>onChange({...value,en})}/><Area label={`${label} / KO`} value={value.ko} onChange={(ko)=>onChange({...value,ko})}/></div>; }
function Area({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="block"><span className="label-mono">{label}</span><textarea rows={5} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 w-full resize-y border border-border bg-surface px-3 py-3 text-sm leading-6 outline-none focus:border-foreground"/></label>; }
function ImageField({label,url,upload,clear}:{label:string;url:string;upload:(file:File)=>void;clear:()=>void}) { return <div><div className="flex flex-wrap items-center justify-between gap-3"><span className="label-mono">{label}</span><div className="flex gap-2"><label className="label-mono inline-flex min-h-10 cursor-pointer items-center gap-2 border border-border px-3"><ImagePlus className="h-4 w-4"/> {url?"REPLACE":"UPLOAD"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e)=>{const f=e.target.files?.[0];if(f)upload(f);e.currentTarget.value="";}}/></label>{url&&<button type="button" onClick={clear} className="label-mono min-h-10 border border-border px-3">USE DEFAULT</button>}</div></div>{url?<div className="mt-3 aspect-[16/7] max-w-2xl overflow-hidden border border-border bg-surface"><img src={url} alt="" className="h-full w-full object-cover"/></div>:<p className="mt-3 text-xs text-muted-foreground">현재 기본 사이트 이미지를 사용 중. 업로드하면 CMS 이미지로 교체돼.</p>}</div>; }
function SmallButton({onClick,children}:{onClick:()=>void;children:React.ReactNode}) { return <button type="button" onClick={onClick} className="flex h-9 w-9 items-center justify-center border border-border hover:bg-foreground hover:text-background">{children}</button>; }
function moveArray<T>(items:T[],index:number,direction:-1|1){const target=index+direction;if(target<0||target>=items.length)return items;const next=[...items];const a=next[index],b=next[target];if(a===undefined||b===undefined)return items;next[index]=b;next[target]=a;return next;}
