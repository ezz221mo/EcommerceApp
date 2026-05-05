import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineUser, HiOutlineMail, HiOutlineLockClosed,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck,
  HiOutlineArrowLeft, HiOutlineExclamationCircle,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

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
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_STR_RE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

function validateEdit({ name, email, newPassword, confirmPassword }) {
  const err = {};
  if (!name.trim())             err.name  = 'Name is required';
  else if (name.trim().length < 3) err.name = 'Name must be at least 3 characters';
  if (!email.trim())            err.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) err.email = 'Enter a valid email address';
  if (newPassword) {
    if (newPassword.length < 6)        err.newPassword = 'Password must be at least 6 characters';
    else if (!PWD_STR_RE.test(newPassword)) err.newPassword = 'Must contain letters and numbers';
    if (!confirmPassword)              err.confirmPassword = 'Please confirm your new password';
    else if (newPassword !== confirmPassword) err.confirmPassword = 'Passwords do not match';
  }
  return err;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:            user?.name  || '',
    email:           user?.email || '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [errors,       setErrors]       = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const isSeller = user?.role === 'seller';

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const inputClass = (field) =>
    `input-field pl-12 transition-all duration-200 ${
      errors[field] ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30 dark:bg-rose-950/10' : ''
    }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEdit(form);
    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    updateUser({
      name:  form.name.trim(),
      email: form.email.trim(),
      ...(form.newPassword ? { passwordChanged: true } : {}),
    });

    toast.success('Profile updated successfully! ✅', {
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
    setLoading(false);
    navigate(isSeller ? '/seller/dashboard' : '/profile');
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back link */}
        <Link
          to={isSeller ? '/seller/dashboard' : '/profile'}
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-500 transition-colors mb-8 group"
        >
          <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to {isSeller ? 'Dashboard' : 'Profile'}
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
              Edit Profile
            </h1>
            <p className="text-stone-500 mt-1">Update your personal information and password</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* ── Who you are (read-only role badge) ── */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-teal-500
                              flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-stone-900 dark:text-stone-100">{user?.name}</p>
                <p className="text-sm text-stone-400">{user?.email}</p>
                <span className={`inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                  isSeller
                    ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                    : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'
                }`}>
                  {isSeller ? '🏪 Seller Account' : '🛍️ Buyer Account'}
                </span>
              </div>
            </div>

            {/* ── Personal Info ── */}
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <HiOutlineMail className="w-5 h-5 text-orange-500" />
                Personal Information
              </h2>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input type="text" value={form.name} onChange={handleChange('name')}
                    placeholder="Your full name" autoComplete="name" className={inputClass('name')} />
                </div>
                <AnimatePresence mode="wait">
                  {errors.name && <FieldError key="name-err" msg={errors.name} />}
                </AnimatePresence>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input type="email" value={form.email} onChange={handleChange('email')}
                    placeholder="you@example.com" autoComplete="email" className={inputClass('email')} />
                </div>
                <AnimatePresence mode="wait">
                  {errors.email && <FieldError key="email-err" msg={errors.email} />}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Change Password ── */}
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-orange-500" />
                  Change Password
                </h2>
                <span className="text-xs text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                  Optional
                </span>
              </div>
              <p className="text-sm text-stone-400 -mt-2">Leave blank to keep your current password</p>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.newPassword} onChange={handleChange('newPassword')}
                    placeholder="New password (optional)" autoComplete="new-password"
                    className={`${inputClass('newPassword')} pr-12`}
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  {errors.newPassword && <FieldError key="newpwd-err" msg={errors.newPassword} />}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={handleChange('confirmPassword')}
                    placeholder="Repeat new password" autoComplete="new-password"
                    className={inputClass('confirmPassword')}
                  />
                  {form.confirmPassword && form.newPassword && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold ${
                      form.newPassword === form.confirmPassword ? 'text-teal-500' : 'text-rose-400'
                    }`}>
                      {form.newPassword === form.confirmPassword ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {errors.confirmPassword && <FieldError key="confirm-err" msg={errors.confirmPassword} />}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                type="submit" disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading  ? { scale: 0.99 } : {}}
                className="btn-primary flex-1 py-4 text-base justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <><HiOutlineCheck className="w-5 h-5" /> Save Changes</>
                )}
              </motion.button>
              <motion.button
                type="button" onClick={() => navigate(isSeller ? '/seller/dashboard' : '/profile')}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="btn-secondary flex-1 py-4 text-base justify-center"
              >
                Cancel
              </motion.button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}