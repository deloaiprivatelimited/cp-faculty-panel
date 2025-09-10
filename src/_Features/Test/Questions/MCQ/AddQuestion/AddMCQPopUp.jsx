import React, { useState, useEffect, useCallback } from "react";
import { privateAxios } from "../../../../../utils/axios";
import { showError } from "../../../../../utils/toast";

/**
 * MCQPopp - fully server-driven list/filter/pagination integration
 *
 * Expects backend endpoint: GET /test/questions/mcqs/
 * Query params supported: page, per_page, search, tags (comma separated), topic, subtopic, difficulty_level
 * Backend response shape (existing): resp.data.data.items, resp.data.data.meta
 */

const MCQPopp = ({ isPopupOpen, setIsPopupOpen, handleMCQAdd, adding }) => {
  // popup + selection
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // server-provided page items
  const [mcqs, setMcqs] = useState([]);

  // meta from backend: topics, subtopics, tags, difficulty_levels, total, total_pages, page, per_page
  const [meta, setMeta] = useState({
    topics: [],
    subtopics: [],
    tags: [],
    difficulty_levels: [],
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
  });

  // filters / UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");

  // pagination / loading
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20); // frontend default; we send per_page to backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // tag dropdown state
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // preview
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // helper: map option index to letters A/B/C...
  const optionLabel = (index) => String.fromCharCode(65 + index);

  // ------------ fetchData (server-driven) ------------
  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page,
          per_page: perPage,
        };

        if (searchTerm?.trim()) params.search = searchTerm.trim();
        if (selectedTags.length > 0) params.tags = selectedTags.join(","); // backend expects comma-separated
        if (selectedDifficulty) params.difficulty_level = selectedDifficulty;
        if (selectedTopic) params.topic = selectedTopic;
        if (selectedSubtopic) params.subtopic = selectedSubtopic;

        const resp = await privateAxios.get("/test/questions/mcqs/", { params });

        const items = resp?.data?.data?.items || [];
        const metaResp = resp?.data?.data?.meta || {};

        setMcqs(items);
        setMeta((prev) => ({
          topics: metaResp.topics || prev.topics,
          subtopics: metaResp.subtopics || prev.subtopics,
          tags: metaResp.tags || prev.tags,
          difficulty_levels: metaResp.difficulty_levels || prev.difficulty_levels,
          total: metaResp.total ?? prev.total,
          page: metaResp.page ?? page,
          per_page: metaResp.per_page ?? perPage,
          total_pages: metaResp.total_pages ?? Math.max(1, Math.ceil((metaResp.total ?? items.length) / perPage)),
        }));

        setCurrentPage(metaResp.page ?? page);
      } catch (err) {
        console.error("Failed to fetch MCQs/meta:", err);
        const backendMessage = err?.response?.data?.message;
        setError(backendMessage || "Failed to load questions. Check your backend or network.");
        showError(backendMessage || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    },
    [perPage, searchTerm, selectedTags, selectedDifficulty, selectedTopic, selectedSubtopic]
  );

  // -------------- effects ----------------

  // open popup => load page 1
  useEffect(() => {
    if (isPopupOpen) {
      // reset page to 1 on open
      setCurrentPage(1);
      fetchData(1);
    }
  }, [isPopupOpen, fetchData]);

  // when page changes, fetch that page (if popup open)
  useEffect(() => {
    if (isPopupOpen) fetchData(currentPage);
  }, [currentPage, isPopupOpen, fetchData]);

  // debounce search/filter triggers (reduce request spam)
  useEffect(() => {
    if (!isPopupOpen) return; // only when popup open
    const timer = setTimeout(() => {
      // when filters change, fetch page 1
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedTags, selectedDifficulty, selectedTopic, selectedSubtopic, perPage, isPopupOpen, fetchData]);

  // ------------ helpers ------------
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) => (prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]));
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      return next;
    });
    // immediate fetch will be handled by debounce effect; we can optionally force fetch:
    // setCurrentPage(1); fetchData(1);
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedDifficulty("");
    setSelectedTopic("");
    setSelectedSubtopic("");
    setTagSearchTerm("");
    setSelectedQuestions([]);
    setCurrentPage(1);
    // fetchData(1) will run via debounce effect
  };

  const openPreview = (question) => setPreviewQuestion(question);
  const closePreview = () => setPreviewQuestion(null);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 bg-green-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
