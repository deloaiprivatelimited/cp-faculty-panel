import React from 'react';
import { Eye, Clock, Award, Code, Tag } from 'lucide-react';

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
}

interface CodingCardProps {
  question: CodingQuestion;
  onPreview: (question: CodingQuestion) => void;
}

const CodingCard: React.FC<CodingCardProps> = ({ question, onPreview }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      python: '🐍',
      cpp: '⚡',
      java: '☕',
      javascript: '🟨',
      c: '🔧'
    };
    return icons[language] || '💻';
  };

  const formatTimeLimit = (timeMs: number) => {
    if (timeMs >= 1000) {
      return `${timeMs / 1000}s`;
    }
    return `${timeMs}ms`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {question.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
              <span className="text-xs text-gray-500">{question.topic}</span>
              {question.published && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {question.short_description}
          </p>
        </div>

        {/* Languages */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {question.allowed_languages.slice(0, 4).map((language, index) => (
              <div
                key={language}
                className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border"
              >
                <span>{getLanguageIcon(language)}</span>
                <span className="capitalize">{language}</span>
              </div>
            ))}
            {question.allowed_languages.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                +{question.allowed_languages.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{question.points} points</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeLimit(question.time_limit_ms)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            <span>{question.allowed_languages.length} languages</span>
          </div>
        </div>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {question.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md flex items-center gap-1"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
            {question.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                +{question.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onPreview(question)}
          className="w-full bg-[#4CA466] hover:bg-[#3d8a54] text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md"
        >
          <Eye className="w-4 h-4" />
          Preview Problem
        </button>
      </div>
    </div>
  );
};

export default CodingCard;