import React, { useState, useEffect, useCallback } from "react";
import { privateAxios } from "../../utils/axios";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🔹 UI → Backend mappings
const statusMap = {
  Active: true,
  Inactive: false,
};

function MyComponent() {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    phone_number: "",
    usn: "",
    branch: "",
    year_of_study: "",
    semester: "",
    cgpa: "",
    gender: "",
  });

  const [filters, setFilters] = useState({
    year: [],
    gender: [],
    branch: [],
    status: "",
    cgpaMin: "",
    cgpaMax: "",
    search: "",
    page: 1,
    limit: 10,
    total_pages: 1,
  });

  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);

  const [availableYears, setAvailableYears] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availableGenders, setAvailableGenders] = useState([]);

  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Handle filter checkbox
  const handleCheckboxChange = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
      page: 1, // reset page on filter change
    }));
  };

  // 🔹 Handle input filter
  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  // 🔹 Escape CSV values
  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  // 🔹 Download CSV
  const downloadCSV = () => {
    if (!students.length) {
      alert("No students to export.");
      return;
    }

    const headers = [
      "id",
      "name",
      "email",
      "phone_number",
      "usn",
      "enrollment_number",
      "branch",
      "year_of_study",
      "semester",
      "cgpa",
      "gender",
      "is_active",
    ];

    const rows = students.map((s) =>
      [
        escapeCsv(s.id),
        escapeCsv(s.name),
        escapeCsv(s.email),
        escapeCsv(s.phone_number),
        escapeCsv(s.usn),
        escapeCsv(s.enrollment_number),
        escapeCsv(s.branch),
        escapeCsv(s.year_of_study),
        escapeCsv(s.semester),
        escapeCsv(s.cgpa),
        escapeCsv(s.gender),
        escapeCsv(s.is_active ? "Active" : "Inactive"),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🔹 Fetch Students
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      params.set("page", filters.page || 1);
      params.set(
        "per_page",
        filters.limit === "All" ? totalStudents : filters.limit || 10
      );
      if (filters.search) params.set("search", filters.search);
      if (filters.year.length)
        params.set("year_of_study", filters.year.join(","));
      if (filters.gender.length) params.set("gender", filters.gender.join(","));
      if (filters.branch.length) params.set("branch", filters.branch.join(","));
      if (filters.status) params.set("is_active", statusMap[filters.status]);
      if (filters.cgpaMin) params.set("min_cgpa", filters.cgpaMin);
      if (filters.cgpaMax) params.set("max_cgpa", filters.cgpaMax);

      const res = await privateAxios.get(`/students/list?${params.toString()}`);
      const data = res.data;

      if (!data.success) throw new Error("Failed to fetch students");

      setStudents(data.students || []);
      setTotalStudents(data.meta?.total || 0);
      setTotalPages(data.meta?.total_pages || 1);

      // 🔹 Update dynamic filters
      setAvailableYears((data.filters_meta.years || []).map((y) => y.value));
      setAvailableBranches(
        (data.filters_meta.branches || []).map((b) => b.value)
      );
      setAvailableGenders(
        (data.filters_meta.genders || []).map((g) => g.value)
      );
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, totalStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 🔹 Handle Add Student Form Submit
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await privateAxios.post("/students/add", newStudent);
      if (res.data.success) {
        alert("Student added successfully!");
        setShowAddModal(false);
        setNewStudent({
          name: "",
          email: "",
          phone_number: "",
          usn: "",
          branch: "",
          year_of_study: "",
          semester: "",
          cgpa: "",
          gender: "",
        });
        fetchStudents(); // refresh list
      } else {
        alert(res.data.message || "Failed to add student.");
      }
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Error adding student.");
    }
  };

  return (
    <div className="w-full pl-6">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BMSIT</h1>
            <p className="text-gray-600 text-lg">
              Total Students:{" "}
              <span className="font-semibold text-[#4CA466]">
                {totalStudents}
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#4CA466] hover:bg-[#3d8a54] text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>

        {/* 🔹 Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Add Student
              </h2>
              <form onSubmit={handleAddStudent} className="space-y-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Basic Information
                  </h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    required
                  />
                  {/* 🔹 New DOB Field */}
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={newStudent.dob}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, dob: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={newStudent.phone_number}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          phone_number: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                    <select
                      value={newStudent.gender}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, gender: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      {availableGenders.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="USN"
                      value={newStudent.usn}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, usn: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Enrollment Number"
                      value={newStudent.enrollment_number}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          enrollment_number: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Branch"
                    value={newStudent.branch}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, branch: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Year of Study"
                      value={newStudent.year_of_study}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          year_of_study: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                      min="1"
                      max="4"
                    />
                    <input
                      type="number"
                      placeholder="Semester"
                      value={newStudent.semester}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          semester: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                      min="1"
                      max="8"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="CGPA"
                      value={newStudent.cgpa}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, cgpa: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                {/* Address Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Address Information
                  </h3>
                  <textarea
                    placeholder="Address"
                    value={newStudent.address}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    rows="2"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={newStudent.city}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, city: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newStudent.state}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, state: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newStudent.pincode}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          pincode: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>

                {/* Guardian Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Guardian Name"
                      value={newStudent.guardian_name}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          guardian_name: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Guardian Contact"
                      value={newStudent.guardian_contact}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          guardian_contact: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Status
                  </h3>
                  <select
                    value={newStudent.is_active}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        is_active: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CA466] focus:border-transparent"
                  >
                    <option value="">Select Status</option>
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#4CA466] hover:bg-[#3d8a54] text-white px-6 py-2 rounded-md transition-colors duration-200 font-medium"
                  >
                    Save Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search students by name, USN, or email..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none transition-all"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                    page: 1,
                  }))
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="bg-[#4CA466] hover:bg-[#3d8a54] text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md"
              >
                Download All
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border-2 border-[#4CA466] text-[#4CA466] hover:bg-[#4CA466] hover:text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Filters {showFilters ? "−" : "+"}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Filter Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Year */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">
                  Year of Study
                </h4>
                <div className="space-y-2">
                  {availableYears.map((year) => (
                    <label key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.year.includes(year)}
                        onChange={() => handleCheckboxChange("year", year)}
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
                  {availableGenders.map((gender) => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(gender)}
                        onChange={() => handleCheckboxChange("gender", gender)}
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
                  {availableBranches.map((branch) => (
                    <label key={branch} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.branch.includes(branch)}
                        onChange={() => handleCheckboxChange("branch", branch)}
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
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* CGPA Range */}
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                <h4 className="font-medium text-gray-700 mb-3">CGPA Range</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={filters.cgpaMin}
                      onChange={(e) =>
                        handleInputChange("cgpaMin", e.target.value)
                      }
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={filters.cgpaMax}
                      onChange={(e) =>
                        handleInputChange("cgpaMax", e.target.value)
                      }
                      placeholder="10.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section (same as before) */}
        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Sl No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    USN
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Year
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    CGPA
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : students.length ? (
                  students.map((student, idx) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {student.usn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {student.year_of_study}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#4CA466]">
                        {student.cgpa}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            student.is_active === true
                              ? "bg-green-100 text-green-800"
                              : student.is_active === false
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-[#4CA466] hover:text-[#3d8a54] font-medium text-sm transition-colors"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          View More
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Showing results:</span>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: e.target.value, // store as string: "10", "20", "All"
                    page: 1,
                  }))
                }
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none text-sm"
              >
                {[10, 20, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
                <option value="All">All</option>
              </select>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2 text-sm">
              {/* Prev */}
              <button
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                className={`flex items-center justify-center w-8 h-8 rounded-md border ${
                  filters.page === 1
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-[#4CA466] border-[#4CA466] hover:bg-[#4CA466] hover:text-white"
                }`}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {(() => {
                const currentPage = filters.page || 1;
                const pages = [];

                // Always show first page
                if (currentPage > 2) pages.push(1);

                // Add ... if gap exists
                if (currentPage > 3) pages.push("...");

                // Previous page
                if (currentPage > 1) pages.push(currentPage - 1);

                // Current page
                pages.push(currentPage);

                // Next page
                if (currentPage < totalPages) pages.push(currentPage + 1);

                // Add ... if gap exists
                if (currentPage + 2 < totalPages) pages.push("...");

                // Always show last page if more than 1 page
                if (currentPage + 1 < totalPages) pages.push(totalPages);

                return pages.map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={idx}
                      className="flex items-center justify-center w-8 h-8 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setFilters((prev) => ({ ...prev, page }))}
                      className={`flex items-center justify-center w-8 h-8 rounded-md border ${
                        currentPage === page
                          ? "bg-[#4CA466] text-white border-[#4CA466]"
                          : "text-[#4CA466] border-[#4CA466] hover:bg-[#4CA466] hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                );
              })()}

              {/* Next */}
              <button
                disabled={filters.page >= totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                className={`flex items-center justify-center w-8 h-8 rounded-md border ${
                  filters.page >= totalPages
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-[#4CA466] border-[#4CA466] hover:bg-[#4CA466] hover:text-white"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyComponent;
