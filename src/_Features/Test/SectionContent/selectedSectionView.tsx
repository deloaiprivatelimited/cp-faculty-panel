import React, { useState ,useEffect} from 'react';
import { Plus, X, BookOpen, Globe, FileText, RotateCw, Code, Check } from 'lucide-react';
import SelectMCQ, { Question as SelectQuestion, SourceType as SelectSourceType } from './utils/selectMCQ';
import SelectRearrange from './utils/SelectRearrange';
import SelectCoding from './utils/SelectCoding';
import ListQuestionCards from './utils/ListSectionQuestions';
import { privateAxios } from '../../../utils/axios';
import QuestionList from '../QuestionList';
type QuestionType = 'mcq' | 'rearrange' | 'coding' | null;
type SourceType = 'library' | 'global' | null;

interface Question {
  id: string;
  title: string;
  description?: string;
}

interface SelectedComponent {
  type: QuestionType;
  source: SourceType;
  selectedQuestions: Question[];
}

// Component for MCQ
const MCQComponent: React.FC<{ source: SourceType; questions: Question[] }> = ({ source, questions }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-100 rounded-lg">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Multiple Choice Question</h3>
        <p className="text-sm text-gray-500">
          {source === 'library' ? 'Library MCQ' : 'Global MCQ'}
        </p>
      </div>
    </div>
    <div className="space-y-3">
      {questions.map((question) => (
        <div key={question.id} className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-800">{question.title}</h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Component for Rearrange
const RearrangeComponent: React.FC<{ source: SourceType; questions: Question[] }> = ({ source, questions }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-green-100 rounded-lg">
        <RotateCw className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Rearrange Question</h3>
        <p className="text-sm text-gray-500">
          {source === 'library' ? 'Library Rearrange' : 'Global Rearrange'}
        </p>
      </div>
    </div>
    <div className="space-y-3">
      {questions.map((question) => (
        <div key={question.id} className="p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-gray-800">{question.title}</h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Component for Coding
const CodingComponent: React.FC<{ source: SourceType; questions: Question[] }> = ({ source, questions }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-purple-100 rounded-lg">
        <Code className="w-6 h-6 text-purple-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Coding Question</h3>
        <p className="text-sm text-gray-500">
          {source === 'library' ? 'Library Coding' : 'Global Coding'}
        </p>
      </div>
    </div>
    <div className="space-y-3">
      {questions.map((question) => (
        <div key={question.id} className="p-3 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-gray-800">{question.title}</h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

function SelectedSectionView({ section }: { section: any }) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>(null);
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);

  // When user clicks one of the Add buttons
  const handleButtonClick = (type: QuestionType) => {
    setSelectedQuestionType(type);
    setIsSelectorOpen(true);
  };

useEffect(() => {
  if (!section?.id) return;
  console.log(section.id)

  let cancelled = false;

  (async () => {
    try {
      const res = await privateAxios.get(`/tests/sections/${section.id}/questions`);
      if (!cancelled) console.log('questions fetch success:', res.data);
    } catch (err) {
      if (!cancelled) console.error('questions fetch error:', err);
    }
  })();

  return () => { cancelled = true; };
}, [section?.id]);
  // Helpers to convert duplication results (from selectors) into simple Question[] to render
  // The selectors' endpoints (duplicate-to-section) return success/failure objects; we map them to simple placeholders.
  const mapDupResultsToQuestions = (results: any[], kindLabel: string): Question[] => {
    // Prefer to show original id and if duplication created a test id, show that in title/description.
    return results.map((r, idx) => {
      const id = r.original_mcq_id || r.original_rearrange_id || r.original_question_id || `item-${idx}`;
      const testId = r.test_mcq_id || r.test_rearrange_id || r.test_question_id;
      const title = testId ? `${kindLabel} added (${testId})` : `${kindLabel} - ${id}`;
      const description = r.success ? `Attached to section ${r.section_id || section?.id || ''}` : `Failed: ${r.message || 'unknown'}`;
      return { id, title, description };
    });
  };

  // MCQ selector confirm handler
  const handleMCQConfirm = (source: SelectSourceType, results: any[]) => {
    const questions = mapDupResultsToQuestions(results, 'MCQ');
    setSelectedComponent({
      type: 'mcq',
      source: source as SourceType,
      selectedQuestions: questions
    });
    setIsSelectorOpen(false);
    setSelectedQuestionType(null);
  };

  // Rearrange selector confirm handler
  const handleRearrangeConfirm = (source: SourceType, results: any[]) => {
    const questions = mapDupResultsToQuestions(results, 'Rearrange');
    setSelectedComponent({
      type: 'rearrange',
      source,
      selectedQuestions: questions
    });
    setIsSelectorOpen(false);
    setSelectedQuestionType(null);
  };

  // Coding selector confirm handler
  const handleCodingConfirm = (source: SourceType, results: any[]) => {
    const questions = mapDupResultsToQuestions(results, 'Coding');
    setSelectedComponent({
      type: 'coding',
      source,
      selectedQuestions: questions
    });
    setIsSelectorOpen(false);
    setSelectedQuestionType(null);
  };

  const handleCloseSelector = () => {
    setIsSelectorOpen(false);
    setSelectedQuestionType(null);
  };

  const renderSelectedComponent = () => {
    if (!selectedComponent) return null;

    switch (selectedComponent.type) {
      case 'mcq':
        return <MCQComponent source={selectedComponent.source} questions={selectedComponent.selectedQuestions} />;
      case 'rearrange':
        return <RearrangeComponent source={selectedComponent.source} questions={selectedComponent.selectedQuestions} />;
      case 'coding':
        return <CodingComponent source={selectedComponent.source} questions={selectedComponent.selectedQuestions} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8">
      

        {/* Selected Component Display */}
        {selectedComponent && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Selected Question</h2>
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
            {renderSelectedComponent()}
          </div>
        )}

        {/* Action Buttons */}
        <div className=" top-6 right-6 flex items-center gap-3">
          <button
            onClick={() => handleButtonClick('mcq')}
            className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Add MCQ</span>
          </button>

          <button
            onClick={() => handleButtonClick('rearrange')}
            className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm text-green-600 hover:bg-green-50 hover:border-green-500 transition"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-sm font-medium">Add Rearrange</span>
          </button>

          <button
            onClick={() => handleButtonClick('coding')}
            className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm text-purple-600 hover:bg-purple-50 hover:border-purple-500 transition"
          >
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium">Add Coding</span>
          </button>
        </div>

     
      </div>
      <ListQuestionCards section={section}/>

      {/* Selectors (modals) */}
      {selectedQuestionType === 'mcq' && (
        <SelectMCQ
          isOpen={isSelectorOpen}
          onClose={handleCloseSelector}
          onConfirm={handleMCQConfirm}
          defaultSectionId={section?.id}
          apiBase={''} // pass apiBase if you need
        />
      )}

      {selectedQuestionType === 'rearrange' && (
        <SelectRearrange
          isOpen={isSelectorOpen}
          onClose={handleCloseSelector}
          onConfirm={handleRearrangeConfirm}
          defaultSectionId={section?.id}
          apiBase={''}
        />
      )}

      {selectedQuestionType === 'coding' && (
        <SelectCoding
          isOpen={isSelectorOpen}
          onClose={handleCloseSelector}
          onConfirm={handleCodingConfirm}
          defaultSectionId={section?.id}
          apiBase={''}
        />
      )}
    </div>
  );
}

export default SelectedSectionView;
