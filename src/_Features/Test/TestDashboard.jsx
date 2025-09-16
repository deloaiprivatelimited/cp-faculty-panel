// src/components/TestDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import TestCard from "./TestCard.jsx";
import CreateTestModal from "./CreateTestModal.tsx";
import { privateAxios } from "../../utils/axios"; // adjust path if different
import { useNavigate } from "react-router-dom";
import EditTestModal from "./EditTestModal.tsx"; // add this import
import { Edit } from "lucide-react"; // optional if you want elsewhere

const TAB_CONFIG = {
  all: { label: "All", endpoint: "/tests", defaultSort: "-start_datetime", icon: BookOpen },
  upcoming: { label: "Upcoming", endpoint: "/tests/upcoming", defaultSort: "start_datetime", icon: Calendar },
  ongoing: { label: "Ongoing", endpoint: "/tests/ongoing", defaultSort: "start_datetime", icon: Clock },
  past: { label: "Past", endpoint: "/tests/past", defaultSort: "-end_datetime", icon: BookOpen },
};

const DEFAULT_PER_PAGE = 12;

export default function TestDashboard({
  
  
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // server-driven state
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 // Edit modal state
  const [editingTest, setEditingTest] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  // pagination & search state
 
  // open edit modal for a test
  const handleOpenEdit = (test) => {
    console.log(test)
    setEditingTest(test);
    setIsEditModalOpen(true);
  };

  // close edit modal
  const handleCloseEdit = () => {
    setEditingTest(null);
    setIsEditModalOpen(false);
  };
 // Perform update (used by EditTestModal)
  const handleUpdate = async (testId, payload) => {
    setUpdating(true);
    try {
    
      // Parent may provide onTestUpdate; if not, do PUT directly
        const res = await privateAxios.put(`/tests/${testId}`, payload);
        // You may want to handle response shape; return to modal
        // After successful update, refresh current page
        setPage(1); // reset to first page, or keep current
        // small delay and then refetch (your fetch effect will run because page changed)
        setTimeout(() => {
          setPage((p) => p); // trigger effect — keeps page same but safe
        }, 150);
        return res.data;
      
    } catch (err) {
      console.error("Error updating test:", err);
      // bubble error to modal caller
      throw err;
    } finally {
      setUpdating(false);
    }
  };
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // search with debounce
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  // convenience flag: true when there are no tests to show and not loading
  const isEmpty = !loading && (!tests || tests.length === 0);

  // rebuild tabs array for display
  const tabs = useMemo(
    () =>
      Object.entries(TAB_CONFIG).map(([key, cfg]) => ({
        key,
        label: cfg.label,
        Icon: cfg.icon,
      })),
    []
  );

  // when tab changes reset page and clear error
  useEffect(() => {
    setPage(1);
    setError(null);
  }, [activeTab, debouncedQ, perPage]);
 async function fetchTests() {
      setLoading(true);
      setError(null);

      const cfg = TAB_CONFIG[activeTab] || TAB_CONFIG.all;
      const endpoint = cfg.endpoint;

      const params = {
        page,
        per_page: perPage,
      };
      if (debouncedQ) params.q = debouncedQ;

      try {
        const res = await privateAxios.get(endpoint, { params });
        // expected shape: { success, message, data: { tests: [...], meta: { total, page, per_page, total_pages } } }

        const data = res.data?.data || {};
        const fetchedTests = data.tests || [];
        const meta = data.meta || {};
        console.log(fetchedTests)

        setTests(fetchedTests);
        setTotalCount(meta.total ?? 0);
        setTotalPages(meta.total_pages ?? 1);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Unable to fetch tests. Please try again."
        );
      } finally {
       setLoading(false);
      }
    }

  // core fetch logic
  useEffect(() => {
    let cancelled = false;

   
    fetchTests();
    return () => {
      cancelled = true;
    };
  }, [activeTab, page, perPage, debouncedQ]);

  // handle create -> close modal -> refetch
  const handleCreate = async (payload) => {
    try {
      
        // fallback: POST directly if parent didn't provide handler
        await privateAxios.post("/tests/add", payload);
    
      setIsCreateModalOpen(false);
      // refresh
      setPage(1);
      // trigger fetch by toggling debouncedQ (or calling fetch by changing a key)
      setDebouncedQ((s) => s); // noop - rely on effect to fetch since page changed
      // small delay to ensure backend persisted
      setTimeout(() => {
        // force a re-fetch: ensure page set
        setPage(1);
        fetchTests()
      }, 200);
    } catch (err) {
      console.error("Error creating test:", err);
      throw err;
    }
  };

  // small helper to compute counts shown on tabs (uses server count when available)
  const shownCountFor = (tabKey) => {
    if (tabKey === activeTab) return tests.length;
    return "-";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tests..."
                  className="border rounded-md px-3 py-2 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CA466]"
                />
                {q && (
                  <button
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 text-xs px-2"
                    onClick={() => setQ("")}
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus size={18} />
                Create Test
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              {tabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-3 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === key
                      ? "border-[#4CA466] text-[#4CA466]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                 { activeTab === key ?  <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs ml-2">
                    {shownCountFor(key)}
                  </span> : null}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Controls: per page & results */}
          {!isEmpty && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                {loading ? "Loading tests..." : `${totalCount} result${totalCount !== 1 ? "s" : ""}`}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Per page</label>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="border rounded-md px-2 py-1"
                >
                  {[6, 12, 20, 50].map((n) => (
                    <option value={n} key={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Grid or Empty */}
          {error && (
            <div className="mb-4 text-red-600 text-sm">
              Error: {String(error)}
            </div>
          )}

          {isEmpty ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <BookOpen size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg mb-2">
                {activeTab === "all" ? "No tests available" : `No ${activeTab} tests`}
              </p>
              <p className="text-gray-400">
                {activeTab === "upcoming" || activeTab === "all"
                  ? "Create a new test to get started"
                  : `No ${activeTab} tests found`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // simple skeleton placeholders
                Array.from({ length: perPage > 0 ? Math.min(perPage, 6) : 6 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white rounded-lg shadow-sm animate-pulse h-36" />
                ))
              ) : (
                tests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    assignedStudentCount= {0}
    onClick={() => window.open(`/test/${test.id}/testbuilder`, "_blank")}
                    onEdit={(t) => handleOpenEdit(t)}

                  />
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!isEmpty && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded-md border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* page numbers (show compact range) */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    // show first, last, and nearby pages
                    if (
                      pNum === 1 ||
                      pNum === totalPages ||
                      (pNum >= page - 1 && pNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`px-3 py-1 rounded-md ${
                            pNum === page ? "bg-[#4CA466] text-white" : "border"
                          }`}
                          disabled={loading}
                        >
                          {pNum}
                        </button>
                      );
                    }
                    // show ellipsis once where needed
                    if (pNum === 2 && page > 4) {
                      return <span key="ellipsis-left" className="px-2">…</span>;
                    }
                    if (pNum === totalPages - 1 && page < totalPages - 3) {
                      return <span key="ellipsis-right" className="px-2">…</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className="px-3 py-1 rounded-md border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Test Modal */}
      {isCreateModalOpen && (
        <CreateTestModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
            {/* Edit Test Modal */}
      {isEditModalOpen && editingTest && (
        <EditTestModal
          test={editingTest}
          onClose={handleCloseEdit}
          onUpdate={async (testId, payload) => {
            // This will be invoked from modal. We call the handleUpdate above.
            try {
              const res = await handleUpdate(testId, payload);
              // close only on success
              handleCloseEdit();
              // re-fetch tests by forcing page reset (the fetch effect will run)
              setPage(1);
              return res?.data ? res.data : { success: true };
            } catch (err) {
              // return err-like object so modal shows message
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

    </div>
  );
}
