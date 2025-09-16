import React, { useEffect, useMemo, useState } from "react";
import { privateAxios } from "../../../../utils/axios";
import { showError, showSuccess } from "../../../../utils/toast";
import { useNavigate } from "react-router-dom";
const MCQ_BASE = "/college-mcqs";

import MarkdownRenderer from "../../../../utils/MarkDownRender";

function ListMCQ() {
  // UI state
  const [mcqs, setMcqs] = useState([]);
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
  const [counts, setCounts] = useState({
    Easy: 0,
    Medium: 0,
    Hard: 0,
    total: 0,
  });

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
      "Data Interpretation",
    ],
    "Logical Reasoning": [
      "Puzzles",
      "Seating Arrangement",
      "Blood Relations",
      "Coding-Decoding",
      "Syllogisms",
      "Direction Sense",
      "Series (Number/Alphabet)",
      "Clocks & Calendars",
    ],
    "Verbal Ability": [
      "Reading Comprehension",
      "Sentence Correction",
      "Fill in the Blanks",
      "Synonyms & Antonyms",
      "Paragraph Jumbles",
      "Critical Reasoning",
    ],
    "Operating Systems": [
      "Process Management",
      "CPU Scheduling",
      "Memory Management",
      "Deadlocks",
      "File Systems",
      "Concurrency & Synchronization",
    ],
    DBMS: [
      "ER Model",
      "Normalization",
      "SQL Queries",
      "Transactions",
      "Indexing",
      "Joins & Keys",
    ],
    "Computer Networks": [
      "OSI & TCP/IP Models",
      "IP Addressing",
      "Routing",
      "Switching",
      "Congestion Control",
      "Application Layer Protocols (HTTP, DNS, FTP)",
    ],
    Programming: [
      "C/C++ Basics",
      "Java Basics",
      "Python Basics",
      "OOP Concepts",
      "Exception Handling",
      "Standard Libraries",
    ],
    "Data Structures": [
      "Arrays",
      "Strings",
      "Linked List",
      "Stacks & Queues",
      "Trees",
      "Graphs",
      "Hashing",
      "Heaps",
    ],
    Algorithms: [
      "Sorting",
      "Searching",
      "Recursion & Backtracking",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Graph Algorithms",
      "Divide & Conquer",
    ],
    "Software Engineering": [
      "SDLC Models",
      "Agile & Scrum",
      "Testing & Debugging",
      "Version Control (Git)",
    ],
    "System Design": [
      "Scalability Basics",
      "Load Balancing",
      "Caching",
      "Databases in Design",
      "High-Level Design Questions",
    ],
    "HR & Behavioral": [
      "Tell me about yourself",
      "Strengths & Weaknesses",
      "Teamwork",
      "Leadership",
      "Conflict Resolution",
      "Why should we hire you?",
    ],
  };

  const TOPICS = Object.keys(SUBTOPICS);
  const subtopicOptions = topic ? SUBTOPICS[topic] || [] : [];

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

  const fetchMCQs = async () => {
    setLoading(true);
    try {
      const { data } = await privateAxios.get(MCQ_BASE + "/", { params });
      if (!data?.success)
        throw new Error(data?.message || "Failed to fetch MCQs");

      const payload = data.data;
      setMcqs(payload.mcqs || []);
      setPage(payload.page || 1);
      setTotal(payload.total || 0);
      setTotalPages(payload.total_pages || 1);
      setCounts(
        payload.counts || {
          Easy: 0,
          Medium: 0,
          Hard: 0,
          total: payload.total || 0,
        }
      );
    } catch (e) {
      showError(
        e?.response?.data?.message || e.message || "Unable to fetch MCQs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMCQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onDelete = async (id) => {
    if (!confirm("Delete this MCQ permanently?")) return;
    try {
      const { data } = await privateAxios.delete(`${MCQ_BASE}/${id}`);
      if (!data?.success) throw new Error(data?.message || "Failed to delete");
      showSuccess("MCQ deleted");
      if (mcqs.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchMCQs();
    } catch (e) {
      showError(e?.response?.data?.message || e.message || "Delete failed");
    }
  };

  const getOptionLabel = (i) => String.fromCharCode(65 + i);

  const startIdx = (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);

  return (
    <div className="min-h-auto bg-gray-50">
      {/* Enhanced Sticky Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="flex items-center justify-between py-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  MCQ Management
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and organize your multiple choice questions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/questions/mcq/add")}
                className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                style={{ backgroundColor: "#4CA466" }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Add New MCQ
              </button>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchInput}
                  onChange={(e) => {
                    setPage(1);
                    setSearchInput(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Topic */}
              <select
                value={topic}
                onChange={(e) => {
                  const next = e.target.value;
                  setTopic(next);
                  setSubtopic("");
                  setPage(1);
                }}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Topics</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Subtopic */}
              <select
                value={subtopic}
                onChange={(e) => {
                  setSubtopic(e.target.value);
                  setPage(1);
                }}
                disabled={!topic}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 transition-all duration-200"
              >
                {!topic ? (
                  <option value="">Select topic first</option>
                ) : (
                  <>
                    <option value="">All Subtopics</option>
                    {subtopicOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Difficulty */}
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Per Page */}
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {[5, 10, 20, 50, 100].map((p) => (
                  <option key={p} value={p}>
                    {p} per page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Questions List
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center text-sm text-gray-600">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading questions...
                </div>
              </div>
            )}
            {!loading && mcqs.length === 0 && (
              <div className="p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  No questions found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
            {!loading &&
              mcqs.map((mcq) => (
                <div
                  key={mcq.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mcq.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                            mcq.difficulty_level
                          )}`}
                        >
                          {mcq.difficulty_level || "—"}
                        </span>
                        {mcq.is_multiple && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Multiple Choice
                          </span>
                        )}
                      </div>

                      <div className="prose prose-sm max-w-none mb-4">
                        <MarkdownRenderer text={mcq.question_text}/>
                      </div>      

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {mcq.options?.map((option, idx) => {
                          const label = getOptionLabel(idx);
                          return (
                            <div
                              key={option.option_id ?? idx}
                              className="flex items-center space-x-2"
                            >
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 bg-white">
                                {label}
                              </span>
                              <div className="prose prose-sm">
                            <MarkdownRenderer text={option.value}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 7h.01M7 3h5l7 7"
                            ></path>
                          </svg>
                          {mcq.topic}
                        </div>
                        {mcq.subtopic && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 7h.01M7 3h5l7 7"
                              ></path>
                            </svg>
                            {mcq.subtopic}
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 19v-6m6 8V5"
                            ></path>
                          </svg>
                          {mcq.marks} marks
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() =>
                          navigate(`/questions/mcq/${mcq.id}/edit`)
                        }
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(mcq.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 hover:border-red-400 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Enhanced Merged Pagination at Bottom */}
          {!loading && mcqs.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {loading
                    ? "Loading..."
                    : `Showing ${startIdx}-${endIdx} of ${total} results`}
                </div>
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages || 1}
                </div>
              </div>

              {/* Enhanced Pagination Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Navigation Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(1)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={page <= 1}
                  >
                    First
                  </button>

                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                    disabled={page <= 1}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Prev
                  </button>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const start = Math.max(
                      1,
                      Math.min(page - 2, totalPages - 4)
                    );
                    const num = start + idx;
                    if (num > totalPages) return null;
                    const active = num === page;
                    return (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          active
                            ? "text-white shadow-md transform scale-105"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                        style={
                          active
                            ? {
                                backgroundColor: "#4CA466",
                                borderColor: "#4CA466",
                              }
                            : {}
                        }
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                {/* Jump to Page & Next/Last */}
                <div className="flex items-center space-x-2">
                  {/* Jump to Page */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Go to:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages || 1}
                      value={page}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 1;
                        const next = Math.min(
                          Math.max(1, val),
                          totalPages || 1
                        );
                        setPage(next);
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Jump to page"
                    />
                  </div>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages || 1, p + 1))
                    }
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                    disabled={page >= (totalPages || 1)}
                  >
                    Next
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => setPage(totalPages || 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    disabled={page >= (totalPages || 1)}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListMCQ;
