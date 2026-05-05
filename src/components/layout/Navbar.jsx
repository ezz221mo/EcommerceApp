import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser, HiOutlineSun, HiOutlineMoon, HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlineViewGrid, HiOutlineLogout, HiOutlineChartBar } from 'react-icons/hi';
import { useCartStore, useWishlistStore, useThemeStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const buyerLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products', end: false },
  { to: '/products?cat=electronics', label: 'Electronics', end: false },
  { to: '/products?cat=fashion', label: 'Fashion', end: false },
];
const sellerLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/seller/dashboard', label: 'Dashboard', end: false },
  { to: '/products', label: 'Browse', end: false },
];

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
  const { isAuthenticated, user, logout } = useAuthStore();

  const isSeller = user?.role === 'seller';
  const navLinks = isSeller ? sellerLinks : buyerLinks;
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const hideSearch = location.pathname === '/login' || location.pathname === '/register' || location.pathname.includes('/dashboard');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-user-menu]')) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery(''); }
  };

  const handleLogout = () => {
    logout(); setUserMenuOpen(false); setMobileOpen(false);
    toast.success('Signed out successfully', { style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' } });
    navigate('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-stone-950/95 backdrop-blur-lg shadow-lg shadow-stone-200/40 dark:shadow-stone-900/40 border-b border-stone-100/50 dark:border-stone-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-display font-bold text-xl text-stone-900 dark:text-white">
                Luxe<span className="text-orange-500">Shop</span>
              </span>
              {isSeller && isAuthenticated && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-xs font-semibold">Seller</span>
              )}
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to} end={link.end}
                  className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50 dark:text-stone-400 dark:hover:text-orange-400 dark:hover:bg-orange-950/20'}`}
                >{link.label}</NavLink>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {!hideSearch && (
                <button onClick={() => setSearchOpen(true)} className="btn-ghost p-2 rounded-xl"><HiOutlineSearch className="w-5 h-5" /></button>
              )}
              <button onClick={toggleTheme} className="btn-ghost p-2 rounded-xl">
                {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
              </button>

              {isAuthenticated && !isSeller && (
                <Link to="/wishlist" className="relative btn-ghost p-2 rounded-xl hidden sm:flex">
                  <HiOutlineHeart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center font-bold">{wishlistItems.length}</span>)}
                </Link>
              )}

              {!isSeller && (
                <Link to="/cart" className="relative btn-ghost p-2 rounded-xl">
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center font-bold">{totalItems}</motion.span>
                  )}
                </Link>
              )}

              {isSeller && isAuthenticated && (
                <Link to="/seller/dashboard" className="hidden sm:flex btn-ghost p-2 rounded-xl relative group">
                  <HiOutlineChartBar className="w-5 h-5" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-stone-900 dark:bg-stone-800 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Dashboard</span>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="relative hidden sm:block" data-user-menu>
                  <button onClick={() => setUserMenuOpen(v => !v)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold border-2 border-orange-400">{user?.name?.charAt(0).toUpperCase()}</div>
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-52 card shadow-xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{user?.name}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{user?.email}</p>
                          <span className={`inline-flex mt-1.5 items-center px-2 py-0.5 rounded-md text-xs font-semibold ${isSeller ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400'}`}>{isSeller ? '🏪 Seller' : '🛍️ Buyer'}</span>
                        </div>
                        <div className="py-1">
                          {isSeller ? (
                            <>
                              <Link to="/seller/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><HiOutlineChartBar className="w-4 h-4 text-stone-400" /> Dashboard</Link>
                              <Link to="/seller/dashboard?tab=products" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><HiOutlineViewGrid className="w-4 h-4 text-stone-400" /> My Products</Link>
                            </>
                          ) : (
                            <>
                              <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><HiOutlineUser className="w-4 h-4 text-stone-400" /> My Profile</Link>
                              <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><HiOutlineHeart className="w-4 h-4 text-stone-400" /> Wishlist {wishlistItems.length > 0 && (<span className="ml-auto badge bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">{wishlistItems.length}</span>)}</Link>
                            </>
                          )}
                        </div>
                        <div className="border-t border-stone-100 dark:border-stone-800 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"><HiOutlineLogout className="w-4 h-4" /> Sign Out</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex btn-ghost p-2 rounded-xl"><HiOutlineUser className="w-5 h-5" /></Link>
              )}

              <button onClick={() => setMobileOpen(true)} className="lg:hidden btn-ghost p-2 rounded-xl ml-1"><HiOutlineMenu className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={() => setSearchOpen(false)}>
            <motion.form initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} onSubmit={handleSearch} className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="relative">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input autoFocus type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-stone-900 dark:text-stone-100" />
                <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2"><HiOutlineX className="w-5 h-5 text-stone-400" /></button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white dark:bg-stone-900 shadow-2xl lg:hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold border-2 border-orange-400">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{user?.name?.split(' ')[0]}</p>
                      <span className={`text-xs font-medium ${isSeller ? 'text-teal-500' : 'text-orange-500'}`}>{isSeller ? '🏪 Seller' : '🛍️ Buyer'}</span>
                    </div>
                  </div>
                ) : (<span className="font-display font-bold text-xl text-stone-900 dark:text-white">Menu</span>)}
                <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2 rounded-xl"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <NavLink to={link.to} end={link.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>{link.label}</NavLink>
                  </motion.div>
                ))}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-1">
                  {isAuthenticated ? (isSeller ? (<Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"><HiOutlineChartBar className="w-5 h-5" /> Dashboard</Link>) : (<><Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"><HiOutlineHeart className="w-5 h-5" /> Wishlist ({wishlistItems.length})</Link><Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"><HiOutlineUser className="w-5 h-5" /> My Profile</Link></>)) : (<Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"><HiOutlineUser className="w-5 h-5" /> Login</Link>)}
                </div>
              </nav>
              <div className="p-6 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium">{isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}{isDark ? 'Light Mode' : 'Dark Mode'}</button>
                {isAuthenticated && (<button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"><HiOutlineLogout className="w-5 h-5" /> Sign Out</button>)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}