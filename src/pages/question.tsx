import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Question as FrontendQuestion } from '../types';
import { questionService, Question as BackendQuestion } from '../services/question-service';
import { tagService } from '../services/tag-service';
import QuestionCard from '../components/question-cards';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/user-service';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { storageService } from '../services/storage-service';

interface QuestionsProps {
  onQuestionClick: (questionId: number) => void;
  onAskQuestion?: () => void;
}

export default function Questions({ onQuestionClick, onAskQuestion }: QuestionsProps) {
  const [questions, setQuestions] = useState<FrontendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<{id: number, name: string, description?: string, question_count: number}[]>([]);
  const [users, setUsers] = useState<{id: number, username: string, email: string, display_name: string, reputation: number, avatar_url?: string | null}[]>([]);
  const [filteredTags, setFilteredTags] = useState<{id: number, name: string, description?: string, question_count: number}[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<{id: number, username: string, email: string, display_name: string, reputation: number, avatar_url?: string | null}[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    selectedTags: number[],
    selectedUsers: number[]
  }>({
    selectedTags: [],
    selectedUsers: []
  });
  const [tagSearchHistory, setTagSearchHistory] = useState<string[]>([]);
  const [userSearchHistory, setUserSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState<{
    tags: boolean,
    users: boolean
  }>({
    tags: false,
    users: false
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchQuery 
    ? (searchParams.get('sort') || 'relevance') 
    : (searchParams.get('sort') || 'newest');
  const showTags = searchParams.has('tags');
  const showUsers = searchParams.has('users');
  const showMyQuestions = searchParams.has('my');
  
  const currentUser = userService.getUser();

  useEffect(() => {
    const savedFilters = localStorage.getItem('qoverflow_filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setActiveFilters(parsedFilters);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('qoverflow_filters', JSON.stringify(activeFilters));
  }, [activeFilters]);

  useEffect(() => {
    if (showTags) {
      const history = storageService.getSearchHistory('tags');
      setTagSearchHistory(history);
    }
    
    if (showUsers) {
      const history = storageService.getSearchHistory('users');
      setUserSearchHistory(history);
    }
  }, [showTags, showUsers]);

  const mapQuestionToFrontend = (backendQuestion: BackendQuestion): FrontendQuestion => {
    return {
      id: backendQuestion.id,
      title: backendQuestion.title,
      description: backendQuestion.content,
      languages: backendQuestion.tags,
      isSolved: backendQuestion.is_answered,
      userId: backendQuestion.user_id,
      viewedCounter: backendQuestion.view_count,
      createdAt: backendQuestion.created_at,
      user: {
        userId: backendQuestion.author.id,
        username: backendQuestion.author.username,
        email: ''
      },
      votes: {
        upvotes: backendQuestion.vote_count,
        downvotes: 0
      }
    };
  };
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        if (showTags) {
          const tagsList = await tagService.listTags();
          console.log('Loaded tags:', tagsList);
          setTags(tagsList);
        }
        
        if (showUsers) {
          const usersList = await userService.getUsers();
          console.log('Loaded users:', usersList);
          setUsers(usersList);
        }
      } catch (err) {
        console.error('Failed to load filter data:', err);
      }
    };
    
    loadFilterData();
  }, [showTags, showUsers]);

  useEffect(() => {
    if (tags.length > 0) {
      if (tagSearch.trim() === '') {
        setFilteredTags(tags);
      } else {
        const search = tagSearch.toLowerCase();
        setFilteredTags(tags.filter(tag => 
          tag.name.toLowerCase().includes(search) || 
          (tag.description && tag.description.toLowerCase().includes(search))
        ));
      }
    }
  }, [tags, tagSearch]);
  
  useEffect(() => {
    if (users.length > 0) {
      if (userSearch.trim() === '') {
        setFilteredUsers(users);
      } else {
        const search = userSearch.toLowerCase();
        setFilteredUsers(users.filter(user => 
          user.username.toLowerCase().includes(search) || 
          user.display_name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        ));
      }
    }
  }, [users, userSearch]);
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const queryParams: any = {
          page: 1,
          per_page: 20,
          sort_by: sortBy,
          search: searchQuery,
          tag_ids: activeFilters.selectedTags.length ? activeFilters.selectedTags : undefined,
          user_ids: activeFilters.selectedUsers.length ? activeFilters.selectedUsers : undefined
        };
        
        if (showMyQuestions && currentUser) {
          queryParams.user_ids = [currentUser.id];
        }
        
        console.log('Fetching questions with params:', queryParams);
        console.log('Active filters:', activeFilters);
        
        const data = await questionService.listQuestions(queryParams);
        const mappedQuestions = data.map(mapQuestionToFrontend);
        
        console.log('Received questions:', mappedQuestions.length);
        
        setQuestions(mappedQuestions);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [searchQuery, sortBy, activeFilters, showMyQuestions, currentUser]);

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
  const toggleTagFilter = (tagId: number) => {
    console.log('Toggling tag filter for tagId:', tagId);
    setActiveFilters(prev => {
      const selectedTags = prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId];
      
      console.log('New selected tags:', selectedTags);
      return {
        ...prev,
        selectedTags
      };
    });
  };

  const toggleUserFilter = (userId: number) => {
    console.log('Toggling user filter for userId:', userId);
    setActiveFilters(prev => {
      const selectedUsers = prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId];
      
      console.log('New selected users:', selectedUsers);
      return {
        ...prev,
        selectedUsers
      };
    });
  };

  const setSortType = (type: string) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('sort', type);
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  const getPageTitle = () => {
    if (searchQuery) return `Search Results: "${searchQuery}"`;
    if (showTags) return "Browse by Tags";
    if (showUsers) return "Browse by Users";
    if (showMyQuestions) return "My Questions";
    if (sortBy === "views") return "Trending Questions";
    return "All Questions";
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(location.search);
    newParams.delete('search');
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  const handleTagSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagSearch(e.target.value);
    setShowSearchHistory(prev => ({ ...prev, tags: false }));
  };
  
  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearch(e.target.value);
    setShowSearchHistory(prev => ({ ...prev, users: false }));
  };
  
  const selectFromHistory = (query: string, type: 'tags' | 'users') => {
    if (type === 'tags') {
      setTagSearch(query);
    } else {
      setUserSearch(query);
    }
    
    setShowSearchHistory(prev => ({ ...prev, [type]: false }));
  };
  
  const focusSearchInput = (type: 'tags' | 'users') => {
    if (type === 'tags' && tagSearchHistory.length > 0) {
      setShowSearchHistory(prev => ({ ...prev, tags: true, users: false }));
    } else if (type === 'users' && userSearchHistory.length > 0) {
      setShowSearchHistory(prev => ({ ...prev, users: true, tags: false }));
    }
  };
  
  const clearHistory = (type: 'tags' | 'users') => {
    if (type === 'tags') {
      storageService.clearSearchHistory('tags');
      setTagSearchHistory([]);
    } else {
      storageService.clearSearchHistory('users');
      setUserSearchHistory([]);
    }
    setShowSearchHistory(prev => ({ ...prev, [type]: false }));
  };
  
  const submitTagSearch = () => {
    if (tagSearch.trim()) {
      storageService.addToSearchHistory(tagSearch, 'tags');
      setTagSearchHistory(prev => [tagSearch, ...prev.filter(q => q.toLowerCase() !== tagSearch.toLowerCase())].slice(0, 10));
    }
    setShowSearchHistory(prev => ({ ...prev, tags: false }));
  };
  
  const submitUserSearch = () => {
    if (userSearch.trim()) {
      storageService.addToSearchHistory(userSearch, 'users');
      setUserSearchHistory(prev => [userSearch, ...prev.filter(q => q.toLowerCase() !== userSearch.toLowerCase())].slice(0, 10));
    }
    setShowSearchHistory(prev => ({ ...prev, users: false }));
  };
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowSearchHistory({ tags: false, users: false });
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-20"
    >
      <div className="flex justify-between items-center mb-8 sticky top-20 py-4 
                    bg-white/90 backdrop-blur-xl z-10 border-b border-indigo-100 rounded-lg">
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-indigo-800">
            {getPageTitle()}
          </h1>
          
          {searchQuery && (
            <div className="flex items-center gap-2 mt-2">
              <div className="px-3 py-1 bg-indigo-100 rounded-lg text-indigo-700 text-sm font-medium flex items-center">
                <span>"{searchQuery}"</span>
                <button 
                  onClick={clearSearch}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <span className="text-slate-500 text-sm">{questions.length} results</span>
            </div>
          )}
          
          {!searchQuery && (
            <p className="text-slate-500 mt-1 text-sm">{questions.length} questions</p>
          )}
          
          {showMyQuestions && currentUser && (
            <div className="flex items-center gap-3 mt-4 bg-indigo-50 p-3 rounded-lg w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
                           text-white font-bold flex items-center justify-center">
                {currentUser.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-indigo-900 font-medium">{currentUser.username}</div>
                <div className="text-xs text-indigo-600">{currentUser.email}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mr-4">
          {!showTags && !showUsers && (
            <div className="flex gap-2 bg-indigo-50 p-1 rounded-lg">
              {searchQuery && (
                <button 
                  onClick={() => setSortType('relevance')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${sortBy === 'relevance' 
                              ? 'bg-indigo-500 text-white shadow-sm' 
                              : 'text-indigo-600 hover:bg-indigo-100'}`}
                >
                  Most Relevant
                </button>
              )}
              <button 
                onClick={() => setSortType('newest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${sortBy === 'newest' 
                            ? 'bg-indigo-500 text-white shadow-sm' 
                            : 'text-indigo-600 hover:bg-indigo-100'}`}
              >
                Newest
              </button>
              <button 
                onClick={() => setSortType('views')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${sortBy === 'views' 
                            ? 'bg-indigo-500 text-white shadow-sm' 
                            : 'text-indigo-600 hover:bg-indigo-100'}`}
              >
                Most Viewed
              </button>
              <button 
                onClick={() => setSortType('votes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${sortBy === 'votes' 
                            ? 'bg-indigo-500 text-white shadow-sm' 
                            : 'text-indigo-600 hover:bg-indigo-100'}`}
              >
                Highest Voted
              </button>
            </div>
          )}

          <button
            onClick={handleAskQuestion}
            className="bg-gradient-to-r from-indigo-600 to-purple-600
                       text-white px-6 py-2.5 rounded-xl font-medium 
                       hover:from-indigo-700 hover:to-purple-700 transition-all duration-300
                       shadow-md hover:shadow-lg">
            Ask Question
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {(showTags || showUsers) && (
          <div className="w-72 shrink-0">
            <div className="bg-white rounded-xl border border-indigo-100 p-4 sticky top-40 shadow-sm">
              <h3 className="font-medium mb-3 text-indigo-800">
                {showTags ? 'Filter by Tags' : 'Filter by Users'}
              </h3>
              
              <div className="mb-4 relative search-container">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    showTags ? submitTagSearch() : submitUserSearch();
                  }}
                >
                  <input
                    type="text"
                    placeholder={showTags ? "Search tags..." : "Search users..."}
                    value={showTags ? tagSearch : userSearch}
                    onChange={showTags ? handleTagSearchChange : handleUserSearchChange}
                    onFocus={() => focusSearchInput(showTags ? 'tags' : 'users')}
                    className="w-full pl-9 pr-4 py-2 bg-indigo-50/50 rounded-lg
                            border border-indigo-100 text-slate-800
                            placeholder:text-slate-400 focus:border-indigo-300
                            focus:bg-white focus:ring-1 focus:ring-indigo-200
                            transition-all duration-300 text-sm"
                  />
                </form>
                <div className="absolute left-3 top-2.5 text-indigo-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {((showTags && tagSearch) || (!showTags && userSearch)) && (
                  <button
                    onClick={() => showTags ? setTagSearch('') : setUserSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600
                             transition-colors duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {showTags && showSearchHistory.tags && tagSearchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-indigo-100 z-10">
                    <div className="p-2 flex justify-between items-center border-b border-indigo-50">
                      <span className="text-xs text-slate-500">Recent searches</span>
                      <button 
                        onClick={() => clearHistory('tags')}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {tagSearchHistory.map((query, index) => (
                        <div 
                          key={index}
                          onClick={() => selectFromHistory(query, 'tags')}
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
                
                {showUsers && showSearchHistory.users && userSearchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-indigo-100 z-10">
                    <div className="p-2 flex justify-between items-center border-b border-indigo-50">
                      <span className="text-xs text-slate-500">Recent searches</span>
                      <button 
                        onClick={() => clearHistory('users')}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {userSearchHistory.map((query, index) => (
                        <div 
                          key={index}
                          onClick={() => selectFromHistory(query, 'users')}
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
              </div>
              
              {(activeFilters.selectedTags.length > 0 || activeFilters.selectedUsers.length > 0) && (
                <div className="mb-3 px-2 py-1 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                  {showTags ? 
                    `${activeFilters.selectedTags.length} tag${activeFilters.selectedTags.length !== 1 ? 's' : ''} selected` :
                    `${activeFilters.selectedUsers.length} user${activeFilters.selectedUsers.length !== 1 ? 's' : ''} selected`
                  }
                </div>
              )}
              
              {showTags && filteredTags.length > 0 && (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {filteredTags.map(tag => (
                    <Tippy 
                      key={tag.id}
                      content={
                        <div className="p-2 max-w-xs">
                          <div className="font-medium text-indigo-800">{tag.name}</div>
                          {tag.description && (
                            <div className="text-xs text-slate-600 mt-1">{tag.description}</div>
                          )}
                          <div className="text-xs text-indigo-600 mt-1">
                            {tag.question_count} question{tag.question_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      }
                      placement="right"
                      theme="light"
                      delay={[300, 0]}
                      animation="fade"
                    >
                      <div 
                        onClick={() => toggleTagFilter(tag.id)}
                        className={`px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center justify-between
                                ${activeFilters.selectedTags.includes(tag.id) 
                                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                  : 'hover:bg-gray-50 text-slate-700'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{tag.name}</span>
                          <span className="text-xs text-slate-500">({tag.question_count})</span>
                        </div>
                        {activeFilters.selectedTags.includes(tag.id) && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </Tippy>
                  ))}
                </div>
              )}
              
              {showUsers && filteredUsers.length > 0 && (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {filteredUsers.map(user => (
                    <Tippy 
                      key={user.id}
                      content={
                        <div className="p-2 max-w-xs">
                          <div className="font-medium text-indigo-800">{user.username}</div>
                          {user.email && (
                            <div className="text-xs text-slate-600 mt-1">{user.email}</div>
                          )}
                          <div className="text-xs flex items-center gap-1 text-amber-600 mt-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{user.reputation} reputation</span>
                          </div>
                        </div>
                      }
                      placement="right"
                      theme="light"
                      delay={[300, 0]} 
                      animation="fade"
                    >
                      <div 
                        onClick={() => toggleUserFilter(user.id)}
                        className={`px-3 py-2 rounded-lg cursor-pointer text-sm flex items-center justify-between
                                ${activeFilters.selectedUsers.includes(user.id) 
                                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                  : 'hover:bg-gray-50 text-slate-700'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600
                                        text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              user.username?.[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <span>{user.username}</span>
                        </div>
                        {activeFilters.selectedUsers.includes(user.id) && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </Tippy>
                  ))}
                </div>
              )}
              
              {showTags && tags.length > 0 && filteredTags.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No tags found matching "{tagSearch}"
                </div>
              )}
              
              {showUsers && users.length > 0 && filteredUsers.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No users found matching "{userSearch}"
                </div>
              )}
              
              {activeFilters.selectedTags.length > 0 || activeFilters.selectedUsers.length > 0 ? (
                <button 
                  onClick={() => setActiveFilters({ selectedTags: [], selectedUsers: [] })}
                  className="mt-4 text-indigo-600 text-sm hover:text-indigo-800 font-medium 
                           flex items-center gap-1 w-full justify-center py-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              ) : null}
            </div>
          </div>
        )}

        <div className={`space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto 
                    scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent
                    pr-4 ${(showTags || showUsers) ? 'flex-1' : 'w-full'}`}>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
                <div key={n} className="bg-white backdrop-blur-xl rounded-xl p-6 animate-pulse shadow-sm border border-indigo-50">
                  <div className="h-4 bg-indigo-100 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-indigo-50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          ) : showMyQuestions && !currentUser ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-indigo-50 p-8">
              <p className="text-slate-500 mb-4">
                Please sign in to view your questions
              </p>
              <Link to="/login">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md">
                  Sign In
                </button>
              </Link>
            </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onClick={() => onQuestionClick(question.id)}
                  highlightTerm={searchQuery}
              />
            ))}
          </div>
        ) : (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-indigo-50 p-8">
              <p className="text-slate-500 mb-4">
              {searchQuery 
                ? `No questions found matching "${searchQuery}". Try a different search term.` 
                  : showMyQuestions 
                    ? "You haven't asked any questions yet."
                    : activeFilters.selectedTags.length || activeFilters.selectedUsers.length
                      ? 'No questions found with the selected filters.'
                : 'No questions found'}
            </p>
            <button
              onClick={handleAskQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            >
                {showMyQuestions ? "Ask your first question" : "Be the first to ask a question"}
            </button>
          </div>
        )}
        </div>
      </div>
    </motion.div>
  );
}
