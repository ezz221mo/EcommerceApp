import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HiArrowRight, HiStar, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineSupport } from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import { categories, testimonials } from '../data/products';
import { useProductStore } from '../store';

const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUpSpring = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const perks = [
  { icon: HiOutlineTruck, title: 'Free Shipping', desc: 'On all orders over $75' },
  { icon: HiOutlineShieldCheck, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: HiOutlineRefresh, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: HiOutlineSupport, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const products = useProductStore(s => s.products);
  const featured = products.filter(p => p.isFeatured);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.6]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-stone-950">
        <motion.div style={{ y: heroParallaxY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-mesh" />
          <div className="absolute inset-0 bg-grid opacity-40" />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"
          />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.span variants={fadeUpSpring} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-semibold mb-6 border border-orange-500/20 backdrop-blur-sm">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              New Collection 2025
            </motion.span>

            <motion.h1 variants={fadeLeft} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-teal-400">
                Premium
              </span>
              <br />Products
            </motion.h1>

            <motion.p variants={fadeRight} className="text-stone-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              Curated collection of the finest products from around the world. Quality meets style in every item we offer.
            </motion.p>

            <motion.div variants={fadeUpSpring} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 40px rgba(234, 88, 12, 0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products')}
                className="btn-primary-glow text-base px-8 py-4 rounded-2xl"
              >
                Shop Now <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, borderColor: '#f97316' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/products?cat=electronics')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold border-2 border-stone-700 hover:border-orange-500/60 text-stone-300 hover:text-white transition-all duration-200 text-base"
              >
                View Electronics
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUpSpring} className="flex gap-10 mt-14 justify-center lg:justify-start">
              {[
                { val: '50k+', label: 'Happy Customers' },
                { val: '2k+', label: 'Products' },
                { val: '4.9', label: 'Avg Rating', star: true },
              ].map(({ val, label, star }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -2 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-white font-display">{val}</div>
                  <div className="text-stone-500 text-sm flex items-center gap-1 justify-center">
                    {star && <HiStar className="w-3.5 h-3.5 text-amber-400" />}
                    {label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-500"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-stone-500 to-transparent" />
        </motion.div>
      </section>

      {/* ── Perks Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {perks.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 14 } },
                }}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                className="flex items-center gap-3 text-white rounded-xl p-3 transition-colors"
              >
                <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-orange-200 text-xs">{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.span variants={fadeUpSpring} className="text-orange-500 font-semibold text-sm uppercase tracking-[0.15em]">Categories</motion.span>
          <motion.h2 variants={fadeUpSpring} className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3 mb-3">Shop by Category</motion.h2>
          <motion.p variants={fadeUpSpring} className="text-stone-500 dark:text-stone-400 text-lg">Find exactly what you&apos;re looking for</motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 14 } },
              }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <Link
                to={`/products?cat=${cat.id}`}
                className="flex flex-col items-center gap-3 p-6 card card-hover group relative overflow-hidden"
              >
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  {cat.icon}
                </motion.div>
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 text-center group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {cat.name}
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full origin-left"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Featured Products Section ── */}
      <section className="py-20 bg-stone-100/50 dark:bg-stone-800/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <motion.span variants={fadeUpSpring} className="text-orange-500 font-semibold text-sm uppercase tracking-[0.15em]">Featured</motion.span>
              <motion.h2 variants={fadeUpSpring} className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3">Featured Products</motion.h2>
              <motion.p variants={fadeUpSpring} className="text-stone-500 dark:text-stone-400 mt-2">Handpicked favorites just for you</motion.p>
            </div>
            <motion.div variants={fadeUpSpring}>
              <Link to="/products" className="btn-ghost hidden sm:flex text-sm">
                View All <HiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
              : featured.map((product, i) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 14 } },
                    }}
                  >
                    <ProductCard product={product} index={i} />
                  </motion.div>
                ))
            }
          </motion.div>

          <div className="text-center mt-10 sm:hidden">
            <Link to="/products" className="btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ── Promotions Section ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 70, damping: 13 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 p-10 text-white group cursor-default"
          >
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
              className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
              className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"
            />
            <div className="relative z-10">
              <span className="badge bg-white/15 backdrop-blur-sm text-white mb-4 inline-block">Limited Offer</span>
              <h3 className="font-display text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                Up to 40% off<br />Electronics
              </h3>
              <p className="text-orange-100/80 mb-6 max-w-xs">Don&apos;t miss out on our biggest sale of the season.</p>
              <Link
                to="/products?cat=electronics"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 hover:gap-3 transition-all group"
              >
                Shop Now <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 p-10 text-white group cursor-default"
          >
            <motion.div
              animate={{ rotate: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
              className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 13, ease: 'easeInOut' }}
              className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"
            />
            <div className="relative z-10">
              <span className="badge bg-white/15 backdrop-blur-sm text-white mb-4 inline-block">New Arrivals</span>
              <h3 className="font-display text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                Fresh Fashion<br />Just Dropped
              </h3>
              <p className="text-teal-100/80 mb-6 max-w-xs">Explore the latest trends and styles this season.</p>
              <Link
                to="/products?cat=fashion"
                className="inline-flex items-center gap-2 bg-white text-teal-600 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 hover:gap-3 transition-all group"
              >
                Explore <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="py-20 bg-stone-900 dark:bg-stone-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUpSpring} className="text-orange-400 font-semibold text-sm uppercase tracking-[0.15em]">Testimonials</motion.span>
            <motion.h2 variants={fadeUpSpring} className="font-display text-4xl font-bold text-white mt-3">What Our Customers Say</motion.h2>
            <motion.p variants={fadeUpSpring} className="text-stone-400 text-lg mt-2">Trusted by thousands worldwide</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.97 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 14 } },
                }}
                whileHover={{ y: -4 }}
                className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 border border-stone-700/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + j * 0.05 }}
                    >
                      <HiStar className="w-4 h-4 text-amber-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-stone-300 leading-relaxed mb-6 text-sm italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30"
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-stone-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
