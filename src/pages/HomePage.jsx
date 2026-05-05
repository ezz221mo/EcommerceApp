import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiStar, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineSupport } from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import { categories, testimonials } from '../data/products';
import { useProductStore } from '../store';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.5 } };

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

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section (بدون صور المنتجات) ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-400 text-sm font-semibold mb-6 border border-orange-500/30">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              New Collection 2025
            </motion.span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover<span className="block text-gradient">Premium</span>Products
            </h1>
            <p className="text-stone-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              Curated collection of the finest products from around the world. Quality meets style in every item we offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/products')} className="btn-primary text-base px-8 py-4 rounded-2xl">
                Shop Now <HiArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/products?cat=electronics')} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold border-2 border-stone-600 hover:border-orange-400 text-stone-300 hover:text-white transition-all duration-200 text-base">
                View Electronics
              </motion.button>
            </div>
            <div className="flex gap-10 mt-12 justify-center lg:justify-start">
              {[['50k+', 'Happy Customers'], ['2k+', 'Products'], ['4.9', 'Avg Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white font-display">{val}</div>
                  <div className="text-stone-400 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-500">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-stone-500 to-transparent" />
        </motion.div>
      </section>

      {/* ── Perks Section ── */}
      <section className="py-12 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5" /></div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-orange-200 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Section ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-3">Shop by Category</h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg">Find exactly what you're looking for</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4, scale: 1.02 }}>
              <Link to={`/products?cat=${cat.id}`} className="flex flex-col items-center gap-3 p-6 card hover:shadow-lg hover:border-orange-200 dark:hover:border-stone-700 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>{cat.icon}</div>
                <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 text-center">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products Section ── */}
      <section className="py-20 bg-stone-100/50 dark:bg-stone-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">Featured Products</h2>
              <p className="text-stone-500 dark:text-stone-400">Handpicked favorites just for you</p>
            </div>
            <Link to="/products" className="btn-ghost hidden sm:flex">View All <HiArrowRight className="w-4 h-4" /></Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />) : featured.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
          </div>
          <div className="text-center mt-10 sm:hidden"><Link to="/products" className="btn-secondary">View All Products</Link></div>
        </div>
      </section>

      {/* ── Promotions Section ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 p-10 text-white">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <span className="badge bg-white/20 text-white mb-4 inline-block">Limited Offer</span>
              <h3 className="font-display text-3xl font-bold mb-3">Up to 40% off<br />Electronics</h3>
              <p className="text-orange-100 mb-6">Don't miss out on our biggest sale of the season.</p>
              <Link to="/products?cat=electronics" className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">Shop Now <HiArrowRight className="w-4 h-4" /></Link>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 p-10 text-white">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <span className="badge bg-white/20 text-white mb-4 inline-block">New Arrivals</span>
              <h3 className="font-display text-3xl font-bold mb-3">Fresh Fashion<br />Just Dropped</h3>
              <p className="text-teal-100 mb-6">Explore the latest trends and styles this season.</p>
              <Link to="/products?cat=fashion" className="inline-flex items-center gap-2 bg-white text-teal-600 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors">Explore <HiArrowRight className="w-4 h-4" /></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="py-20 bg-stone-900 dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-3">What Our Customers Say</h2>
            <p className="text-stone-400 text-lg">Trusted by thousands worldwide</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-stone-800 rounded-2xl p-6 border border-stone-700">
                <div className="flex items-center gap-1 mb-4">{[...Array(t.rating)].map((_, j) => (<HiStar key={j} className="w-4 h-4 text-amber-400" />))}</div>
                <p className="text-stone-300 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-stone-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}