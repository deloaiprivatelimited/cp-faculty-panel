import React, { useState } from "react";
import { X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { privateAxios } from "../../utils/axios";
import { showError, showSuccess } from "../../utils/toast";

const EditSectionModal = ({ section = {}, onClose, onSave }) => {
  console.log("sectionsadas");
  console.log(section);
  const [formData, setFormData] = useState({
    name: section.name || "",
    description: section.description || "",
    instructions: section.instructions || "",
    duration: section.duration ?? 30,
    time_restricted: !!section.time_restricted,
    // new shuffle flags - initialize from section if present
    is_shuffle_question: !!section.is_shuffle_question,
    is_shuffle_options: !!section.is_shuffle_options,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        instructions: formData.instructions,
        time_restricted: !!formData.time_restricted,
        // include shuffle flags
        is_shuffle_question: !!formData.is_shuffle_question,
        is_shuffle_options: !!formData.is_shuffle_options,
      };

      // include duration only when time constrained (optional on backend)
      if (formData.time_restricted && Number.isFinite(formData.duration)) {
        payload.duration = formData.duration;
      } else if (!formData.time_restricted) {
        // If turning off time_restricted you might want to explicitly set duration=0
        // Uncomment if your API expects duration cleared:
        // payload.duration = 0;
      }

      const res = await privateAxios.put(
        `/tests/sections/${section.id || section._id}`,
        payload
      );
      const updated = res.data?.data || res.data;
      showSuccess("Section updated successfully");
      if (onSave) onSave(updated);
      onClose();
    } catch (err) {
      console.error("Update section failed", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update section";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : value,
    }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, instructions: content }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
              placeholder="Enter section name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
              placeholder="Short description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Instructions
            </label>
            <Editor
              apiKey="3dxds49mb3dhwomdifpyu32irh14nkmz9aj0kjq3s514ytkl"
              value={formData.instructions}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "advlist autolink lists link charmap preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime table paste help wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | " +
                  "bold italic underline | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | " +
                  "fullscreen | removeformat | help",
                toolbar_mode: "wrap",
              }}
              onEditorChange={handleEditorChange}
            />
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="time_restricted"
                checked={formData.time_restricted}
                onChange={handleChange}
                className="w-4 h-4 text-[#4CA466] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Time Constrained Section
              </span>
            </label>
          </div>

          {formData.time_restricted && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
              />
            </div>
          )}

          {/* Shuffle options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_shuffle_question"
                checked={formData.is_shuffle_question}
                onChange={handleChange}
                className="w-4 h-4 text-[#4CA466] border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Shuffle Questions
                </div>
                <div className="text-xs text-gray-500">
                  Randomize order of questions in this section.
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_shuffle_options"
                checked={formData.is_shuffle_options}
                onChange={handleChange}
                className="w-4 h-4 text-[#4CA466] border-gray-300 rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Shuffle Options
                </div>
                <div className="text-xs text-gray-500">
                  Randomize options for each question.
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#4CA466] text-white rounded-lg"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSectionModal;
