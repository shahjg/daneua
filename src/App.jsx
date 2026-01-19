import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import UsPage from './pages/UsPage'
import PlansPage from './pages/PlansPage'
import GoalsPage from './pages/GoalsPage'
import IdeasPage from './pages/IdeasPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="us" element={<UsPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="ideas" element={<IdeasPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
