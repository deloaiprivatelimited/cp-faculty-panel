import React, { useEffect, useState } from 'react';
import { Question, MCQData, RearrangeData, CodingData } from './types/questionTypes';
import { MCQCard } from './components/cards/MCQCard';
import { RearrangeCard } from './components/cards/RearrangeCard';
import { CodingCard } from './components/cards/CodingCard';
import { MCQPreview } from './components/previews/MCQPreview';
import { RearrangePreview } from './components/previews/RearrangePreview';
import { CodingPreview } from './components/previews/CodingPreview';
import { BookOpen, FileText, Code, Move } from 'lucide-react';
// import { privateAxios } from './path/to/your/axiosInstances'; // <- adjust path
import { privateAxios } from '../../../../../utils/axios';
function ListQuestionCards({ section }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!section || !section.id) {
      // If no section/id, clear state and return
      setQuestions([]);
      return;
    }

    let cancelled = false;
    const source = privateAxios.CancelToken && privateAxios.CancelToken.source
      ? privateAxios.CancelToken.source()
      : null;

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /sections/<section_id>/questions
        const resp = await privateAxios.get(`/tests/sections/${section.id}/questions`, {
          cancelToken: source ? source.token : undefined,
        });

        // The backend returns a response like: { success: true, message: "...", data: [...] }
        // Adjust if your backend shape differs.
        const payload = resp && resp.data ? resp.data : resp;
        const data = Array.isArray(payload.data) ? payload.data : payload;

        if (!cancelled) {
          // normalize items to your Question type if necessary
          setQuestions(data.map((item) => {
            // keep item as-is but ensure it's shaped { type, data }
            return {
              type: item.type,
              data: item.data,
              // keep any other props if present
              ...item,
            } as Question;
          }));
        }
      } catch (err) {
        if (!cancelled) {
          if (privateAxios.isCancel && privateAxios.isCancel(err)) {
            // request cancelled, ignore
          } else {
            setError(err);
            console.error('Failed to fetch questions:', err);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      cancelled = true;
      if (source) source.cancel('Operation cancelled by the user.');
    };
  }, [section && section.id]);

  const renderQuestionCard = (question: Question, index: number) => {
    switch (question.type) {
      case 'mcq':
        return (
          <MCQCard
            key={`mcq-${index}`}
            data={question.data as MCQData}
            onPreview={() => setSelectedQuestion(question)}
          />
        );
      case 'rearrange':
        return (
          <RearrangeCard
            key={`rearrange-${index}`}
            data={question.data as RearrangeData}
            onPreview={() => setSelectedQuestion(question)}
          />
        );
      case 'coding': {
        const codingData: CodingData = typeof question.data === 'string'
          ? JSON.parse(question.data)
          : (question.data as CodingData);
        return (
          <CodingCard
            key={`coding-${index}`}
            data={codingData}
            onPreview={() => setSelectedQuestion(question)}
          />
        );
      }
      default:
        return null;
    }
  };

  const renderPreview = () => {
    if (!selectedQuestion) return null;

    switch (selectedQuestion.type) {
      case 'mcq':
        return (
          <MCQPreview
            data={selectedQuestion.data as MCQData}
            onClose={() => setSelectedQuestion(null)}
          />
        );
      case 'rearrange':
        return (
          <RearrangePreview
            data={selectedQuestion.data as RearrangeData}
            onClose={() => setSelectedQuestion(null)}
          />
        );
      case 'coding': {
        const codingData: CodingData = typeof selectedQuestion.data === 'string'
          ? JSON.parse(selectedQuestion.data)
          : (selectedQuestion.data as CodingData);
        return (
          <CodingPreview
            data={codingData}
            onClose={() => setSelectedQuestion(null)}
          />
        );
      }
      default:
        return null;
    }
  };

  const getQuestionCounts = () => {
    const counts = { mcq: 0, rearrange: 0, coding: 0, missing: 0 };
    questions.forEach(q => {
      if (q.type === 'mcq' && (q.data as MCQData)?.missing) {
        counts.missing++;
      } else if (q.type in counts) {
        // @ts-ignore
        counts[q.type]++;
      }
    });
    return counts;
  };

  const counts = getQuestionCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} className="text-[#4CA466]" />
            <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          </div>
          <p className="text-gray-600 mb-4">Browse through various types of questions and preview them instantly</p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <FileText size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{counts.mcq} MCQ Questions</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
              <Move size={16} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-800">{counts.rearrange} Rearrange Questions</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
              <Code size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">{counts.coding} Coding Questions</span>
            </div>
            {counts.missing > 0 && (
              <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-red-800">{counts.missing} Missing Questions</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-6">Loading questions…</div>
        )}

        {error && (
          <div className="text-center py-6 text-red-600">
            Failed to load questions. {error.message || ''}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((question, index) => renderQuestionCard(question, index))}
        </div>

        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions available</h3>
            <p className="text-gray-500">There are no questions to display at the moment.</p>
          </div>
        )}
      </div>

      {renderPreview()}
    </div>
  );
}

export default ListQuestionCards;
