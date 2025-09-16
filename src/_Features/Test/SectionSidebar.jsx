import React from 'react';
import { Clock, Unlock, Edit3, Plus, BookOpen, Timer } from 'lucide-react';

const SectionSidebar = ({
  timedSections = [],
  openSections = [],
  selectedSection,
  onSectionSelect,
  onSectionEdit,
  onAdd
}) => {
  const SectionItem = ({ section }) => {
    const isSelected = selectedSection?.id === section.id;
    const timeRestricted = !!(section.time_restricted || section.isTimeConstrained);

    return (
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { 
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault();
            onSectionSelect(section); 
          } 
        }}
        onClick={() => onSectionSelect(section)}
        className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isSelected 
            ? 'bg-[#4CA466] text-white shadow-lg shadow-[#4CA466]/25' 
            : 'bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200'
        }`}
      >
        {/* Selection indicator */}
     
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen 
                size={14} 
                className={isSelected ? 'text-white/90' : 'text-[#4CA466]'} 
              />
              <h4 className={`font-semibold text-sm truncate ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}>
                {section.name || 'Untitled Section'}
              </h4>
            </div>
            
            {section.description && (
              <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                isSelected ? 'text-white/80' : 'text-gray-500'
              }`}>
                {section.description}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <div className={`p-1.5 rounded-lg transition-colors ${
              isSelected ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
            }`}>
              {timeRestricted ? (
                <Timer 
                  size={12} 
                  className={isSelected ? 'text-white' : 'text-[#4CA466]'} 
                />
              ) : (
                <Unlock 
                  size={12} 
                  className={isSelected ? 'text-white' : 'text-[#4CA466]'} 
                />
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSectionEdit && onSectionEdit(section);
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                isSelected 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 group-hover:bg-gray-200'
              }`}
              aria-label={`Edit ${section.name}`}
            >
              <Edit3 size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-current/10">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 ${
              isSelected ? 'text-white/90' : 'text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-white/60' : 'bg-[#4CA466]'
              }`} />
              {(section.questions || []).length} questions
            </span>
            
            {timeRestricted && (
              <span className={`flex items-center gap-1 ${
                isSelected ? 'text-white/90' : 'text-gray-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-white/60' : 'bg-[#4CA466]'
                }`} />
                {section.duration ?? section.time_limit ?? '—'} min
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SectionCategory = ({ title, icon: Icon, sections, emptyMessage, iconColor }) => (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="p-2 rounded-lg bg-[#4CA466]">
          <Icon size={16} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          {title}
        </h3>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {sections.length}
        </span>
      </div>

      <div className="space-y-3 overflow-auto max-h-[20rem] pr-1">
        {sections.length ? (
          sections.map((section) => (
            <SectionItem 
              key={section.id} 
              section={{
                ...section, 
                time_restricted: title.includes('Timed') ? true : false
              }} 
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm font-medium">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 fixed left-0 top-0 w-80">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Assessment Sections</h2>
        <p className="text-xs text-gray-500">Organize your questions by category</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-8">
        <SectionCategory
          title="Timed Sections"
          icon={Clock}
          sections={timedSections}
          emptyMessage="No timed sections yet"
        />
  <div className="border-t border-gray-200 my-2" />

        <SectionCategory
          title="Open Sections"
          icon={Unlock}
          sections={openSections}
          emptyMessage="No open sections yet"
        />

        {/* Global empty state */}
        {openSections.length === 0 && timedSections.length === 0 && (
          <div className="mt-auto text-center text-gray-500 py-12 px-4">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No sections yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Create your first section to start building your assessment
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Add Button */}
      <div className="p-6 bg-white border-t border-gray-200 fixed bottom-0 left-0 w-80">
        <button
          onClick={() => onAdd && onAdd()}
          className="w-full flex items-center justify-center gap-3 bg-[#4CA466] text-white px-4 py-3 rounded-xl hover:bg-[#3d8a54] transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#4CA466]/25 focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:ring-offset-2 font-medium"
          aria-label="Add section"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus size={14} />
          </div>
          Add New Section
        </button>
      </div>
    </div>
  );
};

export default SectionSidebar;