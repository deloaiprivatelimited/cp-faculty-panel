<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { BookOpen, Globe, Check, X } from "lucide-react";
import { privateAxios } from "../../../../utils/axios";

export type SourceType = "library" | "global" | null;

=======
import React, { useEffect, useState } from 'react';
import { BookOpen, Globe, Check, X } from 'lucide-react';
// import { privateAxios } from "../path/to/axiosConfig"; // adjust the import path
import { privateAxios } from '../../../../utils/axios';
export type SourceType = 'library' | 'global' | null;
import MCQCard from '../../../Utils/MCQ/MCQCard';
import MCQPreview from '../../../Utils/MCQ/MCQPreview';
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
export interface Option {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id: string;
  title: string;
  question?: string;
  description?: string;
  options?: Option[];
  marks?: number | null;
  negative_marks?: number | null;
  is_multiple?: boolean;
  difficulty_level?: string;
  tags?: string[];
  topic?: string;
  subtopic?: string;
  created_by?: { id?: string; name?: string } | null;
}

export interface DuplicateResult {
  original_mcq_id: string;
  test_mcq_id?: string;
  section_id?: string;
  success: boolean;
  message?: string;
}

interface SelectMCQProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (source: SourceType, results: DuplicateResult[]) => void;
  defaultSectionId?: string;
  apiBase?: string;
}

