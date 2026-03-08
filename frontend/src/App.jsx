import { useState } from "react";
import Dashboard   from "./components/Dashboard";
import CasesTable  from "./components/CasesTable";
import SubmitCase  from "./components/SubmitCase";
import MyCase      from "./components/MyCase";
import FirmTracker from "./components/FirmTracker";
import Evidence    from "./components/Evidence";
import { T } from "./components/shared";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "cases",     label: "Cases" },
  { id: "submit",    label: "Submit Case" },
  { id: "mycase",    label: "My Case" },
  { id: "firms",     label: "Firms" },
  { id: "evidence",  label: "Evidence" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: T.headerBg,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 62,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}` }} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.text }}>I-140 Tracker</span>
          <span style={{ background: T.accentBg, color: T.accent, fontSize: 12, padding: "2px 9px", borderRadius: 5, fontWeight: 600 }}>
            NIW · EB-1A
          </span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? T.accentBg : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "7px 16px",
                color: tab === t.id ? T.accent : T.textMuted,
                fontSize: 14,
                fontWeight: tab === t.id ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "36px 48px", maxWidth: 1280, margin: "0 auto" }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "cases"     && <CasesTable />}
        {tab === "submit"    && <SubmitCase />}
        {tab === "mycase"    && <MyCase />}
        {tab === "firms"     && <FirmTracker />}
        {tab === "evidence"  && <Evidence />}
      </div>
    </div>
  );
}
