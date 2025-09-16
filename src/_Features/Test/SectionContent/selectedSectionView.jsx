// SelectedSectionView.jsx
import React, { useState, useEffect, useCallback } from "react";
import MCQPopp from "../Questions/MCQ/AddQuestion/AddMCQPopUp";
import { privateAxios } from "../../../utils/axios";
import { showError } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";

const MCQPreviewPopup = ({ mcq, onClose }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (mcq) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [mcq, onClose]);

  if (!mcq) return null;

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent event propagation on modal content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      style={{ margin: 0, padding: '1rem' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{mcq.title || "MCQ Preview"}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" 
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-700 mb-4">{mcq.question_text}</p>

          <div className="space-y-3">
            {(mcq.options || []).map((o) => (
              <div key={o.option_id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {o.option_id ? o.option_id.slice(0,1).toUpperCase() : "O"}
                </div>
                <div className="flex-1 text-gray-800">{o.value}</div>
                {(mcq.correct_options || []).includes(o.option_id) && (
                  <div className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                    ✓ Correct
                  </div>
                )}
              </div>
            ))}
          </div>

          {mcq.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <strong className="text-blue-900">Explanation:</strong>
              <div className="mt-2 text-blue-800">{mcq.explanation}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const MCQCard = ({ mcq, onPreview, onEdit, onDelete, deleting }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{mcq.title || "Untitled"}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{mcq.question_text}</p>
          <div className="mt-2 text-xs text-gray-500">
            {mcq.difficulty_level && <span className="bg-gray-100 px-2 py-1 rounded">{mcq.difficulty_level}</span>}
            {mcq.marks != null && <span className="ml-2">{mcq.marks} marks</span>}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => onPreview(mcq)}
              className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              type="button"
            >
              Preview
            </button>
            <button
              onClick={() => onEdit(mcq)}
              className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              type="button"
            >
              Edit
            </button>
          </div>
          <button
            onClick={() => onDelete(mcq)}
            disabled={deleting}
            className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Options preview */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(mcq.options || []).slice(0, 4).map((o) => (
          <div key={o.option_id} className="text-xs p-2 border border-gray-200 rounded bg-gray-50">
            <div className="truncate">{o.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SelectedSectionView = ({ section }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMCQ, setPreviewMCQ] = useState(null);
  const [deletingMap, setDeletingMap] = useState({});
  const navigate = useNavigate();

  const fetchQuestions = useCallback(async () => {
    if (!section || !(section.id || section._id)) {
      setQuestions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sid = section.id || section._id;
      const resp = await privateAxios.get(`/tests/sections/${sid}/questions`);
      const data = resp?.data?.data || resp?.data;
      const qs = data?.questions || [];
      const mcqs = qs
        .filter((q) => q.type === "mcq" && q.question)
        .map((q) => q.question);
      setQuestions(mcqs);
    } catch (err) {
      console.error("Failed to fetch section questions:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch questions";
      setError(msg);
      if (typeof showError === "function") showError(msg);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (!section) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">Select a section to view details</p>
        </div>
      </div>
    );
  }

  const handleMCQAdd = async (questionIds = []) => {
    if (!Array.isArray(questionIds) || questionIds.length === 0) return;

    setLoadingAdd(true);
    try {
      const sid = section.id || section._id;
      const url = `/tests/sections/${sid}/select-mcqs`;
      const payload = { question_ids: questionIds };

      const resp = await privateAxios.post(url, payload);
      alert("Questions added to section successfully.");
      setIsPopupOpen(false);
      console.log("Select MCQs response:", resp?.data);
      await fetchQuestions();
    } catch (err) {
      console.error("Failed to add MCQs to section:", err);
      const backendMessage = err?.response?.data?.message || err?.message || "Failed to add questions";
      if (typeof showError === "function") showError(backendMessage);
      else alert(`Error: ${backendMessage}`);
    } finally {
      setLoadingAdd(false);
    }
  };

  const handlePreview = (mcq) => {
    setPreviewMCQ(mcq);
  };

  const handleEdit = (mcq) => {
    const qid = mcq.id || mcq._id;
    navigate(`/tests/mcq/${qid}/edit`);
  };

  const handleDelete = async (mcq) => {
    const qid = mcq.id || mcq._id;
    if (!qid) {
      showError?.("Invalid question id");
      return;
    }

    if (!window.confirm("Delete this question from section? This will remove the duplicated test-question.")) return;

    setDeletingMap((m) => ({ ...m, [qid]: true }));

    try {
      const sid = section.id || section._id;
      await privateAxios.delete(`/tests/sections/${sid}/questions/${qid}`);
      setQuestions((prev) => prev.filter((x) => (x.id || x._id) !== qid));
    } catch (err) {
      console.error("Failed to delete question:", err);
      const backendMessage = err?.response?.data?.message || err?.message || "Failed to delete question";
      if (typeof showError === "function") showError(backendMessage);
      else alert(`Error: ${backendMessage}`);
    } finally {
      setDeletingMap((m) => {
        const copy = { ...m };
        delete copy[qid];
        return copy;
      });
    }
  };

  return (
    <div className="p-6 min-h-0">
      {/* Header section - not fixed */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {section.name || "Untitled Section"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">ID: {section.id || section._id}</p>
        </div>
        
        <button
          onClick={() => setIsPopupOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4CA466] text-white text-sm hover:bg-[#3d8a54] transition-colors"
          type="button"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
          </svg>
          Add MCQ
        </button>
      </div>

      {/* Content area */}
      <div className="min-h-0">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CA466] mb-4"></div>
            <div>Loading questions...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <div className="text-4xl mb-4">⚠️</div>
            <div>Error: {error}</div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <div>No MCQs in this section yet.</div>
            <div className="text-sm mt-2">Click "Add MCQ" to get started.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {questions.map((mcq) => (
              <MCQCard
                key={mcq.id || mcq._id}
                mcq={mcq}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={!!deletingMap[mcq.id || mcq._id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Conditionally render popups */}
      {isPopupOpen && (
        <MCQPopp
          isPopupOpen={isPopupOpen}
          setIsPopupOpen={setIsPopupOpen}
          handleMCQAdd={handleMCQAdd}
          adding={loadingAdd}
        />
      )}

      {previewMCQ && (
        <MCQPreviewPopup 
          mcq={previewMCQ} 
          onClose={() => setPreviewMCQ(null)} 
        />
      )}
    </div>
  );
};

export default SelectedSectionView;