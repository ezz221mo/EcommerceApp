import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">Terms of Service</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-10">Last updated: January 2025</p>

          <div className="prose dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed">
            
            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using LuxeShop ("the Site"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">2. User Accounts</h2>
              <p>To access certain features of the Site, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">3. Products and Pricing</h2>
              <p>All prices are displayed in US Dollars and are subject to change without notice. We reserve the right to modify or discontinue any product without notice. We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of a product.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">4. Seller Responsibilities</h2>
              <p>Sellers using the platform are solely responsible for the accuracy of their product listings, including images, descriptions, and pricing. LuxeShop acts as a facilitator and is not a party to the transaction between buyers and sellers.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">5. Orders and Payment</h2>
              <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. In the event that we make a change to or cancel an order, we will attempt to notify you by contacting the email associated with your account.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">6. Limitation of Liability</h2>
              <p>LuxeShop shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. This includes, but is not limited to, loss of profits, data, or other intangible losses.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">7. Contact Information</h2>
              <p>If you have any questions regarding these terms, please contact us at <a href="mailto:hello@luxeshop.com" className="text-orange-500 hover:underline">hello@luxeshop.com</a>.</p>
            </section>

          </div>

          <div className="mt-12 p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 text-center">
            <p className="text-stone-500 mb-4">Have questions about our terms?</p>
            <Link to="/products" className="btn-primary">Back to Shopping</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}