import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '../types';
import { api } from '../services/api';
import QuestionCard from '../components/question-cards';

interface QuestionsProps {
  onQuestionClick: (questionId: number) => void;
}

export default function Questions({ onQuestionClick }: QuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.questions.getAll()
      .then(data => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

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
        
        <button className="bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary
                       text-theme-text-primary px-6 py-2.5 rounded-xl font-medium 
                       hover:opacity-90 transition-all duration-300">
          Ask Question
        </button>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto 
                    scrollbar-thin scrollbar-thumb-aurora-purple/20 scrollbar-track-transparent
                    pr-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(n => (
              <div key={n} className="bg-theme-bg-secondary backdrop-blur-xl rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-theme-accent-primary/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-theme-accent-primary/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </motion.div>
  );
}
