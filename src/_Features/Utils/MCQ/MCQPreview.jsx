import React, { useState } from 'react';
import { X, Clock, Award, BookOpen, CheckCircle, XCircle, Info } from 'lucide-react';
import MarkdownRenderer from '../../../utils/MarkDownRender';
const MCQPreview = ({ mcq, isOpen, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!isOpen || !mcq) return null;

  const handleOptionSelect = (optionId) => {
    if (mcq.is_multiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const isCorrectOption = (optionId) => {
    return mcq.correct_options.includes(optionId);
  };

  const isSelectedCorrect = (optionId) => {
    return selectedOptions.includes(optionId) && isCorrectOption(optionId);
  };

  const isSelectedIncorrect = (optionId) => {
    return selectedOptions.includes(optionId) && !isCorrectOption(optionId);
  };

  const getDifficultyColor = (difficulty) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {mcq.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {mcq.topic} • {mcq.subtopic}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {mcq.time_limit}s
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {mcq.marks} pts
                </span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(mcq.difficulty_level)}`}>
                {mcq.difficulty_level}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            <MarkdownRenderer text={mcq.question_text}/>
                
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Options: {mcq.is_multiple ? '(Multiple Choice)' : '(Single Choice)'}
            </h3>
            <div className="space-y-3">
              {mcq.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.option_id);
                const isCorrect = isCorrectOption(option.option_id);
                const showResult = showExplanation;
                
                let optionClasses = "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ";
                
                if (showResult) {
                  if (isCorrect) {
                    optionClasses += "border-green-500 bg-green-50 ";
                  } else if (isSelectedIncorrect(option.option_id)) {
                    optionClasses += "border-red-500 bg-red-50 ";
                  } else {
                    optionClasses += "border-gray-200 bg-white ";
                  }
                } else if (isSelected) {
                  optionClasses += "border-green-500 bg-green-50 ";
                } else {
                  optionClasses += "border-gray-200 hover:border-gray-300 bg-white ";
                }

                return (
                  <div
                    key={option.option_id}
                    onClick={() => !showExplanation && handleOptionSelect(option.option_id)}
                    className={optionClasses}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {String.fromCharCode(65 + index)}
                        </span>
            <MarkdownRenderer text={option.value}/>
                      </div>
                      {showResult && (
                        <div className="flex items-center gap-2">
                          {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {isSelectedIncorrect(option.option_id) && <XCircle className="w-5 h-5 text-red-600" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Info className="w-4 h-4" />
              {showExplanation ? 'Hide' : 'Show'} Answer & Explanation
            </button>
            <button
              onClick={() => {
                setSelectedOptions([]);
                setShowExplanation(false);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Reset
            </button>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Explanation
              </h3>
              <div className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                            <MarkdownRenderer text={mcq.explanation}/>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQPreview;