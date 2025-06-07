import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/header';
import Sidebar from './components/side-bar';
import Questions from './pages/question';
import QuestionDetail from './pages/question-detail';
import AskQuestion from './pages/ask-question';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import Profile from './pages/profile';
import EditProfile from './pages/edit-profile';
import ChangePassword from './pages/change-password';
import { userService } from './services/user-service';
import { ToastProvider, useToast } from './components/toast';
import "./App.css";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = userService.isAuthenticated();
  const isGuest = userService.isGuest();
  const location = useLocation();

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}


function QuestionsWithRouter() {
  const navigate = useNavigate();

  return (
    <Questions
      onQuestionClick={(id) => navigate(`/questions/${id}`)}
      onAskQuestion={() => navigate('/ask-question')}
    />
  );
}

function QuestionDetailWithRouter() {
  const params = useParams();
  const navigate = useNavigate();
  const questionId = params.id ? parseInt(params.id, 10) : 0;
  
  return (
    <QuestionDetail 
      questionId={questionId}
      onBack={() => navigate('/questions')}
    />
  );
}

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState === null ? true : savedState === 'true';
  });
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuestionClick = (questionId: number) => {
    navigate(`/questions/${questionId}`);
  };

    useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await userService.getCurrentUser();
    };

    checkAuth();
  }, [showToast]);


  const handleLogout = () => {
    userService.logout();
    showToast('info', 'You have been logged out');
    navigate('/login');
  };


  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-1 animate-gradient" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-sky-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {!isAuthPage && (
          <Header
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onLogout={handleLogout}
            user={userService.getUser()}
          />
        )}

        <div className="flex">
          {!isAuthPage && <Sidebar isOpen={isSidebarOpen} />}

          <main className={`flex-1 transition-all duration-300 ${!isAuthPage && isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <div className="container mx-auto px-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/questions" element={
                  <ProtectedRoute>
                    <QuestionsWithRouter />
                  </ProtectedRoute>
                } />
                <Route path="/questions/:id" element={
                  <ProtectedRoute>
                    <QuestionDetailWithRouter />
                  </ProtectedRoute>
                } />
                <Route path="/ask-question" element={
                  <ProtectedRoute>
                    <AskQuestion />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/edit-profile" element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } />
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}
