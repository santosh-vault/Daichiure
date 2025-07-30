import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Clock, MessageCircle, Phone, MapPin, Send } from "lucide-react";

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsLoading(false);
    // Here you would handle sending the message to your backend or email service
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Daichiure Gaming Platform</title>
        <meta
          name="description"
          content="Get in touch with Daichiure support team. We're here to help with any questions about games, rewards, account issues, or technical support."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-amber-400">
              Contact Our Support Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions, feedback, or need assistance? We're here to help!
              Our dedicated support team is ready to assist you with any
              inquiries.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-amber-300 mb-6">
                  Get In Touch
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-amber-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-200">
                        Email Support
                      </h3>
                      <p className="text-gray-400 text-sm">
                        support@daichiure.live
                      </p>
                      <p className="text-gray-500 text-xs">
                        Primary support channel
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-amber-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-200">
                        Response Time
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Within 24-48 hours
                      </p>
                      <p className="text-gray-500 text-xs">
                        Monday to Friday, 9 AM - 6 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-amber-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-200">Live Chat</h3>
                      <p className="text-gray-400 text-sm">Coming Soon</p>
                      <p className="text-gray-500 text-xs">
                        Real-time support for urgent issues
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-300 mb-4">
                  Quick Help
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-200 text-sm">
                      Account Issues
                    </h4>
                    <p className="text-gray-400 text-xs">
                      Login problems, password reset, profile settings
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 text-sm">
                      Game Support
                    </h4>
                    <p className="text-gray-400 text-xs">
                      Game bugs, loading issues, performance problems
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 text-sm">
                      Rewards & Coins
                    </h4>
                    <p className="text-gray-400 text-xs">
                      Coin balance, referrals, reward redemption
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 text-sm">
                      Premium Support
                    </h4>
                    <p className="text-gray-400 text-xs">
                      Subscription issues, billing questions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-amber-300 mb-6">
                  Send Us a Message
                </h2>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                      <Send className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-400 mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Thank you for contacting us! We've received your message
                      and will get back to you within 24-48 hours.
                    </p>
                    <button
                      onClick={resetForm}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block mb-2 font-semibold text-gray-200"
                          htmlFor="name"
                        >
                          Full Name *
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div>
                        <label
                          className="block mb-2 font-semibold text-gray-200"
                          htmlFor="email"
                        >
                          Email Address *
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                          type="email"
                          id="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block mb-2 font-semibold text-gray-200"
                          htmlFor="category"
                        >
                          Category *
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                          id="category"
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                        >
                          <option value="general">General Inquiry</option>
                          <option value="account">Account Support</option>
                          <option value="games">Game Issues</option>
                          <option value="rewards">Rewards & Coins</option>
                          <option value="premium">Premium Subscription</option>
                          <option value="technical">Technical Support</option>
                          <option value="feedback">
                            Feedback & Suggestions
                          </option>
                          <option value="bug">Bug Report</option>
                        </select>
                      </div>

                      <div>
                        <label
                          className="block mb-2 font-semibold text-gray-200"
                          htmlFor="subject"
                        >
                          Subject *
                        </label>
                        <input
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                          type="text"
                          id="subject"
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          placeholder="Brief description of your inquiry"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="block mb-2 font-semibold text-gray-200"
                        htmlFor="message"
                      >
                        Message *
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                        id="message"
                        name="message"
                        rows={6}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Please provide detailed information about your inquiry, including any error messages, game names, or specific issues you're experiencing..."
                        required
                      />
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 text-sm">
                        <strong>💡 Tip:</strong> For faster support, please
                        include:
                      </p>
                      <ul className="text-gray-400 text-xs mt-2 space-y-1">
                        <li>• Your username or registered email</li>
                        <li>• Browser type and version (if technical issue)</li>
                        <li>• Specific game name (if game-related)</li>
                        <li>• Screenshots of error messages (if applicable)</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-amber-300 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">
                    How do I reset my password?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Visit the login page and click "Forgot Password". You'll
                    receive a reset link via email.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">
                    Why aren't my coins updating?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Coin updates may take a few minutes. If the issue persists,
                    please contact support with your username.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">
                    How does the referral program work?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Share your unique referral code with friends. You'll earn
                    bonus coins when they register and start playing.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">
                    Games won't load properly
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Try clearing your browser cache or switching to a different
                    browser. Contact support if issues persist.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">
                    How do I cancel my premium subscription?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    You can manage your subscription in your account settings or
                    contact support for assistance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-200 mb-2">
                    Is my personal information secure?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Yes! We use industry-standard encryption and security
                    measures. Read our Privacy Policy for details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
