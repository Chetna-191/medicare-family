import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const { user, login, register, demoLogin } = useAuth();
  const { showToast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (isRegister) {
        if (!name.trim()) {
          showToast('error', 'Missing Field', 'Please enter your family account name.');
          return;
        }
        await register(name.trim(), email.trim(), password);
        showToast('success', 'Welcome to MediCare!', 'Your family account is now active.');
      } else {
        await login(email.trim(), password);
        showToast('success', 'Welcome Back!', 'Logged in successfully.');
      }
      navigate('/');
    } catch (err: any) {
      showToast('error', isRegister ? 'Registration Failed' : 'Login Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setIsDemoSubmitting(true);
      await demoLogin();
      showToast('success', 'Demo Account Loaded!', 'Signed in as The Miller Family (3 members, 8 active medications).');
      navigate('/');
    } catch (err: any) {
      showToast('error', 'Demo Login Failed', err.message);
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#EAF6F6] via-[#E2F1F8] to-[#E0F0FF] selection:bg-[#2A9D8F] selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-6 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0] text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#2A9D8F]" />
            Family Medicine & Schedule Care
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#2A9D8F] text-white flex items-center justify-center shadow-lg shadow-[#2A9D8F]/25 border border-teal-400/30">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">MediCare Family</h1>
              <p className="text-xs font-bold text-[#0F766E]">Health & Medication Reminder Manager</p>
            </div>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed max-w-md mx-auto lg:mx-0 font-medium">
            Never miss a dose again. Manage daily medication routines across all family members with duplicate prevention, interactive schedule logging, and 7-day adherence tracking.
          </p>

          <div className="space-y-3 pt-2 text-xs font-semibold text-slate-800 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
              </div>
              <span>Multi-member daily schedule with 1-click Taken/Skip actions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#EAF6F6] text-[#0F766E] border border-[#BFE3F0] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
              </div>
              <span>Backend duplicate check & conflicting timing validation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span>Weekly adherence analytics, streak counts & interactive charts</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-6 bg-white rounded-3xl border border-[#BFE3F0] p-6 sm:p-8 shadow-[0_10px_35px_-5px_rgba(42,157,143,0.12),0_4px_12px_-2px_rgba(191,227,240,0.5)]"
        >
          {/* One-Click Fast Demo Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#0F766E] to-[#2A9D8F] text-white shadow-md shadow-[#2A9D8F]/20 text-center border border-teal-400/30">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              Instant Demo Access
            </div>
            <p className="text-[11px] text-teal-50 mb-3 font-medium">
              Explore live prototype pre-loaded with Grandpa Arthur, Mom Sarah, & Son Leo!
            </p>
            <button
              onClick={handleDemoSignIn}
              disabled={isDemoSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-[#0F766E] hover:bg-[#EAF6F6] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDemoSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
              ) : (
                <>
                  <span>Sign In as Demo Family (1-Click)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-[#BFE3F0]" />
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-[#BFE3F0]" />
          </div>

          {/* Sign In / Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Family / Account Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required={isRegister}
                      placeholder="e.g. The Miller Family"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all bg-[#EAF6F6]/30 focus:bg-white text-slate-900"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all bg-[#EAF6F6]/30 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#BFE3F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9D8F] transition-all bg-[#EAF6F6]/30 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer border border-teal-500/30"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isRegister ? (
                'Create Family Account'
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Toggle between Register and Login */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-bold text-[#0F766E] hover:text-[#2A9D8F] transition-colors cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : "Don't have an account yet? Create one"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
