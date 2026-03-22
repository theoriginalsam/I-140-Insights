import { useState, useEffect, useCallback } from "react";
import { API, T, statusColor, Badge, Panel, Input, Select, Btn, useIsMobile } from "./shared";

const CENTERS = ["", "IOE", "MSC", "EAC", "WAC", "LIN", "SRC", "NBC"];
const PAGE_SIZE = 50;

export default function CasesTable() {
  const isMobile = useIsMobile();
  const [cases, setCases]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    service_center: "", status: "", category: "",
    block: "", premium_processing: "", date_from: "", date_to: "",
  });

  const fetchCases = useCallback(async (f, p) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
    if (f.service_center)      params.set("service_center", f.service_center);
    if (f.status)              params.set("status", f.status);
    if (f.category)            params.set("category", f.category);
    if (f.block)               params.set("block", f.block);
    if (f.date_from)           params.set("date_from", f.date_from);
    if (f.date_to)             params.set("date_to", f.date_to);
    if (f.premium_processing !== "") params.set("premium_processing", f.premium_processing);
    try {
      const d = await fetch(`${API}/api/cases?${params}`).then(r => r.json());
      setCases(d.cases ?? []);
      setTotal(d.total ?? 0);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCases(filters, page); }, [page]);

  function apply()  { setPage(1); fetchCases(filters, 1); }
  function reset()  {
    const e = { service_center: "", status: "", category: "", block: "", premium_processing: "", date_from: "", date_to: "" };
    setFilters(e); setPage(1); fetchCases(e, 1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 22 }}>Cases</h1>

      {/* Filters */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
          <div>
            <Label>Service Center</Label>
            <Select value={filters.service_center} onChange={e => setFilters(f => ({ ...f, service_center: e.target.value }))} style={{ width: "100%" }}>
              {CENTERS.map(c => <option key={c} value={c}>{c || "All"}</option>)}
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} style={{ width: "100%" }}>
              <option value="">All</option>
              <option value="NIW">NIW</option>
              <option value="EB-1A">EB-1A</option>
            </Select>
          </div>
          <div>
            <Label>Premium Processing</Label>
            <Select value={filters.premium_processing} onChange={e => setFilters(f => ({ ...f, premium_processing: e.target.value }))} style={{ width: "100%" }}>
              <option value="">All</option>
              <option value="true">Premium only</option>
              <option value="false">Standard only</option>
            </Select>
          </div>
          <div>
            <Label>Status keyword</Label>
            <Input value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} placeholder="e.g. approved" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "160px 1fr 1fr auto auto", gap: 14, alignItems: "end" }}>
          <div>
            <Label>Receipt Block</Label>
            <Input value={filters.block} onChange={e => setFilters(f => ({ ...f, block: e.target.value.toUpperCase() }))} placeholder="e.g. 24010" />
          </div>
          <div>
            <Label>From (year-month)</Label>
            <input type="month" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} style={monthStyle} />
          </div>
          <div>
            <Label>To (year-month)</Label>
            <input type="month" value={filters.date_to} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} style={monthStyle} />
          </div>
          <Btn onClick={apply} disabled={loading}>Apply</Btn>
          <Btn onClick={reset} variant="secondary">Reset</Btn>
        </div>

        <div style={{ marginTop: 12, color: T.textMuted, fontSize: 13 }}>
          {total.toLocaleString()} result{total !== 1 ? "s" : ""}
        </div>
      </Panel>

      {/* Table */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: 680 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.7fr 0.65fr 0.65fr 0.55fr 1.8fr 1fr", background: T.bg, padding: "11px 18px", gap: 14, borderBottom: `1px solid ${T.border}` }}>
              {["Receipt #", "Center", "Category", "Block", "PP", "Status", "Updated"].map(h => (
                <div key={h} style={{ color: T.textMuted, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{h}</div>
              ))}
            </div>

            {loading && <div style={{ color: T.textMuted, textAlign: "center", padding: 48, fontSize: 15 }}>Loading…</div>}
            {!loading && cases.length === 0 && (
              <div style={{ color: T.textMuted, textAlign: "center", padding: 48, fontSize: 15 }}>No cases match the current filters.</div>
            )}

            {!loading && cases.map((c, i) => (
              <div key={c.receipt_number} style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 0.7fr 0.65fr 0.65fr 0.55fr 1.8fr 1fr",
                padding: "12px 18px",
                gap: 14,
                borderTop: `1px solid ${T.border}`,
                alignItems: "center",
                background: i % 2 === 0 ? T.card : "#fafbfc",
              }}>
                <span style={{ fontFamily: "'DM Mono', monospace", color: T.accent, fontSize: 13, fontWeight: 600 }}>{c.receipt_number}</span>
                <span style={{ color: T.textSub, fontSize: 14 }}>{c.service_center}</span>
                <Badge text={c.category ?? "—"} color={c.category === "NIW" ? T.accent : "#7c3aed"} />
                <span style={{ color: T.textMuted, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>{c.block ?? "—"}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: c.premium_processing ? COLORS_approved : T.textMuted }}>
                  {c.premium_processing ? "PP" : "Std"}
                </span>
                <span style={{ color: statusColor(c.status), fontSize: 13, fontWeight: 500 }}>
                  {c.status.length > 38 ? c.status.slice(0, 38) + "…" : c.status}
                </span>
                <span style={{ color: T.textMuted, fontSize: 13 }}>
                  {c.last_updated ? new Date(c.last_updated).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
          <Btn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="secondary">← Prev</Btn>
          <span style={{ color: T.textSub, fontSize: 14, alignSelf: "center" }}>Page {page} of {totalPages}</span>
          <Btn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="secondary">Next →</Btn>
        </div>
      )}
    </div>
  );
}

const COLORS_approved = "#16a34a";

function Label({ children }) {
  return <label style={{ display: "block", color: T.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7 }}>{children}</label>;
}

const monthStyle = {
  background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 7,
  padding: "9px 13px", color: T.text, fontSize: 14, outline: "none", width: "100%",
};
