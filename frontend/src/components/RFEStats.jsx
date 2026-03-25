import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { T, COLORS, Panel, StatCard, Badge, useIsMobile } from "./shared";

// ── Manually collected from publicly shared success stories (2026 RFE cases) ──
// 74 cases, Feb 27 – Mar 25 2026
// sc = final deciding SC | route = full transfer path | pp = premium processing type
const CASES = [
  // Feb 27 — 9 cases
  { date: "2026-02-27", sc: "NSC", type: "EB-1A", nationality: "Indonesia",      premium: true,  officer: "",        field: "Embodied AI",                     pubs: 13, cites: 791,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-02-27", sc: "TSC", type: "EB-1A", nationality: "Pakistan",       premium: true,  officer: "",        field: "Computational Pathology",         pubs: 16, cites: 387,  route: "TSC",         pp: "upfront"  },
  { date: "2026-02-27", sc: "TSC", type: "EB-1A", nationality: "Taiwan",         premium: true,  officer: "",        field: "Computer Science",                pubs: 14, cites: 2104, route: "TSC",         pp: "upfront"  },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Sri Lanka",      premium: false, officer: "",        field: "Condensed Matter Physics",        pubs: 8,  cites: 45,   route: "TSC",         pp: "none"     },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "",        field: "Computational Materials Science", pubs: 5,  cites: 93,   route: "NSC→TSC→NSC", pp: "upfront"  },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Canada",         premium: true,  officer: "",        field: "Cancer Immunology",               pubs: 6,  cites: 134,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Pakistan",       premium: true,  officer: "",        field: "Neuroscience",                    pubs: 15, cites: 38,   route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Vietnam",        premium: true,  officer: "",        field: "Power Systems",                   pubs: 8,  cites: 14,   route: "TSC",         pp: "upgrade"  },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Bangladesh",     premium: true,  officer: "",        field: "Bio-robotics",                    pubs: 10, cites: 23,   route: "NSC→TSC",     pp: "upgrade"  },
  // Mar 2 — 3 cases
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Taiwan",         premium: true,  officer: "XM1960",  field: "Artificial Intelligence",         pubs: 8,  cites: 319,  route: "NSC",         pp: "upgrade"  },
  { date: "2026-03-02", sc: "TSC", type: "NIW",   nationality: "South Korea",    premium: false, officer: "",        field: "Interventional Radiology",        pubs: 19, cites: 167,  route: "TSC",         pp: "none"     },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "South Korea",    premium: true,  officer: "XM1910",  field: "Translational Neuroscience",      pubs: 3,  cites: 163,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  // Mar 3 — 4 cases
  { date: "2026-03-03", sc: "NSC", type: "EB-1B", nationality: "Canada",         premium: true,  officer: "XM2115",  field: "Analytical Chemistry",            pubs: 10, cites: 111,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "Nepal",          premium: true,  officer: "XM1986",  field: "Ecology and Agriculture",         pubs: 3,  cites: 31,   route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "Romania",        premium: false, officer: "XM2365",  field: "Cancer Immunology",               pubs: 8,  cites: 178,  route: "TSC",         pp: "none"     },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "Sri Lanka",      premium: true,  officer: "XM1986",  field: "Cancer Biology",                  pubs: 18, cites: 18,   route: "TSC",         pp: "upgrade"  },
  // Mar 4 — 5 cases
  { date: "2026-03-04", sc: "TSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "EX1671",  field: "Chronobiology",                   pubs: 14, cites: 476,  route: "TSC",         pp: "upgrade"  },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",          premium: false, officer: "XM0150",  field: "Biomedical Engineering",          pubs: 17, cites: 437,  route: "TSC",         pp: "none"     },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "South Korea",    premium: true,  officer: "XM1861",  field: "Chemical Engineering",            pubs: 13, cites: 168,  route: "NSC",         pp: "upgrade"  },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "EX0486",  field: "Biomedical Engineering",          pubs: 15, cites: 215,  route: "NSC",         pp: "upfront"  },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Vietnam",        premium: true,  officer: "XM2415",  field: "Materials Science",               pubs: 7,  cites: 37,   route: "TSC",         pp: "upgrade"  },
  // Mar 5 — 3 cases
  { date: "2026-03-05", sc: "NSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "XM1258",  field: "Earth Science",                   pubs: 19, cites: 755,  route: "NSC→TSC→NSC", pp: "upfront"  },
  { date: "2026-03-05", sc: "TSC", type: "EB-1A", nationality: "India",          premium: true,  officer: "XM1642",  field: "Software Engineering",            pubs: 17, cites: 364,  route: "TSC",         pp: "upgrade"  },
  { date: "2026-03-05", sc: "TSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "XM1728",  field: "Biotechnology",                   pubs: 9,  cites: 158,  route: "TSC",         pp: "upfront"  },
  // Mar 6 — 4 cases
  { date: "2026-03-06", sc: "NSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "XM2259",  field: "Advanced Manufacturing",          pubs: 17, cites: 230,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "United Kingdom", premium: false, officer: "",        field: "Synthetic Organic Chemistry",     pubs: 3,  cites: 226,  route: "TSC",         pp: "none"     },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM1560",  field: "Mechanical Engineering",          pubs: 7,  cites: 59,   route: "TSC",         pp: "upgrade"  },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM2513",  field: "Computer Vision",                 pubs: 33, cites: 3249, route: "TSC",         pp: "upfront"  },
  // Mar 10 — 2 cases
  { date: "2026-03-10", sc: "TSC", type: "EB-1B", nationality: "India",          premium: false, officer: "XM1421",  field: "Vaccine Development",             pubs: 14, cites: 148,  route: "NSC→TSC",     pp: "none"     },
  { date: "2026-03-10", sc: "NSC", type: "NIW",   nationality: "India",          premium: true,  officer: "EX0832",  field: "Synthetic Organic Chemistry",     pubs: 11, cites: 233,  route: "TSC→NSC",     pp: "upgrade"  },
  // Mar 11 — 6 cases
  { date: "2026-03-11", sc: "NSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "XM1566",  field: "Artificial Intelligence",         pubs: 20, cites: 1669, route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "India",          premium: true,  officer: "XM2545",  field: "Internal Medicine",               pubs: 13, cites: 1492, route: "TSC",         pp: "upgrade"  },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM2375",  field: "Immunology",                      pubs: 4,  cites: 106,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Vietnam",        premium: true,  officer: "XM2498",  field: "Computer Science",                pubs: 4,  cites: 19,   route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "India",          premium: true,  officer: "XM2418",  field: "Pharmaceutical Sciences",         pubs: 2,  cites: 25,   route: "NSC→TSC",     pp: "upfront"  },
  { date: "2026-03-11", sc: "VSC", type: "O-1A",  nationality: "India",          premium: true,  officer: "XM1421",  field: "Physical Chemistry",              pubs: 16, cites: 158,  route: "CSC→VSC",     pp: "upgrade"  },
  // Mar 12 — 9 cases
  { date: "2026-03-12", sc: "TSC", type: "EB-1A", nationality: "India",          premium: true,  officer: "XM1291",  field: "Advanced Engineering Materials",  pubs: 16, cites: 264,  route: "TSC",         pp: "upgrade"  },
  { date: "2026-03-12", sc: "NSC", type: "EB-1A", nationality: "India",          premium: true,  officer: "XM2259",  field: "Materials Engineering",           pubs: 6,  cites: 418,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-12", sc: "NSC", type: "EB-1A", nationality: "India",          premium: true,  officer: "EX0718",  field: "Child Neurology",                 pubs: 26, cites: 435,  route: "NSC",         pp: "upfront"  },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",          premium: false, officer: "",        field: "Materials Science",               pubs: 65, cites: 2163, route: "NSC",         pp: "none"     },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM2533",  field: "Health Algorithm Engineering",    pubs: 4,  cites: 222,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "France",         premium: false, officer: "XM1926",  field: "Computer Science",                pubs: 2,  cites: 46,   route: "TSC",         pp: "none"     },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM2417",  field: "Materials Engineering",           pubs: 6,  cites: 58,   route: "NSC→TSC→NSC", pp: "upfront"  },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Bangladesh",     premium: false, officer: "XM2513",  field: "Industrial Engineering",          pubs: 17, cites: 80,   route: "TSC",         pp: "none"     },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "India",          premium: true,  officer: "XM1914",  field: "Materials Science",               pubs: 15, cites: 210,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  // Mar 13 — 5 cases
  { date: "2026-03-13", sc: "NSC", type: "EB-1A", nationality: "Brazil",         premium: true,  officer: "XM0389",  field: "Disease Ecology",                 pubs: 21, cites: 2071, route: "NSC→TSC→NSC", pp: "upfront"  },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "China",          premium: true,  officer: "EX0858",  field: "Process Engineering",             pubs: 30, cites: 445,  route: "TSC",         pp: "upgrade"  },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "India",          premium: false, officer: "XM2425",  field: "Biological Sciences",             pubs: 6,  cites: 63,   route: "TSC",         pp: "none"     },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM1771",  field: "Medicinal Chemistry",             pubs: 17, cites: 355,  route: "TSC",         pp: "upfront"  },
  { date: "2026-03-13", sc: "VSC", type: "O-1A",  nationality: "China",          premium: true,  officer: "",        field: "Cybersecurity",                   pubs: 18, cites: 311,  route: "VSC",         pp: "upfront"  },
  // Mar 16 — 2 cases
  { date: "2026-03-16", sc: "TSC", type: "EB-1A", nationality: "India",          premium: true,  officer: "",        field: "Technology Strategy",             pubs: 0,  cites: 0,    route: "TSC",         pp: "upfront"  },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Bangladesh",     premium: true,  officer: "XM1899",  field: "Chemical Engineering",            pubs: 6,  cites: 105,  route: "TSC",         pp: "upgrade"  },
  // Mar 17 — 3 cases
  { date: "2026-03-17", sc: "TSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "",        field: "Crop Genetics",                   pubs: 21, cites: 1017, route: "TSC→NSC→TSC", pp: "upgrade"  },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "India",          premium: true,  officer: "XM2481",  field: "Computational Material Science",  pubs: 4,  cites: 60,   route: "NSC→TSC→NSC", pp: "upfront"  },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Bangladesh",     premium: true,  officer: "XM2560",  field: "Communication Engineering",       pubs: 1,  cites: 42,   route: "NSC→TSC→NSC", pp: "upgrade"  },
  // Mar 18 — 5 cases
  { date: "2026-03-18", sc: "TSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "EX0557",  field: "Data Analytics",                  pubs: 11, cites: 220,  route: "TSC→NSC→TSC", pp: "upgrade"  },
  { date: "2026-03-18", sc: "NSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "",        field: "Artificial Intelligence",         pubs: 3,  cites: 309,  route: "NSC",         pp: "upgrade"  },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM2582",  field: "Air Transportation",              pubs: 7,  cites: 62,   route: "NSC",         pp: "upgrade"  },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Nepal",          premium: true,  officer: "XM2420",  field: "Agricultural Water Management",   pubs: 11, cites: 78,   route: "NSC→TSC→NSC", pp: "upfront"  },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "China",          premium: true,  officer: "EX5080",  field: "Semiconductors",                  pubs: 19, cites: 537,  route: "TSC→NSC→TSC", pp: "upgrade"  },
  // Mar 19 — 1 case
  { date: "2026-03-19", sc: "TSC", type: "NIW",   nationality: "India",          premium: true,  officer: "XM1685",  field: "Biomedical Engineering",          pubs: 15, cites: 153,  route: "TSC",         pp: "upfront"  },
  // Mar 23 — 1 case
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "Turkey",         premium: false, officer: "EX0178",  field: "Biomedical Science",              pubs: 1,  cites: 20,   route: "NSC",         pp: "none"     },
  // Mar 24 — 3 cases
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM1771",  field: "Biomedical Engineering",           pubs: 11, cites: 109,  route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Italy",          premium: true,  officer: "XM2543",  field: "Chemistry",                        pubs: 10, cites: 60,   route: "NSC→TSC→NSC", pp: "upgrade"  },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Turkey",         premium: false, officer: "XM2581",  field: "Internal Medicine and Hematology", pubs: 27, cites: 222,  route: "TSC",          pp: "none"     },
  // Mar 25 — 8 cases
  { date: "2026-03-25", sc: "NSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "XM1861",  field: "Brain-Computer Interface",         pubs: 16, cites: 1869, route: "NSC",          pp: "upfront"  },
  { date: "2026-03-25", sc: "NSC", type: "EB-1A", nationality: "India",          premium: true,  officer: "XM1313",  field: "Cardiovascular Disease",           pubs: 72, cites: 530,  route: "NSC→TSC→NSC",  pp: "upgrade"  },
  { date: "2026-03-25", sc: "NSC", type: "EB-1A", nationality: "China",          premium: true,  officer: "XM2005",  field: "Machine Learning",                 pubs: 12, cites: 1986, route: "NSC→TSC→NSC",  pp: "upfront"  },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Croatia",        premium: true,  officer: "XM1889",  field: "Molecular Geroscience",            pubs: 10, cites: 376,  route: "NSC→TSC→NSC",  pp: "upfront"  },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "",        field: "Mechanical Engineering",           pubs: 24, cites: 134,  route: "NSC→TSC→NSC",  pp: "upgrade"  },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "China",          premium: true,  officer: "XM2210",  field: "Quantum Field Theory",             pubs: 5,  cites: 128,  route: "NSC→TSC→NSC",  pp: "upgrade"  },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Turkey",         premium: true,  officer: "XM2229",  field: "Computational Biophysics",         pubs: 3,  cites: 108,  route: "NSC→TSC→NSC",  pp: "upgrade"  },
  { date: "2026-03-25", sc: "CSC", type: "O-1A",  nationality: "China",          premium: true,  officer: "",        field: "Optoelectronics",                  pubs: 24, cites: 1252, route: "CSC",          pp: "upfront"  },
];

