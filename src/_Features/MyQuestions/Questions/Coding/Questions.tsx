import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Tag,
  BookOpen,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  addMinimalCodingQuestion,
  fetchMinimalQuestions,
} from "./services/codingQuestions"; // adjust path
import { useNavigate } from "react-router-dom";
import { showError, showInfo, showSuccess } from "../../../../utils/toast";

function QuestionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(6);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const [newQuestion, setNewQuestion] = useState({
    title: "",
    shortDescription: "",
    topic: "",
    subtopic: "",
  });

  // server-driven state
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    per_page: 6,
    total: 0,
    total_pages: 1,
    available_tags: [],
    all_tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // topics with subtopics
  const topics = [
    {
      name: "Data Structures",
      subtopics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"],
    },
    {
      name: "Algorithms",
      subtopics: [
        "Sorting",
        "Searching",
        "Dynamic Programming",
        "Greedy",
        "Recursion",
      ],
    },
    {
      name: "Mathematics",
      subtopics: ["Number Theory", "Combinatorics", "Probability", "Geometry"],
    },
    {
      name: "Strings",
      subtopics: ["Pattern Matching", "Parsing", "Regular Expressions"],
    },
  ];

  // derive a flat list of topic names for selects
  const topicNames = useMemo(() => topics.map((t) => t.name), [topics]);

  // derive tag list for dropdown: prefer available_tags when filters applied else all_tags
  const allTags = useMemo(() => {
    const source =
      meta.available_tags && meta.available_tags.length > 0
        ? meta.available_tags
        : meta.all_tags;
    return (source || []).filter(
      (t) =>
        t.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
        !selectedTags.includes(t)
    );
  }, [meta, tagSearchTerm, selectedTags]);

  // subtopics for currently selected topic (for both filter and add modal)
  const subtopicsForSelectedTopic = useMemo(() => {
    const t = topics.find(
      (x) => x.name === (selectedTopic || newQuestion.topic)
    );
    return t ? t.subtopics : [];
  }, [topics, selectedTopic, newQuestion.topic]);

  // Local helpers
  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setTagSearchTerm("");
    setShowTagDropdown(false);
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTopic("");
    setSelectedSubtopic("");
    setSelectedTags([]);
    setTagSearchTerm("");
  };

  // fetch function
  const loadQuestions = useCallback(
    async (opts = {}) => {
      setLoading(true);
      setLoadingError(null);
      try {
        // optional: small info toast when a manual reload triggered could be added, but avoid spamming while user types
        const resp = await fetchMinimalQuestions({
          search: opts.search ?? searchTerm,
          topic: opts.topic ?? selectedTopic,
          subtopic: opts.subtopic ?? selectedSubtopic,
          tags: opts.tags ?? selectedTags,
          page: opts.page ?? currentPage,
          per_page: opts.per_page ?? questionsPerPage,
          sort: opts.sort ?? "new",
        });
        // resp: { items, meta }
        setQuestions(resp.items || []);
        setMeta(
          resp.meta || {
            page: opts.page ?? currentPage,
            per_page: opts.per_page ?? questionsPerPage,
            total: 0,
            total_pages: 1,
            available_tags: [],
            all_tags: [],
          }
        );
      } catch (err) {
        console.error("loadQuestions error", err);
        const message = err?.message || "Failed to fetch questions";
        setLoadingError(message);
        showError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedTopic,
      selectedSubtopic,
      selectedTags,
      currentPage,
      questionsPerPage,
    ]
  );

  // reload when filters / pagination change
  useEffect(() => {
    // whenever filters change, go to page 1
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedTopic,
    selectedSubtopic,
    selectedTags,
    questionsPerPage,
  ]);

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    selectedTopic,
    selectedSubtopic,
    selectedTags,
    currentPage,
    questionsPerPage,
  ]);

  // -----------------------
  // Add question implementation (calls API + optimistic update)
  // -----------------------

  const handleAddQuestion = async () => {
    if (
      !newQuestion.title ||
      !newQuestion.shortDescription ||
      !newQuestion.topic ||
      !newQuestion.subtopic
    ) {
      showError("Please fill all required fields.");
      return;
    }

    const payload = {
      title: newQuestion.title.trim(),
      short_description: newQuestion.shortDescription.trim(),
      topic: newQuestion.topic.trim(),
      subtopic: newQuestion.subtopic.trim(),
    };

    try {
      setIsAdding(true);
      const res = await addMinimalCodingQuestion(payload);
      // optimistic push to top of list
      const addedQuestion = {
        id: res?.id || Date.now(),
        title: payload.title,
        shortDescription: payload.short_description,
        // keep structured fields for UI (some items from server may still be string)
        topic: newQuestion.topic,
        subtopic: newQuestion.subtopic,
        tags: [],
        difficulty: "Easy",
      };

      setQuestions((prev) => [addedQuestion, ...prev]);
      // update total count in meta (approx)
      setMeta((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));

      setNewQuestion({
        title: "",
        shortDescription: "",
        topic: "",
        subtopic: "",
      });
      setShowAddQuestionModal(false);
      showSuccess("Question added successfully");
    } catch (err) {
      console.error(err);
      showError(err?.message || "Failed to add question");
    } finally {
      setIsAdding(false);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > (meta.total_pages || 1)) return;
    setCurrentPage(page);
  };

  const handlePerPageChange = (perPage) => {
    setQuestionsPerPage(perPage);
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
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

  const totalPages = Math.max(1, meta.total_pages || 1);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const showingCount = questions.length;
  const totalDisplayText = meta.total || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Search & Filters - Updated to match CodingList */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E5E5E5]">
        <div className="max-w-full mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Coding (Local)
            </h1>

            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="px-4 py-2 bg-[#4CA466] text-white rounded-xl hover:bg-[#3C8A52] transition-colors font-medium"
            >
              + Add
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#555555] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] placeholder-[#555555]"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setSelectedSubtopic("");
                }}
                className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] appearance-none cursor-pointer"
              >
                <option value="">All Topics</option>
                {topicNames.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] appearance-none cursor-pointer"
              >
                <option value="">All Subtopics</option>
                {topics
                  .find((t) => t.name === selectedTopic)
                  ?.subtopics.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                value={tagSearchTerm}
                onChange={(e) => {
                  setTagSearchTerm(e.target.value);
                  setShowTagDropdown(true);
                }}
                onFocus={() => setShowTagDropdown(true)}
                className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] placeholder-[#555555]"
                placeholder="Search tags..."
              />

              {/* Tag Dropdown */}
              {showTagDropdown && allTags.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg z-10 max-h-48 overflow-y-auto">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-[#555555]">
              Showing {showingCount} of {totalDisplayText} questions
            </p>
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#4CA466] hover:text-[#3C8A52] font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-[#555555] py-1">Selected tags:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#4CA466] text-white text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:bg-[#3C8A52] rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="w-full mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
              No questions found
            </h3>
            <p className="text-[#555555] mb-6">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#4CA466] text-white rounded-xl hover:bg-[#3C8A52] transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 w-full">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
                    {question.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent parent click
                        window.open(
                          `/questions/coding/${question.id}/code-builder`,
                          "_blank"
                        );
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // collection is always 'questions' per requirement
                        const collection = "college_questions";
                        const url = `/${collection}/${question.id}/preview`;
                        window.open(url, "_blank");
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`Preview question ${question.title}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {question.shortDescription}
                </p>

                {/* Topic & Subtopic */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    <BookOpen className="w-3 h-3" />
                    {question.topic && question.subtopic
                      ? `${question.topic} / ${question.subtopic}`
                      : typeof question.topic === "string"
                      ? question.topic
                      : ""}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {(question.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {(question.tags || []).length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{(question.tags || []).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#555555]">Show:</span>
                <select
                  value={questionsPerPage}
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                  className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] text-sm"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange((meta.page || currentPage) - 1)}
                  disabled={(meta.page || currentPage) === 1}
                  className="p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1 mx-4 items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if ((meta.page || currentPage) <= 3) {
                      pageNum = i + 1;
                    } else if ((meta.page || currentPage) >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = (meta.page || currentPage) - 2 + i;
                    }

                    const prev = i > 0 ? (totalPages <= 5 ? i : (meta.page || currentPage) <= 3 ? i : (meta.page || currentPage) >= totalPages - 2 ? totalPages - 4 + i - 1 : (meta.page || currentPage) - 2 + i - 1) : null;
                    const showEllipsis = prev && pageNum - prev > 1;

                    return (
                      <React.Fragment key={`frag-${pageNum}-${i}`}>
                        {showEllipsis && <span className="px-2">…</span>}
                        <button
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            (meta.page || currentPage) === pageNum
                              ? "bg-[#4CA466] text-white"
                              : "border border-[#E5E5E5] hover:bg-[#F9FAFB] text-[#555555]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange((meta.page || currentPage) + 1)}
                  disabled={(meta.page || currentPage) === totalPages}
                  className="p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="ml-4 text-sm text-[#555555]">
                  Page {meta.page || currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Question
                </h3>
                <button
                  onClick={() => setShowAddQuestionModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                  placeholder="Enter question title..."
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic *
                </label>
                <select
                  value={newQuestion.topic}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      topic: e.target.value,
                      subtopic: "",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                >
                  <option value="">Select Topic</option>
                  {topicNames.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtopic (dependent) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtopic *
                </label>
                <select
                  value={newQuestion.subtopic}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      subtopic: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors"
                  disabled={!newQuestion.topic}
                >
                  <option value="">Select Subtopic</option>
                  {topics
                    .find((t) => t.name === newQuestion.topic)
                    ?.subtopics.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                </select>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={newQuestion.shortDescription}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-colors resize-none"
                  placeholder="Brief description of the problem..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                disabled={
                  isAdding ||
                  !newQuestion.title ||
                  !newQuestion.shortDescription ||
                  !newQuestion.topic ||
                  !newQuestion.subtopic
                }
                className="px-4 py-2 bg-[#4CA466] text-white font-medium rounded-lg hover:bg-[#3d8a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAdding ? "Adding..." : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close tag dropdown */}
      {showTagDropdown && (
        <div
          className="fixed inset-0"
          onClick={() => setShowTagDropdown(false)}
        />
      )}
    </div>
  );
}

export default QuestionList;