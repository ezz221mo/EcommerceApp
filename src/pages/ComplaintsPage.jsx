import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChatAlt2, HiOutlinePhone, HiOutlineMail, HiOutlineClipboardList, HiOutlineExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const COMPLAINT_TYPES = [
  'Product not received',
  'Delivery problem',
  'Product issue',
  'Wrong item received',
  'Payment issue',
  'Other',
];

const spring = { type: 'spring', stiffness: 150, damping: 18 };

export default function ComplaintsPage() {
  const { userData } = useAuth();
  const [form, setForm] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    orderId: '',
    complaintType: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.complaintType || !form.message.trim()) {
      toast.error('Please fill in all required fields.', {
        style: { borderRadius: '12px' },
      });
      return;
    }

    setSending(true);

    const message = [
      `*Customer Support Request*`,
      ``,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      form.phone ? `*Phone:* ${form.phone}` : null,
      form.orderId ? `*Order ID:* ${form.orderId}` : null,
      `*Complaint Type:* ${form.complaintType}`,
      ``,
      `*Message:*`,
      form.message,
    ]
      .filter(Boolean)
      .join('\n');

    const encoded = encodeURIComponent(message);
    const phone = '201234567890'; // Business WhatsApp number
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');

    setSending(false);
    toast.success('Support request opened in WhatsApp.', {
      icon: '\u{1F4AC}',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
    });
  };

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <HiOutlineChatAlt2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
                Customer Support
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                Having an issue? We are here to help. Fill out the form below and we will assist you via WhatsApp.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...spring }}
          onSubmit={handleSubmit}
          className="card p-6 md:p-8 mt-6 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Order ID
              </label>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                placeholder="e.g. ORD-12345"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Complaint Type *
            </label>
            <select
              name="complaintType"
              value={form.complaintType}
              onChange={handleChange}
              className="input-field cursor-pointer"
            >
              <option value="">Select a type</option>
              {COMPLAINT_TYPES.map(t => (
                <option key={t} value={t} className="bg-white dark:bg-stone-800">{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              Message *
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your issue in detail..."
              className="input-field resize-none"
            />
          </div>

          <motion.button
            type="submit"
            disabled={sending}
            whileHover={!sending ? { scale: 1.01 } : {}}
            whileTap={!sending ? { scale: 0.99 } : {}}
            className="btn-primary-glow w-full py-3.5 text-base justify-center"
          >
            <HiOutlineChatAlt2 className="w-5 h-5" />
            {sending ? 'Opening WhatsApp...' : 'Submit via WhatsApp'}
          </motion.button>

          <p className="text-xs text-stone-400 text-center">
            By submitting, you will be redirected to WhatsApp to complete your request.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
