"use client";

import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ShieldCheck, Sparkles, Check } from 'lucide-react';

const tiers = [
  {
    name: 'Starter (Evaluation)',
    price: 'Free',
    description: 'Best for quick trials and solo evaluation with usage limits.',
    features: [
      'Max 15 active students',
      'Max 2 active exams',
      'Watermarked PDF/Web exports',
      'Single user only',
      '3 AI Agentic requests / day',
      '30 days history retention',
      'No support',
    ],
    badge: 'Limited',
  },
  {
    name: 'Professional (Teacher)',
    price: '$149 / year',
    description: 'For individual educators who need unlimited exams and clean exports.',
    features: [
      'Unlimited active students',
      'Unlimited active exams',
      'Clean exports with no watermark',
      'Single user',
      '100 AI Agentic requests / day',
      'Permanent data retention',
      'Email support',
    ],
    badge: 'Most popular',
    featured: true,
  },
  {
    name: 'School (Organization)',
    price: 'From $999 / year / school',
    description: 'Designed for multi-teacher school deployments with premium controls.',
    features: [
      'Unlimited active students',
      'Unlimited active exams',
      'School branding + signature exports',
      'Multi-teacher sync',
      'Unlimited AI Agentic requests',
      'Permanent retention + audit logs',
      'Priority phone & onboarding',
    ],
    badge: 'Enterprise-ready',
  },
];

const comparisonRows = [
  { feature: 'Active Students', starter: '15', professional: 'Unlimited', school: 'Unlimited' },
  { feature: 'Active Exams', starter: '2', professional: 'Unlimited', school: 'Unlimited' },
  { feature: 'PDF/Web Export', starter: 'Watermarked', professional: 'Clean', school: 'Custom Branding' },
  { feature: 'Collaboration', starter: 'Single User', professional: 'Single User', school: 'Multi-Teacher' },
  { feature: 'Agentic AI Requests', starter: '3 / day', professional: '100 / day', school: 'Unlimited' },
  { feature: 'Data Retention', starter: '30 days', professional: 'Permanent', school: 'Permanent + Audit Logs' },
  { feature: 'Support', starter: 'None', professional: 'Email', school: 'Priority Phone' },
];

const faqs = [
  {
    question: 'Can I try the app before paying?',
    answer: 'Yes. The Starter tier is a free evaluation plan with a limited student and exam capacity so you can test the core workflow before upgrading.',
  },
  {
    question: 'What happens after a School plan purchase?',
    answer: 'School plans include multi-teacher sync, customized branding, and priority onboarding. We also support account setup for the full school department.',
  },
  {
    question: 'Is the Professional tier for individual teachers only?',
    answer: 'Yes. Professional is ideal for single educators who need unlimited students and exams without organization-wide sync or school-level branding.',
  },
  {
    question: 'Do Starter exports contain a watermark?',
    answer: 'Yes. Starter exports include a LearningDeck watermark and limited feature access to keep the free tier designed for evaluation rather than school deployment.',
  },
  {
    question: 'Can I upgrade later?',
    answer: 'Absolutely. You can move from Starter to Professional or School at any time and keep your existing data in the same workspace.',
  },
];

const PricingPage = () => {
  return (
    <div className="h-full bg-slate-50 text-slate-900">
      
      <div className="max-w-7xl mx-auto px-6 py-16 pt-24">
        <div className="text-center mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
            <ShieldCheck className="w-4 h-4" />
            Pricing & plans for educators and schools
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Flexible pricing built for modern education.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-8">
            Choose the tier that fits your teaching workflow, whether you’re evaluating the platform, running individual courses, or managing a whole school.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Start free trial
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              Contact sales
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className={`rounded border ${tier.featured ? 'border-blue-200 bg-white' : 'border-slate-200 bg-white'} p-8`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[.24em] text-slate-500">{tier.badge}</p>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">{tier.name}</h2>
                </div>
                {tier.featured && (
                  <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">Popular</div>
                )}
              </div>
              <p className="mt-6 text-4xl font-bold tracking-tight text-slate-900">{tier.price}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>
              <div className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                    <span className="mt-1 text-blue-600"><Check className="w-4 h-4" /></span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                Choose plan
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-20 bg-white rounded border border-slate-200 p-8 ">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.24em] text-blue-600">Comparison</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Choose the plan that fits your classroom.</h2>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Side-by-side comparison of features and limits.
            </div>
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Feature</th>
                  <th className="px-6 py-4 font-semibold">Starter</th>
                  <th className="px-6 py-4 font-semibold">Professional</th>
                  <th className="px-6 py-4 font-semibold">School</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-t border-slate-200 odd:bg-white even:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-700">{row.feature}</td>
                    <td className="px-6 py-4 text-slate-600">{row.starter}</td>
                    <td className="px-6 py-4 text-slate-600">{row.professional}</td>
                    <td className="px-6 py-4 text-slate-600">{row.school}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 w-fit">
                <Sparkles className="w-4 h-4" />
                Frequently asked questions
              </div>
              <h2 className="text-3xl font-semibold text-slate-900">Everything you need to know before you choose.</h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Clear plan details, no hidden limits — perfect for educators who want a confident purchasing decision.
              </p>
            </div>
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded border border-slate-200 bg-white p-6">
                  <p className="font-semibold text-slate-900">{faq.question}</p>
                  <p className="mt-3 text-slate-600 leading-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default PricingPage;
