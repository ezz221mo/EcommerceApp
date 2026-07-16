import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  HiOutlineShieldCheck, HiOutlineTruck, HiOutlineHeart, HiOutlineSparkles,
  HiOutlineGlobe, HiOutlineEye, HiOutlineSupport, HiOutlineCurrencyDollar,
  HiStar, HiOutlineUserGroup,
} from 'react-icons/hi';
import { useProductStore } from '../store';

const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUpSpring = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

const features = [
  { icon: HiOutlineShieldCheck, title: 'Premium Quality', desc: 'Every product is handpicked and tested to ensure it meets our high-quality standards.' },
  { icon: HiOutlineTruck, title: 'Fast & Reliable Shipping', desc: 'We partner with the best logistics companies to ensure your order arrives safely and on time.' },
  { icon: HiOutlineHeart, title: 'Customer First', desc: 'Our support team is available around the clock to help you with any inquiries or issues.' },
  { icon: HiOutlineSparkles, title: 'Curated Collections', desc: "We don't sell everything; we sell what's worth having. Our collections are carefully curated." },
];

const reasons = [
  { icon: HiOutlineGlobe, title: 'Global Sourcing', desc: 'We source products from the most reputable manufacturers worldwide, ensuring authenticity and quality in every item we offer.' },
  { icon: HiOutlineEye, title: 'Customer Satisfaction', desc: 'Your happiness is our priority. We offer easy returns, responsive support, and a seamless shopping experience from browse to delivery.' },
  { icon: HiOutlineCurrencyDollar, title: 'Secure Payments', desc: 'All transactions are encrypted and processed through secure payment gateways. Your financial information is never stored on our servers.' },
  { icon: HiOutlineTruck, title: 'Fast Shipping', desc: 'We process orders within 24 hours and partner with leading couriers to deliver your items as quickly as possible, with real-time tracking included.' },
  { icon: HiOutlineShieldCheck, title: 'Quality Guarantee', desc: "If you're not satisfied with your purchase, we offer a 30-day money-back guarantee. No questions asked." },
  { icon: HiOutlineSupport, title: '24/7 Customer Support', desc: 'Our dedicated support team is available anytime via email or live chat to assist with orders, returns, or any questions you may have.' },
];

const team = [
  { name: 'Alex Morgan', role: 'Founder & CEO', avatar: 'AM', color: 'from-orange-400 to-rose-500' },
  { name: 'Sarah Chen', role: 'Head of Operations', avatar: 'SC', color: 'from-teal-400 to-cyan-500' },
  { name: 'Marcus Johnson', role: 'Product Curator', avatar: 'MJ', color: 'from-purple-400 to-pink-500' },
  { name: 'Elena Rodriguez', role: 'Customer Experience', avatar: 'ER', color: 'from-amber-400 to-orange-500' },
];

export default function AboutPage() {
  const products = useProductStore(s => s.products);
  const productCount = products.length || 0;
  const avgRating = products.length
    ? (products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(1)
    : '0.0';

  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    document.title = 'About Us | LuxeShop';
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-white">
        <motion.div style={{ y: heroParallaxY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]"
          />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.span variants={fadeUpSpring} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-semibold mb-6 border border-orange-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              About Us
            </motion.span>
            <motion.h1 variants={fadeUpSpring} className="font-display text-5xl sm:text-6xl font-bold leading-tight mb-6">
              Redefining the way you{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-teal-400">
                shop premium
              </span>{' '}
              products.
            </motion.h1>
            <motion.p variants={fadeUpSpring} className="text-stone-300 text-lg leading-relaxed max-w-2xl">
              Founded in 2024, LuxeShop started with a simple idea: make high-quality, aesthetic products accessible
              to everyone without the luxury price tag. What began as a small curated store has grown into a trusted
              marketplace connecting thousands of customers with premium products from around the world.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 70, damping: 13 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-stone-800 rounded-2xl shadow-xl dark:shadow-stone-900/50 p-6 sm:p-8 border border-stone-100 dark:border-stone-700"
        >
          {[
            { val: productCount > 0 ? productCount : '0', label: 'Products' },
            { val: avgRating, label: 'Avg Rating', icon: HiStar, iconClass: 'text-amber-400' },
            { val: '100%', label: 'Satisfaction' },
            { val: '24/7', label: 'Support' },
          ].map(({ val, label, icon: Icon, iconClass }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1">
                {Icon && <Icon className={`w-4 h-4 ${iconClass}`} />}
                <span className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 font-display">{val}</span>
              </div>
              <div className="text-stone-500 dark:text-stone-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 80, damping: 14 }}
              whileHover={{ y: -4 }}
              className="card p-6 text-center group"
            >
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <feat.icon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{feat.title}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section className="bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 70, damping: 13 }}
            >
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Mission</span>
              <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3 mb-6">
                We bridge the gap between quality and affordability.
              </h2>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                We believe that everyone deserves to own products that look good, feel good, and last long. By cutting
                out middlemen and working directly with trusted sellers and manufacturers, we bring you the best items
                at fair prices.
              </p>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Whether you&apos;re looking for the latest tech gadgets, stylish fashion pieces, or cozy home
                essentials, LuxeShop is your trusted destination.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.1 }}
              className="bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700 rounded-3xl p-8 flex items-center justify-center min-h-[300px]"
            >
              <div className="text-center">
                <div className="text-6xl font-display font-bold text-stone-900 dark:text-stone-100">
                  {productCount > 0 ? `${productCount}+` : '0'}
                </div>
                <div className="text-stone-500 dark:text-stone-400 mt-2">Products Curated</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Vision Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Vision</span>
          <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3 mb-4">
            A world where quality is accessible to all.
          </h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            We envision a future where online shopping is built on trust, transparency, and exceptional quality. Our
            goal is to become the most trusted marketplace by continuously raising the bar for product standards and
            customer experience.
          </p>
        </motion.div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="bg-stone-100/50 dark:bg-stone-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Why Choose Us</span>
            <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3">
              What sets us apart
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                className="card p-6 flex gap-4"
              >
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <reason.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{reason.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Our Team</span>
          <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3">
            Meet the people behind LuxeShop
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-xl mx-auto">
            A passionate team dedicated to bringing you the best shopping experience.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 80, damping: 14 }}
              whileHover={{ y: -6 }}
              className="card p-6 text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {member.avatar}
              </motion.div>
              <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">{member.name}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Ready to experience the difference?
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-xl mx-auto">
            Browse our collection and find your next favorite product today.
          </p>
          <Link to="/products" className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2">
            Browse Products
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
