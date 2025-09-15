// ListRearrange.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GripVertical, Filter } from "lucide-react";
import RearrangeCard from "./components/RearrangeCard";
import RearrangePreviewModal from "./components/RearrangePreviewModal";
import Pagination from "./components/Pagination";
import RearrangeFilters from "./components/RearrangeFilters";
// import { privateAxios } from "./axios"; // adjust path if needed
import { privateAxios } from "../../../utils/axios";

interface RearrangeItem {
  id: string;
  value_preview: string;
  has_images: boolean;
}

interface RearrangeQuestion {
  id: string;
  title: string;
  prompt: string;
  difficulty_level: string;
  marks: number;
  time_limit: number;
  items: RearrangeItem[];
  topic: string;
  subtopic: string;
  tags: string[];
  is_drag_and_drop: boolean;
}

interface RearrangeMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  topics: string[];
  subtopics: string[];
  tags: string[];
  difficulty_levels: string[];
}

function ListRearrange() {
  const [questions, setQuestions] = useState<RearrangeQuestion[]>([]);
  const [meta, setMeta] = useState<RearrangeMeta | null>(null);

  const [selectedQuestion, setSelectedQuestion] = useState<RearrangeQuestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // keep UI same; send as per_page to API

  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build availableData from server meta (fallback to empty arrays)
  const availableData = {
    difficulties: meta?.difficulty_levels ?? [],
    topics: meta?.topics ?? [],
    subtopics: meta?.subtopics ?? [],
  };

  // Fetch rearrange questions from server
  const fetchQuestions = useCallback(
    async (page = currentPage) => {
      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          page,
          per_page: itemsPerPage,
          ...(selectedDifficulty && { difficulty_level: selectedDifficulty }),
          ...(selectedTopic && { topic: selectedTopic }),
          ...(selectedSubtopic && { subtopic: selectedSubtopic }),
        };

        const resp = await privateAxios.get("/test/questions/rearranges/", { params });

        const respData = resp.data;
        console.log(respData)
        // adapt to response shape similar to MCQ component: resp.data.data.items and resp.data.data.meta
        if (!respData?.data) {
          throw new Error("Invalid response from server");
        }

        setQuestions(respData.data.items || []);
        setMeta(respData.data.meta || null);
      } catch (err: any) {
        console.error("Failed to fetch rearrange questions", err);
        setError(err?.response?.data?.message || err?.message || "Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, selectedDifficulty, selectedTopic, selectedSubtopic]
  );

  // Fetch when filters or page change
  useEffect(() => {
    fetchQuestions(currentPage);

    // scroll to top when page changes (keeps same UX as ListMCQ)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchQuestions, currentPage]);

  // When filters change, reset to page 1 and refetch
  useEffect(() => {
    setCurrentPage(1);
    // fetchQuestions will run from the other effect due to fetchQuestions dependency (which includes filters)
    // but call explicitly to ensure immediate refresh
    fetchQuestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDifficulty, selectedTopic, selectedSubtopic]);

  const handlePreview = (question: RearrangeQuestion) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
  };

  const handlePageChange = (page: number) => {
    const totalPages = meta?.total_pages ?? 1;
    const normalized = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(normalized);
  };

  const handleClearFilters = () => {
    setSelectedDifficulty("");
    setSelectedTopic("");
    setSelectedSubtopic("");
  };

  // Fallback pagination values if no meta from server
  const totalQuestions = meta?.total ?? 0;
  const totalPages = (meta?.total_pages ?? Math.ceil(totalQuestions / itemsPerPage)) || 1;

  // For summary counts (if meta exists use it, otherwise display current local counts)
  const displayTotal = meta ? totalQuestions : questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4CA466] rounded-lg">
                <GripVertical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rearrange Questions</h1>
                <p className="text-gray-600 mt-1">
                  Showing {questions.length} of {displayTotal} questions
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <RearrangeFilters
          selectedDifficulty={selectedDifficulty}
          selectedTopic={selectedTopic}
          selectedSubtopic={selectedSubtopic}
          onDifficultyChange={setSelectedDifficulty}
          onTopicChange={setSelectedTopic}
          onSubtopicChange={setSelectedSubtopic}
          onClearFilters={handleClearFilters}
          availableData={availableData}
        />

        {/* Results Summary */}
        {(selectedDifficulty || selectedTopic || selectedSubtopic) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Filtered Results: {displayTotal} questions found
              </span>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-12">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mx-auto mb-4" />
            <div className="text-gray-600">Loading questions...</div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-600 font-medium mb-4">Error: {error}</div>
            <button
              onClick={() => fetchQuestions(currentPage)}
              className="px-4 py-2 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Question Grid */}
        {!loading && !error && questions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {questions.map((question) => (
                <RearrangeCard key={question.id} question={question} onPreview={handlePreview} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}

        {/* No results */}
        {!loading && !error && questions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GripVertical className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <RearrangePreviewModal question={selectedQuestion} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default ListRearrange;
