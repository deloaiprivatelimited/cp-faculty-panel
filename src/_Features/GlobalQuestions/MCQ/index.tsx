// ListMCQ.tsx
import React, { useEffect, useState, useCallback } from "react";
import { BookOpen, Filter } from "lucide-react";
import MCQCard from "./components/MCQCard";
import MCQPreviewModal from "./components/MCQPreviewModal";
import Pagination from "./components/Pagination";
import MCQFilters from "./components/MCQFilters";
// import { privateAxios } from "./axios"; // adjust path if needed
import { privateAxios } from "../../../utils/axios";
interface Option {
  id: string;
  text: string;
  is_correct: boolean;
}

interface MCQ {
  id: string;
  title: string;
  question: string;
  difficulty_level: string;
  marks: number;
  time_limit: number;
  options: Option[];
  topic: string;
  subtopic: string;
  tags: string[];
}

interface MCQMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  topics: string[];
  subtopics: string[];
  tags: string[];
  difficulty_levels: string[];
}

function ListMCQ() {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [meta, setMeta] = useState<MCQMeta | null>(null);

  const [selectedMCQ, setSelectedMCQ] = useState<MCQ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // keep UI same; will send as per_page to API

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

  // Fetch MCQs from server
const fetchMCQs = useCallback(
  async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(selectedDifficulty && { difficulty_level: selectedDifficulty }),
        ...(selectedTopic && { topic: selectedTopic }),
        ...(selectedSubtopic && { subtopic: selectedSubtopic }),
      };

      const resp = await privateAxios.get("/test/questions/mcqs/", { params });

      const respData = resp.data;
      if (!respData?.data) {
        throw new Error("Invalid response from server");
      }

      setMcqs(respData.data.items || []);
      setMeta(respData.data.meta || null);
    } catch (err: any) {
      console.error("Failed to fetch MCQs", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  },
  [currentPage, selectedDifficulty, selectedTopic, selectedSubtopic]
);


 
 useEffect(() => {
  fetchMCQs();

  // reset scroll to top when page changes
  window.scrollTo({ top: 0, behavior: "smooth" });

  // no cleanup needed
}, [fetchMCQs]);


  const handlePreview = (mcq: MCQ) => {
    setSelectedMCQ(mcq);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMCQ(null);
  };

  const handlePageChange = (page: number) => {
    // ensure page bounds
    const totalPages = meta?.total_pages ?? 1;
    const normalized = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(normalized);
  };

  const handleClearFilters = () => {
    setSelectedDifficulty("");
    setSelectedTopic("");
    setSelectedSubtopic("");
  };

  const totalQuestions = meta?.total ?? 0;
  const totalPages = (meta?.total_pages ?? Math.ceil(totalQuestions / itemsPerPage)) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4CA466] rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MCQ Question Bank</h1>
                <p className="text-gray-600 mt-1">
                  Showing {mcqs.length} of {totalQuestions} questions
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
        <MCQFilters
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
                Filtered Results: {totalQuestions} questions found
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
              onClick={() => fetchMCQs()}
              className="px-4 py-2 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* MCQ Grid */}
        {!loading && !error && mcqs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mcqs.map((mcq) => (
                <MCQCard key={mcq.id} mcq={mcq} onPreview={handlePreview} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}

        {/* No results */}
        {!loading && !error && mcqs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
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
      <MCQPreviewModal mcq={selectedMCQ} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default ListMCQ;