const handleAddQuestions = async () => {
  console.log("Selected Question IDs:", selectedQuestions);

  if (!handleMCQAdd || typeof handleMCQAdd !== "function") {
    // fallback: close popup
    setIsPopupOpen(false);
    setSelectedQuestions([]);
    return;
  }

  try {
    // delegate actual POST to parent (SelectedSectionView)
    await handleMCQAdd(selectedQuestions);

    // on success clear local selections and close popup
    setSelectedQuestions([]);
    // parent is expected to close popup, but ensure fallback
    setIsPopupOpen(false);
  } catch (err) {
    console.error("Failed adding questions via parent handler:", err);
    showError?.("Failed to add questions.");
  }
};


  // filtered tags for dropdown suggestions (client-side filter of meta.tags)
  const filteredTagsForDropdown = (tagSearchTerm ? (meta.tags || []).filter((t) => t.toLowerCase().includes(tagSearchTerm.toLowerCase())) : (meta.tags || []));

  // derived totals/pages from meta
  const totalPages = meta.total_pages || Math.max(1, Math.ceil((meta.total || 0) / perPage));
  const totalItems = meta.total ?? 0;

  // ---------------- UI ----------------
  return (
    <div>
    

      {/* MCQ Selection Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Select MCQ Questions</h3>
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    setSelectedQuestions([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    className="px-3 py-2 border rounded col-span-1 md:col-span-2 lg:col-span-2"
                  />

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => {
                      setSelectedDifficulty(e.target.value);
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">All Difficulties</option>
                    {(meta.difficulty_levels || []).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      // reset subtopic when topic changes
                      setSelectedSubtopic("");
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">All Topics</option>
                    {(meta.topics || []).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedSubtopic}
                    onChange={(e) => {
                      setSelectedSubtopic(e.target.value);
                    }}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">All Subtopics</option>
                    {(meta.subtopics || []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <div className="relative lg:col-span-1">
                    <button
                      onClick={() => setIsTagDropdownOpen((s) => !s)}
                      className="w-full px-3 py-2 border rounded text-left flex items-center justify-between"
                    >
                      <span>Tags ({selectedTags.length})</span>
                      <svg className={`w-4 h-4 ${isTagDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    </button>

                    {isTagDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow z-20 max-h-60 overflow-hidden">
                        <div className="p-3 border-b">
                          <input
                            type="text"
                            placeholder="Search tags..."
                            value={tagSearchTerm}
                            onChange={(e) => setTagSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                        </div>
                        <div className="max-h-40 overflow-auto p-2">
                          {filteredTagsForDropdown.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${selectedTags.includes(tag) ? "bg-[#4CA466] text-white" : "hover:bg-gray-100"}`}
                            >
                              {tag}
                            </button>
                          ))}
                          {filteredTagsForDropdown.length === 0 && <p className="text-sm text-gray-500 p-2">No tags found</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((t) => (
                        <span key={t} className="inline-flex items-center bg-[#4CA466] text-white px-3 py-1 rounded-full text-xs">
                          {t}
                          <button
                            onClick={() => removeTag(t)}
                            className="ml-2 text-white text-xs"
                            aria-label={`remove ${t}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear All Button */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* MCQ List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : mcqs.length === 0 ? (
                  <div className="text-center py-8">No questions found.</div>
                ) : (
                  <div className="space-y-4">
                    {mcqs.map((mcq) => (
                      <div
                        key={mcq.id}
                        className={`p-4 border rounded ${selectedQuestions.includes(mcq.id) ? "border-[#4CA466] bg-[#4CA466] bg-opacity-5" : "border-gray-200"}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(mcq.id)}
                              onChange={() => toggleQuestionSelection(mcq.id)}
                              className="mt-1 w-4 h-4"
                            />
                            <div>
                              <h4 className="font-medium">{mcq.title}</h4>
                              <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: mcq.question }} />
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(mcq.difficulty_level)}`}>{mcq.difficulty_level}</div>
                            <div className="text-sm text-gray-500">{mcq.marks} marks</div>
                            <div className="mt-2">
                              <button onClick={() => openPreview(mcq)} className="px-2 py-1 border rounded text-xs">
                                Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination + Footer */}
              <div className="p-6 border-t flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="mr-2 text-sm">Per page:</label>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setPerPage(v);
                        setCurrentPage(1);
                        // fetchData will run via debounce effect
                      }}
                      className="border px-2 py-1 rounded"
                    >
                      {[5, 10, 20, 50].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages} • {totalItems} items
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">{selectedQuestions.length > 0 ? `${selectedQuestions.length} selected` : "Select questions to continue"}</div>

                  <button
                    onClick={() => {
                      setIsPopupOpen(false);
                      setSelectedQuestions([]);
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddQuestions}
                    disabled={selectedQuestions.length === 0}
                    className={`px-6 py-2 rounded font-medium ${selectedQuestions.length > 0 ? "bg-[#4CA466] text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                  >
                    Add Questions ({selectedQuestions.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-xl font-semibold">{previewQuestion.title}</h3>
              <button onClick={closePreview} className="px-2 py-1 border rounded">
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4" dangerouslySetInnerHTML={{ __html: previewQuestion.question }} />
              <div className="space-y-2">
                {(previewQuestion.options || []).map((opt, idx) => (
                  <div key={opt.id || idx} className={`p-3 rounded border ${opt.is_correct ? "border-green-300 bg-green-50" : "border-gray-200"}`}>
                    <strong className="inline-block w-6">{optionLabel(idx)}</strong> — <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQPopp;
