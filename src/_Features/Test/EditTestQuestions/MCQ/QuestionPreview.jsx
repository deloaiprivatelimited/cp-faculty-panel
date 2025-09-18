import React from 'react';
import MarkdownRenderer from '../../../../utils/MarkDownRender';
import "katex/dist/katex.min.css";

// Focused, polished QuestionPreview component
// - Clean layout
// - Topic & Subtopic displayed prominently
// - Improved option cards, accessibility and responsive behavior
// - Compact metadata row and image thumbnails

const Pill = ({ children, tone = 'default' }) => {
  const base = 'px-3 py-1 rounded-full text-sm font-medium';
  const toneMap = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-[#E6F6ED] text-[#177A3A]',
    warn: 'bg-[#FFF7E6] text-[#A36B00]',
    danger: 'bg-[#FBEFF1] text-[#9B1E3A]',
  };
  return <span className={`${base} ${toneMap[tone] || toneMap.default}`}>{children}</span>;
};

const ImageThumb = ({ img, idx }) => (
  <figure className="w-36 border rounded p-2 flex flex-col items-start bg-white shadow-sm" aria-hidden>
    <img src={img.url} alt={img.alt_text || img.label || `image-${idx}`} className="w-32 h-20 object-contain rounded" />
    <figcaption className="w-full mt-2 text-xs text-gray-700 truncate">{img.label || <span className="text-gray-400">No label</span>}</figcaption>
    {img.metadata?.size ? <div className="text-xs text-gray-500 mt-1">{Math.round(img.metadata.size/1024)} KB</div> : null}
  </figure>
);

const SmallMeta = ({ children }) => (
  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">{children}</span>
);

const normalizeOptions = (options = []) =>
  (options || []).map((opt, idx) =>
    typeof opt === 'string' ? { option_id: null, value: opt, images: [] } : { option_id: opt.option_id || null, value: opt.value || '', images: opt.images || [] }
  );

const QuestionPreview = ({ formData = {} }) => {
  const {
    title = '',
    topic = '',
    subtopic = '',
    questionText = '',
    questionImages = [],
    options = [],
    correctAnswers = [],
    isMultipleCorrect = false,
    marks = '0',
    negativeMarks = '0',
    difficulty = 'Easy',
    explanation = '',
    explanationImages = [],
    tags = '',
    timeLimit = '',
    timeUnit = '',
  } = formData;
console.log(formData.options)
  const tagsArray = (tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const normalized = normalizeOptions(options);
  const correctAreIds = correctAnswers.length > 0 && typeof correctAnswers[0] === 'string';

  const isOptionCorrect = (opt, idx) => {
    if (correctAreIds) return opt.option_id && correctAnswers.includes(opt.option_id);
    return correctAnswers.includes(idx);
  };

  const renderImageGrid = (imgs = []) => {
    if (!imgs?.length) return null;
    return (
      <div className="flex flex-wrap gap-3 mt-3" role="list">
        {imgs.map((img, i) => (
          <div role="listitem" key={img.image_id || i}>
            <ImageThumb img={img} idx={i} />
          </div>
        ))}
      </div>
    );
  };

  const renderTime = () => {
    if (!timeLimit) return null;
    return timeUnit ? `${timeLimit} ${timeUnit}` : `${timeLimit} sec`;
  };

  return (
    <section className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Live Preview</h2>
          <p className="text-sm text-gray-500">This preview reflects what learners will see.</p>
        </div>
        <div className="flex items-center gap-2">
          <SmallMeta>{difficulty}</SmallMeta>
        </div>
      </header>

      <article className="bg-white rounded-2xl shadow-sm p-5">
        {/* Topic / Subtopic */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {topic ? <Pill tone="warn">{topic}</Pill> : <SmallMeta>Topic: —</SmallMeta>}
            {subtopic ? <Pill tone="success">{subtopic}</Pill> : <SmallMeta>Subtopic: —</SmallMeta>}
          </div>

          <div className="flex items-center gap-2">
            <SmallMeta>Marks: {marks}</SmallMeta>
            {Number(negativeMarks) > 0 && <SmallMeta>-{negativeMarks}</SmallMeta>}
            {timeLimit && <SmallMeta>⏱ {renderTime()}</SmallMeta>}
            <SmallMeta>{isMultipleCorrect ? 'Multiple correct' : 'Single correct'}</SmallMeta>
          </div>
        </div>

        {/* Title & Question */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2"><MarkdownRenderer text={title || 'Question Title'} /></h3>

          <div className="prose max-w-none text-gray-700">
            {questionText ? <MarkdownRenderer text={questionText} /> : <p className="text-gray-400">Your question text will appear here...</p>}
          </div>

          {renderImageGrid(questionImages)}
        </div>

        {/* Tags */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {tagsArray.length > 0 ? tagsArray.map((t, i) => (
            <span key={i} className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium">{t}</span>
          )) : <span className="text-sm text-gray-400">No tags</span>}
        </div>

        {/* Options */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Answer Options</h4>
            <span className="text-sm text-gray-500">{isMultipleCorrect ? 'Multiple allowed' : 'Single only'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {normalized.map((opt, idx) => {
              const correct = isOptionCorrect(opt, idx);
              return (
                <div key={opt.option_id || idx} className={`p-3 rounded-lg ${correct ? 'ring-2 ring-[#4CA466]/40 bg-[#F4FBF6]' : 'bg-gray-50'} shadow-sm`} aria-live={correct ? 'polite' : 'off'}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border flex items-center justify-center font-semibold text-gray-700">{String.fromCharCode(65 + idx)}</div>
                    <div className="flex-1 text-gray-800"><MarkdownRenderer text={opt.value || `Option ${idx + 1}`} /></div>
                    {correct && <span className="text-[#177A3A] text-sm font-medium">✓ Correct</span>}
                  </div>

                  {opt.images && opt.images.length > 0 && (
                    <div className="mt-3 flex gap-3 flex-wrap">{opt.images.map((img, i) => <ImageThumb img={img} idx={i} key={img.image_id || i} />)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {(explanation || (explanationImages && explanationImages.length > 0)) && (
          <div className="mt-5 p-4 bg-blue-50 rounded-lg">
            {explanation ? <h4 className="font-medium text-blue-800 mb-2">Explanation</h4> : null}
            {explanation ? 
    <div className="prose max-w-none text-gray-700 whitespace-pre-line">
      <MarkdownRenderer text={explanation} />
    </div>
             : null}
            {renderImageGrid(explanationImages)}
          </div>
        )}
      </article>
    </section>
  );
};

export default QuestionPreview;
