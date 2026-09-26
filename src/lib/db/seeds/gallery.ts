import type { GalleryItem } from "../types";

/**
 * Gallery seeds — twelve items; each palette is a two-hex colour pair that
 * drives a generated CSS-art thumbnail (no external images on this portal).
 * takenAt uses fixed Jan-Sep 2026 dates.
 */

export const seedGalleryItems: GalleryItem[] = [
  {
    id: "gal-001",
    title: "Main academic building",
    category: "campus",
    caption: "The 1998 building that houses the science departments and the library.",
    takenAt: "2026-01-12T09:00:00.000Z",
    palette: ["#7c2d3e", "#e5e0d8"],
  },
  {
    id: "gal-002",
    title: "College main gate",
    category: "campus",
    caption: "Morning assembly queue at the Padma Avenue gate.",
    takenAt: "2026-02-02T08:15:00.000Z",
    palette: ["#5b2330", "#d9c9b8"],
  },
  {
    id: "gal-003",
    title: "Roof garden study corner",
    category: "campus",
    caption: "Second-floor terrace turned into an open-air reading corner in 2024.",
    takenAt: "2026-03-11T10:30:00.000Z",
    palette: ["#3f5d4a", "#eae4d4"],
  },
  {
    id: "gal-004",
    title: "Chemistry titration practical",
    category: "science-lab",
    caption: "Class 12 students running standardisation experiments in the wet lab.",
    takenAt: "2026-01-22T11:00:00.000Z",
    palette: ["#1f4f5c", "#e3ebee"],
  },
  {
    id: "gal-005",
    title: "Physics optics bench",
    category: "science-lab",
    caption: "Determining focal length with the optical bench during a demonstration class.",
    takenAt: "2026-04-16T10:00:00.000Z",
    palette: ["#40355c", "#e8e3f0"],
  },
  {
    id: "gal-006",
    title: "Computer Lab 1",
    category: "science-lab",
    caption: "ICT practical session in the main lab with forty-two workstations.",
    takenAt: "2026-05-07T09:30:00.000Z",
    palette: ["#2d4a6b", "#e2e8f0"],
  },
  {
    id: "gal-007",
    title: "Annual Sports Day march-past",
    category: "sports",
    caption: "The four college houses march past the dais on Sports Day 2026.",
    takenAt: "2026-02-05T08:30:00.000Z",
    palette: ["#7c2d3e", "#f0e6d2"],
  },
  {
    id: "gal-008",
    title: "Tug-of-war final",
    category: "sports",
    caption: "Padma House vs Karnaphuli House in the closing event of the year.",
    takenAt: "2026-02-05T15:00:00.000Z",
    palette: ["#6b4a1f", "#f2ead6"],
  },
  {
    id: "gal-009",
    title: "One-act play at the cultural evening",
    category: "cultural",
    caption: "The drama club stages 'Padmar Ekti Golpo' at the annual cultural programme.",
    takenAt: "2026-01-29T18:00:00.000Z",
    palette: ["#57274a", "#ecdfea"],
  },
  {
    id: "gal-010",
    title: "Book fair on the college lawn",
    category: "cultural",
    caption: "Publishers from Nilkhet and Bangla Academy at the campus book fair.",
    takenAt: "2026-02-13T16:00:00.000Z",
    palette: ["#37503f", "#e7ecdf"],
  },
  {
    id: "gal-011",
    title: "Reading hall, central library",
    category: "library",
    caption: "The sixty-seat reading hall during extended hours before the mock test.",
    takenAt: "2026-08-24T16:00:00.000Z",
    palette: ["#4a3524", "#efe7d8"],
  },
  {
    id: "gal-012",
    title: "Reserve section question banks",
    category: "library",
    caption: "Board question banks and reference texts set out for exam-season study.",
    takenAt: "2026-09-02T10:00:00.000Z",
    palette: ["#23404e", "#e4ebe9"],
  },
];
