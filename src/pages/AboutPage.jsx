import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineHeart, HiOutlineSparkles } from 'react-icons/hi';

const features = [
  { icon: HiOutlineShieldCheck, title: 'Premium Quality', desc: 'Every product is handpicked and tested to ensure it meets our high-quality standards.' },
  { icon: HiOutlineTruck, title: 'Fast & Reliable Shipping', desc: 'We partner with the best logistics companies to ensure your order arrives safely and on time.' },
  { icon: HiOutlineHeart, title: 'Customer First', desc: 'Our support team is available around the clock to help you with any inquiries or issues.' },
  { icon: HiOutlineSparkles, title: 'Curated Collections', desc: 'We don\'t sell everything; we sell what\'s worth having. Our collections are carefully curated.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <span className="text-orange-400 font-semibold text-sm uppercase tracking-widest">About Us</span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold mt-4 mb-6 leading-tight">
              Redefining the way you <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-teal-400">shop premium</span> products.
            </h1>
            <p className="text-stone-300 text-lg leading-relaxed">
              Founded in 2024, LuxeShop started with a simple idea: make high-quality, aesthetic products accessible to everyone without the luxury price tag. 
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
      </div>

      {/* Mission Section */}
      <div className="bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
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
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4">Ready to experience the difference?</h2>
        <p className="text-stone-500 mb-8 max-w-xl mx-auto">Browse our collection and find your next favorite product today.</p>
        <Link to="/products" className="btn-primary text-base px-8 py-4">Browse Products</Link>
      </div>
    </div>
  );
}