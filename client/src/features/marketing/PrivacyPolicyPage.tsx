import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-slate-500 font-medium">Last updated: October 1, 2026</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline">
            <p>
              At EduXeno ("we", "our", or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our school operating system platform.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us when you register for an account, update your profile, or use our platform. This includes:</p>
            <ul>
              <li><strong>Personal Identification Information:</strong> Names, email addresses, phone numbers, and physical addresses.</li>
              <li><strong>Educational Data:</strong> Student records, grades, attendance data, and behavioral records (in strict compliance with FERPA).</li>
              <li><strong>Financial Information:</strong> Payment details when processing school fees (processed securely via Stripe; we do not store full credit card numbers).</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for various purposes, including:</p>
            <ul>
              <li>Providing, maintaining, and improving our services.</li>
              <li>Processing transactions and sending related information, including confirmations and receipts.</li>
              <li>Sending technical notices, updates, security alerts, and administrative messages.</li>
              <li>Responding to your comments, questions, and customer service requests.</li>
            </ul>

            <h2>3. Data Security and Compliance</h2>
            <p>
              We implement industry-standard security measures, including AES-256 encryption at rest and TLS 1.3 in transit, to protect your personal information. We are fully compliant with the Family Educational Rights and Privacy Act (FERPA), the Children's Online Privacy Protection Act (COPPA), and the General Data Protection Regulation (GDPR).
            </p>

            <h2>4. Sharing of Information</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We may share information with trusted third-party service providers (e.g., AWS for hosting, Stripe for payments) who assist us in operating our platform, provided they agree to maintain the confidentiality and security of this information.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Officer at: <br/>
              <a href="mailto:privacy@eduxeno.com">privacy@eduxeno.com</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
