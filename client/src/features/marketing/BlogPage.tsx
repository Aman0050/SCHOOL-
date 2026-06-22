import React, { useEffect } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';

const featuredPost = {
  title: 'Introducing EduXeno Platform 2.0',
  excerpt: 'The biggest update to our operating system yet. Featuring an entirely new parent portal, advanced AI analytics, and a redesigned teacher dashboard.',
  category: 'Product Updates',
  author: 'Sarah Jenkins',
  date: 'Oct 12, 2026',
  imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
};

const posts = [
  {
    title: 'How top districts are improving parent engagement by 300%',
    excerpt: 'Discover the communication strategies and tools being used by the most successful school districts in the country.',
    category: 'Case Study',
    author: 'David Chen',
    date: 'Oct 05, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'The Future of AI in Academic Grading',
    excerpt: 'How machine learning is helping teachers reclaim 10 hours a week by automating routine grading tasks.',
    category: 'Education Trends',
    author: 'Dr. Michael Roberts',
    date: 'Sep 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Securing Student Data in a Cloud-First World',
    excerpt: 'A comprehensive guide to FERPA and COPPA compliance when moving your school operations to the cloud.',
    category: 'Security',
    author: 'Elena Rodriguez',
    date: 'Sep 15, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export const BlogPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">The EduXeno Blog</h1>
              <p className="text-xl text-slate-500">Insights, updates, and stories from the future of education.</p>
            </div>
            <div className="w-full md:w-80 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-16">
            {['All', 'Product Updates', 'Education Trends', 'Case Study', 'Security', 'Engineering'].map((cat, i) => (
              <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 group cursor-pointer"
          >
            <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] shadow-2xl">
              <img src={featuredPost.imageUrl} alt="Featured" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider mb-4">
                  {featuredPost.category}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:underline decoration-indigo-400 decoration-4 underline-offset-4">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-300 text-lg mb-6 line-clamp-2">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> {featuredPost.author}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all overflow-hidden group cursor-pointer flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 mb-6 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-400 pt-4 border-t border-slate-100 mt-auto">
                    <span>{post.date}</span>
                    <span className="text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="px-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm">
              Load More Articles
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
