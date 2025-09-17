// pages/index.jsx
import React, { useEffect, useCallback, useState } from 'react';
import { privateAxios } from '../../../utils/axios'
import MCQList from '../../Utils/MCQ/MCQList';
import { showError, showSuccess } from '../../../utils/toast';

const IndexPage = () => {
  const [mcqData, setMcqData] = useState({ items: [], page: 1, per_page: 5, total: 0 });
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

  const fetchMCQs = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const params = buildParams();
        const resp = await privateAxios.get('/v1/mcq/mcqs', { params, signal });
        const data = resp.data || {};

        const items = Array.isArray(data.items) ? data.items : [];
        const page = data.page ?? params.page ?? 1;
        const per_page = data.per_page ?? params.per_page ?? itemsPerPage;
        const total = typeof data.total === 'number' ? data.total : items.length;

        setMcqData({ items, page, per_page, total });

        // ✅ Show success toast only if data exists
        if (items.length > 0) {
          // showSuccess('MCQs loaded successfully!');
        } else {
          showError('No MCQs found with the current filters.');
        }
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
          // ignore cancelled request
        } else {
          console.error('fetchMCQs error', err);
          setError('Failed to load questions. Please try again.');
          showError('Failed to load questions. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [buildParams, itemsPerPage]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchMCQs(controller.signal);
    return () => controller.abort();
  }, [fetchMCQs]);

  // Derived lists
  const topics = Array.from(new Set(mcqData.items.map(i => i.topic).filter(Boolean)));
  const subtopics = Array.from(new Set(mcqData.items.map(i => i.subtopic).filter(Boolean)));
  const difficulties = Array.from(new Set(mcqData.items.map(i => i.difficulty_level).filter(Boolean)));

  // Handlers
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
    <MCQList
    heading='Global Questions'
      mcqData={mcqData}
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

export default IndexPage;
