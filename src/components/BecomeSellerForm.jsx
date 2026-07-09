import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCheck, HiOutlineX, HiOutlineSelector, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { createSellerApplication, getSellerApplicationByUser, updateSellerApplication } from '../services/sellerApplicationService';
import { egyptianGovernorates } from '../data/governorates';
import toast from 'react-hot-toast';

function validateEgyptianPhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  return /^01[0125]\d{8}$/.test(cleaned);
}

export default function BecomeSellerForm() {
  const { currentUser, userData, becomeSeller } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    phone: '',
    governorate: '',
    fullAddress: '',
  });
  const [agreeCommission, setAgreeCommission] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    (async () => {
      const app = await getSellerApplicationByUser(currentUser.uid);
      if (cancelled) return;
      setApplication(app);
      if (app && app.status === 'Approved' && userData?.role !== 'seller') {
        await becomeSeller();
      }
      if (app && app.status === 'Rejected') {
        setForm({
          storeName: app.storeName || '',
          storeDescription: app.storeDescription || '',
          phone: app.phone || '',
          governorate: app.governorate || '',
          fullAddress: app.fullAddress || '',
        });
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [currentUser, becomeSeller]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const errors = {};
  if (!form.storeName.trim()) errors.storeName = 'Store name is required';
  if (!form.storeDescription.trim()) errors.storeDescription = 'Store description is required';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!validateEgyptianPhone(form.phone)) errors.phone = 'Must be a valid Egyptian mobile number (010/011/012/015)';
  if (!form.governorate) errors.governorate = 'Governorate is required';
  if (!form.fullAddress.trim()) errors.fullAddress = 'Full address is required';

  const filtered = egyptianGovernorates.filter(g =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 || !agreeCommission) return;
    setSubmitting(true);
    try {
      if (application && application.status === 'Rejected') {
        await updateSellerApplication(application.id, form);
        const updated = await getSellerApplicationByUser(currentUser.uid);
        setApplication(updated);
        toast.success('Application resubmitted successfully!', { style: { borderRadius: '12px' } });
      } else {
        await createSellerApplication(currentUser.uid, userData?.name || '', userData?.email || '', form);
        const newApp = await getSellerApplicationByUser(currentUser.uid);
        setApplication(newApp);
        toast.success('Application submitted successfully!', { style: { borderRadius: '12px' } });
      }
    } catch {
      toast.error('Failed to submit application. Please try again.', { style: { borderRadius: '12px' } });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (application && application.status === 'Approved') {
    return (
      <div className="card p-6 text-center">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HiOutlineCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          You are already a Seller
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Your seller account is active. You can manage your store from the Seller Dashboard.
        </p>
      </div>
    );
  }

  if (application && application.status === 'Pending') {
    return (
      <div className="card p-6 text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Application Pending
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Your seller application is under review. You will be notified once it is approved.
        </p>
      </div>
    );
  }

  const isRejected = application && application.status === 'Rejected';

  return (
    <div className="card p-6">
      {isRejected && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl mb-6">
          <div className="flex items-start gap-3">
            <HiOutlineX className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-rose-700 dark:text-rose-400 text-sm">Application Rejected</h4>
              <p className="text-rose-600 dark:text-rose-400/80 text-sm mt-1">
                Reason: {application.rejectionReason}
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-xs mt-2">
                Please fix the issues and resubmit your application.
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
        {isRejected ? 'Resubmit Application' : 'Become a Seller'}
      </h3>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
        Fill out the form below to apply as a seller on LuxeShop.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Store Name <span className="text-rose-500">*</span>
          </label>
          <input type="text" value={form.storeName}
            onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
            placeholder="Your store name" className="input-field" />
          {errors.storeName && <p className="text-xs text-rose-500 mt-1">{errors.storeName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Store Description <span className="text-rose-500">*</span>
          </label>
          <textarea rows={3} value={form.storeDescription}
            onChange={e => setForm(f => ({ ...f, storeDescription: e.target.value }))}
            placeholder="Describe your store and what you sell" className="input-field resize-none" />
          {errors.storeDescription && <p className="text-xs text-rose-500 mt-1">{errors.storeDescription}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input type="tel" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="01012345678" maxLength={11} className="input-field" />
          {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
        </div>

        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Governorate <span className="text-rose-500">*</span>
          </label>
          <button type="button" onClick={() => setOpen(!open)}
            className="input-field flex items-center justify-between text-left">
            <span className={form.governorate ? '' : 'text-stone-400'}>
              {form.governorate || 'Select governorate'}
            </span>
            <HiOutlineSelector className="w-4 h-4 text-stone-400" />
          </button>
          {errors.governorate && <p className="text-xs text-rose-500 mt-1">{errors.governorate}</p>}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 mt-1 w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl max-h-60 overflow-hidden"
              >
                <div className="p-2 border-b border-stone-100 dark:border-stone-700">
                  <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input type="text" value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-stone-50 dark:bg-stone-700 border-0 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-stone-900 dark:text-stone-100" />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-44">
                  {filtered.map(g => (
                    <button key={g} type="button"
                      onClick={() => { setForm(f => ({ ...f, governorate: g })); setOpen(false); setSearch(''); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${form.governorate === g ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'}`}>
                      {g}
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="px-4 py-3 text-sm text-stone-400">No results</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
            Full Address <span className="text-rose-500">*</span>
          </label>
          <textarea rows={2} value={form.fullAddress}
            onChange={e => setForm(f => ({ ...f, fullAddress: e.target.value }))}
            placeholder="Street, building, apartment, landmark..." className="input-field resize-none" />
          {errors.fullAddress && <p className="text-xs text-rose-500 mt-1">{errors.fullAddress}</p>}
        </div>

        <div className="flex items-start gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
          <input type="checkbox" id="agree" checked={agreeCommission}
            onChange={e => setAgreeCommission(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-orange-600 focus:ring-orange-400/50 cursor-pointer" />
          <label htmlFor="agree" className="text-sm text-stone-600 dark:text-stone-400 cursor-pointer select-none">
            I understand that the marketplace takes a 5% commission from every successful order.
          </label>
        </div>

        <button type="submit" disabled={Object.keys(errors).length > 0 || !agreeCommission || submitting}
          className="btn-primary w-full justify-center">
          {submitting ? 'Submitting...' : isRejected ? 'Resubmit Application' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}