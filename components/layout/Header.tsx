"use client";

import Image from "next/image"
import { MdSearch, MdQuiz, MdReport } from "react-icons/md";
import { BiBookOpen, BiSolidShapes } from "react-icons/bi";
import { GiTeacher } from "react-icons/gi";
import { SiGoogleclassroom } from "react-icons/si";
import { useSidebar } from "@/context/SidebarContext";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { RiMenu5Line } from "react-icons/ri";
import { userApi } from "@/lib/api/users";
import { examApi } from "@/lib/api/exams";
import { questionApi } from "@/lib/api/questions";
import { subjectApi } from "@/lib/api/subjects";
import { classApi } from "@/lib/api/classes";
import { resultApi } from "@/lib/api/results";
import { User } from "@/types";
import { dashboardNavItems } from "./Sidebar";
import { navItems as workspaceNavItems, TeacherNavItems } from "./WorkspaceSideBar";

// ─── Types ────────────────────────────────────────────────────────────────────
type SearchGroup = { type: string; items: any[] };

// ─── Cache (module-level, survives re-renders) ────────────────────────────────
const queryCache = new Map<string, SearchGroup[]>();

// ─── Icon map ─────────────────────────────────────────────────────────────────
const GROUP_ICONS: Record<string, React.ElementType> = {
  Navigation: BiBookOpen,
  Exams: BiBookOpen,
  Questions: MdQuiz,
  Results: MdReport,
  Teachers: GiTeacher,
  Classes: SiGoogleclassroom,
  Subjects: BiSolidShapes,
};

// ─── Highlight helper (memoised outside component) ───────────────────────────
function Highlight({ text, term }: { text: string; term: string }) {
  if (!term) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 text-black rounded-sm not-italic">{p}</mark>
          : p
      )}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
