import React from 'react';
import { Clock, Unlock, Edit3, Plus } from 'lucide-react';

const SectionSidebar = ({
  timedSections = [],
  openSections = [],
  selectedSection,
  onSectionSelect,
  onSectionEdit,
  onAdd // new prop to open AddSectionModal from parent
}) => {
  const SectionItem = ({ section }) => {
    console.log(section)
    
    const isSelected = selectedSection?.id === section.id;
    const timeRestricted = !!(section.time_restricted || section.isTimeConstrained);

    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSectionSelect(section); } }}
        onClick={() => onSectionSelect(section)}
        className={`p-3 rounded-lg cursor-pointer transition-all flex flex-col justify-between group outline-none focus:ring-2 focus:ring-offset-1 ${
          isSelected ? 'bg-[#4CA466] text-white' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">{section.name || 'Untitled Section'}</h4>
            {section.description && (
              <p className={`text-xs mt-1 truncate ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                {section.description}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-1">
            {timeRestricted ? (
              <Clock size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
            ) : (
              <Unlock size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSectionEdit && onSectionEdit(section);
              }}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${isSelected ? 'text-white' : 'text-gray-400'}`}
              aria-label={`Edit ${section.name}`}
            >
              <Edit3 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mt-3">
          <span className={isSelected ? 'text-white/90' : 'text-gray-500'}>
            {(section.questions || []).length} questions
          </span>
          {timeRestricted && (
            <span className={isSelected ? 'text-white/90' : 'text-gray-500'}>
              {section.duration ?? section.time_limit ?? '—'} min
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-sm">
      <div className="flex-1 overflow-hidden flex flex-col px-4 py-3 gap-4">
        {/* Timed Sections */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Clock size={16} />
            Timed Sections
          </h3>

          <div className="space-y-2 overflow-auto max-h-[18rem] pr-2">
            {timedSections.length ? (
              timedSections.map((section) => (
                <SectionItem key={section.id} section={{ ...section, time_restricted: true }} />
              ))
            ) : (
              <div className="text-xs text-gray-400">No timed sections</div>
            )}
          </div>
        </div>

        {/* Open Sections */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Unlock size={16} />
            Open Sections
          </h3>

          <div className="space-y-2 overflow-auto max-h-[18rem] pr-2">
            {openSections.length ? (
              openSections.map((section) => (
                <SectionItem key={section.id} section={{ ...section, time_restricted: false }} />
              ))
            ) : (
              <div className="text-xs text-gray-400">No open sections</div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {openSections.length === 0 && timedSections.length === 0 && (
          <div className="mt-auto text-center text-gray-500 py-6">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm">No sections yet</p>
            <p className="text-xs mt-1">Add a section to get started</p>
          </div>
        )}
      </div>

      {/* pinned footer without border */}
      <div className="px-4 py-3">
        <button
          onClick={() => onAdd && onAdd()}
          className="w-full flex items-center justify-center gap-2 bg-[#4CA466] text-white px-3 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors"
          aria-label="Add section"
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>
    </div>
  );
};

export default SectionSidebar;
