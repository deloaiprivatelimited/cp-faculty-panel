import React from 'react';
import EditQuestionBuilder from './EditQuestionBuilder';

export default function EditQuestionModal({ open, onClose, id, course = false }) {
  if (!open) return null;

  // handle clicks on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel wrapper so we can position close outside */}
      <div className="relative z-30 w-[90vw] min-w-[80vw] h-[90vh] max-h-[90vh]">
        {/* Panel */}
        <div className="h-full w-full rounded-2xl bg-white shadow-2xl overflow-hidden relative">
          {/* Body: only EditQuestionBuilder lives here */}
          <div className="h-full overflow-auto">
            <EditQuestionBuilder id={id} course={course} />
          </div>
        </div>

        {/* Close Icon — outside the panel, top-right */}
        <button
          aria-label="Close edit modal"
          onClick={() => onClose?.()}
          className="absolute -top-4 -right-4 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <span className="text-lg font-medium text-gray-700">✕</span>
        </button>
      </div>
    </div>
  );
}
