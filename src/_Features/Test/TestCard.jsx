import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, FileText, Tag, Edit, Settings,BarChart2,Trash2 } from 'lucide-react';

const TestCard = ({ test, onClick,onEdit,handleDelete ,deletingId}) => {
  const navigate = useNavigate();
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTestStatus = () => {
    const now = new Date();
    const startDate = new Date(test.start_datetime);
    const endDate = new Date(test.end_datetime);
    
    if (now < startDate) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', color: 'bg-green-100 text-green-800 border-green-200' };
    } else {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const testStatus = getTestStatus();

  return (
    <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {test.test_name}
          </h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${testStatus.color}`}>
            {testStatus.status.charAt(0).toUpperCase() + testStatus.status.slice(1)}
          </span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit(test);
                }}            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit Test"
          >
            <Edit className="w-4 h-4" />
          </button>
          {/* Results button - navigates to /test/results/{test.id} */}
<button
onClick={(e) => {
e.stopPropagation();
e.preventDefault();
// Navigate to the results page for this test
navigate(`/test/results/${test.id}`);
}}
className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
title="View Results"
>
<BarChart2 className="w-4 h-4" />
</button>
          <button
            onClick={onClick}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Test Builder"
          >
            <Settings className="w-4 h-4" />
          </button>
           {/* Delete button */}
<button
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    // call parent handler
    handleDelete(test.id);
  }}
  className={`p-2 ${deletingId === test.id ? "opacity-60 pointer-events-none" : "text-red-500 hover:text-red-700"} transition-colors flex items-center`}
  title="Delete Test"
  disabled={deletingId === test.id}
>
  <Trash2 className="w-4 h-4" />
  {deletingId === test.id && <span className="sr-only">Deleting...</span>}
</button>

        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {test.description}
      </p>

      {/* Tags */}
      {test.tags && test.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {test.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {tag}
              </span>
            ))}
            {test.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{test.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(test.duration_seconds)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{test.no_of_students}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{test.total_sections}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCard;