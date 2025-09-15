import React, { useState } from "react";
import { X } from "lucide-react";

const CreateTestModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "", // required
    notes: "", // required
    startDateTime: "",
    endDateTime: "",
    // duration defaults to 3 hours but is editable now
    hours: 3,
    minutes: 0,
    seconds: 0,
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateRequiredFields = () => {
    const { name, startDateTime, endDateTime, instructions, notes } = formData;
    if (!name || !startDateTime || !endDateTime) {
      return "Please fill required fields (name, start and end).";
    }
    if (!instructions || !instructions.trim()) {
      return "Please provide instructions (required).";
    }
    if (!notes || !notes.trim()) {
      return "Please provide notes (required).";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const validationErr = validateRequiredFields();
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    const { startDateTime, endDateTime, hours, minutes, seconds } = formData;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (isNaN(start) || isNaN(end)) {
      setErrorMsg("Invalid start or end date/time.");
      return;
    }
    if (start >= end) {
      setErrorMsg("Start date/time must be earlier than end date/time.");
      return;
    }

    // ensure numeric values
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;

    // duration must be > 0
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) {
      setErrorMsg("Duration must be greater than zero.");
      return;
    }

    // normalize HH:MM:SS string
    const hh = String(Math.floor(h)).padStart(2, "0");
    const mm = String(Math.floor(m)).padStart(2, "0");
    const ss = String(Math.floor(s)).padStart(2, "0");
    const durationStr = `${hh}:${mm}:${ss}`;

    const payload = {
      test_name: formData.name,
      description: formData.description || undefined,
      start_datetime: formData.startDateTime,
      end_datetime: formData.endDateTime,
      // send both instructions and notes separately
      instructions: formData.instructions,
      notes: formData.notes,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      duration: durationStr,
    };

    try {
      setLoading(true);
      const result = await onCreate(payload);
      const success = result?.success ?? result === true;
      if (success) {
        onClose();
      } else {
        setErrorMsg(result?.message || "Failed to create test. Try again.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Duration numeric handling with clamping for minutes/seconds
    if (name === "hours") {
      const num = Number(value);
      setFormData((prev) => ({ ...prev, hours: Number.isNaN(num) ? 0 : Math.max(0, Math.floor(num)) }));
      return;
    }
    if (name === "minutes") {
      let num = Number(value);
      if (Number.isNaN(num)) num = 0;
      num = Math.max(0, Math.min(59, Math.floor(num)));
      setFormData((prev) => ({ ...prev, minutes: num }));
      return;
    }
    if (name === "seconds") {
      let num = Number(value);
      if (Number.isNaN(num)) num = 0;
      num = Math.max(0, Math.min(59, Math.floor(num)));
      setFormData((prev) => ({ ...prev, seconds: num }));
      return;
    }

    // normal text inputs
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Test</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
              placeholder="Enter test name"
              required
              disabled={loading}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Duration (editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                min="0"
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466]"
                disabled={loading}
              />
              <span className="flex items-center">h</span>
              <input
                type="number"
                name="minutes"
                value={formData.minutes}
                onChange={handleChange}
                min="0"
                max="59"
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466]"
                disabled={loading}
              />
              <span className="flex items-center">m</span>
              <input
                type="number"
                name="seconds"
                value={formData.seconds}
                onChange={handleChange}
                min="0"
                max="59"
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466]"
                disabled={loading}
              />
              <span className="flex items-center">s</span>

              <span className="ml-3 text-sm text-gray-500">Default is 3h; you can edit it.</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Set how long the test should last (HH:MM:SS).</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent resize-none"
              placeholder="Enter test description (optional)"
              disabled={loading}
            />
          </div>

          {/* Instructions (required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions *</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent resize-none"
              placeholder="Detailed instructions for students (required)"
              required
              disabled={loading}
            />
          </div>

          {/* Notes (required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes *</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent resize-none"
              placeholder="Additional notes for students (required)"
              required
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
              placeholder="e.g. python, algorithms"
              disabled={loading}
            />
          </div>

          {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestModal;
