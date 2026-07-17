import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser, HiOutlineSun, HiOutlineMoon,
  HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineChartBar, HiOutlineChevronDown,
  HiOutlineViewGrid, HiOutlineTag, HiOutlineTemplate,
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore, useWishlistStore, useThemeStore, useProductStore, useCategoryStore } from '../../store';

const spring = { type: 'spring', stiffness: 300, damping: 30 };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useCartStore(s => s.items);
  const wishlistItems = useWishlistStore(s => s.items);
  const { isDark, toggleTheme } = useThemeStore();
  const { currentUser, userData, isStoreOwner, logout: authLogout } = useAuth();
  const { categories: allCategories, fetchCategories } = useCategoryStore();
  const products = useProductStore(s => s.products);
  const isAuthenticated = !!currentUser;
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const categories = useMemo(() => {
    const catSlugs = new Set(products.map(p => p.category).filter(Boolean));
    return allCategories
      .filter(c => catSlugs.has(c.slug))
      .map(c => ({
        ...c,
        subcategories: c.subcategories?.filter(s =>
          products.some(p => p.category === c.slug && p.subcategory === s.slug)
        ) || [],
      }));
  }, [products, allCategories]);

  const isHome = location.pathname === '/';
  const darkText = !isHome || scrolled;

  useEffect(() => {
    fetchCategories();
  }, []);

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

  useEffect(() => {
    if (!catDropdown) return;
    const handler = (e) => { if (!e.target.closest('[data-cat-dropdown]')) setCatDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [catDropdown]);

  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setMobileOpen(false);
      setUserMenuOpen(false);
      setCatDropdown(false);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await authLogout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/login', { replace: true });
  };

  const navStyle = scrolled || !isHome
    ? 'bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl shadow-lg shadow-stone-200/30 dark:shadow-stone-900/30 border-b border-stone-100/50 dark:border-stone-800/50'
    : 'bg-transparent';

  const linkClass = (active) =>
    `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? darkText ? 'text-orange-600' : 'text-white'
        : darkText ? 'text-stone-600 dark:text-stone-400' : 'text-white/80'
    }`;

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
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>Home</NavLink>

              {/* Products dropdown */}
              <div className="relative" data-cat-dropdown>
                <button
                  onClick={() => setCatDropdown(v => !v)}
                  className={`${linkClass(location.pathname === '/products')} flex items-center gap-1`}
                >
                  Products <HiOutlineChevronDown className={`w-3.5 h-3.5 transition-transform ${catDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {catDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute left-0 top-full mt-2 w-56 card shadow-xl py-2 z-50"
                    >
                      <Link to="/products" onClick={() => setCatDropdown(false)}
                        className="block px-4 py-2.5 text-sm font-semibold text-orange-500 hover:bg-stone-50 dark:hover:bg-stone-800"
                      >
                        All Products
                      </Link>
                      <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                      {categories.map(cat => (
                        <div key={cat.id} className="group relative">
                          <Link to={`/products?cat=${cat.slug}`} onClick={() => setCatDropdown(false)}
                            className="block px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            {cat.name}
                          </Link>
                          {cat.subcategories?.length > 0 && (
                            <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-48 card shadow-xl py-2">
                              {cat.subcategories.map(sub => (
                                <Link key={sub.slug} to={`/products?cat=${cat.slug}&sub=${sub.slug}`}
                                  onClick={() => setCatDropdown(false)}
                                  className="block px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to="/about" className={({ isActive }) => linkClass(isActive)}>About</NavLink>
              {isStoreOwner && (
                <NavLink to="/dashboard/seller" className={({ isActive }) => linkClass(isActive)}>
                  <HiOutlineChartBar className="w-4 h-4 inline mr-1" /> My Dashboard
                </NavLink>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <motion.button
                whileHover={{ scale: 1.05, rotate: isDark ? -15 : 15 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
              </motion.button>

              {isAuthenticated && !isStoreOwner && (
                <Link to="/create-set" className={`relative p-2 rounded-xl hidden sm:flex transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  <HiOutlineTemplate className="w-5 h-5" />
                </Link>
              )}

              {isAuthenticated && (
                <>
                  <Link to="/wishlist" className={`relative p-2 rounded-xl hidden sm:flex transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                    <HiOutlineHeart className="w-5 h-5" />
                    {wishlistItems.length > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold"
                      >
                        {wishlistItems.length}
                      </motion.span>
                    )}
                  </Link>
                  <Link to="/cart" className={`relative p-2 rounded-xl transition-all duration-200 ${darkText ? 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                    <HiOutlineShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="relative hidden sm:block" data-user-menu>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserMenuOpen(v => !v)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all ${darkText ? 'hover:bg-stone-100 dark:hover:bg-stone-800' : 'hover:bg-white/10'}`}
                  >
                    {isStoreOwner ? (
                      <>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white border-2 border-orange-400">
                          <HiOutlineChartBar className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium max-w-[90px] truncate ${darkText ? 'text-stone-700 dark:text-stone-300' : 'text-white/90'}`}>
                          My Dashboard
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold border-2 border-orange-400">
                          {userData?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-sm font-medium max-w-[80px] truncate ${darkText ? 'text-stone-700 dark:text-stone-300' : 'text-white/90'}`}>
                          {userData?.name?.split(' ')[0]}
                        </span>
                      </>
                    )}
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
                      </div>
                      <div className="py-1">
                        {isStoreOwner ? (
                          <>
                            <Link to="/dashboard/seller" className="flex items-center gap-3 px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors font-semibold">
                              <HiOutlineChartBar className="w-4 h-4" /> My Dashboard
                            </Link>
                            <Link to="/dashboard/seller?tab=products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                              <HiOutlineViewGrid className="w-4 h-4 text-stone-400" /> Products
                            </Link>
                            <Link to="/dashboard/seller?tab=coupons" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                              <HiOutlineTag className="w-4 h-4 text-stone-400" /> Coupons
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                              <HiOutlineUser className="w-4 h-4 text-stone-400" /> My Profile
                            </Link>
                            <Link to="/orders/my-orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                              <HiOutlineShoppingCart className="w-4 h-4 text-stone-400" /> My Orders
                            </Link>
                            <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                              <HiOutlineHeart className="w-4 h-4 text-stone-400" /> Wishlist
                            </Link>
                            <Link to="/create-set" className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                              <HiOutlineTemplate className="w-4 h-4 text-stone-400" /> Create Set
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-white dark:bg-stone-900 shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold border-2 border-orange-400">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{userData?.name?.split(' ')[0]}</p>
                  </div>
                ) : (
                  <span className="font-display font-bold text-xl text-stone-900 dark:text-white">Menu</span>
                )}
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)} className="btn-ghost p-2 rounded-xl"
                >
                  <HiOutlineX className="w-5 h-5" />
                </motion.button>
              </div>
              <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                <NavLink to="/" end onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block px-4 py-3 rounded-xl font-medium ${isActive ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                >Home</NavLink>
                {isStoreOwner && (
                  <Link to="/dashboard/seller" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  ><HiOutlineChartBar className="w-5 h-5" /> My Dashboard</Link>
                )}
                <NavLink to="/products" end onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block px-4 py-3 rounded-xl font-medium ${isActive ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                >All Products</NavLink>
                {categories.map(cat => (
                  <div key={cat.id}>
                    <Link to={`/products?cat=${cat.slug}`} onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl ml-4"
                    >
                      {cat.name}
                    </Link>
                    {cat.subcategories?.map(sub => (
                      <Link key={sub.slug} to={`/products?cat=${cat.slug}&sub=${sub.slug}`} onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2 text-xs text-stone-400 dark:text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl ml-8"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                ))}
                <NavLink to="/about" onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block px-4 py-3 rounded-xl font-medium ${isActive ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                >About</NavLink>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-1">
                  {isAuthenticated ? (
                    <>
                      {isStoreOwner ? (
                        <>
                          <Link to="/dashboard/seller" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-semibold"
                          ><HiOutlineChartBar className="w-5 h-5" /> My Dashboard</Link>
                          <Link to="/dashboard/seller?tab=products" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          ><HiOutlineViewGrid className="w-5 h-5" /> Products</Link>
                          <Link to="/dashboard/seller?tab=coupons" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          ><HiOutlineTag className="w-5 h-5" /> Coupons</Link>
                        </>
                      ) : (
                        <>
                          <Link to="/profile" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          ><HiOutlineUser className="w-5 h-5" /> My Profile</Link>
                          <Link to="/orders/my-orders" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          ><HiOutlineShoppingCart className="w-5 h-5" /> My Orders</Link>
                          <Link to="/wishlist" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          ><HiOutlineHeart className="w-5 h-5" /> Wishlist</Link>
                          <Link to="/create-set" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                          ><HiOutlineTemplate className="w-5 h-5" /> Create Set</Link>
                        </>
                      )}
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                    ><HiOutlineUser className="w-5 h-5" /> Login</Link>
                  )}
                </div>
              </nav>
              <div className="p-6 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <motion.button whileHover={{ x: 4 }} onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                >
                  {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.button>
              {isAuthenticated && (
                  <motion.button whileHover={{ x: 4 }} onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                  ><HiOutlineLogout className="w-5 h-5" /> Sign Out</motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
