import React from 'react';
import { X, Clock, Award, CheckCircle, Circle } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  is_correct: boolean;
}

interface MCQ {
  id: string;
  title: string;
  question: string;
  difficulty_level: string;
  marks: number;
  time_limit: number;
  options: Option[];
  topic: string;
  subtopic: string;
  tags: string[];
}

interface MCQPreviewModalProps {
  mcq: MCQ | null;
  isOpen: boolean;
  onClose: () => void;
}

const MCQPreviewModal: React.FC<MCQPreviewModalProps> = ({ mcq, isOpen, onClose }) => {
  if (!isOpen || !mcq) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(mcq.difficulty_level)}`}>
                  {mcq.difficulty_level}
                </span>
                <span className="text-sm text-gray-500">{mcq.topic} • {mcq.subtopic}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{mcq.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{mcq.marks} marks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{mcq.time_limit} seconds</span>
                </div>
              </div>
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
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-[#4CA466]">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {mcq.question}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Options:</h3>
            <div className="space-y-3">
              {mcq.options.map((option, index) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    option.is_correct
                      ? 'border-[#4CA466] bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {option.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-[#4CA466]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${
                          option.is_correct ? 'text-[#4CA466]' : 'text-gray-600'
                        }`}>
                          Option {String.fromCharCode(65 + index)}
                        </span>
                        {option.is_correct && (
                          <span className="px-2 py-1 bg-[#4CA466] text-white text-xs rounded-full font-medium">
                            Correct
                          </span>
                        )}
                      </div>
                      <p className={`${
                        option.is_correct ? 'text-gray-800 font-medium' : 'text-gray-700'
                      }`}>
                        {option.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {mcq.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#4CA466] hover:bg-[#3d8a54] text-white rounded-lg font-medium transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQPreviewModal;