import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export const CookiePolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Cookie Policy</h1>
            <p className="text-slate-500 font-medium">Last updated: October 1, 2026</p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline">
            <p>
              This Cookie Policy explains how EduXeno ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website and use our platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2>1. What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>

            <h2>2. Why do we use cookies?</h2>
            <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our platform.</p>

            <h2>3. Types of Cookies We Use</h2>
            <ul>
              <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our platform functions.</li>
              <li><strong>Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our platform but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.</li>
              <li><strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our platform is being used or how effective our marketing campaigns are, or to help us customize our platform for you.</li>
            </ul>

            <h2>4. How can I control cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.
            </p>

            <h2>5. Updates to this Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
