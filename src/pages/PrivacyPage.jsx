import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';

function Section({ title, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className={`relative pl-6 border-l-2 border-stone-200 dark:border-stone-800 transition-opacity duration-300 ${isInView ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-teal-500 origin-top transition-transform duration-500 ${isInView ? 'scale-y-100' : 'scale-y-0'}`}
      />
      <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | LuxeShop';
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mb-12">
            Last updated: June 2025
          </p>

          <div className="space-y-10 text-stone-600 dark:text-stone-300 leading-relaxed">
            <Section title="Introduction" index={0}>
              <p>LuxeShop (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read this policy carefully. By using our platform, you consent to the practices described herein.</p>
            </Section>

            <Section title="Information We Collect" index={1}>
              <p className="mb-3">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
              <ul className="space-y-2">
                {[
                  'Full name and email address',
                  'Shipping and billing address',
                  'Phone number',
                  'Payment information (processed securely by third-party gateways)',
                  'Account preferences and communication settings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="How We Use Your Information" index={2}>
              <ul className="space-y-2">
                {[
                  'To process and fulfill your orders, including order confirmation, shipping updates, and delivery tracking.',
                  'To communicate with you about your account, transactions, or customer support inquiries.',
                  'To personalize and improve your shopping experience on our platform.',
                  'To send you promotional emails and offers (only if you have opted in to receive them).',
                  'To detect and prevent fraudulent or unauthorized activity.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Cookies" index={3}>
              <p>We use browser cookies, local storage, and similar tracking technologies to enhance your browsing experience. Cookies help us remember your preferences, keep track of items in your cart, and understand how you interact with our site. You can control cookie settings through your browser preferences, but disabling cookies may affect certain features of the website.</p>
            </Section>

            <Section title="Third-Party Services" index={4}>
              <p>We may share your information with trusted third-party service providers who assist us in operating our website, processing payments, shipping orders, and analyzing site traffic. These service providers are contractually obligated to keep your information confidential and secure. We do not sell, trade, or rent your personal information to third parties for their marketing purposes.</p>
            </Section>

            <Section title="Data Security" index={5}>
              <p>We implement a variety of security measures to maintain the safety of your personal information. All sensitive information, including payment data, is transmitted via Secure Socket Layer (SSL) technology and encrypted. We follow industry best practices to protect against unauthorized access, alteration, disclosure, or destruction of your data.</p>
            </Section>

            <Section title="Your Rights" index={6}>
              <p className="mb-3">You have the following rights regarding your personal information:</p>
              <ul className="space-y-2">
                {[
                  { label: 'Access:', desc: 'Request a copy of the personal data we hold about you.' },
                  { label: 'Update:', desc: 'Correct any inaccurate or incomplete information through your account settings.' },
                  { label: 'Delete:', desc: 'Request deletion of your account and associated data.' },
                  { label: 'Object:', desc: 'Opt out of marketing communications at any time.' },
                  { label: 'Portability:', desc: 'Request a machine-readable copy of your data.' },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0" />
                    <span><strong>{label}</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Account Information" index={7}>
              <p>You can review, update, or delete your account information at any time by logging into your profile settings. If you choose to delete your account, we will retain certain information as required by law or for legitimate business purposes, such as order records and transaction history. You can manage your email preferences and opt out of promotional communications through your account settings.</p>
            </Section>

            <Section title="Contact Us" index={8}>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at <a href="mailto:hello@luxeshop.com" className="text-orange-500 hover:underline font-medium">hello@luxeshop.com</a>. We aim to respond to all inquiries within 48 hours.</p>
            </Section>
          </div>

          <div className="mt-12 p-6 md:p-8 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800 text-center">
            <p className="text-stone-500 mb-4">
              Your privacy is important to us.
            </p>
            <Link to="/products" className="btn-primary inline-flex">Back to Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
