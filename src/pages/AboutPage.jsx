import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineTruck, HiOutlineHeart, HiOutlineSparkles,
  HiOutlineGlobe, HiOutlineEye, HiOutlineSupport, HiOutlineCurrencyDollar,
} from 'react-icons/hi';

const features = [
  { icon: HiOutlineShieldCheck, title: 'Premium Quality', desc: 'Every product is handpicked and tested to ensure it meets our high-quality standards.' },
  { icon: HiOutlineTruck, title: 'Fast & Reliable Shipping', desc: 'We partner with the best logistics companies to ensure your order arrives safely and on time.' },
  { icon: HiOutlineHeart, title: 'Customer First', desc: 'Our support team is available around the clock to help you with any inquiries or issues.' },
  { icon: HiOutlineSparkles, title: 'Curated Collections', desc: 'We don\'t sell everything; we sell what\'s worth having. Our collections are carefully curated.' },
];

const reasons = [
  { icon: HiOutlineGlobe, title: 'Global Sourcing', desc: 'We source products from the most reputable manufacturers worldwide, ensuring authenticity and quality in every item we offer.' },
  { icon: HiOutlineEye, title: 'Customer Satisfaction', desc: 'Your happiness is our priority. We offer easy returns, responsive support, and a seamless shopping experience from browse to delivery.' },
  { icon: HiOutlineCurrencyDollar, title: 'Secure Payments', desc: 'All transactions are encrypted and processed through secure payment gateways. Your financial information is never stored on our servers.' },
  { icon: HiOutlineTruck, title: 'Fast Shipping', desc: 'We process orders within 24 hours and partner with leading couriers to deliver your items as quickly as possible, with real-time tracking included.' },
  { icon: HiOutlineShieldCheck, title: 'Quality Guarantee', desc: 'If you\'re not satisfied with your purchase, we offer a 30-day money-back guarantee. No questions asked.' },
  { icon: HiOutlineSupport, title: '24/7 Customer Support', desc: 'Our dedicated support team is available anytime via email or live chat to assist with orders, returns, or any questions you may have.' },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us | LuxeShop';
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-white">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="text-orange-400 font-semibold text-sm uppercase tracking-widest">About Us</span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold mt-4 mb-6 leading-tight">
              Redefining the way you <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-teal-400">shop premium</span> products.
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed">
              Founded in 2024, LuxeShop started with a simple idea: make high-quality, aesthetic products accessible to everyone without the luxury price tag. What began as a small curated store has grown into a trusted marketplace connecting thousands of customers with premium products from around the world.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feat.icon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{feat.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Mission</span>
              <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3 mb-6">We bridge the gap between quality and affordability.</h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                We believe that everyone deserves to own products that look good, feel good, and last long. By cutting out middlemen and working directly with trusted sellers and manufacturers, we bring you the best items at fair prices.
              </p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Whether you're looking for the latest tech gadgets, stylish fashion pieces, or cozy home essentials, LuxeShop is your trusted destination.
              </p>
            </div>
            <div className="bg-stone-100 dark:bg-stone-800 rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="text-6xl font-display font-bold text-stone-900 dark:text-stone-100">10K+</div>
                <div className="text-stone-500 mt-2">Happy Customers Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Vision</span>
          <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3 mb-4">A world where quality is accessible to all.</h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            We envision a future where online shopping is built on trust, transparency, and exceptional quality. Our goal is to become the most trusted marketplace by continuously raising the bar for product standards and customer experience.
          </p>
        </motion.div>
      </section>

      <section className="bg-stone-100/50 dark:bg-stone-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
            <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3">What sets us apart</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card p-6 flex gap-4"
              >
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <reason.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{reason.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">Ready to experience the difference?</h2>
          <p className="text-stone-500 mb-8 max-w-xl mx-auto">Browse our collection and find your next favorite product today.</p>
          <Link to="/products" className="btn-primary text-base px-8 py-4">Browse Products</Link>
        </motion.div>
      </section>
    </div>
  );
}
