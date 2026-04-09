import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { T, COLORS, Panel, StatCard, Badge, useIsMobile } from "./shared";

// ── Manually collected from publicly shared approval stories (2026) ──
// 723 cases · Feb 27 – Apr 3 2026
const CASES = [
  // ── Feb 27 — 41 cases ──
  { date: "2026-02-27", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 19,  cites: 897,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "EB-1A", nationality: "South Korea",  premium: true,  field: "Oncologic Healthcare",                pubs: 151, cites: 2104,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 20,  cites: 1558,  route: "NSC",       pp: "upgrade" , edu: "Industry" },
  { date: "2026-02-27", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Food Science",                        pubs: 112, cites: 5465,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 7,   cites: 1025,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "EB-1B", nationality: "China",        premium: true,  field: "Optical Engineering",                 pubs: 29,  cites: 362,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "EB-1B", nationality: "India",        premium: true,  field: "Vascular Biology",                    pubs: 12,  cites: 625,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Electrical Engineering",              pubs: 11,  cites: 106,   route: "NSC",       pp: "none"    , edu: null },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Molecular Microbiology",              pubs: 12,  cites: 246,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular Immunology",                pubs: 8,   cites: 235,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biostatistics",                       pubs: 5,   cites: 22,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Artificial Intelligence",             pubs: 4,   cites: 78,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 13,  cites: 133,   route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Philippines",  premium: true,  field: "Plant Pathology",                     pubs: 15,  cites: 226,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Human Vision Science",                pubs: 6,   cites: 26,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Machine Learning",                    pubs: 10,  cites: 196,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Electrical Engineering",              pubs: 9,   cites: 186,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Epidemiology",                        pubs: 10,  cites: 106,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Thailand",     premium: false, field: "Biomedical Science",                  pubs: 7,   cites: 178,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Internal Medicine",                   pubs: 17,  cites: 79,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biology",                             pubs: 7,   cites: 128,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Colombia",     premium: true,  field: "Bioengineering",                      pubs: 14,  cites: 342,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Cybersecurity Systems",               pubs: 4,   cites: 29,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Developmental Neurobiology",          pubs: 8,   cites: 71,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Computer Vision",                     pubs: 2,   cites: 168,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: false, field: "Environmental Economics",             pubs: 92,  cites: 7941,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Orthodontics",                        pubs: 8,   cites: 99,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Biopharmaceutical Sciences",          pubs: 4,   cites: 39,    route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Electrical and Computer Engineering", pubs: 11,  cites: 29,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Architecture",               pubs: 9,   cites: 60,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computational Chemistry",             pubs: 7,   cites: 78,    route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 13,  cites: 355,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Medical Physics",                     pubs: 5,   cites: 28,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Ethiopia",     premium: true,  field: "Biomedical Research",                 pubs: 12,  cites: 823,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 12,  cites: 67,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Public Health",                       pubs: 7,   cites: 141,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Neuroscience",                        pubs: 3,   cites: 32,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Medical Science",                     pubs: 8,   cites: 123,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Chemical Engineering",                pubs: 3,   cites: 18,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Public Health",                       pubs: 2,   cites: 19,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-02-27", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Electrical Engineering",              pubs: 13,  cites: 68,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 2 — 22 cases ──
  { date: "2026-03-02", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 26,  cites: 1655,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "EB-1B", nationality: "India",        premium: false, field: "Organic and Medicinal Chemistry",     pubs: 16,  cites: 273,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "EB-1B", nationality: "Israel",       premium: true,  field: "Immunology",                          pubs: 32,  cites: 4015,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "EB-1B", nationality: "China",        premium: false, field: "Accounting",                          pubs: 1,   cites: 208,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "EB-1B", nationality: "China",        premium: false, field: "Molecular Oncology",                  pubs: 1,   cites: 163,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-02", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Electrical Engineering",              pubs: 13,  cites: 233,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Computational Biophysics",            pubs: 7,   cites: 35,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Machine Learning and AI Security",    pubs: 14,  cites: 714,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Machine Learning",            pubs: 9,   cites: 625,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Agricultural Sciences",               pubs: 12,  cites: 76,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Neuroscience",                        pubs: 10,  cites: 110,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Machine Learning",            pubs: 8,   cites: 84,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Computational Science and Engineering",pubs: 6,  cites: 40,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Physics",                             pubs: 84,  cites: 3316,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 10,  cites: 1240,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Japan",        premium: false, field: "Quantum Information Technologies",    pubs: 14,  cites: 419,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Mechanical Engineering",              pubs: 3,   cites: 25,    route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Pharmaceutical Science",              pubs: 15,  cites: 230,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Sustainable Materials",               pubs: 6,   cites: 279,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Biomedical Engineering",              pubs: 5,   cites: 70,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Communication Science",               pubs: 9,   cites: 305,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-02", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Advanced Computing",                  pubs: 8,   cites: 144,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 3 — 23 cases ──
  { date: "2026-03-03", sc: "NSC", type: "EB-1A", nationality: "South Korea",  premium: true,  field: "Dental Prosthesis Engineering",       pubs: 81,  cites: 2488,  route: "TSC→NSC",   pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Pharmaceutical Sciences",             pubs: 13,  cites: 989,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biotechnology",                       pubs: 15,  cites: 2515,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: false, field: "Reproductive Biology",                pubs: 12,  cites: 201,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Communication Studies",               pubs: 12,  cites: 82,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 5,   cites: 20,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Civil Engineering",                   pubs: 20,  cites: 177,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Mechanical Engineering",              pubs: 11,  cites: 144,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: false, field: "Materials Science",                   pubs: 8,   cites: 70,    route: "NSC",       pp: "none"    , edu: "Master" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Biomedical Sciences",                 pubs: 11,  cites: 440,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 6,   cites: 123,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Computer Science",                    pubs: 9,   cites: 48,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computational Biophysics",            pubs: 5,   cites: 561,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Statistics",                          pubs: 5,   cites: 30,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Medical Neuroscience",                pubs: 11,  cites: 243,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "Lebanon",      premium: true,  field: "Systems Engineering",                 pubs: 4,   cites: 30,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Electrical Engineering",              pubs: 15,  cites: 238,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Microsystems Engineering",            pubs: 18,  cites: 112,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Chemical Engineering",                pubs: 19,  cites: 486,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Civil Engineering",                   pubs: 5,   cites: 151,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Bioinformatics",                      pubs: 13,  cites: 723,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Machine Learning",            pubs: 5,   cites: 161,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-03", sc: "CSC", type: "O-1A",  nationality: "Brazil",       premium: true,  field: "Reproductive Biology",                pubs: 10,  cites: 161,   route: "CSC",       pp: "upfront" , edu: "PhD" },
  // ── Mar 4 — 42 cases ──
  { date: "2026-03-04", sc: "TSC", type: "EB-1A", nationality: "Indonesia",    premium: true,  field: "Dementia Research",                   pubs: 57,  cites: 1815,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "AI-Driven Music Generation",          pubs: 11,  cites: 633,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Computer Science",                    pubs: 35,  cites: 996,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "EB-1B", nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 17,  cites: 192,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Chemical Engineering",                pubs: 17,  cites: 437,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 4,   cites: 33,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "India",        premium: false, field: "Virology",                            pubs: 20,  cites: 876,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Food Science",                        pubs: 25,  cites: 502,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Chemical Engineering",                pubs: 13,  cites: 264,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Petroleum Engineering",               pubs: 26,  cites: 266,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Medicine",                            pubs: 10,  cites: 226,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Medicinal Chemistry",                 pubs: 36,  cites: 889,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Mathematical Optimization",           pubs: 6,   cites: 155,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Materials Science and Engineering",   pubs: 10,  cites: 363,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Life Sciences and Engineering",       pubs: 8,   cites: 207,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Astrophysics",                        pubs: 10,  cites: 167,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Structural Biology",                  pubs: 24,  cites: 587,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biotechnology",                       pubs: 16,  cites: 419,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Biochemistry",                        pubs: 17,  cites: 736,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Immunology",                          pubs: 4,   cites: 30,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Experimental Psychology",             pubs: 4,   cites: 46,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Human Computer Interaction",          pubs: 14,  cites: 580,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular and Cellular Biology",      pubs: 5,   cites: 82,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Cardiovascular Medicine",             pubs: 31,  cites: 45,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 5,   cites: 76,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Chemical Biology",                    pubs: 16,  cites: 532,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: false, field: "Management Sciences",                 pubs: 21,  cites: 1838,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Health Behavior",                     pubs: 16,  cites: 993,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Civil Engineering",                   pubs: 7,   cites: 62,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 7,   cites: 142,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Robotics",                            pubs: 4,   cites: 63,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Mechanical Engineering",              pubs: 6,   cites: 12,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Cancer Immunotherapy",                pubs: 22,  cites: 1120,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 23,  cites: 333,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Statistical Modeling and Data Science",pubs: 16, cites: 153,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Semiconductors and Microelectronics", pubs: 5,   cites: 33,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-04", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Biostatistics",                       pubs: 8,   cites: 39,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Robotics",                            pubs: 10,  cites: 700,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Cancer Biology",                      pubs: 12,  cites: 334,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Chemistry",                           pubs: 8,   cites: 51,    route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "Ukraine",      premium: true,  field: "Physiology",                          pubs: 13,  cites: 124,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-04", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Mechanical Engineering",              pubs: 18,  cites: 204,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 5 — 17 cases ──
  { date: "2026-03-05", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Biotechnology",                       pubs: 23,  cites: 2088,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "TSC", type: "EB-1A", nationality: "Israel",       premium: true,  field: "Hemato-Oncology",                     pubs: 62,  cites: 2944,  route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-05", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Mechanical Engineering",              pubs: 16,  cites: 506,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "Ethiopia",     premium: true,  field: "Environmental Engineering",           pubs: 16,  cites: 274,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Computer Science",                    pubs: 6,   cites: 553,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "Ghana",        premium: true,  field: "Photonics Engineering",               pubs: 8,   cites: 113,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Mechanical Engineering",              pubs: 20,  cites: 449,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "Uganda",       premium: true,  field: "Public Health Nursing",               pubs: 25,  cites: 434,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Remote Sensing",                      pubs: 33,  cites: 1025,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Computer Engineering",                pubs: 11,  cites: 28,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Labor Economics",                     pubs: 6,   cites: 110,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Machine Learning",                    pubs: 6,   cites: 68,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-05", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Mechanical Engineering",              pubs: 26,  cites: 1236,  route: "NSC→TSC",   pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: false, field: "Agricultural Economics",              pubs: 4,   cites: 16,    route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 11,  cites: 1151,  route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-05", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Civil Engineering",                   pubs: 6,   cites: 40,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-05", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Neuroscience",                        pubs: 31,  cites: 474,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 6 — 31 cases ──
  { date: "2026-03-06", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Molecular Biosensing",                pubs: 23,  cites: 893,   route: "TSC",       pp: "upfront" , edu: "Industry" },
  { date: "2026-03-06", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Biomedical Optics",                   pubs: 44,  cites: 1186,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "EB-1B", nationality: "India",        premium: true,  field: "Electrical Engineering",              pubs: 10,  cites: 51,    route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "EB-1B", nationality: "France",       premium: true,  field: "Immunology",                          pubs: 22,  cites: 3402,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Physics",                     pubs: 9,   cites: 132,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Mechanical Engineering",              pubs: 6,   cites: 47,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Chemical Biology",                    pubs: 5,   cites: 120,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Japan",        premium: true,  field: "Cancer Biology",                      pubs: 8,   cites: 203,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "India",        premium: false, field: "Academic Medicine",                   pubs: 10,  cites: 757,   route: "TSC",       pp: "none"    , edu: "Master" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Chemistry",                           pubs: 8,   cites: 324,   route: "TSC",       pp: "none"    , edu: "Master" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Development Economics",               pubs: 4,   cites: 314,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Information Systems",                 pubs: 7,   cites: 148,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Applied Artificial Intelligence",     pubs: 9,   cites: 57,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 18,  cites: 1532,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Hematology Oncology",                 pubs: 32,  cites: 105,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Computational Biology",               pubs: 9,   cites: 66,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Jordan",       premium: true,  field: "Cardiovascular Disease",              pubs: 32,  cites: 595,   route: "NSC",       pp: "upgrade" , edu: "Industry" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: false, field: "Materials Science",                   pubs: 46,  cites: 5625,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Saudi Arabia", premium: true,  field: "Molecular Biology and Genetics",      pubs: 7,   cites: 63,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Public Health",                       pubs: 7,   cites: 38,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Molecular Biology",                   pubs: 2,   cites: 84,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "United Kingdom",premium: true, field: "Biomedical Science",                  pubs: 15,  cites: 106,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Computational Physics",               pubs: 10,  cites: 280,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Ecuador",      premium: true,  field: "Ocean Engineering",                   pubs: 20,  cites: 137,   route: "TSC",       pp: "upgrade" , edu: "Industry" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Civil Engineering",                   pubs: 3,   cites: 26,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Mechanical Engineering",              pubs: 26,  cites: 45,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Plant Genetics",                      pubs: 19,  cites: 378,   route: "NSC",       pp: "upgrade" , edu: "Industry" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Intelligent Transportation Systems",  pubs: 36,  cites: 486,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Regenerative Medicine",               pubs: 10,  cites: 105,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Ecosystem Science",                   pubs: 27,  cites: 542,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-06", sc: "NSC", type: "NIW",   nationality: "Hong Kong",    premium: true,  field: "Chemistry",                           pubs: 8,   cites: 426,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 9 — 13 cases ──
  { date: "2026-03-09", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Mechanical Engineering",              pubs: 25,  cites: 89,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-09", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 4,   cites: 52,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Cardiovascular Medicine",             pubs: 28,  cites: 33,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computational Quantum Physics",       pubs: 3,   cites: 41,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 4,   cites: 118,   route: "TSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-09", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Mathematics",                 pubs: 13,  cites: 292,   route: "NSC",       pp: "upgrade" , edu: "Industry" },
  { date: "2026-03-09", sc: "NSC", type: "NIW",   nationality: "Jordan",       premium: true,  field: "Internal Medicine",                   pubs: 4,   cites: 19,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Public Health Epidemiology",          pubs: 17,  cites: 6649,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "Lebanon",      premium: true,  field: "Computational and Physical Chemistry", pubs: 16, cites: 292,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Engineering",                pubs: 14,  cites: 67,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-09", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Agronomy",                            pubs: 29,  cites: 40,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-09", sc: "NSC", type: "NIW",   nationality: "Thailand",     premium: true,  field: "Organic Chemistry",                   pubs: 11,  cites: 61,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-09", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 9,   cites: 83,    route: "NSC",       pp: "upgrade" , edu: "Industry" },
  // ── Mar 10 — 4 cases ──
  { date: "2026-03-10", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Agriculture",                         pubs: 3,   cites: 1642,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-10", sc: "TSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Organic Chemistry",                   pubs: 7,   cites: 182,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-10", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Inorganic Chemistry",                 pubs: 7,   cites: 41,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-10", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Pharmaceutical and Biomedical",       pubs: 5,   cites: 25,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 11 — 43 cases ──
  { date: "2026-03-11", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 13,  cites: 604,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-11", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 30,  cites: 948,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Cardiovascular Research",             pubs: 15,  cites: 353,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "TSC", type: "EB-1B", nationality: "China",        premium: true,  field: "Economics",                           pubs: 15,  cites: 107,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "EB-1B", nationality: "South Korea",  premium: true,  field: "Molecular Biology",                   pubs: 16,  cites: 1183,  route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-11", sc: "TSC", type: "EB-1B", nationality: "India",        premium: false, field: "Pharmaceutical Sciences",             pubs: 3,   cites: 710,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Mexico",       premium: true,  field: "Quantum Information Science",         pubs: 8,   cites: 214,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Colombia",     premium: true,  field: "Biomedical Engineering",              pubs: 14,  cites: 455,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Condensed Matter Physics",            pubs: 13,  cites: 196,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Medicine",                            pubs: 58,  cites: 297,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 11,  cites: 450,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Machine Learning",                    pubs: 11,  cites: 599,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Orthopedic Surgery",                  pubs: 16,  cites: 106,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Cognitive Neuroscience",              pubs: 8,   cites: 35,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Biochemistry",                        pubs: 19,  cites: 523,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Hydrology",                           pubs: 25,  cites: 302,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "Germany",      premium: true,  field: "Condensed Matter Physics",            pubs: 5,   cites: 33,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Microbial Ecology",                   pubs: 22,  cites: 416,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Health Communication",                pubs: 37,  cites: 1469,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Medical Devices Development",         pubs: 5,   cites: 22,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Inflammation Immunology",             pubs: 21,  cites: 467,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Chemistry",                           pubs: 4,   cites: 48,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Environmental Sciences",              pubs: 42,  cites: 2303,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Oman",         premium: true,  field: "Medicine",                            pubs: 3,   cites: 193,   route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Electrical and Computer Engineering", pubs: 8,   cites: 40,    route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Chemical Biology",                    pubs: 13,  cites: 870,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Chemistry",                           pubs: 6,   cites: 272,   route: "NSC",       pp: "upgrade" , edu: "Industry" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Greece",       premium: true,  field: "Neuroscience",                        pubs: 2,   cites: 73,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Medicine",                            pubs: 10,  cites: 278,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular Biology",                   pubs: 15,  cites: 280,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Internal Medicine",                   pubs: 14,  cites: 99,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 16,  cites: 376,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: false, field: "Optics",                              pubs: 127, cites: 3553,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Germany",      premium: true,  field: "Theoretical Physics",                 pubs: 8,   cites: 240,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Plant Biology",                       pubs: 16,  cites: 550,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Epidemiology",                        pubs: 18,  cites: 338,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Jordan",       premium: true,  field: "Control System Engineering",          pubs: 5,   cites: 23,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Neuroscience",                        pubs: 10,  cites: 80,    route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Neuroscience",                        pubs: 9,   cites: 377,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Pharmacology",                        pubs: 11,  cites: 160,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Genomics",                            pubs: 7,   cites: 212,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-11", sc: "NSC", type: "NIW",   nationality: "Qatar",        premium: true,  field: "Pulmonary Disease",                   pubs: 7,   cites: 93,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-11", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Neurometabolism",                     pubs: 2,   cites: 13,    route: "TSC",       pp: "upfront" , edu: null },
  // ── Mar 12 — 52 cases ──
  { date: "2026-03-12", sc: "NSC", type: "EB-1A", nationality: "Turkey",       premium: true,  field: "Medical Biology",                     pubs: 31,  cites: 299,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Neuroscience",                        pubs: 13,  cites: 531,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Data Science",                        pubs: 13,  cites: 331,   route: "TSC",       pp: "upfront" , edu: null },
  { date: "2026-03-12", sc: "TSC", type: "EB-1A", nationality: "Tunisia",      premium: true,  field: "Cyber-Physical Systems Engineering",  pubs: 54,  cites: 1713,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Nuclear Astrophysics",                pubs: 9,   cites: 485,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Greece",       premium: false, field: "Clinical Medicine",                   pubs: 18,  cites: 465,   route: "TSC",       pp: "none"    , edu: "MD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Statistics",                          pubs: 3,   cites: 35,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular Biology",                   pubs: 17,  cites: 776,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Chemical Engineering",                pubs: 5,   cites: 61,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Computer Science",                    pubs: 10,  cites: 325,   route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Pharmaceutical Sciences",             pubs: 14,  cites: 208,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Clinical Medicine",                   pubs: 6,   cites: 160,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Tourism Economics",                   pubs: 10,  cites: 208,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Chemistry",                           pubs: 12,  cites: 270,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Signal Processing",                   pubs: 6,   cites: 49,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Tunisia",      premium: true,  field: "Applied Machine Learning",            pubs: 10,  cites: 26,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular Microbiology",              pubs: 4,   cites: 43,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: false, field: "Computer Science",                    pubs: 12,  cites: 105,   route: "NSC",       pp: "none"    , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Bioengineering",                      pubs: 5,   cites: 114,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Cancer Immunology",                   pubs: 13,  cites: 1505,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Israel",       premium: true,  field: "Advanced Computing Infrastructure",   pubs: 4,   cites: 83,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Mechanical Engineering",              pubs: 7,   cites: 54,    route: "NSC",       pp: "none"    , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Italy",        premium: true,  field: "Medical Imaging",                     pubs: 19,  cites: 742,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Condensed Matter Physics",            pubs: 5,   cites: 30,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Oral Maxillofacial Surgery",          pubs: 19,  cites: 30,    route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biostatistics and Data Science",      pubs: 10,  cites: 58,    route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Molecular Biology",                   pubs: 7,   cites: 135,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Armenia",      premium: false, field: "Mathematics",                         pubs: 13,  cites: 58,    route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Cardiovascular Medicine",             pubs: 7,   cites: 71,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "India",        premium: false, field: "Artificial Intelligence and Data Analysis", pubs: 7, cites: 113, route: "TSC",    pp: "none"    , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Mechanical Engineering",              pubs: 10,  cites: 50,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Electrical Engineering",              pubs: 14,  cites: 128,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computer Science",                    pubs: 5,   cites: 5,     route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Malaysia",     premium: true,  field: "Development Economics",               pubs: 5,   cites: 311,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biostatistics",                       pubs: 15,  cites: 30,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Ethiopia",     premium: true,  field: "Plant Science",                       pubs: 30,  cites: 830,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Qatar",        premium: true,  field: "Electrical Engineering",              pubs: 12,  cites: 59,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Epidemiology",                        pubs: 13,  cites: 650,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Environmental Engineering",           pubs: 4,   cites: 115,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Artificial Intelligence",             pubs: 26,  cites: 244,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Construction Engineering",            pubs: 16,  cites: 101,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Quantum Device Physics",              pubs: 4,   cites: 252,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Numerical Modeling",                  pubs: 2,   cites: 52,    route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Condensed Matter Physics",            pubs: 11,  cites: 224,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular Biology",                   pubs: 3,   cites: 40,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Organic Chemistry",                   pubs: 2,   cites: 56,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Malaysia",     premium: true,  field: "Computational Precision Oncology",    pubs: 13,  cites: 8407,  route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Germany",      premium: false, field: "Computational Biology",               pubs: 11,  cites: 1021,  route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Epidemiology",                        pubs: 4,   cites: 76,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Nanophotonics",                       pubs: 17,  cites: 325,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-12", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Chemical Engineering",                pubs: 7,   cites: 68,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-12", sc: "NSC", type: "NIW",   nationality: "Japan",        premium: true,  field: "Neurological Rehabilitation",         pubs: 45,  cites: 662,   route: "NSC",       pp: "upgrade" , edu: null },
  // ── Mar 13 — 38 cases ──
  { date: "2026-03-13", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 28,  cites: 2060,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 22,  cites: 860,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Antenna Design",                      pubs: 24,  cites: 177,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Health Economics and Outcomes Research", pubs: 2, cites: 129,  route: "TSC→NSC",   pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computational Mechanics",             pubs: 4,   cites: 11,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 11,  cites: 66,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Animal Science",                      pubs: 25,  cites: 461,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Computational Chemistry",             pubs: 7,   cites: 71,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 11,  cites: 382,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Mechanical Engineering",              pubs: 3,   cites: 21,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Neuroimaging Research",               pubs: 17,  cites: 397,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Spain",        premium: true,  field: "Orthopedic Surgery",                  pubs: 34,  cites: 100,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Artificial Intelligence",             pubs: 25,  cites: 235,   route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Genomics",                            pubs: 6,   cites: 58,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Translational Biomedical Research",   pubs: 12,  cites: 147,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Nuclear Engineering",                 pubs: 13,  cites: 56,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Machine Learning",            pubs: 17,  cites: 669,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Computer Science",                    pubs: 20,  cites: 188,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Ukraine",      premium: true,  field: "Biochemistry",                        pubs: 7,   cites: 69,    route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computer Science",                    pubs: 11,  cites: 163,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: false, field: "Environmental Engineering",           pubs: 13,  cites: 501,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "United Kingdom",premium: true, field: "Applied Mathematics",                 pubs: 6,   cites: 25,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Industrial Engineering",              pubs: 4,   cites: 30,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 13,  cites: 300,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Theoretical Chemistry",               pubs: 16,  cites: 360,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Marine Engineering",                  pubs: 47,  cites: 737,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 5,   cites: 21,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 10,  cites: 253,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Petroleum Engineering",               pubs: 22,  cites: 219,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Computational Materials Science",     pubs: 12,  cites: 101,   route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Cancer Molecular Biology",            pubs: 19,  cites: 299,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Molecular Biology",                   pubs: 13,  cites: 351,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Machine Learning",                    pubs: 6,   cites: 81,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-13", sc: "TSC", type: "NIW",   nationality: "Iraq",         premium: true,  field: "Electrical and Computer Engineering", pubs: 8,   cites: 111,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: false, field: "Civil and Environmental Engineering", pubs: 6,   cites: 33,    route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Italy",        premium: true,  field: "Energy Engineering",                  pubs: 13,  cites: 76,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "Mexico",       premium: true,  field: "Gastroenterology",                    pubs: 8,   cites: 119,   route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-13", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 9,   cites: 93,    route: "NSC",       pp: "upfront" , edu: "Master" },
  // ── Mar 16 — 21 cases ──
  { date: "2026-03-16", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 16,  cites: 506,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Clinical Imaging Intervention",       pubs: 19,  cites: 671,   route: "NSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Biochemistry",                        pubs: 4,   cites: 29,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Lebanon",      premium: true,  field: "Cardiology",                          pubs: 22,  cites: 73,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Radiofrequency Engineering",          pubs: 8,   cites: 34,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "United Kingdom",premium: true, field: "Polymer Chemistry",                   pubs: 9,   cites: 123,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: false, field: "Molecular Biology",                   pubs: 114, cites: 1331,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Transportation Engineering",          pubs: 11,  cites: 40,    route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Cell Biology",                        pubs: 4,   cites: 51,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Quantitative Sociology",              pubs: 8,   cites: 44,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Bioinformatics",                      pubs: 51,  cites: 1198,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Information Management",              pubs: 12,  cites: 66,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Energy Materials",                    pubs: 20,  cites: 322,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Applied Artificial Intelligence",     pubs: 4,   cites: 313,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Biochemistry",                        pubs: 3,   cites: 17,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Computer Science",                    pubs: 9,   cites: 34,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Internal Medicine",                   pubs: 9,   cites: 34,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Colombia",     premium: true,  field: "Neuroscience",                        pubs: 22,  cites: 499,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-16", sc: "TSC", type: "NIW",   nationality: "Saudi Arabia", premium: true,  field: "Medicine",                            pubs: 12,  cites: 59,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Colombia",     premium: true,  field: "Genetics and Metabolism",             pubs: 10,  cites: 118,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-16", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Plant Pathology",                     pubs: 12,  cites: 248,   route: "NSC",       pp: "upgrade" , edu: null },
  // ── Mar 17 — 50 cases ──
  { date: "2026-03-17", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 25,  cites: 1701,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 3,   cites: 172,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "EB-1A", nationality: "South Korea",  premium: true,  field: "Immunology",                          pubs: 13,  cites: 683,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Data Science",                        pubs: 9,   cites: 698,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-17", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Cancer Research",                     pubs: 15,  cites: 214,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Civil Engineering",                   pubs: 10,  cites: 75,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "RNA Biology",                         pubs: 5,   cites: 64,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Theoretical Particle Physics",        pubs: 6,   cites: 175,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Artificial Intelligence",             pubs: 5,   cites: 313,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Molecular Biology",                   pubs: 3,   cites: 23,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Quantum Materials Engineering",       pubs: 11,  cites: 803,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biomedicine",                         pubs: 41,  cites: 4606,  route: "TSC→NSC",   pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: false, field: "Infectious Diseases",                 pubs: 33,  cites: 902,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Lithium Rechargeable Batteries",      pubs: 8,   cites: 130,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Egypt",        premium: false, field: "Organic Chemistry",                   pubs: 7,   cites: 203,   route: "TSC",       pp: "none"    , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Materials Science and Engineering",   pubs: 4,   cites: 52,    route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Photonic Engineering",                pubs: 3,   cites: 18,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Armenia",      premium: true,  field: "Cardiovascular Medicine",             pubs: 15,  cites: 17,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Mechanical Engineering",              pubs: 16,  cites: 97,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Mechanical Engineering",              pubs: 8,   cites: 194,   route: "TSC",       pp: "upfront" , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Computer Science",                    pubs: 5,   cites: 192,   route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Biomedical Artificial Intelligence",  pubs: 2,   cites: 23,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Geoinformatics",                      pubs: 21,  cites: 536,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Computer Science",                    pubs: 5,   cites: 77,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Physiology",                          pubs: 7,   cites: 24,    route: "TSC",       pp: "upfront" , edu: null },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Molecular Biology",                   pubs: 14,  cites: 529,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Japan",        premium: true,  field: "Neuroscience",                        pubs: 12,  cites: 197,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Agriculture",                         pubs: 13,  cites: 67,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Computational Neuroscience",          pubs: 3,   cites: 53,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Information Security",                pubs: 7,   cites: 125,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "India",        premium: false, field: "Chemical Technology",                 pubs: 14,  cites: 71,    route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Virology",                            pubs: 23,  cites: 1185,  route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: false, field: "Neuroscience",                        pubs: 4,   cites: 146,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 3,   cites: 631,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Thailand",     premium: true,  field: "Medical Science",                     pubs: 5,   cites: 52,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Cell Biology",                        pubs: 24,  cites: 406,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Spain",        premium: false, field: "Chemical Engineering",                pubs: 6,   cites: 119,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Vision",                     pubs: 12,  cites: 635,   route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Environmental Engineering",           pubs: 13,  cites: 233,   route: "NSC",       pp: "none"    , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Rwanda",       premium: false, field: "Physics",                             pubs: 4,   cites: 26,    route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Chemical Engineering",                pubs: 7,   cites: 714,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "United Kingdom",premium: false,field: "Nephrology",                          pubs: 14,  cites: 124,   route: "TSC",       pp: "none"    , edu: "MD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Electrical and Computer Engineering", pubs: 16,  cites: 21,    route: "TSC",       pp: "upfront" , edu: null },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Hong Kong",    premium: true,  field: "Cancer Immunology",                   pubs: 9,   cites: 716,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Mexico",       premium: true,  field: "Biological Engineering",              pubs: 5,   cites: 197,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Science",                             pubs: 11,  cites: 1168,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Biological Sciences",                 pubs: 7,   cites: 83,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Nuclear Engineering",                 pubs: 24,  cites: 324,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-17", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Space Physics",                       pubs: 5,   cites: 78,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-17", sc: "VSC", type: "O-1A",  nationality: "Chile",        premium: true,  field: "Oceanography",                        pubs: 22,  cites: 658,   route: "VSC",       pp: "upfront" , edu: "PhD" },
  // ── Mar 18 — 29 cases ──
  { date: "2026-03-18", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Molecular Biology",                   pubs: 11,  cites: 344,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "EB-1A", nationality: "Israel",       premium: true,  field: "Superconducting Quantum Computing",   pubs: 37,  cites: 1304,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Biotechnologies",                     pubs: 9,   cites: 551,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Optical Imaging",                     pubs: 18,  cites: 375,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "India",        premium: false, field: "Chemical Engineering",                pubs: 24,  cites: 1316,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Kazakhstan",   premium: true,  field: "Immunology",                          pubs: 5,   cites: 32,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Canada",       premium: true,  field: "Biomedical Machine Learning",         pubs: 7,   cites: 51,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Dairy Science",                       pubs: 11,  cites: 54,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Ethiopia",     premium: true,  field: "Pediatric Radiology",                 pubs: 8,   cites: 2,     route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Human-Computer Interaction",          pubs: 7,   cites: 50,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Quantum Computing",                   pubs: 20,  cites: 504,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Bioenvironmental Systems Engineering",pubs: 29,  cites: 580,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Environmental Analysis",              pubs: 23,  cites: 744,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Greece",       premium: true,  field: "Aerospace Engineering",               pubs: 36,  cites: 264,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Psychiatric Neuroscience",            pubs: 13,  cites: 56,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Biochemistry",                        pubs: 23,  cites: 230,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Polymer Physics",                     pubs: 6,   cites: 241,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Iraq",         premium: true,  field: "Medicine",                            pubs: 36,  cites: 230,   route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Microelectronics Engineering",        pubs: 7,   cites: 68,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computational Biology",               pubs: 15,  cites: 131,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Microbiology",                        pubs: 27,  cites: 406,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Singapore",    premium: true,  field: "Neurosurgery",                        pubs: 23,  cites: 140,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Civil Engineering",                   pubs: 14,  cites: 257,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Biosciences",                         pubs: 10,  cites: 89,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Neuroscience",                        pubs: 5,   cites: 984,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-18", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Immunology",                          pubs: 13,  cites: 2453,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Chile",        premium: true,  field: "Biophysics",                          pubs: 14,  cites: 582,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Ecology",                             pubs: 10,  cites: 158,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-18", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Computer Science",                    pubs: 10,  cites: 81,    route: "NSC",       pp: "upgrade" , edu: null },
  // ── Mar 19 — 9 cases ──
  { date: "2026-03-19", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Computer Engineering",                pubs: 18,  cites: 2126,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-19", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Molecular Biology",                   pubs: 18,  cites: 336,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-19", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Applied Mathematics",                 pubs: 9,   cites: 659,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-19", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Statistical Data Science",            pubs: 4,   cites: 100,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-19", sc: "TSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Applied Scientific Computing",        pubs: 15,  cites: 616,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-19", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computer Science",                    pubs: 5,   cites: 45,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-19", sc: "NSC", type: "NIW",   nationality: "Slovenia",     premium: true,  field: "Interventional Cardiology",           pubs: 13,  cites: 20,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-19", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 37,  cites: 460,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-19", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Machine Learning",            pubs: 12,  cites: 2585,  route: "TSC",       pp: "upgrade" , edu: null },
  // ── Mar 20 — 14 cases ──
  { date: "2026-03-20", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Cardiology",                          pubs: 47,  cites: 649,   route: "NSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-20", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Energy Storage",                      pubs: 51,  cites: 4185,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-20", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Environmental Chemistry",             pubs: 45,  cites: 1273,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-20", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Analytical Chemistry",                pubs: 38,  cites: 808,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 11,  cites: 1350,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computer Science",                    pubs: 6,   cites: 59,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Chemical Engineering",                pubs: 2,   cites: 17,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computer Science",                    pubs: 12,  cites: 59,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-20", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Applied Machine Learning",            pubs: 18,  cites: 140,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Plant Molecular Genetics",            pubs: 9,   cites: 309,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Quantum Nanomaterials",               pubs: 18,  cites: 278,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Mechanical Engineering",              pubs: 10,  cites: 52,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "TSC", type: "NIW",   nationality: "Trinidad and Tobago", premium: true, field: "Materials Chemistry",           pubs: 17,  cites: 631,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-20", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Materials Engineering",               pubs: 6,   cites: 37,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 23 — 21 cases ──
  { date: "2026-03-23", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Computational Biology",               pubs: 19,  cites: 12802, route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-23", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Control of Electrical Drives",        pubs: 24,  cites: 429,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-23", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Robotics",                            pubs: 10,  cites: 779,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-23", sc: "NSC", type: "EB-1A", nationality: "Germany",      premium: true,  field: "Artificial Intelligence",             pubs: 23,  cites: 486,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-23", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Business Administration",             pubs: 8,   cites: 174,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Bioinformatics",                      pubs: 7,   cites: 1633,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Biochemical Engineering",             pubs: 13,  cites: 73,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Civil Engineering",                   pubs: 21,  cites: 38,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Advanced Engineering Materials",      pubs: 17,  cites: 616,   route: "TSC→NSC",   pp: "upgrade" , edu: null },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "Italy",        premium: true,  field: "Infectious Diseases and Immunology",  pubs: 28,  cites: 269,   route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Materials Science",                   pubs: 10,  cites: 189,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Computational Chemistry",             pubs: 5,   cites: 51,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Hepatology",                          pubs: 50,  cites: 296,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Applied Machine Learning",            pubs: 32,  cites: 210,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Artificial Intelligence",             pubs: 13,  cites: 316,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "Canada",       premium: true,  field: "Molecular Biology",                   pubs: 6,   cites: 171,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Anesthesiology",                      pubs: 12,  cites: 70,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Natural Resources",                   pubs: 16,  cites: 680,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Pharmaceutical Science",              pubs: 6,   cites: 439,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "Japan",        premium: true,  field: "Theoretical Particle Physics",        pubs: 22,  cites: 346,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-23", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Neural Engineering",                  pubs: 5,   cites: 120,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 24 — 35 cases ──
  { date: "2026-03-24", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Biomedical Sciences",                 pubs: 29,  cites: 820,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "EB-1A", nationality: "China",        premium: false, field: "Biomedical Science",                  pubs: 19,  cites: 887,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 13,  cites: 1699,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Gastroenterology",                    pubs: 16,  cites: 154,   route: "TSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-24", sc: "NSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Drug Discovery",                      pubs: 23,  cites: 697,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Materials Engineering",               pubs: 5,   cites: 139,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Environmental Engineering",           pubs: 9,   cites: 346,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Biostatistics",                       pubs: 4,   cites: 21,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Biomedical Informatics",              pubs: 9,   cites: 224,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Neuroscience",                        pubs: 6,   cites: 26,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Artificial Intelligence",             pubs: 18,  cites: 435,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Clinical Medicine",                   pubs: 5,   cites: 20,    route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Battery Electrode Manufacturing",     pubs: 11,  cites: 262,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Artificial Intelligence",             pubs: 17,  cites: 249,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Mexico",       premium: true,  field: "Cardiology",                          pubs: 18,  cites: 87,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical and Computer Engineering", pubs: 12,  cites: 726,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Networking and Wireless Systems", pubs: 7, cites: 181, route: "NSC",      pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Computational Biology",               pubs: 8,   cites: 357,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Interpretable Deep Learning",         pubs: 23,  cites: 676,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Italy",        premium: true,  field: "Computer Science",                    pubs: 60,  cites: 1844,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Ophthalmology",                       pubs: 16,  cites: 223,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Computer Science",                    pubs: 6,   cites: 192,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Mechanical Engineering",              pubs: 5,   cites: 62,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Mechanical Engineering",              pubs: 4,   cites: 43,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Hydrologic Modeling",                 pubs: 9,   cites: 179,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Hong Kong",    premium: true,  field: "Molecular Biology",                   pubs: 4,   cites: 109,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Environmental Science",               pubs: 12,  cites: 238,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Molecular Biology",                   pubs: 6,   cites: 131,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Cyprus",       premium: true,  field: "Automatic Control and Systems Engineering", pubs: 8, cites: 131, route: "NSC",     pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Agricultural Economics",              pubs: 14,  cites: 286,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Stomatology",                         pubs: 13,  cites: 439,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Analytical Chemistry",                pubs: 9,   cites: 72,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Sustainable Resources Management",    pubs: 3,   cites: 43,    route: "TSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Civil Engineering",                   pubs: 8,   cites: 40,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-24", sc: "NSC", type: "NIW",   nationality: "Jordan",       premium: true,  field: "Clinical Medicine",                   pubs: 14,  cites: 36,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  // ── Mar 25 — 23 cases ──
  { date: "2026-03-25", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 14,  cites: 764,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "TSC", type: "EB-1A", nationality: "China",        premium: false, field: "Computer Science",                    pubs: 3,   cites: 1319,  route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-25", sc: "TSC", type: "EB-1A", nationality: "Brazil",       premium: true,  field: "Clinical and Translational Medicine",  pubs: 53,  cites: 2280,  route: "TSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 5,   cites: 25,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Armenia",      premium: true,  field: "Immunology",                          pubs: 10,  cites: 1079,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Chemical and Environmental Engineering", pubs: 22, cites: 1378, route: "NSC",      pp: "upfront" , edu: "PhD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Thailand",     premium: true,  field: "Epidemiologic-Implementation Research",pubs: 13,  cites: 110,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Robotics",                            pubs: 7,   cites: 152,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 20,  cites: 1530,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Japan",        premium: true,  field: "Computer Systems Engineering",        pubs: 8,   cites: 32,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Singapore",    premium: true,  field: "Mental Health Services",              pubs: 7,   cites: 52,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Neuroscience",                        pubs: 3,   cites: 57,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Computational Biology",               pubs: 5,   cites: 57,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Pavement Engineering",                pubs: 15,  cites: 257,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Electrical Engineering",              pubs: 12,  cites: 43,    route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Cancer Research",                     pubs: 12,  cites: 411,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Biomedical Engineering",              pubs: 17,  cites: 362,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "Portugal",     premium: true,  field: "Quantum Technologies",                pubs: 7,   cites: 375,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Chemistry",                           pubs: 12,  cites: 392,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Jordan",       premium: true,  field: "Internal Medicine",                   pubs: 2,   cites: 102,   route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Civil Engineering",                   pubs: 8,   cites: 15,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-25", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Social Welfare and Gerontechnology",  pubs: 7,   cites: 35,    route: "NSC",       pp: "upfront" , edu: "Master" },
  { date: "2026-03-25", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Bioengineering",                      pubs: 12,  cites: 552,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 26 — 29 cases ──
  { date: "2026-03-26", sc: "TSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Energy Engineering",                  pubs: 46,  cites: 1862,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Materials Science",                   pubs: 14,  cites: 694,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Condensed Matter Physics",            pubs: 16,  cites: 2864,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "EB-1B", nationality: "India",        premium: false, field: "Biomedical Sciences",                 pubs: 8,   cites: 237,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Human-Machine Interfaces",            pubs: 8,   cites: 20,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Political Science",                   pubs: 7,   cites: 202,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Cambodia",     premium: true,  field: "Environmental Engineering",           pubs: 7,   cites: 82,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Ghana",        premium: true,  field: "Pharmacological Sciences",            pubs: 15,  cites: 101,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Molecular Biology and Genetics",      pubs: 9,   cites: 219,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Molecular Biology",                   pubs: 9,   cites: 45,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "Lebanon",      premium: true,  field: "Energy Sciences Engineering",         pubs: 3,   cites: 58,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Wireless Communications",             pubs: 24,  cites: 219,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Public Health and Gerontology",       pubs: 8,   cites: 20,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Materials Science",                   pubs: 5,   cites: 55,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Organic Chemistry",                   pubs: 6,   cites: 122,   route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biochemistry",                        pubs: 7,   cites: 384,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Environmental Engineering",           pubs: 23,  cites: 177,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Sociology",                           pubs: 10,  cites: 185,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Materials Chemistry",                 pubs: 12,  cites: 95,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Energy Engineering",                  pubs: 12,  cites: 84,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Kuwait",       premium: true,  field: "Mechanical Engineering",              pubs: 3,   cites: 45,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Cambodia",     premium: true,  field: "Cancer Biology",                      pubs: 8,   cites: 201,   route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Greece",       premium: true,  field: "Orthopedic Surgery",                  pubs: 19,  cites: 370,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Epidemiology",                        pubs: 14,  cites: 22,    route: "TSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: false, field: "Experimental Condensed Matter Physics",pubs: 8,  cites: 109,   route: "TSC",       pp: "none"    , edu: "Master" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Gastroenterology and Hepatology",     pubs: 16,  cites: 70,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-26", sc: "TSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Endovascular Neurology",              pubs: 5,   cites: 169,   route: "NSC→TSC",   pp: "upgrade" , edu: "MD" },
  { date: "2026-03-26", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Optical Communication Technologies",  pubs: 4,   cites: 31,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-26", sc: "VSC", type: "O-1A",  nationality: "China",        premium: true,  field: "Advanced Engineering Materials",      pubs: 11,  cites: 157,   route: "VSC",       pp: "upfront" , edu: "PhD" },
  // ── Mar 27 — 15 cases ──
  { date: "2026-03-27", sc: "NSC", type: "EB-1A", nationality: "France",       premium: true,  field: "Reproductive Biology",                pubs: 15,  cites: 305,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Vision Science",                      pubs: 8,   cites: 91,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Renal Physiology",                    pubs: 18,  cites: 329,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Industrial and Systems Engineering",  pubs: 6,   cites: 71,    route: "TSC",       pp: "upfront" , edu: null },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biomedical Engineering",              pubs: 16,  cites: 182,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "Lebanon",      premium: true,  field: "Mechanical Engineering",              pubs: 6,   cites: 34,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Neuroradiology",                      pubs: 11,  cites: 123,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Veterinary Medicine",                 pubs: 39,  cites: 351,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 10,  cites: 52,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "Brazil",       premium: true,  field: "Petroleum Production Engineering",    pubs: 7,   cites: 48,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-27", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Environmental Science",               pubs: 12,  cites: 284,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Veterinary Biomedical Sciences",      pubs: 11,  cites: 191,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Clinical Epidemiology",               pubs: 8,   cites: 29,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biotechnology",                       pubs: 7,   cites: 247,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-27", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Respiratory Biology",                 pubs: 18,  cites: 521,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 30 — 17 cases ──
  { date: "2026-03-30", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Physics",                             pubs: 10,  cites: 100,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "EB-1B", nationality: "India",        premium: true,  field: "Rheology",                            pubs: 9,   cites: 181,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Autonomous Robotics Engineering",     pubs: 5,   cites: 32,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Iraq",         premium: true,  field: "Electrical Engineering",              pubs: 2,   cites: 46,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 35,  cites: 902,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biology",                             pubs: 6,   cites: 116,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Ecuador",      premium: true,  field: "Structural Engineering",              pubs: 36,  cites: 574,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Operations Research",                 pubs: 6,   cites: 31,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-30", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Neuroscience",                        pubs: 22,  cites: 696,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-30", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Environmental Chemistry",             pubs: 13,  cites: 954,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Semiconductor Engineering",           pubs: 10,  cites: 358,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Kuwait",       premium: true,  field: "Biosensors",                          pubs: 13,  cites: 111,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Vision",                     pubs: 5,   cites: 270,   route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-30", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Bio-integrated Medical Devices",      pubs: 20,  cites: 1107,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "TSC", type: "NIW",   nationality: "Morocco",      premium: true,  field: "Artificial Intelligence",             pubs: 12,  cites: 232,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Canada",       premium: true,  field: "Structural Biology",                  pubs: 4,   cites: 611,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-30", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Semiconductor Devices",               pubs: 3,   cites: 26,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  // ── Mar 31 — 19 cases ──
  { date: "2026-03-31", sc: "NSC", type: "EB-1A", nationality: "Japan",        premium: true,  field: "Dermatology",                         pubs: 24,  cites: 137,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "EB-1A", nationality: "China",        premium: true,  field: "Geographic Information Science",      pubs: 64,  cites: 1517,  route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Social Science",                      pubs: 11,  cites: 126,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Clinical Medicine",                   pubs: 7,   cites: 150,   route: "NSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Electrical Engineering",              pubs: 7,   cites: 85,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "Italy",        premium: true,  field: "Neuroscience",                        pubs: 13,  cites: 872,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Molecular Biology",                   pubs: 7,   cites: 75,    route: "NSC→TSC",   pp: "upgrade" , edu: null },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Biotechnologies",                     pubs: 11,  cites: 2153,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "STEM Education",                      pubs: 18,  cites: 241,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: false, field: "Public Health",                       pubs: 75,  cites: 259,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Artificial Intelligence",             pubs: 3,   cites: 173,   route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Pharmaceutical Science",              pubs: 9,   cites: 70,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Radio Frequency Integrated Circuit",  pubs: 4,   cites: 27,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "Mexico",       premium: true,  field: "Computational Modeling",              pubs: 6,   cites: 33,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "Egypt",        premium: true,  field: "Computer Science",                    pubs: 9,   cites: 31,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Marine Science",                      pubs: 11,  cites: 160,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Biology",                             pubs: 7,   cites: 107,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-31", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Mathematics",                 pubs: 3,   cites: 29,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-03-31", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Electronic Engineering",              pubs: 18,  cites: 353,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  // ── Apr 1 — 33 cases ──
  { date: "2026-04-01", sc: "TSC", type: "EB-1B", nationality: "China",        premium: true,  field: "Advanced Manufacturing",              pubs: 6,   cites: 120,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Artificial Intelligence",             pubs: 9,   cites: 46,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Biotechnology",                       pubs: 17,  cites: 256,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Data-Efficient Artificial Intelligence",pubs: 14, cites: 129,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Computer Science",                    pubs: 7,   cites: 87,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Biochemical Engineering",             pubs: 5,   cites: 26,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Bioengineering",                      pubs: 22,  cites: 243,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Engineering",                         pubs: 4,   cites: 19,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Machine Learning",                    pubs: 5,   cites: 279,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Analytical Chemistry",                pubs: 1,   cites: 55,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Bioinformatics",                      pubs: 19,  cites: 1444,  route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Colombia",     premium: true,  field: "Chemical Engineering",                pubs: 11,  cites: 132,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Tunisia",      premium: true,  field: "Biomedical Sciences",                 pubs: 7,   cites: 143,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Mongolia",     premium: true,  field: "Human Genetics",                      pubs: 6,   cites: 104,   route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Chemical Engineering",                pubs: 2,   cites: 21,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Computational Neuroscience",          pubs: 4,   cites: 175,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Cardiovascular Immunology",           pubs: 12,  cites: 145,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Physics",                             pubs: 4,   cites: 31,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Ethiopia",     premium: true,  field: "Biomedical Sciences",                 pubs: 8,   cites: 105,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Molecular Oncology",                  pubs: 37,  cites: 1388,  route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Serbia",       premium: true,  field: "Coagulation Biology",                 pubs: 37,  cites: 388,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Artificial Intelligence",             pubs: 9,   cites: 106,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Data Science",                        pubs: 6,   cites: 281,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Semiconductor Electronic Design Automation", pubs: 3, cites: 72, route: "NSC",    pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Energy Storage",                      pubs: 3,   cites: 22,    route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Morocco",      premium: true,  field: "Artificial Intelligence",             pubs: 6,   cites: 100,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Artificial Intelligence",             pubs: 12,  cites: 68,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Cardiovascular Diseases",             pubs: 26,  cites: 85,    route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "China",        premium: false, field: "Neurobiology",                        pubs: 5,   cites: 323,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Internal Medicine",                   pubs: 5,   cites: 156,   route: "TSC",       pp: "none"    , edu: "MD" },
  { date: "2026-04-01", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: false, field: "Biomedical Science",                  pubs: 9,   cites: 142,   route: "NSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-04-01", sc: "TSC", type: "NIW",   nationality: "China",        premium: false, field: "Clinical Psychology",                 pubs: 27,  cites: 189,   route: "TSC",       pp: "none"    , edu: "PhD" },
  { date: "2026-04-01", sc: "CSC", type: "O-1A",  nationality: "South Korea",  premium: true,  field: "Robotics",                            pubs: 10,  cites: 365,   route: "CSC",       pp: "upfront" , edu: "Master" },
  // ── Apr 2 — 23 cases ──
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "France",       premium: false, field: "Educational Leadership",              pubs: 50,  cites: 1078,  route: "TSC",       pp: "none"    , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Medicine",                            pubs: 23,  cites: 233,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Electrical and Computer Engineering", pubs: 10,  cites: 79,    route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Computer Science",                    pubs: 7,   cites: 213,   route: "TSC→NSC",   pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Pharmaceutical Sciences",             pubs: 14,  cites: 271,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Biochemistry",                        pubs: 3,   cites: 53,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Sustainable Materials Engineering",   pubs: 4,   cites: 6,     route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Ultrafast Spectroscopy",              pubs: 8,   cites: 256,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Agricultural and Biological Engineering",pubs: 4, cites: 48,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Diagnostic Pathology",                pubs: 11,  cites: 51,    route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "France",       premium: true,  field: "Biomedical Optics",                   pubs: 16,  cites: 267,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Ghana",        premium: true,  field: "Wood Material Science",               pubs: 3,   cites: 15,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Cardiovascular Medicine",             pubs: 22,  cites: 27,    route: "TSC",       pp: "upfront" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Applied Machine Learning",            pubs: 12,  cites: 127,   route: "NSC",       pp: "upfront" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "Thailand",     premium: true,  field: "Biomedical Engineering",              pubs: 16,  cites: 262,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Machine Learning",            pubs: 6,   cites: 106,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Cancer Biology",                      pubs: 4,   cites: 16,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Molecular Imaging",                   pubs: 3,   cites: 38,    route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "TSC", type: "NIW",   nationality: "India",        premium: false, field: "Materials Science and Engineering",   pubs: 50,  cites: 628,   route: "TSC",       pp: "none"    , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Applied Statistics",                  pubs: 6,   cites: 148,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "Bangladesh",   premium: true,  field: "Information Technology",              pubs: 3,   cites: 0,     route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Bioinformatics",                      pubs: 14,  cites: 292,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-02", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Chemical Engineering",                pubs: 7,   cites: 175,   route: "NSC",       pp: "upgrade" , edu: null },
  // ── Apr 3 — 30 cases ──
  { date: "2026-04-03", sc: "NSC", type: "EB-1A", nationality: "India",        premium: true,  field: "Computer Science",                    pubs: 25,  cites: 2887,  route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Sri Lanka",    premium: true,  field: "Chemical Engineering",                pubs: 7,   cites: 168,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Radiology",                           pubs: 13,  cites: 158,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 4,   cites: 39,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "Hong Kong",    premium: true,  field: "Chemical Oceanography",               pubs: 6,   cites: 35,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Human Development and Family Sciences",pubs: 40, cites: 367,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Mechanical Engineering",              pubs: 9,   cites: 27,    route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Ethiopia",     premium: true,  field: "Preventive Medicine",                 pubs: 15,  cites: 573,   route: "NSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Singapore",    premium: true,  field: "Micro-Electromechanical Systems",     pubs: 29,  cites: 261,   route: "TSC→NSC",   pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 8,   cites: 496,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Spain",        premium: true,  field: "Computer Science",                    pubs: 18,  cites: 390,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "South Korea",  premium: true,  field: "Molecular Engineering",               pubs: 12,  cites: 53,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Turkey",       premium: true,  field: "Economics",                           pubs: 15,  cites: 295,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Mechanical Engineering",              pubs: 10,  cites: 94,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "Ghana",        premium: true,  field: "Applied Machine Learning",            pubs: 18,  cites: 187,   route: "TSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computational Modeling",              pubs: 6,   cites: 44,    route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "Vietnam",      premium: true,  field: "Political Science",                   pubs: 6,   cites: 140,   route: "TSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Medicine",                            pubs: 50,  cites: 416,   route: "NSC",       pp: "upfront" , edu: "MD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "Russia",       premium: true,  field: "Molecular Pathology",                 pubs: 85,  cites: 827,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Canada",       premium: true,  field: "Biophysics",                          pubs: 3,   cites: 77,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "India",        premium: true,  field: "Materials Engineering",               pubs: 19,  cites: 204,   route: "NSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Optimization",                        pubs: 3,   cites: 28,    route: "NSC",       pp: "upgrade" , edu: "Master" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Materials Science",                   pubs: 7,   cites: 244,   route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "China",        premium: true,  field: "Computer Science",                    pubs: 11,  cites: 261,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "India",        premium: true,  field: "Pediatric Critical Care Medicine",    pubs: 12,  cites: 194,   route: "TSC",       pp: "upgrade" , edu: "MD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Taiwan",       premium: true,  field: "Artificial Intelligence",             pubs: 14,  cites: 209,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "TSC", type: "NIW",   nationality: "China",        premium: true,  field: "Space Physics",                       pubs: 12,  cites: 727,   route: "TSC",       pp: "upfront" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Nepal",        premium: true,  field: "Dentistry",                           pubs: 58,  cites: 567,   route: "NSC",       pp: "upgrade" , edu: "PhD" },
  { date: "2026-04-03", sc: "NSC", type: "NIW",   nationality: "Pakistan",     premium: true,  field: "Data Science",                        pubs: 3,   cites: 19,    route: "NSC",       pp: "upgrade" , edu: null },
  { date: "2026-04-03", sc: "CSC", type: "O-1A",  nationality: "China",        premium: true,  field: "Electrical Engineering",              pubs: 21,  cites: 2391,  route: "VSC→CSC",   pp: "upfront" , edu: "PhD" },
];

const SC_COLORS    = { NSC: "#1e3a5f", TSC: "#0d9488", VSC: "#7c3aed", CSC: "#d97706" };
const TYPE_COLORS  = { NIW: "#6366f1", "EB-1A": "#0d9488", "EB-1B": "#7c3aed", "O-1A": "#d97706" };
const PP_COLORS    = { upfront: "#1e3a5f", upgrade: "#0d9488", none: "#9ca3af" };
const EDU_COLORS   = { PhD: "#0d9488", Master: "#6366f1", MD: "#d97706", Industry: "#7c3aed" };
const ROUTE_COLORS = {
  "NSC":      "#2d5a8e",
  "TSC":      "#0d9488",
  "TSC→NSC":  "#dc2626",
  "NSC→TSC":  "#d97706",
  "VSC":      "#6b7280",
  "CSC":      "#d97706",
  "VSC→CSC":  "#9ca3af",
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

const TYPE_TABS = ["All", "NIW", "EB-1A", "EB-1B", "O-1A"];

export default function ApprovalStats() {
  const isMobile = useIsMobile();
  const [sortKey, setSortKey]     = useState("date");
  const [sortDir, setSortDir]     = useState("desc");
  const [filterSC, setFilterSC]   = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterEdu, setFilterEdu] = useState("All");
  const [chartType, setChartType] = useState("All");
  const [showAll, setShowAll]     = useState(false);

  const baseCases = useMemo(() =>
    chartType === "All" ? CASES : CASES.filter(c => c.type === chartType),
  [chartType]);

  const total          = baseCases.length;
  const premiumCount   = baseCases.filter(c => c.premium).length;
  const transferCount  = baseCases.filter(c => c.route.includes("→")).length;
  const avgPubs        = total ? (baseCases.reduce((s, c) => s + c.pubs, 0) / total).toFixed(1) : "0";
  const avgCites       = total ? Math.round(baseCases.reduce((s, c) => s + c.cites, 0) / total) : 0;

  const scCounts    = useMemo(() => countBy(baseCases, "sc"),          [baseCases]);
  const typeCounts  = useMemo(() => countBy(baseCases, "type"),        [baseCases]);
  const natCounts   = useMemo(() => countBy(baseCases, "nationality"), [baseCases]);
  const routeCounts = useMemo(() => countBy(baseCases, "route"),       [baseCases]);
  const ppCounts    = useMemo(() => countBy(baseCases, "pp"),          [baseCases]);
  const fieldCounts = useMemo(() => countBy(baseCases, "field"),       [baseCases]);
  const eduCounts   = useMemo(() => {
    const known = baseCases.filter(c => c.edu);
    return countBy(known, "edu");
  }, [baseCases]);
  const eduKnownTotal = useMemo(() => baseCases.filter(c => c.edu).length, [baseCases]);

  const filtered = useMemo(() => {
    let arr = [...baseCases];
    if (filterSC !== "All")   arr = arr.filter(c => c.sc === filterSC);
    if (filterType !== "All") arr = arr.filter(c => c.type === filterType);
    if (filterEdu !== "All")  arr = arr.filter(c => c.edu === filterEdu);
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "boolean") return sortDir === "asc" ? av - bv : bv - av;
      if (typeof av === "number")  return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [baseCases, filterSC, filterType, filterEdu, sortKey, sortDir]);

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
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Approval Stats</h1>
          <span style={{ background: `${COLORS.approved}18`, color: COLORS.approved, border: `1px solid ${COLORS.approved}33`, borderRadius: 5, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>
            2026
          </span>
        </div>
        <p style={{ color: T.textMuted, fontSize: 14 }}>
          Manually collected · {total} {chartType !== "All" ? chartType : ""} cases · Feb 27 – Apr 3, 2026
        </p>
      </div>

      {/* Type tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TYPE_TABS.map(t => (
          <button key={t} onClick={() => { setChartType(t); setFilterType("All"); }}
            style={{
              padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: chartType === t ? "none" : `1px solid ${T.border}`,
              background: chartType === t ? (TYPE_COLORS[t] ?? T.accent) : T.inputBg,
              color: chartType === t ? "#fff" : T.textSub,
              transition: "all 0.15s",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Cases"   value={total}          color={COLORS.approved} />
        <StatCard label="Premium PP"    value={premiumCount}   sub={`${pct(premiumCount, total)}% used PP`}      color={T.accent} />
        <StatCard label="Transferred"   value={transferCount}  sub={`${pct(transferCount, total)}% changed SC`}  color={COLORS.pending} />
        <StatCard label="Avg Pubs"      value={avgPubs}        color={COLORS.approved} />
        <StatCard label="Avg Citations" value={avgCites.toLocaleString()} color="#7c3aed" />
      </div>

      {/* SC breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Approving Service Center">
          {scCounts.map(([sc, n]) => (
            <MiniBar key={sc} label={sc} n={n} total={total} color={SC_COLORS[sc] ?? "#6b7280"} />
          ))}
        </Panel>
        <Panel title="Case Type Breakdown">
          {typeCounts.map(([t, n]) => (
            <MiniBar key={t} label={t} n={n} total={total} color={TYPE_COLORS[t] ?? "#6b7280"} />
          ))}
        </Panel>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Transfer Routes">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={routeChartData} layout="vertical">
              <XAxis type="number" tick={{ fill: T.textMuted, fontSize: 11 }} />
              <YAxis type="category" dataKey="route" width={isMobile ? 65 : 100}
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

      {/* Education Level */}
      <div style={{ marginBottom: 20 }}>
        <Panel title="Education Level">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
            {["PhD", "Master", "MD", "Industry"].map(edu => {
              const count = eduCounts.find(([e]) => e === edu)?.[1] ?? 0;
              const pctVal = eduKnownTotal ? ((count / eduKnownTotal) * 100).toFixed(1) : "0.0";
              const active = filterEdu === edu;
              return (
                <div key={edu} onClick={() => setFilterEdu(active ? "All" : edu)}
                  style={{
                    background: active ? `${EDU_COLORS[edu]}18` : T.inputBg,
                    border: `1px solid ${active ? EDU_COLORS[edu] : T.border}`,
                    borderRadius: 10, padding: "12px 16px", cursor: "pointer", transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: EDU_COLORS[edu] }}>{count}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, marginTop: 2 }}>{edu === "MD" ? "MD / Medical" : edu === "Industry" ? "Industry / Other" : edu}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{pctVal}% of known</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted }}>
            Click a card to filter the case table · Education not disclosed for {total - eduKnownTotal} cases
            {filterEdu !== "All" && (
              <button onClick={() => setFilterEdu("All")} style={{ marginLeft: 10, background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                Clear filter ×
              </button>
            )}
          </div>
        </Panel>
      </div>

      {/* Nationality + Fields */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Panel title="Top Nationalities">
          {natCounts.slice(0, 10).map(([nat, n]) => (
            <MiniBar key={nat} label={nat} n={n} total={total} color={T.accent} />
          ))}
        </Panel>
        <Panel title="Top Research Fields">
          {fieldCounts.slice(0, 10).map(([f, n]) => (
            <MiniBar key={f} label={f} n={n} total={total} color={COLORS.approved} />
          ))}
        </Panel>
      </div>

      {/* Case table */}
      <Panel title="Case Table">
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { key: "sc",   options: ["All", "NSC", "TSC", "VSC", "CSC"] },
            { key: "type", options: ["All", "NIW", "EB-1A", "EB-1B", "O-1A"] },
            { key: "edu",  options: ["All", "PhD", "Master", "MD", "Industry"] },
          ].map(({ key, options }) => (
            <select key={key}
              value={key === "sc" ? filterSC : key === "type" ? filterType : filterEdu}
              onChange={e => key === "sc" ? setFilterSC(e.target.value) : key === "type" ? setFilterType(e.target.value) : setFilterEdu(e.target.value)}
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
                  ["date", "Date"], ["type", "Type"], ["edu", "Edu"], ["nationality", "Country"], ["field", "Field"],
                  ["route", "Route"], ["pp", "PP"], ["pubs", "Pubs"], ["cites", "Citations"],
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
                  <td style={{ padding: "9px 12px" }}><Badge text={c.type} color={TYPE_COLORS[c.type] ?? T.accent} /></td>
                  <td style={{ padding: "9px 12px" }}>
                    {c.edu ? <Badge text={c.edu} color={EDU_COLORS[c.edu] ?? "#6b7280"} /> : <span style={{ color: T.textMuted, fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: "9px 12px", color: T.textSub, whiteSpace: "nowrap" }}>{c.nationality}</td>
                  <td style={{ padding: "9px 12px", color: T.textSub, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.field}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{
                      background: `${ROUTE_COLORS[c.route] ?? "#6b7280"}18`,
                      color: ROUTE_COLORS[c.route] ?? "#6b7280",
                      border: `1px solid ${ROUTE_COLORS[c.route] ?? "#6b7280"}33`,
                      borderRadius: 5, padding: "2px 7px", fontSize: 11,
                      fontFamily: "'DM Mono', monospace", fontWeight: 600, whiteSpace: "nowrap",
                    }}>{c.route}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}><Badge text={c.pp} color={PP_COLORS[c.pp] ?? "#6b7280"} /></td>
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

      <div style={{
        marginTop: 20,
        background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10,
        padding: "12px 18px", fontSize: 12, color: "#92400e", lineHeight: 1.6,
      }}>
        <strong>Disclaimer:</strong> Data manually collected from publicly shared approval stories on wegreened.com — only cases applicants chose to share.
        Not a representative sample of all I-140 outcomes. For informational purposes only; not legal advice.
      </div>
    </div>
  );
}
