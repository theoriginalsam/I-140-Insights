import { useState, useEffect, useRef } from "react";
import { API, T, COLORS, statusColor, Badge, Panel, Input, Btn } from "./shared";

function fireConfetti() {
  if (typeof window.confetti !== "function") return;
  window.confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => window.confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 300);
  setTimeout(() => window.confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 500);
}

export default function MyCase() {
  const [receipt, setReceipt] = useState("");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);
  const confettiFired         = useRef(false);

  const isApproved = data?.status?.toLowerCase().includes("approved");

  useEffect(() => {
    if (isApproved && !confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
  }, [isApproved]);

  async function lookup() {
    const r = receipt.trim().toUpperCase();
    if (!r) return;
    setLoading(true); setError(null); setData(null);
    confettiFired.current = false;
    try {
      const resp = await fetch(`${API}/api/cases/${r}/mycase`);
      if (!resp.ok) throw new Error((await resp.json()).detail ?? "Case not found");
      setData(await resp.json());
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  function shareCase() {
    const d = data;
    const pi = d.processing_info;
    const status = d.status ?? "Unknown";
    const center = d.service_center ?? "";
    const cat    = d.category ?? "";
    const pp     = d.premium_processing ? "Premium" : "Standard";
    const age    = d.age_days != null ? `${d.age_days} days` : "unknown days";

    let text = `My I-140 ${cat} case (${center}, ${pp}) has been pending for ${age}. Status: ${status}.`;
    if (pi?.is_outside_normal) {
      text += ` It's ${pi.days_outside} days OUTSIDE the normal processing window.`;
    } else if (pi?.days_until_outside != null) {
      text += ` ${pi.days_until_outside} days until outside normal processing.`;
    }
    text += ` Track yours at i140tracker.com`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const peer = data?.peer_comparison;
  const pi   = data?.processing_info;
  const pct  = data?.percentile_info;

  return (
    <div style={{ maxWidth: 740 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>My Case</h1>
      <p style={{ color: T.textSub, fontSize: 15, marginBottom: 26, lineHeight: 1.6 }}>
        Look up your case for a full timeline, peer comparison, and personalised insights.
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

          {/* Approved celebration banner */}
          {isApproved && (
            <div style={{
              background: `${COLORS.approved}12`,
              border: `2px solid ${COLORS.approved}55`,
              borderRadius: 12, padding: "20px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.approved, marginBottom: 4 }}>
                  Congratulations! Your I-140 was approved!
                </div>
                <div style={{ color: T.textSub, fontSize: 14 }}>Share your success to help others benchmark their timelines.</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn onClick={fireConfetti} variant="secondary">Celebrate</Btn>
                <Btn onClick={shareCase}>{copied ? "Copied!" : "Share"}</Btn>
              </div>
            </div>
          )}

          {/* Processing time countdown */}
          {pi && !isApproved && (
            <div style={{
              background: pi.is_outside_normal ? `${COLORS.rfe}10` : `${T.accent}08`,
              border: `1px solid ${pi.is_outside_normal ? COLORS.rfe : T.accent}33`,
              borderLeft: `4px solid ${pi.is_outside_normal ? COLORS.rfe : T.accent}`,
              borderRadius: 10, padding: "16px 20px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ color: pi.is_outside_normal ? COLORS.rfe : T.accent, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  {pi.is_outside_normal ? "Outside Normal Processing Window" : "Processing Time Countdown"}
                </div>
                {pi.is_outside_normal ? (
                  <div style={{ color: T.text, fontSize: 15 }}>
                    Your case is <strong style={{ color: COLORS.rfe }}>{pi.days_outside} days</strong> past the published processing window ({pi.max_days} days).
                    Consider filing an inquiry with USCIS.
                  </div>
                ) : (
                  <div style={{ color: T.text, fontSize: 15 }}>
                    <strong style={{ color: T.accent }}>{pi.days_until_outside} days</strong> until outside normal processing window.
                    Published range: {pi.min_days}–{pi.max_days} days.
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, marginLeft: 20 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, color: pi.is_outside_normal ? COLORS.rfe : T.accent, lineHeight: 1 }}>
                  {pi.is_outside_normal ? `+${pi.days_outside}` : pi.days_until_outside}
                </div>
                <div style={{ color: T.textMuted, fontSize: 11, textAlign: "center" }}>days</div>
              </div>
            </div>
          )}

          {/* Percentile rank */}
          {pct && (
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{
                width: 70, height: 70, borderRadius: "50%", flexShrink: 0,
                background: `conic-gradient(${T.accent} ${pct.percentile * 3.6}deg, ${T.border} 0)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: T.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: T.accent }}>{pct.percentile}%</span>
                </div>
              </div>
              <div>
                <div style={{ color: T.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                  {isApproved
                    ? `Your case was approved faster than ${pct.percentile}% of similar cases`
                    : `${pct.percentile}% of similar approved cases resolved faster`}
                </div>
                <div style={{ color: T.textMuted, fontSize: 13 }}>
                  Based on {pct.sample_size.toLocaleString()} approved {data.category} cases at {data.service_center}
                  {data.premium_processing ? " (premium)" : " (standard)"}.
                </div>
              </div>
            </div>
          )}

          {/* Case summary */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>Receipt Number</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, color: T.accent }}>
                  {data.receipt_number}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge text={data.status} color={statusColor(data.status)} />
                {!isApproved && (
                  <Btn onClick={shareCase} variant="secondary" style={{ fontSize: 13, padding: "5px 14px" }}>
                    {copied ? "Copied!" : "Share"}
                  </Btn>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 20 }}>
              {[
                { l: "Service Center", v: data.service_center },
                { l: "Category",       v: data.category ?? "—" },
                { l: "Processing",     v: data.premium_processing ? "Premium" : "Standard" },
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
                </div>
              )}
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}
