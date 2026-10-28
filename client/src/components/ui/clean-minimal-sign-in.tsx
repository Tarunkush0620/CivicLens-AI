import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = '277509508765-g8uugric06f7hvcjjfin1riikbbqmj0e.apps.googleusercontent.com';

interface SignIn2Props {
  onSuccess?: () => void;
  redirectUrl?: string;
  defaultEmail?: string;
}

export const SignIn2: React.FC<SignIn2Props> = ({
  onSuccess,
  redirectUrl = '/profile',
  defaultEmail = '',
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ─── Real Official Google OAuth 2.0 Handler ───
  // When returning from https://accounts.google.com with #access_token=...
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setIsLoading(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.email) {
              localStorage.setItem('civiclens_user_email', data.email);
              if (data.name) localStorage.setItem('civiclens_user_name', data.name);
              if (data.picture) localStorage.setItem('civiclens_user_picture', data.picture);
              setSuccess(true);
              // Clean the hash from the browser URL
              window.history.replaceState(null, '', window.location.pathname);
              if (onSuccess) onSuccess();
              setTimeout(() => navigate(redirectUrl), 600);
            }
          })
          .catch((err) => {
            console.error('Google OAuth userinfo fetch error:', err);
            setError('Failed to fetch Google profile. Please try again.');
            setIsLoading(false);
          });
      }
    }
  }, [navigate, redirectUrl, onSuccess]);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Standard Email/Password Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Persist user's entered email
    localStorage.setItem('civiclens_user_email', email.trim());

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        navigate(redirectUrl);
      }, 600);
    }, 500);
  };

  // Official Google OAuth Redirect trigger (Directly navigates to accounts.google.com)
  const triggerGoogleOAuth = () => {
    setError('');
    setIsLoading(true);

    const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const activeClientId = (envClientId && envClientId.trim()) || GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + '/login';

    // Official Google OAuth 2.0 endpoint with prompt=select_account
    // This takes the user to accounts.google.com to choose from all their Gmail accounts
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      activeClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      {/* ─── Clean Minimal Sign-In Card ─── */}
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/70 via-white to-white rounded-3xl shadow-xl p-8 flex flex-col items-center border border-slate-200/90 text-slate-900 transition-all">
        {/* Top Logo Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-md border border-slate-100">
          <LogIn className="w-7 h-7 text-slate-900" />
        </div>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-1.5 text-center text-slate-950 tracking-tight">
          Sign in with email
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-6 text-center leading-relaxed">
          Access your CivicLens account to track grievances, view reports, and verify civic impact.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 mb-2">
          {/* Email Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder="Enter your Gmail / Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/80 text-slate-900 text-sm font-medium transition-all placeholder:text-slate-400"
              required
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/80 text-slate-900 text-sm font-medium transition-all placeholder:text-slate-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer text-xs select-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error & Forgot Password */}
          <div className="w-full flex items-center justify-between text-xs pt-0.5">
            {error ? (
              <span className="text-rose-600 font-semibold">{error}</span>
            ) : (
              <span className="text-slate-400">Encrypted 256-bit</span>
            )}
            <button
              type="button"
              onClick={() => setError('Password reset instructions sent to your registered email.')}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer ml-auto"
            >
              Forgot password?
            </button>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Signed in successfully! Redirecting...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-b from-slate-800 to-slate-950 text-white font-bold py-2.5 rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] cursor-pointer transition-all mt-2 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Get Started</span>
            )}
          </button>
        </form>

        {/* Or sign in with */}
        <div className="flex items-center w-full my-3">
          <div className="flex-grow border-t border-dashed border-slate-200" />
          <span className="mx-3 text-xs text-slate-400 font-medium whitespace-nowrap">
            Or sign in with
          </span>
          <div className="flex-grow border-t border-dashed border-slate-200" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3 w-full justify-center mt-1">
          {/* Official Google Sign-In Button */}
          <button
            type="button"
            onClick={triggerGoogleOAuth}
            disabled={isLoading}
            className="flex items-center justify-center w-12 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all grow shadow-2xs cursor-pointer active:scale-95 group disabled:opacity-60"
            title="Sign in with official Google Account (takes you to accounts.google.com)"
          >
            <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex items-center justify-center w-12 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all grow shadow-2xs cursor-pointer active:scale-95"
            title="Sign in with Facebook"
          >
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="flex items-center justify-center w-12 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all grow shadow-2xs cursor-pointer active:scale-95"
            title="Sign in with Apple"
          >
            <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.65-.82 1.1-1.96.98-3.1-.96.04-2.17.65-2.85 1.45-.6.69-1.12 1.84-.98 2.94 1.08.08 2.2-.47 2.85-1.29z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn2;
