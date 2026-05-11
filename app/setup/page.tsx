"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Crown, Building2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { billingApi } from "@/lib/api/billing";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { authApi } from "@/lib/api/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Plan {
    id: string;
    name: string;
    price: number | string;
    period: string;
    description: string;
    icon: any;
    features: string[];
    color: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const plans: Plan[] = [
    {
        id: "professional",
        name: "Professional",
        price: 99000,
        period: "Year",
        description: "For tutorial centers, coaching institutes, and small schools.",
        icon: Star,
        features: [
            "Up to 100 students",
            "Up to 15 teachers",
            "Up to 20 active exams",
            "Hybrid online/offline workflow",
            "AI-assisted exam generation",
            "100 AI credits/month",
            "1 local deployment environment",
        ],
        color: "#3b82f6",
    },
    {
        id: "school_standard",
        name: "School Standard",
        price: 350000,
        period: "Year",
        description: "For established schools and institutional management.",
        icon: Crown,
        features: [
            "Up to 500 students",
            "Up to 50 teachers",
            "Up to 50 active exams",
            "Advanced permissions & roles",
            "School branding",
            "1000 AI credits/month",
            "Local infrastructure sync",
        ],
        color: "#8b5cf6",
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        period: "Year",
        description: "For universities and multi-campus institutions.",
        icon: Building2,
        features: [
            "Unlimited students & teachers",
            "Dedicated deployment support",
            "White-label infrastructure",
            "Advanced analytics",
            "Custom plugins",
            "Priority infrastructure support",
            "SLA agreements",
        ],
        color: "#f59e0b",
    },
];

const fmt = (n: number): string => "₦" + n.toLocaleString("en-NG");

const formatPrice = (plan: Plan): string => {
    if (typeof plan.price === "string") return plan.price;
    return fmt(plan.price);
};

export default function SetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }
            if (parsedUser.hasSubscription) {
                router.push('/dashboard');
                return;
            }
            setUser(parsedUser);
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleSelectPlan = async (plan: Plan) => {
        if (!user) return;

        if (plan.id === "enterprise") {
            window.location.href = "mailto:support@learningdeck.online";
            return;
        }

        setSelectedPlan(plan.id);
        setIsLoading(true);

        try {
            const amount = typeof plan.price === 'number' ? plan.price : 0;
            console.log("Initializing billing with data:", {
                workspaceId: user.workspaceId,
                plan: plan.id.toUpperCase(),
                amount: amount,
                email: user.user_email
            });

            const res = await billingApi.initialize({
                workspaceId: user.workspaceId,
                plan: plan.id.toUpperCase(),
                amount: amount,
                email: user.user_email
            });

            if (res.success && res.data?.authorization_url) {
                window.location.href = res.data.authorization_url;
            } else {
                toast.error(res.message);
                setIsLoading(false);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    if (!user) return null;

    const handleLogout = async () => {


        try {
            if (typeof window !== 'undefined' && (window as any).api?.clearAuthToken) {
                await (window as any).api.clearAuthToken();
            }
        } catch (error) {
            console.warn('Header: clearAuthToken failed', error);
        }

        // authApi.logout() handles API call, localStorage cleanup, and redirect
        await authApi.logout();
    };


    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Nav */}
            <Toaster />
            <nav className="h-16 border-b border-gray-100 flex items-center justify-between px-6 md:px-12 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-3">
                    <Image
                        src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
                        alt="LearningDeck Logo"
                        width={28}
                        height={28}
                        className="rounded-md"
                    />
                    <span className="text-[18px] tracking-tight text-gray-800 font-medium">LearningDeck</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="text-xs text-gray-400 font-medium uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-4">
                        <Sparkles size={14} /> Final Step: Choose Your Plan
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
                        Power up your <span className="text-blue-600 italic">Workspace</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Welcome, <span className="text-gray-900 font-medium">{user.user_name}</span>.
                        Select a plan to activate your workspace and start managing examinations effectively.
                    </p>
                </div>

                {/* Plan Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => {
                        const PlanIcon = plan.icon;
                        const isSelected = selectedPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`group relative bg-white rounded-3xl p-8 flex flex-col gap-8 border transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${plan.id === "school_standard"
                                    ? "border-blue-200 ring-4 ring-blue-50"
                                    : "border-gray-100 hover:border-blue-200"
                                    }`}
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                {plan.id === "school_standard" && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20">
                                        Most Popular
                                    </div>
                                )}

                                {/* Top */}
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                                        <PlanIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed mt-1">{plan.description}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                                            {formatPrice(plan)}
                                        </span>
                                        {typeof plan.price === "number" && (
                                            <span className="text-sm text-gray-400 font-medium">/ {plan.period}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium italic">Billed annually in Nigerian Naira</p>
                                </div>

                                {/* Features */}
                                <div className="flex flex-col gap-4 flex-1">
                                    <div className="h-[1px] bg-gray-50 w-full" />
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Included Features</p>
                                    <div className="space-y-3">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-3 text-[13px] text-gray-600">
                                                <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check size={12} className="text-blue-600" />
                                                </div>
                                                <span>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={isLoading}
                                    className={`w-full h-14 rounded-2xl text-[15px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${plan.id === "enterprise"
                                        ? "bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10 hover:shadow-blue-600/20 active:scale-[0.98]"
                                        } disabled:opacity-50`}
                                >
                                    {isLoading && isSelected ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {plan.id === "enterprise" ? "Contact Support" : "Select Plan"}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-20 text-center space-y-6">
                    <div className="flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-sm font-medium">Trusted by leading educational institutions</span>
                    </div>
                    <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                        Secure payments processed via Paystack. Your data is encrypted and managed according to NITDA guidelines.
                    </p>
                </div>
            </main>
        </div>
    );
}