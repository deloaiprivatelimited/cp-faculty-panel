import React from 'react';
import { Eye, Clock, Target, FileText } from 'lucide-react';
import { MCQData } from '../../types/questionTypes';

interface MCQCardProps {
  data: MCQData;
  onPreview: () => void;
}

export const MCQCard: React.FC<MCQCardProps> = ({ data, onPreview }) => {
  if (data.missing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">MCQ Question</h3>
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">Missing</span>
        </div>
        <p className="text-gray-600 mb-4">{data.note}</p>
        <p className="text-sm text-gray-500">ID: {data.id}</p>
      </div>
    );
  }

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#4CA466] hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-[#4CA466]" />
            <span className="px-2 py-1 bg-[#4CA466] text-white rounded text-xs font-medium">MCQ</span>
            <h3 className="text-lg font-semibold text-gray-800">{data.title}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-2">{data.topic} • {data.subtopic}</p>
          <p className="text-gray-700 text-sm line-clamp-3">{data.question_text}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(data.difficulty_level)}`}>
          {data.difficulty_level}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Target size={16} />
          <span>{data.marks} marks</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock size={16} />
          <span>{data.time_limit}s</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {data.tags?.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={onPreview}
        className="w-full bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8052] transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Eye size={16} />
        Preview Question
      </button>
    </div>
  );
};