import { useState, useEffect } from 'react';
import { Question, Answer } from '../types';
import { api } from '../services/api';

export default function QuestionDetail() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    api.questions.getById(1).then(data => {
      setQuestion(data);
      setLoading(false);
    });
  }, []);

  if (loading || !question) {
    return (
      <div className="pt-20 animate-pulse">
        <div className="bg-theme-bg-card/50 backdrop-blur-xl p-8 rounded-2xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto bg-theme-bg-card/90 backdrop-blur-xl rounded-2xl 
                    shadow-xl shadow-theme-accent-primary/5 border border-theme-accent-primary/10">
        <div className="p-8 border-b border-theme-border-light">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-theme-text-primary mb-4">{question.title}</h1>
            <button className="bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary
                           text-white px-6 py-2 rounded-xl hover:opacity-90 
                           transition-all duration-300">
              Ask Question
            </button>
          </div>
          
          <div className="flex gap-4 text-sm text-theme-text-muted">
            <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
            <span>Viewed {question.viewedCounter} times</span>
          </div>
        </div>

        <div className="p-8">
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2">
              <button className="p-2 hover:bg-theme-bg-card rounded-full transition-colors">
                <svg className="w-6 h-6 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="text-xl font-bold text-theme-text-primary">42</span>
              <button className="p-2 hover:bg-theme-bg-card rounded-full transition-colors">
                <svg className="w-6 h-6 text-theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {question.isSolved && (
                <button className="p-2 text-green hover:bg-green-50 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1">
              <div className="prose max-w-none">
                <p className="text-theme-text-primary leading-relaxed">
                  {question.description}
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                {question.languages.map(lang => (
                  <span 
                    key={lang}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-theme-bg-card text-theme-text-primary 
                             border border-theme-border-light hover:bg-theme-bg-card transition-all duration-300 
                             cursor-pointer animate-pulse-slow"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mt-8 pt-4 border-t border-theme-border-light">
                <div className="flex gap-4">
                  <button className="text-theme-text-muted hover:text-theme-text-primary text-sm">Share</button>
                  <button className="text-theme-text-muted hover:text-theme-text-primary text-sm">Edit</button>
                  <button className="text-theme-text-muted hover:text-theme-text-primary text-sm">Follow</button>
                </div>
                
                <div className="flex items-start gap-2 bg-theme-bg-card rounded-lg p-4 animate-fade-in">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-theme-accent-primary to-theme-accent-secondary 
                                  rounded-lg flex items-center justify-center text-white font-bold text-lg
                                  shadow-lg">
                      {question.user?.username[0].toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="text-theme-text-muted">Asked by </span>
                      <a href="#" className="text-theme-accent-primary hover:text-theme-accent-secondary font-medium">
                        {question.user?.username}
                      </a>
                    </div>
                    <div className="text-xs text-theme-text-muted">
                      on {new Date(question.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-theme-border-light bg-theme-bg-card">
          <div className="p-8">
            <h2 className="text-xl font-bold text-theme-text-primary mb-6">2 Answers</h2>
            
            <div className="bg-theme-bg-card rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-theme-text-primary mb-4">Your Answer</h3>
              <textarea 
                className="w-full h-32 p-4 border border-theme-border-light rounded-lg focus:ring-2 
                         focus:ring-theme-accent-primary focus:border-transparent transition-all duration-300"
                placeholder="Write your answer here..."
              />
              <div className="mt-4">
                <button className="bg-gradient-to-r from-theme-accent-primary to-theme-accent-secondary
                               text-white px-6 py-2 rounded-xl hover:opacity-90 
                               transition-all duration-300">
                  Post Your Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
