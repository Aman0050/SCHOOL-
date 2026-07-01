import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export const TermsOfServicePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-slate-500 font-medium">Last updated: October 1, 2026</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <p>
              Welcome to EduXeno. These Terms of Service ("Terms") govern your access to and use of the EduXeno platform, website, and associated services (collectively, the "Services"). Please read these Terms carefully before using our Services.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you are using the Services on behalf of a school, district, or educational institution, you represent that you have the authority to bind that entity to these Terms.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              EduXeno provides a cloud-based school operating system that includes student information management, learning management tools, communication portals, and administrative analytics. We reserve the right to modify, suspend, or discontinue any part of the Services at any time.
            </p>

            <h2>3. User Responsibilities and Accounts</h2>
            <p>To use certain features of the Services, you must register for an account. You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain the security and confidentiality of your password and API keys.</li>
              <li>Promptly notify us of any unauthorized access or use of your account.</li>
              <li>Comply with all applicable local, state, national, and international laws, particularly those regarding data privacy and student records (e.g., FERPA).</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Services, including but not least to text, graphics, logos, and software, are the exclusive property of EduXeno and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Services without our express written consent.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, EduXeno shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or related to your use of the Services. Our total liability for any claims under these Terms is limited to the amount you paid us for the Services in the 12 months preceding the claim.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
