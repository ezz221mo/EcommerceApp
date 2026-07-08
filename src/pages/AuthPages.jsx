import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineUser, HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const FieldError = ({ msg }) =>
  msg ? (
    <motion.p
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
      className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium"
    >
      <HiOutlineExclamationCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </motion.p>
  ) : null;

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PWD_MIX_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function validateLogin({ email, password }) {
  const err = {};
  if (!email.trim())              err.email    = 'Email is required';
  else if (!EMAIL_RE.test(email.trim())) err.email = 'Enter a valid email (e.g. name@domain.com)';
  if (!password)                  err.password = 'Password is required';
  else if (password.length < 8)  err.password = 'Password must be at least 8 characters';
  return err;
}

function validateRegister({ name, email, password, confirm, terms }) {
  const err = {};
  if (!name.trim())                err.name = 'Full name is required';
  else if (name.trim().length < 3) err.name = 'Name must be at least 3 characters';
  else if (/\d/.test(name))        err.name = 'Name should not contain numbers';
  if (!email.trim())               err.email = 'Email is required';
  else if (!EMAIL_RE.test(email.trim())) err.email = 'Enter a valid email address (e.g. name@domain.com)';
  if (!password)                   err.password = 'Password is required';
  else if (password.length < 8)    err.password = 'Password must be at least 8 characters';
  else if (!PWD_MIX_RE.test(password)) err.password = 'Password must contain both letters and numbers';
  else if (/^\d+$/.test(password)) err.password = 'Password cannot be numbers only';
  if (!confirm)                    err.confirm = 'Please confirm your password';
  else if (password !== confirm)   err.confirm = 'Passwords do not match';
  if (!terms)                      err.terms = 'You must accept the Terms of Service to continue';
  return err;
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Za-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const levels = [
    { label: 'Very Weak', color: 'bg-rose-500',   width: 'w-1/4' },
    { label: 'Weak',      color: 'bg-orange-500', width: 'w-2/4' },
    { label: 'Fair',      color: 'bg-amber-500',  width: 'w-3/4' },
    { label: 'Strong',    color: 'bg-teal-500',   width: 'w-full' },
  ];
  const level = levels[score - 1] || levels[0];
  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${level.color}`}
          initial={{ width: 0 }}
          animate={{ width: level.width }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className={`text-xs mt-1 font-medium ${
        score <= 1 ? 'text-rose-500' : score === 2 ? 'text-orange-500' : score === 3 ? 'text-amber-500' : 'text-teal-500'
      }`}>{level.label} password</p>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login: authLogin, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // After login, navigate by role — ProtectedRoute handles gating
  const getRoleDashboard = () => {
    if (!userData) return '/';
    switch (userData.role) {
      case 'admin':  return '/dashboard/admin';
      case 'seller': return '/dashboard/seller';
      case 'buyer':  return '/dashboard/buyer';
      default:       return '/';
    }
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateLogin(form);
    if (Object.keys(err).length) { setErrors(err); return; }

    setSubmitting(true);
    try {
      await authLogin(form.email.trim(), form.password);
      toast.success('Welcome back! 👋', {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
      navigate(getRoleDashboard(), { replace: true });
    } catch (err) {
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setErrors({ email: 'Invalid email or password. Please try again.' });
      } else if (code === 'auth/invalid-email') {
        setErrors({ email: 'Invalid email format.' });
      } else if (code === 'auth/too-many-requests') {
        setErrors({ email: 'Too many attempts. Please try again later.' });
      } else {
        setErrors({ email: 'Login failed. Please check your credentials.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cls = (field) =>
    `input-field pl-12 ${errors[field] ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30 dark:bg-rose-950/10' : ''}`;

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-gradient-to-br from-stone-50 to-orange-50/30 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Welcome back</h1>
            <p className="text-stone-500 mt-2">Sign in to your LuxeShop account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" className={cls('email')} />
              </div>
              <AnimatePresence mode="wait">{errors.email && <FieldError key="e" msg={errors.email} />}</AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={handleChange('password')} placeholder="••••••••" className={`${cls('password')} pr-12`} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              <AnimatePresence mode="wait">{errors.password && <FieldError key="p" msg={errors.password} />}</AnimatePresence>
            </div>

            <motion.button type="submit" disabled={submitting} whileHover={!submitting ? { scale: 1.01 } : {}} whileTap={!submitting ? { scale: 0.99 } : {}} className="btn-primary w-full py-4 text-base justify-center">
              {submitting ? <><Spinner /> Signing in…</> : 'Sign In'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-semibold">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateRegister(form);
    if (Object.keys(err).length) {
      setErrors(err);
      document.querySelector(`[data-field="${Object.keys(err)[0]}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      await authRegister(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created! Welcome to LuxeShop 🎉', {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
      navigate('/dashboard/buyer');
    } catch (err) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setErrors({ email: 'This email is already registered. Please log in instead.' });
      } else if (code === 'auth/weak-password') {
        setErrors({ password: 'Password is too weak. Choose a stronger one.' });
      } else if (code === 'auth/invalid-email') {
        setErrors({ email: 'Invalid email format.' });
      } else {
        setErrors({ email: 'Registration failed. Please try again.' });
      }
      document.querySelector(`[data-field="${Object.keys(errors)[0] || 'email'}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setSubmitting(false);
    }
  };

  const cls = (field) =>
    `input-field pl-12 ${errors[field] ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30 dark:bg-rose-950/10' : ''}`;

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-stone-50 to-orange-50/30 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">Create account</h1>
            <p className="text-stone-500 mt-2">Join LuxeShop today</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <div data-field="name">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="text" autoComplete="name" value={form.name} onChange={handleChange('name')} placeholder="Jane Smith" className={cls('name')} />
              </div>
              <AnimatePresence mode="wait">{errors.name && <FieldError key="n" msg={errors.name} />}</AnimatePresence>
            </div>

            <div data-field="email">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" className={cls('email')} />
              </div>
              <AnimatePresence mode="wait">{errors.email && <FieldError key="e" msg={errors.email} />}</AnimatePresence>
            </div>

            <div data-field="password">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={handleChange('password')} placeholder="Min 8 chars" className={`${cls('password')} pr-12`} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {!errors.password && <PasswordStrength password={form.password} />}
              <AnimatePresence mode="wait">{errors.password && <FieldError key="pw" msg={errors.password} />}</AnimatePresence>
              {!form.password && <p className="text-xs text-stone-400 mt-1.5">Min 8 chars — must include letters and numbers</p>}
            </div>

            <div data-field="confirm">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirm} onChange={handleChange('confirm')} placeholder="••••••••" className={cls('confirm')} />
                {form.confirm && form.password && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${form.password === form.confirm ? 'text-teal-500' : 'text-rose-400'}`}>
                    {form.password === form.confirm ? '✓' : '✗'}
                  </span>
                )}
              </div>
              <AnimatePresence mode="wait">{errors.confirm && <FieldError key="c" msg={errors.confirm} />}</AnimatePresence>
            </div>

            <div data-field="terms">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.terms} onChange={handleChange('terms')} className="w-4 h-4 mt-0.5 rounded accent-orange-500 cursor-pointer" />
                <span className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  I have read and agree to the{' '}
                  <Link to="/privacy-policy" className="text-orange-500 hover:underline font-medium">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link to="/terms-and-conditions" className="text-orange-500 hover:underline font-medium">Terms & Conditions</Link>
                </span>
              </label>
              <AnimatePresence mode="wait">{errors.terms && <FieldError key="t" msg={errors.terms} />}</AnimatePresence>
            </div>

            <motion.button
              type="submit" disabled={submitting || !form.terms}
              whileHover={!submitting && form.terms ? { scale: 1.01 } : {}} whileTap={!submitting && form.terms ? { scale: 0.99 } : {}}
              className="btn-primary w-full py-4 text-base justify-center mt-2"
            >
              {submitting ? <><Spinner /> Creating account…</> : 'Create Buyer Account'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-semibold">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
