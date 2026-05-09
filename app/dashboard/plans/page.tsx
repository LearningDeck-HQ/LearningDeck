"use client";

import { useState } from "react";
import { Check, Zap, Star, Crown, ArrowRight, RotateCcw, CreditCard } from "lucide-react";

const plans = [
    {
        id: "starter",
        name: "Starter",
        price: 99000,
        period: "Year",
        description: "Perfect for small schools and evaluation.",
        badge: null,
        icon: Zap,
        features: [
            "Up to 25 students",
            "2 active exams",
            "5 AI requests/day",
            "Basic templates",
            "Watermarked exports",
            "30-day result history",
        ],
        color: "#6b7280",
    },
    {
        id: "professional",
        name: "Professional",
        price: 250000,
        period: "Year",
        description: "For tutors, coaching centers, and small schools.",
        badge: "Current plan",
        icon: Star,
        featured: true,
        features: [
            "Unlimited exams",
            "Unlimited students",
            "Up to 5 teachers",
            "Higher AI limits",
            "Custom branding",
            "Hybrid workflow",
            "Plugin access",
            "Email & WhatsApp support",
        ],
        color: "#3b82f6",
    },
    {
        id: "school",
        name: "School",
        price: 500000,
        period: "Year",
        description: "For institutions requiring full-scale management.",
        badge: null,
        icon: Crown,
        features: [
            "Multi-teacher collaboration",
            "Audit logs",
            "Advanced permissions",
            "Priority onboarding",
            "School branding",
            "Real-time sync",
            "Higher AI allocation",
            "Dedicated support",
        ],
        color: "#8b5cf6",
    },
];

const usageItems = [
    { label: "Students enrolled", used: 18, total: 25 },
    { label: "Active exams", used: 1, total: 2 },
    { label: "AI requests today", used: 3, total: 5 },
];

const billingHistory = [
    { date: "Jan 1, 2025", amount: "₦99,000", status: "Paid", plan: "Starter" },
    { date: "Jan 1, 2024", amount: "₦99,000", status: "Paid", plan: "Starter" },
];

const fmt = (n) => "₦" + n.toLocaleString("en-NG");

