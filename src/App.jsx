// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BulkUploadPage from "./_Features/Students/AddStudents/Bulk/BulkUploadPage";
import Login from "./_Features/Auth/Login";
import ResetPassword from "./_Features/Auth/ResetPassword";
import Dashboard from "./_Features/Auth/Dashbaord"; // fixed typo
import { AuthProvider } from "./_Features/Auth/AuthContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./_Features/Auth/ProtectedRoute";
// import SideBar from "./components/SideBar"; // uncomment / adjust to your real path
import { useLocation } from "react-router-dom";
import Sidebar from "./utils/sidebar";
// import StudentsListPage from "./_Features/Students/Students";
import StudentList from "./_Features/Students/Students";
import MyComponent from "./_Features/Students/StudentDesing";
import StudentDetail from "./_Features/Students/StudentDetail";
import Test from "./_Features/Test";
const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  const hideSidebarRoutes = ["/login","/reset-password" ];
  const shouldHideSidebar = hideSidebarRoutes.includes(path);
  const showSidebar = !shouldHideSidebar;

  return (
    <div className="flex w-screen h-screen overflow-auto">
      {showSidebar && <Sidebar /> }
      <div className={`flex-1 ${showSidebar ? "ml-12 p-5 " : "m-0 p-0"} w-full h-full overflow-auto`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
 {/* Protected */}
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <Test />
                </ProtectedRoute>
              }
            />

            {/* Protected */}
            <Route
              path="/reset-password"
              element={
                <ProtectedRoute>
                  <ResetPassword />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/:id"
              element={
                <ProtectedRoute>
                  <StudentDetail/>
                </ProtectedRoute>
              }
            />
             <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentList/>
                </ProtectedRoute>
              }
            />
               <Route
              path="/student-design"
              element={
                <ProtectedRoute>
                  <MyComponent/>
                </ProtectedRoute>
              }
            />


            {/* Default: redirect root to dashboard */}
            <Route
              path="/students/bulk-upload"
              element={
                <ProtectedRoute>
                  <BulkUploadPage/>
                </ProtectedRoute>
              }
            />

            {/* catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
