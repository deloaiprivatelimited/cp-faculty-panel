import React, { useState } from "react";
import { X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
// import { privateAxios } from "../../utils/axios"; // adjust path
import { privateAxios } from "../../utils/axios";
import { showError,showSuccess } from "../../utils/toast";
const AddSectionModal = ({ testId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "", // HTML string
    duration: 30,
    isTimeConstrained: true,
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
        time_restricted: !!formData.isTimeConstrained,
        // you may want to store duration somewhere server-side if applicable
        // duration: formData.duration
      };

      const res = await privateAxios.post(`/tests/${testId}/sections`, payload);
      // backend returns section in res.data.data or similar depending on your response wrapper
      const created = res.data?.data || res.data;
      showSuccess("Section Added Succesfully")
      onClose();
    } catch (err) {
      console.error("Add section failed", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create section";
showError(msg)    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : parseInt(value, 10)) : value,
    }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, instructions: content }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Section</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Name *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Instructions</label>
            <Editor
              apiKey="3dxds49mb3dhwomdifpyu32irh14nkmz9aj0kjq3s514ytkl"
              value={formData.instructions}
              init={{
                height: 350,
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
                name="isTimeConstrained"
                checked={formData.isTimeConstrained}
                onChange={handleChange}
                className="w-4 h-4 text-[#4CA466] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Time Constrained Section</span>
            </label>
          </div>

          {formData.isTimeConstrained && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
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

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54]"
            >
              {loading ? "Adding..." : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSectionModal;