const SelectMCQ: React.FC<SelectMCQProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultSectionId = "",
  apiBase = "",
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [subtopicFilter, setSubtopicFilter] = useState<string>("");

  // dynamic dropdowns (from all questions)
  const [topics, setTopics] = useState<string[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSource(null);
      setSelectedIds([]);
      setQuestions([]);
      setError(null);
      setPage(1);
      setTotal(null);
      setSearchTerm("");
      setDifficultyFilter("");
      setTopicFilter("");
      setSubtopicFilter("");
    }
  }, [isOpen]);

  // Fetch questions for current page
  useEffect(() => {
    if (!selectedSource) return;
    fetchMCQs(selectedSource, page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, page, searchTerm, difficultyFilter, topicFilter, subtopicFilter]);

  // Fetch all questions once to populate filter dropdowns
  useEffect(() => {
    if (!selectedSource) return;
    fetchAllQuestionsForFilters(selectedSource);
  }, [selectedSource]);

  const buildListUrl = (
    source: Exclude<SourceType, null>,
    pageNum = 1,
    per = 20
  ) => {
    const resourceSegment =
      source === "library" ? "college-questions" : "questions";
    const qp = new URLSearchParams({
      page: String(pageNum),
      per_page: String(per),
      source,
    });

    if (searchTerm) qp.set("search", searchTerm);
    if (difficultyFilter) qp.set("difficulty_level", difficultyFilter);
    if (topicFilter) qp.set("topic", topicFilter);
    if (subtopicFilter) qp.set("subtopic", subtopicFilter);

    return `${apiBase}/test/${resourceSegment}/mcqs/?${qp.toString()}`.replace(
      /([^:]\/\/)\//,
      "$1"
    );
  };

  const buildDuplicateUrl = (
    source: Exclude<SourceType, null>,
    mcqId: string
  ) => {
    const resourceSegment =
      source === "library" ? "college-questions" : "questions";
    return `${apiBase}/test/${resourceSegment}/mcqs/${mcqId}/duplicate-to-section`;
  };

  const fetchMCQs = async (
    source: Exclude<SourceType, null>,
    pageNum = 1,
    per = 20
  ) => {
    setLoading(true);
    setError(null);
    try {
      const url = buildListUrl(source, pageNum, per);
      const res = await privateAxios.get(url);
      const body = res.data;
      if (!body.success) throw new Error(body.message || "Failed to fetch");

      const items = (body.data && body.data.items) || [];

<<<<<<< HEAD
      const mapped: Question[] = items.map((it: any) => ({
        id: it.id,
        title: it.title || it.question || it.question_text || "",
        question: it.question || it.question_text || "",
        description: Array.isArray(it.tags)
          ? it.tags.join(", ")
          : it.difficulty_level || it.topic || "",
        options: Array.isArray(it.options)
          ? it.options.map((o: any) => ({
              id: o.id || o.option_id || String(o.id),
              text: o.text || o.value || "",
              is_correct: !!o.is_correct,
            }))
          : [],
        marks: it.marks ?? null,
        negative_marks: it.negative_marks ?? null,
=======
      // normalize shape (optional)
      const mapped: Question[] = items.map((it: any) => ({
        id: it.id,
        title: it.title || it.question || it.id,
        question: it.question || it.description || '',
        description: it.description || '',
        options: it.options || [],
        marks: typeof it.marks !== 'undefined' ? it.marks : null,
        negative_marks: typeof it.negative_marks !== 'undefined' ? it.negative_marks : null,
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
        is_multiple: !!it.is_multiple,
        difficulty_level: it.difficulty_level || it.difficulty || '',
        tags: it.tags || [],
        topic: it.topic,
        subtopic: it.subtopic,
        created_by: it.created_by || null,
      }));

      setQuestions(items);
      setTotal(body.data && body.data.meta ? body.data.meta.total : null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch all questions once for filter dropdowns
  const fetchAllQuestionsForFilters = async (source: Exclude<SourceType, null>) => {
    try {
      const url = buildListUrl(source, 1, 10000); // large number to get all
      const res = await privateAxios.get(url);
      const items = res.data.data.items || [];

      const allTopics = Array.from(new Set(items.map((q: any) => q.topic).filter(Boolean)));
      const allSubtopics = Array.from(new Set(items.map((q: any) => q.subtopic).filter(Boolean)));
      const allDifficulties = Array.from(
        new Set(items.map((q: any) => q.difficulty_level).filter(Boolean))
      );

      setTopics(allTopics);
      setSubtopics(allSubtopics);
      setDifficultyLevels(allDifficulties);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllOnPage = () => {
    const idsOnPage = questions.map(q => q.id);
    // if everything on page already selected, deselect them; otherwise select them
    const allSelected = idsOnPage.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !idsOnPage.includes(id)));
    } else {
      setSelectedIds(prev => {
        const set = new Set(prev);
        idsOnPage.forEach(id => set.add(id));
        return Array.from(set);
      });
    }
  };

  const handleBack = () => {
    setSelectedSource(null);
    setSelectedIds([]);
    setQuestions([]);
    setError(null);
    setPage(1);
  };

  const handleDuplicateAndAdd = async () => {
    if (!selectedSource) return;
    setDuplicating(true);
    setError(null);

    const results: DuplicateResult[] = [];

    try {
      for (const mcqId of selectedIds) {
        try {
<<<<<<< HEAD
          const url = buildDuplicateUrl(selectedSource, mcqId);
          const res = await privateAxios.post(url, {});
=======
                    const url = buildDuplicateUrl(selectedSource, mcqId);

          const payload: any = {};
if (defaultSectionId) payload.section_id = defaultSectionId;
// If you might later allow per-MCQ section override, set it here per item.
const res = await privateAxios.post(url, payload);
          // section_id removed as requested. Sending empty body.
          // const res = await privateAxios.post(url, {});
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
          const body = res.data;

          if (!body.success) {
            results.push({
              original_mcq_id: mcqId,
              success: false,
              message: body.message || "Server failed",
            });
            continue;
          }

          const data = body.data || {};
          results.push({
            original_mcq_id: data.original_mcq_id || mcqId,
            test_mcq_id: data.test_mcq_id,
            section_id: data.section_id,
            success: true,
          });
        } catch (innerErr: any) {
          console.error(innerErr);
          results.push({
            original_mcq_id: mcqId,
            success: false,
            message: innerErr.message || String(innerErr),
          });
        }
      }

      onConfirm(selectedSource, results);
      setSelectedSource(null);
      setSelectedIds([]);
      setQuestions([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(String(err));
    } finally {
      setDuplicating(false);
    }
  };

  if (!isOpen) return null;

  const [previewMCQ, setPreviewMCQ] = React.useState<Question | null>(null);
  const [isMCQPreviewOpen, setIsMCQPreviewOpen] = React.useState(false);
  const handleMCQPreview = (mcq: Question) => {
    setPreviewMCQ(mcq);
    setIsMCQPreviewOpen(true);
  };
  const handleCloseMCQPreview = () => {
    setIsMCQPreviewOpen(false);
    setPreviewMCQ(null);
  };
console.log(defaultSectionId)
  return (
<<<<<<< HEAD
    <div className="fixed inset-0 bg-black/70 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4">
=======
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4">
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Add MCQ Questions
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedSource && (
              <button
                onClick={handleBack}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!selectedSource ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Choose the source for your MCQs:
              </p>

              <button
                onClick={() => setSelectedSource("library")}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      From Library
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose from pre-made questions (server)
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedSource("global")}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">From Global</h3>
                    <p className="text-sm text-gray-500">
                      Access questions from global repository (server)
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
<<<<<<< HEAD
                <p className="text-gray-600 mb-4">
                  Select questions from{" "}
                  {selectedSource === "library" ? "Library" : "Global"}:
                </p>
                <div className="text-sm text-gray-500">
                  {loading
                    ? "Loading..."
                    : total != null
                    ? `${total} total`
                    : ""}
=======
                <p className="text-gray-600 mb-4">Select questions from {selectedSource === 'library' ? 'Library' : 'Global'}:</p>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{loading ? 'Loading...' : total != null ? `${total} total` : ''}</div>
                  <button
                    onClick={selectAllOnPage}
                    className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                    disabled={questions.length === 0}
                  >
                    Select all on page
                  </button>
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              {/* filters */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />

                {difficultyLevels.length > 0 && (
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Difficulties</option>
                    {difficultyLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                )}

                {topics.length > 0 && (
                  <select
                    value={topicFilter}
                    onChange={(e) => {
                      setTopicFilter(e.target.value);
                      setSubtopicFilter("");
                    }}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Topics</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}

                {subtopics.length > 0 && (
                  <select
                    value={subtopicFilter}
                    onChange={(e) => setSubtopicFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">All Subtopics</option>
                    {subtopics.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-lg">
<<<<<<< HEAD
                {questions.length === 0 && !loading && (
                  <div className="text-sm text-gray-500">No questions found.</div>
                )}
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex flex-col gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer ${
                      selectedIds.includes(q.id) ? "ring-2 ring-blue-200" : ""
                    }`}
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                        <div
                          className={`w-4 h-4 border-2 rounded ${
                            selectedIds.includes(q.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          } flex items-center justify-center`}
                        >
                          {selectedIds.includes(q.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-medium text-gray-800 truncate">
                            {q.title}
                          </h4>
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            {q.marks != null && <span>{q.marks} pts</span>}
                            {q.negative_marks != null && (
                              <span className="ml-2">
                                ({q.negative_marks} neg)
                              </span>
                            )}
=======
                {questions.length === 0 && !loading && <div className="text-sm text-gray-500">No questions found.</div>}

                {questions.map(q => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all border ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQuestion(q.id)}
                          className="w-5 h-5 rounded-md focus:ring-0"
                        />
                      </label>

                      <div className="flex-1" onClick={() => handleMCQPreview(q)} role="button">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <MCQCard mcq={q} onPreview={handleMCQPreview} label={true} />
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
                          </div>

                          {isSelected ? (
                            <div className="ml-3 flex items-center gap-1 text-sm text-blue-700">
                              <Check className="w-4 h-4" />
                              <span>Selected</span>
                            </div>
                          ) : null}
                        </div>
<<<<<<< HEAD

                        {q.question && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                            {q.question}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {q.difficulty_level && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md">
                              {q.difficulty_level}
                            </span>
                          )}
                          {q.topic && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md">
                              {q.topic}
                            </span>
                          )}
                          {q.subtopic && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md">
                              {q.subtopic}
                            </span>
                          )}
                          {q.tags && q.tags.length > 0 && (
                            <span>{q.tags.slice(0, 3).join(", ")}</span>
                          )}
                          {q.created_by && q.created_by.name && (
                            <span>by {q.created_by.name}</span>
                          )}
                          {q.is_multiple && (
                            <span className="italic">multiple answers</span>
                          )}
                        </div>

                        {q.options && q.options.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {q.options.map((opt) => (
                              <li
                                key={opt.id}
                                className="flex items-center gap-2 text-sm text-gray-700"
                              >
                                <div className="flex items-center justify-center w-4 h-4 border rounded-sm">
                                  {q.is_multiple ? (
                                    <div className="w-2 h-2" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="truncate">{opt.text}</span>
                                  {opt.is_correct && (
                                    <Check className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
=======
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">Page {page} — {selectedIds.length} selected</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={total != null && page * perPage >= (total || 0)}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDuplicateAndAdd}
                    disabled={selectedIds.length === 0 || duplicating}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {duplicating
                      ? "Processing..."
                      : `Duplicate (${selectedIds.length})`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MCQPreview mcq={previewMCQ} isOpen={isMCQPreviewOpen} onClose={handleCloseMCQPreview} />
    </div>
  );
};

export default SelectMCQ;
