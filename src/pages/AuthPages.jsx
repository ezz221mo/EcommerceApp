import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff,
  HiOutlineUser, HiOutlineExclamationCircle,
  HiOutlineShoppingBag, HiOutlineTag,
} from 'react-icons/hi';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ── Inline field error ────────────────────────────────────────────────────────
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

// ── Validation ────────────────────────────────────────────────────────────────
// Strict email: local@domain.tld — no spaces, no consecutive dots, valid TLD
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
// Password: at least one letter AND one digit
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

  // Name
  if (!name.trim())                err.name = 'Full name is required';
  else if (name.trim().length < 3) err.name = 'Name must be at least 3 characters';
  else if (/\d/.test(name))        err.name = 'Name should not contain numbers';

  // Email — strict check
  if (!email.trim())
    err.email = 'Email is required';
  else if (!EMAIL_RE.test(email.trim()))
    err.email = 'Enter a valid email address (e.g. name@domain.com)';

  // Password
  if (!password)
    err.password = 'Password is required';
  else if (password.length < 8)
    err.password = 'Password must be at least 8 characters';
  else if (!PWD_MIX_RE.test(password))
    err.password = 'Password must contain both letters and numbers';
  else if (/^\d+$/.test(password))
    err.password = 'Password cannot be numbers only';

  // Confirm
  if (!confirm)
    err.confirm = 'Please confirm your password';
  else if (password !== confirm)
    err.confirm = 'Passwords do not match';

  // Terms
  if (!terms)
    err.terms = 'You must accept the Terms of Service to continue';

  return err;
}

// ── Password strength meter ───────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Za-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),   // special char bonus
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

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  // Use store actions directly — no manual localStorage parsing needed
  const { login, findUserByEmail } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const redirectTo = location.state?.from || '/';

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1 — format validation
    const err = validateLogin(form);

    // Step 2 — only check account existence if format is valid
    let matchedUser = null;
    if (!err.email && !err.password) {
      matchedUser = findUserByEmail(form.email);
      if (!matchedUser) {
        err.email = 'No account found with this email. Please register first.';
      } else if (matchedUser.password !== form.password) {
        err.password = 'Incorrect password. Please try again.';
      }
    }

    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    login({ name: matchedUser.name, email: matchedUser.email, role: matchedUser.role });

    toast.success(
      matchedUser.role === 'seller' ? 'Welcome back, Seller! 🏪' : 'Welcome back! 👋',
      { style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' } }
    );

    const dest = redirectTo !== '/'
      ? redirectTo
      : matchedUser.role === 'seller' ? '/seller/dashboard' : '/';

    navigate(dest, { replace: true });
    setLoading(false);
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" className={cls('email')} />
              </div>
              <AnimatePresence mode="wait">{errors.email && <FieldError key="e" msg={errors.email} />}</AnimatePresence>
            </div>

            {/* Password */}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded accent-orange-500" />
                Remember me
              </label>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.99 } : {}} className="btn-primary w-full py-4 text-base justify-center">
              {loading ? <><Spinner /> Signing in…</> : 'Sign In'}
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

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'buyer', terms: false });
  const [errors, setErrors]           = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  const { register, emailExists } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateRegister(form);

    // Duplicate email check (only if email format is valid)
    if (!err.email && emailExists(form.email)) {
      err.email = 'This email is already registered. Please log in instead.';
    }

    if (Object.keys(err).length) {
      setErrors(err);
      document.querySelector(`[data-field="${Object.keys(err)[0]}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });

    toast.success(
      form.role === 'seller' ? 'Seller account created! Welcome 🏪' : 'Account created! Welcome to LuxeShop 🎉',
      { style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' } }
    );

    navigate(form.role === 'seller' ? '/seller/dashboard' : '/');
    setLoading(false);
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

            {/* Role selector */}
            <div data-field="role">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">I want to…</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'buyer',  label: 'Shop Products', icon: HiOutlineShoppingBag, desc: 'Browse & buy'  },
                  { value: 'seller', label: 'Sell Products', icon: HiOutlineTag,         desc: 'List & manage' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value} type="button" onClick={() => setForm(f => ({ ...f, role: value }))}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      form.role === value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs opacity-70">{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div data-field="name">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="text" autoComplete="name" value={form.name} onChange={handleChange('name')} placeholder="Jane Smith" className={cls('name')} />
              </div>
              <AnimatePresence mode="wait">{errors.name && <FieldError key="n" msg={errors.name} />}</AnimatePresence>
            </div>

            {/* Email */}
            <div data-field="email">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" className={cls('email')} />
              </div>
              <AnimatePresence mode="wait">{errors.email && <FieldError key="e" msg={errors.email} />}</AnimatePresence>
            </div>

            {/* Password */}
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

            {/* Confirm */}
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

            {/* Terms */}
            <div data-field="terms">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.terms} onChange={handleChange('terms')} className="w-4 h-4 mt-0.5 rounded accent-orange-500 cursor-pointer" />
                <span className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-orange-500 hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-orange-500 hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>
              <AnimatePresence mode="wait">{errors.terms && <FieldError key="t" msg={errors.terms} />}</AnimatePresence>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.99 } : {}}
              className="btn-primary w-full py-4 text-base justify-center mt-2"
            >
              {loading ? <><Spinner /> Creating account…</> : `Create ${form.role === 'seller' ? 'Seller' : 'Buyer'} Account`}
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