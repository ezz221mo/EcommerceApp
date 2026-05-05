import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCheck, HiOutlineArrowLeft, HiOutlineLockClosed } from 'react-icons/hi';
import { useCartStore, useAuthStore, useOrderStore } from '../store';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { placeOrder } = useOrderStore();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.zip) {
      toast.error('Please fill in all shipping details');
      return;
    }

    setLoading(true);
    
    // محاكاة تأخير الشبكة
    await new Promise(r => setTimeout(r, 1500));

    // تجهيز المنتجات مع إضافة الـ sellerEmail لكل منتج
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      sellerEmail: item.sellerEmail || 'admin@luxe.com'
    }));

    // حفظ الأوردر في الـ Store والـ localStorage
    placeOrder({
      buyerEmail: user.email,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total
    });

    // تفريغ السلة
    clearCart();
    setLoading(false);

    // رسالة نجاح وتوجيه لصفحة الطلبات
    toast.success('Your order has been placed successfully. It will arrive soon!', {
      duration: 5000,
      icon: '🎉',
      style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' }
    });

    navigate('/orders/my-orders');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <HiOutlineClipboardCheck className="w-16 h-16 text-stone-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-4">Nothing to checkout</h2>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 mb-6 transition-colors">
          <HiOutlineArrowLeft className="w-5 h-5" /> Back to Cart
        </button>
        <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">Shipping Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="input-field" readOnly />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" readOnly />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Street Address *</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="123 Main St" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">City *</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">ZIP Code *</label>
                  <input type="text" name="zip" value={form.zip} onChange={handleChange} placeholder="10001" className="input-field" required />
                </div>
              </div>
            </motion.div>

            {/* Payment Details (UI Only) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Payment Details</h2>
                <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded-full">Mock Payment</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Card Number</label>
                  <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="4242 4242 4242 4242" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Expiry Date</label>
                  <input type="text" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">CVV</label>
                  <input type="text" name="cvv" value={form.cvv} onChange={handleChange} placeholder="123" className="input-field" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{item.name}</p>
                      <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-2">
                <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-stone-500"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full mt-6 py-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <HiOutlineLockClosed className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-xs text-stone-400 text-center mt-4">
                Your data is secure. This is a demo checkout.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}