import React, { useEffect, useMemo, useState } from "react";
// import { privateAxios } from "../../utils/axios";
import { privateAxios } from "../../../../utils/axios";
import { showError, showSuccess } from "../../../../utils/toast";
import { useNavigate } from "react-router-dom";
const REARRANGE_BASE = "/college-rearranges"; // adjust if your blueprint is mounted elsewhere (e.g. "/api/rearrange")
import MarkdownRenderer from "../../../../utils/MarkDownRender";

function ListRearrange() {
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filters + pagination
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Server meta
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ Easy: 0, Medium: 0, Hard: 0, total: 0 });

  // Re-use your SUBTOPICS / TOPICS map from MCQ (paste same map or import if shared)
  const SUBTOPICS = {
    Aptitude: [
      "Quantitative Aptitude",
      "Number System",
      "Percentages",
      "Ratios & Proportions",
      "Time & Work",
      "Speed, Time & Distance",
      "Probability",
      "Permutations & Combinations",
      "Mensuration",
      "Data Interpretation"
    ],
    "Logical Reasoning": [
      "Puzzles",
      "Seating Arrangement",
      "Blood Relations",
      "Coding-Decoding",
      "Syllogisms",
      "Direction Sense",
      "Series (Number/Alphabet)",
      "Clocks & Calendars"
    ],
    "Verbal Ability": [
      "Reading Comprehension",
      "Sentence Correction",
      "Fill in the Blanks",
      "Synonyms & Antonyms",
      "Paragraph Jumbles",
      "Critical Reasoning"
    ],
    "Operating Systems": [
      "Process Management",
      "CPU Scheduling",
      "Memory Management",
      "Deadlocks",
      "File Systems",
      "Concurrency & Synchronization"
    ],
    DBMS: [
      "ER Model",
      "Normalization",
      "SQL Queries",
      "Transactions",
      "Indexing",
      "Joins & Keys"
    ],
    "Computer Networks": [
      "OSI & TCP/IP Models",
      "IP Addressing",
      "Routing",
      "Switching",
      "Congestion Control",
      "Application Layer Protocols (HTTP, DNS, FTP)"
    ],
    Programming: [
      "C/C++ Basics",
      "Java Basics",
      "Python Basics",
      "OOP Concepts",
      "Exception Handling",
      "Standard Libraries"
    ],
    "Data Structures": [
      "Arrays",
      "Strings",
      "Linked List",
      "Stacks & Queues",
      "Trees",
      "Graphs",
      "Hashing",
      "Heaps"
    ],
    Algorithms: [
      "Sorting",
      "Searching",
      "Recursion & Backtracking",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Graph Algorithms",
      "Divide & Conquer"
    ],
    "Software Engineering": [
      "SDLC Models",
      "Agile & Scrum",
      "Testing & Debugging",
      "Version Control (Git)"
    ],
    "System Design": [
      "Scalability Basics",
      "Load Balancing",
      "Caching",
      "Databases in Design",
      "High-Level Design Questions"
    ],
    "HR & Behavioral": [
      "Tell me about yourself",
      "Strengths & Weaknesses",
      "Teamwork",
      "Leadership",
      "Conflict Resolution",
      "Why should we hire you?"
    ]
  };

  const TOPICS = Object.keys(SUBTOPICS);
  const subtopicOptions = topic ? (SUBTOPICS[topic] || []) : [];

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(search ? { search } : {}),
      ...(topic ? { topic } : {}),
      ...(subtopic ? { subtopic } : {}),
      ...(difficulty ? { difficulty_level: difficulty } : {}),
    }),
    [page, perPage, search, topic, subtopic, difficulty]
  );

  const getDifficultyColor = (lvl) => {
    switch (lvl) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchRearranges = async () => {
    setLoading(true);
    try {
      const { data } = await privateAxios.get(REARRANGE_BASE + "/", { params });
      if (!data?.success) throw new Error(data?.message || "Failed to fetch rearrange questions");

      const payload = data.data;
      setItemsList(payload.rearranges || []);
      setPage(payload.page || 1);
      setTotal(payload.total || 0);
      setTotalPages(payload.total_pages || 1);
      setCounts(payload.counts || { Easy: 0, Medium: 0, Hard: 0, total: payload.total || 0 });
    } catch (e) {
      showError(e?.response?.data?.message || e.message || "Unable to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRearranges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onDelete = async (id) => {
    if (!confirm("Delete this question permanently?")) return;
    try {
      const { data } = await privateAxios.delete(`${REARRANGE_BASE}/${id}`);
      if (!data?.success) throw new Error(data?.message || "Failed to delete");
      showSuccess("Question deleted");
      if (itemsList.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchRearranges();
    } catch (e) {
      showError(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<header className="bg-white shadow-sm border-b sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rearrange Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your reorder/sequence questions</p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate("/questions/rearrange/add")}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white shadow-sm"
          style={{ backgroundColor: "#4CA466" }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>
    </div>

    {/* Compact filters row (single-line, wraps on small screens) */}
    <div className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        placeholder="Search"
        value={searchInput}
        onChange={(e) => { setPage(1); setSearchInput(e.target.value); }}
        className="w-full sm:w-64 pl-3 pr-2 py-1 text-sm border border-gray-300 rounded-lg outline-none focus:ring-1"
      />

      <select
        value={topic}
        onChange={(e) => { const next = e.target.value; setTopic(next); setSubtopic(""); setPage(1); }}
        className="text-sm px-2 py-1 border border-gray-300 rounded-lg outline-none"
      >
        <option value="">All Topics</option>
        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select
        value={subtopic}
        onChange={(e) => { setSubtopic(e.target.value); setPage(1); }}
        disabled={!topic}
        className="text-sm px-2 py-1 border border-gray-300 rounded-lg outline-none disabled:opacity-60"
      >
        {!topic ? <option value="">Select topic first</option> : (
          <>
            <option value="">All Subtopics</option>
            {subtopicOptions.map((st) => <option key={st} value={st}>{st}</option>)}
          </>
        )}
      </select>

      <select
        value={difficulty}
        onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
        className="text-sm px-2 py-1 border border-gray-300 rounded-lg outline-none"
      >
        <option value="">All Levels</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      <select
        value={perPage}
        onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
        className="text-sm px-2 py-1 border border-gray-300 rounded-lg outline-none"
      >
        {[5,10,20,50,100].map(p => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
{/* Page jump - number input */}
<div className="flex items-center space-x-2">
  <button
    onClick={() => setPage(1)}
    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
    disabled={page <= 1}
  >
    First
  </button>

  <button
    onClick={() => setPage(p => Math.max(1, p - 1))}
    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
    disabled={page <= 1}
  >
    ‹
  </button>

  <input
    type="number"
    min={1}
    max={totalPages || 1}
    value={page}
    onChange={(e) => {
      const val = Number(e.target.value) || 1;
      // clamp to [1, totalPages]
      const next = Math.min(Math.max(1, val), totalPages || 1);
      setPage(next);
    }}
    className="w-20 pl-2 pr-2 py-1 border rounded text-sm"
    aria-label="Jump to page"
  />

  <span className="text-sm">/ {totalPages || 1}</span>

  <button
    onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
    disabled={page >= (totalPages || 1)}
  >
    ›
  </button>

  <button
    onClick={() => setPage(totalPages || 1)}
    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
    disabled={page >= (totalPages || 1)}
  >
    Last
  </button>
</div>

    {/* Compact stats row */}
    <div className="flex items-center gap-3 py-2">
      <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{counts.total}</span></div>
      <div className="text-sm text-gray-600">Easy: <span className="font-semibold">{counts.Easy || 0}</span></div>
      <div className="text-sm text-gray-600">Medium: <span className="font-semibold">{counts.Medium || 0}</span></div>
      <div className="text-sm text-gray-600">Hard: <span className="font-semibold">{counts.Hard || 0}</span></div>
    </div>
  </div>
</header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
    

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Questions List</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {loading ? "Loading…" : `Showing ${startIdx}-${endIdx} of ${total} results`}
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading && <div className="p-6 text-sm text-gray-600">Fetching questions…</div>}
            {!loading && itemsList.length === 0 && <div className="p-6 text-sm text-gray-600">No questions found.</div>}
            {!loading && itemsList.map((q) => (
              <div key={q.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
<h3 className="text-lg font-semibold text-gray-900">
  <MarkdownRenderer
    text={q.title || "Untitled"}
    useTerminalForCode={false}
    className="!text-lg !font-semibold !text-gray-900"
  />
</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                          q.difficulty_level
                        )}`}
                      >
                        {q.difficulty_level || "—"}
                      </span>
                    </div>

<div className="text-gray-700 mb-3 font-medium">
  <MarkdownRenderer text={q.prompt || ""} useTerminalForCode={false} />
</div>
                    {/* Items (shuffled representation) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {(q.items || []).map((it, idx) => (
                        <div key={it.item_id ?? idx} className="flex items-start space-x-3">
                          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                            {idx + 1}
                          </div>
<div className="text-sm text-gray-700">
  <MarkdownRenderer text={it.value || `Item ${idx + 1}`} useTerminalForCode={true} />
</div>                        </div>
                      ))}
                    </div>

                    {/* Correct Order (show as small chips with order numbers) */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <div className="font-medium mr-2">Correct Order:</div>
                      <div className="flex flex-wrap gap-2">
                        {(q.correct_order || []).map((itemId, pos) => {
                          const itemObj = (q.items || []).find((it) => it.item_id === itemId) || {};
                          return (
                            <div key={itemId} className="inline-flex items-center px-2 py-1 rounded-full border bg-gray-50 text-gray-700 text-xs">
                              <span className="mr-2 font-semibold">{pos + 1}.</span>
<span className="max-w-xs truncate">
  <MarkdownRenderer text={itemObj.value || String(itemId)} useTerminalForCode={false} />
</span>                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5l7 7"></path>
                        </svg>
                        {q.topic}
                      </div>
                      {q.subtopic && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5l7 7"></path>
                          </svg>
                          {q.subtopic}
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6m6 8V5"></path>
                        </svg>
                        {q.marks} marks
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => navigate(`/questions/rearrange/${q.id}/edit`)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 17l12.732-12.732"></path>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(q.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIdx || 0}</span> to{" "}
                <span className="font-medium">{endIdx || 0}</span> of{" "}
                <span className="font-medium">{total || 0}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const num = start + idx;
                  if (num > totalPages) return null;
                  const active = num === page;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg ${
                        active
                          ? "text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      style={active ? { backgroundColor: "#4CA466", borderColor: "#4CA466" } : {}}
                    >
                      {num}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListRearrange;
