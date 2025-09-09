import React from 'react';
import { Clock, Unlock, Edit3 } from 'lucide-react';

const SectionSidebar = ({
  sections,
  selectedSection,
  onSectionSelect,
  onSectionEdit
}) => {
  const timedSections = sections.filter(s => s.isTimeConstrained);
  const openSections = sections.filter(s => !s.isTimeConstrained);

  const SectionItem = ({ section }) => (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all group ${
        selectedSection?.id === section.id
          ? 'bg-[#4CA466] text-white'
          : 'hover:bg-gray-100'
      }`}
      onClick={() => onSectionSelect(section)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{section.name}</h4>
        <div className="flex items-center gap-1">
          {section.isTimeConstrained ? (
            <Clock size={14} className={selectedSection?.id === section.id ? 'text-white' : 'text-gray-500'} />
          ) : (
            <Unlock size={14} className={selectedSection?.id === section.id ? 'text-white' : 'text-gray-500'} />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSectionEdit(section);
            }}
            className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
              selectedSection?.id === section.id ? 'text-white' : 'text-gray-400'
            }`}
          >
            <Edit3 size={12} />
          </button>
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <span className={selectedSection?.id === section.id ? 'text-white opacity-80' : 'text-gray-500'}>
          {section.questions.length} questions
        </span>
        {section.isTimeConstrained && (
          <span className={selectedSection?.id === section.id ? 'text-white opacity-80' : 'text-gray-500'}>
            {section.duration} min
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {timedSections.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Timed Sections
          </h3>
          <div className="space-y-2">
            {timedSections.map(section => (
              <SectionItem key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}

      {openSections.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Unlock size={16} />
            Open Sections
          </h3>
          <div className="space-y-2">
            {openSections.map(section => (
              <SectionItem key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}

      {sections.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-sm">No sections yet</p>
          <p className="text-xs mt-1">Add a section to get started</p>
        </div>
      )}
    </div>
  );
};

export default SectionSidebar;