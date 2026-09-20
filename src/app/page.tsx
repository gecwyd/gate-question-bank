"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = { name: string; type: "file" | "dir"; path: string };
type Question = {
  question_number?: string; question?: string; type?: string; choices?: string[];
  marks?: number; negativeMarks?: number; subject_name?: string; topic_name?: string;
  answers?: string[]; explanation?: string; images?: string[];
};

const SOURCE = "gecwyd/gate-questions";
const API = `https://api.github.com/repos/${SOURCE}/contents`;
const RAW = `https://raw.githubusercontent.com/${SOURCE}/main`;
const PAGE_SIZE = 10;

function readable(code: string) {
  const names: Record<string, string> = { ce: "Civil Engineering", cs: "Computer Science", ee: "Electrical Engineering", ec: "Electronics & Communication", me: "Mechanical Engineering", da: "Data Science & AI", xe: "Engineering Sciences", ch: "Chemical Engineering", ar: "Architecture", ag: "Agricultural Engineering", bm: "Biomedical Engineering", cy: "Chemistry", ey: "Ecology & Evolution", es: "Environmental Science", ge: "Geology & Geophysics", in: "Instrumentation Engineering", ma: "Mathematics", mt: "Metallurgical Engineering", mn: "Mining Engineering", pe: "Petroleum Engineering", ph: "Physics", st: "Statistics", tf: "Textile Engineering", xh: "Humanities & Social Sciences", ae: "Aerospace Engineering" };
  return names[code.toLowerCase()] ?? code.toUpperCase();
}

