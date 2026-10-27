import LoginPage from './pages/loginPage'
import { Navigate, Routes, Route } from "react-router"
import TaskFormPage from './pages/taskFormPage'
import TasksPage from './pages/tasksPage'
import Footer from './components/footer'
import Header from './components/header'
import ProtectedRoute from './components/protectedRoute'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tasks/new" element={<ProtectedRoute><TaskFormPage /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskFormPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
export default App
