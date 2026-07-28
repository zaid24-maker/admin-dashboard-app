import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, KeyRound, Mail, ShieldCheck, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'otp-request' | 'otp-verify' | 'twfa-verify'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');

    // 2FA variables
    const [tempUserId, setTempUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Already logged in → skip login page
    if (localStorage.getItem('token')) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleStandardSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = authMode === 'register' ? 'register' : 'login';
        try {
            const body = authMode === 'register' ? { name, email, password } : { email, password };
            const res = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                if (data.requires2FA) {
                    setTempUserId(data.userId);
                    setAuthMode('twfa-verify');
                    toast.success('2FA Required');
                } else {
                    localStorage.setItem('token', data.token);
                    toast.success('Authentication successful!');
                    navigate('/dashboard');
                }
            } else {
                toast.error(data.error || 'Authentication failed. Check your credentials.');
            }
        } catch {
            toast.error('Fatal Server Connection Error');
        } finally {
            setLoading(false);
        }
    };

    const handleTwfaSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/auth/login/2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: tempUserId, code: otpCode })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                toast.success('Authenticator Verified!');
                navigate('/dashboard');
            } else {
                toast.error(data.error || 'Invalid code');
            }
        } finally { setLoading(false); }
    };

    const handleOtpRequest = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Email is required for OTP");
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/auth/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('6-Digit Code sent to your inbox!');
                setAuthMode('otp-verify');
            } else {
                toast.error(data.error || 'Failed to send OTP code.');
            }
        } catch {
            toast.error('Fatal Server Error');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                toast.success('OTP Verified Successfully!');
                navigate('/dashboard');
            } else {
                toast.error(data.error || 'Invalid or Expired Code');
            }
        } catch {
            toast.error('Fatal Server Error');
        } finally {
            setLoading(false);
        }
    };

    const formVariants = {
        hidden: { opacity: 0, x: -50, scale: 0.95 },
        visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, type: "spring", bounce: 0.4 } },
        exit: { opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 overflow-hidden relative">
            {/* Animated Plasma Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 150, 0], y: [0, -100, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/20 blur-[140px]" />
                <motion.div animate={{ scale: [1, 1.4, 1], x: [0, -150, 0], y: [0, 150, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[140px]" />
                <motion.div animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, 100, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px]" />
            </div>

            <motion.div layout className="z-10 w-full max-w-[400px] p-8 space-y-5 bg-slate-900/60 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] relative overflow-hidden">
                {/* Logo */}
                <motion.div layout className="text-center flex flex-col items-center">
                    <motion.div layoutId="logo" className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                        {authMode === 'otp-verify' ? <ShieldCheck size={22} className="text-white" /> : authMode === 'twfa-verify' ? <QrCode size={22} className="text-white" /> : <Workflow size={22} className="text-white" />}
                    </motion.div>
                    <motion.h2 layout className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                        {authMode === 'register' ? 'Create Account' : authMode === 'otp-verify' ? 'Secure OTP Login' : authMode === 'twfa-verify' ? 'Authenticator' : 'Welcome Back'}
                    </motion.h2>
                    <p className="text-slate-500 text-xs mt-1 font-medium">AutoDash Control Panel</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* STANDARD LOGIN / REGISTER FORM */}
                    {(authMode === 'login' || authMode === 'register') && (
                        <motion.form key="standard" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleStandardSubmit} className="space-y-3">
                            {authMode === 'register' && (
                                <input type="text" placeholder="Display name" className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-600" value={name} onChange={e => setName(e.target.value)} required />
                            )}
                            <input type="email" placeholder="Email address" className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-600" value={email} onChange={e => setEmail(e.target.value)} required />
                            <input type="password" placeholder="Password" className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder-slate-600" value={password} onChange={e => setPassword(e.target.value)} required />

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full mt-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center space-x-2">
                                <span>{loading ? 'Authenticating...' : authMode === 'register' ? 'Create Account' : 'Sign In'}</span>
                            </motion.button>
                        </motion.form>
                    )}

                    {/* TWO-FACTOR TOTP VERIFICATION */}
                    {authMode === 'twfa-verify' && (
                        <motion.form key="twfa-ver" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleTwfaSubmit} className="space-y-3">
                            <p className="text-slate-400 text-xs text-center">2FA required. Enter the 6-digit TOTP or a Backup Key.</p>
                            <input type="text" placeholder="000000" className="w-full text-center tracking-[0.4em] text-2xl font-mono bg-slate-950/50 border border-indigo-500/50 text-indigo-400 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all placeholder-indigo-900/20" value={otpCode} onChange={e => setOtpCode(e.target.value)} required />

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm flex items-center justify-center space-x-2">
                                <span>{loading ? 'Authenticating...' : 'Verify Authenticator'}</span>
                                <ShieldCheck size={15} />
                            </motion.button>
                        </motion.form>
                    )}

                    {/* OTP EMAIL REQUEST FORM */}
                    {authMode === 'otp-request' && (
                        <motion.form key="otp-req" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleOtpRequest} className="space-y-3">
                            <p className="text-slate-400 text-xs text-center">Enter your email. We'll send a 6-digit one-time code.</p>
                            <input type="text" placeholder="Email address" className="w-full bg-slate-950/50 border border-indigo-500/50 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all font-medium placeholder-slate-500" value={email} onChange={e => setEmail(e.target.value)} required />

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm flex items-center justify-center space-x-2">
                                <span>{loading ? 'Sending...' : 'Send Magic OTP'}</span>
                                <Mail size={15} />
                            </motion.button>
                        </motion.form>
                    )}

                    {/* OTP VERIFY 6-DIGIT CODE */}
                    {authMode === 'otp-verify' && (
                        <motion.form key="otp-ver" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleOtpVerify} className="space-y-3">
                            <p className="text-slate-400 text-xs text-center">Code sent to <span className="text-white font-bold">{email}</span></p>
                            <input type="text" placeholder="000000" maxLength="6" className="w-full text-center tracking-[0.4em] text-2xl font-mono bg-slate-950/50 border border-emerald-500/50 text-emerald-400 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all placeholder-emerald-900/20" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} required />

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm flex items-center justify-center space-x-2">
                                <span>{loading ? 'Verifying...' : 'Verify & Login'}</span>
                                <ShieldCheck size={15} />
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Switcher Footer */}
                <motion.div layout className="pt-3 border-t border-white/5 space-y-2">
                    {authMode === 'login' && (
                        <>
                            <button type="button" onClick={() => setAuthMode('otp-request')} className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-bold hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center space-x-2">
                                <KeyRound size={14} /> <span>Login with OTP Email</span>
                            </button>
                            <p className="text-center text-slate-500 text-xs">No account? <button onClick={() => setAuthMode('register')} className="text-indigo-400 font-bold hover:text-indigo-300">Sign Up</button></p>
                        </>
                    )}
                    {authMode === 'register' && (
                        <p className="text-center text-slate-500 text-xs">Already registered? <button onClick={() => setAuthMode('login')} className="text-indigo-400 font-bold hover:text-indigo-300">Sign In</button></p>
                    )}
                    {(authMode === 'otp-request' || authMode === 'otp-verify' || authMode === 'twfa-verify') && (
                        <button type="button" onClick={() => { setAuthMode('login'); setTempUserId(null); }} className="w-full py-2 text-slate-400 font-semibold hover:text-white transition-all text-xs flex items-center justify-center">
                            ← Back to Password Login
                        </button>
                    )}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Login;