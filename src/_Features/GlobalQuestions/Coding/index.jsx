// pages/coding/index.jsx
import React, { useEffect, useCallback, useState } from 'react';
import { privateAxios } from '../../../utils/axios';
import CodingList from '../../Utils/Coding/CodingList';
import { showError, showSuccess } from '../../../utils/toast';

const CodingIndexPage = () => {
  const [codingData, setCodingData] = useState({ items: [], page: 1, per_page: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Controlled UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const buildParams = useCallback(() => {
    const params = {
      page: currentPage,
      per_page: itemsPerPage,
    };
    if (searchTerm?.trim()) params.search = searchTerm.trim();
    if (selectedTopic) params.topic = selectedTopic;
    if (selectedSubtopic) params.subtopic = selectedSubtopic;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    return params;
  }, [searchTerm, selectedTopic, selectedSubtopic, selectedDifficulty, currentPage, itemsPerPage]);

  const fetchCoding = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams();
        // adjust endpoint if your backend uses a different path
        const resp = await privateAxios.get('/v1/coding/questions', { params, signal });
        const data = resp.data || {};

        const items = Array.isArray(data.items) ? data.items : [];
        const page = data.page ?? params.page ?? 1;
        const per_page = data.per_page ?? params.per_page ?? itemsPerPage;
        const total = typeof data.total === 'number' ? data.total : items.length;

        setCodingData({ items, page, per_page, total });

        if (items.length > 0) {
          // showSuccess('Coding questions loaded successfully!');
        } else {
          showError('No coding questions found with the current filters.');
        }
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
          // ignore cancelled request
        } else {
          console.error('fetchCoding error', err);
          setError('Failed to load coding questions. Please try again.');
          showError('Failed to load coding questions. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [buildParams, itemsPerPage]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCoding(controller.signal);
    return () => controller.abort();
  }, [fetchCoding]);

  // Derived lists for filters (from currently loaded items)
  const topics = Array.from(new Set(codingData.items.map(i => i.topic).filter(Boolean)));
  const subtopics = Array.from(new Set(codingData.items.map(i => i.subtopic).filter(Boolean)));
  const difficulties = Array.from(new Set(codingData.items.map(i => i.difficulty || i.difficulty_level).filter(Boolean)));

  // Handlers — same shape as other pages so CodingList stays controlled
  const handleSearchChange = (v) => { setSearchTerm(v); setCurrentPage(1); };
  const handleTopicChange = (v) => { setSelectedTopic(v); setCurrentPage(1); };
  const handleSubtopicChange = (v) => { setSelectedSubtopic(v); setCurrentPage(1); };
  const handleDifficultyChange = (v) => { setSelectedDifficulty(v); setCurrentPage(1); };
  const handlePageChange = (p) => setCurrentPage(p);
  const handleItemsPerPageChange = (n) => { setItemsPerPage(n); setCurrentPage(1); };
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTopic('');
    setSelectedSubtopic('');
    setSelectedDifficulty('');
    setItemsPerPage(5);
    setCurrentPage(1);
  };

  return (
    <CodingList
      heading="Coding Questions"
      codingData={codingData}
      loading={loading}
      error={error}

      // controlled filter values
      searchTerm={searchTerm}
      selectedTopic={selectedTopic}
      selectedSubtopic={selectedSubtopic}
      selectedDifficulty={selectedDifficulty}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}

      // derived lists
      topics={topics}
      subtopics={subtopics}
      difficulties={difficulties}

      // handlers
      onSearchChange={handleSearchChange}
      onTopicChange={handleTopicChange}
      onSubtopicChange={handleSubtopicChange}
      onDifficultyChange={handleDifficultyChange}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
      onResetFilters={handleResetFilters}
    />
  );
};

export default CodingIndexPage;
