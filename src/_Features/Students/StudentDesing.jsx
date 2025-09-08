import React, { useState } from 'react';

function MyComponent() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: [],
    gender: [],
    branch: [],
    status: '',
    cgpaMin: '',
    cgpaMax: ''
  });

  // Mock data for demonstration
  const students = [
    { id: 1, name: "Alice Johnson", usn: "4NI21CS001", email: "alice@college.edu", year: "3rd Year", cgpa: 8.5, status: "Active" },
    { id: 2, name: "Bob Smith", usn: "4NI21CS002", email: "bob@college.edu", year: "2nd Year", cgpa: 7.8, status: "Active" },
    { id: 3, name: "Carol Davis", usn: "4NI21CS003", email: "carol@college.edu", year: "4th Year", cgpa: 9.2, status: "Active" },
    { id: 4, name: "David Wilson", usn: "4NI21CS004", email: "david@college.edu", year: "1st Year", cgpa: 6.9, status: "Inactive" },
    { id: 5, name: "Eva Brown", usn: "4NI21CS005", email: "eva@college.edu", year: "3rd Year", cgpa: 8.1, status: "Active" },
  ];

  const handleCheckboxChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value) 
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Engineering College of Excellence
          </h1>
          <p className="text-gray-600 text-lg">
            Total Students: <span className="font-semibold text-[#4CA466]">1,247</span>
          </p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search students by name, USN, or email..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-all"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="bg-[#4CA466] hover:bg-[#3d8a54] text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md">
                Download All
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="border-2 border-[#4CA466] text-[#4CA466] hover:bg-[#4CA466] hover:text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Filters {showFilters ? '−' : '+'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Year of Study */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Year of Study</h4>
                <div className="space-y-2">
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(year => (
                    <label key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.year.includes(year)}
                        onChange={() => handleCheckboxChange('year', year)}
                        className="w-4 h-4 text-[#4CA466] rounded border-gray-300 focus:ring-[#4CA466]"
                      />
                      <span className="ml-2 text-gray-700">{year}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Gender</h4>
                <div className="space-y-2">
                  {['Male', 'Female', 'Other'].map(gender => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(gender)}
                        onChange={() => handleCheckboxChange('gender', gender)}
                        className="w-4 h-4 text-[#4CA466] rounded border-gray-300 focus:ring-[#4CA466]"
                      />
                      <span className="ml-2 text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Branch */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Branch</h4>
                <div className="space-y-2">
                  {['Computer Science', 'Electronics', 'Mechanical', 'Civil'].map(branch => (
                    <label key={branch} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.branch.includes(branch)}
                        onChange={() => handleCheckboxChange('branch', branch)}
                        className="w-4 h-4 text-[#4CA466] rounded border-gray-300 focus:ring-[#4CA466]"
                      />
                      <span className="ml-2 text-gray-700">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Status</h4>
                <select
                  value={filters.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>

              {/* CGPA Range */}
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                <h4 className="font-medium text-gray-700 mb-3">CGPA Range</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={filters.cgpaMin}
                      onChange={(e) => handleInputChange('cgpaMin', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Max CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={filters.cgpaMax}
                      onChange={(e) => handleInputChange('cgpaMax', e.target.value)}
                      placeholder="10.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sl No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">USN</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">CGPA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{student.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.usn}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.year}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#4CA466]">{student.cgpa}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[#4CA466] hover:text-[#3d8a54] font-medium text-sm transition-colors">
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1-5</span> of <span className="font-medium">1,247</span> students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyComponent;