import { motion } from 'framer-motion';
import { Question } from '../types';
import { userService } from '../services/user-service';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { useState, useEffect } from 'react';

interface QuestionCardProps {
  question: Question;
  index: number;
  onClick: () => void;
  highlightTerm?: string;
}

function QuestionCard({ question, index, onClick, highlightTerm }: QuestionCardProps) {
  const highlightText = (text: string, term: string) => {
    if (!term || !text) return text;
    
    if (text.includes('<') && text.includes('>')) {
      return text;
    }
    
    const terms = term.split(' ').filter(t => t.trim() !== '');
    
    let result = text;
    terms.forEach(singleTerm => {
      const regex = new RegExp(`(${singleTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '<mark class="bg-yellow-200 text-indigo-900 rounded px-0.5">$1</mark>');
    });
    
    return result;
  };
  
  const title = highlightTerm 
    ? <span dangerouslySetInnerHTML={{ __html: highlightText(question.title, highlightTerm) }} />
    : question.title;
    
  const truncatedDescription = question.description.length > 150
    ? question.description.substring(0, 150) + '...'
    : question.description;
    
  const description = highlightTerm 
    ? <span dangerouslySetInnerHTML={{ 
        __html: highlightText(
          truncatedDescription.replace(/<[^>]*>/g, ''), 
          highlightTerm
        ) 
      }} />
    : truncatedDescription.replace(/<[^>]*>/g, '');
  
  const hasMatchingTag = highlightTerm && question.languages.some(
    lang => lang.toLowerCase().includes(highlightTerm.toLowerCase())
  );

  const [userReputation, setUserReputation] = useState<number>(0);
  
  useEffect(() => {
    const loadUserReputation = async () => {
      try {
        if (question.userId) {
          const user = await userService.getUserById(question.userId);
          if (user) {
            setUserReputation(user.reputation || 0);
          }
        }
      } catch (error) {
        console.error('Failed to load user reputation:', error);
      }
    };
    
    loadUserReputation();
  }, [question.userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      className={`group ${hasMatchingTag ? 'ring-2 ring-yellow-200 ring-opacity-50' : ''}`}
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-indigo-50 p-6 
                    transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center justify-center w-20 p-2 rounded-xl 
                         bg-gradient-to-b from-indigo-50 to-indigo-100 text-indigo-700 text-center">
              <span className="block text-xl font-bold">{question.votes?.upvotes || 0}</span>
              <span className="text-xs text-indigo-500">votes</span>
            </div>

            <div className="flex flex-col items-center justify-center w-20 p-2 rounded-xl 
                        bg-gradient-to-b from-purple-50 to-purple-100 text-purple-700 text-center">
              <span className="block text-xl font-bold">{question.viewedCounter}</span>
              <span className="text-xs text-purple-500">views</span>
            </div>

            {question.isSolved && (
              <div className="w-20 p-2 rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100 
                          text-emerald-600 text-center">
                <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span className="text-xs mt-1 font-medium">solved</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-indigo-900 
                       group-hover:text-indigo-600 transition-colors duration-300">
              {title}
            </h2>
            <p className="mt-2 text-slate-600 line-clamp-2
                       group-hover:text-slate-800 transition-colors duration-300">
              {description}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {question.languages.map(lang => {
                const isHighlighted = highlightTerm && 
                  lang.toLowerCase().includes(highlightTerm.toLowerCase());
                
                return (
                  <motion.span
                    key={lang}
                    whileHover={{ scale: 1.05 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium
                            transition-all duration-200
                            ${isHighlighted 
                              ? 'bg-yellow-100 text-amber-700 border border-amber-200' 
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    {isHighlighted ? (
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightText(lang, highlightTerm) 
                      }} />
                    ) : lang}
                  </motion.span>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-indigo-50">
              <Tippy
                content={
                  <div className="p-2 max-w-xs">
                    <div className="font-medium text-indigo-800">{question.user?.username}</div>
                    {question.user?.email && (
                      <div className="text-xs text-slate-600 mt-1">{question.user.email}</div>
                    )}
                    <div className="text-xs flex items-center gap-1 text-amber-600 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{userReputation} reputation</span>
                    </div>
                  </div>
                }
                placement="top"
                theme="light"
                delay={[300, 0]}
                animation="fade"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
                              text-white font-bold flex items-center justify-center
                              shadow-sm group-hover:shadow-md transition-all">
                    {highlightTerm && question.user?.username && 
                     question.user.username.toLowerCase().includes(highlightTerm.toLowerCase()) ? (
                      <span className="bg-yellow-200 text-indigo-900 w-full h-full flex items-center justify-center rounded-xl">
                        {question.user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    ) : (
                      question.user?.username?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="text-slate-800 font-medium">
                      {highlightTerm && question.user?.username && 
                       question.user.username.toLowerCase().includes(highlightTerm.toLowerCase()) ? (
                        <span dangerouslySetInnerHTML={{ 
                          __html: highlightText(question.user.username, highlightTerm) 
                        }} />
                      ) : (
                        question.user?.username
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(question.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </Tippy>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className="text-sm font-medium">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default QuestionCard;
