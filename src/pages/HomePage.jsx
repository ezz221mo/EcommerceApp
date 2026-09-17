import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiStar, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineSupport } from 'react-icons/hi';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/product/ProductSkeleton';
import { testimonials } from '../data/products';
import { useProductStore } from '../store';

const stagger = {
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const perks = [
  { icon: HiOutlineTruck, title: 'Free Shipping', desc: 'On all orders over $75' },
  { icon: HiOutlineShieldCheck, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: HiOutlineRefresh, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: HiOutlineSupport, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const products = useProductStore(s => s.products);
  const productsLoading = useProductStore(s => s.loading);
  const parseDate = (d) => {
    if (!d) return 0;
    if (d?.toDate) return d.toDate().getTime();
    return new Date(d).getTime() || 0;
  };
  const featured = [...products].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt)).slice(0, 5);
  const navigate = useNavigate();

  const productCount = products.length || 0;
  const avgRating = products.length
    ? (products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-stone-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-mesh" />
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Discover<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-teal-400">
                Premium
              </span>
              <br />Products
            </motion.h1>

            <motion.p variants={fadeUp} className="text-stone-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              Curated collection of the finest products from around the world. Quality meets style in every item we offer.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/products')}
                className="btn-primary-glow text-base px-8 py-4 rounded-2xl"
              >
                Shop Now <HiArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold border-2 border-stone-700 hover:border-orange-500/60 text-stone-300 hover:text-white transition-all duration-200 text-base"
              >
                About Us
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-10 mt-14 justify-center lg:justify-start">
              {[
                { val: productCount > 0 ? `${productCount}` : '0', label: 'Products' },
                { val: avgRating, label: 'Avg Rating', star: true },
              ].map(({ val, label, star }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-white font-display">{val}</div>
                  <div className="text-stone-500 text-sm flex items-center gap-1 justify-center">
                    {star && <HiStar className="w-3.5 h-3.5 text-amber-400" />}
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-500">
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-stone-500 to-transparent" />
        </div>
      </section>

      {/* ── Perks Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3 text-white rounded-xl p-3 transition-colors hover:bg-white/10"
              >
                <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-orange-200 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Products Section ── */}
      <section className="py-20 bg-stone-100/50 dark:bg-stone-800/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-orange-500 font-semibold text-sm uppercase tracking-[0.15em]">Latest</span>
              <h2 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100 mt-3">Latest Products</h2>
              <p className="text-stone-500 dark:text-stone-400 mt-2">Newest arrivals you don&apos;t want to miss</p>
            </div>
            <div>
              <Link to="/products" className="btn-ghost hidden sm:flex text-sm">
                View All <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {productsLoading && products.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/products" className="btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ── Promotions Section ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 p-10 text-white group cursor-default">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
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
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 p-10 text-white group cursor-default">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
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
          </div>
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
            <motion.span variants={fadeUp} className="text-orange-400 font-semibold text-sm uppercase tracking-[0.15em]">Testimonials</motion.span>
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-bold text-white mt-3">What Our Customers Say</motion.h2>
            <motion.p variants={fadeUp} className="text-stone-400 text-lg mt-2">Trusted by thousands worldwide</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-6 border border-stone-700/50 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <HiStar key={j} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-300 leading-relaxed mb-6 text-sm italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30"
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-stone-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
