// ListCoding.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Code as CodeIcon, Filter } from "lucide-react";
import CodingCard from "./components/CodingCard";
import { CodingPreview } from "../Coding/components/CodingPreviewModal";
import Pagination from "./components/Pagination";
import CodingFilters from "./components/CodingFilters";
import { privateAxios } from "../../../utils/axios";
import type { CodingData } from "../Coding/components/CodingPreviewModal"; // adjust path if needed

interface CodingQuestion {
  id: string;
  title: string;
  short_description: string;
  difficulty: string;
  points: number;
  time_limit_ms: number;
  allowed_languages: string[];
  topic: string;
  subtopic: string;
  tags: string[];
  published: boolean;
  // optional fields your API might provide:
  long_description_markdown?: string;
  memory_limit_kb?: number;
  sample_io?: { input_text: string; output: string; explanation: string }[];
  predefined_boilerplates?: Record<string, string>;
      solution_code?: Record<string, string>; // <-- full solution snippets per language

}

interface CodingMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  topics: string[];
  subtopics: string[];
  tags?: string[];
  difficulty_levels: string[];
}

function ListCoding() {
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [meta, setMeta] = useState<CodingMeta | null>(null);

  // selected preview data (mapped to the shape the preview expects)
  const [selectedPreview, setSelectedPreview] = useState<CodingData | null>(null);
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

  // Map API question -> CodingData (the shape expected by CodingPreview)
  const mapQuestionToCodingData = (q: CodingQuestion): CodingData => {
    const allowedLanguages = q.allowed_languages && q.allowed_languages.length > 0
      ? q.allowed_languages
      : ["python"]; // sensible default

    // Ensure predefined boilerplates exist for allowed languages
    const boilerplates: Record<string, string> = {};
    allowedLanguages.forEach((lang) => {
      if (q.predefined_boilerplates && q.predefined_boilerplates[lang]) {
        boilerplates[lang] = q.predefined_boilerplates[lang];
      } else {
        // small default template for nicer UX
        boilerplates[lang] = `// ${lang} boilerplate\n`;
      }
    });
    const solution_code: Record<string, string> = {};
    console.log(q.solution_code)
    allowedLanguages.forEach((lang) => {
      if (q.solution_code && q.solution_code[lang]) {
       solution_code[lang] = q.solution_code[lang];
      } else {
        // small default template for nicer UX
        solution_code[lang] = `// ${lang} solutio_code\n`;
      }
    });

    return {
      title: q.title ?? "Untitled Problem",
      topic: q.topic ?? "",
      subtopic: q.subtopic ?? "",
      tags: q.tags ?? [],
      short_description: q.short_description ?? "",
      long_description_markdown: q.long_description_markdown ?? q.short_description ?? "",
      difficulty: q.difficulty ?? "unknown",
      points: q.points ?? 0,
      time_limit_ms: q.time_limit_ms ?? 0,
      memory_limit_kb: q.memory_limit_kb ?? 0,
      sample_io: q.sample_io ?? [{ input_text: "", output: "", explanation: "" }],
      allowed_languages: allowedLanguages,
      predefined_boilerplates: boilerplates,
      solution_code : solution_code
    };
  };

  // Fetch Coding questions from server
  const fetchCodingQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(selectedTopic && { topic: selectedTopic }),
        ...(selectedSubtopic && { subtopic: selectedSubtopic }),
      };

      // NOTE: adjust endpoint if your backend uses a different path
      const resp = await privateAxios.get("/test/questions/coding/", { params });

      const respData = resp.data;
      if (!respData?.data) {
        throw new Error("Invalid response from server");
      }

      // Expecting respData.data.items and respData.data.meta
      setCodingQuestions(respData.data.items || []);
      setMeta(respData.data.meta || null);
    } catch (err: any) {
      console.error("Failed to fetch coding questions", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedDifficulty, selectedTopic, selectedSubtopic]);

  // fetch on mount and whenever dependencies change
  useEffect(() => {
    fetchCodingQuestions();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchCodingQuestions]);

  // If filters change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDifficulty, selectedTopic, selectedSubtopic]);

  const handlePreview = (question: CodingQuestion) => {
    const previewData = mapQuestionToCodingData(question);
    setSelectedPreview(previewData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPreview(null);
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

  const totalQuestions = meta?.total ?? 0;
  const totalPages = meta?.total_pages ?? Math.max(1, Math.ceil(totalQuestions / itemsPerPage));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4CA466] rounded-lg">
                <CodeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Coding Questions</h1>
                <p className="text-gray-600 mt-1">
                  Showing {codingQuestions.length} of {totalQuestions} problems
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
        <CodingFilters
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
                Filtered Results: {totalQuestions} problems found
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
              onClick={() => fetchCodingQuestions()}
              className="px-4 py-2 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Question Grid */}
        {!loading && !error && codingQuestions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {codingQuestions.map((question) => (
                <CodingCard key={question.id} question={question} onPreview={handlePreview} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}

        {/* No results */}
        {!loading && !error && codingQuestions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CodeIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
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

      {/* Preview Modal - only render when we have mapped preview data */}
      {selectedPreview && isModalOpen && (
        <CodingPreview data={selectedPreview} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default ListCoding;
