import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import "./index.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setView('detail');
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary text-theme-text-primary overflow-hidden">
      {/* Enhanced background effects */}
      <div className="fixed inset-0">
        {/* Colorful gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-theme-accent-primary/10 via-theme-bg-primary to-theme-accent-secondary/10" />
        
        {/* Animated colorful orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-theme-accent-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-theme-accent-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-theme-accent-blue/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-theme-accent-yellow/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000" />
        
        {/* Grain effect */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("/noise.png")', backgroundRepeat: 'repeat' }} />
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
