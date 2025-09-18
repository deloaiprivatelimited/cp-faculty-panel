import React, { useEffect, useState } from 'react';
import { Question, MCQData, RearrangeData, CodingData } from './types/questionTypes';
import MCQCard from '../../../../Utils/MCQ/MCQCard';
import RearrangeCard from '../../../../Utils/Rearrange/RearrangeCard'
import { BookOpen, FileText, Code, Move, RotateCw } from 'lucide-react';
import { privateAxios } from '../../../../../utils/axios';
import MCQPreview from '../../../../Utils/MCQ/MCQPreview';
import CodingCard from '../../../../Utils/Coding/CodingCard'
import CodingPreview from "../../../../Utils/Coding/CodingPreview"
import SelectMCQ, { Question as SelectQuestion, SourceType as SelectSourceType } from '../selectMCQ';
import SelectRearrange from '../selectRearrange';
import SelectCoding from '../selectCoding';
import RearrangePreview from '../../../../Utils/Rearrange/RearrangePreview';

// <-- NEW: import the modal (adjust path if you put it elsewhere)
// import EditQuestionModal from './EditQuestionModal';
import EditQuestionModal from '../../../EditTestQuestions/MCQ/Edit';
type QuestionType = 'all' | 'coding' | 'mcq' | 'rearrange';
type SelectorType = 'mcq' | 'rearrange' | 'coding' | null;
type SourceType = 'library' | 'global' | null;

