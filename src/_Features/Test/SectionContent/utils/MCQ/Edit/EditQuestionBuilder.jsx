import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { privateAxios } from '../../../utils/axios';
// import { privateAxios } from  '../../../../utils/axios';
import QuestionPreview from '../QuestionPreview';
import { privateAxios } from '../../../../../../utils/axios';
import EditQuestionForm from './EditQuestionForm';
// import { showError } from '../../../utils/toast';
// import { showError } from '../../../../utils/toast';
import { showError } from '../../../../../../utils/toast';
export default function EditQuestionBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(null);

  const [formData, setFormData] = useState({
    // mirrors backend fields
    id: '',
    title: '',
    topic: '',
    subtopic: '',
    questionText: '',
    // IMPORTANT: options are objects with { option_id, value }
    options: [],
    // correctAnswers holds option_ids (not indexes)
    correctAnswers: [],
    isMultipleCorrect: false,
    marks: '4',
    negativeMarks: '0',
    difficulty: 'Easy',
    explanation: '',
    tags: '', // comma joined in UI
    timeLimit: '60',
    timeUnit: 'seconds',
  });

  // Fetch MCQ to edit
  useEffect(() => {
    (async () => {
      try {
        const res = await privateAxios.get(`/tests/mcq/${id}`);
        if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch');
        const m = res.data.data; // server to_json()
        // Convert server payload to our form shape
        const seconds = Number(m.time_limit || 60);
        // choose a nice unit for display
        let unit = 'seconds';
        let amount = seconds;
        if (seconds % 3600 === 0) { unit = 'hours'; amount = seconds / 3600; }
        else if (seconds % 60 === 0) { unit = 'minutes'; amount = seconds / 60; }

        setFormData({
          id: m.id,
          title: m.title || '',
          topic: m.topic || '',
          subtopic: m.subtopic || '',
          questionText: m.question_text || '',
          options: (m.options || []).map(o => ({ option_id: o.option_id, value: o.value })),
          correctAnswers: m.correct_options || [], // already option_ids
          isMultipleCorrect: !!m.is_multiple,
          marks: String(m.marks ?? '4'),
          negativeMarks: String(m.negative_marks ?? '0'),
          difficulty: m.difficulty_level || 'Easy',
          explanation: m.explanation || '',
          tags: (m.tags || []).join(','),
          timeLimit: String(amount),
          timeUnit: unit,
        });
      } catch (e) {
        console.error(e);
        showError(e.message || 'Could not load question');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/questions/mcq')}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back
            </button>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">Edit MCQ</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => saveRef.current && saveRef.current()}
              disabled={saving}
              className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] shadow disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 bg-gray-50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {!loading && (
            <EditQuestionForm
              formData={formData}
              setFormData={setFormData}
              setSaveRef={(fn) => (saveRef.current = fn)}
              setSaving={setSaving}
            />
          )}
        </div>
        <div className="p-6 bg-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {/* The existing preview supports strings; adapt for option objects */}
          <QuestionPreview
            formData={{
              ...formData,
              // Preview component expects options as strings; map safely
              options: formData.options.map(o => o.value),
              // Preview expects indexes; convert ids to indexes for highlighting
              correctAnswers: formData.options
                .map((o, idx) => ({ id: o.option_id, idx }))
                .filter(({ id }) => formData.correctAnswers.includes(id))
                .map(({ idx }) => idx),
            }}
          />
        </div>
      </div>
    </div>
  );
}