"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";

export default function BillingSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get("reference");
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const verifyAndRefresh = async () => {
            try {
                // Give the webhook a moment to process the activation
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Refresh the user token to get the updated hasSubscription status
                const res = await authApi.verifyToken();
                if (res.success && res.data?.user) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    setStatus("success");

                    // Start countdown to redirect
                    const timer = setInterval(() => {
                        setCountdown((prev) => {
                            if (prev <= 1) {
                                clearInterval(timer);
                                router.push("/dashboard");
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Verification failed", error);
                setStatus("error");
            }
        };

        verifyAndRefresh();
    }, [router]);

    return (<Suspense fallback={<div className="text-[#1B2559] font-medium">
        <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
    </div>}>


        <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-6 text-center">
            <Toaster />

            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="max-w-md w-full space-y-8 relative animate-in fade-in zoom-in-95 duration-700">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <Image
                            src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
                            alt="LearningDeck Logo"
                            width={32}
                            height={32}
                            className="rounded-md shadow-sm"
                        />
                        <span className="text-xl tracking-tight text-gray-800 font-semibold">LearningDeck</span>
                    </div>
                </div>

                {status === "verifying" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">Activating Workspace</h1>
                            <p className="text-gray-500">We're confirming your payment and setting up your environment. Please don't close this window.</p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-8">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                            <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100 shadow-xl shadow-green-500/10">
                                <PartyPopper className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg rotate-12">
                                <Sparkles size={16} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Successful!</h1>
                            <p className="text-gray-500 leading-relaxed">
                                Your subscription is now active. Your workspace has been upgraded and all features are unlocked.
                            </p>
                        </div>

                        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className="font-bold text-green-600 uppercase tracking-widest text-[10px]">Active</span>
                            </div>
                            <div className="h-[1px] bg-gray-100" />
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full h-14 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 group"
                            >
                                Go to Dashboard
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-400">
                            Redirecting to your dashboard in <span className="text-gray-900 font-bold">{countdown}s</span>...
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto border border-red-100">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-gray-900">Verification Pending</h1>
                            <p className="text-gray-500">
                                We couldn't verify your subscription immediately. Don't worry, your payment was processed. Please try refreshing or contact support if the issue persists.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Refresh Status
                        </button>
                    </div>
                )}
            </div>

            <footer className="mt-20 text-xs text-gray-400">
                Transaction Ref: <span className="font-mono">{reference || "N/A"}</span>
            </footer>
        </div> </Suspense>
    );
}
