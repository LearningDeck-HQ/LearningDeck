"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, BookOpen, ShieldCheck, Activity, Layers } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPageContent = () => {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [source]);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      {/* Hero Section */}
      <header className="pt-32 pb-16 px-6 bg-gradient-to-b from-white via-sky-50 to-sky-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[12px] text-gray-600"></span>
          </div>
          <h1 className="text-[40px] md:text-[56px] font-medium leading-[1.2] tracking-tight mb-6 text-gray-900">
            The intelligent deck for <br />
            <span className="text-blue-600">modern education.</span>
          </h1>
          <p className="text-[16px] text-gray-500 max-w-[600px] mx-auto mb-10 leading-relaxed">
            A unified platform for seamless e-learning delivery and professional-grade exam management. Built for students, perfected for educators.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!isLoading && isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto h-[44px] px-8 bg-blue-600 text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                Continue to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href={`/signup${source ? `?source=${source}` : ''}`} className="w-full sm:w-auto h-[44px] px-6 bg-blue-600 text-white text-[14px] font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  Start Free Trial
                </Link>
                <button className="w-full sm:w-auto h-[44px] px-6 bg-white text-gray-700 border border-gray-300 text-[14px] font-medium rounded-md hover:bg-gray-50 transition-colors">
                  Contact Sales
                </button>
              </>
            )}
          </div>

          {/* PLACEHOLDER: Animated Desktop Exam Manager UI (Start Server/Status) */}
          <div className="h-full w-full border border-zinc-400/20 rounded ">
            <Image src="/dashboard.JPG" className='object-cover h-full w-full' alt="" width={1920} height={1080} />
          </div>
        </div>
      </header>

      {/* Dual Solutions Section */}
      <section id="solutions" className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* E-Learning Card */}
            <div className="p-8 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 border border-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-[20px] mb-3 text-gray-900">E-Learning Experience</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-[15px]">
                Provide students with a rich, interactive learning environment. Support for multimedia content, real-time discussions, and progress tracking.
              </p>
              <ul className="space-y-3 mb-8 text-[14px] text-gray-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Dynamic Course Content</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Interactive Quizzes</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Student Achievement Badges</li>
              </ul>
              <button className="text-blue-600 font-medium text-[14px] flex items-center gap-1 hover:gap-2 transition-all">
                Explore LearningDeck <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Exam Manager Card */}
            <div className="p-8 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-lg flex items-center justify-center mb-6 border border-gray-200">
                <ShieldCheck className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="text-[20px] mb-3 text-gray-900">Hybrid Exam Manager</h3>
              <p className="text-gray-500 mb-6 leading-relaxed text-[15px]">
                Secure, robust, and scalable examination infrastructure. From auto-grading to proctoring, manage it all from one dashboard.
              </p>
              <ul className="space-y-3 mb-8 text-[14px] text-gray-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Automated Result Processing</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> AI-Powered Proctoring</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Custom Certificate Generation</li>
              </ul>
              <button className="text-blue-600 font-medium text-[14px] flex items-center gap-1 hover:gap-2 transition-all">
                View Admin Suite <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Feature Section */}
      <section className="py-24 px-6 bg-[#F8F9FA] border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-[32px] leading-tight mb-6 text-gray-900">
                Centralized control for <br /> institution-wide management.
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="mt-1"><Activity className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h4 className="text-[16px] font-medium text-gray-900 mb-1">Real-time Analytics</h4>
                    <p className="text-[14px] text-gray-500 leading-relaxed">Monitor student engagement and exam performance as it happens with live telemetry.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><Layers className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h4 className="text-[16px] font-medium text-gray-900 mb-1">Resource Library</h4>
                    <p className="text-[14px] text-gray-500 leading-relaxed">Organize assets, question banks, and media in a structured, searchable cloud repository.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PLACEHOLDER: Animated Dashboard UI */}
            <div className="lg:w-1/2 w-full border border-zinc-400/20 rounded ">
              <Image src="/dashboard.JPG" className='object-cover h-full w-full' alt="" width={1920} height={1080} />

            </div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-[32px] text-gray-900 mb-1">99.9%</div>
              <div className="text-[13px] text-gray-500 uppercase tracking-wider">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] text-gray-900 mb-1">500k+</div>
              <div className="text-[13px] text-gray-500 uppercase tracking-wider">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] text-gray-900 mb-1">120+</div>
              <div className="text-[13px] text-gray-500 uppercase tracking-wider">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] text-gray-900 mb-1">Secure</div>
              <div className="text-[13px] text-gray-500 uppercase tracking-wider">AES-256 Encryption</div>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

const LandingPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
};

export default LandingPage;