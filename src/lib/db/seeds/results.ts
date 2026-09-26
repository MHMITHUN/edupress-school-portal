import type { ResultSession, ResultEntry, SubjectMark } from "../types";

/**
 * Result session seeds (spec 17.7). Four sessions; the Half-Yearly 2026
 * (Class 9) session is intentionally left DRAFT so the public verification
 * flow demonstrably returns published sessions only.
 *
 * Grades follow the Bangladeshi national scale (A+ 5.00, A 4.00, A- 3.50,
 * B 3.00, C 2.00, D 1.00) and every entry's gpa/grade are COMPUTED from
 * the subject marks by the helper below, so rows can never drift out of
 * sync with their marks. All students are fictional.
 */

function gradeInfo(marks: number): { grade: string; points: number } {
  if (marks >= 80) return { grade: "A+", points: 5 };
  if (marks >= 70) return { grade: "A", points: 4 };
  if (marks >= 60) return { grade: "A-", points: 3.5 };
  if (marks >= 50) return { grade: "B", points: 3 };
  if (marks >= 40) return { grade: "C", points: 2 };
  return { grade: "D", points: 1 };
}

function overallGrade(gpa: number): string {
  if (gpa >= 5) return "A+";
  if (gpa >= 4) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3) return "B";
  if (gpa >= 2) return "C";
  return "D";
}

function entry(
  studentId: string,
  studentName: string,
  marks: number[],
  subjects: string[],
): ResultEntry {
  const subjectMarks: SubjectMark[] = marks.map((value, index) => ({
    subject: subjects[index],
    marks: value,
    grade: gradeInfo(value).grade,
  }));
  const points = subjectMarks.map((row) => gradeInfo(row.marks).points);
  const gpa = Math.round((points.reduce((a, b) => a + b, 0) / points.length) * 100) / 100;
  return { studentId, studentName, gpa, grade: overallGrade(gpa), subjectMarks };
}

// ---- Class 10 (Science) — SSC Mock Test 2026, PUBLISHED ----------------------

const SSC_SUBJECTS = [
  "Bangla",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Higher Mathematics",
  "ICT",
];

const sscMock = [
  ["PMC-2026-1101", "Rakib Hasan", [78, 85, 92, 88, 81, 76, 90, 95]],
  ["PMC-2026-1102", "Sumaiya Akter", [88, 91, 95, 90, 86, 89, 94, 97]],
  ["PMC-2026-1103", "Md. Sabbir Hossain", [64, 70, 75, 72, 68, 71, 79, 84]],
  ["PMC-2026-1104", "Nusrat Jahan Mim", [81, 87, 89, 92, 85, 88, 91, 93]],
  ["PMC-2026-1105", "Tahmid Chowdhury", [59, 66, 72, 70, 63, 68, 74, 80]],
  ["PMC-2026-1106", "Farzana Yesmin", [92, 94, 96, 95, 90, 93, 97, 98]],
  ["PMC-2026-1107", "Arif Mahmud", [47, 55, 61, 58, 52, 60, 65, 71]],
  ["PMC-2026-1108", "Sadia Islam", [73, 79, 84, 80, 77, 75, 83, 88]],
  ["PMC-2026-1109", "Mehedi Hasan", [68, 74, 80, 77, 72, 70, 78, 85]],
  ["PMC-2026-1110", "Jannatul Ferdous", [85, 88, 90, 87, 84, 86, 89, 92]],
  ["PMC-2026-1111", "Shakil Ahmed", [55, 62, 67, 64, 58, 63, 69, 76]],
  ["PMC-2026-1112", "Moushumi Rahman", [77, 82, 86, 83, 79, 80, 85, 90]],
  ["PMC-2026-1113", "Imran Kabir", [70, 76, 82, 78, 74, 73, 81, 87]],
  ["PMC-2026-1114", "Rumana Haque", [62, 69, 74, 71, 66, 70, 75, 82]],
].map(([id, name, marks]) => entry(id as string, name as string, marks as number[], SSC_SUBJECTS));

// ---- Class 12 (Science) — Test Examination 2025, PUBLISHED --------------------

const HSC_SUBJECTS = [
  "Bangla",
  "English",
  "Physics",
  "Chemistry",
  "Higher Mathematics",
  "Biology",
  "ICT",
];

const hscTest = [
  ["PMC-2025-1201", "Nafis Ahmed", [80, 84, 78, 75, 82, 79, 88]],
  ["PMC-2025-1202", "Tasnim Rahman", [90, 93, 88, 86, 91, 89, 95]],
  ["PMC-2025-1203", "Sajidul Karim", [66, 72, 69, 64, 70, 67, 76]],
  ["PMC-2025-1204", "Maisha Tabassum", [85, 88, 82, 80, 84, 83, 90]],
  ["PMC-2025-1205", "Rashedul Islam", [58, 65, 61, 56, 60, 59, 68]],
  ["PMC-2025-1206", "Anika Bushra", [78, 82, 76, 74, 79, 77, 85]],
  ["PMC-2025-1207", "Fahim Shahriar", [71, 75, 70, 68, 73, 72, 80]],
  ["PMC-2025-1208", "Nabila Sultana", [88, 90, 85, 83, 87, 86, 92]],
  ["PMC-2025-1209", "Zahid Hasan", [54, 60, 57, 53, 58, 55, 63]],
  ["PMC-2025-1210", "Ishrat Binte Nur", [82, 86, 80, 78, 83, 81, 89]],
  ["PMC-2025-1211", "Rifat Chowdhury", [75, 79, 73, 71, 76, 74, 83]],
  ["PMC-2025-1212", "Sanjida Akter", [68, 74, 66, 63, 69, 67, 75]],
].map(([id, name, marks]) => entry(id as string, name as string, marks as number[], HSC_SUBJECTS));

