import { useState, useEffect } from "react";
import { API, T, COLORS, Panel, Badge, Btn, Select, Input, useIsMobile } from "./shared";

const DEGREES    = ["PhD", "Master's", "Bachelor's", "Other"];
const CATEGORIES = ["NIW", "EB-1A"];
const CENTERS    = ["IOE", "NSC", "TSC", "LIN", "WAC"];
const OUTCOMES   = ["approved", "rfe", "pending", "denied"];
const RFE_REASONS = [
  "Merit and Ability",
  "National Importance",
  "Well Positioned",
  "Priority Date",
  "Documentation",
  "Other",
];

export default function Evidence() {
  const isMobile = useIsMobile();
  const [profiles, setProfiles]   = useState(null);
  const [rfeData, setRfeData]     = useState(null);
  const [filter, setFilter]       = useState({ category: "", service_center: "", degree: "" });
  const [form, setForm]             = useState({
    outcome: "pending", degree: "PhD", field: "",
    citations: "", publications: "", reviews: "", patents: "", years_experience: "",
    law_firm: "", had_rfe: false, rfe_reason: "", rfe_response_outcome: "",
  });
  // Verification state
  const [receiptInput, setReceiptInput] = useState("");
  const [verifying, setVerifying]       = useState(false);
  const [verifyError, setVerifyError]   = useState(null);
  const [verified, setVerified]         = useState(null); // {verify_token, category, service_center, premium_processing}
  const [submitting, setSubmitting]     = useState(false);
  const [submitMsg, setSubmitMsg]       = useState(null);
  const [tab, setTab]                   = useState("browse");

  useEffect(() => { loadProfiles(); loadRfe(); }, [filter]);

  async function loadProfiles() {
    const params = new URLSearchParams();
    if (filter.category)       params.set("category", filter.category);
    if (filter.service_center) params.set("service_center", filter.service_center);
    if (filter.degree)         params.set("degree", filter.degree);
    const r = await fetch(`${API}/api/profiles?${params}`);
    if (r.ok) setProfiles(await r.json());
  }

  async function loadRfe() {
    const params = new URLSearchParams();
    if (filter.category) params.set("category", filter.category);
    const r = await fetch(`${API}/api/profiles/rfe-analysis?${params}`);
    if (r.ok) setRfeData(await r.json());
  }

  async function verifyReceipt() {
    const r = receiptInput.trim().toUpperCase();
    if (!r) return;
    setVerifying(true); setVerifyError(null); setVerified(null);
    try {
      const resp = await fetch(`${API}/api/profiles/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_number: r }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail ?? "Verification failed");
      setVerified(data);
    } catch (e) {
      setVerifyError(e.message);
    } finally { setVerifying(false); }
  }

  async function submitProfile() {
    if (!verified) return;
    setSubmitting(true); setSubmitMsg(null);
    try {
      const body = {
        verify_token:     verified.verify_token,
        outcome:          form.outcome,
        degree:           form.degree,
        field:            form.field,
        citations:        form.citations        ? parseInt(form.citations)        : null,
        publications:     form.publications     ? parseInt(form.publications)     : null,
        reviews:          form.reviews          ? parseInt(form.reviews)          : null,
        patents:          form.patents          ? parseInt(form.patents)          : null,
        years_experience: form.years_experience ? parseInt(form.years_experience) : null,
        law_firm:         form.law_firm || null,
        had_rfe:          form.had_rfe,
        rfe_reason:       form.had_rfe ? (form.rfe_reason || null) : null,
        rfe_response_outcome: form.had_rfe ? (form.rfe_response_outcome || null) : null,
      };
      const resp = await fetch(`${API}/api/profiles/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail ?? "Submission failed");
      setSubmitMsg({ ok: true, text: "Profile submitted. Thank you for contributing!" });
      setVerified(null); setReceiptInput(""); setTab("browse");
      loadProfiles(); loadRfe();
    } catch (e) {
      setSubmitMsg({ ok: false, text: e.message });
    } finally { setSubmitting(false); }
  }

  const p = profiles;

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>Evidence Library</h1>
      <p style={{ color: T.textSub, fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
        Anonymized community profiles help everyone benchmark their credentials and understand approval patterns.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, borderBottom: `1px solid ${T.border}`, paddingBottom: 1 }}>
        {[{ id: "browse", label: "Browse & Benchmark" }, { id: "submit", label: "Submit My Profile" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "transparent", border: "none", borderBottom: `2px solid ${tab === t.id ? T.accent : "transparent"}`,
            padding: "8px 16px", color: tab === t.id ? T.accent : T.textMuted, fontSize: 14,
            fontWeight: tab === t.id ? 600 : 500, cursor: "pointer", marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "browse" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <Select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ width: 130 }}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={filter.service_center} onChange={e => setFilter(f => ({ ...f, service_center: e.target.value }))} style={{ width: 130 }}>
              <option value="">All centers</option>
              {CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={filter.degree} onChange={e => setFilter(f => ({ ...f, degree: e.target.value }))} style={{ width: 140 }}>
              <option value="">All degrees</option>
              {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>

          {!p && <div style={{ color: T.textMuted, fontSize: 14 }}>Loading profiles…</div>}

          {p && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Summary stats */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { l: "Total Profiles", v: p.total,                           color: T.accent },
                  { l: "Approval Rate",  v: `${p.approval_rate}%`,             color: COLORS.approved },
                  { l: "RFE Rate",       v: `${p.rfe_rate}%`,                  color: COLORS.rfe },
                  { l: "Avg Citations",  v: p.avg_citations != null ? Math.round(p.avg_citations) : "—", color: T.textSub },
                ].map(item => (
                  <div key={item.l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{item.l}</div>
                    <div style={{ color: item.color, fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{item.v?.toLocaleString?.() ?? item.v}</div>
                  </div>
                ))}
              </div>

              {/* By outcome */}
              {p.by_outcome?.length > 0 && (
                <Panel title="Outcome Breakdown">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {p.by_outcome.map(r => (
                      <div key={r.outcome} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 80, color: T.text, fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{r.outcome}</div>
                        <div style={{ flex: 1, background: T.border, borderRadius: 4, height: 10, overflow: "hidden" }}>
                          <div style={{ width: `${(r.count / p.total) * 100}%`, height: "100%", background: r.outcome === "approved" ? COLORS.approved : r.outcome === "rfe" ? COLORS.rfe : r.outcome === "denied" ? COLORS.denied : COLORS.pending, borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                        <div style={{ width: 50, color: T.textSub, fontSize: 14, fontFamily: "'DM Mono', monospace", textAlign: "right" }}>{r.count}</div>
                        <div style={{ width: 44, color: T.textMuted, fontSize: 13, textAlign: "right" }}>{r.pct}%</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* By degree */}
              {p.by_degree?.length > 0 && (
                <Panel title="Approval Rate by Degree">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {p.by_degree.map(r => (
                      <div key={r.degree} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px" }}>
                        <div style={{ color: T.textSub, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{r.degree}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: COLORS.approved, fontSize: 20, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{r.approval_rate}%</span>
                          <span style={{ color: T.textMuted, fontSize: 13 }}>{r.total} profiles</span>
                        </div>
                        {r.rfe_rate > 0 && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>RFE rate: {r.rfe_rate}%</div>}
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* Median citations */}
              {p.by_degree?.length > 0 && (
                <Panel title="Credential Benchmarks (Approved Profiles)">
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead>
                        <tr>
                          {["Degree", "Avg Citations", "Avg Pubs", "Avg Reviews", "Count"].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: T.textMuted, fontWeight: 600, fontSize: 12, textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {p.by_degree.map((r, i) => (
                          <tr key={r.degree} style={{ background: i % 2 === 1 ? T.bg : T.card }}>
                            <td style={{ padding: "10px 12px", color: T.text, fontWeight: 600 }}>{r.degree}</td>
                            <td style={{ padding: "10px 12px", color: T.accent, fontFamily: "'DM Mono', monospace" }}>{r.avg_citations != null ? Math.round(r.avg_citations) : "—"}</td>
                            <td style={{ padding: "10px 12px", color: T.textSub, fontFamily: "'DM Mono', monospace" }}>{r.avg_publications != null ? Math.round(r.avg_publications) : "—"}</td>
                            <td style={{ padding: "10px 12px", color: T.textSub, fontFamily: "'DM Mono', monospace" }}>{r.avg_reviews != null ? Math.round(r.avg_reviews) : "—"}</td>
                            <td style={{ padding: "10px 12px", color: T.textMuted }}>{r.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              )}

              {/* RFE analysis */}
              {rfeData && rfeData.rfe_profiles > 0 && (
                <Panel title="RFE Analysis">
                  <p style={{ color: T.textSub, fontSize: 14, marginBottom: 16 }}>
                    Based on <strong>{rfeData.rfe_profiles}</strong> community-reported RFE cases.
                    Overall RFE response approval rate: <strong style={{ color: COLORS.approved }}>{rfeData.rfe_response_approval_rate}%</strong>
                  </p>
                  {rfeData.by_reason?.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {rfeData.by_reason.map(r => (
                        <div key={r.reason} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{r.reason}</span>
                            <div style={{ display: "flex", gap: 8 }}>
                              <Badge text={`${r.count} cases`} color={COLORS.rfe} />
                              {r.approval_rate != null && <Badge text={`${r.approval_rate}% approved`} color={COLORS.approved} />}
                            </div>
                          </div>
                          <div style={{ background: T.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
                            <div style={{ width: `${(r.count / rfeData.rfe_profiles) * 100}%`, height: "100%", background: COLORS.rfe, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "submit" && (
        <Panel title="Submit Your Anonymized Profile">
          {/* Step 1: Receipt verification */}
          <div style={{
            background: verified ? `${COLORS.approved}0a` : T.bg,
            border: `1px solid ${verified ? COLORS.approved : T.border}`,
            borderRadius: 8, padding: "18px 20px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Step 1 — Verify your receipt number
            </div>
            {!verified ? (
              <>
                <p style={{ color: T.textSub, fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
                  Enter your I-140 receipt number. We verify it's real with USCIS, then discard it — your profile is stored with no identifiers.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Input
                    value={receiptInput}
                    onChange={e => setReceiptInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && verifyReceipt()}
                    placeholder="e.g. IOE2512345678"
                    style={{ maxWidth: 280, fontFamily: "'DM Mono', monospace" }}
                  />
                  <Btn onClick={verifyReceipt} disabled={verifying || !receiptInput}>
                    {verifying ? "Verifying…" : "Verify"}
                  </Btn>
                </div>
                {verifyError && (
                  <div style={{ color: COLORS.rfe, fontSize: 14, marginTop: 10 }}>{verifyError}</div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ color: COLORS.approved, fontSize: 18 }}>✓</span>
                  <div>
                    <div style={{ color: COLORS.approved, fontWeight: 700, fontSize: 14 }}>Receipt verified</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>
                      {verified.category} · {verified.service_center} · {verified.premium_processing ? "Premium" : "Standard"} — receipt number discarded
                    </div>
                  </div>
                </div>
                <button onClick={() => { setVerified(null); setReceiptInput(""); }} style={{
                  background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", textDecoration: "underline",
                }}>Re-verify</button>
              </div>
            )}
          </div>

          {/* Step 2: Profile form — only shown after verification */}
          {verified && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                Step 2 — Fill in your profile
              </div>

              <p style={{ color: T.textSub, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                All data is anonymized. No names or receipt numbers are stored.
                Category, service center, and processing type were confirmed by USCIS above.
              </p>

              {/* Locked verified fields */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { l: "Category",       v: verified.category },
                  { l: "Service Center", v: verified.service_center },
                  { l: "Processing",     v: verified.premium_processing ? "Premium" : "Standard" },
                ].map(item => (
                  <div key={item.l} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 7, padding: "10px 14px" }}>
                    <div style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{item.l}</div>
                    <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{item.v}</div>
                    <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>Verified · locked</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", color: T.textSub, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Outcome *</label>
                  <Select value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} style={{ width: "100%" }}>
                    {OUTCOMES.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </Select>
                </div>
                <div>
                  <label style={{ display: "block", color: T.textSub, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Degree *</label>
                  <Select value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} style={{ width: "100%" }}>
                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", color: T.textSub, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Field / Discipline *</label>
                  <Input value={form.field} onChange={e => setForm(f => ({ ...f, field: e.target.value }))} placeholder="e.g. Computer Science, Electrical Engineering, Biology" />
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ color: T.textSub, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Credentials (optional — helps community benchmarking)</div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: 12 }}>
                  {[
                    { key: "citations",        label: "Citations" },
                    { key: "publications",     label: "Publications" },
                    { key: "reviews",          label: "Peer Reviews" },
                    { key: "patents",          label: "Patents" },
                    { key: "years_experience", label: "Yrs Experience" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ display: "block", color: T.textMuted, fontSize: 12, marginBottom: 5 }}>{label}</label>
                      <Input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder="0" style={{ textAlign: "center" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={{ display: "block", color: T.textSub, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Law Firm (optional)</label>
                <Input value={form.law_firm} onChange={e => setForm(f => ({ ...f, law_firm: e.target.value }))} placeholder="Law firm name (or leave blank)" style={{ maxWidth: 320 }} />
              </div>

              {/* RFE section */}
              <div style={{ marginTop: 20, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.had_rfe ? 16 : 0 }}>
                  <div onClick={() => setForm(f => ({ ...f, had_rfe: !f.had_rfe }))}
                    style={{ width: 42, height: 24, borderRadius: 12, background: form.had_rfe ? COLORS.rfe : T.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.had_rfe ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ color: T.textSub, fontSize: 14, fontWeight: 600 }}>I received an RFE</span>
                </div>
                {form.had_rfe && (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", color: T.textMuted, fontSize: 12, marginBottom: 5 }}>RFE Reason</label>
                      <Select value={form.rfe_reason} onChange={e => setForm(f => ({ ...f, rfe_reason: e.target.value }))} style={{ width: "100%" }}>
                        <option value="">Select reason</option>
                        {RFE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </Select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: T.textMuted, fontSize: 12, marginBottom: 5 }}>RFE Response Outcome</label>
                      <Select value={form.rfe_response_outcome} onChange={e => setForm(f => ({ ...f, rfe_response_outcome: e.target.value }))} style={{ width: "100%" }}>
                        <option value="">Select outcome</option>
                        <option value="approved">Approved</option>
                        <option value="denied">Denied</option>
                        <option value="pending">Still pending</option>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {submitMsg && (
                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 7, background: submitMsg.ok ? `${COLORS.approved}15` : `${COLORS.rfe}15`, border: `1px solid ${submitMsg.ok ? COLORS.approved : COLORS.rfe}33`, color: submitMsg.ok ? COLORS.approved : COLORS.rfe, fontSize: 14 }}>
                  {submitMsg.text}
                </div>
              )}

              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <Btn onClick={submitProfile} disabled={submitting || !form.field}>
                  {submitting ? "Submitting…" : "Submit Profile"}
                </Btn>
                <span style={{ color: T.textMuted, fontSize: 13, alignSelf: "center" }}>Fully anonymous · No account needed</span>
              </div>
            </>
          )}
        </Panel>
      )}
    </div>
  );
}
