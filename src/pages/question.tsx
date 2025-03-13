import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '../types';
import { api } from '../services/api';
import QuestionCard from '../components/question-cards';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/user-service';

interface QuestionsProps {
  onQuestionClick: (questionId: number) => void;
  onAskQuestion?: () => void;
}

export default function Questions({ onQuestionClick, onAskQuestion }: QuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    
    setLoading(false);
    setQuestions([]);
  }, []);

  const handleAskQuestion = () => {
    if (onAskQuestion) {
      onAskQuestion();
    } else {
      window.location.href = '/ask-question';
    }
  };

  const handleLogout = () => {
    userService.logout();
    navigate('/login', { replace: true }); 
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-20"
    >
      <div className="flex justify-between items-center mb-8 sticky top-20 py-4 
                    bg-theme-bg-primary/80 backdrop-blur-xl z-10">
        <div>
          <h1 className="text-3xl font-bold text-theme-text-primary">All Questions</h1>
          <p className="text-theme-text-muted mt-1">{questions.length} questions</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAskQuestion}
            className="bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary
                       text-theme-text-primary px-6 py-2.5 rounded-xl font-medium 
                       hover:opacity-90 transition-all duration-300">
            Ask Question
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors
                     flex items-center gap-2 rounded-lg hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto 
                    scrollbar-thin scrollbar-thumb-aurora-purple/20 scrollbar-track-transparent
                    pr-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-theme-bg-secondary backdrop-blur-xl rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-theme-accent-primary/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-theme-accent-primary/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onClick={() => onQuestionClick(question.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-theme-text-muted mb-4">No questions found</p>
            <button
              onClick={handleAskQuestion}
              className="bg-primary-color text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
            >
              Be the first to ask a question
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