// ---- Class 9 (Science) — Half-Yearly 2026, DRAFT (hidden from the public) -----

const CLASS9_SUBJECTS = [
  "Bangla",
  "English",
  "Mathematics",
  "General Science",
  "Bangladesh and Global Studies",
  "Religion and Moral Education",
  "ICT",
];

const halfYearly9 = [
  ["PMC-2026-0901", "Abdullah Al Noman", [74, 78, 80, 77, 82, 85, 84]],
  ["PMC-2026-0902", "Fatema-tuz-Zohra", [86, 88, 90, 85, 89, 92, 91]],
  ["PMC-2026-0903", "Syed Nazmus Sakib", [62, 68, 71, 66, 72, 75, 73]],
  ["PMC-2026-0904", "Umme Habiba", [79, 83, 85, 80, 84, 87, 86]],
  ["PMC-2026-0905", "Md. Yasin Arafat", [57, 63, 66, 60, 65, 69, 67]],
  ["PMC-2026-0906", "Rowshni Jahan", [81, 85, 87, 82, 86, 88, 89]],
  ["PMC-2026-0907", "Ashiqur Rahman", [69, 73, 76, 71, 75, 78, 77]],
  ["PMC-2026-0908", "Nusrat Siddiqua", [90, 92, 94, 89, 93, 95, 96]],
  ["PMC-2026-0909", "Tanjim Alam", [65, 70, 73, 68, 72, 74, 76]],
  ["PMC-2026-0910", "Jarin Tasnim", [77, 80, 82, 78, 81, 84, 83]],
  ["PMC-2026-0911", "Mostafizur Rahman", [52, 58, 61, 56, 60, 63, 62]],
  ["PMC-2026-0912", "Ayesha Siddika", [72, 76, 79, 74, 78, 80, 81]],
].map(([id, name, marks]) => entry(id as string, name as string, marks as number[], CLASS9_SUBJECTS));

// ---- Class 10 (Science) — Annual Examination 2025, PUBLISHED -----------------

const annual2025 = [
  ["PMC-2025-1001", "Rakib Hasan", [75, 80, 84, 82, 78, 77, 83, 86]],
  ["PMC-2025-1002", "Sumaiya Akter", [87, 90, 93, 89, 85, 88, 91, 94]],
  ["PMC-2025-1003", "Md. Sabbir Hossain", [61, 67, 72, 69, 64, 66, 73, 78]],
  ["PMC-2025-1004", "Nusrat Jahan Mim", [83, 86, 88, 85, 82, 84, 87, 90]],
  ["PMC-2025-1005", "Tahmid Chowdhury", [70, 75, 78, 74, 71, 73, 79, 81]],
  ["PMC-2025-1006", "Farzana Yesmin", [91, 93, 95, 92, 89, 90, 94, 96]],
  ["PMC-2025-1007", "Arif Mahmud", [45, 52, 58, 55, 49, 54, 60, 66]],
  ["PMC-2025-1008", "Sadia Islam", [74, 78, 81, 77, 75, 76, 80, 84]],
  ["PMC-2025-1009", "Mehedi Hasan", [66, 72, 76, 73, 69, 70, 75, 79]],
  ["PMC-2025-1010", "Jannatul Ferdous", [84, 87, 89, 86, 83, 85, 88, 91]],
  ["PMC-2025-1011", "Shakil Ahmed", [53, 60, 64, 61, 56, 59, 65, 70]],
  ["PMC-2025-1012", "Moushumi Rahman", [76, 81, 85, 80, 77, 79, 84, 87]],
].map(([id, name, marks]) => entry(id as string, name as string, marks as number[], SSC_SUBJECTS));

export const seedResultSessions: ResultSession[] = [
  {
    id: "res-ssc-mock-2026",
    exam: "SSC Mock Test",
    year: 2026,
    classLevel: "SSC",
    className: "Class 10 (Science)",
    publishedAt: "2026-09-15T11:00:00.000Z",
    status: "published",
    results: sscMock,
  },
  {
    id: "res-hsc-test-2025",
    exam: "Test Examination",
    year: 2025,
    classLevel: "HSC",
    className: "Class 12 (Science)",
    publishedAt: "2025-10-08T10:00:00.000Z",
    status: "published",
    results: hscTest,
  },
  {
    id: "res-half-yearly-2026-class-9",
    exam: "Half-Yearly",
    year: 2026,
    classLevel: "SSC",
    className: "Class 9 (Science)",
    publishedAt: "2026-09-20T09:00:00.000Z",
    status: "draft",
    results: halfYearly9,
  },
  {
    id: "res-annual-2025-class-10",
    exam: "Annual",
    year: 2025,
    classLevel: "SSC",
    className: "Class 10 (Science)",
    publishedAt: "2026-01-10T10:00:00.000Z",
    status: "published",
    results: annual2025,
  },
];
