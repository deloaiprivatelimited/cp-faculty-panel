import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { privateAxios } from '../../../../../utils/axios';
import QuestionPreview from '../QuestionPreview';
import EditQuestionForm from './EditQuestionForm';
import { showError } from '../../../../../utils/toast';

export default function EditQuestionBuilder({ id: propId ,course=false }) {
  const navigate = useNavigate();
console.log(course)
  const params = useParams();
  // prefer propId if provided, otherwise use route param
  const id = propId ?? params?.id;
    const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(null);

  const makeId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now());

  // initial form state (options are objects with images)
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    topic: '',
    subtopic: '',
    questionText: '',
    questionImages: [],
    explanationImages: [],
    // options: array of { option_id, value, images: [{ image_id, label, url, alt_text, metadata }] }
    options: [
      { option_id: makeId(), value: '', images: [] },
      { option_id: makeId(), value: '', images: [] },
      { option_id: makeId(), value: '', images: [] },
      { option_id: makeId(), value: '', images: [] },
    ],
    // correctAnswers uses option_ids (strings)
    correctAnswers: [],
    isMultipleCorrect: false,
    marks: '4',
    negativeMarks: '0',
    difficulty: 'Easy',
    explanation: '',
    tags: '',
    timeLimit: '60',
    timeUnit: 'seconds',
  });

  // Convert server option representation to our frontend shape
  const _mapServerOptionToFront = (o) => {
    // server option: { option_id, value, images: [ {image_id, url, label, alt_text, metadata} ] }
    return {
      option_id: o.option_id,
      value: o.value,
      images: (o.images || []).map(img => ({
        image_id: img.image_id,
        url: img.url,
        label: img.label,
        alt_text: img.alt_text,
        metadata: img.metadata || {}
      }))
    };
  };

  // Fetch MCQ to edit
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        let url = `/college-mcqs/${id}`
        if(course){
           url = `/course-mcqs/${id}`
        }
        console.log(url)
        const res = await privateAxios.get(url);
        if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch');
        const m = res.data.data; // server to_json()

        // time limit: choose a unit for display
        const seconds = Number(m.time_limit ?? 60);
        let unit = 'seconds';
        let amount = seconds;
        if (seconds % 3600 === 0) { unit = 'hours'; amount = seconds / 3600; }
        else if (seconds % 60 === 0) { unit = 'minutes'; amount = seconds / 60; }

        // Map server options -> frontend options (including nested images)
        const mappedOptions = (m.options || []).map(_mapServerOptionToFront);
        // ensure at least 2 options (defensive)
        while (mappedOptions.length < 2) {
          mappedOptions.push({ option_id: makeId(), value: '', images: [] });
        }

        if (!mounted) return;

        setFormData({
          id: m.id,
          title: m.title || '',
          topic: m.topic || '',
          subtopic: m.subtopic || '',
          questionText: m.question_text || '',
          questionImages: (m.question_images || []).map(img => ({
            image_id: img.image_id,
            url: img.url,
            label: img.label,
            alt_text: img.alt_text,
            metadata: img.metadata || {}
          })),
          explanationImages: (m.explanation_images || []).map(img => ({
            image_id: img.image_id,
            url: img.url,
            label: img.label,
            alt_text: img.alt_text,
            metadata: img.metadata || {}
          })),
          options: mappedOptions,
          // correct_options from server are option_ids -> keep as-is
          correctAnswers: (m.correct_options || []),
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
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
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
              course={course}
            />
          )}
        </div>

        <div className="p-6 bg-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {/* Preview accepts options as objects and accepts correctAnswers as option_ids */}
          <QuestionPreview formData={formData} />
        </div>
      </div>
    </div>
  );
}
