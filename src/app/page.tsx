"use client";

import { useEffect, useMemo, useState } from "react";
import MdPreview from "@/components/MdPreview";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Filter, Loader2, PanelLeft, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Entry = { name: string; type: "file" | "dir"; path: string };
type Question = { question_number?: string; question?: string; type?: string; choices?: string[]; marks?: number; negativeMarks?: number; subject_name?: string; topic_name?: string; answers?: string[]; explanation?: string; images?: string[] };

const API = "https://api.github.com/repos/gecwyd/gate-questions/contents";
const RAW = "https://raw.githubusercontent.com/gecwyd/gate-questions/main";
const SIDEBAR_PAGE = 10;

function readable(code: string) {
  const names: Record<string, string> = { ae: "Aerospace Engineering", ag: "Agricultural Engineering", ar: "Architecture", bm: "Biomedical Engineering", ce: "Civil Engineering", ch: "Chemical Engineering", cs: "Computer Science", cy: "Chemistry", da: "Data Science & AI", ec: "Electronics & Communication", ee: "Electrical Engineering", es: "Environmental Science", ey: "Ecology & Evolution", ge: "Geology & Geophysics", in: "Instrumentation Engineering", ma: "Mathematics", me: "Mechanical Engineering", mn: "Mining Engineering", mt: "Metallurgical Engineering", pe: "Petroleum Engineering", ph: "Physics", st: "Statistics", tf: "Textile Engineering", xe: "Engineering Sciences", xh: "Humanities & Social Sciences" };
  return names[code.toLowerCase()] ?? code.toUpperCase();
}

function remoteImage(url: unknown) {
  if (typeof url !== "string") return null;
  return url.startsWith("http") ? url : `${RAW}/${url.replace(/^\.\//, "")}`;
}

