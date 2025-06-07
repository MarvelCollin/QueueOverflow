import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, QuestionMarkCircleIcon, TagIcon, UserGroupIcon, FireIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { questionService } from '../services/question-service';
import { tagService } from '../services/tag-service';
import { userService } from '../services/user-service';

const SIDEBAR_HISTORY_KEY = 'sidebar_history';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [tagCount, setTagCount] = useState<number>(0);
  const [trendingCount, setTrendingCount] = useState<number>(0);
  const [recentlyViewed, setRecentlyViewed] = useState<{id: number, title: string, path: string}[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      const fetchCounts = async () => {
        try {
          const questions = await questionService.listQuestions();
          setQuestionCount(questions.length);
          
          const tags = await tagService.listTags();
          setTagCount(tags.length);
          
          const trendingQuestions = await questionService.listQuestions({
            sort_by: 'views',
            per_page: 5
          });
          setTrendingCount(trendingQuestions.length);
          
          const savedHistory = localStorage.getItem(SIDEBAR_HISTORY_KEY);
          if (savedHistory) {
            try {
              setRecentlyViewed(JSON.parse(savedHistory));
            } catch (e) {
              console.error('Error parsing sidebar history:', e);
              setRecentlyViewed([]);
            }
          }
        } catch (error) {
          console.error('Error fetching sidebar data:', error);
        }
      };
      
      fetchCounts();
    }
  }, [isOpen]);
  
  useEffect(() => {
    const match = location.pathname.match(/\/questions\/(\d+)/);
    if (match && match[1]) {
      const questionId = parseInt(match[1], 10);
      
      const updateHistory = async () => {
        try {
          const question = await questionService.getQuestion(questionId);
          
          setRecentlyViewed(prev => {
            const newItem = {
              id: questionId,
              title: question.title,
              path: `/questions/${questionId}`
            };
            
            const filtered = prev.filter(item => item.id !== questionId);
            
            const updated = [newItem, ...filtered].slice(0, 5);
            
            localStorage.setItem(SIDEBAR_HISTORY_KEY, JSON.stringify(updated));
            
            return updated;
          });
        } catch (error) {
          console.error('Error updating question history:', error);
        }
      };
      
      updateHistory();
    }
  }, [location.pathname]);

  const menuItems = [
    { icon: HomeIcon, text: 'Home', badge: '', path: '/home' },
    { icon: QuestionMarkCircleIcon, text: 'Questions', badge: questionCount.toString(), path: '/questions' },
    { icon: PencilSquareIcon, text: 'Ask Question', badge: '', path: '/ask-question' },
    { icon: TagIcon, text: 'Tags', badge: tagCount.toString(), path: '/questions?tags=true' },
    { icon: UserGroupIcon, text: 'Users', badge: '', path: '/questions?users=true' },
    { icon: FireIcon, text: 'Trending', badge: trendingCount.toString(), path: '/questions?sort=views' },
  ];

  const isAuthenticated = userService.getUser() !== null;
  const [myQuestionsCount, setMyQuestionsCount] = useState<number>(0);
  
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      const fetchMyQuestions = async () => {
        try {
          const currentUser = userService.getUser();
          if (currentUser) {
            const questions = await questionService.listQuestions({
              user_ids: [currentUser.id]
            });
            setMyQuestionsCount(questions.length);
          }
        } catch (error) {
          console.error('Error fetching user questions:', error);
        }
      };
      
      fetchMyQuestions();
    }
  }, [isAuthenticated, isOpen]);
  
  const extendedMenuItems = isAuthenticated 
    ? [
        ...menuItems.slice(0, 3),
        { 
          icon: QuestionMarkCircleIcon, 
          text: 'My Questions', 
          badge: myQuestionsCount.toString(), 
          path: '/questions?my=true' 
        },
        ...menuItems.slice(3)
      ] 
    : menuItems;

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isOpen ? 'auto' : '0px',
        opacity: isOpen ? 1 : 0
      }}
      className="fixed left-0 top-16 h-screen bg-gradient-to-b from-indigo-50/90 to-white/90
                 backdrop-blur-xl border-r border-indigo-200 overflow-hidden z-40"
    >
      <motion.div 
        className="w-64 p-4 space-y-6"
        initial={false}
        animate={{ x: isOpen ? 0 : -20 }}
      >
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider px-4 mb-2">Main Menu</h3>
          {extendedMenuItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl
                       text-slate-600 hover:text-indigo-600
                       hover:bg-indigo-50 transition-all duration-200 group
                       block w-full ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600 font-medium' : ''}`}
              >
                <item.icon className="w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                <span className="flex-1">{item.text}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 
                             text-indigo-600 group-hover:bg-indigo-500 
                             group-hover:text-white transition-colors">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
        
        {recentlyViewed.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider px-4 mb-2">Recently Viewed</h3>
            {recentlyViewed.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl
                         text-slate-600 hover:text-indigo-600
                         hover:bg-indigo-50 transition-all duration-200
                         block w-full text-sm"
                >
                  <span className="flex-1 truncate" title={item.title}>{item.title}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="pt-4 border-t border-indigo-100">
          <div className="flex items-center gap-3 px-4 py-3">
            {userService.getUser() ? (
              <>
                <Link to="/profile" className="flex items-center gap-3 w-full group">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold group-hover:shadow-md transition-all">
                    {userService.getUser()?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{userService.getUser()?.username || 'User'}</div>
                    <div className="text-xs text-slate-500">View Profile</div>
                  </div>
                </Link>
              </>
            ) : (
              <div className="text-sm text-indigo-500 font-medium">
                <Link to="/login">Sign in</Link> to track your activity
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
