import type { Download } from "../types";

/**
 * Download seeds — nine documents across every download category. No real
 * files are served; entries describe what the office counter provides, and
 * the UI links to the counter/inquiry path (spec 17.6, honest demo).
 */

export const seedDownloads: Download[] = [
  {
    id: "dwn-001",
    title: "Admission Form 2026-27 (SSC and HSC)",
    category: "admission-form",
    fileName: "admission-form-2026.pdf",
    format: "pdf",
    sizeLabel: "310 KB",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "dwn-002",
    title: "Admission Medical Certificate Form",
    category: "admission-form",
    fileName: "admission-medical-form-2026.docx",
    format: "docx",
    sizeLabel: "86 KB",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "dwn-003",
    title: "SSC 2026 Syllabus (All Groups)",
    category: "syllabus",
    fileName: "ssc-syllabus-2026.pdf",
    format: "pdf",
    sizeLabel: "1.2 MB",
    updatedAt: "2026-01-20T09:00:00.000Z",
  },
  {
    id: "dwn-004",
    title: "HSC 2027 Syllabus (Science and Business Studies)",
    category: "syllabus",
    fileName: "hsc-syllabus-2027.pdf",
    format: "pdf",
    sizeLabel: "1.4 MB",
    updatedAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: "dwn-005",
    title: "ICT Practical Syllabus and Lab Manual",
    category: "syllabus",
    fileName: "ict-practical-manual-2026.pdf",
    format: "pdf",
    sizeLabel: "640 KB",
    updatedAt: "2026-02-18T09:00:00.000Z",
  },
  {
    id: "dwn-006",
    title: "Class Routine 2026 (Classes 9-12)",
    category: "routine",
    fileName: "class-routine-2026.xlsx",
    format: "xlsx",
    sizeLabel: "92 KB",
    updatedAt: "2026-09-08T09:00:00.000Z",
  },
  {
    id: "dwn-007",
    title: "SSC Mock Test 2026 Examination Routine",
    category: "routine",
    fileName: "ssc-mock-routine-2026.pdf",
    format: "pdf",
    sizeLabel: "180 KB",
    updatedAt: "2026-08-30T09:00:00.000Z",
  },
  {
    id: "dwn-008",
    title: "College Prospectus 2026-27",
    category: "prospectus",
    fileName: "prospectus-2026-27.pdf",
    format: "pdf",
    sizeLabel: "2.8 MB",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "dwn-009",
    title: "Admission Circular 2026-27 (Official Copy)",
    category: "notice",
    fileName: "admission-circular-2026.pdf",
    format: "pdf",
    sizeLabel: "260 KB",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
];
