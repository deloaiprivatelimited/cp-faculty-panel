import React from 'react';
import { Clock, Unlock, Edit3, Plus } from 'lucide-react';

const SectionSidebar = ({
    timedSections= [],
  openSections =[],
  selectedSection,
  onSectionSelect,
  onSectionEdit,
  onAdd // new prop to open AddSectionModal from parent
}) => {

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
        <h4 className="font-medium text-sm truncate">{section.name}</h4>
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
            aria-label="Edit section"
          >
            <Edit3 size={12} />
          </button>
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <span className={selectedSection?.id === section.id ? 'text-white opacity-80' : 'text-gray-500'}>
          {(section.questions || []).length} questions
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
    // full viewport height so sidebar remains fixed and doesn't scroll with page
    <div className="h-screen flex flex-col bg-white">
      <div className="p-4 flex-1 flex flex-col">
        {/* Timed Sections — independently scrollable */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Timed Sections
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {timedSections.length ? (
              timedSections.map(section => (
                <SectionItem key={section.id} section={section} />
              ))
            ) : (
              <div className="text-xs text-gray-400">No timed sections</div>
            )}
          </div>
        </div>

        {/* Open Sections — independently scrollable */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Unlock size={16} />
            Open Sections
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {openSections.length ? (
              openSections.map(section => (
                <SectionItem key={section.id} section={section} />
              ))
            ) : (
              <div className="text-xs text-gray-400">No open sections</div>
            )}
          </div>
        </div>

        {/* Fallback if there are zero sections at all */}
        {openSections.length === 0 &&  timedSections.length ===0 &&(
          <div className="mt-auto text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm">No sections yet</p>
            <p className="text-xs mt-1">Add a section to get started</p>
          </div>
        )}
      </div>

      {/* bottom area with Add Section button — pinned */}
      <div className="p-4 border-t bg-white">
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
