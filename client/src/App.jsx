import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { runResearch, getHistory, getResearch } from "./api/research";


const TABS = [
  ["finalDraft", "Final Report"],
  ["draft", "First Draft"],
  ["critique", "Critique"],
  ["sources", "Sources"],
];
const STEPS = ["Searching", "Reading sources", "Writing draft", "Critiquing", "Revising"];
const clean = (t = "") => t.replace(/<br\s*\/?>/gi, " ");

export default function App() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("finalDraft");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const loadHistory = () => getHistory().then(setHistory).catch(() => {});
  useEffect(() => { wakeServer(); loadHistory(); }, []);

  // estimated progress (backend streaming nahi karta)
  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 9000);
    return () => clearInterval(t);
  }, [loading]);

  const handleRun = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await runResearch(topic);
      setResult({
        ...data,
        sources: data.sources || data.scrapedContent?.map((s) => ({ title: s.title, url: s.url })),
      });
      setActiveId(data.id);
      setTab("finalDraft");
      loadHistory();
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const openItem = async (id) => {
    setError("");
    try {
      setResult(await getResearch(id));
      setActiveId(id);
      setTab("finalDraft");
    } catch (e) {
      setError(e.message);
    }
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(result.finalDraft || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadReport = () => {
    const blob = new Blob([result.finalDraft || ""], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(result.topic || "report").replace(/\s+/g, "-")}.md`;
    a.click();
  };

  const score = result?.critique?.match(/(\d+(?:\.\d+)?)\s*\/\s*10/)?.[1];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 p-4 md:flex">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          History
        </h2>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {history.length === 0 && <p className="text-sm text-slate-600">No research yet</p>}
          {history.map((h) => (
            <button
              key={h._id}
              onClick={() => openItem(h._id)}
              className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                activeId === h._id
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {h.topic}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">🔎 Research Assistant</h1>
          <p className="text-sm text-slate-500">
            Multi-agent pipeline: search → read → write → critique → revise
          </p>
        </header>

        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="Enter a research topic..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-indigo-500"
          />
          <button
            onClick={handleRun}
            disabled={loading || !topic.trim()}
            className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Researching..." : "Research"}
          </button>
        </div>

        {/* Progress */}
        {loading && (
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-wrap gap-2">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={`rounded-full px-3 py-1 text-xs ${
                    i < step
                      ? "bg-emerald-500/15 text-emerald-400"
                      : i === step
                      ? "animate-pulse bg-indigo-500/20 text-indigo-300"
                      : "bg-slate-800 text-slate-600"
                  }`}
                >
                  {i < step ? "✓ " : ""}
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-600">Usually takes 40-90 seconds</p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <section className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-900 p-1">
                {TABS.map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${
                      tab === k ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {score && (
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300">
                    Critic score: {score}/10
                  </span>
                )}
                <button
                  onClick={copyReport}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
                <button
                  onClick={downloadReport}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
                >
                  Download .md
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              {tab === "sources" ? (
                <ul className="space-y-3">
                  {result.sources?.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs text-slate-400">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm font-medium text-indigo-300 hover:underline"
                        >
                          {s.title}
                        </a>
                        <span className="block truncate text-xs text-slate-600">{s.url}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-indigo-300 prose-th:text-slate-200 prose-table:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{clean(result[tab])}</ReactMarkdown>
                </article>
              )}
            </div>
          </section>
        )}

        {!result && !loading && (
          <p className="mt-16 text-center text-sm text-slate-600">
            Enter a topic above to generate a researched, critiqued report.
          </p>
        )}
      </main>
    </div>
  );
}