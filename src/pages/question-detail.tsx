import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Question, Answer } from '../types';
import { api } from '../services/api';
import RichTextEditor from '../components/rich-text-editor';
import AnswerEditor from '../components/answer-editor';

export default function QuestionDetail() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    api.questions.getById(1).then(data => {
      setQuestion(data);
      setLoading(false);
    });
  }, []);

  const handleAnswerSubmit = (answerContent: string) => {
    // Handle answer submission here
    console.log('Answer submitted:', answerContent);
  };

  if (loading || !question) {
    return (
      <div className="pt-20 flex justify-center">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="w-full max-w-5xl p-8 bg-white/50 backdrop-blur-xl rounded-2xl animate-pulse"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-20 pb-12 px-4 flex justify-center"
    >
      <div className="w-full max-w-5xl">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-indigo-100">
          <div className="p-8 border-b border-indigo-100">
            <div className="flex flex-col gap-4">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold text-slate-900"
              >
                {question.title}
              </motion.h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Asked {new Date(question.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {question.viewedCounter} views
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </motion.button>
                
                <span className="text-2xl font-bold text-slate-700">42</span>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                {question.isSolved && (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-2 text-emerald-500 bg-emerald-50 rounded-xl"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </motion.div>
                )}
              </div>

              <div className="flex-1">
                <div className="prose prose-indigo max-w-none
                           prose-headings:text-slate-900 prose-headings:font-bold
                           prose-p:text-slate-700 prose-p:leading-relaxed
                           prose-strong:text-slate-900 prose-strong:font-semibold
                           prose-code:text-indigo-600 prose-code:bg-indigo-50 
                           prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                           prose-pre:bg-indigo-50 prose-pre:p-4 prose-pre:rounded-lg
                           prose-a:text-indigo-600 hover:prose-a:text-indigo-700"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {question.languages.map(lang => (
                    <motion.span
                      key={lang}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 rounded-full text-xs font-medium
                               bg-indigo-50 text-indigo-600 hover:bg-indigo-100
                               transition-all duration-300 cursor-pointer"
                    >
                      {lang}
                    </motion.span>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-8 pt-4 border-t border-indigo-100">
                  <div className="flex gap-4">
                    {['Share', 'Edit', 'Follow'].map(action => (
                      <button key={action} className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                        {action}
                      </button>
                    ))}
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 bg-indigo-50 rounded-xl p-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 
                                  rounded-xl flex items-center justify-center text-white font-bold text-lg
                                  shadow-lg shadow-indigo-500/20">
                      {question.user?.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {question.user?.username}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(question.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow-lg rounded-2xl border border-indigo-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">2 Answers</h2>
            <AnswerEditor onSubmit={handleAnswerSubmit} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
