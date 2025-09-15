// src/App.jsx
import React ,{useEffect} from "react";
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
// import Sidebar from "./utils/sidebar";
import Sidebar from "./utils/sidebar.tsx";
// import StudentsListPage from "./_Features/Students/Students";
import StudentList from "./_Features/Students//StudentList";
import StudentDetail from "./_Features/Students/StudentDetail";
import Test from "./_Features/Test";
import TestDetail from "./_Features/Test/TestDetail";
import { privateAxios } from "./utils/axios";
import ListMCQ from "./_Features/GlobalQuestions/MCQ";
import ListRearrange from "./_Features/GlobalQuestions/Rearrange";
import ListRearrangeQuestions from "./_Features/MyQuestions/Questions/Rearrange/ListRearrange";
import ListCoding from "./_Features/GlobalQuestions/Coding";
import CodeBuilder from "./_Features/MyQuestions/Questions/Coding/CodingBuilder";
import QuestionList from "./_Features/MyQuestions/Questions/Coding/Questions";
import CodeRunner from "./_Features/CodeRunner/index"
import EditQuestionBuilder from "./_Features/MyQuestions/Questions/MCQ/Edit/EditQuestionBuilder"
import AddMCQQuestion from "./_Features/MyQuestions/Questions/MCQ/AddMCQ"
import ListMCQQuestions from "./_Features/MyQuestions/Questions/MCQ/ListMCQ"
import EditRearrangeBuilder from "./_Features/MyQuestions/Questions/Rearrange/Edit/EditQuestionBuilder"
import RearrangeBuilder from "./_Features/MyQuestions/Questions/Rearrange/RearrangeBuilder"
const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  // Exact routes where sidebar should be hidden
  const hideSidebarRoutes = ["/login", "/reset-password"];

  // Dynamic routes (patterns) where sidebar should also be hidden
  const hideSidebarPatterns = [
    /^\/test\/[^/]+\/testbuilder$/,                 // TestBuilder
    /^\/questions\/coding\/[^/]+\/code-builder$/,   // CodeBuilder
    /^\/[^/]+\/[^/]+\/preview$/                     // CodeRunner
  ];

  const shouldHideSidebar =
    hideSidebarRoutes.includes(path) ||
    hideSidebarPatterns.some((pattern) => pattern.test(path));

  const showSidebar = !shouldHideSidebar;

  return (
    <div className="flex w-screen h-screen overflow-auto">
      {showSidebar && <Sidebar /> }
      <div className={`flex-1 ${showSidebar ? "ml-12 p-18 " : "m-0 p-0"} w-full h-full overflow-auto`}>
        {children}
      </div>
    </div>
  );
};

function App() {
    // useEffect(() => {
   
  
     
    //   const fetchQuestions = async () => {
    //     try {
    //       // GET /sections/<section_id>/questions
    //       const resp = await privateAxios.get(`/test/questions/coding/`)
  
    //       // The backend returns a response like: { success: true, message: "...", data: [...] }
    //       // Adjust if your backend shape differs.
    //       const payload = resp && resp.data ? resp.data : resp;
    //       console.log(payload)
  
        
    //     } catch (err) {
        
    //           console.log(err);
             
    //       }
    //   };
  
    //   fetchQuestions();
  
    // }, []);
  
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
            
            <Route
              path="/test/:testId/testbuilder"
              element={
                <ProtectedRoute>
                  <TestDetail />
                </ProtectedRoute>
              }
            />  <Route
              path="/myqs/mcq"
              element={
                <ProtectedRoute >
                  <ListMCQQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/mcq/:id/edit"
              element={
                <ProtectedRoute >
                  <EditQuestionBuilder />
                </ProtectedRoute>
              }
            />
    <Route
              path="/questions/mcq/add"
              element={
                <ProtectedRoute>
                  <AddMCQQuestion />
                </ProtectedRoute>
              }
            />
              
              
                <Route
              path="/questions/rearrange/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRearrangeBuilder />
                </ProtectedRoute>
              }
            />
            
              <Route
              path="/questions/rearrange/add"
              element={
                <ProtectedRoute>
                  <RearrangeBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myqs/rearrange"
              element={
                <ProtectedRoute >
                  <ListRearrangeQuestions />
                </ProtectedRoute>
              }
            />
            
             <Route
              path="/questions/coding/:questionId/code-builder"
              element={
                <ProtectedRoute>
                  <CodeBuilder />
                </ProtectedRoute>
              }
            />
             <Route
              path="/myqs/coding"
              element={
                <ProtectedRoute>
                  <QuestionList />
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
              path="/students/:studentId"
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


            {/* Default: redirect root to dashboard */}
            <Route
              path="/students/bulk-upload"
              element={
                <ProtectedRoute>
                  <BulkUploadPage/>
                </ProtectedRoute>
              }
            />
                  <Route
              path="/global/mcq"
              element={
                <ProtectedRoute>
                  <ListMCQ/>
                </ProtectedRoute>
              }
            />
              <Route
              path="/:collection/:questionId/preview"
              element={
                <ProtectedRoute>
                  <CodeRunner/>
                </ProtectedRoute>
              }
            />
                   <Route
              path="/global/rearrange"
              element={
                <ProtectedRoute>
                  <ListRearrange/>
                </ProtectedRoute>
              }
            />
             <Route
              path="/global/coding"
              element={
                <ProtectedRoute>
                  <ListCoding/>
                </ProtectedRoute>
              }
            />
  
  
            {/* catch-all */}
            <Route path="*" element={<Navigate to="/students" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
