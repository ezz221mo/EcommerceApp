import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineClipboardCheck, HiOutlineArrowLeft, HiOutlineLockClosed, HiOutlineTruck, HiOutlineCreditCard, HiOutlineCheckCircle, HiOutlineShieldCheck, HiOutlineTag, HiOutlineX, HiOutlinePencil, HiOutlineCheck } from 'react-icons/hi';
import { useCartStore, useOrderStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { validateCoupon, incrementCouponUsage } from '../services/couponService';
import toast from 'react-hot-toast';

const EGYPT_GOVERNORATES = [
  'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia',
  'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh',
  'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
  'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag',
  'South Sinai', 'Suez',
];

function computeEstimatedDelivery(cartItems, governorate) {
  if (!governorate) return null;
  const itemsWithShipping = cartItems.filter(item => item.shipping);
  if (itemsWithShipping.length === 0) return null;
  const shipping = itemsWithShipping[0].shipping;
  if (governorate === shipping.originGovernorate) {
    return shipping.sameGovernorateDelivery || null;
  }
  return shipping.otherGovernoratesDelivery || null;
}

const steps = [
  { key: 'shipping', label: 'Shipping', icon: HiOutlineTruck },
  { key: 'payment', label: 'Payment', icon: HiOutlineCreditCard },
  { key: 'review', label: 'Review', icon: HiOutlineCheckCircle },
];

const spring = { type: 'spring', stiffness: 150, damping: 18 };

/* ظ¤ظ¤ Validation helpers ظ¤ظ¤ */
function luhnCheck(num) {
  let sum = 0; let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return sum % 10 === 0;
}

function detectCardType(num) {
  const clean = num.replace(/\s/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return null;
}

function validateFullName(name) {
  const trimmed = name.trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 100) return 'Name is too long.';
  if (/^\d+$/.test(trimmed)) return 'Name cannot contain only numbers.';
  if (/^[^a-zA-Z]+$/.test(trimmed)) return 'Name must include letters.';
  return null;
}

function validateEmail(email) {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

function validatePhone(phone) {
  if (!phone || !phone.trim()) return null;
  const clean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (!/^\d+$/.test(clean)) return 'Phone must contain only numbers.';
  if (clean.length < 7 || clean.length > 15) return 'Please enter a valid phone number.';
  return null;
}

function validateAddressField(val, label) {
  if (!val || !val.trim()) return `${label} is required.`;
  return null;
}

function validateCardNumber(num) {
  const clean = num.replace(/\s/g, '');
  if (!clean) return 'Card number is required.';
  if (!/^\d+$/.test(clean)) return 'Card number must contain only digits.';
  if (clean.length < 13 || clean.length > 19) return 'Card number must be between 13 and 19 digits.';
  if (!luhnCheck(clean)) return 'Invalid card number. Please check and try again.';
  return null;
}

function validateExpiry(exp) {
  if (!exp.trim()) return 'Expiry date is required.';
  const cleaned = exp.replace(/\s/g, '');
  if (!/^\d{2}\/\d{2}$/.test(cleaned)) return 'Use MM/YY format.';
  const [mm, yy] = cleaned.split('/').map(Number);
  if (mm < 1 || mm > 12) return 'Invalid month.';
  const now = new Date();
  const curYy = parseInt(String(now.getFullYear()).slice(2), 10);
  const curMm = now.getMonth() + 1;
  if (yy < curYy || (yy === curYy && mm < curMm)) return 'Card is expired.';
  if (yy > curYy + 20) return 'Invalid expiry date.';
  return null;
}

function validateCVV(cvv, cardType) {
  if (!cvv.trim()) return 'CVV is required.';
  if (!/^\d+$/.test(cvv)) return 'CVV must contain only digits.';
  const expected = cardType === 'Amex' ? 4 : 3;
  if (cvv.length !== expected) return `CVV must be ${expected} digits.`;
  return null;
}

function maskCard(num) {
  const clean = num.replace(/\s/g, '');
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `**** **** **** ${last4}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, coupon, clearCart, applyDiscount, removeDiscount } = useCartStore();
  const { userData } = useAuth();
  const { placeOrder } = useOrderStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('shipping');
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    city: userData?.city || '',
    zip: userData?.zip || '',
    governorate: userData?.governorate || '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = !coupon ? 0
    : coupon.type === 'fixed' ? Math.min(coupon.value, subtotal)
    : coupon.type === 'free_shipping' ? (coupon.value || 0)
    : +(subtotal * (coupon.percent / 100)).toFixed(2);
  const total = subtotal + shipping + tax - discount;
  const estimatedDelivery = computeEstimatedDelivery(items, form.governorate);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: null }));
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(code, subtotal);
      if (!result.valid) {
        toast.error(result.reason, {
          style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
        });
        return;
      }
      const c = result.coupon;
      let percent = 0;
      let value = 0;
      if (c.type === 'percentage') {
        percent = c.value;
      } else if (c.type === 'fixed') {
        value = c.value;
      } else if (c.type === 'free_shipping') {
        value = shipping;
      }
      applyDiscount({ code, percent, type: c.type, value, description: c.description });
      toast.success(`Coupon "${code}" applied! ${c.description}`, {
        icon: '\u{1F3AF}',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
      setCouponInput('');
    } catch (err) {
      const msg = err?.message || err?.toString() || 'Failed to validate coupon. Please try again.';
      toast.error(msg, {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    }
    setCouponLoading(false);
  };

  const validateAll = () => {
    const cardType = detectCardType(form.cardNumber);
    const errs = {
      fullName: validateFullName(form.fullName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      address: validateAddressField(form.address, 'Street Address'),
      city: validateAddressField(form.city, 'City'),
      governorate: !form.governorate ? 'Governorate is required.' : null,
      zip: validateAddressField(form.zip, 'ZIP Code'),
      cardNumber: validateCardNumber(form.cardNumber),
      expiry: validateExpiry(form.expiry),
      cvv: validateCVV(form.cvv, cardType),
    };
    const hasErrors = Object.values(errs).some(Boolean);
    if (hasErrors) {
      setErrors(errs);
      const firstError = Object.entries(errs).find(([, v]) => v);
      if (firstError) {
        toast.error(firstError[1], {
          style: { borderRadius: '12px', background: '#dc2626', color: '#fff' },
        });
      }
    }
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setStep('review');
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const cardType = detectCardType(form.cardNumber);
    const cardLast4 = form.cardNumber.replace(/\s/g, '').slice(-4);

    try {
      await placeOrder({
        userId: userData.uid || userData.id,
        customerInfo: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          zip: form.zip,
          governorate: form.governorate,
        },
        items: orderItems,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        paymentMethod: { type: cardType || 'Unknown', last4: cardLast4 },
        couponCode: coupon?.code || null,
        estimatedDelivery: estimatedDelivery || '',
      });

      if (coupon?.code) {
        await incrementCouponUsage(coupon.code).catch(() => {});
      }

      clearCart();
      setLoading(false);

      toast.success('Your order has been placed successfully. It will arrive soon!', {
        duration: 5000,
        icon: '\u{1F389}',
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });

      navigate('/orders/my-orders');
    } catch (err) {
      setLoading(false);
      toast.error(err?.message || 'Failed to place order. Please try again.', {
        style: { borderRadius: '12px' },
      });
    }
  };

  const cardType = detectCardType(form.cardNumber);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-950/30 dark:to-stone-800 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <HiOutlineClipboardCheck className="w-10 h-10 text-teal-400" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Nothing to checkout</h2>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </motion.div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const progressWidth = `${((currentStepIndex + 1) / steps.length) * 100}%`;

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 mb-6 transition-colors group"
        >
          <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Cart
        </motion.button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
          <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8">
            {step === 'review' ? 'Review Your Order' : 'Checkout'}
          </h1>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between max-w-xl">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.key;
              const isComplete = currentStepIndex > i;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        backgroundColor: isComplete ? '#16a34a' : isActive ? '#f97316' : '#d6d3d1',
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${isComplete ? 'bg-green-500' : isActive ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-700'}`}
                    >
                      {isComplete ? '\u2713' : <Icon className="w-4 h-4" />}
                    </motion.div>
                    <span className={`text-xs mt-1.5 font-medium ${isActive || isComplete ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-16 sm:w-24 h-0.5 mx-2 bg-stone-200 dark:bg-stone-700 rounded-full relative overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: isComplete ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-teal-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="hidden sm:block w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: progressWidth }}
              transition={{ type: 'spring', stiffness: 80, damping: 14 }}
              className="h-full bg-gradient-to-r from-orange-500 to-teal-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* ظ¤ظ¤ SHIPPING / PAYMENT STEP ظ¤ظ¤ */}
        {step === 'shipping' && (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">

            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <HiOutlineTruck className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Shipping Information</h2>
                    <p className="text-stone-400 text-sm">Enter your delivery details</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Full Name</label>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className={`input-field ${errors.fullName ? 'border-red-400 dark:border-red-500' : ''}`} />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={`input-field ${errors.email ? 'border-red-400 dark:border-red-500' : ''}`} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Phone (optional)</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 123-4567" className={`input-field ${errors.phone ? 'border-red-400 dark:border-red-500' : ''}`} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Street Address *</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" className={`input-field ${errors.address ? 'border-red-400 dark:border-red-500' : ''}`} />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Governorate *</label>
                    <select name="governorate" value={form.governorate} onChange={handleChange}
                      className={`input-field cursor-pointer ${errors.governorate ? 'border-red-400 dark:border-red-500' : ''}`}>
                      <option value="">Select governorate</option>
                      {EGYPT_GOVERNORATES.map(g => (
                        <option key={g} value={g} className="bg-white dark:bg-stone-800">{g}</option>
                      ))}
                    </select>
                    {errors.governorate && <p className="text-xs text-red-500 mt-1">{errors.governorate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">City / District</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Nasr City" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">ZIP Code *</label>
                    <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" className={`input-field ${errors.zip ? 'border-red-400 dark:border-red-500' : ''}`} />
                    {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Payment Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <HiOutlineCreditCard className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Payment Details</h2>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded-full font-medium">Test Mode</span>
                    </div>
                    <p className="text-stone-400 text-sm">Your data is encrypted and secure</p>
                  </div>
                </div>

                {/* Card mockup UI */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-950 dark:to-stone-900 rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
                  <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-teal-500/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs uppercase tracking-widest opacity-60">{cardType || 'Credit Card'}</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-4 bg-orange-500 rounded" />
                        <div className="w-6 h-4 bg-teal-500 rounded" />
                      </div>
                    </div>
                    <p className="font-mono text-lg tracking-wider mb-6">
                      {form.cardNumber || '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022'}
                    </p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Expiry</p>
                        <p className="font-mono">{form.expiry || 'MM/YY'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider opacity-60">CVV</p>
                        <p className="font-mono">{form.cvv ? '\u2022'.repeat(form.cvv.length) : '\u2022\u2022\u2022'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Card Number</label>
                    <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="4242 4242 4242 4242" className={`input-field ${errors.cardNumber ? 'border-red-400 dark:border-red-500' : ''}`} maxLength={19} />
                    {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
                    {cardType && !errors.cardNumber && form.cardNumber.replace(/\s/g, '').length >= 4 && (
                      <p className="text-xs text-green-600 mt-1">{cardType} detected</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Expiry Date</label>
                    <input type="text" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className={`input-field ${errors.expiry ? 'border-red-400 dark:border-red-500' : ''}`} maxLength={5} />
                    {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">CVV</label>
                    <input type="text" name="cvv" value={form.cvv} onChange={handleChange} placeholder={cardType === 'Amex' ? '1234' : '123'} className={`input-field ${errors.cvv ? 'border-red-400 dark:border-red-500' : ''}`} maxLength={cardType === 'Amex' ? 4 : 3} />
                    {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Continue button (mobile) */}
              <div className="lg:hidden">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.99 } : {}}
                  className="btn-primary-glow w-full py-4 text-base justify-center"
                >
                  <><HiOutlineLockClosed className="w-5 h-5" /> Continue to Review ظ¤ ${total.toFixed(2)}</>
                </motion.button>
              </div>
            </div>

            {/* Order Summary Sidebar (desktop) */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24"
              >
                <div className="card-glass p-6 space-y-5">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Order Summary</h2>

                  <div className="space-y-3">
                    {items.slice(0, 4).map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                          <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {items.length > 4 && (
                      <p className="text-xs text-stone-400 text-center">+{items.length - 4} more items</p>
                    )}
                  </div>

                  {/* Coupon */}
                  <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Coupon code"
                        className="input-field text-sm flex-1"
                      />
                      {coupon ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { removeDiscount(); setCouponInput(''); toast('Discount removed', { icon: '\u{1F5D1}\uFE0F', style: { borderRadius: '12px' } }); }}
                          className="btn-secondary text-sm px-3 whitespace-nowrap border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                        >
                          <HiOutlineX className="w-4 h-4" />
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="btn-secondary text-sm px-3 whitespace-nowrap"
                        >
                          {couponLoading ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : 'Apply'}
                        </motion.button>
                      )}
                    </div>
                    {coupon && discount > 0 && (
                      <div className="flex items-center justify-between text-green-600 dark:text-green-400 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <HiOutlineTag className="w-3.5 h-3.5" />
                          {coupon.code}
                        </span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                      <span>Tax</span><span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <span>Total</span><span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(234,88,12,0.3)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="btn-primary-glow w-full py-4 text-base justify-center"
                  >
                    <><HiOutlineLockClosed className="w-5 h-5" /> Continue to Review ظ¤ ${total.toFixed(2)}</>
                  </motion.button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
                    <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                    Secured with 256-bit SSL encryption
                  </div>
                </div>
              </motion.div>
            </div>
          </form>
        )}

        {/* ظ¤ظ¤ REVIEW STEP ظ¤ظ¤ */}
        <AnimatePresence>
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Review details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Products */}
                <div className="card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <HiOutlineClipboardCheck className="w-5 h-5 text-teal-500" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Order Items</h2>
                  </div>
                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-stone-100 dark:border-stone-800 last:border-0 last:pb-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                          <p className="text-xs text-stone-400">Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}</p>
                        </div>
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100 flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                      <span>Tax</span><span>${tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount{coupon ? ` (${coupon.code})` : ''}</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <span>Total</span><span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <HiOutlineTruck className="w-5 h-5 text-orange-500" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Shipping To</h2>
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400 space-y-1">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{form.fullName}</p>
                    <p>{form.email}</p>
                    {form.phone && <p>{form.phone}</p>}
                    <p>{form.address}</p>
                    <p>{form.governorate}{form.city ? ` - ${form.city}` : ''} {form.zip}</p>
                  </div>
                  {estimatedDelivery && (
                    <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineTruck className="w-4 h-4 text-orange-500" />
                        <span className="text-stone-600 dark:text-stone-400">
                          Estimated delivery time:{' '}
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {estimatedDelivery}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div className="card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <HiOutlineCreditCard className="w-5 h-5 text-teal-500" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Payment Method</h2>
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400 space-y-1">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{cardType || 'Card'}</p>
                    <p className="font-mono tracking-wider">{maskCard(form.cardNumber)}</p>
                    <p>Expires {form.expiry}</p>
                  </div>
                </div>
              </div>

              {/* Confirm sidebar */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-24"
                >
                  <div className="card-glass p-6 space-y-5">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Ready to go?</h2>
                    <p className="text-sm text-stone-500">Please review your order before confirming.</p>

                    <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                        <span>Shipping</span><span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
                        <span>Tax</span><span>${tax.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                          <span>Discount</span><span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                        <span>Total</span><span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(234,88,12,0.3)' } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        onClick={handleConfirmOrder}
                        disabled={loading}
                        className="btn-primary-glow w-full py-4 text-base justify-center"
                      >
                        {loading ? (
                          <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processingظخ</>
                        ) : (
                          <><HiOutlineCheck className="w-5 h-5" /> Confirm Order ظ¤ ${total.toFixed(2)}</>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep('shipping')}
                        disabled={loading}
                        className="btn-secondary w-full py-4 text-base justify-center"
                      >
                        <HiOutlinePencil className="w-5 h-5" /> Edit Order
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
                      <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                      Secured with 256-bit SSL encryption
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
