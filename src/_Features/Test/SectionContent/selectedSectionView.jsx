






// SelectedSectionView.jsx
import React, { useState, useEffect, useCallback } from "react";
import MCQPopp from "../Questions/MCQ/AddQuestion/AddMCQPopUp";
import { privateAxios } from "../../../utils/axios";
import { showError } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";

const MCQPreviewPopup = ({ mcq, onClose }) => {
  if (!mcq) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{mcq.title || "MCQ Preview"}</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-3">{mcq.question_text}</p>

          <div className="space-y-2">
            {(mcq.options || []).map((o) => (
              <div key={o.option_id} className="flex items-center gap-3">
                <div className="w-6 text-sm font-medium">{o.option_id ? o.option_id.slice(0,4) : "o"}</div>
                <div className="flex-1 text-gray-800">{o.value}</div>
                { (mcq.correct_options || []).includes(o.option_id) && (
                  <div className="text-sm text-green-600 font-semibold">Correct</div>
                )}
              </div>
            ))}
          </div>

          {mcq.explanation && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Explanation:</strong>
              <div>{mcq.explanation}</div>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-1 rounded-md border">Close</button>
        </div>
      </div>
    </div>
  );
};

const MCQCard = ({ mcq, onPreview, onEdit, onDelete, deleting }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{mcq.title || "Untitled"}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{mcq.question_text}</p>
          <div className="mt-2 text-xs text-gray-500">
            {mcq.difficulty_level ? `${mcq.difficulty_level} • ` : ""}
            {mcq.marks != null ? `${mcq.marks} marks` : ""}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onPreview(mcq)}
              className="px-2 py-1 text-sm rounded-md border hover:bg-gray-50"
            >
              Preview
            </button>
            <button
              onClick={() => onEdit(mcq)}
              className="px-2 py-1 text-sm rounded-md border hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
          <div>
            <button
              onClick={() => onDelete(mcq)}
              disabled={deleting}
              className="px-3 py-1 text-sm rounded-md bg-red-600 text-white disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Options preview */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(mcq.options || []).slice(0,4).map((o) => (
          <div key={o.option_id} className="text-sm p-2 border rounded">
            {o.value}
          </div>
        ))}
      </div>
    </div>
  );
};

const SelectedSectionView = ({ section }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [questions, setQuestions] = useState([]); // full list from backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMCQ, setPreviewMCQ] = useState(null);
  const [deletingMap, setDeletingMap] = useState({}); // questionId -> boolean
  const navigate = useNavigate();

  // build the GET URL — matches backend route created earlier:
  // GET /tests/sections/<section_id>/questions
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
      // response format from backend: response(True, message, data) where data.questions = [...]
      const data = resp?.data?.data || resp?.data;
      const qs = data?.questions || [];
      // filter only mcq types
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

  // handler passed into MCQPopp - refresh list after add
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
      // refresh
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
    // navigate to your edit screen — adjust route as your app expects
    // Here we navigate to a path that includes section and question id
    const qid = mcq.id || mcq._id;
    navigate(`/tests/mcq/${qid}/edit`);
  };

  const handleDelete = async (mcq) => {
    const qid = mcq.id || mcq._id;
    if (!qid) {
      showError?.("Invalid question id");
      return;
    }

    // confirm optionally (you can replace with nicer modal)
    if (!window.confirm("Delete this question from section? This will remove the duplicated test-question.")) return;

    // set deleting state
    setDeletingMap((m) => ({ ...m, [qid]: true }));

    try {
      // backend endpoint — implement on server if not present:
      // DELETE /tests/sections/<section_id>/questions/<question_id>
      const sid = section.id || section._id;
      await privateAxios.delete(`/tests/sections/${sid}/questions/${qid}`);

      // remove from UI
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
    <div className="p-6 relative min-h-[300px]">
      {/* Top-right Add MCQ button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#4CA466] text-white text-sm hover:brightness-95 transition"
          aria-label="Add MCQ"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
          </svg>
          Add MCQ
        </button>
      </div>

      {/* Section title + id (minimal) */}
      <h2 className="text-xl font-semibold text-gray-900">
        {section.name || "Untitled Section"}
      </h2>
      <p className="text-sm text-gray-600 mt-2">ID: {section.id || section._id}</p>

      {/* list / grid of MCQs */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading questions...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No MCQs in this section yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* MCQ popup component (controlled). Passing handleMCQAdd */}
      <MCQPopp
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        handleMCQAdd={handleMCQAdd}
        adding={loadingAdd}
      />

      {/* preview popup */}
      {previewMCQ && (
        <MCQPreviewPopup mcq={previewMCQ} onClose={() => setPreviewMCQ(null)} />
      )}
    </div>
  );
};

export default SelectedSectionView;
