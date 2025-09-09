import React, { useState } from 'react';
import { X, Search, Users, Check } from 'lucide-react';

const AssignStudentsModal = ({ 
  students, 
  assignedStudents, 
  testName, 
  onClose, 
  onAssign 
}) => {
  const [selectedStudents, setSelectedStudents] = useState(assignedStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleSave = () => {
    onAssign(selectedStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
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
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-[#4CA466] hover:text-[#3d8a54] transition-colors"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedStudents.length} of {students.length} students selected
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                <span>{filteredStudents.length} students found</span>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => handleStudentToggle(student.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-[#4CA466] ${
                    selectedStudents.includes(student.id)
                      ? 'border-[#4CA466] bg-[#4CA466]/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {selectedStudents.includes(student.id) && (
                          <div className="absolute -top-1 -right-1 bg-[#4CA466] text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedStudents.includes(student.id)
                        ? 'border-[#4CA466] bg-[#4CA466]'
                        : 'border-gray-300'
                    }`}>
                      {selectedStudents.includes(student.id) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">No students found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
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
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#4CA466] text-white rounded-lg hover:bg-[#3d8a54] transition-colors flex items-center gap-2"
              >
                <Users size={16} />
                Assign Students
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentsModal;