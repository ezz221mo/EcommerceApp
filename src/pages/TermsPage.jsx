import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

function Section({ title, children, index = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 80, damping: 14, delay: index * 0.07 }}
      className="relative pl-6 border-l-2 border-stone-200 dark:border-stone-800"
    >
      <motion.div
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ delay: index * 0.07 + 0.15, duration: 0.4 }}
        className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-teal-500 origin-top"
      />
      <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions | LuxeShop';
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 12, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-2"
          >
            Terms &amp; Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 dark:text-stone-400 mb-12"
          >
            Last updated: June 2025
          </motion.p>

          <div className="space-y-10 text-stone-600 dark:text-stone-300 leading-relaxed">

            <Section title="1. Acceptance of Terms" index={0}>
              <p>By accessing and using LuxeShop (&ldquo;the Site&rdquo;), you accept and agree to be bound by these terms and conditions. If you do not agree to abide by these terms, please do not use this service. Continued use of the site constitutes acceptance of any future updates to these terms.</p>
            </Section>

            <Section title="2. User Accounts" index={1}>
              <p className="mb-3">To access certain features of the Site, you may be required to create an account. You agree to:</p>
              <ul className="space-y-2">
                {[
                  'Provide accurate, current, and complete account information.',
                  'Maintain the confidentiality of your login credentials.',
                  'Notify us immediately of any unauthorized use of your account.',
                  'Be responsible for all activities that occur under your account.',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </Section>

            <Section title="3. Orders" index={2}>
              <p className="mb-3">When you place an order, you agree to provide accurate and complete purchasing information. All orders are subject to acceptance and availability. We reserve the right to:</p>
              <ul className="space-y-2">
                {[
                  'Refuse or cancel any order at our discretion.',
                  'Limit or cancel quantities purchased per person or per order.',
                  'Require additional verification or information before processing.',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-3">In the event of a change or cancellation, we will notify you via the email associated with your account.</p>
            </Section>

            <Section title="4. Payments" index={3}>
              <p>All prices are displayed in US Dollars and are subject to change without notice. Payment must be received in full before orders are processed. We accept major credit cards, debit cards, and other payment methods as displayed at checkout. Your payment information is encrypted and processed securely by third-party payment gateways. We do not store full payment details on our servers.</p>
            </Section>

            <Section title="5. Shipping" index={4}>
              <p className="mb-3">We strive to process and ship orders within 24 hours of order confirmation. Shipping times vary based on your location and selected shipping method. We are not responsible for:</p>
              <ul className="space-y-2">
                {[
                  'Delays caused by shipping carriers or customs processing.',
                  'Incorrect addresses provided by the customer.',
                  'Lost or stolen packages after confirmed delivery.',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-3">Shipping costs and estimated delivery times are displayed at checkout before you complete your purchase.</p>
            </Section>

            <Section title="6. Returns &amp; Refunds" index={5}>
              <p className="mb-3">We offer a 30-day return policy from the date of delivery. To be eligible for a return, items must be:</p>
              <ul className="space-y-2">
                {[
                  'Unused and in the original packaging.',
                  'Returned within 30 days of delivery.',
                  'Accompanied by proof of purchase.',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-3">Refunds are processed within 5-7 business days after we receive the returned item. Shipping costs for returns are the responsibility of the customer unless the item is defective or incorrect. Custom or personalized items are non-returnable unless defective.</p>
            </Section>

            <Section title="7. Seller Responsibilities" index={6}>
              <p>Third-party sellers on our platform are solely responsible for the accuracy and legality of their product listings, including descriptions, images, pricing, and compliance with applicable laws. LuxeShop acts as a facilitator and is not a party to the transaction between buyers and sellers. Disputes between buyers and sellers should be resolved directly, though we may assist in mediation when possible.</p>
            </Section>

            <Section title="8. User Responsibilities" index={7}>
              <p className="mb-3">As a user of LuxeShop, you agree not to:</p>
              <ul className="space-y-2">
                {[
                  'Use the site for any unlawful purpose or in violation of these terms.',
                  'Attempt to gain unauthorized access to any part of the platform.',
                  'Upload or transmit viruses, malware, or any harmful code.',
                  'Interfere with the proper functioning of the site or its associated services.',
                  'Impersonate any person or entity or misrepresent your affiliation.',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-3">Violation of these responsibilities may result in immediate account termination.</p>
            </Section>

            <Section title="9. Intellectual Property" index={8}>
              <p>All content on LuxeShop — including text, graphics, logos, images, software, and the overall design — is the intellectual property of LuxeShop or its licensors and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.</p>
            </Section>

            <Section title="10. Limitation of Liability" index={9}>
              <p>LuxeShop shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. This includes, but is not limited to, loss of profits, data, or other intangible losses, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount paid by you for the product giving rise to the claim.</p>
            </Section>

            <Section title="11. Contact Information" index={10}>
              <p>If you have any questions regarding these terms, please contact us at <a href="mailto:hello@luxeshop.com" className="text-orange-500 hover:underline font-medium">hello@luxeshop.com</a> or write to us at: LuxeShop, 123 Commerce Street, New York, NY 10001, United States.</p>
            </Section>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 70, damping: 13, delay: 0.3 }}
            className="mt-12 p-6 md:p-8 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800 text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-stone-500 mb-4"
            >
              Have questions about our terms?
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/contact" className="btn-secondary">Contact Us</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/products" className="btn-primary">Back to Shopping</Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