export default function PlanPage() {
    const [currentPlan, setCurrentPlan] = useState("professional");
    const [showConfirm, setShowConfirm] = useState(null);

    const activePlan = plans.find((p) => p.id === currentPlan);

    const handleAction = (plan) => {
        const planIndex = plans.findIndex((p) => p.id === plan.id);
        const currentIndex = plans.findIndex((p) => p.id === currentPlan);
        if (plan.id === currentPlan) return;
        setShowConfirm({ plan, action: planIndex > currentIndex ? "upgrade" : "downgrade" });
    };

    const confirmChange = () => {
        setCurrentPlan(showConfirm.plan.id);
        setShowConfirm(null);
    };

    return (
        <div className="h-full text-[#6b6b6b] font-sans p-2 md:p-4">
            <div className="mx-auto space-y-6">

                {/* Header */}
                <div>

                    <p className="text-sm mt-1">Manage your plan, usage, and payment details.</p>
                </div>

                {/* Current Plan Summary */}
                <div className="bg-white border border-[#ededed] rounded p-5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#f0f0f0] rounded">
                            <activePlan.icon size={18} className="text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-[#1a1a1a]">{activePlan.name} Plan</span>
                                <span className="text-xs bg-blue-400/10 text-blue-600 px-2 py-0.5 rounded">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs">
                                Renews Jan 1, 2026 · {fmt(activePlan.price)} / year
                            </p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm border border-[#ededed] rounded px-4 py-2 hover:bg-[#f0f0f0] transition-colors text-[#1a1a1a]">
                        <CreditCard size={14} /> Manage billing
                    </button>
                </div>

                {/* Usage */}
                <div className="space-y-3">
                    <h3 className="text-[#1a1a1a]">Current Usage</h3>
                    <div className="bg-white border border-[#ededed] rounded overflow-hidden">
                        {usageItems.map((item, i) => {
                            const pct = Math.round((item.used / item.total) * 100);
                            const isHigh = pct >= 80;
                            return (
                                <div
                                    key={i}
                                    className={`p-4 flex items-center gap-6 ${i < usageItems.length - 1 ? "border-b border-[#ededed]" : ""}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2 text-sm">
                                            <span className="text-[#1a1a1a]">{item.label}</span>
                                            <span
                                                className="text-xs font-mono"
                                                style={{ color: isHigh ? "#ef4444" : "#6b6b6b" }}
                                            >
                                                {item.used} / {item.total}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: isHigh
                                                        ? "linear-gradient(90deg, #ef4444, #f87171)"
                                                        : "linear-gradient(90deg, #60a5fa, #93c5fd)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs min-w-[32px] text-right"
                                        style={{ color: isHigh ? "#ef4444" : "#6b6b6b" }}
                                    >
                                        {pct}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="space-y-3">
                    <h3 className="text-[#1a1a1a]">Pricing Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((plan) => {
                            const isActive = plan.id === currentPlan;
                            const planIndex = plans.findIndex((p) => p.id === plan.id);
                            const currentIndex = plans.findIndex((p) => p.id === currentPlan);
                            const isUpgrade = planIndex > currentIndex;

                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-white rounded p-5 flex flex-col gap-4 border transition-colors ${isActive
                                        ? "border-blue-400"
                                        : "border-[#ededed] hover:border-blue-200"
                                        }`}
                                >
                                    {/* Top */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="p-2 bg-[#f0f0f0] rounded w-fit mb-3">
                                                <plan.icon size={16} className="text-blue-500" />
                                            </div>
                                            <p className="font-medium text-[#1a1a1a]">{plan.name}</p>
                                        </div>
                                        {isActive && (
                                            <span className="text-xs bg-blue-400/10 text-blue-600 px-2 py-0.5 rounded">
                                                Current plan
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-semibold text-[#1a1a1a]">
                                                {fmt(plan.price)}
                                            </span>
                                            <span className="text-xs">/ {plan.period}</span>
                                        </div>
                                        <p className="text-xs mt-1 leading-relaxed">{plan.description}</p>
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-2 text-xs">
                                                <Check size={12} className="mt-0.5 shrink-0 text-blue-500" />
                                                <span>{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    {isActive ? (
                                        <button className="w-full text-sm border border-[#ededed] rounded py-2 px-4 text-[#6b6b6b] bg-[#f0f0f0] cursor-default">
                                            Manage plan
                                        </button>
                                    ) : isUpgrade ? (
                                        <button
                                            onClick={() => handleAction(plan)}
                                            className="w-full text-sm bg-blue-400/10 text-blue-600 rounded py-2 px-4 hover:bg-blue-700/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Upgrade <ArrowRight size={13} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAction(plan)}
                                            className="w-full text-sm border border-[#ededed] rounded py-2 px-4 text-[#6b6b6b] hover:bg-[#f0f0f0] transition-colors"
                                        >
                                            Downgrade
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Billing History */}
                <div className="space-y-3 pb-10">
                    <h3 className="text-[#1a1a1a]">Billing History</h3>
                    <div className="bg-white border border-[#ededed] rounded overflow-hidden">
                        <div className="grid grid-cols-4 px-4 py-3 border-b border-[#ededed] text-xs uppercase tracking-wider text-[#6b6b6b]">
                            <span>Date</span>
                            <span>Plan</span>
                            <span>Amount</span>
                            <span>Status</span>
                        </div>
                        {billingHistory.map((row, i) => (
                            <div
                                key={i}
                                className={`grid grid-cols-4 px-4 py-4 text-sm items-center ${i < billingHistory.length - 1 ? "border-b border-[#ededed]" : ""
                                    }`}
                            >
                                <span>{row.date}</span>
                                <span>{row.plan}</span>
                                <span className="text-[#1a1a1a] font-mono text-xs">{row.amount}</span>
                                <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded w-fit">
                                    {row.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowConfirm(null)}
                >
                    <div
                        className="bg-white border border-[#ededed] rounded p-6 max-w-sm w-[90%] shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-5">
                            <div className="p-2 bg-[#f0f0f0] rounded w-fit mb-4">
                                {showConfirm.action === "upgrade"
                                    ? <ArrowRight size={18} className="text-blue-500" />
                                    : <RotateCcw size={18} className="text-red-400" />
                                }
                            </div>
                            <h4 className="text-[#1a1a1a] font-medium mb-2">
                                {showConfirm.action === "upgrade" ? "Upgrade" : "Downgrade"} to {showConfirm.plan.name}?
                            </h4>
                            <p className="text-sm leading-relaxed">
                                {showConfirm.action === "upgrade"
                                    ? `Your plan will change to ${showConfirm.plan.name} at ${fmt(showConfirm.plan.price)}/year. You'll be billed the difference immediately.`
                                    : `Your plan will change to ${showConfirm.plan.name} at ${fmt(showConfirm.plan.price)}/year at your next billing cycle.`}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 text-sm border border-[#ededed] rounded py-2 px-4 hover:bg-[#f0f0f0] transition-colors text-[#6b6b6b]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmChange}
                                className={`flex-1 text-sm rounded py-2 px-4 transition-colors ${showConfirm.action === "upgrade"
                                    ? "bg-blue-400/10 text-blue-600 hover:bg-blue-700/20"
                                    : "bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                                    }`}
                            >
                                Confirm {showConfirm.action}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}