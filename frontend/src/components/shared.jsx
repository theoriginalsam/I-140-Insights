export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Light mode theme tokens
export const T = {
  bg:         "#f4f5f8",
  card:       "#ffffff",
  border:     "#e5e7eb",
  border2:    "#d1d5db",
  text:       "#111827",
  textSub:    "#4b5563",
  textMuted:  "#9ca3af",
  inputBg:    "#f9fafb",
  headerBg:   "#ffffff",
  accent:     "#6366f1",
  accentBg:   "#eef2ff",
};

export const COLORS = {
  approved: "#16a34a",
  pending:  "#d97706",
  rfe:      "#dc2626",
  denied:   "#b91c1c",
  review:   "#7c3aed",
  other:    "#6366f1",
};

export function statusColor(status = "") {
  const s = status.toLowerCase();
  if (s.includes("approved") || s.includes("card was produced")) return COLORS.approved;
  if (s.includes("denied"))                                        return COLORS.denied;
  if (s.includes("request for evidence"))                         return COLORS.rfe;
  if (s.includes("actively reviewing"))                           return COLORS.review;
  if (s.includes("received") || s.includes("initial review"))    return COLORS.pending;
  return COLORS.other;
}

export function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: 10,
      padding: "22px 26px",
      flex: 1,
      minWidth: 150,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ color, fontSize: 34, fontWeight: 700, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
        {value?.toLocaleString() ?? "—"}
      </div>
      {sub && <div style={{ color: T.textMuted, fontSize: 13, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function Panel({ title, children, style }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      ...style,
    }}>
      {title && (
        <div style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 18 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({ text, color }) {
  return (
    <span style={{
      background: `${color}18`,
      color,
      border: `1px solid ${color}33`,
      borderRadius: 5,
      padding: "3px 9px",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
}

export function Input({ value, onChange, onKeyDown, placeholder, style, ...rest }) {
  return (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      {...rest}
      style={{
        background: T.inputBg,
        border: `1px solid ${T.border}`,
        borderRadius: 7,
        padding: "9px 13px",
        color: T.text,
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        outline: "none",
        width: "100%",
        ...style,
      }}
    />
  );
}

export function Select({ value, onChange, children, style }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        background: T.inputBg,
        border: `1px solid ${T.border}`,
        borderRadius: 7,
        padding: "9px 13px",
        color: T.text,
        fontSize: 14,
        outline: "none",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

export function Btn({ children, onClick, disabled, variant = "primary", style }) {
  const base = {
    border: "none",
    borderRadius: 7,
    padding: "9px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    fontFamily: "'Inter', sans-serif",
    ...style,
  };
  if (variant === "primary") return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.accent, color: "#fff" }}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: T.card, border: `1px solid ${T.border}`, color: T.textSub }}>
      {children}
    </button>
  );
}
