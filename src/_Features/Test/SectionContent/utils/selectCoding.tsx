import React, { useEffect, useState } from 'react';
import { Code, Terminal, Check, X } from 'lucide-react';
import { privateAxios } from '../../../../utils/axios';

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
  const [questions, setQuestions] = useState<CodingQuestionPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState(defaultSectionId);
  const [duplicating, setDuplicating] = useState(false);

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

  const fetchCodingQuestions = async (source: Exclude<SourceType, null>, pageNum = 1, per = 20) => {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams({ page: String(pageNum), per_page: String(per), source });
      const url = `${apiBase}/test/questions/coding/?${qp.toString()}`.replace(/([^:]\/\/)\//, '$1');

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
    if (!sectionId || sectionId.trim() === '') {
      setError('Please enter a section id to attach duplicated Coding questions to.');
      return;
    }

    setDuplicating(true);
    setError(null);

    const results: DuplicateResult[] = [];

    try {
      for (const qId of selectedIds) {
        try {
          const url = `${apiBase}/test/questions/coding/${qId}/duplicate-to-section`;
          const res = await privateAxios.post(url, { section_id: sectionId });
          const body = res.data;

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
      setSectionId(defaultSectionId);
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
                {questions.map(q => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                      <div
                        className={`w-4 h-4 border-2 rounded ${selectedIds.includes(q.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'} flex items-center justify-center`}
                      >
                        {selectedIds.includes(q.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">{q.title}</h4>
                        <div className="text-xs text-gray-500">{q.points != null ? `${q.points} pts` : ''}</div>
                      </div>
                      {q.short_description && <p className="text-sm text-gray-600 mt-1">{q.short_description}</p>}
                      <div className="mt-2 text-xs text-gray-500 flex gap-2 items-center">
                        {q.difficulty && <span className="px-2 py-1 border rounded">{q.difficulty}</span>}
                        {q.allowed_languages && q.allowed_languages.length > 0 && (
                          <span className="px-2 py-1 border rounded">{q.allowed_languages.slice(0,3).join(', ')}{q.allowed_languages.length>3? '…': ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Section ID</label>
                  <input
                    value={sectionId}
                    onChange={e => setSectionId(e.target.value)}
                    placeholder="Enter section id to attach to"
                    className="flex-1 p-2 border rounded"
                  />
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
                    {duplicating ? 'Adding...' : `Duplicate & Add (${selectedIds.length})`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectCoding;
