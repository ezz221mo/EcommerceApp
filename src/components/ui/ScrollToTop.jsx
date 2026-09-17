import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Home | LuxeShop',
  '/products': 'Products | LuxeShop',
  '/login': 'Login | LuxeShop',
  '/register': 'Register | LuxeShop',
  '/about': 'About Us | LuxeShop',
  '/terms': 'Terms & Conditions | LuxeShop',
  '/terms-and-conditions': 'Terms & Conditions | LuxeShop',
  '/privacy': 'Privacy Policy | LuxeShop',
  '/privacy-policy': 'Privacy Policy | LuxeShop',
  '/customer-support': 'Customer Support | LuxeShop',
  '/outfit': 'Outfit Planner | LuxeShop',
  '/create-set': 'Create Set | LuxeShop',
  '/cart': 'Cart | LuxeShop',
  '/checkout': 'Checkout | LuxeShop',
  '/profile': 'Profile | LuxeShop',
  '/wishlist': 'Wishlist | LuxeShop',
  '/profile/edit': 'Edit Profile | LuxeShop',
  '/dashboard/seller': 'Seller Dashboard | LuxeShop',
  '/dashboard/delivery': 'Delivery Dashboard | LuxeShop',
  '/orders/my-orders': 'My Orders | LuxeShop',
};

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const prevPath = useRef(pathname + search);

  useEffect(() => {
    const key = pathname + search;
    if (key !== prevPath.current) {
      prevPath.current = key;
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    }
  }, [pathname, search]);

  useEffect(() => {
    const title = routeTitles[pathname];
    if (title) {
      document.title = title;
    } else if (pathname.startsWith('/products/')) {
      document.title = 'Product Detail | LuxeShop';
    } else if (pathname.startsWith('/create-set/')) {
      document.title = 'Set Detail | LuxeShop';
    } else {
      document.title = 'LuxeShop';
    }
  }, [pathname]);

  return null;
}
