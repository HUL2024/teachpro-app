import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import PullToRefresh from './components/PullToRefresh'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Lesson from './pages/Lesson'
import FinalAssessment from './pages/FinalAssessment'
import Certificates from './pages/Certificates'
import MyLearning from './pages/MyLearning'
import Profile from './pages/Profile'
import About from './pages/About'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import AdminDashboard from './pages/admin/AdminDashboard'
import UpdateChecker from './components/UpdateChecker'

function Protected({ children }: { children: React.ReactNode }) {
  const { currentUser, currentAdmin, loading, refreshAll } = useApp()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] text-gray-400 text-sm">
        Loading…
      </div>
    )
  }
  // Admins have no learner profile at all, so they never belong in the
  // student-facing views -- send them to their own dashboard instead.
  if (!currentUser && currentAdmin) return <Navigate to="/admin" replace />
  if (!currentUser) return <Navigate to="/login" replace />
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f5f7fa] relative">
      <PullToRefresh onRefresh={refreshAll}>{children}</PullToRefresh>
      <BottomNav />
    </div>
  )
}

// Admin screens get their own layout -- no student bottom nav, no mobile
// width cap -- since the admin dashboard is meant to be used from a desktop
// browser, not the phone app.
function AdminProtected({ children }: { children: React.ReactNode }) {
  const { currentUser, currentAdmin, demoMode, loading } = useApp()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400 text-sm">
        Loading…
      </div>
    )
  }
  if (demoMode) {
    // No real admin/learner split locally -- just require being logged in
    // at all, so the admin UI can still be tested.
    if (!currentUser) return <Navigate to="/login" replace />
    return <div className="min-h-screen bg-[#f5f7fa]">{children}</div>
  }
  if (!currentAdmin && currentUser) return <Navigate to="/" replace />
  if (!currentAdmin) return <Navigate to="/login" replace />
  return <div className="min-h-screen bg-[#f5f7fa]">{children}</div>
}

// If an admin account lands on the root URL (e.g. reopening the app with an
// existing session), send them straight to the Admin Dashboard instead of
// the student home screen.
function RootEntry() {
  const { currentAdmin, demoMode } = useApp()
  if (currentAdmin && !demoMode) return <Navigate to="/admin" replace />
  return <Dashboard />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <Protected>
            <RootEntry />
          </Protected>
        }
      />
      <Route
        path="/courses"
        element={
          <Protected>
            <Courses />
          </Protected>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <Protected>
            <CourseDetail />
          </Protected>
        }
      />
      <Route
        path="/courses/:courseId/lessons/:lessonId"
        element={
          <Protected>
            <Lesson />
          </Protected>
        }
      />
      <Route
        path="/courses/:courseId/final-assessment"
        element={
          <Protected>
            <FinalAssessment />
          </Protected>
        }
      />
      <Route
        path="/certificates"
        element={
          <Protected>
            <Certificates />
          </Protected>
        }
      />
      <Route
        path="/my-learning"
        element={
          <Protected>
            <MyLearning />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <Profile />
          </Protected>
        }
      />
      <Route
        path="/about"
        element={
          <Protected>
            <About />
          </Protected>
        }
      />
      <Route
        path="/terms"
        element={
          <Protected>
            <Terms />
          </Protected>
        }
      />
      <Route
        path="/privacy"
        element={
          <Protected>
            <Privacy />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProtected>
            <AdminDashboard />
          </AdminProtected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <UpdateChecker />
    </AppProvider>
  )
}
