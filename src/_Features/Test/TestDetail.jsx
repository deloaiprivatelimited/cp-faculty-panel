// TestDetail.jsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Edit3, Plus } from 'lucide-react';
import SectionSidebar from './SectionSidebar.jsx';
import QuestionList from './QuestionList.jsx';
import AddSectionModal from './AddSectionModal.jsx';
import EditSectionModal from './EditSectionModal.jsx';
import EditTestModal from './EditTestModal.tsx';
import AssignStudentsModal from './AssignStudentsModal.jsx';
// import UnassignStudentsModal from './UnassignStudentsModal.jsx';
import UnassignStudentsModal from './UnAssignStudentModal.tsx';
import { useParams } from 'react-router-dom';
import { privateAxios } from '../../utils/axios.js'; // adjust path as needed
import ListQuestionCards from './SectionContent/utils/ListSectionQuestions/index.tsx';
import { showError, showSuccess } from '../../utils/toast.js';
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

}) => {
  const { testId } = useParams();

  const [selectedSection, setSelectedSection] = useState(null);
  const [test, setTest] = useState(null);
  const [sectionsTimeRestricted, setSectionsTimeRestricted] = useState([]);
  const [sectionsOpen, setSectionsOpen] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);
const [isUnassignStudentsModalOpen, setIsUnassignStudentsModalOpen] = useState(false);

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [isEditTestModalOpen, setIsEditTestModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
// inside TestDetail.jsx — replace the current handleAssign definition with this:

const handleAssign = async (studentIds) => {
  if (!studentIds || !studentIds.length) {
    showError('No students selected to assign.');
    return;
  }

  if (!test || !test.id) {
    showError('Test not loaded. Cannot assign students.');
    return;
  }

  try {
    setUpdating(true);

    // Build payload expected by your Flask route
    const payload = {
      test_id: String(test.id),
      student_ids: studentIds.map(s => String(s)),
    };

    // Add Authorization header manually if privateAxios is not preconfigured with auth
    const headers = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await privateAxios.post('/test/assignments/bulk_assign', payload, { headers });

    // response structure: response(True, "bulk assign complete", summary)
    // your axios response likely in res.data (adjust if different)
    const serverData = res?.data ?? res;
    console.log('Bulk assign response:', serverData);

    // Basic UX: show success summary (switch to your toast system if available)
    const summary = serverData?.data ?? serverData;
    if (serverData?.success === true || (summary && (summary.created || summary.skipped || summary.errors !== undefined))) {
      // close modal
      setIsAssignStudentsModalOpen(false);

      // optional: give a quick summary to the user
      const created = summary.created ?? 0;
      const skipped = summary.skipped ?? 0;
      const errors = summary.errors ?? 0;
      showSuccess(` ${created} Assigned, ${skipped} skipped, ${errors} errors.`);

      // optionally refresh sections/tests or assignedStudents list
      // if server returns updated test/assignments, fetch it here:
      // await fetchSections(test.id);

      // If parent expects callback, call it (you have handleAssign prop?):
      // onTestUpdate?.(updatedTest); // only if you have new test data
    } else {
      // If server responded but not marked as success
      showError('Assignment completed but server returned an unexpected response. Check console for details.');
    }
  } catch (err) {
    console.error('Error assigning students:', err);
    const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to assign students';
    showError(`Assign failed: ${msg}`);
  } finally {
    setUpdating(false);
  }
};

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
      // console.log('sections')
      // console.log(data)
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
const handleSectionDelete = async (sectionId) => {
  console.log("Dekelteing", sectionId)
  if (!sectionId) {
    console.log('ere')
    showError("No section id provided to delete.");
    return;
  }
  console.log('runnig')

  // confirm UX can be handled in the sidebar modal; this is the action call
  // setUpdating(true);
  try {
    console.log('yes')
    const res = await privateAxios.delete(`/tests/sections/${sectionId}`);

    const serverData = res?.data ?? res;
    // expected: response(True, "Section deleted successfully")
    showSuccess(serverData?.message || "Section deleted.");

    // If we have testId, re-fetch sections from server to keep UI in sync
    if (testId) {
      await fetchSections(testId);
    } else {
      // fallback: remove from local test state if test is present in memory
      const updatedTest = {
        ...test,
        sections: (test?.sections || []).filter(s => String(s.id) !== String(sectionId))
      };
      onTestUpdate(updatedTest);
      // also update local lists if present
      setSectionsTimeRestricted(prev => (prev || []).filter(s => String(s.id) !== String(sectionId)));
      setSectionsOpen(prev => (prev || []).filter(s => String(s.id) !== String(sectionId)));
    }

    // if deleted section was currently selected, clear selection
    if (selectedSection && String(selectedSection.id) === String(sectionId)) {
      setSelectedSection(null);
    }
  } catch (err) {
    console.log('catch')
    console.error("Error deleting section:", err);
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to delete section";
    showError(`Delete failed: ${msg}`);
  } finally {
    console.log('final')
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
      <header className="fixed top-0 left-0 right-0 h-16  z-40" >
        <div className="px-6 py-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <div>
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
           
            </button>
            <button
  onClick={() => setIsUnassignStudentsModalOpen(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ml-2"
  style={{ backgroundColor: assignedCount === 0 ? '#f3f4f6' : '#fff', color: '#1f2937', border: '1px solid #e5e7eb' }}
>
  <Users size={18} style={{ color: '#374151' }} />
  <span>Unassign Students</span>
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
              onSectionDelete={handleSectionDelete}         // <-- added prop

            onSectionEdit={handleEditSection}
            onAdd={() => setIsAddSectionModalOpen(true)}
            loading={loadingSections}
            error={sectionsError}
          test={test}
            // pass primary color down if sidebar supports a prop for custom colors (optional)
          />
        </div>

        <main className="flex-1 overflow-auto h-full">
          <div className=" min-h-full">
            {selectedSection ? (
              <ListQuestionCards section={selectedSection} />
            ) : (
              <div className="flex flex-col items-center justify-center h-96  rounded-lg p-8" style={{ borderColor: '#E6EFE9', backgroundColor: SECONDARY }}>
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
          testId={test.id}
          testName={test.test_name}
          isOpen={isAssignStudentsModalOpen}
          onClose={() => setIsAssignStudentsModalOpen(false)}
          onAssign={handleAssign}
        />
      )}
      {isUnassignStudentsModalOpen && (
  <UnassignStudentsModal
    testId={test.id}
    testName={test.test_name}
    isOpen={isUnassignStudentsModalOpen}
    onClose={() => setIsUnassignStudentsModalOpen(false)}
    onUnassignCompleted={(summary) => {
      // summary is the server response .data (created/removed/skipped etc)
      // refresh assigned count / assigned students. simplest: refetch sections/tests or fetch assigned list
      // small UX: show summary via toast, then refresh sections/state
      try {
        const removed = summary?.removed ?? summary?.data?.removed ?? 0;
        const skipped = summary?.skipped ?? summary?.data?.skipped ?? 0;
        const errors = summary?.errors ?? summary?.data?.errors ?? 0;
        showSuccess(`${removed} Unassigned, ${skipped} skipped, ${errors} errors.`);
      } catch (e) { /* ignore */ }

      // refresh test data / assigned count: re-fetch sections/test (you already have fetchSections)
      if (testId) {
        fetchSections(testId);
      }
    }}
  />
)}
    </div>
  );
};

export default TestDetail;