import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useAuthStore } from '../../store';

export default function Footer() {
  const user           = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isSeller       = user?.role === 'seller';
  const isBuyer        = user?.role === 'buyer';

  // ── Static shop links (always visible) ──────────────────────────────────
  const shopLinks = [
    { label: 'All Products',  to: '/products'               },
    { label: 'Electronics',   to: '/products?cat=electronics'},
    { label: 'Fashion',       to: '/products?cat=fashion'   },
    { label: 'Home & Living', to: '/products?cat=home'      },
    { label: 'Beauty',        to: '/products?cat=beauty'    },
  ];

  // ── Company links — Dashboard only for sellers ───────────────────────────
  const companyLinks = [
    { label: 'About Us', to: '/about' },
    // Only show Dashboard if user is a seller
    ...(isAuthenticated && isSeller
      ? [{ label: 'Seller Dashboard', to: '/seller/dashboard' }]
      : []
    ),
  ];

  // ── Support links — role-aware ───────────────────────────────────────────
  const supportLinks = [
    { label: 'Shopping Cart', to: '/cart' },
    // My Orders → visible to buyers (and guests, shows login prompt)
    ...(!isSeller
      ? [{ label: 'My Orders', to: '/orders/my-orders' }]
      : []
    ),
    // My Profile → only for buyers
    ...(isAuthenticated && isBuyer
      ? [{ label: 'My Profile', to: '/profile' }]
      : []
    ),
    // Login / Register → only when NOT authenticated
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
    { title: 'Support', links: supportLinks },
  ];

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Luxe<span className="text-orange-400">Shop</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Curated collection of premium products. Quality you can trust, delivered with care.
            </p>

            <div className="space-y-3 text-sm">
              <a href="mailto:hello@luxeshop.com"
                className="flex items-center gap-3 text-stone-400 hover:text-orange-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <HiOutlineMail className="w-4 h-4 text-orange-400" />
                </div>
                hello@luxeshop.com
              </a>
              <a href="tel:+15551234567"
                className="flex items-center gap-3 text-stone-400 hover:text-orange-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <HiOutlinePhone className="w-4 h-4 text-orange-400" />
                </div>
                +1 (555) 123-4567
              </a>
              <div className="flex items-center gap-3 text-stone-400">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <HiOutlineLocationMarker className="w-4 h-4 text-orange-400" />
                </div>
                New York, NY 10001
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {[FaTwitter, FaInstagram, FaFacebook, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic link columns */}
          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-stone-400 hover:text-orange-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 bg-stone-600 rounded-full group-hover:bg-orange-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-stone-800/50 border border-stone-700/50 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold text-lg">Stay in the loop</h4>
              <p className="text-stone-400 text-sm mt-1">Get the latest deals and new arrivals directly in your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="input-field flex-1 md:w-72 bg-stone-900 border-stone-700 text-stone-200 placeholder-stone-500"
              />
              <button className="btn-primary whitespace-nowrap px-6">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} LuxeShop. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-stone-300 transition-colors">Terms of Service</Link>
            <Link to="/about"   className="hover:text-stone-300 transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}