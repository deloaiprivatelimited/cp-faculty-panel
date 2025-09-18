import React from 'react';
import { Clock, BookOpen, Award, Eye, List, Edit2, Trash2,Shuffle } from 'lucide-react';

const RearrangeCard = ({
  rearrange,
  onPreview,
  editEnabled = false,
  handleEdit = (rearrange) => {},
  deleteEnabled =false,
  handleDelete = (rearrange) => {},
    label = false, // new prop with default false

}) => {
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
     
      {label && (
        <div className="flex items-center gap-2 mb-3">
          <Shuffle className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
            Rearrange
          </span>
        </div>
      )} <div className="flex gap-6">
        {/* Left Section - Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
              {rearrange.title}
            </h3>

            {/* Difficulty badge + action icons */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getDifficultyColor(
                  rearrange.difficulty_level
                )}`}
              >
                {rearrange.difficulty_level}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPreview(rearrange)}
                  aria-label="Preview"
                  title="Preview"
                  className="p-1 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4 text-green-600" />
                </button>

                {editEnabled && (
                  <button
                    onClick={() => handleEdit(rearrange)}
                    aria-label="Edit"
                    title="Edit"
                    className="p-1 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                )}

                {deleteEnabled && (
                  <button
                    onClick={() => handleDelete(rearrange)}
                    aria-label="Delete"
                    title="Delete"
                    className="p-1 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {rearrange.topic}
            </span>
            <span>•</span>
            <span>{rearrange.subtopic}</span>
          </div>

          <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed mb-4">
            {rearrange.prompt}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {rearrange.time_limit}s
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {rearrange.marks} pts
            </span>
            <span className="flex items-center gap-1">
              <List className="w-4 h-4" />
              {rearrange.items?.length ?? 0} items
            </span>
            <span className="text-xs">
              {rearrange.is_drag_and_drop ? 'Drag & Drop' : 'Manual Order'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RearrangeCard;
