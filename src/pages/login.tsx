import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Implement your login logic here
      // const response = await api.auth.login({ email, password });
      
      // For now, simulate a login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect or handle successful login
      console.log('Login successful');
      
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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
          <h1 className="text-2xl font-bold text-text-color">Log in to QueueOverflow</h1>
          <p className="text-dark-gray mt-2">
            Get answers to your technical questions
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-error-color text-error-color p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-text-color">
                Password
              </label>
              <a href="#" className="text-sm text-primary-color hover:text-primary-hover">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary-color focus:ring-primary-color border-light-gray rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-text-color">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-primary-hover cursor-not-allowed'
                : 'bg-primary-color hover:bg-primary-hover'
            } transition duration-200`}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-dark-gray">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-color hover:text-primary-hover">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
