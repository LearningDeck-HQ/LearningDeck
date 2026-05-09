"use client";

const UsageWorkspacePage = () => {
  interface UsageItem {
    label: string;
    used: number;
    total: number;
  }
  const usageItems: UsageItem[] = [
    { label: "Students enrolled", used: 18, total: 25 },
    { label: "Active exams", used: 1, total: 2 },
    { label: "AI requests today", used: 3, total: 5 },
  ];

  return (
    <div className="  p-2 text-xs ">

      {/* Usage */}
      <div className="space-y-3">

        <div className="bg-white border border-[#ededed] rounded overflow-hidden">
          {usageItems.map((item, i) => {
            const pct = Math.round((item.used / item.total) * 100);
            const isHigh = pct >= 80;
            return (
              <div
                key={i}
                className={`p-4 flex items-center gap-6 ${i < usageItems.length - 1 ? "border-b border-[#ededed]" : ""
                  }`}
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
    </div>
  );
};

export default UsageWorkspacePage;