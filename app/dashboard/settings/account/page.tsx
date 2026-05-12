"use client";

import { useState } from "react";
import { TbHome, TbTemplate, TbVideoPlus } from "react-icons/tb";
import {
    MdWorkspaces, MdSettings, MdLogout,
} from "react-icons/md";
import { GrDeploy } from "react-icons/gr";
import { FiArrowUpRight, FiEye, FiEyeOff } from "react-icons/fi";
import { BiBrain, BiCreditCard } from "react-icons/bi";
import SessionsPage from "../sessions/page";



// ── Reusable input ────────────────────────────────────────────────────────────
const Input = ({ label, desc, value, onChange, type = "text", showToggle, show, onToggle }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-xs font-medium text-[#0e0f10]">{label}</label>}
        {desc && <p className="text-[11px] text-[#6b6b6b]">{desc}</p>}
        <div className="relative">
            <input
                type={showToggle ? (show ? "text" : "password") : type}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 text-xs border border-[#ededed] rounded-md bg-white text-[#0e0f10] focus:outline-none focus:border-[#c0c0c0] transition-colors pr-9"
            />
            {showToggle && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#0e0f10] transition-colors"
                >
                    {show ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                </button>
            )}
        </div>
    </div>
);

// ── Btn ───────────────────────────────────────────────────────────────────────
const Btn = ({ children, disabled, onClick, variant = "primary" }) => {
    const base = "px-4 py-1.5 rounded text-xs font-medium transition-colors";
    const styles = {
        primary: disabled
            ? `${base} bg-[#c0c0c0] text-white cursor-not-allowed`
            : `${base} bg-[#8b3a2a] hover:bg-[#7a3223] text-white cursor-pointer`,
        ghost: `${base} border border-[#ededed] text-[#0e0f10] hover:bg-[#f0f0f0] cursor-pointer`,
    };
    return (
        <button onClick={onClick} disabled={disabled} className={styles[variant]}>
            {children}
        </button>
    );
};

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = () => <div className="border-t border-[#ededed] my-6" />;

// ── Profile Section ───────────────────────────────────────────────────────────
const ProfileSection = () => {
    const [name, setName] = useState("Prutotech");
    const [username, setUsername] = useState("payload-cosmonaut-29181288");
    const [isPublic, setIsPublic] = useState(false);

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-sm font-semibold text-[#0e0f10]">Profile details</h2>
            </div>

            <Input
                label="Name"
                desc="Your name as you'd like it to be displayed."
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                label="Username"
                desc="Your username can be used to sign in and to identify you."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />



            <div>
                <Btn>Update Profile</Btn>
            </div>
        </div>
    );
};

// ── Account Section ───────────────────────────────────────────────────────────
const AccountSection = () => {
    const [email, setEmail] = useState("prutotech@gmail.com");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [signOutOthers, setSignOutOthers] = useState(true);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const pwReady = currentPw && newPw && confirmPw;

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-[#0e0f10]">Account</h2>

            {/* Email */}
            <div className="flex flex-col gap-2">
                <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                <div><Btn>Update Email Address</Btn></div>
            </div>

            <Divider />

            {/* Password */}
            <Input
                label="Current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                showToggle
                show={showCurrent}
                onToggle={() => setShowCurrent((v) => !v)}
            />
            <Input
                label="New password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                showToggle
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
            />
            <Input
                label="Confirm new password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                showToggle
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
            />

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={signOutOthers}
                    onChange={(e) => setSignOutOthers(e.target.checked)}
                    className="accent-[#8b3a2a]"
                />
                <span className="text-xs text-[#0e0f10]">Sign out from all other sessions</span>
            </label>

            <div>
                <Btn disabled={!pwReady}>Update Password</Btn>
            </div>
        </div>
    );
};

// ── Tab nav ───────────────────────────────────────────────────────────────────
const TABS = ["Profile", "Account", "Sessions", "Integrations"];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [tab, setTab] = useState("Profile");

    return (
        <div className="flex h-screen w-screen bg-white font-sans overflow-hidden">


            {/* Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="border-b border-[#ededed] px-8 pt-2 pb-0">

                    <div className="flex gap-0">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t
                                    ? "border-[#0e0f10] text-[#0e0f10]"
                                    : "border-transparent text-[#6b6b6b] hover:text-[#0e0f10]"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className="px-8 py-8 ">
                    {tab === "Profile" && <ProfileSection />}
                    {tab === "Account" && <AccountSection />}
                    {tab === "Sessions" && (
                        <SessionsPage />
                    )}
                    {tab === "Integrations" && (
                        <p className="text-xs text-[#6b6b6b]">Integration settings coming soon.</p>
                    )}
                </div>
            </main>
        </div>
    );
}