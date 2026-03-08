import { useState } from "react";
import { API, T, COLORS, statusColor, Badge, Panel, Input, Btn } from "./shared";

export default function MyCase() {
  const [receipt, setReceipt] = useState("");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function lookup() {
    const r = receipt.trim().toUpperCase();
    if (!r) return;
    setLoading(true); setError(null); setData(null);
    try {
      const resp = await fetch(`${API}/api/cases/${r}/mycase`);
      if (!resp.ok) throw new Error((await resp.json()).detail ?? "Case not found");
      setData(await resp.json());
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  const peer = data?.peer_comparison;

  return (
    <div style={{ maxWidth: 740 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>My Case</h1>
      <p style={{ color: T.textSub, fontSize: 15, marginBottom: 26, lineHeight: 1.6 }}>
        Look up your case for a full timeline and peer comparison within your receipt block.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
        <Input value={receipt} onChange={e => setReceipt(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && lookup()}
          placeholder="Receipt number (e.g. IOE2512345678)" style={{ maxWidth: 360 }} />
        <Btn onClick={lookup} disabled={loading}>{loading ? "Looking up…" : "Look up"}</Btn>
      </div>

      {error && <div style={{ color: COLORS.rfe, fontSize: 15, marginBottom: 20 }}>{error}</div>}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Case summary */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>Receipt Number</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: T.accent }}>
                  {data.receipt_number}
                </div>
              </div>
              <Badge text={data.status} color={statusColor(data.status)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 20 }}>
              {[
                { l: "Service Center", v: data.service_center },
                { l: "Category",       v: data.category ?? "—" },
                { l: "Processing",     v: data.premium_processing ? "⚡ Premium" : "Standard" },
                { l: "Case Age",       v: data.age_days != null ? `${data.age_days} days` : "—" },
                { l: "Received Date",  v: data.received_date ?? "—" },
                { l: "Priority Date",  v: data.priority_date ?? "—" },
                { l: "Law Firm",       v: data.law_firm ?? "—" },
                { l: "Last Updated",   v: data.last_updated ? new Date(data.last_updated).toLocaleDateString() : "—" },
              ].map(item => (
                <div key={item.l}>
                  <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>{item.l}</div>
                  <div style={{ color: T.text, fontSize: 14 }}>{item.v}</div>
                </div>
              ))}
            </div>

            {data.status_detail && (
              <div style={{ background: T.bg, borderRadius: 7, padding: "13px 16px", color: T.textSub, fontSize: 14, lineHeight: 1.7, borderLeft: `3px solid ${statusColor(data.status)}` }}>
                {data.status_detail}
              </div>
            )}
          </Panel>

          {/* Status history */}
          {data.status_history?.length > 0 && (
            <Panel title="Status Timeline">
              {data.status_history.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%", marginTop: 2, flexShrink: 0,
                      background: i === data.status_history.length - 1 ? statusColor(h.status) : "#fff",
                      border: `2px solid ${statusColor(h.status)}`,
                    }} />
                    {i < data.status_history.length - 1 && (
                      <div style={{ width: 2, height: 30, background: T.border, marginTop: 4 }} />
                    )}
                  </div>
                  <div>
                    <div style={{ color: statusColor(h.status), fontSize: 14, fontWeight: 600 }}>{h.status}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>
                      {new Date(h.recorded_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </Panel>
          )}

          {/* Peer comparison */}
          {peer && (
            <Panel title={`Block Comparison — ${peer.block}XXXXXX`}>
              <p style={{ color: T.textSub, fontSize: 14, marginBottom: 20 }}>
                Comparing your case against <strong>{peer.total.toLocaleString()}</strong> other cases in the same receipt block.
              </p>

              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: T.textSub, fontSize: 14 }}>Block approval rate</span>
                  <span style={{ color: COLORS.approved, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15 }}>
                    {peer.approval_rate}%
                  </span>
                </div>
                <div style={{ background: T.border, borderRadius: 5, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${peer.approval_rate}%`, height: "100%", background: COLORS.approved, borderRadius: 5, transition: "width 0.5s ease" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { l: "Total in block", v: peer.total,     color: T.accent },
                  { l: "Approved",       v: peer.approved,  color: COLORS.approved },
                  { l: "Pending",        v: peer.pending,   color: COLORS.pending },
                  { l: "Avg appr. days", v: peer.avg_approval_days ? `${peer.avg_approval_days}d` : "—", color: T.textSub },
                ].map(item => (
                  <div key={item.l} style={{ background: T.bg, borderRadius: 8, padding: "16px 18px", border: `1px solid ${T.border}` }}>
                    <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{item.l}</div>
                    <div style={{ color: item.color, fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                      {typeof item.v === "number" ? item.v.toLocaleString() : item.v}
                    </div>
                  </div>
                ))}
              </div>

              {data.status && (
                <div style={{
                  marginTop: 16, background: `${statusColor(data.status)}10`,
                  border: `1px solid ${statusColor(data.status)}33`,
                  borderRadius: 7, padding: "11px 16px",
                  color: statusColor(data.status), fontSize: 14, fontWeight: 500,
                }}>
                  Your case: <strong>{data.status}</strong>
                  {data.status.toLowerCase().includes("approved") ? " 🎉" : ""}
                </div>
              )}
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
