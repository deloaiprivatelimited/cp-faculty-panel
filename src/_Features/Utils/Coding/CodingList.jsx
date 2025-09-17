// Utils/Coding/CodingList.jsx
import React from 'react';
import { Search, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import CodingCard from './CodingCard';
import CodingPreview from './CodingPreview';

// Controlled / presentational Coding list component (no backend calls).
// Props:
// - codingData: { items: [], page, per_page, total }
// - loading, error
// - searchTerm, selectedTopic, selectedSubtopic, selectedDifficulty, currentPage, itemsPerPage
// - topics, subtopics, difficulties (arrays for dropdowns)
// - onSearchChange, onTopicChange, onSubtopicChange, onDifficultyChange, onPageChange, onItemsPerPageChange, onResetFilters

const CodingList = ({
  heading = '',
  codingData = { items: [], page: 1, per_page: 20, total: 0 },
  loading = false,
  error = null,

  searchTerm = '',
  selectedTopic = '',
  selectedSubtopic = '',
  selectedDifficulty = '',
  currentPage = 1,
  itemsPerPage = 5,

  topics = [],
  subtopics = [],
  difficulties = [],

  onSearchChange = () => {},
  onTopicChange = () => {},
  onSubtopicChange = () => {},
  onDifficultyChange = () => {},
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  onResetFilters = () => {},

  
  addEnabled=false,
  handleAdd = ()=>{},
  editEnabled = false,
  handleEdit = (coding) => {},
  deleteEnabled = false,
  handleDelete = (coding) => {},
}) => {
  const [previewCoding, setPreviewCoding] = React.useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Server pagination detection
  const serverTotal = typeof codingData.total === 'number' ? codingData.total : null;
  const serverPage = typeof codingData.page === 'number' ? codingData.page : null;
  const serverPerPage = typeof codingData.per_page === 'number' ? codingData.per_page : null;

  const isServerPaginated = serverTotal !== null && serverTotal > (codingData.items?.length ?? 0);

  // Client-side filtering (only used when server isn't doing full pagination)
  const clientFilteredCoding = React.useMemo(() => {
    if (isServerPaginated) return codingData.items ?? [];
    const items = codingData.items ?? [];
    const q = (searchTerm || '').toLowerCase();
    return items.filter(coding => {
      const matchesSearch =
        (coding.title || '').toLowerCase().includes(q) ||
        (coding.short_description || '').toLowerCase().includes(q);
      const matchesTopic = !selectedTopic || coding.topic === selectedTopic;
      const matchesSubtopic = !selectedSubtopic || coding.subtopic === selectedSubtopic;
      const matchesDifficulty = !selectedDifficulty || (coding.difficulty || coding.difficulty_level) === selectedDifficulty;
      return matchesSearch && matchesTopic && matchesSubtopic && matchesDifficulty;
    });
  }, [isServerPaginated, codingData.items, searchTerm, selectedTopic, selectedSubtopic, selectedDifficulty]);

  // Items to display on this page
  let paginatedCoding = [];
  let totalPages = 1;
  let totalItemsToShow = 0;

  if (isServerPaginated) {
    // Server provided page of items and total
    paginatedCoding = codingData.items ?? [];
    totalPages = Math.max(1, Math.ceil(serverTotal / itemsPerPage));
    totalItemsToShow = serverTotal;
  } else {
    const totalFiltered = clientFilteredCoding.length;
    totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    paginatedCoding = clientFilteredCoding.slice(startIndex, startIndex + itemsPerPage);
    totalItemsToShow = totalFiltered;
  }

  const handlePreview = (coding) => {
    setPreviewCoding(coding);
    setIsPreviewOpen(true);
  };
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewCoding(null);
  };

  const handlePage = (page) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compact page range (first, ..., cur-2..cur+2, ..., last)
  const pageRange = (cur, total, windowSize = 2) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set();
    pages.add(1);
    pages.add(total);
    for (let i = Math.max(1, cur - windowSize); i <= Math.min(total, cur + windowSize); i++) pages.add(i);
    return Array.from(pages).sort((a, b) => a - b);
  };

  const pagesToRender = pageRange(currentPage, totalPages, 2);

  const showingCount = paginatedCoding.length;
  const totalDisplayText = serverTotal !== null ? serverTotal : totalItemsToShow;

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Sticky Search & Filters */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
  <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
    {heading || "Coding Questions"}
  </h1>

  {addEnabled && (
    <button
      onClick={handleAdd}
      className="px-4 py-2 bg-[#4CA466] text-white rounded-xl hover:bg-[#3C8A52] transition-colors font-medium"
    >
      + Add
    </button>
  )}
</div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#555555] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search coding questions..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] placeholder-[#555555]"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedTopic}
                onChange={(e) => onTopicChange(e.target.value)}
                className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] appearance-none cursor-pointer"
              >
                <option value="">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSubtopic}
                onChange={(e) => onSubtopicChange(e.target.value)}
                className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] appearance-none cursor-pointer"
              >
                <option value="">All Subtopics</option>
                {subtopics.map(subtopic => (
                  <option key={subtopic} value={subtopic}>{subtopic}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="w-full p-3 bg-[#F9FAFB] border-0 rounded-xl focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] appearance-none cursor-pointer"
              >
                <option value="">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-[#555555]">
              Showing {showingCount} of {totalDisplayText} coding questions
            </p>
            <button
              onClick={onResetFilters}
              className="text-sm text-[#4CA466] hover:text-[#3C8A52] font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {loading && <div className="text-center py-12">Loading questions...</div>}
        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        <div className="space-y-4">
          {paginatedCoding.map(coding => (
            <CodingCard key={coding.id} coding={coding} onPreview={handlePreview} editEnabled={editEnabled} handleEdit={handleEdit} deleteEnabled={deleteEnabled} handleDelete={handleDelete} />
          ))}
        </div>

        {!loading && paginatedCoding.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-[#E5E5E5] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No coding questions found</h3>
            <p className="text-[#555555] mb-6">Try adjusting your search criteria or filters.</p>
            <button
              onClick={onResetFilters}
              className="px-6 py-3 bg-[#4CA466] text-white rounded-xl hover:bg-[#3C8A52] transition-colors font-medium"
            >
              Reset Filters
            </button>
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
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:bg-white outline-none transition-all duration-200 text-[#1A1A1A] text-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1 mx-4 items-center">
                  {pagesToRender.map((p, idx) => {
                    const prev = pagesToRender[idx - 1];
                    const showEllipsis = idx > 0 && p - prev > 1;
                    return (
                      <React.Fragment key={`frag-${p}-${idx}`}>
                        {showEllipsis && <span className="px-2">…</span>}
                        <button
                          onClick={() => handlePage(p)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === p
                              ? 'bg-[#4CA466] text-white'
                              : 'border border-[#E5E5E5] hover:bg-[#F9FAFB] text-[#555555]'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="ml-4 text-sm text-[#555555]">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CodingPreview coding={previewCoding} isOpen={isPreviewOpen} onClose={handleClosePreview} />
    </div>
  );
};

export default CodingList;
