import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import PostDetailPage from './pages/PostDetailPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f', color: '#f3f4f6' }}>
      <Navbar />
      <div key={location.pathname} className="page-fade">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:topicSlug" element={<TopicPage />} />
        <Route path="/topic/:topicSlug/post/:postId" element={<PostDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
      </div>
    </div>
  )
}
