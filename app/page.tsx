import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, BookOpen, ShieldCheck, BarChart3, Users } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#E9EDF7] font-sans text-[#1B2559] selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E0E5F2] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
              alt="LearningDeck Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-[20px] font-bold tracking-tight">LearningDeck</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#A3AED0]">
            <Link href="#features" className="hover:text-[#1B2559] transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-[#1B2559] transition-colors">Solutions</Link>
            <Link href="#enterprise" className="hover:text-[#1B2559] transition-colors">Enterprise</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-bold px-4 py-2 hover:opacity-70 transition-opacity">
              Log In
            </Link>
            <Link href="/signup" className="bg-[#1B2559] text-white text-[14px] font-bold px-5 py-2.5 rounded-[10px]  shadow-blue-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#E0E5F2] mb-6 ">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#A3AED0]">Version 2.0 Now Live</span>
          </div>
          <h1 className="text-[48px] md:text-[72px] font-extrabold leading-[1.1] tracking-tight mb-6">
            The intelligent deck for <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">modern education.</span>
          </h1>
          <p className="text-[18px] text-[#A3AED0] max-w-[600px] mx-auto mb-10 leading-relaxed">
            A unified platform for seamless e-learning delivery and professional-grade exam management. Built for students, perfected for educators.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto h-[56px] px-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-[14px] shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group">
              Start Free Trial <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto h-[56px] px-8 bg-white text-[#1B2559] border border-[#E0E5F2] font-bold rounded-[14px] hover:bg-gray-50 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Preview Section (Based on your mention of the screenshot) */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto relative">
        </div>
      </section>

      {/* Dual Solutions Section */}
      <section id="solutions" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* E-Learning Card */}
            <div className="p-10 bg-[#F4F7FF] rounded-[32px] border border-[#E0E5F2] hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-white rounded-[16px] flex items-center justify-center mb-6  group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-[24px] font-bold mb-4">E-Learning Experience</h3>
              <p className="text-[#A3AED0] mb-8 leading-relaxed">
                Provide students with a rich, interactive learning environment. Support for multimedia content, real-time discussions, and progress tracking.
              </p>
              <ul className="space-y-3 mb-10 text-[14px] font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Dynamic Course Content</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Interactive Quizzes</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Student Achievement Badges</li>
              </ul>
              <button className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Explore LearningDeck <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Exam Manager Card */}
            <div className="p-10 bg-[#1B2559] text-white rounded-[32px] border border-white/10 hover:shadow-2xl transition-all group">
              <div className="w-14 h-14 bg-white/10 rounded-[16px] flex items-center justify-center mb-6  group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-[24px] font-bold mb-4 text-white">Exam Manager Pro</h3>
              <p className="text-[#A3AED0] mb-8 leading-relaxed">
                Secure, robust, and scalable examination infrastructure. From auto-grading to proctoring, manage it all from one dashboard.
              </p>
              <ul className="space-y-3 mb-10 text-[14px] font-medium text-white/80">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Automated Result Processing</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> AI-Powered Proctoring</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Custom Certificate Generation</li>
              </ul>
              <button className="text-blue-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                View Admin Suite <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[#E0E5F2]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <Image src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4" alt="LearningDeck Logo" width={32} height={32} className="rounded-full" />
              <span className="text-[20px] font-bold">LearningDeck</span>
            </div>
            <p className="text-[#A3AED0] text-[14px] leading-relaxed">
              Standardizing the future of digital education and examination management across the globe.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[14px]">
            <div className="space-y-4">
              <p className="font-bold uppercase tracking-widest text-[#1B2559]">Product</p>
              <ul className="space-y-2 text-[#A3AED0]">
                <li><Link href="#">Features</Link></li>
                <li><Link href="#">Integrations</Link></li>
                <li><Link href="#">Enterprise</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold uppercase tracking-widest text-[#1B2559]">Support</p>
              <ul className="space-y-2 text-[#A3AED0]">
                <li><Link href="#">Help Center</Link></li>
                <li><Link href="#">API Docs</Link></li>
                <li><Link href="#">Status</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold uppercase tracking-widest text-[#1B2559]">Company</p>
              <ul className="space-y-2 text-[#A3AED0]">
                <li><Link href="#">About Us</Link></li>
                <li><Link href="#">Privacy</Link></li>
                <li><Link href="#">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#E0E5F2] text-center text-[12px] font-bold text-[#A3AED0] uppercase tracking-[2px]">
          © 2026 LearningDeck Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;