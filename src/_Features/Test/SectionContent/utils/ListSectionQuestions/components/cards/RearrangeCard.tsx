import React from 'react';
import { Eye, Move, Clock, Target } from 'lucide-react';
import { RearrangeData } from '../../types/questionTypes';

interface RearrangeCardProps {
  data: RearrangeData;
  onPreview: () => void;
}

export const RearrangeCard: React.FC<RearrangeCardProps> = ({ data, onPreview }) => {
  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy': return '●';
      case 'medium': return '●●';
      case 'hard': return '●●●';
      default: return '●';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#4CA466]/30 transition-all duration-300 overflow-hidden">
      <div className="flex h-full">
        {/* Left content section */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Move size={20} className="text-[#4CA466]" />
                  <span className="px-3 py-1 bg-[#4CA466] text-white rounded-full text-xs font-semibold tracking-wide">
                    REARRANGE
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(data.difficulty_level)} flex items-center gap-1`}>
                  <span className="text-xs">{getDifficultyIcon(data.difficulty_level)}</span>
                  {data.difficulty_level.toUpperCase()}
                </div>
              </div>
              
              {/* Title and topic */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{data.title}</h3>
              <p className="text-gray-600 text-sm mb-3 font-medium">{data.topic} • {data.subtopic}</p>
              
              {/* Description */}
              <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{data.prompt}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target size={16} className="text-yellow-600" />
              <span className="font-semibold text-gray-700">{data.marks}</span>
              <span>marks</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-blue-600" />
              <span className="font-semibold text-gray-700">{data.time_limit}s</span>
            </div>
            {data.is_drag_and_drop && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
                Drag & Drop
              </span>
            )}
          </div>

          {/* Items to arrange */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">Items to arrange:</p>
            <div className="flex flex-wrap gap-2">
              {data.items.slice(0, 4).map((item) => (
                <span key={item.item_id} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-md text-sm border border-gray-200">
                  {item.value}
                </span>
              ))}
              {data.items.length > 4 && (
                <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-md text-sm border border-gray-200">
                  +{data.items.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {data.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs border border-gray-200">
                  #{tag}
                </span>
              ))}
              {data.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs border border-gray-200">
                  +{data.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right action section */}
        <div className="w-48 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col justify-center items-center border-l border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#4CA466] rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
              <Move size={28} className="text-white" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Admin Preview</p>
          </div>
          
          <button
            onClick={onPreview}
            className="w-full bg-[#4CA466] text-white px-4 py-3 rounded-lg hover:bg-[#3d8052] transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Eye size={18} />
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};