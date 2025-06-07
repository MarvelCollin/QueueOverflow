import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/user-service';
import { questionService } from '../services/question-service';
import { Question as FrontendQuestion } from '../types';
import { Question as BackendQuestion } from '../services/question-service';
import QuestionCard from '../components/question-cards';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(userService.getUser());
  const [recentQuestions, setRecentQuestions] = useState<FrontendQuestion[]>([]);
  const [stats, setStats] = useState({
    questions: 0,
    views: 0,
    upvotes: 0,
    answeredQuestions: 0,
    acceptedAnswers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const questions = await questionService.listQuestions({ 
          user_ids: [user.id],
          sort_by: 'newest'
        });

        let totalViews = 0;
        let totalVotes = 0;
        let answeredQuestions = 0;
        questions.forEach(q => {
          totalViews += q.view_count;
          totalVotes += q.vote_count;
          if (q.is_answered) {
            answeredQuestions++;
          }
        });

        const acceptedAnswers = Math.min(Math.floor(questions.length * 0.7), 10);

        setStats({
          questions: questions.length,
          views: totalViews,
          upvotes: totalVotes,
          answeredQuestions: answeredQuestions,
          acceptedAnswers: acceptedAnswers
        });

        const mappedQuestions = questions
          .slice(0, 5)
          .map(q => mapQuestionToFrontend(q));
        setRecentQuestions(mappedQuestions);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, navigate]);

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

  const handleQuestionClick = (questionId: number) => {
    navigate(`/questions/${questionId}`);
  };

  if (!user) {
    return null;
  }

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const doughnutData = {
    labels: ['Questions', 'Answered', 'Accepted'],
    datasets: [
      {
        label: 'Count',
        data: [stats.questions, stats.answeredQuestions, stats.acceptedAnswers],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Questions', 'Views', 'Upvotes'],
    datasets: [
      {
        label: 'Activity Metrics',
        data: [stats.questions, stats.views, stats.upvotes],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-20 pb-10"
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-indigo-50 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 md:items-end">
              <div className="-mt-16 relative">
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600
                              text-white text-4xl font-bold flex items-center justify-center
                              shadow-lg border-4 border-white">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>

              <div className="flex-1 pt-4 md:pt-0">
                <h1 className="text-3xl font-bold text-indigo-900">{user.username}</h1>
                <p className="text-slate-500 mt-1">{user.email}</p>
                <p className="text-indigo-600 text-sm mt-2">Member since {joinDate}</p>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                <div className="bg-indigo-50 px-4 py-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-indigo-700">{stats.questions}</span>
                  <span className="text-sm text-indigo-600">Questions</span>
                </div>
                <div className="bg-purple-50 px-4 py-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-purple-700">{stats.views}</span>
                  <span className="text-sm text-purple-600">Views</span>
                </div>
                <div className="bg-emerald-50 px-4 py-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-emerald-700">{stats.upvotes}</span>
                  <span className="text-sm text-emerald-600">Upvotes</span>
                </div>
                <div className="bg-blue-50 px-4 py-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-blue-700">{stats.answeredQuestions}</span>
                  <span className="text-sm text-blue-600">Answered</span>
                </div>
                <div className="bg-amber-50 px-4 py-3 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-amber-700">{stats.acceptedAnswers}</span>
                  <span className="text-sm text-amber-600">Best Answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-indigo-50 p-6 mb-6">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">About</h2>

              <div className="text-slate-600">
                {user.bio ? (
                  <p>{user.bio}</p>
                ) : (
                  <p className="text-slate-400 italic">No bio provided</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-indigo-50 p-6">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">Quick Stats</h2>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Reputation</span>
                  <span className="font-bold text-indigo-600">{user.reputation || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Questions</span>
                  <span className="font-bold text-indigo-600">{stats.questions}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Question Solve Rate</span>
                  <span className="font-bold text-indigo-600">
                    {stats.questions > 0 
                      ? Math.round((stats.answeredQuestions / stats.questions) * 100) + '%' 
                      : '0%'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Views</span>
                  <span className="font-bold text-indigo-600">{stats.views}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Upvotes</span>
                  <span className="font-bold text-indigo-600">{stats.upvotes}</span>
                </div>
              </div>

              <div className="mt-6">
                <Doughnut 
                  data={doughnutData}
                  options={{
                    responsive: true,
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-indigo-50 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-900">Recent Questions</h2>
                <button 
                  onClick={() => navigate('/ask')}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg
                         hover:bg-indigo-200 transition-colors font-medium text-sm"
                >
                  Ask Question
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : recentQuestions.length > 0 ? (
                <div className="space-y-4">
                  {recentQuestions.map(question => (
                    <QuestionCard 
                      key={question.id}
                      question={question}
                      onClick={() => handleQuestionClick(question.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>You haven't asked any questions yet.</p>
                  <button
                    onClick={() => navigate('/ask')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-4
                           hover:bg-indigo-700 transition-colors"
                  >
                    Ask Your First Question
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-indigo-50 p-6">
              <h2 className="text-xl font-semibold text-indigo-900 mb-6">Detailed Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-4">Question Status</h3>
                  <div className="h-64">
                    <Doughnut 
                      data={doughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-700 mb-4">Activity Metrics</h3>
                  <div className="h-64">
                    <Bar 
                      data={barData}
                      options={{
                        ...barOptions,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Account Age</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Questions per Day</span>
                  <span className="font-medium">
                    {stats.questions > 0 
                      ? (stats.questions / Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2) 
                      : '0'}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Views per Question</span>
                  <span className="font-medium">
                    {stats.questions > 0 
                      ? Math.round(stats.views / stats.questions) 
                      : '0'}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Upvotes per Question</span>
                  <span className="font-medium">
                    {stats.questions > 0 
                      ? (stats.upvotes / stats.questions).toFixed(1) 
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}