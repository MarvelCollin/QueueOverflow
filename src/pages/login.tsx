import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/user-service';
import { useToast } from '../components/toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            showToast('error', 'Email is required');
            return;
        }

        if (!password) {
            setError('Password is required');
            showToast('error', 'Password is required');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            showToast('error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);        try {
            const user = await userService.login({ email, password, rememberMe });
            showToast('success', `Welcome back, ${user.display_name}!`);
            navigate(from || '/questions', { replace: true });
        } catch (err: any) {

            setError(err.message || 'Invalid email or password. Please try again.');
            showToast('error', 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
        >
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-6">
                    <h1 className="text-center text-2xl font-extrabold text-white">QueueOverflow</h1>
                    <p className="text-center text-indigo-100 text-sm mt-2">Get answers to your questions</p>
                </div>

                <div className="px-8 py-8">
                    <h2 className="text-center text-xl font-bold text-gray-700 mb-6">Sign in to your account</h2>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 
                                        rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                        focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 
                                        rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                        focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                                        text-sm font-medium rounded-lg text-white ${isLoading
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    } transition duration-150 ease-in-out shadow-md`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span>Signing in...</span>
                                    </div>
                                ) : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Create an account
                            </Link>
                        </p>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                userService.setGuest();
                                showToast('info', 'Continuing as guest');
                                navigate('/questions');
                            }}
                            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700
                                    hover:bg-gray-50 transition duration-150 ease-in-out"
                        >
                            Continue as Guest
                        </motion.button>
                    </div>
                </div>
            </div >
        </motion.div >
    );
}