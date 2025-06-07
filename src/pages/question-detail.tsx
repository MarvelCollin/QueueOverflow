import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Question as FrontendQuestion, Answer as FrontendAnswer } from '../types';
import { questionService, Question as BackendQuestion } from '../services/question-service';
import { answerService, Answer as BackendAnswer } from '../services/answer-service';
import { voteService } from '../services/vote-service';
import { useToast } from '../components/toast';
import RichTextEditor from '../components/rich-text-editor';
import AnswerEditor from '../components/answer-editor';
import { userService } from '../services/user-service';

interface QuestionDetailProps {
  questionId: number;
  onBack: () => void;
}

export default function QuestionDetail({ questionId, onBack }: QuestionDetailProps) {
  const [question, setQuestion] = useState<FrontendQuestion | null>(null);
  const [answers, setAnswers] = useState<FrontendAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const [userVotes, setUserVotes] = useState<{
    question?: { id: number, type: 'up' | 'down' } | null;
    answers: { [answerId: number]: { id: number, type: 'up' | 'down' } | null };
  }>({
    question: null,
    answers: {}
  });

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

  const mapAnswerToFrontend = (backendAnswer: BackendAnswer): FrontendAnswer => {
    return {
      id: backendAnswer.id,
      description: backendAnswer.content,
      isCorrect: backendAnswer.is_accepted,
      userId: backendAnswer.user_id,
      createdAt: backendAnswer.created_at,
      user: {
        userId: backendAnswer.author.id,
        username: backendAnswer.author.username,
        email: ''
      },
      votes: {
        upvotes: backendAnswer.vote_count,
        downvotes: 0
      }
    };
  };

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const questionData = await questionService.getQuestion(questionId);
        setQuestion(mapQuestionToFrontend(questionData));
        
        const answersData = await answerService.getQuestionAnswers(questionId);
        setAnswers(answersData.map(mapAnswerToFrontend));

        const currentUser = userService.getUser();
        if (currentUser) {
          const questionVote = await voteService.getUserVote(
            currentUser.id, 
            questionId, 
            'question'
          );
          
          const answerVotes: { [answerId: number]: { id: number, type: 'up' | 'down' } | null } = {};
          
          for (const answer of answersData) {
            const vote = await voteService.getUserVote(
              currentUser.id,
              answer.id,
              'answer'
            );
            
            if (vote) {
              answerVotes[answer.id] = { 
                id: vote.id, 
                type: vote.vote_type 
              };
            } else {
              answerVotes[answer.id] = null;
            }
          }
          
          setUserVotes({
            question: questionVote ? { 
              id: questionVote.id, 
              type: questionVote.vote_type 
            } : null,
            answers: answerVotes
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching question data:', err);
        setLoading(false);
        setError('Question not found or error loading data');
      }
    };
    
    fetchQuestionData();
  }, [questionId]);

  const handleAnswerSubmit = async (answerContent: string) => {
    if (submitting || !answerContent.trim()) return;

    setSubmitting(true);
    try {
      const user = userService.getUser();
      if (!user || !user.id) {
        throw new Error('You must be logged in to answer');
      }
      
      await answerService.createAnswer(user.id, questionId, answerContent);
      
      const updatedAnswers = await answerService.getQuestionAnswers(questionId);
      setAnswers(updatedAnswers.map(mapAnswerToFrontend));
      
      await questionService.updateQuestionAnswerCount(questionId, true);
      
      showToast('success', 'Your answer has been posted');
    } catch (err) {
      console.error('Failed to submit answer:', err);
      showToast('error', 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionVote = async (voteType: 'up' | 'down') => {
    const user = userService.getUser();
    
    if (!user) {
      showToast('error', 'You need to be logged in to vote');
      return;
    }
    
    try {
      await voteService.createVote(user.id, questionId, 'question', voteType);
      
      const voteCount = await voteService.getVoteCount(questionId, 'question');
      
      if (question) {
        setQuestion({
          ...question,
          votes: {
            upvotes: voteCount.upvotes,
            downvotes: voteCount.downvotes
          }
        });
      }
      
      const questionVote = await voteService.getUserVote(
        user.id,
        questionId,
        'question'
      );
      
      setUserVotes(prev => ({
        ...prev,
        question: questionVote ? { 
          id: questionVote.id, 
          type: questionVote.vote_type 
        } : null
      }));
      
      showToast('success', 'Vote recorded');
    } catch (error) {
      console.error('Failed to vote:', error);
      showToast('error', 'Failed to submit vote');
    }
  };

  const handleAnswerVote = async (answerId: number, voteType: 'up' | 'down') => {
    const user = userService.getUser();
    
    if (!user) {
      showToast('error', 'You need to be logged in to vote');
      return;
    }
    
    try {
      await voteService.createVote(user.id, answerId, 'answer', voteType);
      
      const voteCount = await voteService.getVoteCount(answerId, 'answer');
      
      setAnswers(prevAnswers => 
        prevAnswers.map(answer => 
          answer.id === answerId 
            ? {
                ...answer,
                votes: {
                  upvotes: voteCount.upvotes,
                  downvotes: voteCount.downvotes
                }
              } 
            : answer
        )
      );
      
      const answerVote = await voteService.getUserVote(
        user.id,
        answerId,
        'answer'
      );
      
      setUserVotes(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [answerId]: answerVote ? { 
            id: answerVote.id, 
            type: answerVote.vote_type 
          } : null
        }
      }));
      
      showToast('success', 'Vote recorded');
    } catch (error) {
      console.error('Failed to vote:', error);
      showToast('error', 'Failed to submit vote');
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    const user = userService.getUser();
    
    if (!user) {
      showToast('error', 'You need to be logged in');
      return;
    }
    
    if (user.id !== question?.userId) {
      showToast('error', 'Only the question author can accept answers');
      return;
    }
    
    try {
      await answerService.acceptAnswer(answerId);
      
      await questionService.markAsAnswered(questionId, true);
      
      const updatedAnswers = await answerService.getQuestionAnswers(questionId);
      
      if (question) {
        setQuestion({
          ...question,
          isSolved: true
        });
      }
      
      setAnswers(updatedAnswers.map(mapAnswerToFrontend));
      
      showToast('success', 'Answer accepted');
    } catch (error) {
      console.error('Failed to accept answer:', error);
      showToast('error', 'Failed to accept answer');
    }
  };

  if (error) {
    return (
      <div className="pt-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-5xl p-8 bg-white rounded-2xl shadow-lg"
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
                  className={`p-3 hover:bg-indigo-50 rounded-xl transition-colors ${
                    userVotes.question?.type === 'up' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
                  }`}
                  onClick={() => handleQuestionVote('up')}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </motion.button>

                <span className="text-2xl font-bold text-slate-700">
                  {question.votes?.upvotes || 0}
                </span>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 hover:bg-indigo-50 rounded-xl transition-colors ${
                    userVotes.question?.type === 'down' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
                  }`}
                  onClick={() => handleQuestionVote('down')}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <button 
                      className="text-slate-500 hover:text-indigo-600 text-sm transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('success', 'Link copied to clipboard');
                      }}
                    >
                      Share
                    </button>
                    <button 
                      className="text-slate-500 hover:text-indigo-600 text-sm transition-colors"
                      onClick={() => {
                        const user = userService.getUser();
                        if (!user) {
                          showToast('error', 'You need to be logged in to edit');
                          return;
                        }
                        if (user.id !== question.userId) {
                          showToast('error', 'You can only edit your own questions');
                          return;
                        }
                        showToast('info', 'Edit functionality will be implemented in future versions');
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-slate-500 hover:text-indigo-600 text-sm transition-colors"
                      onClick={() => {
                        const user = userService.getUser();
                        if (!user) {
                          showToast('error', 'You need to be logged in to follow');
                          return;
                        }
                        showToast('success', 'You are now following this question');
                      }}
                    >
                      Follow
                    </button>
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
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            <div className="space-y-8 mb-8">
              {answers.map((answer) => (
                <div key={answer.id} className="border-t pt-8 first:border-t-0 first:pt-0">
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 hover:bg-indigo-50 rounded-xl transition-colors ${
                          userVotes.answers[answer.id]?.type === 'up' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
                        }`}
                        onClick={() => handleAnswerVote(answer.id, 'up')}
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </motion.button>

                      <span className="text-2xl font-bold text-slate-700">
                        {answer.votes?.upvotes || 0}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3 hover:bg-indigo-50 rounded-xl transition-colors ${
                          userVotes.answers[answer.id]?.type === 'down' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
                        }`}
                        onClick={() => handleAnswerVote(answer.id, 'down')}
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.button>

                      {!question.isSolved && userService.getUser()?.id === question.userId && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.button>
                      )}

                      {answer.isCorrect && (
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
                            dangerouslySetInnerHTML={{ __html: answer.description }}
                      />

                      <div className="flex justify-end mt-6">
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 
                                        rounded-xl flex items-center justify-center text-white font-bold text-sm
                                        shadow-lg shadow-indigo-500/20">
                            {answer.user?.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700">
                              {answer.user?.username}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(answer.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {userService.getUser() ? (
              <div className="mt-12 pt-8 border-t border-indigo-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Your Answer</h3>
                <AnswerEditor onSubmit={handleAnswerSubmit} isSubmitting={submitting} />
              </div>
            ) : (
              <div className="mt-12 pt-8 border-t border-indigo-100 text-center">
                <p className="text-slate-600 mb-4">You need to be logged in to answer this question</p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-2.5 rounded-xl text-white font-medium 
                           bg-gradient-to-r from-indigo-600 to-purple-600
                           hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-indigo-500/30
                           transition-all"
                >
                  Log in to answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
