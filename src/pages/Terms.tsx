import React from "react";
import { Helmet } from "react-helmet-async";
import AdSense from "../components/AdSense";

const Terms: React.FC = () => (
  <>
    <Helmet>
      <title>Terms of Service | Daichiure Gaming Platform</title>
      <meta
        name="description"
        content="Read Daichiure's terms of service covering user agreements, gaming rules, rewards program, and platform usage guidelines."
      />
    </Helmet>

    <div className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-amber-400">
          Terms of Service
        </h1>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
          <p className="text-gray-300 text-sm">
            <strong>Last Updated:</strong> July 30, 2025
            <br />
            <strong>Effective Date:</strong> July 30, 2025
          </p>
        </div>

        {/* AdSense Banner */}
        <div className="mb-8 flex justify-center">
          <AdSense
            adSlot="1234567890"
            adFormat="auto"
            style={{ minHeight: "250px" }}
            className="max-w-4xl w-full"
          />
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Welcome to Daichiure ("we," "our," or "us"). These Terms of
              Service ("Terms") govern your use of our website located at
              www.daichiure.live and our gaming platform services (collectively,
              the "Service").
            </p>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using our Service, you agree to be bound by these
              Terms. If you disagree with any part of these terms, then you may
              not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              2. Eligibility
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>You must be at least 13 years old to use our Service</li>
              <li>Users under 18 must have parental consent</li>
              <li>
                You must provide accurate and complete information during
                registration
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account
              </li>
              <li>One account per person is allowed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              3. Service Description
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Daichiure is an online gaming platform that offers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Free-to-play HTML5 browser games</li>
              <li>Premium games and features through subscription</li>
              <li>Coin-based reward system for gameplay</li>
              <li>Referral program for earning additional rewards</li>
              <li>User profiles and game statistics tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              4. User Accounts and Security
            </h2>
            <h3 className="text-xl font-medium mb-3 text-amber-200">
              4.1 Account Creation
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>
                You must provide a valid email address and create a secure
                password
              </li>
              <li>Account verification via email is required</li>
              <li>You are responsible for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              4.2 Account Security
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Keep your login credentials confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>
                We are not liable for losses due to unauthorized account use
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              5. Gaming Rules and Conduct
            </h2>
            <h3 className="text-xl font-medium mb-3 text-amber-200">
              5.1 Acceptable Use
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>
                Use the Service for personal, non-commercial purposes only
              </li>
              <li>Play games fairly without cheating or exploiting bugs</li>
              <li>Respect other users and maintain appropriate conduct</li>
              <li>Do not attempt to hack, disrupt, or damage the platform</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              5.2 Prohibited Activities
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Creating multiple accounts to abuse rewards systems</li>
              <li>Using bots, scripts, or automated tools</li>
              <li>Attempting to manipulate game scores or coin balances</li>
              <li>Sharing or selling account credentials</li>
              <li>Violating intellectual property rights</li>
              <li>Harassment, spam, or abusive behavior</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              6. Rewards and Coins System
            </h2>
            <h3 className="text-xl font-medium mb-3 text-amber-200">
              6.1 Earning Coins
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Coins are earned through legitimate gameplay</li>
              <li>Bonus coins available through referral program</li>
              <li>Daily login rewards and special promotions</li>
              <li>Coin values and earning rates may change without notice</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              6.2 Referral Program
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>Earn coins by referring new users to the platform</li>
              <li>Referrals must be genuine and not artificially generated</li>
              <li>
                Abuse of the referral system may result in account suspension
              </li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              6.3 Coin Redemption
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Coins have no real-world monetary value</li>
              <li>Coins cannot be transferred between accounts</li>
              <li>
                We reserve the right to adjust coin balances for violations
              </li>
              <li>
                Coins may expire if account is inactive for extended periods
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              7. Premium Subscriptions
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Premium subscriptions provide access to exclusive games and
                features
              </li>
              <li>
                Subscriptions are billed through Stripe payment processing
              </li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are subject to our refund policy</li>
              <li>Premium benefits are non-transferable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              8. Intellectual Property
            </h2>
            <h3 className="text-xl font-medium mb-3 text-amber-200">
              8.1 Our Content
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              All content on the Service, including games, graphics, text,
              logos, and software, is owned by Daichiure or our licensors and is
              protected by copyright and other intellectual property laws.
            </p>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              8.2 Limited License
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to
              access and use the Service for personal, non-commercial purposes
              in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              9. Privacy and Data Protection
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Your privacy is important to us. Our collection and use of
              personal information is governed by our Privacy Policy, which is
              incorporated into these Terms by reference. Please review our
              Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              10. Disclaimers and Limitations
            </h2>
            <h3 className="text-xl font-medium mb-3 text-amber-200">
              10.1 Service Availability
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
              <li>The Service is provided "as is" without warranties</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>
                Maintenance and updates may temporarily affect availability
              </li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              10.2 Limitation of Liability
            </h3>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Daichiure shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including without limitation, loss of profits,
              data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              11. Termination
            </h2>
            <h3 className="text-xl font-medium mb-3 text-amber-200">
              11.1 Termination by You
            </h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may terminate your account at any time by contacting our
              support team or using the account deletion feature.
            </p>

            <h3 className="text-xl font-medium mb-3 text-amber-200">
              11.2 Termination by Us
            </h3>
            <p className="text-gray-300 leading-relaxed">
              We may terminate or suspend your account immediately, without
              prior notice, for conduct that we believe violates these Terms or
              is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              12. Changes to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify users of any changes by posting the new Terms on this page
              and updating the "Last Updated" date. Your continued use of the
              Service after any changes indicates your acceptance of the new
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              13. Governing Law
            </h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction where Daichiure operates, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-amber-300">
              14. Contact Information
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-gray-300">
                <strong>Email:</strong> support@daichiure.live
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

export default Terms;
