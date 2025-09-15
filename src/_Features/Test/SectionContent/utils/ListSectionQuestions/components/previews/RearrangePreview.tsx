import React, { useState } from 'react';
import { X, Clock, Target, Move, CheckCircle } from 'lucide-react';
import { RearrangeData } from '../../types/questionTypes';

interface RearrangePreviewProps {
  data: RearrangeData;
  onClose: () => void;
}

export const RearrangePreview: React.FC<RearrangePreviewProps> = ({ data, onClose }) => {
  const [currentOrder, setCurrentOrder] = useState(data.items.map(item => item.item_id));
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setCurrentOrder(newOrder);
  };

  const getItemValue = (itemId: string) => {
    return data.items.find(item => item.item_id === itemId)?.value || '';
  };

  const isCorrectOrder = () => {
    return JSON.stringify(currentOrder) === JSON.stringify(data.correct_order);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{data.title}</h2>
            <p className="text-gray-600">{data.topic} • {data.subtopic}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(data.difficulty_level)}`}>
              {data.difficulty_level}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Target size={16} />
              <span>{data.marks} marks</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock size={16} />
              <span>{data.time_limit}s</span>
            </div>
            {data.is_drag_and_drop && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                Drag & Drop
              </span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <p className="text-gray-700">{data.prompt}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Move size={20} />
              Arrange the items in correct order
            </h3>
            <div className="space-y-3">
              {currentOrder.map((itemId, index) => (
                <div
                  key={itemId}
                  className={`p-4 border-2 rounded-lg flex items-center gap-3 cursor-move ${
                    showAnswer && data.correct_order[index] === itemId
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-[#4CA466]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-medium">
                      {index + 1}
                    </span>
                    <Move size={16} className="text-gray-400" />
                  </div>
                  <span className="flex-1 text-gray-700">{getItemValue(itemId)}</span>
                  {showAnswer && data.correct_order[index] === itemId && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {data.tags && data.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setCurrentOrder([...data.items.map(item => item.item_id)])}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset Order
            </button>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="bg-[#4CA466] text-white px-6 py-3 rounded-lg hover:bg-[#3d8052] transition-colors"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>

          {showAnswer && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">Correct Order</h3>
              <div className="space-y-2">
                {data.correct_order.map((itemId, index) => (
                  <div key={itemId} className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-blue-700">{getItemValue(itemId)}</span>
                  </div>
                ))}
              </div>
              {data.explanation && (
                <div className="mt-4">
                  <h4 className="font-semibold text-blue-800 mb-1">Explanation</h4>
                  <p className="text-blue-700">{data.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};