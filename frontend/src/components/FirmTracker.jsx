import { useState, useEffect } from "react";
import { API, T, COLORS, Panel } from "./shared";

export default function FirmTracker() {
  const [firms, setFirms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("total");
  const [dir, setDir]       = useState(-1);

  useEffect(() => {
    fetch(`${API}/api/analytics/firms`)
      .then(r => r.json())
      .then(d => setFirms(d.firms ?? []))
      .finally(() => setLoading(false));
  }, []);

  function toggleSort(col) {
    if (sortBy === col) setDir(d => -d);
    else { setSortBy(col); setDir(-1); }
  }

  const sorted = [...firms].sort((a, b) => {
    const av = a[sortBy] ?? -1, bv = b[sortBy] ?? -1;
    return dir * (bv - av);
  });

  const maxTotal = Math.max(...firms.map(f => f.total), 1);

  function Hdr({ col, label, right }) {
    const active = sortBy === col;
    return (
      <th onClick={() => toggleSort(col)} style={{
        color: active ? T.text : T.textMuted, fontSize: 12, textTransform: "uppercase",
        letterSpacing: "0.06em", fontWeight: 600,
        padding: "12px 16px", textAlign: right ? "right" : "left",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        background: T.bg, borderBottom: `1px solid ${T.border}`,
      }}>
        {label} {active ? (dir === -1 ? "↓" : "↑") : ""}
      </th>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>Law Firm Tracker</h1>
      <p style={{ color: T.textSub, fontSize: 15, marginBottom: 26, lineHeight: 1.6 }}>
        Approval rates and processing times by law firm, based on user-submitted cases. Click any column to sort.
      </p>

      {loading && <div style={{ color: T.textMuted, textAlign: "center", padding: 60, fontSize: 15 }}>Loading…</div>}

      {!loading && firms.length === 0 && (
        <Panel>
          <div style={{ color: T.textMuted, textAlign: "center", padding: 48, fontSize: 15 }}>
            No firm data yet. Submit cases via the <strong>Submit Case</strong> tab to populate this view.
          </div>
        </Panel>
      )}

      {!loading && firms.length > 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Hdr col="law_firm"         label="Firm / Representative" />
                <Hdr col="total"            label="Cases"    right />
                <Hdr col="approved"         label="Approved" right />
                <Hdr col="denied"           label="Denied"   right />
                <Hdr col="rfe"              label="RFE"      right />
                <Hdr col="approval_rate"    label="Approval %" right />
                <Hdr col="avg_approval_days" label="Avg Days" right />
              </tr>
            </thead>
            <tbody>
              {sorted.map((f, i) => {
                const barW = Math.round((f.total / maxTotal) * 100);
                const rateColor = f.approval_rate >= 70 ? COLORS.approved : f.approval_rate >= 45 ? COLORS.pending : COLORS.rfe;
                return (
                  <tr key={f.law_firm} style={{ borderTop: `1px solid ${T.border}`, background: i % 2 === 0 ? T.card : "#fafbfc" }}>
                    <td style={{ padding: "13px 16px", minWidth: 220 }}>
                      <div style={{ color: T.text, fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{f.law_firm}</div>
                      <div style={{ background: T.border, borderRadius: 3, height: 4, width: "100%", overflow: "hidden" }}>
                        <div style={{ width: `${barW}%`, height: "100%", background: rateColor, borderRadius: 3 }} />
                      </div>
                    </td>
                    <Td v={f.total.toLocaleString()}              color={T.textSub} />
                    <Td v={f.approved.toLocaleString()}            color={COLORS.approved} />
                    <Td v={f.denied.toLocaleString()}              color={f.denied > 0 ? COLORS.denied : T.textMuted} />
                    <Td v={f.rfe.toLocaleString()}                 color={f.rfe > 0 ? COLORS.rfe : T.textMuted} />
                    <Td v={`${f.approval_rate}%`}                  color={rateColor} bold />
                    <Td v={f.avg_approval_days ? `${f.avg_approval_days}d` : "—"} color={T.textSub} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Td({ v, color, bold }) {
  return (
    <td style={{ padding: "13px 16px", textAlign: "right", color, fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: bold ? 700 : 400, whiteSpace: "nowrap" }}>
      {v}
    </td>
  );
}
