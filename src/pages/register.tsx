import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('Registration successful');

        } catch (err) {
            setError('Failed to create account. Email might already be in use.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center bg-background-color"
        >
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-text-color">Create your account</h1>
                    <p className="text-dark-gray mt-2">
                        Join the QueueOverflow community
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-error-color text-error-color p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-text-color mb-1">
                            Display name
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                            placeholder="How you'll appear to others"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-color mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-color mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-dark-gray mt-1">
                            Passwords must be at least 8 characters
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-color mb-1">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading
                                    ? 'bg-primary-hover cursor-not-allowed'
                                    : 'bg-primary-color hover:bg-primary-hover'
                                } transition duration-200`}
                        >
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-dark-gray">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-color hover:text-primary-hover">
                            Log in
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-xs text-dark-gray text-center">
                    By clicking "Sign up", you agree to our{' '}
                    <a href="#" className="text-primary-color">terms of service</a> and{' '}
                    <a href="#" className="text-primary-color">privacy policy</a>.
                </div>
            </div>
        </motion.div>
    );
}