import React, { useEffect, useState } from 'react';
import { Code, Terminal, Check, X } from 'lucide-react';
import { privateAxios } from '../../../../utils/axios';
import CodingCard from '../../../Utils/Coding/CodingCard';
import CodingPreview from '../../../Utils/Coding/CodingPreview';
export type SourceType = 'library' | 'global' | null;

export interface CodingQuestionPreview {
  id: string;
  title: string;
  short_description?: string;
  difficulty?: string;
  points?: number | null;
  allowed_languages?: string[];
}

export interface DuplicateResult {
  original_question_id: string;
  test_question_id?: string;
  section_id?: string;
  success: boolean;
  message?: string;
}

interface SelectCodingProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (source: SourceType, results: DuplicateResult[]) => void;
  defaultSectionId?: string;
  apiBase?: string;
}

const SelectCoding: React.FC<SelectCodingProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultSectionId = '',
  apiBase = ''
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<CodingQuestionPreview[]>([]); // typed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  const [previewCoding, setPreviewCoding] = React.useState<CodingQuestionPreview | null>(null);
  const [isCodingPreviewOpen, setIsCodingPreviewOpen] = React.useState(false);
  
  useEffect(() => {
    if (!isOpen) {
      setSelectedSource(null);
      setSelectedIds([]);
      setQuestions([]);
      setError(null);
      setPage(1);
      setTotal(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedSource) return;
    fetchCodingQuestions(selectedSource, page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, page]);

  const buildListUrl = (source: Exclude<SourceType, null>, pageNum = 1, per = 20) => {
    // library -> use 'college-questions', global -> keep 'questions'
    const resourceSegment = source === 'library' ? 'college-questions' : 'questions';
    const qp = new URLSearchParams({ page: String(pageNum), per_page: String(per), source });
    return `${apiBase}/test/${resourceSegment}/coding/?${qp.toString()}`.replace(/([^:]\/\/)\//, '$1');
  };

  const buildDuplicateUrl = (source: Exclude<SourceType, null>, qId: string) => {
    const resourceSegment = source === 'library' ? 'college-questions' : 'questions';
    return `${apiBase}/test/${resourceSegment}/coding/${qId}/duplicate-to-section`;
  };
  const handleCodingPreview = (coding: CodingQuestionPreview) => {
    setPreviewCoding(coding);
    setIsCodingPreviewOpen(true);
  };
  const handleCloseCodingPreview = () => {
    setIsCodingPreviewOpen(false);
    setPreviewCoding(null);
  };

  const fetchCodingQuestions = async (source: Exclude<SourceType, null>, pageNum = 1, per = 20) => {
    setLoading(true);
    setError(null);
    try {
      const url = buildListUrl(source, pageNum, per);

      const res = await privateAxios.get(url);
      const body = res.data;
      if (!body.success) throw new Error(body.message || 'Failed to fetch');

      const items = (body.data && body.data.items) || [];
      const mapped: CodingQuestionPreview[] = items.map((it: any) => ({
        id: it.id,
        title: it.title || it.short_description || it.id,
        short_description: it.short_description || '',
        difficulty: it.difficulty || it.difficulty_level || '',
        points: typeof it.points !== 'undefined' ? it.points : null,
        allowed_languages: it.allowed_languages || []
      }));

      // store mapped items so the shape is consistent for rendering & preview
      setQuestions(mapped);
      setTotal(body.data && body.data.meta ? body.data.meta.total : null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleBack = () => {
    setSelectedSource(null);
    setSelectedIds([]);
    setQuestions([]);
    setError(null);
    setPage(1);
  };

  const handleDuplicateAndAdd = async () => {
    if (!selectedSource) return;

    setDuplicating(true);
    setError(null);

    const results: DuplicateResult[] = [];

    try {
      for (const qId of selectedIds) {
        try {
          const url = buildDuplicateUrl(selectedSource, qId);
          // section_id removed per request — send empty body

          const payload: any = {};
if (defaultSectionId) payload.section_id = defaultSectionId;
// If you might later allow per-MCQ section override, set it here per item.
const res = await privateAxios.post(url, payload);          const body = res.data;

          if (!body.success) {
            results.push({ original_question_id: qId, success: false, message: body.message || 'Server failed' });
            continue;
          }

          const data = body.data || {};
          results.push({
            original_question_id: data.original_question_id || qId,
            test_question_id: data.test_question_id,
            section_id: data.section_id,
            success: true
          });
        } catch (innerErr: any) {
          console.error(innerErr);
          results.push({ original_question_id: qId, success: false, message: innerErr.message || String(innerErr) });
        }
      }

      onConfirm(selectedSource, results);

      setSelectedSource(null);
      setSelectedIds([]);
      setQuestions([]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(String(err));
    } finally {
      setDuplicating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-md">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Add Coding Question</h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedSource && (
              <button
                onClick={handleBack}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!selectedSource ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Choose the source for your Coding questions:</p>

              <button
                onClick={() => setSelectedSource('library')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Terminal className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">From Library</h3>
                    <p className="text-sm text-gray-500">Choose from pre-made coding questions (server)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedSource('global')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Terminal className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">From Global</h3>
                    <p className="text-sm text-gray-500">Access coding questions from global repository (server)</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 mb-4">Select coding questions from {selectedSource === 'library' ? 'Library' : 'Global'}:</p>
                <div className="text-sm text-gray-500">{loading ? 'Loading...' : total != null ? `${total} total` : ''}</div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-lg">
                {questions.length === 0 && !loading && <div className="text-sm text-gray-500">No coding questions found.</div>}

                {/* --- START: selection wrapper for each card --- */}
                {questions.map((q) => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all border ${
                        isSelected ? 'border-purple-300 bg-purple-50' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQuestion(q.id)}
                          className="w-5 h-5 rounded-md focus:ring-0"
                        />
                      </label>

                      <div className="flex-1">
                        {/* keep CodingCard as-is, pass minimal props; you can extend CodingCard to accept `selected` or `onSelect` later */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1" onClick={() => handleCodingPreview(q)} role="button">
                            <CodingCard coding={q} onPreview={handleCodingPreview} label={true} />
                          </div>

                          {/* small selected indicator on the right */}
                          {isSelected ? (
                            <div className="ml-3 flex items-center gap-1 text-sm text-purple-700">
                              <Check className="w-4 h-4" />
                              <span>Selected</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* --- END selection wrapper --- */}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">Page {page}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={total != null && page * perPage >= (total || 0)}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedIds.length} selected
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDuplicateAndAdd}
                      disabled={selectedIds.length === 0 || duplicating}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {duplicating ? 'Processing...' : `Duplicate (${selectedIds.length})`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <CodingPreview coding={previewCoding} isOpen={isCodingPreviewOpen} onClose={handleCloseCodingPreview} />
    </div>
  );
};

export default SelectCoding;
