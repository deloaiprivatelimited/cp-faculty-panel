import React, { useState, useEffect } from 'react';
import { X, Search, Users, Check, Filter, ChevronDown } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  usn: string;
  enrollment_number: string;
  branch: string;
  year_of_study: number;
  semester: number;
  cgpa: number;
  college: string;
}

interface AssignStudentsModalProps {
  testId: string;
  testName: string;
  onClose: () => void;
  onAssign: (studentIds: string[]) => void;
  isOpen: boolean;
}

interface Filters {
  branch: string;
  year_of_study: string;
  semester: string;
}

interface Meta {
  available_branches: string[];
  available_years_of_study: number[];
  available_semesters: number[];
}

const AssignStudentsModal: React.FC<AssignStudentsModalProps> = ({
  testId,
  testName,
  onClose,
  onAssign,
  isOpen
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    branch: '',
    year_of_study: '',
    semester: ''
  });
  const [meta, setMeta] = useState<Meta>({
    available_branches: [],
    available_years_of_study: [],
    available_semesters: []
  });
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const fetchStudents = async (currentPage = 1, resetSelection = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '20',
        sort_by: 'name',
        sort_dir: 'asc'
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (filters.branch) {
        params.append('branch', filters.branch);
      }

      if (filters.year_of_study) {
        params.append('year_of_study', filters.year_of_study);
      }

      if (filters.semester) {
        params.append('semester', filters.semester);
      }

      const response = await fetch(`${API_BASE_URL}/test/assignments/students/academic?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data.items);
        setMeta(data.data.meta);
        setPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.total_pages);
        setTotal(data.data.pagination.total);
        
        if (resetSelection) {
          setSelectedStudents([]);
        }
      } else {
        console.error('Failed to fetch students:', data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStudents(1, true);
    }
  }, [isOpen, searchTerm, filters]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleFilterChange = (filterKey: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      year_of_study: '',
      semester: ''
    });
    setPage(1);
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) return;

    setAssigning(true);
    try {
      const response = await fetch(`${API_BASE_URL}/test/assignments/bulk_assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test_id: testId,
          student_ids: selectedStudents
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        onAssign(selectedStudents);
        onClose();
      } else {
        console.error('Failed to assign students:', data.message);
        alert('Failed to assign students. Please try again.');
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      alert('Error assigning students. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchStudents(newPage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Students</h2>
            <p className="text-sm text-gray-600 mt-1">Assign students to "{testName}"</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {/* Search and Controls */}
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name, USN, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                Filters
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select
                      value={filters.branch}
                      onChange={(e) => handleFilterChange('branch', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Branches</option>
                      {meta.available_branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                    <select
                      value={filters.year_of_study}
                      onChange={(e) => handleFilterChange('year_of_study', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Years</option>
                      {meta.available_years_of_study.map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      value={filters.semester}
                      onChange={(e) => handleFilterChange('semester', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Semesters</option>
                      {meta.available_semesters.map(semester => (
                        <option key={semester} value={semester.toString()}>{semester}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  disabled={loading}
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedStudents.length} of {total} students selected
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                <span>{students.length} students shown</span>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading students...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map(student => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentToggle(student.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-blue-500 ${
                      selectedStudents.includes(student.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          {selectedStudents.includes(student.id) && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-500">{student.email}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>USN: {student.usn}</span>
                            <span>{student.branch}</span>
                            <span>Year {student.year_of_study}</span>
                            <span>Sem {student.semester}</span>
                            {student.cgpa && <span>CGPA: {student.cgpa}</span>}
                          </div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedStudents.includes(student.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedStudents.includes(student.id) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {students.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-500">No students found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} total students)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {page}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedStudents.length > 0 && (
                <span>
                  {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} will be assigned to this test
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={assigning}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedStudents.length === 0 || assigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    Assign Students
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentsModal;