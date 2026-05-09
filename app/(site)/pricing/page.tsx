"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Check, Globe, HardDrive, Zap, Layout, Shield, Cpu, Terminal, ArrowRight, Sparkles } from 'lucide-react';

const cloudTiers = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for evaluation and small testing environments.',
    features: [
      'Up to 25 students',
      '1 teacher',
      '2 active exams',
      'Basic templates',
      'Watermarked exports',
      'Local CBT deployment',
      '5 AI requests/day',
      '30-day result history',
    ],
    badge: 'Evaluation',
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '₦99,000',
    period: '/ year',
    description: 'For tutors, coaching centers, and small schools.',
    features: [
      'Unlimited exams',
      'Unlimited students',
      'Up to 5 teachers',
      'Premium templates',
      'Custom branding',
      'Higher AI limits',
      'Offline deployment',
      'Email & WhatsApp support',
      'Plugin access',
      'Hybrid online/offline workflow',
    ],
    badge: 'Most popular',
    featured: true,
    cta: 'Choose Professional',
  },
  {
    name: 'School',
    price: 'From ₦250,000',
    period: '/ year',
    description: 'For institutions and large schools requiring advanced management.',
    features: [
      'Multi-teacher collaboration',
      'Advanced workspace management',
      'School branding',
      'Priority onboarding',
      'Plugin integrations',
      'Audit logs',
      'Advanced permissions',
      'Large-scale deployment support',
      'Higher AI allocation',
      'Premium support',
      'Real-time synchronization',
    ],
    badge: 'Enterprise-ready',
    cta: 'Contact Sales',
  },
];

const offlineTiers = [
  {
    name: 'Offline Starter',
    price: '₦100,000',
    period: 'One-Time License',
    description: 'Offline-First CBT Infrastructure built for stability and internet-independence.',
    features: [
      'Up to 200 students',
      'Unlimited exams',
      '1 local workspace',
      'Local result management',
      'Basic templates & themes',
      'Lifetime software usage',
      'Local network exam broadcasting',
      'Student login system',
      'Offline desktop application',
      'LAN-based environment',
      'Fast local performance',
    ],
    badge: 'One-Time License',
    featured: true,
    cta: 'Purchase License',
  }
];

const offlineAddons = [
  { item: 'Extra 100 Students', price: '₦5,000' },
  { item: 'Premium Templates', price: 'From ₦10,000' },
  { item: 'Custom Plugins', price: 'Custom Pricing' },
  { item: 'Deployment Assistance', price: 'Custom Pricing' },
  { item: 'School Branding', price: 'From ₦15,000' },
  { item: 'On-site Installation', price: 'Custom Pricing' },
];

const cloudAddons = [
  { item: 'Cloud Exam Hosting', price: 'From ₦50,000/year' },
  { item: 'AI Credit Expansion', price: 'Custom Pricing' },
  { item: 'Custom Domain', price: 'From ₦20,000/year' },
  { item: 'Advanced Analytics', price: 'Custom Pricing' },
  { item: 'Enterprise Plugin Development', price: 'Custom Pricing' },
  { item: 'White-label Deployment', price: 'Custom Pricing' },
];

const faqs = [
  {
    question: 'Does LearningDeck work without internet?',
    answer: 'Yes. LearningDeck Offline works completely without internet, while LearningDeck Cloud allows schools to deploy exams locally after syncing online.',
  },
  {
    question: 'Can schools use their own branding?',
    answer: 'Yes. Schools can add their logos, themes, and custom branding depending on their plan.',
  },
  {
    question: 'Do students need internet during exams?',
    answer: 'No. Exams can run entirely over a local network (LAN) without any internet connectivity.',
  },
  {
    question: 'Is there a free version?',
    answer: 'Yes. LearningDeck Cloud includes a free Starter plan for evaluation and small testing environments.',
  },
  {
    question: 'Can LearningDeck be customized?',
    answer: 'Yes. Schools can request custom plugins, templates, integrations, and deployment configurations.',
  },
];

const benefits = [
  { title: 'Offline-first examination infrastructure', icon: HardDrive },
  { title: 'Designed for African internet realities', icon: Globe },
  { title: 'Local network examination delivery', icon: Terminal },
  { title: 'Fast exam deployment', icon: Zap },
  { title: 'Hybrid online/offline workflow', icon: Layout },
  { title: 'AI-native assessment creation', icon: Cpu },
  { title: 'Customizable templates & plugins', icon: Sparkles },
  { title: 'Enterprise-ready architecture', icon: Shield },
];

const PricingPage = () => {
  const [billingType, setBillingType] = useState<'cloud' | 'offline'>('cloud');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <div className="max-w-7xl mx-auto px-6 py-16 pt-24">
        <div className="text-center mx-auto max-w-3xl">
          <h1 className="text-4xl sm:text-5xl tracking-tight text-slate-900 mb-6 font-medium">
            Hybrid CBT Infrastructure
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-8">
            For Schools, CBT Centers, and Educators. Choose between our cloud-managed hybrid platform or our completely offline-first infrastructure.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="relative flex w-64 items-center rounded bg-slate-200 p-1">
              <button
                onClick={() => setBillingType('cloud')}
                className={`${billingType === 'cloud' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  } relative w-1/2 rounded py-2 text-sm font-medium transition-all`}
              >
                Cloud Hybrid
              </button>
              <button
                onClick={() => setBillingType('offline')}
                className={`${billingType === 'offline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  } relative w-1/2 rounded py-2 text-sm font-medium transition-all`}
              >
                Offline-First
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          {billingType === 'cloud' ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {cloudTiers.map((tier) => (
                <div key={tier.name} className={`flex flex-col rounded border ${tier.featured ? 'border-blue-200 bg-white ring-1 ring-blue-100' : 'border-slate-200 bg-white'} p-8 transition-all hover:shadow`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs  uppercase tracking-[.15em] text-blue-600">{tier.badge}</p>
                      <h2 className="mt-2 text-2xl  text-slate-900">{tier.name}</h2>
                    </div>
                    {tier.featured && (
                      <div className="rounded bg-blue-600/10 px-3 py-1 text-xs font-medium text-blue-600">Popular</div>
                    )}
                  </div>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl  tracking-tight text-slate-900">{tier.price}</span>
                    <span className="text-sm font-medium text-slate-500">{tier.period}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>
                  <div className="mt-8 flex-1 space-y-4">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <span className="mt-1 text-blue-600"><Check className="w-4 h-4" /></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" className={`mt-10 inline-flex w-full items-center justify-center rounded px-4 py-3 text-sm  transition-all ${tier.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              {offlineTiers.map((tier) => (
                <div key={tier.name} className="flex flex-col max-w-lg w-full rounded border border-blue-200 bg-white ring-1 ring-blue-100 p-8 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs  uppercase tracking-[.15em] text-blue-600">{tier.badge}</p>
                      <h2 className="mt-2 text-2xl  text-slate-900">{tier.name}</h2>
                    </div>
                  </div>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl  tracking-tight text-slate-900">{tier.price}</span>
                    <span className="text-sm font-medium text-slate-500">{tier.period}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <span className="mt-1 text-blue-600"><Check className="w-4 h-4" /></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded bg-slate-50 p-4 border border-slate-100">
                    <p className="text-sm  text-slate-900 mb-2">Annual Maintenance (Optional)</p>
                    <p className="text-sm text-slate-600 mb-1 font-medium">₦25,000/year</p>
                    <p className="text-xs text-slate-500">Includes updates, bug fixes, and priority support. Software continues working even if expired.</p>
                  </div>

                  <Link href="/contact" className="mt-10 inline-flex w-full items-center justify-center rounded bg-blue-600 px-4 py-3 text-sm  text-white hover:bg-blue-700 transition-all">
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-xs  uppercase tracking-[.15em] text-blue-600">Add-ons</p>
              <h2 className="mt-3 text-3xl  text-slate-900">Customize your experience.</h2>
            </div>
          </div>
          <div className="overflow-hidden rounded border border-slate-200 bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 ">Service / Add-on</th>
                  <th className="px-6 py-4 ">Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(billingType === 'cloud' ? cloudAddons : offlineAddons).map((addon) => (
                  <tr key={addon.item} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700 font-medium">{addon.item}</td>
                    <td className="px-6 py-4 text-slate-600">{addon.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-32">
          <div className="text-center mb-16">
            <p className="text-xs  uppercase tracking-[.15em] text-blue-600">Why LearningDeck</p>
            <h2 className="mt-3 text-3xl  text-slate-900">Why Schools Choose LearningDeck</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center text-center p-6 rounded bg-white border border-slate-100 hover:border-blue-100 hover:shadow transition-all group">
                <div className="p-3 rounded bg-blue-50 text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-800 leading-snug">{benefit.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded text-xs  bg-blue-100 text-blue-700">
              FAQs
            </div>
            <h2 className="text-3xl  text-slate-900">Everything you need to know.</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Clear plan details, no hidden limits — perfect for institutions that want a confident digital assessment strategy.
            </p>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded border border-slate-200 bg-white p-6 hover:border-blue-200 transition-colors">
                <p className=" text-slate-900">{faq.question}</p>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-32 rounded bg-gradient-br from-white via-sky-50 to-sky-400 p-8 sm:p-16 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded blur-[120px]"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl   mb-6">Ready to Modernize Your School Assessments?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
              Get Started with LearningDeck Today
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 text-left">
              {[
                'Deploy exams locally',
                'Collaborate online',
                'Scale your institution',
                'Run exams even without internet'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-300">
                  <div className="h-2 w-2 rounded bg-blue-500"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="inline-flex items-center justify-center rounded bg-blue-600 px-8 py-4 text-sm  text-white hover:bg-blue-700 transition-all shadow shadow-blue-600/20">
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PricingPage;
