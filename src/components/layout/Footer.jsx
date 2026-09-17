import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';
import { useCategoryStore } from '../../store';
import { useMemo } from 'react';

const TwitterIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const LinkedinIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;

export default function Footer() {
  const { currentUser, userData } = useAuth();
  const isAuthenticated = !!currentUser;
  const isSeller       = userData?.role === 'seller' || userData?.role === 'store_owner';
  const isAdmin        = userData?.role === 'admin';
  const isBuyer        = userData?.role === 'buyer';
  const isDelivery     = userData?.role === 'delivery';
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
    { label: 'Customer Support', to: '/customer-support' },
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
    ...(!isAdmin && !isDelivery ? [{ title: 'Support', links: supportLinks }] : []),
  ];

  // Delivery users see a minimal footer with branding only
  if (isDelivery) {
    return (
      <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Luxe<span className="text-orange-400">Shop</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[TwitterIcon, InstagramIcon, FacebookIcon, LinkedinIcon].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-stone-800 mt-6 pt-6 text-center text-sm text-stone-500">
            &copy; {new Date().getFullYear()} LuxeShop. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  const socialIcons = [TwitterIcon, InstagramIcon, FacebookIcon, LinkedinIcon];

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
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
              {[
                { Icon: HiOutlineMail, href: 'mailto:hello@luxeshop.com', text: 'hello@luxeshop.com' },
                { Icon: HiOutlinePhone, href: 'tel:+15551234567', text: '+1 (555) 123-4567' },
                { Icon: HiOutlineLocationMarker, href: null, text: 'New York, NY 10001' },
              ].map(({ Icon, href, text }, i) => {
                const content = (
                  <div className="flex items-center gap-3 text-stone-400 cursor-default">
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600/20 transition-colors">
                      <Icon className="w-4 h-4 text-orange-400" />
                    </div>
                    {text}
                  </div>
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
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-orange-600 flex items-center justify-center transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic link columns */}
          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-stone-400 hover:text-orange-400 text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span className="w-1 h-1 bg-stone-600 rounded-full flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-stone-800/60 to-stone-800/30 border border-stone-700/40 rounded-2xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold text-lg">Stay in the loop</h4>
              <p className="text-stone-400 text-sm mt-1">Get the latest deals and new arrivals directly in your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="input-field flex-1 md:w-72 bg-stone-900 border-stone-700 text-stone-200 placeholder-stone-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
              />
              <button className="btn-primary whitespace-nowrap px-6">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>&copy; {new Date().getFullYear()} LuxeShop. All rights reserved.</p>
          <div className="flex gap-6">
            {[
              { label: 'Privacy Policy', to: '/privacy-policy' },
              { label: 'Terms of Service', to: '/terms-and-conditions' },
              { label: 'About', to: '/about' },
            ].map((link) => (
              <div key={link.label}>
                <Link to={link.to} className="hover:text-stone-300 transition-colors">
                  {link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
