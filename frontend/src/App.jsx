import { useState, useEffect } from "react";
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
  { id: "submit",    label: "Submit" },
  { id: "mycase",    label: "My Case" },
  { id: "firms",     label: "Firms" },
  { id: "evidence",  label: "Evidence" },
  { id: "rfe-stats", label: "RFE Stats" },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const tab = location.pathname.replace("/", "") || "dashboard";
  const isLegal = tab === "privacy" || tab === "terms";

  const px = isMobile ? 16 : 48;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: T.headerBg,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        {/* Top row: logo */}
        <div style={{
          padding: `0 ${px}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}
            onClick={() => navigate("/")} role="button" tabIndex={0}
            onKeyDown={e => e.key === "Enter" && navigate("/")}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, boxShadow: `0 0 8px ${T.accent}`, cursor: "pointer", flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 17, letterSpacing: "-0.02em", color: T.text, cursor: "pointer", whiteSpace: "nowrap" }}>I-140 Tracker</span>
            {!isMobile && (
              <span style={{ background: T.accentBg, color: T.accent, fontSize: 12, padding: "2px 9px", borderRadius: 5, fontWeight: 600 }}>
                NIW · EB-1A
              </span>
            )}
          </div>
        </div>

        {/* Nav tabs — horizontally scrollable on mobile */}
        <div style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          padding: `0 ${px}px`,
          gap: 2,
        }}>
          {TABS.map(t => {
            const active = tab === t.id || (t.id === "dashboard" && tab === "dashboard");
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id === "dashboard" ? "/" : `/${t.id}`)}
                style={{
                  background: active ? T.accentBg : "transparent",
                  border: "none",
                  borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
                  padding: isMobile ? "10px 12px" : "10px 16px",
                  color: active ? T.accent : T.textMuted,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div style={{
        padding: isLegal ? "0" : `${isMobile ? 20 : 36}px ${px}px`,
        maxWidth: isLegal ? "none" : 1280,
        margin: "0 auto",
      }}>
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
        padding: `16px ${px}px`,
        marginTop: 60,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? 10 : 0,
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
