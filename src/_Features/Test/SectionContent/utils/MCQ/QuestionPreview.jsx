import React from 'react';
import "katex/dist/katex.min.css";
// import MarkdownRenderer from '../../../utils/MarkDownRender';
import MarkdownRenderer from '../../../../../utils/MarkDownRender';
const QuestionPreview = ({ formData }) => {
  const getTagsArray = () =>
    formData.tags?.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Live Preview</h1>

      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
         <MarkdownRenderer text={formData.title || "Question Title"} className="text-2xl font-bold text-gray-900" />

          {formData.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              formData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {formData.difficulty}
            </span>
          )}
        </div>

        {/* Question Text */}
        <div className="mb-3">
          {formData.questionText ? (
         <MarkdownRenderer text={formData.questionText} />

          ) : (
            <p className="text-gray-500">Your question text will appear here...</p>
          )}
        </div>

        {/* Tags */}
        {getTagsArray().length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {getTagsArray().map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Compact Metadata */}
        <div className="flex flex-wrap gap-3 text-sm font-medium">
         <span className={`px-2 py-1 rounded ${formData.marks > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
    ✅ {formData.marks || 0} Marks
    {formData.negativeMarks ? (
      <span className="text-red-600 ml-1">(-{formData.negativeMarks})</span>
    ) : null}
  </span>
        
          {formData.timeLimit ? (
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
              ⏱ {formData.timeLimit} {formData.timeUnit || 'min'}
            </span>
          ) : null}
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
            {formData.isMultipleCorrect ? 'Multiple correct' : 'Single correct'}
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-800">Answer Options:</h4>
          <span className="text-sm text-gray-500">
            {formData.isMultipleCorrect ? 'Multiple allowed' : 'Single only'}
          </span>
        </div>
        {formData.options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              formData.correctAnswers.includes(index)
                ? 'bg-[#4CA466]/10'
                : 'bg-gray-50'
            }`}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-gray-800 flex-1">
           <MarkdownRenderer text={option || `Option ${index+1}`} />

            </span>
            {formData.correctAnswers.includes(index) && (
              <span className="text-[#4CA466] text-sm font-medium">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      {formData.explanation && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
         <MarkdownRenderer text={formData.explanation} className="prose max-w-none" />

        </div>
      )}
    </div>
  );
};

export default QuestionPreview;
