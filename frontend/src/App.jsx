import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Dashboard   from "./components/Dashboard";
import CasesTable  from "./components/CasesTable";
import SubmitCase  from "./components/SubmitCase";
import MyCase      from "./components/MyCase";
import FirmTracker from "./components/FirmTracker";
import Evidence    from "./components/Evidence";
import Privacy     from "./components/Privacy";
import Terms       from "./components/Terms";
import RFEStats    from "./components/RFEStats";
import { T } from "./components/shared";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "cases",     label: "Cases" },
  { id: "submit",    label: "Submit Case" },
  { id: "mycase",    label: "My Case" },
  { id: "firms",     label: "Firms" },
  { id: "evidence",  label: "Evidence" },
  { id: "rfe-stats", label: "RFE Stats" },
];

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = location.pathname.replace("/", "") || "dashboard";
  const isLegal = tab === "privacy" || tab === "terms";

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} onClick={() => navigate("/")} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && navigate("/")}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}`, cursor: "pointer" }} />
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.text, cursor: "pointer" }}>I-140 Tracker</span>
          <span style={{ background: T.accentBg, color: T.accent, fontSize: 12, padding: "2px 9px", borderRadius: 5, fontWeight: 600 }}>
            NIW · EB-1A
          </span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => navigate(t.id === "dashboard" ? "/" : `/${t.id}`)}
              style={{
                background: tab === t.id || (t.id === "dashboard" && tab === "dashboard") ? T.accentBg : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "7px 16px",
                color: tab === t.id || (t.id === "dashboard" && tab === "dashboard") ? T.accent : T.textMuted,
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

      <div style={{ padding: isLegal ? "0" : "36px 48px", maxWidth: isLegal ? "none" : 1280, margin: "0 auto" }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/cases"     element={<CasesTable />} />
          <Route path="/submit"    element={<SubmitCase />} />
          <Route path="/mycase"    element={<MyCase />} />
          <Route path="/firms"     element={<FirmTracker />} />
          <Route path="/evidence"  element={<Evidence />} />
          <Route path="/privacy"   element={<Privacy />} />
          <Route path="/terms"     element={<Terms />} />
          <Route path="/rfe-stats" element={<RFEStats />} />
        </Routes>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        padding: "20px 48px",
        marginTop: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: T.textMuted,
        fontSize: 13,
      }}>
        <span>I-140 Tracker — Community data for NIW & EB-1A applicants</span>
        <div style={{ display: "flex", gap: 20 }}>
          <button onClick={() => navigate("/privacy")} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
            Privacy Policy
          </button>
          <button onClick={() => navigate("/terms")} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
