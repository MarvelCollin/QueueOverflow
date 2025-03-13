import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../services/user-service';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/toast';

export default function Home() {
    const navigate = useNavigate();
    const user = userService.getUser();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const timer = setTimeout(() => {
            showToast('info', 'Redirecting to questions page...');
            navigate('/questions');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate, user, showToast]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
        >
            <div className="text-center max-w-2xl px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-4">
                        QueueOverflow
                    </h1>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </motion.div>

                {user && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl text-gray-700">
                            Welcome back, <span className="font-semibold text-indigo-600">{user.display_name}</span>!
                        </h2>
                        <p className="text-gray-600">
                            Redirecting you to the questions page in a moment...
                        </p>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"
                        />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
