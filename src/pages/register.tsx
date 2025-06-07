import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/user-service';
import { useToast } from '../components/toast';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username) {
            setError('Username is required');
            showToast('error', 'Username is required');
            return;
        }

        if (!email) {
            setError('Email is required');
            showToast('error', 'Email is required');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            showToast('error', 'Please enter a valid email address');
            return;
        }

        if (!password) {
            setError('Password is required');
            showToast('error', 'Password is required');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            showToast('error', 'Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            showToast('error', "Passwords don't match");
            return;
        }

        setIsLoading(true);

        try {
            const user = await userService.register({
                username,
                email,
                password,
                display_name: displayName || username,
            });

            showToast('success', `Welcome to QueueOverflow, ${user.display_name}!`);
            navigate('/questions', { replace: true });
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
            showToast('error', err.message || 'Registration failed. Please try again.');
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
                    <p className="text-center text-indigo-100 text-sm mt-2">Join the community</p>
                </div>

                <div className="px-8 py-8">
                    <h2 className="text-center text-xl font-bold text-gray-700 mb-6">Create your account</h2    >

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                           rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                           focus:border-indigo-500 sm:text-sm"
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name
                                </label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                           rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                           focus:border-indigo-500 sm:text-sm"
                                    placeholder="How you'll appear"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                       rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                       focus:border-indigo-500 sm:text-sm"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                           rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                           focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 
                                           rounded-lg text-gray-900 focus:outline-none focus:ring-indigo-500 
                                           focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Passwords must be at least 8 characters long
                        </p>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                                       text-sm font-medium rounded-lg text-white ${
                                    isLoading
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                } transition duration-150 ease-in-out shadow-md`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating account...</span>
                                    </div>
                                ) : 'Create Account'}
                            </button>
                        </div>

                        <div className="mt-6 text-center space-y-4">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Sign in
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

                            <div className="mt-4">
                                <p className="text-xs text-center text-gray-500">
                                    By signing up, you agree to our{' '}
                                    <button 
                                      type="button"
                                      className="text-indigo-600 hover:text-indigo-500"
                                      onClick={() => showToast('info', 'Terms of Service will be available soon')}
                                    >
                                        Terms of Service
                                    </button>{' '}
                                    and{' '}
                                    <button 
                                      type="button"
                                      className="text-indigo-600 hover:text-indigo-500"
                                      onClick={() => showToast('info', 'Privacy Policy will be available soon')}
                                    >
                                        Privacy Policy
                                    </button>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}