function markdownText(value = "") {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/[*#>`_]/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

function remoteImage(url: unknown) {
  if (typeof url !== "string") return null;
  if (url.startsWith("http")) return url;
  return `${RAW}/${url.replace(/^\.\//, "")}`;
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
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  async function list(path = "") {
    const response = await fetch(`${API}/${path}`, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error("The question archive could not be reached.");
    return response.json() as Promise<Entry[]>;
  }

  useEffect(() => {
    list().then(items => setYears(items.filter(item => item.type === "dir").sort((a, b) => b.name.localeCompare(a.name))))
      .catch(() => setError("Couldn’t connect to the question archive. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  async function chooseYear(nextYear: string) {
    setYear(nextYear); setBranch(""); setPaper(""); setQuestions([]); setPapers([]); setLoading(true); setError("");
    try { setBranches((await list(nextYear)).filter(item => item.type === "dir").sort((a, b) => a.name.localeCompare(b.name))); }
    catch { setError("Couldn’t load branches for this year."); }
    finally { setLoading(false); }
  }

  async function chooseBranch(nextBranch: string) {
    setBranch(nextBranch); setPaper(""); setQuestions([]); setLoading(true); setError("");
    try { setPapers((await list(`${year}/${nextBranch}`)).filter(item => item.type === "dir").sort((a, b) => a.name.localeCompare(b.name))); }
    catch { setError("Couldn’t load papers for this branch."); }
    finally { setLoading(false); }
  }

  async function choosePaper(nextPaper: string) {
    setPaper(nextPaper); setLoadingPaper(true); setError(""); setPage(1); setQuery(""); setTopic("All topics"); setRevealed(new Set());
    try {
      const response = await fetch(`${RAW}/${year}/${branch}/${nextPaper}/final_questions.json`);
      if (!response.ok) throw new Error();
      const data = await response.json() as Question[];
      setQuestions(data);
    } catch { setError("This paper does not have a readable final_questions.json file yet."); setQuestions([]); }
    finally { setLoadingPaper(false); }
  }

  const topics = useMemo(() => ["All topics", ...Array.from(new Set(questions.map(q => q.topic_name).filter(Boolean) as string[])).sort()], [questions]);
  const filtered = useMemo(() => questions.filter(q => {
    const inTopic = topic === "All topics" || q.topic_name === topic;
    const haystack = `${q.question} ${(q.choices ?? []).join(" ")} ${q.topic_name}`.toLowerCase();
    return inTopic && haystack.includes(query.toLowerCase());
  }), [questions, topic, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, topic]);

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="GATE Question Bank home"><span className="brand-mark">G</span><span>GATE <b>Question Bank</b></span></a>
      <span className="source"><i /> Live archive</span>
    </header>
    <section id="top" className="hero">
      <div className="eyebrow">PRACTISE WITH PURPOSE</div>
      <h1>Find the question.<br /><em>Build the instinct.</em></h1>
      <p>Past GATE papers, thoughtfully organised. Select a paper and work through it at your own pace.</p>
      <div className="steps"><span><b>1</b> Choose year</span><span><b>2</b> Pick branch</span><span><b>3</b> Start solving</span></div>
    </section>

    <section className="selector" aria-label="Question source selector">
      <div className="select-field"><label htmlFor="year">EXAM YEAR</label><select id="year" value={year} onChange={e => chooseYear(e.target.value)} disabled={loading}><option value="">Select a year</option>{years.map(item => <option key={item.path} value={item.name}>{item.name}</option>)}</select></div>
      <div className="select-field"><label htmlFor="branch">PAPER / BRANCH</label><select id="branch" value={branch} onChange={e => chooseBranch(e.target.value)} disabled={!year || loading}><option value="">{year ? "Select branch" : "Choose year first"}</option>{branches.map(item => <option key={item.path} value={item.name}>{readable(item.name)}</option>)}</select></div>
      <div className="select-field"><label htmlFor="paper">QUESTION PAPER</label><select id="paper" value={paper} onChange={e => choosePaper(e.target.value)} disabled={!branch || loading}><option value="">{branch ? "Select paper" : "Choose branch first"}</option>{papers.map(item => <option key={item.path} value={item.name}>{item.name.toUpperCase()}</option>)}</select></div>
    </section>

    {error && <div className="notice error">{error}</div>}
    {loadingPaper && <section className="empty"><div className="spinner" /> Loading this paper from the archive…</section>}
    {!loadingPaper && !questions.length && !error && <section className="empty"><div className="empty-icon">↗</div><h2>Your practice set is waiting</h2><p>The archive is only queried as you choose a paper. Nothing is downloaded before you need it.</p></section>}

    {!!questions.length && !loadingPaper && <section className="reader">
      <div className="reader-heading"><div><div className="eyebrow">{year} · {readable(branch)} · {paper.toUpperCase()}</div><h2>Question set</h2><p>{questions.length} questions available from the archive</p></div><div className="data-note"><span>↓</span> Loaded one paper only</div></div>
      <div className="tools"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search this paper" aria-label="Search this paper" /><select value={topic} onChange={e => setTopic(e.target.value)} aria-label="Filter by topic">{topics.map(name => <option key={name}>{name}</option>)}</select></div>
      <p className="result-count">Showing {shown.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} questions</p>
      <div className="questions">{shown.map((q, index) => {
        const absoluteIndex = (page - 1) * PAGE_SIZE + index;
        const answerOpen = revealed.has(absoluteIndex);
        const images = (q.images ?? []).map(remoteImage).filter((image): image is string => Boolean(image));
        return <article className="question" key={`${q.question_number}-${absoluteIndex}`}><div className="question-meta"><span className="number">{q.question_number ?? `Q.${absoluteIndex + 1}`}</span><span>{q.topic_name ?? "GATE"}</span><span>{q.marks ?? 1} mark{q.marks === 1 ? "" : "s"}{q.negativeMarks ? ` · −${q.negativeMarks}` : ""}</span></div><div className="question-body"><p className="prompt">{markdownText(q.question)}</p>{images.map((image, imageIndex) => <img className="question-image" key={imageIndex} src={image} alt={`Diagram for ${q.question_number}`} />)}<div className="choices">{(q.choices ?? []).map((choice, choiceIndex) => <div className="choice" key={choiceIndex}><span>{String.fromCharCode(65 + choiceIndex)}</span><p>{markdownText(choice)}</p></div>)}</div><button className="answer-button" onClick={() => setRevealed(old => { const next = new Set(old); answerOpen ? next.delete(absoluteIndex) : next.add(absoluteIndex); return next; })}>{answerOpen ? "Hide answer" : "Reveal answer"}<b>→</b></button>{answerOpen && <aside className="answer"><strong>Answer</strong><p>{(q.answers ?? []).join(", ") || "Not specified"}</p>{q.explanation && <details><summary>Read explanation</summary><p>{markdownText(q.explanation)}</p></details>}</aside>}</div></article>;
      })}</div>
      {!shown.length && <div className="no-results">No questions match those filters.</div>}
      <nav className="pagination" aria-label="Question pages"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Previous</button><span>Page <b>{page}</b> of {pageCount}</span><button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next →</button></nav>
    </section>}
    <footer>Built for deliberate practice · Questions served from <a href={`https://github.com/${SOURCE}`} target="_blank" rel="noreferrer">the open GATE archive</a></footer>
  </main>;
}
