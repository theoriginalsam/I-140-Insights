import { useState } from "react";
import { API, T, COLORS, Panel, Input, Select, Btn, useIsMobile } from "./shared";

const LAW_FIRMS = [
  "Chen Immigration Law Associates",
  "North America Immigration Law Group",
  "Ellis Porter",
  "VisaNation",
  "Murthy Law Firm",
  "Fragomen",
  "Berry Appleman & Leiden",
  "Self-Petitioner",
  "Other",
];

const CENTERS = ["IOE", "MSC", "EAC", "WAC", "LIN", "SRC", "NBC"];
const RECEIPT_RE = /^[A-Z]{3}\d{10}$/;

export default function SubmitCase() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    receipt_number: "", category: "NIW", priority_date: "",
    premium_processing: false, law_firm: LAW_FIRMS[0], custom_firm: "", service_center: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [touched, setTouched] = useState(false);

  const receiptValid = RECEIPT_RE.test(form.receipt_number.toUpperCase());

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!receiptValid) return;

    const law_firm = form.law_firm === "Other" ? form.custom_firm : form.law_firm;
    setLoading(true); setResult(null);
    try {
      const resp = await fetch(`${API}/api/cases/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt_number: form.receipt_number.toUpperCase().trim(),
          category: form.category,
          priority_date: form.priority_date || null,
          premium_processing: form.premium_processing,
          law_firm: law_firm || null,
          service_center: form.service_center || null,
        }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setResult({ ok: true, message: `Case ${data.receipt_number} added.${data.verified ? " Verified with USCIS ✓" : " (USCIS offline — unverified)"}` });
        setForm(f => ({ ...f, receipt_number: "", priority_date: "" }));
        setTouched(false);
      } else {
        setResult({ ok: false, message: data.detail ?? "Submission failed." });
      }
    } catch {
      setResult({ ok: false, message: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>Submit Your Case</h1>
      <p style={{ color: T.textSub, fontSize: 15, marginBottom: 30, lineHeight: 1.6 }}>
        Add your I-140 case to the tracker. The receipt number is validated against the USCIS API before being stored.
      </p>

      <Panel>
        <form onSubmit={submit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            <div>
              <Label>Receipt Number *</Label>
              <Input
                value={form.receipt_number}
                onChange={e => set("receipt_number", e.target.value.toUpperCase())}
                placeholder="e.g. IOE2512345678"
              />
              {touched && !receiptValid && (
                <div style={{ color: COLORS.rfe, fontSize: 13, marginTop: 6 }}>
                  Must be 3 letters + 10 digits (e.g. IOE2512345678)
                </div>
              )}
              {form.receipt_number && receiptValid && (
                <div style={{ color: COLORS.approved, fontSize: 13, marginTop: 6 }}>✓ Valid format</div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onChange={e => set("category", e.target.value)} style={{ width: "100%" }}>
                  <option value="NIW">I-140 NIW — National Interest Waiver</option>
                  <option value="EB-1A">I-140 EB-1A — Extraordinary Ability</option>
                </Select>
              </div>
              <div>
                <Label>Service Center</Label>
                <Select value={form.service_center} onChange={e => set("service_center", e.target.value)} style={{ width: "100%" }}>
                  <option value="">Auto-detect from receipt</option>
                  {CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
              <div>
                <Label>Priority Date</Label>
                <input type="month" value={form.priority_date} onChange={e => set("priority_date", e.target.value)}
                  style={{ background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 13px", color: T.text, fontSize: 14, outline: "none", width: "100%" }} />
              </div>
              <div>
                <Label>Premium Processing</Label>
                <div onClick={() => set("premium_processing", !form.premium_processing)} style={{
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 7,
                  padding: "10px 14px", userSelect: "none",
                }}>
                  <div style={{ width: 38, height: 22, borderRadius: 11, background: form.premium_processing ? COLORS.approved : "#d1d5db", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.premium_processing ? 19 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ color: form.premium_processing ? COLORS.approved : T.textSub, fontSize: 14, fontWeight: 500 }}>
                    {form.premium_processing ? "Yes — Premium" : "No — Standard"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Law Firm / Representative</Label>
              <Select value={form.law_firm} onChange={e => set("law_firm", e.target.value)} style={{ width: "100%" }}>
                {LAW_FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
              {form.law_firm === "Other" && (
                <Input value={form.custom_firm} onChange={e => set("custom_firm", e.target.value)}
                  placeholder="Enter firm or attorney name" style={{ marginTop: 10 }} />
              )}
            </div>

            {result && (
              <div style={{
                background: result.ok ? `${COLORS.approved}12` : `${COLORS.rfe}12`,
                border: `1px solid ${result.ok ? COLORS.approved : COLORS.rfe}44`,
                borderRadius: 7, padding: "13px 16px",
                color: result.ok ? COLORS.approved : COLORS.rfe, fontSize: 14,
              }}>
                {result.message}
              </div>
            )}

            <div>
              <Btn disabled={loading}>{loading ? "Submitting…" : "Submit Case"}</Btn>
            </div>
          </div>
        </form>
      </Panel>

      <div style={{ marginTop: 18, color: T.textMuted, fontSize: 13, lineHeight: 1.8 }}>
        <strong style={{ color: T.textSub }}>Rate limit:</strong> 5 submissions per IP per 15 minutes.<br />
        <strong style={{ color: T.textSub }}>Verification:</strong> Receipt numbers are checked against USCIS before being stored.
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{children}</label>;
}
