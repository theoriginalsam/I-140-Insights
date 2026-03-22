import { useState, useEffect, Fragment } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { API, T, COLORS, statusColor, StatCard, Panel, Badge, Btn, useIsMobile } from "./shared";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [runs, setRuns]         = useState([]);
  const [waves, setWaves]       = useState([]);
  const [heatmap, setHeatmap]   = useState([]);
  const [ppToggle, setPpToggle] = useState(null);
  const [scraping, setScraping]         = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminKey, setAdminKey]         = useState("");
  const [adminError, setAdminError]     = useState("");
  const [health, setHealth]             = useState(null);
  const [savedKey, setSavedKey]         = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/stats`).then(r => r.json()),
      fetch(`${API}/api/analytics`).then(r => r.json()),
      fetch(`${API}/api/scrape/runs`).then(r => r.json()),
      fetch(`${API}/api/alerts/waves`).then(r => r.json()),
      fetch(`${API}/api/analytics/activity`).then(r => r.json()),
    ]).then(([s, a, ru, w, act]) => {
      setStats(s); setAnalytics(a); setRuns(ru);
      setWaves(w.waves ?? []);
      setHeatmap(act.heatmap ?? []);
    });

    const iv = setInterval(() =>
      fetch(`${API}/api/stats`).then(r => r.json()).then(setStats), 30000);
    return () => clearInterval(iv);
  }, []);

  async function startScrape() {
    setAdminError("");
    setScraping(true);
    try {
      const resp = await fetch(`${API}/api/scrape/start`, {
        method: "POST",
        headers: { "X-Admin-Key": adminKey },
      });
      if (resp.status === 401) {
        // Maybe they just want to view health, not trigger a scrape yet —
        // but wrong key either way
        setAdminError("Incorrect admin key.");
        return;
      }
      const key = adminKey;
      setSavedKey(key);
      setShowAdminModal(false);
      setAdminKey("");
      setTimeout(() => fetch(`${API}/api/scrape/runs`).then(r => r.json()).then(setRuns), 2000);
      fetch(`${API}/api/admin/health`, { headers: { "X-Admin-Key": key } })
        .then(r => r.json()).then(setHealth);
    } finally {
      setScraping(false);
    }
  }

  // Build heatmap grid: indexed by [day][hour]
  const heatGrid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let heatMax = 0;
  for (const cell of heatmap) {
    heatGrid[cell.day][cell.hour] = cell.changes;
    if (cell.changes > heatMax) heatMax = cell.changes;
  }

  if (!stats) return <div style={{ color: T.textMuted, textAlign: "center", padding: 80, fontSize: 15 }}>Loading…</div>;

  const pieData = [
    { name: "Approved", value: stats.approved, color: COLORS.approved },
    { name: "Pending",  value: stats.pending,  color: COLORS.pending },
    { name: "RFE",      value: stats.rfe,       color: COLORS.rfe },
    { name: "Denied",   value: stats.denied,    color: COLORS.denied },
    { name: "Other",    value: Math.max(0, stats.total_cases - stats.approved - stats.pending - stats.rfe - stats.denied), color: COLORS.other },
  ].filter(d => d.value > 0);

  const timelines = analytics?.processing_timelines ?? [];
  const timelineChartData = Object.values(
    timelines
      .filter(t => ppToggle === null || t.premium_processing === ppToggle)
      .reduce((acc, t) => {
        if (!acc[t.service_center]) acc[t.service_center] = { sc: t.service_center, std: null, pp: null };
        if (t.premium_processing) acc[t.service_center].pp = t.median_days;
        else acc[t.service_center].std = t.median_days;
        return acc;
      }, {})
  );

  const ppRows  = analytics?.pp_comparison      ?? [];
  const catRows = analytics?.category_breakdown ?? [];

  const tooltipStyle = {
    contentStyle: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13 },
    itemStyle: { color: T.text },
    labelStyle: { color: T.textSub },
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 3 }}>Analytics Dashboard</h1>
          {stats.last_updated && (
            <div style={{ color: T.textMuted, fontSize: 13 }}>
              Last scraped: {new Date(stats.last_updated).toLocaleString()}
              <span style={{ marginLeft: 10, color: T.textMuted, fontSize: 12 }}>· Auto-runs every 6 hours</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {savedKey && (
            <Btn onClick={() =>
              fetch(`${API}/api/admin/health`, { headers: { "X-Admin-Key": savedKey } })
                .then(r => r.json()).then(setHealth)
            } variant="secondary">
              ↻ Refresh health
            </Btn>
          )}
          <Btn onClick={() => setShowAdminModal(true)} variant="secondary">
            {savedKey ? "Run scraper now" : "🔒 Admin"}
          </Btn>
        </div>

        {/* Admin modal */}
        {showAdminModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
          }} onClick={e => e.target === e.currentTarget && setShowAdminModal(false)}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 32, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Admin access required</div>
              <div style={{ color: T.textSub, fontSize: 14, marginBottom: 20 }}>Enter the admin key to trigger a scrape run.</div>
              <input
                type="password"
                value={adminKey}
                onChange={e => setAdminKey(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startScrape()}
                placeholder="Admin key"
                autoFocus
                style={{ background: T.inputBg, border: `1px solid ${adminError ? COLORS.rfe : T.border}`, borderRadius: 7, padding: "10px 13px", color: T.text, fontSize: 14, outline: "none", width: "100%", marginBottom: 8 }}
              />
              {adminError && <div style={{ color: COLORS.rfe, fontSize: 13, marginBottom: 10 }}>{adminError}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                <Btn onClick={startScrape} disabled={scraping || !adminKey}>
                  {scraping ? "Starting…" : "Run scraper"}
                </Btn>
                <Btn onClick={async () => {
                  // Just load health without triggering scrape
                  const resp = await fetch(`${API}/api/admin/health`, { headers: { "X-Admin-Key": adminKey } });
                  if (resp.status === 401) { setAdminError("Incorrect admin key."); return; }
                  const data = await resp.json();
                  setSavedKey(adminKey);
                  setHealth(data);
                  setShowAdminModal(false);
                  setAdminKey("");
                  setAdminError("");
                }} disabled={!adminKey} variant="secondary">
                  View health only
                </Btn>
                <Btn onClick={() => { setShowAdminModal(false); setAdminKey(""); setAdminError(""); }} variant="secondary">
                  Cancel
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Total Cases"   value={stats.total_cases} color={T.accent} />
        <StatCard label="Approved"      value={stats.approved}    sub={`${stats.approval_rate}% approval rate`} color={COLORS.approved} />
        <StatCard label="Pending"       value={stats.pending}     color={COLORS.pending} />
        <StatCard label="RFE Issued"    value={stats.rfe}         color={COLORS.rfe} />
        <StatCard label="Denied"        value={stats.denied}      color={COLORS.denied} />
      </div>

      {/* Wave alerts banner */}
      {waves.length > 0 && (
        <div style={{
          background: `${COLORS.approved}0e`,
          border: `1px solid ${COLORS.approved}44`,
          borderLeft: `4px solid ${COLORS.approved}`,
          borderRadius: 10, padding: "14px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 20 }}>Wave</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: COLORS.approved, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              Approval waves detected in the last 7 days
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {waves.map(w => (
                <span key={w.block} style={{
                  background: `${COLORS.approved}18`, border: `1px solid ${COLORS.approved}44`,
                  borderRadius: 5, padding: "3px 10px", color: COLORS.approved, fontSize: 13, fontWeight: 600,
                  fontFamily: "'DM Mono', monospace",
                }}>
                  Block {w.block} · {w.recent_approvals} approvals
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Status Breakdown">
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={stats.status_breakdown.slice(0, 8)} layout="vertical">
              <XAxis type="number" tick={{ fill: T.textMuted, fontSize: 12 }} />
              <YAxis type="category" dataKey="status" width={210}
                tick={{ fill: T.textSub, fontSize: 12 }}
                tickFormatter={s => s.length > 32 ? s.slice(0, 32) + "…" : s} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                {stats.status_breakdown.slice(0, 8).map((e, i) => (
                  <Cell key={i} fill={statusColor(e.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Overall Distribution">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PieChart width={170} height={170}>
              <Pie data={pieData} cx={80} cy={80} innerRadius={48} outerRadius={76} dataKey="value" paddingAngle={2}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ width: "100%", marginTop: 6 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: d.color }} />
                    <span style={{ color: T.textSub, fontSize: 14 }}>{d.name}</span>
                  </div>
                  <span style={{ color: T.text, fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                    {d.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Median Days to Approval by Service Center">
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[{ label: "All", val: null }, { label: "Standard", val: false }, { label: "Premium", val: true }].map(opt => (
              <button key={String(opt.val)} onClick={() => setPpToggle(opt.val)} style={{
                background: ppToggle === opt.val ? T.accent : T.inputBg,
                border: `1px solid ${ppToggle === opt.val ? T.accent : T.border}`,
                borderRadius: 6,
                padding: "5px 14px",
                color: ppToggle === opt.val ? "#fff" : T.textSub,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}>
                {opt.label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timelineChartData}>
              <XAxis dataKey="sc" tick={{ fill: T.textSub, fontSize: 13 }} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 12 }} unit=" d" />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: T.textSub, fontSize: 13 }} />
              <Bar dataKey="std" name="Standard" fill={T.accent}        radius={[4, 4, 0, 0]} />
              <Bar dataKey="pp"  name="Premium"  fill={COLORS.approved} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="By Category">
            {catRows.map(r => (
              <div key={r.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{r.category}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: T.textMuted, fontSize: 13 }}>{r.total.toLocaleString()}</span>
                  <Badge text={`${r.approval_rate}%`} color={COLORS.approved} />
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="By Service Center">
            {stats.by_service_center.map(sc => (
              <div key={sc.service_center} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.text, fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600 }}>{sc.service_center}</span>
                <span style={{ color: T.accent, fontSize: 14, fontWeight: 600 }}>{sc.count.toLocaleString()}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>

      {/* PP comparison */}
      {ppRows.length > 0 && (
        <Panel title="Premium vs Standard Processing" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {ppRows.map(r => (
              <div key={String(r.premium_processing)} style={{
                background: T.bg,
                border: `1px solid ${r.premium_processing ? COLORS.approved : T.accent}33`,
                borderLeft: `4px solid ${r.premium_processing ? COLORS.approved : T.accent}`,
                borderRadius: 8,
                padding: "18px 22px",
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: r.premium_processing ? COLORS.approved : T.accent }}>
                  {r.premium_processing ? "⚡ Premium Processing" : "Standard Processing"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 14 }}>
                  {[
                    { l: "Total",    v: r.total },
                    { l: "Approved", v: r.approved },
                    { l: "Rate",     v: `${r.approval_rate}%` },
                    { l: "Avg Days", v: r.avg_approval_days ? `${r.avg_approval_days}d` : "—" },
                  ].map(item => (
                    <div key={item.l}>
                      <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", marginBottom: 5 }}>{item.l}</div>
                      <div style={{ color: T.text, fontFamily: "'DM Mono', monospace", fontSize: 17, fontWeight: 700 }}>{item.v?.toLocaleString?.() ?? item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Admin health panel — visible once admin key is used */}
      {health && (
        <Panel title="Admin Health Dashboard" style={{ marginBottom: 20, borderTop: `3px solid ${T.accent}` }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
            {/* Last successful run */}
            <div style={{ background: T.bg, borderRadius: 8, padding: "16px 18px", border: `1px solid ${T.border}` }}>
              <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Last Successful Run</div>
              <div style={{ color: health.last_successful_run ? COLORS.approved : COLORS.rfe, fontSize: 14, fontWeight: 600 }}>
                {health.last_successful_run ? new Date(health.last_successful_run).toLocaleString() : "Never"}
              </div>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>
                Status: <span style={{ color: health.last_run_status === "completed" ? COLORS.approved : health.last_run_status === "failed" ? COLORS.rfe : COLORS.pending, fontWeight: 600 }}>
                  {health.last_run_status ?? "—"}
                </span>
              </div>
            </div>

            {/* Status changes 24h */}
            <div style={{ background: T.bg, borderRadius: 8, padding: "16px 18px", border: `1px solid ${T.border}` }}>
              <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Status Changes (24h)</div>
              <div style={{ color: T.accent, fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                {health.status_changes_24h}
              </div>
              <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>
                Runs: {health.runs_24h.completed} ok · {health.runs_24h.failed} failed · {health.runs_24h.running} running
              </div>
            </div>

            {/* Block rate */}
            <div style={{ background: T.bg, borderRadius: 8, padding: "16px 18px", border: `1px solid ${T.border}` }}>
              <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Last Run Request Stats</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Successful</div>
                  <div style={{ color: COLORS.approved, fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{health.last_run_stats.successful.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Blocked</div>
                  <div style={{ color: COLORS.rfe, fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{health.last_run_stats.blocked.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Block Rate</div>
                  <div style={{ color: health.last_run_stats.block_rate > 10 ? COLORS.rfe : COLORS.pending, fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {health.last_run_stats.block_rate}%
                  </div>
                </div>
              </div>
              {/* Blocked vs successful bar */}
              <div style={{ marginTop: 10, background: COLORS.rfe + "33", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${100 - health.last_run_stats.block_rate}%`, height: "100%", background: COLORS.approved, borderRadius: 4 }} />
              </div>
            </div>
          </div>

          <div style={{ color: T.textMuted, fontSize: 12 }}>
            Scraper: API primary → browser (patchright CF bypass) on 503. CF cookies persist for 1 hr.
          </div>
        </Panel>
      )}

      {/* Activity heatmap */}
      {heatmap.length > 0 && (
        <Panel title="USCIS Activity Heatmap — Status Changes (Last 30 Days)" style={{ marginBottom: 20 }}>
          <p style={{ color: T.textSub, fontSize: 13, marginBottom: 14 }}>
            Each cell shows the number of case status changes by day of week and hour (UTC). Darker = more activity.
          </p>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `56px repeat(24, 1fr)`, gap: 2, minWidth: 600 }}>
              {/* Header row: hours */}
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} style={{ color: T.textMuted, fontSize: 10, textAlign: "center", paddingBottom: 4 }}>
                  {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
                </div>
              ))}
              {/* Rows: days */}
              {DAYS.map((day, d) => (
                <Fragment key={d}>
                  <div style={{ color: T.textSub, fontSize: 12, display: "flex", alignItems: "center", paddingRight: 8, fontWeight: 500 }}>{day}</div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const count = heatGrid[d][h];
                    const intensity = heatMax > 0 ? count / heatMax : 0;
                    return (
                      <div key={`${d}-${h}`} title={`${day} ${h}:00 — ${count} changes`} style={{
                        height: 18, borderRadius: 3,
                        background: intensity > 0
                          ? `rgba(99, 102, 241, ${0.12 + intensity * 0.85})`
                          : T.border,
                        cursor: count > 0 ? "pointer" : "default",
                      }} />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{ color: T.textMuted, fontSize: 12 }}>Less</span>
            {[0.1, 0.3, 0.55, 0.75, 1].map(i => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: `rgba(99, 102, 241, ${0.12 + i * 0.85})` }} />
            ))}
            <span style={{ color: T.textMuted, fontSize: 12 }}>More</span>
          </div>
        </Panel>
      )}

      {/* Scrape history */}
      {runs.length > 0 && (
        <Panel title="Scrape History">
          {runs.slice(0, 5).map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
              <span style={{ color: T.textMuted, fontFamily: "'DM Mono', monospace" }}>{new Date(r.started_at).toLocaleString()}</span>
              <span style={{ color: T.textSub }}>{r.cases_checked?.toLocaleString()} checked · {r.cases_found} found</span>
              <span style={{ color: r.status === "completed" ? COLORS.approved : r.status === "failed" ? COLORS.rfe : COLORS.pending, fontWeight: 600 }}>
                {r.status}
              </span>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
