// src/components/TestDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Test Management</h1>
              <p className="text-gray-600 text-sm">Create, manage, and monitor your tests</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Enhanced Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tests..."
                  className="pl-10 pr-10 py-3 w-72 border border-gray-200 rounded-xl text-sm 
                           focus:outline-none focus:ring-2 focus:ring-[#4CA466]/20 focus:border-[#4CA466] 
                           transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm
                           hover:shadow-md"
                />
                {q && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                             hover:text-gray-600 transition-colors duration-150"
                    onClick={() => setQ("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Enhanced Create Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-[#4CA466] to-[#3d8a54] text-white px-6 py-3 
                         rounded-xl hover:from-[#3d8a54] hover:to-[#2d7a44] transition-all duration-200 
                         flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                         font-medium"
              >
                <Plus size={20} />
                Create Test
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
            <nav className="flex space-x-1">
              {tabs.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative py-3 px-6 font-medium text-sm flex items-center gap-3 
                           transition-all duration-300 rounded-xl group overflow-hidden ${
                    activeTab === key
                      ? "bg-gradient-to-r from-[#4CA466] to-[#3d8a54] text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                  }`}
                >
                  <Icon size={18} className={`transition-transform duration-200 ${
                    activeTab === key ? "scale-110" : "group-hover:scale-105"
                  }`} />
                  {label}
                  {activeTab === key && (
                    <span className="bg-white/20 text-white py-1 px-3 rounded-full text-xs font-semibold
                                   animate-pulse">
                      {shownCountFor(key)}
                    </span>
                  )}
                  {/* Hover effect background */}
                  {activeTab !== key && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4CA466]/5 to-[#3d8a54]/5 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Enhanced Controls */}
          {!isEmpty && (
            <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-sm 
                          rounded-2xl p-4 shadow-sm border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#4CA466] border-t-transparent rounded-full animate-spin"></div>
                      Loading tests...
                    </div>
                  ) : (
                    <span>
                      <span className="text-[#4CA466] font-bold text-lg">{totalCount}</span> 
                      <span className="ml-1">result{totalCount !== 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">Show</label>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#4CA466]/20 focus:border-[#4CA466]
                           transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                >
                  {[6, 12, 20, 50].map((n) => (
                    <option value={n} key={n}>
                      {n} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Enhanced Error Display */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 
                          rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-medium">Error: {String(error)}</span>
              </div>
            </div>
          )}

          {/* Grid or Empty State */}
          {isEmpty ? (
            <div className="text-center py-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-lg 
                            border border-gray-200/50 max-w-md mx-auto">
                <div className="text-gray-400 mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 
                                rounded-2xl flex items-center justify-center shadow-inner">
                    <BookOpen size={40} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  {activeTab === "all" ? "No tests available" : `No ${activeTab} tests`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "upcoming" || activeTab === "all"
                    ? "Create your first test to get started"
                    : `No ${activeTab} tests found`}
                </p>
                {(activeTab === "upcoming" || activeTab === "all") && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-[#4CA466] to-[#3d8a54] text-white px-6 py-3 
                             rounded-xl hover:from-[#3d8a54] hover:to-[#2d7a44] transition-all duration-200 
                             flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-0.5 font-medium"
                  >
                    <Plus size={18} />
                    Create Your First Test
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                // Enhanced skeleton placeholders
                Array.from({ length: perPage > 0 ? Math.min(perPage, 6) : 6 }).map((_, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg 
                                        border border-gray-200/50 overflow-hidden">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded m-4 mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded m-4 mb-3 w-3/4"></div>
                      <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded m-4 mb-2 w-1/2"></div>
                      <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded m-4 mb-4 w-2/3"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded m-4"></div>
                    </div>
                  </div>
                ))
              ) : (
                tests.map((test, index) => (
                  <div
                    key={test.id}
                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TestCard
                      test={test}
                      assignedStudentCount={0}
                      onClick={() => window.open(`/test/${test.id}/testbuilder`, "_blank")}
                      onEdit={(t) => handleOpenEdit(t)}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Enhanced Pagination */}
          {!isEmpty && (
            <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                  Page <span className="text-[#4CA466] font-bold">{page}</span> of{' '}
                  <span className="text-[#4CA466] font-bold">{totalPages}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 
                             hover:bg-white/80 transition-all duration-200 disabled:hover:bg-transparent
                             shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    title="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Enhanced page numbers */}
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
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 
                                      transform hover:-translate-y-0.5 shadow-sm hover:shadow-md ${
                              pNum === page 
                                ? "bg-gradient-to-r from-[#4CA466] to-[#3d8a54] text-white shadow-lg" 
                                : "border border-gray-200 hover:bg-white/80"
                            }`}
                            disabled={loading}
                          >
                            {pNum}
                          </button>
                        );
                      }
                      // show ellipsis once where needed
                      if (pNum === 2 && page > 4) {
                        return (
                          <span key="ellipsis-left" className="px-3 text-gray-400 font-medium">
                            …
                          </span>
                        );
                      }
                      if (pNum === totalPages - 1 && page < totalPages - 3) {
                        return (
                          <span key="ellipsis-right" className="px-3 text-gray-400 font-medium">
                            …
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 
                             hover:bg-white/80 transition-all duration-200 disabled:hover:bg-transparent
                             shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                    title="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
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