const SC_COLORS    = { NSC: "#1e3a5f", TSC: "#0d9488", VSC: "#7c3aed", CSC: "#d97706" };
const TYPE_COLORS  = { NIW: "#6366f1", "EB-1A": "#0d9488", "EB-1B": "#7c3aed", "O-1A": "#d97706" };
const PP_COLORS    = { upfront: "#1e3a5f", upgrade: "#0d9488", none: "#9ca3af" };
const ROUTE_COLORS = {
  "NSC→TSC→NSC": "#1e3a5f",
  "TSC":          "#0d9488",
  "NSC":          "#2d5a8e",
  "TSC→NSC→TSC": "#7c3aed",
  "NSC→TSC":     "#d97706",
  "TSC→NSC":     "#dc2626",
  "VSC":          "#6b7280",
  "CSC→VSC":      "#9ca3af",
  "CSC":          "#d97706",
};

function countBy(arr, key) {
  const map = {};
  arr.forEach(x => { const k = x[key]; map[k] = (map[k] ?? 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function pct(n, total) { return ((n / total) * 100).toFixed(1); }

function MiniBar({ label, n, total, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: T.textSub, fontWeight: 500 }}>{label}</span>
        <span style={{ color: T.textMuted }}>{n} ({pct(n, total)}%)</span>
      </div>
      <div style={{ background: T.border, borderRadius: 99, height: 7, overflow: "hidden" }}>
        <div style={{ width: `${(n / total) * 100}%`, height: "100%", background: color ?? "#6366f1", borderRadius: 99 }} />
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13 },
  itemStyle: { color: T.text },
  labelStyle: { color: T.textSub },
};

export default function RFEStats() {
  const isMobile = useIsMobile();
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [filterSC, setFilterSC] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const total = CASES.length;
  const premiumCount   = CASES.filter(c => c.premium).length;
  const transferredCount = CASES.filter(c => c.route.includes("→")).length;
  const avgPubs  = (CASES.reduce((s, c) => s + c.pubs, 0) / total).toFixed(1);
  const avgCites = Math.round(CASES.reduce((s, c) => s + c.cites, 0) / total);

  const scCounts      = useMemo(() => countBy(CASES, "sc"), []);
  const typeCounts    = useMemo(() => countBy(CASES, "type"), []);
  const natCounts     = useMemo(() => countBy(CASES, "nationality"), []);
  const routeCounts   = useMemo(() => countBy(CASES, "route"), []);
  const ppCounts      = useMemo(() => countBy(CASES, "pp"), []);
  const fieldCounts   = useMemo(() => countBy(CASES, "field"), []);
  const officerCounts = useMemo(() => countBy(CASES.filter(c => c.officer), "officer"), []);
  // SC that issued the RFE = first SC in the route
  const rfeIssuingCounts = useMemo(() => countBy(
    CASES.map(c => ({ ...c, issuingSC: c.route.split("→")[0] })), "issuingSC"
  ), []);

  const topRoute = routeCounts[0];

  const filtered = useMemo(() => {
    let arr = [...CASES];
    if (filterSC !== "All")   arr = arr.filter(c => c.sc === filterSC);
    if (filterType !== "All") arr = arr.filter(c => c.type === filterType);
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "boolean") return sortDir === "asc" ? av - bv : bv - av;
      if (typeof av === "number")  return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filterSC, filterType, sortKey, sortDir]);

  const displayed = showAll ? filtered : filtered.slice(0, 15);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span style={{ color: T.border, fontSize: 10 }}>⇅</span>;
    return <span style={{ color: T.accent, fontSize: 10 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const routeChartData = routeCounts.map(([r, n]) => ({ route: r, count: n }));
  const ppChartData    = ppCounts.map(([p, n]) => ({ pp: p, count: n }));

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>RFE → Approval Stats</h1>
          <span style={{ background: `${COLORS.rfe}18`, color: COLORS.rfe, border: `1px solid ${COLORS.rfe}33`, borderRadius: 5, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>
            2026
          </span>
        </div>
        <p style={{ color: T.textMuted, fontSize: 14 }}>
          Manually collected · {total} cases · Feb 27 – Mar 25, 2026 · NIW, EB-1A/B, O-1A
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Cases"   value={total}          color={COLORS.rfe} />
        <StatCard label="Premium PP"    value={premiumCount}   sub={`${pct(premiumCount, total)}% used PP`}   color={T.accent} />
        <StatCard label="Transferred"   value={transferredCount} sub={`${pct(transferredCount, total)}% changed SC`} color={COLORS.pending} />
        <StatCard label="Avg Pubs"      value={avgPubs}        color={COLORS.approved} />
        <StatCard label="Avg Citations" value={avgCites}       color="#7c3aed" />
      </div>

      {/* Transfer insight callout */}
      <div style={{
        background: `${COLORS.rfe}08`,
        border: `1px solid ${COLORS.rfe}33`,
        borderLeft: `4px solid ${COLORS.rfe}`,
        borderRadius: 10, padding: "14px 20px", marginBottom: 24,
        fontSize: 14, color: T.textSub, lineHeight: 1.6,
      }}>
        <strong style={{ color: T.text }}>{transferredCount} of {total} cases ({pct(transferredCount, total)}%)</strong> experienced at least one service center transfer.
        {topRoute && <> Most common route: <strong style={{ color: ROUTE_COLORS[topRoute[0]] ?? T.accent, fontFamily: "'DM Mono', monospace" }}>{topRoute[0]}</strong> ({topRoute[1]} cases, {pct(topRoute[1], total)}%).</>}
        {" "}<span style={{ color: T.textMuted, fontSize: 13 }}>Route format: <span style={{ fontFamily: "'DM Mono', monospace" }}>first SC = RFE issuer · last SC = approving center</span>.</span>
      </div>

      {/* SC Breakdown: Issued vs Approved */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Which SC Issued the RFE?">
          <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 14 }}>
            First center in the route — where the RFE notice was sent from
          </p>
          {rfeIssuingCounts.map(([sc, n]) => (
            <MiniBar key={sc} label={sc} n={n} total={total} color={SC_COLORS[sc] ?? "#6b7280"} />
          ))}
        </Panel>
        <Panel title="Which SC Approved the Case?">
          <p style={{ color: T.textMuted, fontSize: 12, marginBottom: 14 }}>
            Final center in the route — where the approval notice was issued
          </p>
          {scCounts.map(([sc, n]) => (
            <MiniBar key={sc} label={sc} n={n} total={total} color={SC_COLORS[sc] ?? "#6b7280"} />
          ))}
        </Panel>
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Transfer Routes">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={routeChartData} layout="vertical">
              <XAxis type="number" tick={{ fill: T.textMuted, fontSize: 11 }} />
              <YAxis type="category" dataKey="route" width={isMobile ? 85 : 130}
                tick={{ fill: T.textSub, fontSize: isMobile ? 10 : 11, fontFamily: "'DM Mono', monospace" }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[0, 5, 5, 0]}>
                {routeChartData.map((e, i) => (
                  <Cell key={i} fill={ROUTE_COLORS[e.route] ?? "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Premium Processing Strategy">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ppChartData}>
              <XAxis dataKey="pp" tick={{ fill: T.textSub, fontSize: 12 }} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {ppChartData.map((e, i) => (
                  <Cell key={i} fill={PP_COLORS[e.pp] ?? "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Case Type">
          {typeCounts.map(([t, n]) => (
            <MiniBar key={t} label={t} n={n} total={total} color={TYPE_COLORS[t] ?? "#6b7280"} />
          ))}
        </Panel>

        <Panel title="Top Nationalities">
          {natCounts.slice(0, 7).map(([nat, n]) => (
            <MiniBar key={nat} label={nat} n={n} total={total} color={T.accent} />
          ))}
        </Panel>
      </div>

      {/* Charts row 3 */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Panel title="Top Research Fields">
          {fieldCounts.slice(0, 8).map(([f, n]) => (
            <MiniBar key={f} label={f} n={n} total={total} color={COLORS.approved} />
          ))}
        </Panel>

        <Panel title="Officer Codes (known)">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 16px" }}>
            {officerCounts.slice(0, 10).map(([o, n]) => (
              <div key={o} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", color: T.text, fontWeight: 600 }}>{o}</span>
                <span style={{ color: T.accent, fontWeight: 700 }}>{n}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Case table */}
      <Panel title="Case Table">
        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "All Centers", val: "All", key: "sc", options: ["All", "NSC", "TSC", "VSC"] },
            { label: "All Types",   val: "All", key: "type", options: ["All", "NIW", "EB-1A", "EB-1B", "O-1A"] },
          ].map(({ key, options }) => (
            <select key={key}
              value={key === "sc" ? filterSC : filterType}
              onChange={e => key === "sc" ? setFilterSC(e.target.value) : setFilterType(e.target.value)}
              style={{ background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 12px", color: T.text, fontSize: 13, outline: "none" }}>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <span style={{ color: T.textMuted, fontSize: 13, alignSelf: "center" }}>{filtered.length} cases</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}`, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {[
                  ["date", "Date"], ["type", "Type"], ["nationality", "Country"], ["field", "Field"],
                  ["route", "SC Route"], ["pp", "PP"], ["officer", "Officer"], ["pubs", "Pubs"], ["cites", "Citations"],
                ].map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)}
                    style={{ padding: "10px 12px", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                    {label} <SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "9px 12px", color: T.textMuted, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{c.date.slice(5)}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <Badge text={c.type} color={TYPE_COLORS[c.type] ?? T.accent} />
                  </td>
                  <td style={{ padding: "9px 12px", color: T.textSub, whiteSpace: "nowrap" }}>{c.nationality}</td>
                  <td style={{ padding: "9px 12px", color: T.textSub, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.field}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{
                      background: `${ROUTE_COLORS[c.route] ?? "#6b7280"}18`,
                      color: ROUTE_COLORS[c.route] ?? "#6b7280",
                      border: `1px solid ${ROUTE_COLORS[c.route] ?? "#6b7280"}33`,
                      borderRadius: 5, padding: "2px 7px", fontSize: 11,
                      fontFamily: "'DM Mono', monospace", fontWeight: 600, whiteSpace: "nowrap",
                    }}>{c.route}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <Badge text={c.pp} color={PP_COLORS[c.pp] ?? "#6b7280"} />
                  </td>
                  <td style={{ padding: "9px 12px", fontFamily: "'DM Mono', monospace", color: T.textMuted, fontWeight: 600 }}>{c.officer || "—"}</td>
                  <td style={{ padding: "9px 12px", color: T.text, textAlign: "right" }}>{c.pubs}</td>
                  <td style={{ padding: "9px 12px", color: T.text, textAlign: "right" }}>{c.cites.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 15 && (
          <button onClick={() => setShowAll(v => !v)}
            style={{
              width: "100%", marginTop: 14, padding: "10px 0",
              background: "none", border: `1px solid ${T.border}`, borderRadius: 7,
              color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
            {showAll ? "Show fewer" : `Show all ${filtered.length} cases`}
          </button>
        )}
      </Panel>

      {/* Disclaimer */}
      <div style={{
        marginTop: 20,
        background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
        padding: "12px 18px", fontSize: 12, color: "#92400e", lineHeight: 1.6,
      }}>
        <strong>Disclaimer:</strong> Data manually collected from publicly shared success stories — only cases applicants chose to share.
        Not a representative sample of all I-140 RFE outcomes. For informational purposes only; not legal advice.
      </div>
    </div>
  );
}
