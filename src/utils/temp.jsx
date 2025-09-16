import React, { useState } from 'react';
import { CodingCard } from './components/cards/CodingCard';
import { MCQCard } from './components/cards/MCQCard';
import { RearrangeCard } from './components/cards/RearrangeCard';
import { dummyCodingProblems } from './data/dummyCodingData';
import { dummyMCQProblems } from './data/dummyMCQData';
import { dummyRearrangeProblems } from './data/dummyRearrangeData';
import { CodingData, MCQData, RearrangeData } from './types/questionTypes';
import { BookOpen, FileText, Code, Move } from 'lucide-react';

type QuestionType = 'all' | 'coding' | 'mcq' | 'rearrange';

function App() {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<QuestionType>('all');

  const handlePreview = (problemId: string) => {
    setSelectedProblem(problemId);
    console.log('Preview problem:', problemId);
  };

  // Combine all questions with type information
  const allQuestions = [
    ...dummyCodingProblems.map(q => ({ ...q, type: 'coding' as const })),
    ...dummyMCQProblems.map(q => ({ ...q, type: 'mcq' as const })),
    ...dummyRearrangeProblems.map(q => ({ ...q, type: 'rearrange' as const }))
  ];

  // Filter questions based on active filter
  const filteredQuestions = activeFilter === 'all' 
    ? allQuestions 
    : allQuestions.filter(q => q.type === activeFilter);

  // Get counts for each type
  const counts = {
    all: allQuestions.length,
    coding: dummyCodingProblems.length,
    mcq: dummyMCQProblems.length,
    rearrange: dummyRearrangeProblems.length
  };

  const renderQuestionCard = (question: any, index: number) => {
    const key = `${question.type}-${question._id.$oid}`;
    
    switch (question.type) {
      case 'coding':
        return (
          <CodingCard
            key={key}
            data={question as CodingData}
            onPreview={() => handlePreview(question._id.$oid)}
          />
        );
      case 'mcq':
        return (
          <MCQCard
            key={key}
            data={question as MCQData}
            onPreview={() => handlePreview(question._id.$oid)}
          />
        );
      case 'rearrange':
        return (
          <RearrangeCard
            key={key}
            data={question as RearrangeData}
            onPreview={() => handlePreview(question._id.$oid)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Bank</h1>
            <p className="text-gray-600">Browse through various types of questions and preview them instantly</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-[#4CA466] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen size={16} />
              <span>All Questions ({counts.all})</span>
            </button>
            <button
              onClick={() => setActiveFilter('coding')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'coding'
                  ? 'bg-[#4CA466] text-white shadow-md'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <Code size={16} />
              <span>Coding ({counts.coding})</span>
            </button>
            <button
              onClick={() => setActiveFilter('mcq')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'mcq'
                  ? 'bg-[#4CA466] text-white shadow-md'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FileText size={16} />
              <span>MCQ ({counts.mcq})</span>
            </button>
            <button
              onClick={() => setActiveFilter('rearrange')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'rearrange'
                  ? 'bg-[#4CA466] text-white shadow-md'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              <Move size={16} />
              <span>Rearrange ({counts.rearrange})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions available</h3>
            <p className="text-gray-500">There are no questions to display for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => renderQuestionCard(question, index))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;