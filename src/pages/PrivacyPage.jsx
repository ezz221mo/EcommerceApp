import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">Privacy Policy</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-10">Last updated: January 2025</p>

          <div className="prose dark:prose-invert max-w-none space-y-8 text-stone-600 dark:text-stone-300 leading-relaxed">
            
            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email address, postal address, phone number, and payment information.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process and fulfill your orders, including processing payments and handling shipping.</li>
                <li>To communicate with you about your account, transactions, or customer support inquiries.</li>
                <li>To personalize and improve your shopping experience on our platform.</li>
                <li>To send you promotional emails (only if you have opted in to receive them).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">3. Data Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">4. Local Storage (Cookies)</h2>
              <p>We use browser local storage and cookies to understand and save your preferences for future visits, keep track of advertisements, and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">5. Data Security</h2>
              <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. All sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">6. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information at any time. You can do this by logging into your account settings or contacting us directly.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@luxeshop.com" className="text-orange-500 hover:underline">hello@luxeshop.com</a>.</p>
            </section>

          </div>

          <div className="mt-12 p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 text-center">
            <p className="text-stone-500 mb-4">Your privacy is important to us.</p>
            <Link to="/products" className="btn-primary">Back to Shopping</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}