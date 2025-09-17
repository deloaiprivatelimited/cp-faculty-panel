// RearrangeBuilder.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "katex/dist/katex.min.css";
import { Loader2 } from "lucide-react";

import AddRearrangeForm from "./AddRearrangeForm";
import RearrangePreview from "./RearrangePreview";

const RearrangeBuilder = ({unitID}) => {
  const navigate = useNavigate();

  const defaultFormData = {
        unitId: unitID || null, // 👈 include here

    title: "",
    topic: "",
    subtopic: "",
    prompt: "",

    // image arrays
    questionImages: [],      // [{ image_id, label, url, alt_text, metadata }]
    explanationImages: [],   // same structure

    // items: you may keep simple strings; AddRearrangeForm normalizes to objects
    items: ["", ""],             // start with 2 for convenience
    correctOrderIndexes: [],     // indexes into `items` representing correct order

    isDragAndDrop: true,
    marks: "1",
    negativeMarks: "0",
    difficulty: "Easy",
    explanation: "",
    tags: "",
    timeLimit: "60",
    timeUnit: "seconds",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [isFrozen, setIsFrozen] = useState(false);

  // Reset handler
  const handleReset = () => {
    setFormData(defaultFormData);
  };

  // Save ref pattern (keeps parity with your MCQ builder)
  let saveRef = null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back
            </button>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">Add New Rearrange</h1>
          </div>

          {/* Action Buttons in header */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={() => saveRef && saveRef()}
              className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] shadow"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Two-pane layout below the header */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Form Pane */}
        <div
          className="p-6 bg-gray-50 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px)" }}
        >
          <AddRearrangeForm
            formData={formData}
            setFormData={setFormData}
            setSaveRef={(fn) => (saveRef = fn)}
            onSavingChange={(val) => setIsFrozen(val)}
            onSaveSuccess={() => {
              // reset only after successful save
              setFormData(defaultFormData);
              setIsFrozen(false);
            }}
          />
        </div>

        {/* Preview Pane */}
        <div
          className="p-6 bg-gray-100 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px)" }}
        >
          <RearrangePreview formData={formData} />
        </div>
      </div>

      {/* Full-page freeze overlay (same UX as MCQ builder) */}
      {isFrozen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-3 bg-white/5 p-6 rounded-lg">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <div className="text-white font-medium">Saving... Please wait</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RearrangeBuilder;
