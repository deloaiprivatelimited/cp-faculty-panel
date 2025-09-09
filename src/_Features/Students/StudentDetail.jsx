// src/_Features/Students/StudentDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { privateAxios } from "../../utils/axios";
import {
  Edit3,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Trash2,
  MapPin,
  GraduationCap,
  Calendar,
  Hash,
  ArrowLeft,
} from "lucide-react";

function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  // Fetch student data
  useEffect(() => {
    setLoading(true);
    privateAxios
      .get(`/students/${studentId}`)
      .then((res) => {
        if (res.data.success) setStudent(res.data.student);
        else alert(res.data.message || "Failed to fetch student");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Error fetching student");
        setLoading(false);
      });
  }, [studentId]);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowPasswordModal(false);
    if (showPasswordModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showPasswordModal]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showPasswordModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showPasswordModal]);

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValues({ [field]: student[field] ?? "" });
  };

  const handleSave = async (field) => {
    try {
      const updatedField = { [field]: editValues[field] };
      const res = await privateAxios.patch(
        `/students/${studentId}`,
        updatedField
      );
      if (res.data.success) {
        setStudent(res.data.student);
        setEditingField(null);
        setEditValues({});
      } else alert(res.data.message || "Failed to update field");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Error updating student");
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const passwordChecks = (pw) => ({
    length: pw.length >= 8,
    lowercase: /[a-z]/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  });

  const calculateStrength = (pw) => {
    const checks = passwordChecks(pw);
    const passed = Object.values(checks).filter(Boolean).length;
    const percent = Math.round((passed / Object.keys(checks).length) * 100);
    let label = "Very Weak";
    if (percent >= 80) label = "Strong";
    else if (percent >= 60) label = "Good";
    else if (percent >= 40) label = "Fair";
    else label = "Weak";
    return { percent, label, checks };
  };

  const {
    percent: strengthPercent = 0,
    label: strengthLabel = "Very Weak",
    checks: strengthChecks = {},
  } = calculateStrength(passwordData.new_password);

  const passwordsMatch =
    passwordData.new_password &&
    passwordData.new_password === passwordData.confirm_password;
  const strengthOk = strengthPercent >= 60;
  const canSubmitPassword = passwordsMatch && strengthOk;

  const handlePasswordChange = async () => {
    if (!passwordsMatch) return alert("Passwords do not match");
    if (!strengthOk) return alert("Password is not strong enough");
    try {
      await privateAxios.post(`/students/${studentId}/change-password`, {
        new_password: passwordData.new_password,
        force: true,
      });
      setPasswordData({ new_password: "", confirm_password: "" });
      setShowPasswordModal(false);
      alert("Password changed successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to change password");
    }
  };

  // Add this function inside StudentDetail component
  const handleDeleteStudent = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete student "${student.name}"? This action cannot be undone.`
      )
    ) {
      try {
        const res = await privateAxios.delete(`/students/${studentId}`);
        if (res.data.success) {
          alert(res.data.message || "Student deleted successfully");
          navigate("/students"); // redirect to students list
        } else {
          alert(res.data.message || "Failed to delete student");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting student");
      }
    }
  };

  const togglePasswordVisibility = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const renderEditableField = (field, label, icon, type = "text") => {
    const isEditing = editingField === field;
    const value = isEditing ? editValues[field] : student?.[field] ?? "";
    return (
      <div key={field} className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {icon}
            <label className="font-medium text-gray-700 ml-2">{label}</label>
          </div>
          {!isEditing ? (
            <button
              onClick={() => handleEdit(field)}
              className="text-[#4CA466] hover:text-[#3d8a54] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(field)}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <input
            type={type}
            value={value}
            onChange={(e) =>
              setEditValues({ ...editValues, [field]: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
            autoFocus
          />
        ) : (
          <p className="text-gray-800 font-medium">{value || "Not provided"}</p>
        )}
      </div>
    );
  };

  const renderSelectField = (field, label, icon, options) => {
    const isEditing = editingField === field;
    const value = isEditing ? editValues[field] : student?.[field] ?? "";
    return (
      <div key={field} className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {icon}
            <label className="font-medium text-gray-700 ml-2">{label}</label>
          </div>
          {!isEditing ? (
            <button
              onClick={() => handleEdit(field)}
              className="text-[#4CA466] hover:text-[#3d8a54] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSave(field)}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          <select
            value={value}
            onChange={(e) =>
              setEditValues({ ...editValues, [field]: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
            autoFocus
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-800 font-medium">{value || "Not provided"}</p>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CA466]" />
      </div>
    );

  if (!student)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow">
          <p className="text-center text-red-600">Student not found</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="px-6 py-4 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="border border-gray-300 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                const res = await privateAxios.patch(`/students/${studentId}`, {
                  is_active: !student.is_active,
                });
                if (res.data.success) setStudent(res.data.student);
                else alert(res.data.message || "Failed to update status");
              } catch (err) {
                console.error(err);
                alert("Error updating status");
              }
            }}
            className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${
              student.is_active ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <span
              className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-md transition-transform ${
                student.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-[#4CA466] text-white px-4 py-2 rounded-lg hover:bg-[#3d8a54] transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> Change Password
          </button>

          {/* Delete Student button */}
          <button
            onClick={handleDeleteStudent}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col  py-2 px-4">
          <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
          <p className="text-sm text-gray-500">
            {student.usn} • {student.branch}
          </p>
        </div>
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderEditableField(
              "name",
              "Full Name",
              <User className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "email",
              "Email",
              <Mail className="w-4 h-4 text-gray-500" />,
              "email"
            )}
            {renderEditableField(
              "phone_number",
              "Phone Number",
              <Phone className="w-4 h-4 text-gray-500" />
            )}
            {renderSelectField(
              "gender",
              "Gender",
              <User className="w-4 h-4 text-gray-500" />,
              ["Male", "Female", "Other"]
            )}
            {renderEditableField(
              "date_of_birth",
              "Date of Birth",
              <Calendar className="w-4 h-4 text-gray-500" />,
              "date"
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderEditableField(
              "address",
              "Address",
              <MapPin className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "city",
              "City",
              <MapPin className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "state",
              "State",
              <MapPin className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "pincode",
              "Pincode",
              <MapPin className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderEditableField(
              "usn",
              "USN",
              <Hash className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "enrollment_number",
              "Enrollment Number",
              <Hash className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "branch",
              "Branch",
              <GraduationCap className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "year_of_study",
              "Year of Study",
              <GraduationCap className="w-4 h-4 text-gray-500" />,
              "number"
            )}
            {renderEditableField(
              "semester",
              "Semester",
              <GraduationCap className="w-4 h-4 text-gray-500" />,
              "number"
            )}
            {renderEditableField(
              "cgpa",
              "CGPA",
              <GraduationCap className="w-4 h-4 text-gray-500" />,
              "number"
            )}
          </div>
        </div>

        {/* Guardian & Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Guardian & Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderEditableField(
              "guardian_name",
              "Guardian Name",
              <User className="w-4 h-4 text-gray-500" />
            )}
            {renderEditableField(
              "guardian_contact",
              "Guardian Contact",
              <Phone className="w-4 h-4 text-gray-500" />
            )}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Account Status</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="password-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPasswordModal(false)}
          />

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3
                id="password-modal-title"
                className="text-lg font-semibold flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-600 hover:text-gray-800"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Responsive grid: 1 col on small, 2 on sm, 3 on lg */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                    placeholder="Enter new password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Strength bar */}
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${strengthPercent}%`,
                        background:
                          strengthPercent >= 80
                            ? "#16a34a"
                            : strengthPercent >= 60
                            ? "#f59e0b"
                            : "#ef4444",
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                    <span>{strengthLabel}</span>
                    <span>{strengthPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4CA466] focus:border-[#4CA466] outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2 text-xs">
                  {!passwordsMatch &&
                  passwordData.confirm_password.length > 0 ? (
                    <p className="text-red-600">Passwords do not match.</p>
                  ) : null}
                  {passwordsMatch &&
                  passwordData.confirm_password.length > 0 ? (
                    <p className="text-green-700">Passwords match.</p>
                  ) : null}
                </div>
              </div>

              {/* Password rules checklist */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-1 bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Password requirements
                </p>
                <ul className="text-xs space-y-1">
                  <li
                    className={
                      strengthChecks.length ? "text-green-700" : "text-gray-600"
                    }
                  >
                    {strengthChecks.length ? "✓" : "○"} At least 8 characters
                  </li>
                  <li
                    className={
                      strengthChecks.lowercase
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    {strengthChecks.lowercase ? "✓" : "○"} Lowercase letter
                  </li>
                  <li
                    className={
                      strengthChecks.uppercase
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    {strengthChecks.uppercase ? "✓" : "○"} Uppercase letter
                  </li>
                  <li
                    className={
                      strengthChecks.number ? "text-green-700" : "text-gray-600"
                    }
                  >
                    {strengthChecks.number ? "✓" : "○"} Number (0-9)
                  </li>
                  <li
                    className={
                      strengthChecks.special
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    {strengthChecks.special ? "✓" : "○"} Special character
                    (!@#$...)
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handlePasswordChange}
                disabled={!canSubmitPassword}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  canSubmitPassword
                    ? "bg-[#4CA466] hover:bg-[#3d8a54] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ new_password: "", confirm_password: "" });
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDetail;
