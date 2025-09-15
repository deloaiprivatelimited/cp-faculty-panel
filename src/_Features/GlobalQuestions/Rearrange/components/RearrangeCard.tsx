import React from 'react';
import { Eye, Clock, Award, GripVertical, Image } from 'lucide-react';

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

interface RearrangeCardProps {
  question: RearrangeQuestion;
  onPreview: (question: RearrangeQuestion) => void;
}

const RearrangeCard: React.FC<RearrangeCardProps> = ({ question, onPreview }) => {
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                {question.difficulty_level}
              </span>
              <span className="text-xs text-gray-500">{question.topic}</span>
              {question.is_drag_and_drop && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex items-center gap-1">
                  <GripVertical className="w-3 h-3" />
                  Drag & Drop
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Question Preview */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {question.prompt}
          </p>
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {question.items.slice(0, 4).map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border"
              >
                {item.has_images && <Image className="w-3 h-3 text-gray-500" />}
                <span>{item.value_preview}</span>
              </div>
            ))}
            {question.items.length > 4 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                +{question.items.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{question.marks} marks</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{question.time_limit}s</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            <span>{question.items.length} items</span>
          </div>
        </div>

        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {question.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md"
              >
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
          Preview Question
        </button>
      </div>
    </div>
  );
};

export default RearrangeCard;