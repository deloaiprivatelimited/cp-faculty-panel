import React, { useState } from 'react';
import { ArrowLeft, Users, Edit3, Plus } from 'lucide-react';
import SectionSidebar from './SectionSidebar.jsx';
import QuestionList from './QuestionList.jsx';
import AddSectionModal from './AddSectionModal.jsx';
import EditSectionModal from './EditSectionModal.jsx';
import EditTestModal from './EditTestModal.jsx';
import AssignStudentsModal from './AssignStudentsModal.jsx';

const TestDetail = ({ 
  test, 
  students, 
  myLibraryQuestions,
  globalLibraryQuestions,
  assignedStudents, 
  onBack, 
  onTestUpdate, 
  onStudentAssignment 
}) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);

  const handleSectionAdd = (newSection) => {
    const section = {
      ...newSection,
      id: Date.now().toString(),
      questions: []
    };
    
    const updatedTest = {
      ...test,
      sections: [...test.sections, section]
    };
    
    onTestUpdate(updatedTest);
  };

  const handleSectionEdit = (updatedSection) => {
    const updatedTest = {
      ...test,
      sections: test.sections.map(s => s.id === updatedSection.id ? updatedSection : s)
    };
    
    onTestUpdate(updatedTest);
    setSelectedSection(updatedSection);
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
  };

  const handleEditSection = (section) => {
    setSectionToEdit(section);
    setIsEditSectionModalOpen(true);
  };

  const handleTestEdit = (updatedTest) => {
    const fullUpdatedTest = {
      ...updatedTest,
      sections: test.sections
    };
    onTestUpdate(fullUpdatedTest);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 mr-4 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
                <p className="text-gray-600 text-sm mt-1">{test.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAssignStudentsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors relative"
              >
                <Users size={18} />
                Assign Students
                {assignedStudents.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#4CA466] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {assignedStudents.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsEditTestModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] transition-colors"
              >
                <Edit3 size={18} />
                Edit Test
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
              <button
                onClick={() => setIsAddSectionModalOpen(true)}
                className="bg-[#4CA466] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d8a54] transition-colors flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                Add Section
              </button>
            </div>
          </div>

          <SectionSidebar
            sections={test.sections}
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
            onSectionEdit={handleEditSection}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedSection ? (
            <QuestionList
              section={selectedSection}
              myLibraryQuestions={myLibraryQuestions}
              globalLibraryQuestions={globalLibraryQuestions}
              onSectionUpdate={(updatedSection) => {
                const updatedTest = {
                  ...test,
                  sections: test.sections.map(s => s.id === updatedSection.id ? updatedSection : s)
                };
                onTestUpdate(updatedTest);
                setSelectedSection(updatedSection);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">Select a section to view questions</p>
                <p className="text-sm mt-2">Or create a new section to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddSectionModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddSectionModalOpen(false)}
          onAdd={handleSectionAdd}
        />
      )}

      {isEditSectionModalOpen && sectionToEdit && (
        <EditSectionModal
          section={sectionToEdit}
          onClose={() => {
            setIsEditSectionModalOpen(false);
            setSectionToEdit(null);
          }}
          onSave={handleSectionEdit}
        />
      )}

      {isEditTestModalOpen && (
        <EditTestModal
          test={test}
          onClose={() => setIsEditTestModalOpen(false)}
          onSave={handleTestEdit}
        />
      )}

      {isAssignStudentsModalOpen && (
        <AssignStudentsModal
          students={students}
          assignedStudents={assignedStudents}
          testName={test.name}
          onClose={() => setIsAssignStudentsModalOpen(false)}
          onAssign={onStudentAssignment}
        />
      )}
    </div>
  );
};

export default TestDetail;