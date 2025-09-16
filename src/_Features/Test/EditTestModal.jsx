import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * EditTestModal
 *
 * Props:
 *  - test: object { id, test_name, description, instructions, start_datetime, end_datetime, duration_seconds?, duration_hms?, tags? }
 *  - onClose(): close modal
 *  - onUpdate(testId, payload): async function that updates the test and returns response
 *
 * Notes:
 *  - Duration is required and uses separate inputs for hours / minutes / seconds.
 *  - start_datetime / end_datetime are displayed in datetime-local inputs (local timezone).
 */

const EditTestModal = ({ test, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    notes: "",
    startDateTime: "",
    endDateTime: "",
    hours: 3,
    minutes: 0,
    seconds: 0,
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // helper: convert ISO datetime -> value suitable for <input type="datetime-local">
  const isoToDatetimeLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    // get local iso string then drop seconds and ms for nicer UX
    const tzOffset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - tzOffset).toISOString().slice(0, 19);
    // datetime-local expects "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
    return local.slice(0, 16); // drop :SS
  };

  // helper: convert seconds -> {h,m,s}
  const secondsToHMS = (secs) => {
    const s = Number(secs) || 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return { h, m, s: sec };
  };

  // helper: parse "HH:MM:SS" or "H:MM" etc -> seconds
  const parseHmsStringToSeconds = (hms) => {
    if (!hms) return 0;
    const parts = hms.split(":").map((p) => parseInt(p, 10) || 0);
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  };

  // Initialize form from `test` prop
  useEffect(() => {
    if (!test) return;
    const durationSeconds =
      test.duration_seconds ??
      (test.duration_hms ? parseHmsStringToSeconds(test.duration_hms) : undefined) ??
      3 * 3600;

    const { h, m, s } = secondsToHMS(durationSeconds);

    setFormData({
      name: test.test_name || "",
      description: test.description || "",
      notes: test.instructions || "",
      startDateTime: isoToDatetimeLocal(test.start_datetime),
      endDateTime: isoToDatetimeLocal(test.end_datetime),
      hours: h,
      minutes: m,
      seconds: s,
      tags: Array.isArray(test.tags) ? test.tags.join(", ") : (test.tags || ""),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // coerce numeric fields to integers (but allow empty)
    if (["hours", "minutes", "seconds"].includes(name)) {
      const cleaned = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
      setFormData((p) => ({ ...p, [name]: cleaned }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const formatHMS = (h, m, s) => {
    const hh = String(Number(h) || 0).padStart(2, "0");
    const mm = String(Number(m) || 0).padStart(2, "0");
    const ss = String(Number(s) || 0).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const totalSecondsFromForm = () => {
    const h = Number(formData.hours) || 0;
    const m = Number(formData.minutes) || 0;
    const s = Number(formData.seconds) || 0;
    return h * 3600 + m * 60 + s;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.startDateTime || !formData.endDateTime) {
      setErrorMsg("Please fill required fields (name, start and end).");
      return;
    }

    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    if (isNaN(start) || isNaN(end)) {
      setErrorMsg("Invalid start or end date/time.");
      return;
    }
    if (start >= end) {
      setErrorMsg("Start date/time must be earlier than end date/time.");
      return;
    }

    const totalSeconds = totalSecondsFromForm();
    if (totalSeconds <= 0) {
      setErrorMsg("Duration must be greater than zero.");
      return;
    }

    const durationStr = formatHMS(formData.hours, formData.minutes, formData.seconds);

    const payload = {
      test_name: formData.name,
      description: formData.description || undefined,
      start_datetime: formData.startDateTime,
      end_datetime: formData.endDateTime,
      instructions: formData.notes || undefined,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      duration: durationStr, // always send duration
    };

    try {
      setLoading(true);
      const result = await onUpdate(test.id, payload);
      const success = result?.success ?? result === true;
      if (success) {
        onClose();
      } else {
        setErrorMsg(result?.message || "Failed to update test. Try again.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Test</h2>
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

          {/* Duration (H M S) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  min="0"
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-[#4CA466]"
                  disabled={loading}
                />
                <span className="text-sm">h</span>
              </div>

              <div className="flex items-center gap-1">
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
                <span className="text-sm">m</span>
              </div>

              <div className="flex items-center gap-1">
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
                <span className="text-sm">s</span>
              </div>

              <div className="ml-3 text-sm text-gray-600">
                Preview: <strong>{formatHMS(formData.hours, formData.minutes, formData.seconds)}</strong>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Duration is required. Adjust hours/minutes/seconds.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent resize-none"
              placeholder="Enter test description"
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (instructions)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent resize-none"
              placeholder="Additional notes / instructions for students"
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTestModal;
