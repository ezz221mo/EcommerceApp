import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useCategoryStore } from '../../store';
import { useMemo } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 14 },
  },
};

const socialVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 12, delay: 0.4 + i * 0.08 },
  }),
};

const linkHover = { scale: 1.03, x: 3, transition: { type: 'spring', stiffness: 300, damping: 10 } };

export default function Footer() {
  const { currentUser, userData } = useAuth();
  const isAuthenticated = !!currentUser;
  const isSeller       = userData?.role === 'seller' || userData?.role === 'store_owner';
  const isAdmin        = userData?.role === 'admin';
  const isBuyer        = userData?.role === 'buyer';
  const { categories } = useCategoryStore();

  const shopLinks = useMemo(() => [
    { label: 'All Products', to: '/products' },
    ...categories.map(c => ({ label: c.name, to: `/products?cat=${c.slug}` })),
  ], [categories]);

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    ...(isAuthenticated && isSeller
      ? [{ label: 'My Dashboard', to: '/dashboard/seller' }]
      : []
    ),
  ];

  const supportLinks = [
    { label: 'Shopping Cart', to: '/cart' },
    ...(!isSeller
      ? [{ label: 'My Orders', to: '/orders/my-orders' }]
      : []
    ),
    ...(isAuthenticated && isBuyer
      ? [{ label: 'My Profile', to: '/profile' }]
      : []
    ),
    ...(!isAuthenticated
      ? [
          { label: 'Sign In',  to: '/login'    },
          { label: 'Register', to: '/register' },
        ]
      : []
    ),
  ];

  const footerSections = [
    { title: 'Shop',    links: shopLinks    },
    { title: 'Company', links: companyLinks },
    ...(!isAdmin ? [{ title: 'Support', links: supportLinks }] : []),
  ];

  const socialIcons = [FaTwitter, FaInstagram, FaFacebook, FaLinkedin];

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="bg-stone-900 dark:bg-stone-950 text-stone-300 border-t border-stone-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="w-9 h-9 bg-gradient-to-br from-orange-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-sm">L</span>
              </motion.div>
              <span className="font-display font-bold text-xl text-white">
                Luxe<span className="text-orange-400">Shop</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Curated collection of premium products. Quality you can trust, delivered with care.
            </p>

            <div className="space-y-3 text-sm">
              {[
                { Icon: HiOutlineMail, href: 'mailto:hello@luxeshop.com', text: 'hello@luxeshop.com' },
                { Icon: HiOutlinePhone, href: 'tel:+15551234567', text: '+1 (555) 123-4567' },
                { Icon: HiOutlineLocationMarker, href: null, text: 'New York, NY 10001' },
              ].map(({ Icon, href, text }, i) => {
                const content = (
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="flex items-center gap-3 text-stone-400 cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600/20 transition-colors">
                      <Icon className="w-4 h-4 text-orange-400" />
                    </div>
                    {text}
                  </motion.div>
                );
                return href ? (
                  <a key={i} href={href} className="flex items-center gap-3 text-stone-400 hover:text-orange-400 transition-colors">
                    {content}
                  </a>
                ) : (
                  <div key={i}>{content}</div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              {socialIcons.map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  custom={i}
                  variants={socialVariants}
                  whileHover={{ scale: 1.15, rotate: 5, backgroundColor: '#ea580c' }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 8 }}
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-orange-600 flex items-center justify-center"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Dynamic link columns */}
          {footerSections.map(({ title, links }) => (
            <motion.div key={title} variants={itemVariants}>
              <motion.h4
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-white font-semibold mb-5 text-sm uppercase tracking-wider"
              >
                {title}
              </motion.h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={link.to}
                      className="text-stone-400 hover:text-orange-400 text-sm flex items-center gap-1.5 group"
                    >
                      <motion.span
                        className="w-1 h-1 bg-stone-600 rounded-full flex-shrink-0"
                        whileHover={{
                          scale: 2,
                          backgroundColor: '#f97316',
                          transition: { type: 'spring', stiffness: 300, damping: 8 },
                        }}
                      />
                      <motion.span whileHover={linkHover} className="inline-block">
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.2 }}
          className="bg-gradient-to-br from-stone-800/60 to-stone-800/30 border border-stone-700/40 rounded-2xl p-6 sm:p-8 mb-10"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center md:text-left"
            >
              <h4 className="text-white font-semibold text-lg">Stay in the loop</h4>
              <p className="text-stone-400 text-sm mt-1">Get the latest deals and new arrivals directly in your inbox.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex gap-2 w-full md:w-auto"
            >
              <motion.input
                whileFocus={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                type="email"
                placeholder="Your email address"
                className="input-field flex-1 md:w-72 bg-stone-900 border-stone-700 text-stone-200 placeholder-stone-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 8 }}
                className="btn-primary whitespace-nowrap px-6"
              >
                Subscribe
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
          >
            &copy; {new Date().getFullYear()} LuxeShop. All rights reserved.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex gap-6"
          >
            {[
              { label: 'Privacy Policy', to: '/privacy-policy' },
              { label: 'Terms of Service', to: '/terms-and-conditions' },
              { label: 'About', to: '/about' },
            ].map((link) => (
              <motion.div key={link.label} whileHover={{ y: -1 }} transition={{ type: 'spring', stiffness: 200, damping: 8 }}>
                <Link to={link.to} className="hover:text-stone-300 transition-colors">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
