import React, { useEffect, useState } from 'react';
import { List, Grid, Check, X } from 'lucide-react';
import { privateAxios } from '../../../../utils/axios';
import RearrangeCard from '../../../Utils/Rearrange/RearrangeCard';
import RearrangePreview from '../../../Utils/Rearrange/RearrangePreview';
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
  topic?: string;
  subtopic?: string;
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
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [previewRearrange, setPreviewRearrange] = React.useState<RearrangeQuestion | null>(null);
  const [isRearrangePreviewOpen, setIsRearrangePreviewOpen] = React.useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [subtopicFilter, setSubtopicFilter] = useState('');

  // Dropdown options
  const [allQuestions, setAllQuestions] = useState<RearrangeQuestion[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSource(null);
      setSelectedIds([]);
      setQuestions([]);
      setError(null);
      setPage(1);
      setTotal(null);
      setSearchTerm('');
      setTopicFilter('');
      setSubtopicFilter('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedSource) return;
    fetchRearranges(selectedSource, page, perPage);
    fetchAllQuestionsForFilters(selectedSource);
  }, [selectedSource, page, searchTerm, topicFilter, subtopicFilter]);

  const buildListUrl = (source: Exclude<SourceType, null>, pageNum = 1, per = 20) => {
    const resourceSegment = source === 'library' ? 'college-questions' : 'questions';
    const qp = new URLSearchParams({ page: String(pageNum), per_page: String(per), source });
    if (searchTerm) qp.set('search', searchTerm);
    if (topicFilter) qp.set('topic', topicFilter);
    if (subtopicFilter) qp.set('subtopic', subtopicFilter);
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

      const items = (body.data?.items || []).map((it: any) => ({
        id: it.id,
        title: it.title || it.prompt || it.id,
        prompt: it.prompt || '',
        items: (it.items || []).map((itm: any) => ({
          id: itm.id || itm.item_id || String(Math.random()),
          value_preview: itm.value_preview,
          has_images: !!itm.has_images
<<<<<<< HEAD
        })),
        topic: it.topic || '',
        subtopic: it.subtopic || ''
      }));

      setQuestions(items);
      setTotal(body.data?.meta?.total || null);
=======
        }))
      }));

      // use the normalized `mapped` array (previously you set `items` here)
      setQuestions(items);
      setTotal(body.data && body.data.meta ? body.data.meta.total : null);
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestionsForFilters = async (source: Exclude<SourceType, null>) => {
    try {
      const url = `${apiBase}/test/${source === 'library' ? 'college-questions' : 'questions'}/rearranges/?per_page=10000&source=${source}`;
      const res = await privateAxios.get(url);
      const items = (res.data?.data?.items || []).map((it: any) => ({
        topic: it.topic,
        subtopic: it.subtopic
      }));

      setAllQuestions(items);
      setTopics(Array.from(new Set(items.map(q => q.topic).filter(Boolean))));
      setSubtopics(Array.from(new Set(items.map(q => q.subtopic).filter(Boolean))));
    } catch (err) {
      console.error('Error fetching filters', err);
    }
  };

  const toggleQuestion = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const selectAllOnPage = () => {
    const idsOnPage = questions.map(q => q.id);
    const allSelected = idsOnPage.length > 0 && idsOnPage.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !idsOnPage.includes(id)));
    } else {
      setSelectedIds(prev => {
        const s = new Set(prev);
        idsOnPage.forEach(id => s.add(id));
        return Array.from(s);
      });
    }
  };

  const handleBack = () => {
    setSelectedSource(null);
    setSelectedIds([]);
    setQuestions([]);
    setError(null);
    setPage(1);
    setSearchTerm('');
    setTopicFilter('');
    setSubtopicFilter('');
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
<<<<<<< HEAD
          const res = await privateAxios.post(url, {});
=======
          // payload: include defaultSectionId if present
          const payload: any = {};
          if (defaultSectionId) payload.section_id = defaultSectionId;
          const res = await privateAxios.post(url, payload);
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355
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
          results.push({ original_rearrange_id: rearrId, success: false, message: innerErr.message || String(innerErr) });
        }
      }

      onConfirm(selectedSource, results);
      handleBack();
      onClose();
    } catch (err: any) {
      setError(String(err));
    } finally {
      setDuplicating(false);
    }
  };

  if (!isOpen) return null;

  const handleRearrangePreview = (rearrange: RearrangeQuestion) => {
    setPreviewRearrange(rearrange);
    setIsRearrangePreviewOpen(true);
  };
  const handleCloseRearrangePreview = () => {
    setIsRearrangePreviewOpen(false);
    setPreviewRearrange(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-md">
              <List className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Add Rearrange Question</h2>
          </div>
          <div className="flex items-center gap-2">
            {selectedSource && <button onClick={handleBack} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Back</button>}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
        </div>

        <div className="p-6">
          {!selectedSource ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Choose the source for your Rearranges:</p>
              <button onClick={() => setSelectedSource('library')} className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left">
                <div className="flex items-center gap-3"><Grid className="w-5 h-5 text-indigo-600" /><span className="font-semibold text-gray-800">From Library</span></div>
              </button>
              <button onClick={() => setSelectedSource('global')} className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left">
                <div className="flex items-center gap-3"><Grid className="w-5 h-5 text-green-600" /><span className="font-semibold text-gray-800">From Global</span></div>
              </button>
            </div>
          ) : (
<<<<<<< HEAD
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded-lg px-3 py-2 flex-1 min-w-[150px]" />
                <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                  <option value="">All Topics</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={subtopicFilter} onChange={e => setSubtopicFilter(e.target.value)} className="border rounded-lg px-3 py-2">
                  <option value="">All Subtopics</option>
                  {subtopics.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              {loading ? <p className="text-gray-500">Loading questions...</p> :
                error ? <p className="text-red-500">{error}</p> :
                  questions.length === 0 ? <p className="text-gray-500">No rearrange questions found.</p> :
                    <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-lg">
                      {questions.map(q => (
                        <div key={q.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toggleQuestion(q.id)}>
                          <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                            <div className={`w-4 h-4 border-2 rounded ${selectedIds.includes(q.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'} flex items-center justify-center`}>
                              {selectedIds.includes(q.id) && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{q.title}</h4>
                            {q.prompt && <p className="text-sm text-gray-600 mt-1">{q.prompt}</p>}
                            {q.items && q.items.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-2">
                                {q.items.slice(0, 6).map(itm => <div key={itm.id} className="truncate">{itm.value_preview || (itm.has_images ? 'Image item' : '...')}</div>)}
                              </div>
                            )}
                            {(q.topic || q.subtopic) && <div className="mt-1 text-xs text-gray-400 flex gap-2">{q.topic && <span>{q.topic}</span>}{q.subtopic && <span>{q.subtopic}</span>}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
              }
=======
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 mb-4">
                  Select rearrange questions from {selectedSource === 'library' ? 'Library' : 'Global'}:
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{loading ? 'Loading...' : total != null ? `${total} total` : ''}</div>
                  <button
                    onClick={selectAllOnPage}
                    className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
                    disabled={questions.length === 0}
                  >
                    Select all on page
                  </button>
                </div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-lg">
                {questions.length === 0 && !loading && <div className="text-sm text-gray-500">No rearrange questions found.</div>}

                {questions.map(q => {
                  const isSelected = selectedIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all border ${
                        isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:border-gray-200'
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1" onClick={() => handleRearrangePreview(q)} role="button">
                            <RearrangeCard rearrange={q} onPreview={handleRearrangePreview} label={true} />
                          </div>

                          {isSelected ? (
                            <div className="ml-3 flex items-center gap-1 text-sm text-indigo-700">
                              <Check className="w-4 h-4" />
                              <span>Selected</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
>>>>>>> 06a08b2ca9a5f94dd4c837293f5a81e13be2a355

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">Page {page} — {selectedIds.length} selected</div>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-2 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
                  <button onClick={() => setPage(p => p+1)} disabled={total!=null && page*perPage >= (total||0)} className="px-2 py-1 text-sm border rounded disabled:opacity-50">Next</button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={handleBack} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleDuplicateAndAdd} disabled={selectedIds.length===0 || duplicating} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300">
                  {duplicating ? 'Processing...' : `Duplicate (${selectedIds.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <RearrangePreview rearrange={previewRearrange} isOpen={isRearrangePreviewOpen} onClose={handleCloseRearrangePreview} />
    </div>
  );
};

export default SelectRearrange;
