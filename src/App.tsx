import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/header';
import Sidebar from './components/side-bar';
import Questions from './pages/question';
import QuestionDetail from './pages/question-detail';
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setView('detail');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-1 animate-gradient" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-sky-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} />
          
          <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <div className="container mx-auto px-6">
              {view === 'list' ? (
                <Questions onQuestionClick={handleQuestionClick} />
              ) : (
                <QuestionDetail 
                  questionId={selectedQuestionId} 
                  onBack={() => setView('list')}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
