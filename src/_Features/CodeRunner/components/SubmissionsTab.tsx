import React, { useEffect, useState } from "react";
// import { Tab } from "@headlessui/react";
import { Copy, Download, ChevronDown, ChevronUp } from "lucide-react";
// import { privateAxios } from "../../utils/axios";
import { privateAxios } from "../../../utils/axios";
type Case = {
  name: string;
  passed: boolean;
  points_awarded: number;
  time?: number | null;
  memory?: number | null;
  judge_token?: string | null;
};

type Group = {
  name: string;
  group_max_points: number;
  group_points_awarded: number;
  cases: Case[];
};

type SubmissionItem = {
  submission_id: string;
  question_id: string;
  verdict: string;
  total_score: number;
  max_score: number;
  groups?: Group[];
  created_at?: string;
  // Optional: backend may include the source; if not, UI will try to fetch it via a secure endpoint
  source_code?: string | null;
  language?: string | null;
};

export default function SubmissionsTabs({
  collection,
  questionId,
}: {
  collection: string;
  questionId: string;
}) {
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showSource, setShowSource] = useState<Record<string, boolean>>({});
  const [sourceLoading, setSourceLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMySubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, collection, questionId]);

  async function fetchMySubmissions() {
    setLoading(true);
    try {
      const resp = await privateAxios.get(
        `/coding/questions/${collection}/${questionId}/my-submissions?page=${page}&per_page=${perPage}`
      );
      const data = resp.data;
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setLoading(false);
    }
  }

  // Try to fetch source for a submission (only for the authenticated user's submissions)
  // NOTE: adjust backend path to whatever secure endpoint you expose (must require auth)
  async function fetchSource(submission: SubmissionItem) {
    if (submission.source_code) return; // already present
    const sid = submission.submission_id;
    setSourceLoading((s) => ({ ...s, [sid]: true }));
    try {
      // Recommended backend endpoint: GET /coding/submissions/:submission_id/source
      const resp = await privateAxios.get(`/coding/submissions/${sid}/source`);
      const source = resp.data?.source_code || resp.data?.source || null;
      setItems((prev) => prev.map((it) => (it.submission_id === sid ? { ...it, source_code: source } : it)));
    } catch (err) {
      console.error("Failed to fetch source for", sid, err);
    } finally {
      setSourceLoading((s) => ({ ...s, [sid]: false }));
    }
  }

  function toggleExpanded(sid: string) {
    setExpanded((e) => ({ ...e, [sid]: !e[sid] }));
  }

  function toggleShowSource(sid: string) {
    const newVal = !showSource[sid];
    setShowSource((s) => ({ ...s, [sid]: newVal }));
    if (newVal) {
      // fetch if needed
      const sub = items.find((it) => it.submission_id === sid);
      if (sub && !sub.source_code) fetchSource(sub);
    }
  }

  async function copyToClipboard(text?: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("copy failed", err);
    }
  }

  function downloadSource(filename: string, text?: string) {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-4 bg-[#121212] rounded-xl border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">My Submissions</h3>
        <div className="text-sm text-gray-400">Total: {total}</div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No submissions yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((s, idx) => (
            <div key={s.submission_id} className="bg-[#1b1b1b] border border-gray-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="flex items-baseline gap-3">
                    <div className="text-sm text-gray-300 font-medium">{new Date(s.created_at || "").toLocaleString()}</div>
                    <div className="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-300">{s.language ?? "-"}</div>
                    <div className="text-sm font-semibold">
                      {s.verdict}
                    </div>
                    <div className="text-sm text-gray-400">{s.total_score}/{s.max_score}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    title="Toggle details"
                    onClick={() => toggleExpanded(s.submission_id)}
                    className="px-2 py-1 rounded-md hover:bg-gray-800"
                  >
                    {expanded[s.submission_id] ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                  </button>
                </div>
              </div>

              {expanded[s.submission_id] && (
                <div className="px-4 pb-4">
                  {/* Score + groups summary */}
                  <div className="mb-3">
                    {s.groups?.map((g, gi) => (
                      <div key={gi} className="mb-2">
                        <div className="flex justify-between text-sm text-gray-300">
                          <div>{g.name || `Group ${gi+1}`}</div>
                          <div>{g.group_points_awarded}/{g.group_max_points}</div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {g.cases.map((c, ci) => (
                            <div key={ci} className="flex justify-between">
                              <div>{c.name}</div>
                              <div>{c.passed ? "✔" : "✖"} · {c.points_awarded}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Source code controls */}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleShowSource(s.submission_id)}
                      className="px-3 py-1 rounded-md bg-[#222] text-sm text-gray-200 hover:bg-[#2a2a2a]"
                    >
                      {showSource[s.submission_id] ? "Hide Source" : "Show Source"}
                    </button>

                    {showSource[s.submission_id] && (
                      <>
                        <button
                          onClick={() => copyToClipboard(items.find(it => it.submission_id === s.submission_id)?.source_code || "")}
                          className="px-2 py-1 rounded-md hover:bg-gray-800"
                          title="Copy source"
                        >
                          <Copy className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          onClick={() => downloadSource(`${s.submission_id}.${s.language || 'txt'}`, items.find(it => it.submission_id === s.submission_id)?.source_code)}
                          className="px-2 py-1 rounded-md hover:bg-gray-800"
                          title="Download source"
                        >
                          <Download className="w-4 h-4 text-gray-300" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Source code panel */}
                  {showSource[s.submission_id] && (
                    <div className="rounded-md border border-gray-800 overflow-auto max-h-72">
                      {sourceLoading[s.submission_id] ? (
                        <div className="p-4 text-gray-400">Loading source...</div>
                      ) : (
                        <pre className="p-4 text-sm font-mono text-gray-100 bg-[#0f0f0f] whitespace-pre-wrap break-words">
                          {items.find(it => it.submission_id === s.submission_id)?.source_code || "(no source available)"}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-400">Page {page}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded-md bg-[#222] text-sm text-gray-200">Prev</button>
              <button disabled={items.length < perPage} onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded-md bg-[#222] text-sm text-gray-200">Next</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
