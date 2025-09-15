import React from "react";
import "katex/dist/katex.min.css";
import MarkdownRenderer from "../../../../utils/MarkDownRender";

/* Small utility components reused from your QuestionPreview style */
const Pill = ({ children, tone = "default" }) => {
  const base = "px-3 py-1 rounded-full text-sm font-medium";
  const toneMap = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-[#E6F6ED] text-[#177A3A]",
    warn: "bg-[#FFF7E6] text-[#A36B00]",
    danger: "bg-[#FBEFF1] text-[#9B1E3A]",
  };
  return <span className={`${base} ${toneMap[tone] || toneMap.default}`}>{children}</span>;
};

const SmallMeta = ({ children }) => (
  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">{children}</span>
);

const normalizeText = (content, fallback = "") => {
  if (content == null) return fallback;
  if (typeof content === "string") return content;
  if (typeof content === "object") return content.value ?? fallback;
  return String(content);
};

const ImageThumb = ({ img, idx }) => {
  if (!img || !img.url) return null;
  return (
    <figure
      className="w-36 border rounded p-2 flex flex-col items-start bg-white shadow-sm"
      role="group"
      aria-label={img.label || img.alt_text || `image-${idx}`}
    >
      <img
        src={img.url}
        alt={img.alt_text || img.label || `image-${idx}`}
        className="w-32 h-20 object-contain rounded"
      />
      <figcaption className="w-full mt-2 text-xs text-gray-700 truncate">{img.label || <span className="text-gray-400">No label</span>}</figcaption>
      {img.metadata?.size ? <div className="text-xs text-gray-500 mt-1">{Math.round(img.metadata.size / 1024)} KB</div> : null}
    </figure>
  );
};

/* Main RearrangePreview */
const RearrangePreview = ({ formData = {} }) => {
  const {
    title = "",
    topic = "",
    subtopic = "",
    prompt = "",
    items = [],
    correctOrderIndexes = [],
    questionImages = [],
    explanation = "",
    explanationImages = [],
    tags = "",
    difficulty = "Easy",
    marks = 0,
    negativeMarks = 0,
    timeLimit = "",
    timeUnit = "",
    isDragAndDrop = false,
  } = formData;

  const tagsArray = (tags || "").split(",").map(t => t.trim()).filter(Boolean);

  const correctAreIds = correctOrderIndexes.length > 0 && typeof correctOrderIndexes[0] === "string";
  const getItemValue = (it) => normalizeText(it?.value ?? it, "Untitled item");

  const correctOrderValues = (correctOrderIndexes || []).map((idx) => {
    if (correctAreIds) {
      // If indexes are ids, try to find by item_id
      const found = items.find(i => i.item_id === idx);
      return found ? getItemValue(found) : `Item (${idx})`;
    }
    const i = Number(idx);
    const it = items[i];
    return it ? getItemValue(it) : `Item ${i + 1}`;
  });

  const renderImageGrid = (imgs = []) => {
    if (!imgs?.length) return null;
    return (
      <div className="flex flex-wrap gap-3 mt-3" role="list" aria-hidden={imgs.length === 0}>
        {imgs.map((img, i) => (
          <div role="listitem" key={img.image_id || img.url || i}>
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
          <p className="text-sm text-gray-500">This shows learners how the rearrange activity will look.</p>
        </div>

        <div className="flex items-center gap-2">
          <SmallMeta>{difficulty}</SmallMeta>
        </div>
      </header>

      <article className="bg-white rounded-2xl shadow-sm p-5">
        {/* Top row: topic/subtopic & compact metadata */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {topic ? <Pill tone="warn">{topic}</Pill> : <SmallMeta>Topic: —</SmallMeta>}
            {subtopic ? <Pill tone="success">{subtopic}</Pill> : <SmallMeta>Subtopic: —</SmallMeta>}
          </div>

          <div className="flex items-center gap-2">
            <SmallMeta>Marks: {marks}</SmallMeta>
            {Number(negativeMarks) > 0 && <SmallMeta>-{negativeMarks}</SmallMeta>}
            {timeLimit && <SmallMeta>⏱ {renderTime()}</SmallMeta>}
            <SmallMeta>{isDragAndDrop ? "Drag & Drop" : "List Mode"}</SmallMeta>
          </div>
        </div>

        {/* Title & prompt */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            <MarkdownRenderer text={normalizeText(title || "Rearrange Title")} />
          </h3>

          <div className="prose max-w-none text-gray-700">
            {prompt ? <MarkdownRenderer text={normalizeText(prompt)} /> : <p className="text-gray-400">Prompt / instructions will appear here...</p>}
          </div>

          {renderImageGrid(questionImages)}
        </div>

        {/* Tags */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {tagsArray.length > 0 ? tagsArray.map((t, i) => (
            <span key={i} className="px-3 py-1 bg-[#4CA466]/10 text-[#4CA466] rounded-full text-sm font-medium">{t}</span>
          )) : <span className="text-sm text-gray-400">No tags</span>}
        </div>

        {/* Items list (current order) */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Items (Current order)</h4>
            <span className="text-sm text-gray-500">{items.length} items</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((it, idx) => (
              <div key={it.item_id ?? idx} className="p-3 rounded-lg bg-gray-50 shadow-sm" aria-label={`item-${idx + 1}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border flex items-center justify-center font-semibold text-gray-700">
                    {idx + 1}
                  </div>

                  <div className="flex-1 text-gray-800">
                    <div>
                      <MarkdownRenderer text={normalizeText(it.value ?? it, `Item ${idx + 1}`)} />
                    </div>

                    {((it.images || []).length > 0) && (
                      <div className="mt-3 flex gap-3 flex-wrap" aria-hidden>
                        {(it.images || []).map((img, i) => <ImageThumb key={img.image_id || img.url || i} img={img} idx={i} />)}
                      </div>
                    )}
                  </div>

                  {/* If this item is included in the correct order, show a small badge */}
                  {correctOrderIndexes && correctOrderIndexes.includes(correctAreIds ? it.item_id : idx) ? (
                    <div className="ml-3 text-sm font-medium text-[#177A3A] flex items-center">✓ In answer</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correct order display */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Correct Order</h4>
            <span className="text-sm text-gray-500">{correctOrderIndexes?.length ? `${correctOrderIndexes.length} positions` : "Not set"}</span>
          </div>

          {(!correctOrderIndexes || correctOrderIndexes.length === 0) ? (
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800">No correct order set. Use "Capture" or "Edit" to define it.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {correctOrderValues.map((val, i) => (
                <div key={i} className="inline-flex items-center px-3 py-1 rounded-full border bg-white text-sm">
                  <span className="mr-2 font-semibold">{i + 1}.</span>
                  <MarkdownRenderer text={String(val)} useTerminalForCode={false} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explanation section */}
        {(explanation || (explanationImages || []).length > 0) && (
          <div className="mt-5 p-4 bg-blue-50 rounded-lg">
            {explanation ? <h4 className="font-medium text-blue-800 mb-2">Explanation</h4> : null}
            {explanation ? (
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                <MarkdownRenderer text={normalizeText(explanation)} />
              </div>
            ) : null}

            {renderImageGrid(explanationImages)}
          </div>
        )}
      </article>
    </section>
  );
};

export default RearrangePreview;
