import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../services/user-service';
import { questionService, Question } from '../services/question-service';
import { tagService, Tag } from '../services/tag-service';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/toast';
import { FaQuestionCircle, FaTag, FaTrophy, FaUsers, FaEye, FaThumbsUp } from 'react-icons/fa';

export default function Home() {
    const navigate = useNavigate();
    const user = userService.getUser();
    const { showToast } = useToast();
    const [stats, setStats] = useState({
        totalQuestions: 0,
        totalUsers: 0,
        totalAnswers: 0,
        answeredPercentage: 0
    });
    const [trendingTags, setTrendingTags] = useState<Tag[]>([]);
    const [featuredQuestions, setFeaturedQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);

                const allQuestions = await questionService.listQuestions({ per_page: 1000 });

                const allTags = await tagService.listTags();
                const sortedTags = [...allTags].sort((a, b) => b.question_count - a.question_count);

                const answeredQuestions = allQuestions.filter(q => q.is_answered).length;
                const users = userService.getUsers();

                setStats({
                    totalQuestions: allQuestions.length,
                    totalUsers: users.length,
                    totalAnswers: allQuestions.reduce((sum, q) => sum + q.answer_count, 0),
                    answeredPercentage: allQuestions.length ? Math.round((answeredQuestions / allQuestions.length) * 100) : 0
                });

                setTrendingTags(sortedTags.slice(0, 5));

                const mostVoted = [...allQuestions].sort((a, b) => b.vote_count - a.vote_count).slice(0, 3);
                const mostViewed = [...allQuestions].sort((a, b) => b.view_count - a.view_count).slice(0, 3);
                const newest = [...allQuestions].sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ).slice(0, 3);

                const combined = [...mostVoted, ...mostViewed, ...newest];
                const uniqueIds = new Set();
                const uniqueQuestions = combined.filter(q => {
                    if (uniqueIds.has(q.id)) return false;
                    uniqueIds.add(q.id);
                    return true;
                });

                setFeaturedQuestions(uniqueQuestions.slice(0, 5));
            } catch (error) {
                console.error("Error loading home data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

    const handleGuestAccess = () => {
        userService.setGuest();
        navigate('/questions');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-20"
        >
            <section className="py-12 md:py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-6">
                            QueueOverflow
                        </h1>
                        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6"></div>
                        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
                            Your community-driven platform for asking and answering programming questions
                        </p>
                    </motion.div>

                    {user ? (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                                <h2 className="text-2xl text-gray-700 mb-4">
                                    Welcome back, <span className="font-semibold text-indigo-600">{user.display_name}</span>!
                                </h2>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/questions')}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all"
                                    >
                                        Browse Questions
                                    </button>
                                    <button
                                        onClick={() => navigate('/ask-question')}
                                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium border border-indigo-200 hover:border-indigo-400 transition-all"
                                    >
                                        Ask a Question
                                    </button>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium border border-indigo-200 hover:border-indigo-400 transition-all"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            <p className="text-xl text-gray-700 mb-6">
                                Join our community of developers helping each other
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-medium border border-indigo-200 hover:border-indigo-400 transition-all"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all"
                                >
                                    Register
                                </button>
                                <button
                                    onClick={handleGuestAccess}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all"
                                >
                                    Continue as Guest
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12">Community Statistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                <FaQuestionCircle className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-indigo-700">
                                {loading ? '...' : stats.totalQuestions}
                            </h3>
                            <p className="text-gray-600">Questions Asked</p>
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <FaTrophy className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-green-700">
                                {loading ? '...' : stats.totalAnswers}
                            </h3>
                            <p className="text-gray-600">Answers Provided</p>
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                                <FaUsers className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-purple-700">
                                {loading ? '...' : stats.totalUsers}
                            </h3>
                            <p className="text-gray-600">Community Members</p>
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <FaThumbsUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-200">
                                    <div 
                                        style={{ width: `${stats.answeredPercentage}%` }} 
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                    ></div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-blue-700">
                                    {loading ? '...' : `${stats.answeredPercentage}%`}
                                </h3>
                                <p className="text-gray-600">Questions Solved</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12">Trending Tags</h2>

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {trendingTags.map((tag, index) => (
                                <motion.div
                                    key={tag.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100"
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    onClick={() => navigate(`/questions?tags=true&tag=${tag.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                                            <FaTag className="text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-indigo-700">{tag.name}</h3>
                                    </div>

                                    {tag.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tag.description}</p>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-indigo-600 font-medium">
                                            {tag.question_count} {tag.question_count === 1 ? 'question' : 'questions'}
                                        </span>
                                        <div className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                                            Trending
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="py-12 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12">Featured Questions</h2>

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
                        </div>
                    ) : featuredQuestions.length > 0 ? (
                        <div className="space-y-6">
                            {featuredQuestions.map((question, index) => (
                                <motion.div
                                    key={question.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                                    onClick={() => navigate(`/questions/${question.id}`)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="hidden md:flex flex-col items-center space-y-2">
                                            <div className="flex flex-col items-center p-2 rounded-lg bg-indigo-50 min-w-[70px] text-center">
                                                <span className="text-lg font-bold text-indigo-700">{question.vote_count}</span>
                                                <span className="text-xs text-indigo-500">votes</span>
                                            </div>

                                            <div className="flex flex-col items-center p-2 rounded-lg bg-green-50 min-w-[70px] text-center">
                                                <span className="text-lg font-bold text-green-700">{question.answer_count}</span>
                                                <span className="text-xs text-green-500">answers</span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-indigo-800 hover:text-indigo-600 transition-colors mb-2">
                                                {question.title}
                                            </h3>

                                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                                                {question.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {question.tags.slice(0, 4).map((tag, i) => (
                                                    <span 
                                                        key={i} 
                                                        className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {question.tags.length > 4 && (
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs">
                                                        +{question.tags.length - 4} more
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center text-gray-500">
                                                        <FaEye className="w-4 h-4 mr-1" />
                                                        <span>{question.view_count} views</span>
                                                    </div>

                                                    {question.is_answered && (
                                                        <div className="text-green-600 flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                            </svg>
                                                            <span>Solved</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-gray-500">
                                                    {new Date(question.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <p className="text-gray-600">No questions found. Be the first to ask a question!</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get your questions answered?</h2>
                        <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                            Join our community today and tap into the collective knowledge of developers around the world.
                        </p>
                        <button
                            onClick={() => navigate(user ? '/ask-question' : '/register')}
                            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-medium hover:bg-indigo-50 transition-all"
                        >
                            {user ? 'Ask a Question' : 'Join Now'}
                        </button>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
}