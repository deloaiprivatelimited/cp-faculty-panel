// TestDetail.jsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Edit3, Plus } from 'lucide-react';
import SectionSidebar from './SectionSidebar.jsx';
import QuestionList from './QuestionList.jsx';
import AddSectionModal from './AddSectionModal.jsx';
import EditSectionModal from './EditSectionModal.jsx';
import EditTestModal from './EditTestModal.tsx';
import AssignStudentsModal from './AssignStudentsModal.jsx';
import { useParams } from 'react-router-dom';
import { privateAxios } from '../../utils/axios.js'; // adjust path as needed
import ListQuestionCards from './SectionContent/utils/ListSectionQuestions/index.tsx';

const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#e6efe9', borderTopColor: '#4CA466' }} />
      <div className="text-sm text-gray-600">{message}</div>
    </div>
  </div>
);

const PRIMARY = '#4CA466';
const SECONDARY = '#FFFFFF';

const TestDetail = ({
  students = [],
  myLibraryQuestions = [],
  globalLibraryQuestions = [],
  assignedStudents = [],
  onBack = () => {},
  onTestUpdate = () => {},
  onStudentAssignment = () => {}
}) => {
  const { testId } = useParams();

  const [selectedSection, setSelectedSection] = useState(null);
  const [test, setTest] = useState(null);
  const [sectionsTimeRestricted, setSectionsTimeRestricted] = useState([]);
  const [sectionsOpen, setSectionsOpen] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);

  const combinedServerSections = [
    ...(sectionsTimeRestricted || []),
    ...(sectionsOpen || [])
  ];

  const fetchSections = async (id) => {
    if (!id) return;
    setLoadingSections(true);
    setSectionsError(null);
    try {
      const res = await privateAxios.get(`/tests/${id}/sections`);

      const data = res.data && res.data.data ? res.data.data : res.data;
      console.log('sections')
      console.log(data)
      const timeList = data.sections_time_restricted || [];
      const openList = data.sections_open || [];
      setSectionsTimeRestricted(timeList);
      setSectionsOpen(openList);
      setTest(data.test);
    } catch (err) {
      console.error('Failed to fetch sections', err);
      setSectionsError(err?.response?.data?.message || err.message || 'Failed to fetch sections');
    } finally {
      setLoadingSections(false);
    }
  };

  useEffect(() => {
    if (testId) {
      fetchSections(testId);
    } else {
      if (test && test.sections) {
        setSectionsTimeRestricted((test.sections || []).filter(s => s.time_restricted));
        setSectionsOpen((test.sections || []).filter(s => !s.time_restricted));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const [updating, setUpdating] = useState(false);

  const handleSectionAdd = async (newSection) => {
    if (testId) {
      try {
        const payload = {
          name: newSection.name,
          description: newSection.description || '',
          instructions: newSection.instructions || '',
          time_restricted: !!newSection.time_restricted
        };
        await privateAxios.post(`/tests/${testId}/sections`, payload);
        await fetchSections(testId);
      } catch (err) {
        console.error('Error creating section', err);
        const section = {
          ...newSection,
          id: Date.now().toString(),
          questions: []
        };
        const updatedTest = {
          ...test,
          sections: [...(test?.sections || []), section]
        };
        onTestUpdate(updatedTest);
      }
    } else {
      const section = {
        ...newSection,
        id: Date.now().toString(),
        questions: []
      };
      const updatedTest = {
        ...test,
        sections: [...(test?.sections || []), section]
      };
      onTestUpdate(updatedTest);
    }
  };

  const handleUpdate = async (testIdArg, payload) => {
    setUpdating(true);
    try {
      if (typeof window !== "undefined" && typeof privateAxios !== "undefined") {
        const res = await privateAxios.put(`/tests/${testIdArg}`, payload);
        return res.data;
      } else {
        // fallback: parent handler (if any) could be used; left intentionally minimal
        if (typeof onTestUpdate === "function") {
          return await onTestUpdate(payload);
        }
      }
    } catch (err) {
      console.error("Error updating test:", err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleSectionEdit = async (updatedSection) => {
    if (updatedSection && updatedSection.id && testId) {
      try {
        await privateAxios.put(`/sections/${updatedSection.id}`, {
          name: updatedSection.name,
          description: updatedSection.description,
          instructions: updatedSection.instructions,
          time_restricted: !!updatedSection.time_restricted
        });
        await fetchSections(testId);
        setSelectedSection(updatedSection);
      } catch (err) {
        console.error('Failed to update section on server', err);
        const updatedTest = {
          ...test,
          sections: (test?.sections || []).map(s => s.id === updatedSection.id ? updatedSection : s)
        };
        onTestUpdate(updatedTest);
        setSelectedSection(updatedSection);
      }
    } else {
      const updatedTest = {
        ...test,
        sections: (test?.sections || []).map(s => s.id === updatedSection.id ? updatedSection : s)
      };
      onTestUpdate(updatedTest);
      setSelectedSection(updatedSection);
    }
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
      sections: test?.sections || []
    };
    onTestUpdate(fullUpdatedTest);
  };

  const assignedCount = (assignedStudents && assignedStudents.length) || 0;

  const shouldShowLoader = loadingSections || (testId && !test && !sectionsError);

  if (shouldShowLoader) {
    return <FullPageLoader message="Loading test and sections..." />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: SECONDARY }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 shadow-sm z-40" style={{ backgroundColor: SECONDARY }}>
        <div className="px-6 py-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>{test?.test_name || 'Test Details'}</h1>
              <p className="text-sm mt-1" style={{ color: '#374151' }}>{test?.description || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAssignStudentsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative"
              style={{ backgroundColor: '#F5F8F6', color: '#1f2937' }}
            >
              <Users size={18} style={{ color: '#374151' }} />
              <span>Assign Students</span>
              {assignedCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: PRIMARY, color: SECONDARY }}
                >
                  {assignedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsEditTestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: PRIMARY, color: SECONDARY }}
            >
              <Edit3 size={18} style={{ color: SECONDARY }} />
              <span>Edit Test</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex" style={{ height: 'calc(100vh - 4rem)', marginTop: '4rem' }}>
        <div className="w-80 bg-white h-full shadow-sm">
          <SectionSidebar
            timedSections={sectionsTimeRestricted}
            openSections={sectionsOpen}
            sections={combinedServerSections.length ? combinedServerSections : (test?.sections || [])}
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
            onSectionEdit={handleEditSection}
            onAdd={() => setIsAddSectionModalOpen(true)}
            loading={loadingSections}
            error={sectionsError}
            // pass primary color down if sidebar supports a prop for custom colors (optional)
          />
        </div>

        <main className="flex-1 overflow-auto h-full">
          <div className=" min-h-full">
            {selectedSection ? (
              <ListQuestionCards section={selectedSection} />
            ) : (
              <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg p-8" style={{ borderColor: '#E6EFE9', backgroundColor: SECONDARY }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F8F6' }}>
                  <Plus size={36} style={{ color: PRIMARY }} />
                </div>

                <h2 className="mt-4 text-lg font-medium" style={{ color: '#111827' }}>Please select a section to build</h2>
                <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
                  Choose an existing section from the left or create a new one to start adding questions and content.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setIsAddSectionModalOpen(true)}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: PRIMARY, color: SECONDARY }}
                  >
                    Add section
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isAddSectionModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddSectionModalOpen(false)}
          onAdd={async (sectionPayload) => {
            await handleSectionAdd(sectionPayload);
            setIsAddSectionModalOpen(false);
          }}
          testId={testId}
          // if AddSectionModal accepts styles / color props, you can pass PRIMARY here
        />
      )}

      {isEditSectionModalOpen && sectionToEdit && (
        <EditSectionModal
          section={sectionToEdit}
          onClose={() => {
            setIsEditSectionModalOpen(false);
            setSectionToEdit(null);
          }}
          onSave={async (updatedSection) => {
            await handleSectionEdit(updatedSection);
            setIsEditSectionModalOpen(false);
            setSectionToEdit(null);
          }}
        />
      )}

      {isEditTestModalOpen && test && (
        <EditTestModal
          test={test}
          onClose={() => setIsEditTestModalOpen(false)}
          onUpdate={async (testIdArg, payload) => {
            try {
              const res = await handleUpdate(testIdArg, payload);
              setIsEditTestModalOpen(false);
              if (testIdArg) {
                await fetchSections(testIdArg);
              }
              return res?.data ? res.data : { success: true };
            } catch (err) {
              return {
                success: false,
                message:
                  err?.response?.data?.message ??
                  err?.message ??
                  "Failed to update test",
              };
            }
          }}
        />
      )}

      {isAssignStudentsModalOpen && (
        <AssignStudentsModal
          students={students}
          assignedStudents={assignedStudents}
          testName={test?.name}
          onClose={() => setIsAssignStudentsModalOpen(false)}
          onAssign={onStudentAssignment}
        />
      )}
    </div>
  );
};

export default TestDetail;