function ListQuestionCards({ section }: { section: any }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // NEW: modal state for EditQuestionModal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // optional: if you have course flag for certain questions, you can store it too
  const [editCourse, setEditCourse] = useState<boolean>(false);

  // NEW: selector state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<SelectorType>(null);
  const [selectedComponent, setSelectedComponent] = useState<{
    type: SelectorType;
    source: SourceType;
    selectedQuestions: { id: string; title: string; description?: string }[];
  } | null>(null);

  const [previewMCQ, setPreviewMCQ] = React.useState(null);
  const [isMCQPreviewOpen, setIsMCQPreviewOpen] = React.useState(false);
  const [previewRearrange, setPreviewRearrange] = React.useState(null);
  const [isRearrangePreviewOpen, setIsRearrangePreviewOpen] = React.useState(false);
  const [previewCoding, setPreviewCoding] = React.useState(null);
  const [isCodingPreviewOpen, setIsCodingPreviewOpen] = React.useState(false);

  // Fetch questions (existing logic preserved)
  useEffect(() => {
    if (!section || !section.id) {
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
        const resp = await privateAxios.get(`/tests/sections/${section.id}/questions`, {
          cancelToken: source ? source.token : undefined,
        });

        const payload = resp && resp.data ? resp.data : resp;
        const data = Array.isArray(payload.data) ? payload.data : payload;

        if (!cancelled) {
          setQuestions(data.map((item: any) => ({
            type: item.type,
            data: item.data,
            ...item,
          }) as Question));
        }
      } catch (err) {
        if (!cancelled) {
          if (privateAxios.isCancel && privateAxios.isCancel(err)) {
            // cancelled
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

  const handleMCQPreview = (mcq) => {
    setPreviewMCQ(mcq);
    setIsMCQPreviewOpen(true);
  };
  const handleCloseMCQPreview = () => {
    setIsMCQPreviewOpen(false);
    setPreviewMCQ(null);
  };
  const handleCodingPreview = (coding) => {
    setPreviewCoding(coding);
    setIsCodingPreviewOpen(true);
  };
  const handleCloseCodingPreview = () => {
    setIsCodingPreviewOpen(false);
    setPreviewCoding(null);
  };
  const handleRearrangePreview = (rearrange) => {
    setPreviewRearrange(rearrange);
    setIsRearrangePreviewOpen(true);
  };
  const handleCloseRearrangePreview = () => {
    setIsRearrangePreviewOpen(false);
    setPreviewRearrange(null);
  };

  // ---------- NEW: edit handlers ----------
  const openEditModalFor = (id: string, course = false) => {
    setEditId(id);
    setEditCourse(course);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditId(null);
    setEditCourse(false);
    // optionally re-fetch questions after editing if needed
    // you could call the same fetch endpoint here or lift fetch logic to a reusable fn
  };

  // Render cards
  const renderQuestionCard = (question: any, index: number) => {
    const key = (question as any).id ?? `${question.type}-${index}`;
    switch (question.type) {
      case 'mcq':
        return (
          <MCQCard
            key={question.data.id}
            mcq={question.data}
            onPreview={handleMCQPreview}
            label={true}
            // enable edit button in MCQCard and pass handler
            editEnabled={true}
            handleEdit={(mcq) => {
              // mcq is the mcq object from card; use its id
              const id = mcq.id ?? mcq._id ?? question.data.id;
              openEditModalFor(id, /* course */ false);
            }}
          />
        );
      case 'rearrange':
        return (
          <div key={key} className="w-full">
            <RearrangeCard
              key={question.data.id}
              rearrange={question.data}
              onPreview={handleRearrangePreview}
              label={true}
            />
          </div>
        );
      case 'coding': {
        const codingData: CodingData = typeof question.data === 'string'
          ? JSON.parse(question.data)
          : (question.data as CodingData);
        return (
          <div key={key} className="w-full">
            <CodingCard
              key={question.data.id}
              coding={question.data}
              onPreview={handleCodingPreview}
              label={true}
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Counts helper
  const getQuestionCounts = () => {
    const counts = { all: questions.length, mcq: 0, rearrange: 0, coding: 0 };
    questions.forEach(q => {
      if (q.type === 'mcq') counts.mcq++;
      else if (q.type === 'rearrange') counts.rearrange++;
      else if (q.type === 'coding') counts.coding++;
    });
    return counts;
  };

  const counts = getQuestionCounts();

  // Filtering
  const [activeFilter, setActiveFilter] = useState<QuestionType>('all');
  const filteredQuestions = activeFilter === 'all' ? questions : questions.filter(q => q.type === activeFilter);

  // Selector wiring (unchanged)
  const openSelector = (type: SelectorType) => {
    setSelectorType(type);
    setIsSelectorOpen(true);
  };
  const closeSelector = () => {
    setIsSelectorOpen(false);
    setSelectorType(null);
  };
  const mapDupResultsToQuestions = (results: any[], kindLabel: string) => {
    return results.map((r: any, idx: number) => {
      const id = r.original_mcq_id || r.original_rearrange_id || r.original_question_id || `item-${idx}`;
      const testId = r.test_mcq_id || r.test_rearrange_id || r.test_question_id;
      const title = testId ? `${kindLabel} added (${testId})` : `${kindLabel} - ${id}`;
      const description = r.success ? `Attached to section ${r.section_id || section?.id || ''}` : `Failed: ${r.message || 'unknown'}`;
      return { id, title, description };
    });
  };
  const handleSelectorConfirm = async (source: SelectSourceType | SourceType | null, results: any[]) => {
    if (!selectorType) return;
    const kind = selectorType === 'mcq' ? 'MCQ' : selectorType === 'rearrange' ? 'Rearrange' : 'Coding';
    const mapped = mapDupResultsToQuestions(results, kind);
    setSelectedComponent({
      type: selectorType,
      source: (source as SourceType) ?? null,
      selectedQuestions: mapped,
    });
    closeSelector();
    if (section?.id) {
      try {
        const resp = await privateAxios.get(`/tests/sections/${section.id}/questions`);
        const payload = resp && resp.data ? resp.data : resp;
        const data = Array.isArray(payload.data) ? payload.data : payload;
        setQuestions(Array.isArray(data) ? data.map((item: any) => ({ type: item.type, data: item.data, ...item })) : []);
      } catch (err) {
        console.error('Error refetching questions after adding:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header + Add buttons */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{section.name}</h1>
              <p className="text-gray-600">{section.description}</p>
            </div>

            {/* Add Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openSelector('mcq')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white"
              >
                <FileText size={16} />
                <span>Add MCQ</span>
              </button>
              <button
                onClick={() => openSelector('rearrange')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white"
              >
                <RotateCw size={16} />
                <span>Add Rearrange</span>
              </button>
              <button
                onClick={() => openSelector('coding')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white"
              >
                <Code size={16} />
                <span>Add Coding</span>
              </button>
            </div>
          </div>

          {/* Counts / Filter tabs */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'all' ? 'bg-[#4CA466] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen size={16} />
              <span>All Questions ({counts.all})</span>
            </button>

            <button
              onClick={() => setActiveFilter('coding')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'coding' ? 'bg-[#4CA466] text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <Code size={16} />
              <span>Coding ({counts.coding})</span>
            </button>

            <button
              onClick={() => setActiveFilter('mcq')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'mcq' ? 'bg-[#4CA466] text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FileText size={16} />
              <span>MCQ ({counts.mcq})</span>
            </button>

            <button
              onClick={() => setActiveFilter('rearrange')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeFilter === 'rearrange' ? 'bg-[#4CA466] text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
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
        {loading && (
          <div className="text-center py-6">Loading questions…</div>
        )}

        {error && (
          <div className="text-center py-6 text-red-600">
            Failed to load questions. {error.message || ''}
          </div>
        )}

        {filteredQuestions.length === 0 && !loading ? (
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

      {/* Selectors */}
      {selectorType === 'mcq' && (
        <SelectMCQ
          isOpen={isSelectorOpen}
          onClose={closeSelector}
          onConfirm={(source: SelectSourceType, results: any[]) => handleSelectorConfirm(source, results)}
          defaultSectionId={section?.id}
          apiBase={''}
        />
      )}
      {selectorType === 'rearrange' && (
        <SelectRearrange
          isOpen={isSelectorOpen}
          onClose={closeSelector}
          onConfirm={(source: SourceType, results: any[]) => handleSelectorConfirm(source, results)}
          defaultSectionId={section?.id}
          apiBase={''}
        />
      )}
      {selectorType === 'coding' && (
        <SelectCoding
          isOpen={isSelectorOpen}
          onClose={closeSelector}
          onConfirm={(source: SourceType, results: any[]) => handleSelectorConfirm(source, results)}
          defaultSectionId={section?.id}
          apiBase={''}
        />
      )}

      {/* Previews */}
      <MCQPreview mcq={previewMCQ} isOpen={isMCQPreviewOpen} onClose={handleCloseMCQPreview} />
      <RearrangePreview rearrange={previewRearrange} isOpen={isRearrangePreviewOpen} onClose={handleCloseRearrangePreview} />
      <CodingPreview coding={previewCoding} isOpen={isCodingPreviewOpen} onClose={handleCloseCodingPreview} />

      {/* ---------- EDIT MODAL ---------- */}
      <EditQuestionModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        id={editId}
        course={editCourse}
      />
    </div>
  );
}

export default ListQuestionCards;
