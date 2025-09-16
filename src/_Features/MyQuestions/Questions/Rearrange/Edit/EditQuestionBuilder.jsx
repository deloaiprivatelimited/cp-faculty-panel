// src/pages/rearrange/EditRearrangeBuilder.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { privateAxios } from "../../../../../utils/axios";
import EditRearrangeForm from "./EditQuestionForm"; // or correct path to your EditRearrangeForm
import RearrangePreview from "../RearrangePreview";
import { showError } from "../../../../../utils/toast";

export default function EditRearrangeBuilder({ id: propId ,course=false }) {
  const navigate = useNavigate();
 const params = useParams();
  // prefer propId if provided, otherwise use route param
  const id = propId ?? params?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef(null);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    topic: "",
    subtopic: "",
    prompt: "",
    // items: array of { item_id, value, images: [] }
    items: [],
    // correctOrderIndexes: array of indexes into items (0-based)
    correctOrderIndexes: [],
    // optional stable ids of correct order (kept in sync by form)
    correctOrderIds: [],
    // images
    questionImages: [],       // [{ image_id, url, label, alt_text, metadata }]
    explanationImages: [],    // same shape
    isDragAndDrop: true,
    marks: "1",
    negativeMarks: "0",
    difficulty: "Easy",
    explanation: "",
    tags: "",
    timeLimit: "60",
    timeUnit: "seconds",
  });

  // fetch rearrange by id
  useEffect(() => {
    (async () => {
      try {
        const res = await privateAxios.get(`/college-rearranges/${id}`);
        if (!res.data?.success) throw new Error(res.data?.message || "Failed to fetch rearrange");
        const r = res.data.data; // backend to_json()

        // Build items as objects with images preserved:
        // backend `r.items` is expected to be [{ item_id, value, images: [...] }]
        const items = (r.items || []).map(it => ({
          item_id: it.item_id,
          value: it.value,
          images: (it.images || []).map(img => ({
            image_id: img.image_id,
            url: img.url,
            label: img.label || "",
            alt_text: img.alt_text || "",
            metadata: img.metadata || {}
          }))
        }));

        // backend returns correct_order as list of item_ids (strings)
        const correctIds = r.correct_order || [];

        // convert correct_order item_ids -> indexes into items array
        const idToIndex = {};
        items.forEach((it, idx) => {
          if (it.item_id) idToIndex[it.item_id] = idx;
        });
        const correctIdxs = correctIds.map(cid => (idToIndex[cid] !== undefined ? idToIndex[cid] : -1)).filter(i => i >= 0);

        // convert time_limit seconds -> best unit for editing
        const seconds = Number(r.time_limit ?? 60);
        let unit = "seconds";
        let amount = seconds;
        if (seconds % 3600 === 0) {
          unit = "hours";
          amount = seconds / 3600;
        } else if (seconds % 60 === 0) {
          unit = "minutes";
          amount = seconds / 60;
        }

        // map top-level images (question/explanation)
        const questionImages = (r.question_images || []).map(img => ({
          image_id: img.image_id,
          url: img.url,
          label: img.label || "",
          alt_text: img.alt_text || "",
          metadata: img.metadata || {}
        }));
        const explanationImages = (r.explanation_images || []).map(img => ({
          image_id: img.image_id,
          url: img.url,
          label: img.label || "",
          alt_text: img.alt_text || "",
          metadata: img.metadata || {}
        }));

        setFormData({
          id: r.id || id,
          title: r.title || "",
          topic: r.topic || "",
          subtopic: r.subtopic || "",
          prompt: r.prompt || "",
          items,
          correctOrderIndexes: correctIdxs,
          correctOrderIds: correctIds,
          questionImages,
          explanationImages,
          isDragAndDrop: !!r.is_drag_and_drop,
          marks: String(r.marks ?? "1"),
          negativeMarks: String(r.negative_marks ?? "0"),
          difficulty: r.difficulty_level || "Easy",
          explanation: r.explanation || "",
          tags: (r.tags || []).join(","),
          timeLimit: String(amount),
          timeUnit: unit,
        });
      } catch (e) {
        console.error(e);
        showError(e.message || "Could not load rearrange question");
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
              onClick={() => navigate("/questions/rearrange")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back
            </button>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">Edit Rearrange</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => saveRef.current && saveRef.current()}
              disabled={saving}
              className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] shadow disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 bg-gray-50 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
          {!loading && (
            <EditRearrangeForm
              formData={formData}
              setFormData={setFormData}
              setSaveRef={(fn) => (saveRef.current = fn)}
              setSaving={setSaving}
            />
          )}
          {loading && <div className="p-6 text-sm text-gray-600">Loading rearrange…</div>}
        </div>

        <div className="p-6 bg-gray-100 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }}>
          {/* Preview expects items array and correctOrderIndexes — pass them directly */}
          <RearrangePreview formData={formData} course={course} />
        </div>
      </div>
    </div>
  );
}
