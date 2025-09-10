import React from "react";
import { Calendar, Clock, FileText, Users } from "lucide-react";

const TestCard = ({ test = {}, assignedStudentCount = 0, onClick }) => {
  // fallback safe destructuring
  const {
    test_name = "Untitled Test",
    description = "No description provided",
    notes = "",
    start_datetime,
    end_datetime,
    status = "upcoming", // default for now
    sections = [], // backend not sending yet
  } = test;

  const formatDateTime = (dateTime) => {
    if (!dateTime) return { date: "N/A", time: "N/A" };
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const startFormatted = formatDateTime(start_datetime);
  const endFormatted = formatDateTime(end_datetime);

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    past: "bg-gray-100 text-gray-800",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-[#4CA466] transition-all duration-200 group"
    >
      {/* Title + Status */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#4CA466] transition-colors">
          {test_name}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      {/* Dates */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={16} className="mr-2" />
          <span>{startFormatted.date}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-2" />
          <span>
            {startFormatted.time} - {endFormatted.time}
          </span>
        </div>
      </div>

      {/* Footer: Sections + Students */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <FileText size={16} className="mr-1" />
          <span>{sections.length || 0} sections</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-1" />
          <span>{assignedStudentCount} students</span>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