function Picker({ label, value, placeholder, items, disabled, onSelect, display = (v: string) => v }: { label: string; value: string; placeholder: string; items: Entry[]; disabled?: boolean; onSelect: (v: string) => void; display?: (v: string) => string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-neutral-400">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full justify-between rounded-lg border-neutral-200 bg-white px-3.5 text-left text-sm font-medium shadow-none dark:border-neutral-700 dark:bg-neutral-800",
            !value && "text-neutral-400",
            disabled && "cursor-not-allowed opacity-40"
          )}
        >
          <span className="truncate">{value ? display(value) : placeholder}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-64 min-w-[240px] overflow-y-auto rounded-lg p-1">
          {items.map((item) => (
            <DropdownMenuItem key={item.path} onClick={() => onSelect(item.name)} className="cursor-pointer rounded-md px-3 py-2 text-sm">
              {display(item.name)}
              {value === item.name && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-blue-500" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function QuestionDetail({ q, index, answerOpen, onToggleAnswer }: { q: Question; index: number; answerOpen: boolean; onToggleAnswer: () => void }) {
  const images = (q.images ?? []).map(remoteImage).filter((img): img is string => Boolean(img));

  return (
    <Collapsible open={answerOpen} onOpenChange={onToggleAnswer}>
      <div className="question-meta mb-5">
        {q.topic_name && <span className="meta-tag meta-tag-accent">{q.topic_name}</span>}
        {q.type && <span className="meta-tag">{q.type}</span>}
        <span className="meta-tag">{q.marks ?? 1}M</span>
      </div>

      <div className="flex gap-3 sm:gap-4">
        <span className="question-number">{q.question_number ?? `Q${index}`}.</span>
        <div className="question-body min-w-0 flex-1">
          <MdPreview value={q.question ?? ""} />
        </div>
      </div>

      {!!images.length && (
        <div className="mt-4 sm:mt-6 ml-0 sm:ml-10 space-y-3">
          {images.map((src, i) => (
            <img key={i} src={src} alt={`Q${index} diagram`} className="h-auto max-w-full rounded-lg border border-neutral-200 dark:border-neutral-700" />
          ))}
        </div>
      )}

      {!!q.choices?.length && (
        <div className="mt-5 sm:mt-6 ml-0 sm:ml-8 space-y-2 sm:space-y-1">
          {q.choices.map((choice, i) => (
            <div key={i} className="choice-item">
              <span className="choice-label">{String.fromCharCode(65 + i)}</span>
              <div className="choice-text min-w-0 flex-1">
                <MdPreview value={choice} minimal />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <CollapsibleTrigger className="reveal-trigger">
          {answerOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {answerOpen ? "Hide Solution" : "Reveal Solution"}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="solution-panel mt-6 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="solution-badge"><Check className="h-4 w-4 sm:h-4 sm:w-4" /></span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Answer</p>
              <div className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
                <MdPreview value={(q.answers ?? []).join(", ") || "—"} minimal />
              </div>
            </div>
          </div>
          {q.explanation && (
            <div className="mt-5 border-t border-blue-100 pt-5 dark:border-blue-900/30">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Explanation</p>
              <div className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                <MdPreview value={q.explanation} />
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Home() {
  const [years, setYears] = useState<Entry[]>([]);
  const [branches, setBranches] = useState<Entry[]>([]);
  const [papers, setPapers] = useState<Entry[]>([]);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [paper, setPaper] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPaper, setLoadingPaper] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarPage, setSidebarPage] = useState(1);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [changePaperOpen, setChangePaperOpen] = useState(false);
  const [topic, setTopic] = useState("All topics");

  async function list(path = "") {
    const res = await fetch(`${API}/${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error();
    return res.json() as Promise<Entry[]>;
  }

  useEffect(() => {
    list()
      .then(items => setYears(items.filter(i => i.type === "dir").sort((a, b) => b.name.localeCompare(a.name))))
      .catch(() => setError("Couldn't connect to the question archive."))
      .finally(() => setLoading(false));
  }, []);

  async function chooseYear(v: string) {
    setYear(v); setBranch(""); setPaper(""); setQuestions([]); setPapers([]); setLoading(true); setError("");
    try { setBranches((await list(v)).filter(i => i.type === "dir").sort((a, b) => a.name.localeCompare(b.name))); }
    catch { setError("Couldn't load branches."); }
    finally { setLoading(false); }
  }

  async function chooseBranch(v: string) {
    setBranch(v); setPaper(""); setQuestions([]); setLoading(true); setError("");
    try { setPapers((await list(`${year}/${v}`)).filter(i => i.type === "dir").sort((a, b) => a.name.localeCompare(b.name))); }
    catch { setError("Couldn't load papers."); }
    finally { setLoading(false); }
  }

  async function choosePaper(v: string) {
    setPaper(v); setLoadingPaper(true); setError(""); setActiveIndex(0); setSidebarPage(1); setRevealed(new Set()); setChangePaperOpen(false); setTopic("All topics");
    try {
      const res = await fetch(`${RAW}/${year}/${branch}/${v}/final_questions.json`);
      if (!res.ok) throw new Error();
      setQuestions(await res.json() as Question[]);
    } catch { setError("No questions found for this paper."); setQuestions([]); }
    finally { setLoadingPaper(false); }
  }

  function reset() {
    setYear(""); setBranch(""); setPaper(""); setQuestions([]); setBranches([]); setPapers([]);
    setActiveIndex(0); setSidebarPage(1); setRevealed(new Set()); setError(""); setTopic("All topics");
  }

  const topics = useMemo(() => ["All topics", ...Array.from(new Set(questions.map(q => q.topic_name).filter(Boolean) as string[])).sort()], [questions]);
  const filtered = useMemo(() => topic === "All topics" ? questions : questions.filter(q => q.topic_name === topic), [questions, topic]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SIDEBAR_PAGE));
  const sidebarItems = filtered.slice((sidebarPage - 1) * SIDEBAR_PAGE, sidebarPage * SIDEBAR_PAGE);

  const activeQuestion = filtered[activeIndex];

  if (!questions.length && !loadingPaper) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">GATE Question Bank</h1>
            <p className="mt-2 text-sm text-neutral-500">Select a year and department to start practicing.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <Picker label="Year" value={year} placeholder={loading && !years.length ? "Loading…" : "Select year"} items={years} onSelect={chooseYear} />
            <Picker label="Department" value={branch} placeholder={loading && year ? "Loading…" : "Select department"} items={branches} disabled={!year || loading} onSelect={chooseBranch} display={readable} />
            <Picker label="Paper" value={paper} placeholder={loading && branch ? "Loading…" : "Select paper"} items={papers} disabled={!branch || loading} onSelect={choosePaper} display={v => v.toUpperCase()} />
          </div>

          {loadingPaper && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading questions…
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadingPaper) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> Loading questions…
        </div>
      </div>
    );
  }

  function selectQuestion(globalIndex: number) {
    setActiveIndex(globalIndex);
    setMobileListOpen(false);
  }

  const questionListContent = (
    <>
      <div className="space-y-0.5">
        {sidebarItems.map((q, i) => {
          const globalIndex = (sidebarPage - 1) * SIDEBAR_PAGE + i;
          const isActive = globalIndex === activeIndex;
          const qNum = q.question_number ?? `Q${globalIndex + 1}`;
          const preview = (q.question ?? "").replace(/[#*_`$\\]/g, "").slice(0, 80);
          return (
            <button
              key={globalIndex}
              onClick={() => selectQuestion(globalIndex)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              <span className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              )}>
                {globalIndex + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-4">
                  {qNum}
                  {q.type && <span className="ml-1.5 text-[10px] font-normal text-neutral-400">· {q.type}</span>}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-neutral-400 dark:text-neutral-500">{preview || "No preview"}</p>
              </div>
              {q.marks && <span className="mt-0.5 shrink-0 text-[10px] font-semibold text-neutral-400">{q.marks}M</span>}
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200/60 px-3 pt-3 dark:border-neutral-800">
          <button
            disabled={sidebarPage === 1}
            onClick={() => setSidebarPage(p => p - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-medium text-neutral-400">{sidebarPage} / {totalPages}</span>
          <button
            disabled={sidebarPage === totalPages}
            onClick={() => setSidebarPage(p => p + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col relative">
      {changePaperOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-200/60 p-4 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Change Paper</h2>
              <button onClick={() => setChangePaperOpen(false)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Picker label="Year" value={year} placeholder={loading && !years.length ? "Loading…" : "Select year"} items={years} onSelect={chooseYear} />
              <Picker label="Department" value={branch} placeholder={loading && year ? "Loading…" : "Select department"} items={branches} disabled={!year || loading} onSelect={chooseBranch} display={readable} />
              <Picker label="Paper" value={paper} placeholder={loading && branch ? "Loading…" : "Select paper"} items={papers} disabled={!branch || loading} onSelect={choosePaper} display={v => v.toUpperCase()} />
            </div>
          </div>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200/60 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900 sm:px-5">
        <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{year}</span>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="font-medium truncate max-w-[140px] sm:max-w-none">{readable(branch)}</span>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="font-medium">{paper.toUpperCase()}</span>
          <span className="hidden text-neutral-400 sm:inline ml-1">· {questions.length} questions</span>
        </div>
        <button onClick={() => setChangePaperOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 sm:px-2.5">
          <RotateCcw className="h-3.5 w-3.5 sm:h-3 sm:w-3" /> <span className="hidden sm:inline">Change paper</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {mobileListOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileListOpen(false)} />
        )}

        <aside className={cn(
          "fixed inset-y-0 top-[calc(57px+37px)] left-0 z-50 w-[300px] flex flex-col overflow-hidden border-r border-neutral-200/60 bg-white transition-transform duration-200 dark:border-neutral-800 dark:bg-neutral-900",
          "lg:static lg:inset-y-auto lg:z-auto lg:w-[280px] lg:shrink-0 lg:translate-x-0",
          mobileListOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col border-b border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center justify-between px-4 py-3 lg:py-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Questions</h2>
              <button onClick={() => setMobileListOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 lg:hidden dark:hover:bg-neutral-800">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="px-4 pb-3">
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "h-8 w-full justify-between rounded-md border-neutral-200 bg-neutral-50 px-2.5 text-xs shadow-none hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800")}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Filter className="h-3 w-3 shrink-0 text-neutral-400" />
                    <span className="truncate text-neutral-600 dark:text-neutral-300">{topic === "All topics" ? "All topics" : topic}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 shrink-0 text-neutral-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 w-[250px] overflow-y-auto rounded-lg p-1">
                  {topics.map(t => (
                    <DropdownMenuItem key={t} onClick={() => { setTopic(t); setSidebarPage(1); setActiveIndex(0); }} className="cursor-pointer rounded-md px-3 py-2 text-sm">
                      <span className="truncate">{t}</span>
                      {topic === t && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-blue-500" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {questionListContent}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-8 sm:py-8">
            {activeQuestion ? (
              <div>
                <div className="mb-6 flex items-center justify-between rounded-xl border border-neutral-200/60 bg-white p-1.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                  <button
                    disabled={activeIndex === 0}
                    onClick={() => { const next = activeIndex - 1; setActiveIndex(next); setSidebarPage(Math.floor(next / SIDEBAR_PAGE) + 1); }}
                    className="flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800 sm:h-9 sm:px-4 sm:text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button onClick={() => setMobileListOpen(true)} className="flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 lg:pointer-events-none dark:text-neutral-200 dark:hover:bg-neutral-800 sm:h-9 sm:px-4 sm:text-sm">
                    <PanelLeft className="h-4 w-4 text-neutral-400 lg:hidden" />
                    Q{activeIndex + 1} <span className="text-neutral-400">of {filtered.length}</span>
                  </button>
                  <button
                    disabled={activeIndex === filtered.length - 1}
                    onClick={() => { const next = activeIndex + 1; setActiveIndex(next); setSidebarPage(Math.floor(next / SIDEBAR_PAGE) + 1); }}
                    className="flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800 sm:h-9 sm:px-4 sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <QuestionDetail
                  q={activeQuestion}
                  index={activeIndex + 1}
                  answerOpen={revealed.has(activeIndex)}
                  onToggleAnswer={() => {
                    setRevealed(s => { const n = new Set(s); n.has(activeIndex) ? n.delete(activeIndex) : n.add(activeIndex); return n; });
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No question selected.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
