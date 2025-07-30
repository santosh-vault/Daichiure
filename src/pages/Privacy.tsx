import React from "react";
import { Helmet } from "react-helmet-async";

const Privacy: React.FC = () => (
  <>
    <Helmet>
      <title>Privacy Policy | Daichiure Gaming Platform</title>
      <meta
        name="description"
        content="Read Daichiure's comprehensive privacy policy covering data collection, usage, and protection practices for our gaming platform and reward system."
      />
    </Helmet>

    <div className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-amber-400">
          Privacy Policy
        </h1>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
          <p className="text-gray-300 text-sm">
            <strong>Last Updated:</strong> July 30, 2025
            <br />
            <strong>Effective Date:</strong> July 30, 2025
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              1. Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Welcome to Daichiure ("we," "our," or "us"). We are committed to
              protecting your privacy and ensuring the security of your personal
              information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our
              website www.daichiure.live and use our gaming platform services.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By using our services, you consent to the collection and use of
              information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              2.1 Personal Information
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Email address (for account creation and authentication)</li>
              <li>Full name (for account personalization)</li>
              <li>Profile information (avatar, preferences)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Communication data (support messages, feedback)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (games played, time spent, scores achieved)</li>
              <li>IP address and location data (for security and analytics)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              2.3 Gaming and Rewards Data
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Game performance and statistics</li>
              <li>Coin balances and transaction history</li>
              <li>Referral codes and referral activities</li>
              <li>Premium subscription status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Provide and maintain our gaming services</li>
              <li>Process account registration and authentication</li>
              <li>Manage coin rewards and referral programs</li>
              <li>Process premium subscriptions and payments</li>
              <li>Personalize your gaming experience</li>
              <li>Send important notifications about your account</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our platform through analytics and feedback</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                services (Supabase for authentication, Stripe for payments,
                Google Analytics for insights)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights and users' safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with any
                merger, sale, or acquisition of our company
              </li>
              <li>
                <strong>Consent:</strong> With your explicit consent for
                specific purposes
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              5. Data Security
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your
              personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure authentication through Supabase</li>
              <li>PCI DSS compliant payment processing via Stripe</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and employee training</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              6. Your Rights and Choices
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <strong>Access:</strong> Request copies of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your account and
                data
              </li>
              <li>
                <strong>Portability:</strong> Export your data in a readable
                format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, please contact us at
              privacy@daichiure.live
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              7. Cookies and Tracking
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your
              experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <strong>Essential Cookies:</strong> Required for authentication
                and basic functionality
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Google Analytics to
                understand user behavior
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Google AdSense for
                relevant advertisements
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              8. Children's Privacy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 13 years of age.
              We do not knowingly collect personal information from children
              under 13. If you are a parent or guardian and believe your child
              has provided us with personal information, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              9. International Users
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are hosted and operated from various locations. By
              using our services, you consent to the transfer and processing of
              your information in countries that may have different privacy laws
              than your country of residence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date. We encourage you
              to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              11. Contact Us
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-300">
                <strong>Email:</strong> privacy@daichiure.live
                <br />
                <strong>Website:</strong> www.daichiure.live
                <br />
                <strong>Response Time:</strong> We aim to respond within 48
                hours
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </>
);

export default Privacy;
