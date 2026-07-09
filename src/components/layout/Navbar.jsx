import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser, HiOutlineSun, HiOutlineMoon, HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlineViewGrid, HiOutlineLogout, HiOutlineChartBar, HiOutlineScale, HiOutlineClipboardList } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore, useWishlistStore, useThemeStore } from '../../store';
import useCompare from '../../hooks/useCompare';

const buyerLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products', end: false },
  { to: '/products?cat=electronics', label: 'Electronics', end: false },
  { to: '/products?cat=fashion', label: 'Fashion', end: false },
];
const sellerLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard/seller', label: 'Dashboard', end: false },
  { to: '/products', label: 'Browse', end: false },
];

// buyerLinks is used for buyers — NO dashboard link (buyer uses Profile page)

const spring = { type: 'spring', stiffness: 300, damping: 30 };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useCartStore(s => s.items);
  const wishlistItems = useWishlistStore(s => s.items);
  const { isDark, toggleTheme } = useThemeStore();
  const { currentUser, userData, logout: authLogout } = useAuth();
  const { items: compareItems } = useCompare();

  const isSeller = userData?.role === 'seller';
  const isAdmin = userData?.role === 'admin';
  const isAuthenticated = !!currentUser;
  const navLinks = isAdmin
    ? [
        { to: '/', label: 'Home', end: true },
        { to: '/products', label: 'Products', end: false },
        { to: '/dashboard/admin', label: 'Admin', end: false },
      ]
    : isSeller ? sellerLinks : buyerLinks;
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const hideSearch = location.pathname === '/login' || location.pathname === '/register' || location.pathname.includes('/dashboard');

  const isHome = location.pathname === '/';
  const darkText = !isHome || scrolled;
  const isActive = (link) => {
    if (link.end) return location.pathname === link.to;
    if (link.to.includes('?')) return location.pathname + location.search === link.to;
    return location.pathname.startsWith(link.to) && location.pathname !== '/';
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-user-menu]')) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setMobileOpen(false);
      setUserMenuOpen(false);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); }
  };

  const handleLogout = async () => {
    await authLogout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/login', { replace: true });
  };

  const navStyle = scrolled || !isHome
    ? 'bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl shadow-lg shadow-stone-200/30 dark:shadow-stone-900/30 border-b border-stone-100/50 dark:border-stone-800/50'
    : 'bg-transparent';

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navStyle}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 bg-gradient-to-br from-orange-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-sm">L</span>
              </motion.div>
              <span className={`font-display font-bold text-xl transition-colors duration-300 ${darkText ? 'text-stone-900 dark:text-white' : 'text-white'}`}>
                Luxe<span className="text-orange-500">Shop</span>
              </span>
              {isAdmin && isAuthenticated && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-semibold"
                >
                  Admin
                </motion.span>
              )}
              {!isAdmin && isSeller && isAuthenticated && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-xs font-semibold"
                >
                  Seller
                </motion.span>
              )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(link => {
                const active = isActive(link);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      color: active
                        ? darkText ? '#ea580c' : '#fff'
                        : darkText ? 'rgba(87,83,78,0.9)' : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          backgroundColor: darkText ? 'rgba(234,88,12,0.08)' : 'rgba(255,255,255,0.1)',
                        }}
                        transition={spring}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              {!hideSearch && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(true)}
                  className={`p-2 rounded-xl transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  <HiOutlineSearch className="w-5 h-5" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05, rotate: isDark ? -15 : 15 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
              </motion.button>

              <Link to="/compare" className={`relative p-2 rounded-xl hidden sm:flex transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-teal-500 hover:bg-teal-50 dark:text-stone-400 dark:hover:text-teal-400 dark:hover:bg-teal-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                <HiOutlineScale className="w-5 h-5" />
                {compareItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold"
                  >
                    {compareItems.length}
                  </motion.span>
                )}
              </Link>

              {isAuthenticated && !isSeller && (
                <Link to="/wishlist" className={`relative p-2 rounded-xl hidden sm:flex transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <HiOutlineHeart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold"
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </Link>
              )}

              {!isSeller && (
                <Link to="/cart" className={`relative p-2 rounded-xl transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Link>
              )}

              {isSeller && isAuthenticated && (
                <Link to="/dashboard/seller" className={`hidden sm:flex p-2 rounded-xl relative group transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <HiOutlineChartBar className="w-5 h-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-stone-900 dark:bg-stone-800 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Dashboard</span>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="relative hidden sm:block" data-user-menu>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserMenuOpen(v => !v)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all ${darkText ? 'hover:bg-stone-100 dark:hover:bg-stone-800' : 'hover:bg-white/10'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold border-2 border-orange-400">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium max-w-[80px] truncate ${darkText ? 'text-stone-700 dark:text-stone-300' : 'text-white/90'}`}>
                      {userData?.name?.split(' ')[0]}
                    </span>
                  </motion.button>

                  {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute right-0 top-full mt-2 w-52 card shadow-xl py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{userData?.name}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{userData?.email}</p>
                          <span className={`inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md text-xs font-semibold ${isAdmin ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : isSeller ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'}`}>
                            {isAdmin ? '🛡️ Admin' : isSeller ? '\u{1F3EA} Seller' : '\u{1F6CD}\uFE0F Buyer'}
                          </span>
                        </div>
                        <div className="py-1">
                          {isAdmin ? (
                            <>
                              <Link to="/dashboard/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineChartBar className="w-4 h-4 text-stone-400" /> Admin Dashboard
                              </Link>
                              <Link to="/dashboard/admin?tab=applications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineClipboardList className="w-4 h-4 text-stone-400" /> Seller Applications
                              </Link>
                            </>
                          ) : isSeller ? (
                            <>
                              <Link to="/dashboard/seller" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineChartBar className="w-4 h-4 text-stone-400" /> Dashboard
                              </Link>
                              <Link to="/dashboard/seller?tab=products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineViewGrid className="w-4 h-4 text-stone-400" /> My Products
                              </Link>
                              <Link to="/compare" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineScale className="w-4 h-4 text-stone-400" /> Compare {compareItems.length > 0 && (<span className="ml-auto badge bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 text-xs">{compareItems.length}</span>)}
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineUser className="w-4 h-4 text-stone-400" /> My Profile
                              </Link>
                              <Link to="/compare" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineScale className="w-4 h-4 text-stone-400" /> Compare {compareItems.length > 0 && (<span className="ml-auto badge bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 text-xs">{compareItems.length}</span>)}
                              </Link>
                              <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                                <HiOutlineHeart className="w-4 h-4 text-stone-400" /> Wishlist {wishlistItems.length > 0 && (<span className="ml-auto badge bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">{wishlistItems.length}</span>)}
                              </Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-stone-100 dark:border-stone-800 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                            <HiOutlineLogout className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                </div>
              ) : (
                <Link to="/login" className={`hidden sm:flex p-2 rounded-xl transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <HiOutlineUser className="w-5 h-5" />
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(true)}
                className={`lg:hidden p-2 rounded-xl ml-1 transition-colors duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <HiOutlineMenu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-28 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onSubmit={handleSearch}
              className="w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 rounded-2xl text-lg bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-stone-700/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-stone-900 dark:text-stone-100"
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <HiOutlineX className="w-5 h-5 text-stone-400" />
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white dark:bg-stone-900 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold border-2 border-orange-400">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{userData?.name?.split(' ')[0]}</p>
                      <span className={`text-xs font-medium ${isAdmin ? 'text-purple-500' : isSeller ? 'text-teal-500' : 'text-orange-500'}`}>
                        {isAdmin ? '🛡️ Admin' : isSeller ? '\u{1F3EA} Seller' : '\u{1F6CD}\uFE0F Buyer'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="font-display font-bold text-xl text-stone-900 dark:text-white">Menu</span>
                )}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost p-2 rounded-xl"
                >
                  <HiOutlineX className="w-5 h-5" />
                </motion.button>
              </div>

              <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
                  {navLinks.map((link) => (
                    <motion.div
                      key={link.to}
                      variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-1">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    {isAuthenticated ? (
                      isAdmin ? (
                        <>
                          <Link to="/dashboard/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineChartBar className="w-5 h-5" /> Dashboard
                          </Link>
                          <Link to="/dashboard/admin?tab=applications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineClipboardList className="w-5 h-5" /> Applications
                          </Link>
                        </>
                      ) : isSeller ? (
                        <>
                          <Link to="/dashboard/seller" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineChartBar className="w-5 h-5" /> Dashboard
                          </Link>
                          <Link to="/compare" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineScale className="w-5 h-5" /> Compare ({compareItems.length})
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineHeart className="w-5 h-5" /> Wishlist ({wishlistItems.length})
                          </Link>
                          <Link to="/compare" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineScale className="w-5 h-5" /> Compare ({compareItems.length})
                          </Link>
                          <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                            <HiOutlineUser className="w-5 h-5" /> My Profile
                          </Link>
                        </>
                      )
                    ) : (
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">
                        <HiOutlineUser className="w-5 h-5" /> Login
                      </Link>
                    )}
                  </motion.div>
                </div>
              </nav>

              <div className="p-6 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                >
                  {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.button>
                {isAuthenticated && (
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                  >
                    <HiOutlineLogout className="w-5 h-5" /> Sign Out
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
