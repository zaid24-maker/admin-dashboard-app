import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Workflow } from 'lucide-react';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Already logged in → skip login page
    if (localStorage.getItem('token')) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const endpoint = isRegister ? 'register' : 'login';
        try {
            const body = isRegister ? { name, email, password } : { email, password };
            const res = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch {
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 overflow-hidden">
            {/* Animated Plasma Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 150, 0], y: [0, -100, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[140px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.4, 1], x: [0, -150, 0], y: [0, 150, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[140px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, 100, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="z-10 w-full max-w-[440px] p-10 space-y-8 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-[0_0_80px_-15px_rgba(99,102,241,0.5)]"
            >
                {/* Logo + Title */}
                <div className="text-center flex flex-col items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/50"
                    >
                        <Workflow size={32} className="text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2 tracking-tight">
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-400 font-semibold tracking-widest uppercase text-xs">
                        {isRegister ? 'Start your automation journey' : 'Initialize your pipelines'}
                    </p>
                </div>

                {error && (
                    <p className="bg-rose-500/10 text-rose-400 border border-rose-500/30 p-3 rounded-xl text-sm text-center font-medium">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Display name"
                            className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-600"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email address"
                        className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-600"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-600"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] tracking-wide text-lg"
                    >
                        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-sm">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    {' '}
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                    >
                        {isRegister ? 'Sign In' : 'Register'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;