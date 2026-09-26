import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail) => {
    try {
      setLoading(true);
      setError('');
      await demoLogin(demoEmail);
    } catch (err) {
      setError('Demo login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back to TaskFlow
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time collaborative project management
          </p>
        </div>

        {/* 1-Click Quick Demo Login Section */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-800/60 border border-indigo-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant 1-Click Demo Login</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Test multi-user real-time collaboration instantly across browser tabs:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('alex@taskflow.dev')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Alex"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    Alex Morgan
                  </div>
                  <div className="text-[10px] text-slate-400">Project Lead (Admin)</div>
                </div>
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">
                Log In →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('sarah@taskflow.dev')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                  alt="Sarah"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    Sarah Chen
                  </div>
                  <div className="text-[10px] text-slate-400">Senior Full-Stack Dev</div>
                </div>
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">
                Log In →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn('marcus@taskflow.dev')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Marcus"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                    Marcus Vance
                  </div>
                  <div className="text-[10px] text-slate-400">Lead UI/UX Designer</div>
                </div>
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">
                Log In →
              </span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Or Sign In With Email
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full text-xs bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
