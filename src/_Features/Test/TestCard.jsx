import React from "react";
import { Calendar, Clock, FileText, Users ,Edit} from "lucide-react";

/**
 * TestCard
 *
 * Props:
 *  - test: object (may include start_datetime, end_datetime, duration_seconds,
 *          duration_hms, total_sections, sections, sections_time_restricted, sections_open)
 *  - assignedStudentCount: number
 *  - onClick: function
 *
 * Behavior:
 *  - Shows separate start date/time and end date/time (Asia/Kolkata)
 *  - Shows duration (prefers duration_seconds from backend; falls back to end-start)
 *  - Shows number of sections (prefer total_sections, else sum of time_restricted/open, else sections.length)
 */
const TestCard = ({ test = {}, assignedStudentCount = 0, onClick,onEdit }) => {
  // safe destructuring with sensible defaults
  const {
    id = "",
    test_name = "Untitled Test",
    description = "No description provided",
    notes = "",
    start_datetime,
    end_datetime,
    status: providedStatus = null,
    sections = [],
    total_sections = null, // backend may send this
    sections_time_restricted = null,
    sections_open = null,
    duration_seconds: backend_duration_seconds = null,
  } = test;

  // trim stray whitespace in test name
  const title = (test_name || "").toString().trim();

  // helper to format date/time in Asia/Kolkata
  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: "N/A", time: "N/A", iso: null, epoch: null };
    const date = new Date(dateTime);
    const optionsDate = { year: "numeric", month: "short", day: "2-digit", timeZone: "Asia/Kolkata" };
    const optionsTime = { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata", hour12: false };
    return {
      date: date.toLocaleDateString("en-GB", optionsDate),
      time: date.toLocaleTimeString("en-GB", optionsTime),
      iso: date.toISOString(),
      epoch: date.getTime(),
    };
  };

  const startFormatted = formatDateTime(start_datetime);
  const endFormatted = formatDateTime(end_datetime);

  // compute derived status if backend didn't provide one
  const now = Date.now();
  let status = providedStatus;
  if (!status) {
    if (startFormatted.epoch && endFormatted.epoch) {
      if (now < startFormatted.epoch) status = "upcoming";
      else if (now >= startFormatted.epoch && now <= endFormatted.epoch) status = "ongoing";
      else status = "past";
    } else {
      status = "unknown";
    }
  }

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    past: "bg-gray-100 text-gray-800",
    unknown: "bg-yellow-100 text-yellow-800",
  };

  // sections count: prefer explicit total_sections, then sum of time_restricted/open if present, then sections.length
  const sectionsCount = (() => {
    if (Number.isFinite(total_sections) && total_sections !== null) return total_sections;
    const trCount = Array.isArray(sections_time_restricted) ? sections_time_restricted.length
                   : typeof sections_time_restricted === "number" ? sections_time_restricted : 0;
    const openCount = Array.isArray(sections_open) ? sections_open.length
                   : typeof sections_open === "number" ? sections_open : 0;
    if (trCount || openCount) return trCount + openCount;
    if (Array.isArray(sections)) return sections.length;
    // fallback to 0
    return 0;
  })();

  // compute duration to display:
  // - prefer backend_duration_seconds (explicit from frontend)
  // - else, if start & end available and end > start, compute derived value (for display only)
  const derivedDurationSeconds = (startFormatted.epoch && endFormatted.epoch && endFormatted.epoch > startFormatted.epoch)
    ? Math.round((endFormatted.epoch - startFormatted.epoch) / 1000)
    : null;

  const durationSeconds = (backend_duration_seconds != null) ? Number(backend_duration_seconds) : derivedDurationSeconds;

  const humanizeDuration = (seconds) => {
    if (seconds == null || Number.isNaN(seconds)) return "—";
    const s = Math.max(0, Math.round(Number(seconds)));
    if (s < 60) return `${s} sec`;
    const mins = Math.floor(s / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return minutes === 0 ? `${hours} hr${hours > 1 ? "s" : ""}` : `${hours} hr ${minutes} min`;
  };

  const durationReadable = humanizeDuration(durationSeconds);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-[#4CA466] transition-all duration-200 group"
      role="button"
      tabIndex={0}
    >
     <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#4CA466] transition-colors">
            {title}
          </h3>
          {id ? (
            <div className="text-xs text-gray-400 mt-1">ID: <span className="font-mono text-gray-600">{id}</span></div>
          ) : null}
        </div>

        <div className="flex items-start gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.unknown}`}
          >
            {status}
          </span>

          {/* Edit button: stops propagation so card onClick doesn't fire */}
          {typeof onEdit === "function" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(test);
              }}
              title="Edit test"
              className="ml-1 p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Edit test"
            >
              <Edit size={16} className="text-gray-600" />
            </button>
          ) : null}
        </div>
      </div>


      {/* Description + Notes */}
    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>
      {notes ? (
        <div className="text-sm text-gray-500 mb-4">
          <strong className="text-gray-700">Notes:</strong> <span className="line-clamp-3">{notes}</span>
        </div>
      ) : null}

      {/* Dates: show start date+time AND end date+time explicitly */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            <span className="font-medium text-gray-700 mr-2">Start</span>
            <span>{startFormatted.date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock size={16} className="mr-2" />
            <span>{startFormatted.time} (Asia/Kolkata)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            <span className="font-medium text-gray-700 mr-2">End</span>
            <span>{endFormatted.date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock size={16} className="mr-2" />
            <span>{endFormatted.time} (Asia/Kolkata)</span>
          </div>
        </div>
      </div>

      {/* Duration + raw seconds badge */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <div className="flex items-center mr-3">
          <Clock size={16} className="mr-2" />
          <span className="font-medium text-gray-800 mr-2">Duration:</span>
          <span>{durationReadable}</span>
        </div>

        {/* show raw seconds if available */}
        <div className="ml-2 text-xs text-gray-500">
          {durationSeconds != null ? <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-mono">{durationSeconds} s</span> : null}
          {/* if duration was derived (not provided by backend) we can show a small note */}
          {backend_duration_seconds == null && derivedDurationSeconds != null ? (
            <span className="ml-2 text-xs italic text-gray-400">derived</span>
          ) : null}
        </div>
      </div>

      {/* Footer: Sections + Students */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <FileText size={16} className="mr-1" />
          <span>{sectionsCount} section{sectionsCount !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-1" />
          <span>{assignedStudentCount} student{assignedStudentCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
