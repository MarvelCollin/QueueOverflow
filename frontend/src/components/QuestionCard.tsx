import { motion } from 'framer-motion';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  index: number;
  onClick: () => void;
}

export default function QuestionCard({ question, index, onClick }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="bg-gradient-to-r from-theme-bg-card/90 to-theme-bg-card/80
                   backdrop-blur-xl rounded-2xl p-6 border border-theme-accent-primary/10
                   hover:border-theme-accent-primary/30 transition-all duration-500">
        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-20 p-3 rounded-xl bg-theme-accent-blue/10 
                      text-theme-accent-blue group-hover:bg-theme-accent-blue/20 
                      transition-colors text-center"
            >
              <span className="block text-xl font-bold">{question.viewedCounter}</span>
              <span className="text-xs text-theme-text-muted">views</span>
            </motion.div>

            {question.isSolved && (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-20 p-2 rounded-xl bg-theme-accent-green/10 
                        text-theme-accent-green flex flex-col items-center
                        group-hover:bg-theme-accent-green/20 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <span className="text-xs mt-1">solved</span>
              </motion.div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-theme-text-primary 
                       group-hover:text-theme-accent-primary transition-colors duration-300">
              {question.title}
            </h2>
            <p className="mt-2 text-theme-text-muted line-clamp-2
                       group-hover:text-theme-text-secondary transition-colors duration-300">
              {question.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {question.languages.map(lang => (
                <motion.span
                  key={lang}
                  whileHover={{ scale: 1.1 }}
                  className="px-3 py-1 rounded-full text-xs font-medium
                          bg-theme-accent-primary/10 text-theme-accent-primary
                          hover:bg-theme-accent-primary hover:text-white
                          transition-all duration-300"
                >
                  {lang}
                </motion.span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-theme-border-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-theme-accent-primary to-theme-accent-secondary 
                            text-white font-bold flex items-center justify-center
                            group-hover:shadow-lg group-hover:shadow-theme-accent-primary/25 transition-all">
                  {question.user?.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-theme-text-primary font-medium">
                    {question.user?.username}
                  </div>
                  <div className="text-sm text-theme-text-muted">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
