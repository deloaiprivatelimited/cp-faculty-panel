import React, { useState } from "react";
import { X, Clock, Calendar, FileText, Tag, BookOpen, StickyNote, Plus } from "lucide-react";

interface CreateTestModalProps {
  onClose: () => void;
  onCreate: (payload: any) => Promise<any>;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({ onClose, onCreate }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const formatHMS = (h: number | string, m: number | string, s: number | string) => {
    const hh = String(Number(h) || 0).padStart(2, "0");
    const mm = String(Number(m) || 0).padStart(2, "0");
    const ss = String(Number(s) || 0).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#4CA466]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Test</h2>
              <p className="text-sm text-gray-500">Set up a new assessment for your students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Test Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText size={16} className="text-[#4CA466]" />
                Test Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                placeholder="Enter test name"
                required
                disabled={loading}
              />
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Calendar size={18} className="text-[#4CA466]" />
                Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startDateTime"
                    value={formData.startDateTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endDateTime"
                    value={formData.endDateTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Duration Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Clock size={18} className="text-[#4CA466]" />
                Duration *
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="hours"
                      value={formData.hours}
                      onChange={handleChange}
                      min="0"
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-600">hours</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minutes"
                      value={formData.minutes}
                      onChange={handleChange}
                      min="0"
                      max="59"
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-600">minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="seconds"
                      value={formData.seconds}
                      onChange={handleChange}
                      min="0"
                      max="59"
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-gray-600">seconds</span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                    <Clock size={16} className="text-[#4CA466]" />
                    <span className="text-sm font-semibold text-gray-800">
                      {formatHMS(formData.hours, formData.minutes, formData.seconds)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Default is 3 hours. Duration must be greater than zero.</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] resize-none transition-all duration-200"
                placeholder="Enter test description (optional)"
                disabled={loading}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <BookOpen size={16} className="text-[#4CA466]" />
                Instructions *
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] resize-none transition-all duration-200"
                placeholder="Detailed instructions for students (required)"
                required
                disabled={loading}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <StickyNote size={16} className="text-[#4CA466]" />
                Notes *
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] resize-none transition-all duration-200"
                placeholder="Additional notes for students (required)"
                required
                disabled={loading}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag size={16} className="text-[#4CA466]" />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] transition-all duration-200"
                placeholder="e.g. python, algorithms, data structures"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 px-8 py-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#4CA466] text-white rounded-xl font-medium hover:bg-[#3d8a54] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              "Create Test"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTestModal;