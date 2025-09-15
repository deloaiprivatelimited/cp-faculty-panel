import React, { useState } from 'react';
import { X, Clock, Target, CheckCircle } from 'lucide-react';
import { MCQData } from '../../types/questionTypes';

interface MCQPreviewProps {
  data: MCQData;
  onClose: () => void;
}

export const MCQPreview: React.FC<MCQPreviewProps> = ({ data, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (data.is_multiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const isCorrectOption = (optionId: string) => {
    return data.correct_options?.includes(optionId);
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
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
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Question</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{data.question_text}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Options</h3>
            <div className="space-y-3">
              {data.options?.map((option) => (
                <div
                  key={option.option_id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOptions.includes(option.option_id)
                      ? 'border-[#4CA466] bg-[#4CA466] bg-opacity-10'
                      : 'border-gray-200 hover:border-[#4CA466]'
                  } ${
                    showAnswer && isCorrectOption(option.option_id)
                      ? 'border-green-500 bg-green-50'
                      : ''
                  }`}
                  onClick={() => handleOptionSelect(option.option_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 border-2 rounded ${
                      data.is_multiple ? 'rounded-sm' : 'rounded-full'
                    } ${
                      selectedOptions.includes(option.option_id)
                        ? 'border-[#4CA466] bg-[#4CA466]'
                        : 'border-gray-300'
                    }`}>
                      {selectedOptions.includes(option.option_id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          {data.is_multiple ? (
                            <CheckCircle size={12} className="text-white" />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-700">{option.value}</span>
                    {showAnswer && isCorrectOption(option.option_id) && (
                      <CheckCircle size={20} className="text-green-500 ml-auto" />
                    )}
                  </div>
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

          <div className="flex gap-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="bg-[#4CA466] text-white px-6 py-3 rounded-lg hover:bg-[#3d8052] transition-colors"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>

          {showAnswer && data.explanation && (
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400">
              <h3 className="font-semibold text-blue-800 mb-2">Explanation</h3>
              <p className="text-blue-700 whitespace-pre-wrap">{data.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};