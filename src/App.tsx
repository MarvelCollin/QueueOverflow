import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/header';
import Sidebar from './components/side-bar';
import Questions from './pages/question';
import QuestionDetail from './pages/question-detail';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import { userService } from './services/user-service';
import { ToastProvider, useToast } from './components/toast';
import "./App.css";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = userService.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {

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

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestionId(questionId);
    navigate(`/questions/${questionId}`);
  };


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
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/questions" element={
                  <ProtectedRoute>
                    <QuestionsWithRouter />
                  </ProtectedRoute>
                } />
                <Route path="/questions/:id" element={
                  <ProtectedRoute>
                    <QuestionDetail questionId={selectedQuestionId} onBack={() => navigate('/questions')} />
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
