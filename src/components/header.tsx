import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/user-service';
import { questionService } from '../services/question-service';
import { useToast } from '../components/toast';
import { storageService } from '../services/storage-service';

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
  user: any;
}

export default function Header({ onMenuClick, onLogout, user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const searchParams = new URLSearchParams(location.search);
  const currentSearchQuery = searchParams.get('search') || '';
  
  useEffect(() => {
    if (location.pathname === '/questions' && currentSearchQuery) {
      setSearchQuery(currentSearchQuery);
    }
    
    const history = storageService.getSearchHistory('questions');
    setSearchHistory(history);
  }, [location.pathname, currentSearchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    try {
      storageService.addToSearchHistory(searchQuery, 'questions');
      setSearchHistory(prev => [searchQuery, ...prev.filter(q => q.toLowerCase() !== searchQuery.toLowerCase())].slice(0, 10));
      setShowHistory(false);
      
      const results = await questionService.listQuestions({
        search: searchQuery,
        page: 1,
        per_page: 20
      });
      
      if (results.length > 0) {
        showToast('success', `Found ${results.length} results`);
        navigate(`/questions?search=${encodeURIComponent(searchQuery)}`);
      } else {
        showToast('info', 'No results found for your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('error', 'Failed to perform search');
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setShowHistory(false);
    if (location.pathname === '/questions') {
      const newParams = new URLSearchParams(location.search);
      newParams.delete('search');
      navigate(`${location.pathname}?${newParams.toString()}`);
    }
  };
  
  const handleSearchFocus = () => {
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };
  
  const selectFromHistory = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  };
  
  const clearHistory = () => {
    storageService.clearSearchHistory('questions');
    setSearchHistory([]);
    setShowHistory(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.header-search-container')) {
        setShowHistory(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full bg-white/90 
                 backdrop-blur-xl border-b border-indigo-100 z-50"
    >
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center h-16 gap-4">
          {user && (
            <div className="flex items-center">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onMenuClick}
                className="p-2.5 rounded-xl text-indigo-600 hover:bg-indigo-50 
                         transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          )}
            
          <form onSubmit={handleSearch} className="flex flex-1 relative group header-search-container">
            <input
              type="search"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              className="w-full pl-12 pr-10 py-2.5 bg-indigo-50/50 rounded-xl
                       border border-indigo-100 text-slate-800
                       placeholder:text-slate-400 focus:border-indigo-300
                       focus:bg-white focus:ring-2 focus:ring-indigo-200
                       transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute left-4 top-3 text-indigo-400 group-hover:text-indigo-600
                         transition-colors duration-300 hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600
                           transition-colors duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-indigo-100 z-50">
                <div className="p-2 flex justify-between items-center border-b border-indigo-50">
                  <span className="text-xs text-slate-500">Recent searches</span>
                  <button 
                    type="button"
                    onClick={clearHistory}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Clear history
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchHistory.map((query, index) => (
                    <div 
                      key={index}
                      onClick={() => selectFromHistory(query)}
                      className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 flex items-center"
                    >
                      <svg className="w-3 h-3 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {query}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
          
          <div className="flex gap-2">
            <Link to="/questions">
              <button className="px-4 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 
                             font-medium transition-colors duration-300">
                Questions
              </button>
            </Link>
            <Link to="/users">
              <button className="px-4 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 
                             font-medium transition-colors duration-300">
                Users
              </button>
            </Link>
            <Link to="/tags">
              <button className="px-4 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 
                             font-medium transition-colors duration-300">
                Tags
              </button>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
                             text-white font-bold flex items-center justify-center
                             shadow-sm group-hover:shadow-md transition-all">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-slate-800 font-medium">{user.username}</div>
                  <div className="text-xs text-slate-500">{user.reputation || 0} reputation</div>
                </div>
              </Link>
              
              <button
                onClick={onLogout}
                className="p-2.5 rounded-xl text-indigo-600 hover:bg-indigo-50 
                         transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button className="px-4 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 
                              font-medium transition-colors duration-300">
                  Log in
                </button>
              </Link>
              <Link to="/register">
                <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 
                              text-white font-medium transition-colors duration-300 shadow-sm">
                  Sign up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
