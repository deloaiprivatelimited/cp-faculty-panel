import React, { useEffect, useState } from 'react';
import { List, Grid, Check, X } from 'lucide-react';
import { privateAxios } from '../../../../utils/axios';

export type SourceType = 'library' | 'global' | null;

export interface RearrangeItemPreview {
  id: string;
  value_preview?: string;
  has_images?: boolean;
}

export interface RearrangeQuestion {
  id: string;
  title: string;
  prompt?: string;
  items?: RearrangeItemPreview[];
}

export interface DuplicateResult {
  original_rearrange_id: string;
  test_rearrange_id?: string;
  section_id?: string;
  success: boolean;
  message?: string;
}

interface SelectRearrangeProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (source: SourceType, results: DuplicateResult[]) => void;
  defaultSectionId?: string;
  apiBase?: string;
}

const SelectRearrange: React.FC<SelectRearrangeProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultSectionId = '',
  apiBase = ''
}) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<RearrangeQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState<number | null>(null);
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
    fetchRearranges(selectedSource, page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, page]);

  const buildListUrl = (source: Exclude<SourceType, null>, pageNum = 1, per = 20) => {
    const resourceSegment = source === 'library' ? 'college-questions' : 'questions';
    const qp = new URLSearchParams({ page: String(pageNum), per_page: String(per), source });
    return `${apiBase}/test/${resourceSegment}/rearranges/?${qp.toString()}`.replace(/([^:]\/\/)\//, '$1');
  };

  const buildDuplicateUrl = (source: Exclude<SourceType, null>, rearrId: string) => {
    const resourceSegment = source === 'library' ? 'college-questions' : 'questions';
    return `${apiBase}/test/${resourceSegment}/rearranges/${rearrId}/duplicate-to-section`;
  };

  const fetchRearranges = async (source: Exclude<SourceType, null>, pageNum = 1, per = 20) => {
    setLoading(true);
    setError(null);
    try {
      const url = buildListUrl(source, pageNum, per);

      const res = await privateAxios.get(url);
      const body = res.data;
      if (!body.success) throw new Error(body.message || 'Failed to fetch');

      const items = (body.data && body.data.items) || [];
      const mapped: RearrangeQuestion[] = items.map((it: any) => ({
        id: it.id,
        title: it.title || it.prompt || it.id,
        prompt: it.prompt || '',
        items: (it.items || []).map((itm: any) => ({ id: itm.id || itm.item_id || String(Math.random()), value_preview: itm.value_preview, has_images: !!itm.has_images }))
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

    setDuplicating(true);
    setError(null);

    const results: DuplicateResult[] = [];

    try {
      for (const rearrId of selectedIds) {
        try {
          const url = buildDuplicateUrl(selectedSource, rearrId);
          // section_id removed per request — send empty body
          const res = await privateAxios.post(url, {});
          const body = res.data;

          if (!body.success) {
            results.push({ original_rearrange_id: rearrId, success: false, message: body.message || 'Server failed' });
            continue;
          }

          const data = body.data || {};
          results.push({
            original_rearrange_id: data.original_rearrange_id || rearrId,
            test_rearrange_id: data.test_rearrange_id,
            section_id: data.section_id,
            success: true
          });
        } catch (innerErr: any) {
          console.error(innerErr);
          results.push({ original_rearrange_id: rearrId, success: false, message: innerErr.message || String(innerErr) });
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
            <div className="p-2 bg-indigo-50 rounded-md">
              <List className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Add Rearrange Question</h2>
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
              <p className="text-gray-600 mb-4">Choose the source for your Rearranges:</p>

              <button
                onClick={() => setSelectedSource('library')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Grid className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">From Library</h3>
                    <p className="text-sm text-gray-500">Choose from pre-made rearrange questions (server)</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedSource('global')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Grid className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">From Global</h3>
                    <p className="text-sm text-gray-500">Access rearrange questions from global repository (server)</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 mb-4">Select rearrange questions from {selectedSource === 'library' ? 'Library' : 'Global'}:</p>
                <div className="text-sm text-gray-500">{loading ? 'Loading...' : total != null ? `${total} total` : ''}</div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-lg">
                {questions.length === 0 && !loading && <div className="text-sm text-gray-500">No rearrange questions found.</div>}
                {questions.map(q => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                      <div
                        className={`w-4 h-4 border-2 rounded ${selectedIds.includes(q.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'} flex items-center justify-center`}
                      >
                        {selectedIds.includes(q.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{q.title}</h4>
                      {q.prompt && <p className="text-sm text-gray-600 mt-1">{q.prompt}</p>}
                      {q.items && q.items.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
                          {q.items.slice(0, 6).map(itm => (
                            <div key={itm.id} className="truncate">{itm.value_preview || (itm.has_images ? 'Image item' : '...')}</div>
                          ))}
                        </div>
                      )}
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
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {duplicating ? 'Processing...' : `Duplicate (${selectedIds.length})`}
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

export default SelectRearrange;
