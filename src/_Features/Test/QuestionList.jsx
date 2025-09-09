import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import AddQuestionModal from './AddQuestionModal.jsx';

const QuestionList = ({ 
  section, 
  myLibraryQuestions, 
  globalLibraryQuestions, 
  onSectionUpdate 
}) => {
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  const handleQuestionAdd = (question) => {
    const newQuestion = {
      ...question,
      id: Date.now().toString()
    };

    const updatedSection = {
      ...section,
      questions: [...section.questions, newQuestion]
    };

    onSectionUpdate(updatedSection);
  };

  const handleQuestionDelete = (questionId) => {
    const updatedSection = {
      ...section,
      questions: section.questions.filter(q => q.id !== questionId)
    };

    onSectionUpdate(updatedSection);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{section.name}</h2>
          <p className="text-gray-600 mt-1">{section.instructions}</p>
          {section.isTimeConstrained && (
            <p className="text-sm text-gray-500 mt-1">Duration: {section.duration} minutes</p>
          )}
        </div>
        <button
          onClick={() => setIsAddQuestionModalOpen(true)}
          className="bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        {section.questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border rounded-lg p-4 hover:border-[#4CA466] transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded">
                  Q{index + 1}
                </span>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  {question.type.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-[#4CA466] transition-colors">
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleQuestionDelete(question.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-800">{question.content}</p>
          </div>
        ))}

        {section.questions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">❓</div>
            <p className="text-gray-500 text-lg mb-2">No questions yet</p>
            <p className="text-gray-400 mb-4">Add your first question to this section</p>
            <button
              onClick={() => setIsAddQuestionModalOpen(true)}
              className="bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors"
            >
              Add Question
            </button>
          </div>
        )}
      </div>

      {isAddQuestionModalOpen && (
        <AddQuestionModal
          myLibraryQuestions={myLibraryQuestions}
          globalLibraryQuestions={globalLibraryQuestions}
          onClose={() => setIsAddQuestionModalOpen(false)}
          onAdd={handleQuestionAdd}
        />
      )}
    </div>
  );
};

export default QuestionList;