const Header = () => {
  const { toggleLeftSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPopoverRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  // Fetch current user once
  useEffect(() => {
    userApi.me().then((res) => {
      if (res.success && res.data) setUser(res.data);
    });
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
      if (
        searchPopoverRef.current &&
        !searchPopoverRef.current.contains(e.target as Node) &&
        !searchInputRef.current?.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Nav items (role-aware, memoised)
  const allNavItems = useMemo(() => {
    const roleItems = user?.role === "TEACHER" ? TeacherNavItems : workspaceNavItems;
    return [
      ...dashboardNavItems.map((i) => ({ ...i, type: "Navigation" })),
      ...roleItems.map((i) => ({ ...i, type: "Navigation" })),
    ];
  }, [user]);

  // ─── Core search (runs at most once per unique query) ─────────────────────
  const runSearch = useCallback(
    async (raw: string) => {
      const cacheKey = `${user?.workspaceId}::${raw}`;
      if (queryCache.has(cacheKey)) {
        setResults(queryCache.get(cacheKey)!);
        setShowPopover(true);
        setIsSearching(false);
        return;
      }

      // Cancel any previous in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsSearching(true);
      setShowPopover(true);

      const commandMatch = raw.match(/^@(\w+)\s*(.*)/);
      const cmd = commandMatch ? commandMatch[1].toLowerCase() : null;
      const term = commandMatch ? commandMatch[2] : raw;
      const wid = user?.workspaceId;
      const groups: SearchGroup[] = [];

      // 1. Local nav — instant, synchronous
      const navHits = allNavItems.filter((i) =>
        i.label.toLowerCase().includes(term.toLowerCase())
      );
      if (navHits.length && (!cmd || cmd === "sidebar"))
        groups.push({ type: "Navigation", items: navHits.slice(0, 3) });

      // 2. All API calls fire in parallel
      const fetchers: Promise<void>[] = [];

      const add = (type: string, promise: Promise<any>, transform?: (d: any) => any[]) =>
        fetchers.push(
          promise
            .then((res) => {
              if (!res.success || !res.data) return;
              const items = transform ? transform(res.data) : res.data;
              if (items.length) groups.push({ type, items: items.slice(0, 3) });
            })
            .catch(() => {/* silently swallow per-fetcher errors */ })
        );

      if (!cmd || cmd === "exam")
        add("Exams", examApi.list({ workspaceId: wid, searchTerm: term }));

      if (!cmd || cmd === "question")
        add("Questions", questionApi.list({ workspaceId: wid, searchTerm: term, limit: 3 }));

      if (!cmd || cmd === "subject")
        add(
          "Subjects",
          subjectApi.list(wid),
          (d) => d.filter((s: any) =>
            s.name.toLowerCase().includes(term.toLowerCase()) ||
            s.code?.toLowerCase().includes(term.toLowerCase())
          )
        );

      if (!cmd || cmd === "class")
        add(
          "Classes",
          classApi.list(wid),
          (d) => d.filter((c: any) => c.name.toLowerCase().includes(term.toLowerCase()))
        );

      if (!cmd || cmd === "result")
        add("Results", resultApi.list({ workspaceId: wid, searchTerm: term, limit: 3 }));

      if (!cmd || cmd === "teacher")
        add("Teachers", userApi.list({ role: "TEACHER", workspaceId: wid, searchTerm: term, limit: 3 }));

      await Promise.allSettled(fetchers);

      queryCache.set(cacheKey, groups);
      if (queryCache.size > 50) {
        const firstKey = queryCache.keys().next().value;
        if (firstKey) queryCache.delete(firstKey);
      }

      setResults(groups);
      setIsSearching(false);
    },
    [user, allNavItems]
  );

  // ─── Debounced query watcher ───────────────────────────────────────────────
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setShowPopover(false);
      setIsSearching(false);
      return;
    }

    // Instant cache hit — no delay
    const cacheKey = `${user?.workspaceId}::${trimmed}`;
    if (queryCache.has(cacheKey)) {
      setResults(queryCache.get(cacheKey)!);
      setShowPopover(true);
      return;
    }

    setIsSearching(true);
    const t = setTimeout(() => runSearch(trimmed), 200);
    return () => clearTimeout(t);
  }, [query, runSearch, user?.workspaceId]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      if (typeof window !== "undefined" && (window as any).api?.clearAuthToken)
        await (window as any).api.clearAuthToken();
    } catch { }
    await authApi.logout();
  };

  const clearSearch = () => {
    setQuery("");
    setShowPopover(false);
    setResults([]);
    searchInputRef.current?.focus();
  };

  const handleResultClick = (item: any, group: SearchGroup) => {
    navigate.push(item.href || `/workspace/${group.type.toLowerCase()}/${item.id || ""}`);
    setShowPopover(false);
    setQuery("");
  };

  // Derive the plain search term for highlighting
  const highlightTerm = query.startsWith("@")
    ? (query.match(/^@\w+\s+(.*)/) || [])[1] || ""
    : query;

  const profileName = user?.user_name || "Guest";
  const profileEmail = user?.user_email || "No email";
  const userRole = user?.role || "User";

  return (
    <div className="flex justify-between w-full bg-[#f9f9f9] border-b border-[#ededed] text-[#6b6b6b] py-2">
      {/* ── Left: logo + toggle ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-2">
        <button
          onClick={toggleLeftSidebar}
          className="text-xl cursor-pointer hover:text-[#0e0f10] transition-colors"
        >
          <RiMenu5Line />
        </button>
        <Image
          src="https://avatars.githubusercontent.com/u/225484805?s=200&v=4"
          alt="LearningDeck"
          width={20}
          height={20}
          className="rounded"
        />
        <span className="font-medium truncate">
          <span className="text-black">LearningDeck |</span> Web Dashboard
        </span>
      </div>

      {/* ── Centre: search ───────────────────────────────────────────────────── */}
      <div className="px-3 hidden md:block flex-1 max-w-xl">
        <div className="relative">
          {/* Search icon */}
          <MdSearch
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none transition-colors ${isFocused ? "text-[#0e0f10]" : "text-[#6b6b6b]"
              }`}
          />

          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (results.length) setShowPopover(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === "Escape" && clearSearch()}
            placeholder="Search LearningDeck  ·  @exam @class @teacher…"
            className="w-full bg-[#ededed]/50 border border-[#ededed] rounded-md py-1.5 pl-10 pr-8 text-xs text-[#0e0f10] placeholder:text-[#9b9b9b] outline-none focus:bg-white focus:border-zinc-300 transition-all  focus:shadow-md"
          />

          {/* Clear / spinner */}
          {query && (
            <button
              onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9b9b9b] hover:text-[#0e0f10] transition-colors"
            >
              {isSearching ? (
                <span className="inline-block w-3 h-3 border border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}

          {/* ── Search popover ──────────────────────────────────────────────── */}
          {showPopover && (
            <div
              ref={searchPopoverRef}
              className="absolute left-0 top-[calc(100%+6px)] w-full max-h-[420px] bg-white border border-[#ededed]  rounded-lg z-[300] overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {isSearching && results.length === 0 ? (
                <div className="flex items-center gap-2.5 px-4 py-5 text-[#6b6b6b]">
                  <span className="inline-block w-3.5 h-3.5 border border-zinc-300 border-t-zinc-500 rounded-full animate-spin shrink-0" />
                  <span className="text-[11px]">Searching…</span>
                </div>
              ) : results.length > 0 ? (
                <div className="py-1.5">
                  {results.map((group) => {
                    const Icon = GROUP_ICONS[group.type] ?? BiBookOpen;
                    return (
                      <div key={group.type} className="mb-1 last:mb-0">
                        {/* Group label */}
                        <div className="px-4 py-1 text-[9px] font-bold text-[#9b9b9b] uppercase tracking-widest bg-[#f9f9f9] sticky top-0">
                          {group.type}
                        </div>
                        {group.items.map((item, idx) => {
                          const ItemIcon = group.type === "Navigation" ? (item.icon ?? Icon) : Icon;
                          const label = item.label || item.exam_name || item.question || item.name || item.user_name || "";
                          const sub = item.user_email || item.code || (item.minutes ? `${item.minutes} min` : null);
                          return (
                            <button
                              key={idx}
                              onMouseDown={(e) => { e.preventDefault(); handleResultClick(item, group); }}
                              className="flex items-center gap-3 w-full px-3.5 py-2 hover:bg-[#f4f4f4] transition-colors text-left group/item"
                            >
                              <span className="shrink-0 p-1.5 rounded bg-[#f0f0f0] text-[#6b6b6b] group-hover/item:bg-[#e8e8e8] group-hover/item:text-[#0e0f10] transition-colors">
                                <ItemIcon className="text-[13px]" />
                              </span>
                              <span className="flex flex-col min-w-0">
                                <span className="text-[11px] font-medium text-[#0e0f10] truncate leading-tight">
                                  <Highlight text={label} term={highlightTerm} />
                                </span>
                                {sub && (
                                  <span className="text-[9px] text-[#9b9b9b] truncate mt-0.5">{sub}</span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  {/* Hint bar */}
                  <div className="px-4 py-2 border-t border-[#f0f0f0] flex items-center gap-1.5 text-[9px] text-[#b0b0b0]">
                    <kbd className="px-1 py-0.5 rounded bg-[#f0f0f0] font-mono text-[8px]">Esc</kbd>
                    <span>to clear</span>
                    <span className="ml-2 opacity-60">Try @exam · @class · @teacher · @subject</span>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-5 text-[#6b6b6b]">
                  <p className="text-[11px]">No results for "<span className="text-[#0e0f10]">{query}</span>"</p>
                  <p className="text-[9px] mt-1 text-[#b0b0b0]">Try scoping: @exam, @question, @teacher…</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: avatar + profile popover ─────────────────────────────────── */}
      <div className="relative flex items-center gap-2 px-2">
        <button
          type="button"
          onClick={() => setIsProfileOpen((p) => !p)}
          className="rounded-full overflow-hidden border border-[#e5e7eb] hover:border-[#cbd5e1] transition-colors"
        >
          <Image
            src="data:image/png;base64,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"
            alt="Profile"
            width={34}
            height={34}
            className="rounded-full"
          />
        </button>

        {isProfileOpen && (
          <div
            ref={profileRef}
            className="absolute right-2 top-[calc(100%+10px)] w-64 bg-white border border-[#ededed] shadow rounded z-[200] overflow-hidden"
          >
            <div className="p-3.5 bg-zinc-50 border-b border-zinc-200">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[12px] text-zinc-900 font-medium truncate">{profileName}</span>
                {userRole && (
                  <span className="text-[9px] font-semibold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">
                    {userRole}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 truncate block">{profileEmail}</span>
            </div>
            <div className="flex flex-col gap-0.5 p-1.5">
              {[
                { label: "View Profile", action: () => alert("View Profile coming soon") },
                { label: "Settings", action: () => alert("Settings coming soon") },
                { label: "Switch Accounts", action: () => alert("Switch accounts coming soon") },
                { label: "Add Account", action: () => alert("Add account coming soon") },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={() => { setIsProfileOpen(false); action(); }}
                  className="text-left text-[11px] px-3 py-1.5 rounded hover:bg-zinc-100 transition-colors"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="text-left text-[11px] px-3 py-1.5 rounded text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;