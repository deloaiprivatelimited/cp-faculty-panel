import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterProps {
  selectedDifficulty: string;
  selectedTopic: string;
  selectedSubtopic: string;
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
  onSubtopicChange: (subtopic: string) => void;
  onClearFilters: () => void;
  availableData: {
    difficulties: string[];
    topics: string[];
    subtopics: string[];
  };
}

const CodingFilters: React.FC<FilterProps> = ({
  selectedDifficulty,
  selectedTopic,
  selectedSubtopic,
  onDifficultyChange,
  onTopicChange,
  onSubtopicChange,
  onClearFilters,
  availableData
}) => {
  const hasActiveFilters = selectedDifficulty || selectedTopic || selectedSubtopic;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-transparent outline-none transition-all"
          >
            <option value="">All Difficulties</option>
            {availableData.difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-transparent outline-none transition-all"
          >
            <option value="">All Topics</option>
            {availableData.topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Subtopic Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtopic
          </label>
          <select
            value={selectedSubtopic}
            onChange={(e) => onSubtopicChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-transparent outline-none transition-all"
          >
            <option value="">All Subtopics</option>
            {availableData.subtopics.map((subtopic) => (
              <option key={subtopic} value={subtopic}>
                {subtopic}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CodingFilters;