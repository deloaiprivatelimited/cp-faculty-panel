// TestDetail.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Users, Edit3, Plus } from 'lucide-react';
import SectionSidebar from './SectionSidebar.jsx';
import QuestionList from './QuestionList.jsx';
import AddSectionModal from './AddSectionModal.jsx';
import EditSectionModal from './EditSectionModal.jsx';
import EditTestModal from './EditTestModal.jsx';
import AssignStudentsModal from './AssignStudentsModal.jsx';
import SelectedSectionView from './SectionContent/selectedSectionView.jsx';
import { useParams } from 'react-router-dom';
// import { privateAxios } from '../../utils/axios'; // adjust path if needed
import { privateAxios } from '../../utils/axios.js';
const defaultTest = {
  id: 'dummy-test-1',
  name: 'Sample Test (Demo)',
  description: 'This is a demo test used when no test prop is provided.',
  sections: [
    {
      id: 'section-1',
      title: 'Section A',
      instructions: 'Solve all.',
      questions: [
        { id: 'q1', title: 'Sample question 1', type: 'mcq', text: 'What is 2+2?' },
        { id: 'q2', title: 'Sample question 2', type: 'short', text: 'Explain X in one line.' }
      ]
    },
    {
      id: 'section-2',
      title: 'Section B',
      instructions: 'Optional',
      questions: []
    }
  ]
};

const TestDetail = ({
  test = defaultTest,
  students = [],
  myLibraryQuestions = [],
  globalLibraryQuestions = [],
  assignedStudents = [],
  onBack = () => {},
  onTestUpdate = () => {},
  onStudentAssignment = () => {}
}) => {
  const { testId } = useParams();

  // Selected section (will be chosen from combined list if server sections provided)
  const [selectedSection, setSelectedSection] = useState(null);

  // separate lists fetched from server
  const [sectionsTimeRestricted, setSectionsTimeRestricted] = useState([]);
  const [sectionsOpen, setSectionsOpen] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);

  // modals & edit state
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);

  // Helper: combine server sections into a single array (preserve ordering: time first then open)
  const combinedServerSections = [
    ...(sectionsTimeRestricted || []),
    ...(sectionsOpen || [])
  ];

  // Fetch sections for a test
  const fetchSections = async (id) => {
    if (!id) return;
    setLoadingSections(true);
    setSectionsError(null);
    try {
      const res = await privateAxios.get(`/tests/${id}/sections`);
      const data = res.data && res.data.data ? res.data.data : res.data;
      // API shape assumed: { sections_time_restricted: [...], sections_open: [...] }
      console.log(data)
      const timeList = data.sections_time_restricted || [];
      const openList = data.sections_open || [];
      setSectionsTimeRestricted(timeList);
      setSectionsOpen(openList);

    } catch (err) {
      console.error('Failed to fetch sections', err);
      setSectionsError(err?.response?.data?.message || err.message || 'Failed to fetch sections');
    } finally {
      setLoadingSections(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  // fetch on mount or when testId changes
  useEffect(() => {
    if (testId) {
      fetchSections(testId);
    } else {
      // no testId in route; if a `test` prop has server-like sections, seed them
      if (test && test.sections) {
        // split test.sections into time/open if your prop provides flags; otherwise keep as open
        setSectionsTimeRestricted((test.sections || []).filter(s => s.time_restricted));
        setSectionsOpen((test.sections || []).filter(s => !s.time_restricted));
      }
    }
  }, [testId]);

  // handlers

  const handleSectionAdd = async (newSection) => {
    // If testId available, POST to server; otherwise just call onTestUpdate locally
    if (testId) {
      try {
        const payload = {
          name: newSection.name,
          description: newSection.description || '',
          instructions: newSection.instructions || '',
          time_restricted: !!newSection.time_restricted
        };
        await privateAxios.post(`/tests/${testId}/sections`, payload);
        // re-fetch sections
        await fetchSections(testId);
      } catch (err) {
        console.error('Error creating section', err);
        // fallback: still update client-side so user sees immediate effect
        const section = {
          ...newSection,
          id: Date.now().toString(),
          questions: []
        };
        const updatedTest = {
          ...test,
          sections: [...(test.sections || []), section]
        };
        onTestUpdate(updatedTest);
      }
    } else {
      // no backend testId — use local fallback
      const section = {
        ...newSection,
        id: Date.now().toString(),
        questions: []
      };
      const updatedTest = {
        ...test,
        sections: [...(test.sections || []), section]
      };
      onTestUpdate(updatedTest);
    }
  };

  const handleSectionEdit = async (updatedSection) => {
    if (updatedSection && updatedSection.id && testId) {
      try {
        // PUT /sections/<section_id>
        await privateAxios.put(`/sections/${updatedSection.id}`, {
          name: updatedSection.name,
          description: updatedSection.description,
          instructions: updatedSection.instructions,
          time_restricted: !!updatedSection.time_restricted
        });
        // re-fetch server-side sections
        await fetchSections(testId);
        setSelectedSection(updatedSection);
      } catch (err) {
        console.error('Failed to update section on server', err);
        // fallback to local update
        const updatedTest = {
          ...test,
          sections: (test.sections || []).map(s => s.id === updatedSection.id ? updatedSection : s)
        };
        onTestUpdate(updatedTest);
        setSelectedSection(updatedSection);
      }
    } else {
      // local-only edit (no server)
      const updatedTest = {
        ...test,
        sections: (test.sections || []).map(s => s.id === updatedSection.id ? updatedSection : s)
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
      sections: test.sections || []
    };
    onTestUpdate(fullUpdatedTest);
  };

  const assignedCount = (assignedStudents && assignedStudents.length) || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
                {assignedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#4CA466] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {assignedCount}
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
          <SectionSidebar
            // pass server-fetched lists separately
            timedSections={sectionsTimeRestricted}
            openSections={sectionsOpen}
            // combined list for any consumer that expects 'sections'
            sections={combinedServerSections.length ? combinedServerSections : (test.sections || [])}
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
            onSectionEdit={handleEditSection}
            onAdd={() => setIsAddSectionModalOpen(true)}
            loading={loadingSections}
            error={sectionsError}
          />
        </div>

      <div className="flex-1">
  <SelectedSectionView section={selectedSection} />
</div>
      </div>

      {/* Modals */}
      {isAddSectionModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddSectionModalOpen(false)}
          onAdd={async (sectionPayload) => {
            await handleSectionAdd(sectionPayload);
            setIsAddSectionModalOpen(false);
          }}
          testId={testId}
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
