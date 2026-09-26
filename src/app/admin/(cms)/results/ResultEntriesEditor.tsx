"use client";

import { useState } from "react";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { Button, Input } from "@/components/ui";

/**
 * Repeatable student-row editor for result sessions (spec 17.7 + 17.8).
 * State lives entirely client-side; every change re-serializes the rows to
 * the hidden "entries" input, and the server action re-validates the JSON
 * with zod before anything is stored.
 */

export interface EditorSubjectMark {
  subject: string;
  marks: string;
  grade: string;
}

export interface EditorEntry {
  studentId: string;
  studentName: string;
  gpa: string;
  grade: string;
  subjectMarks: EditorSubjectMark[];
}

export const emptyEntry = (): EditorEntry => ({
  studentId: "",
  studentName: "",
  gpa: "",
  grade: "",
  subjectMarks: [{ subject: "", marks: "", grade: "" }],
});

export function ResultEntriesEditor({ initial }: { initial?: EditorEntry[] }) {
  const [entries, setEntries] = useState<EditorEntry[]>(
    initial && initial.length > 0 ? initial : [emptyEntry()],
  );

  const update = (index: number, patch: Partial<EditorEntry>) => {
    setEntries((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const updateMark = (
    entryIndex: number,
    markIndex: number,
    patch: Partial<EditorSubjectMark>,
  ) => {
    setEntries((rows) =>
      rows.map((row, i) =>
        i === entryIndex
          ? {
              ...row,
              subjectMarks: row.subjectMarks.map((mark, j) =>
                j === markIndex ? { ...mark, ...patch } : mark,
              ),
            }
          : row,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        type="hidden"
        name="entries"
        value={JSON.stringify(
          entries.map((entry) => ({
            ...entry,
            subjectMarks: entry.subjectMarks,
          })),
        )}
        readOnly
      />

      {entries.map((entry, entryIndex) => (
        <fieldset
          key={entryIndex}
          className="rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          <legend className="px-1 text-sm font-semibold text-fg">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="size-4 text-accent" aria-hidden="true" />
              Student {entryIndex + 1}
              {entry.studentName ? ` — ${entry.studentName}` : ""}
            </span>
          </legend>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">Student ID</span>
              <Input
                value={entry.studentId}
                onChange={(event) =>
                  update(entryIndex, { studentId: event.target.value })
                }
                placeholder="PMC-2026-1101"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">Name</span>
              <Input
                value={entry.studentName}
                onChange={(event) =>
                  update(entryIndex, { studentName: event.target.value })
                }
                placeholder="Rakib Hasan"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">GPA (of 5)</span>
              <Input
                value={entry.gpa}
                onChange={(event) => update(entryIndex, { gpa: event.target.value })}
                inputMode="decimal"
                placeholder="4.86"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">Grade</span>
              <Input
                value={entry.grade}
                onChange={(event) =>
                  update(entryIndex, { grade: event.target.value })
                }
                placeholder="A+"
                required
              />
            </label>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Subject marks
            </p>
            <div className="flex flex-col gap-2">
              {entry.subjectMarks.map((mark, markIndex) => (
                <div
                  key={markIndex}
                  className="grid gap-2 sm:grid-cols-[1fr_7rem_7rem_auto] sm:items-center"
                >
                  <Input
                    value={mark.subject}
                    onChange={(event) =>
                      updateMark(entryIndex, markIndex, {
                        subject: event.target.value,
                      })
                    }
                    placeholder="Subject, e.g. Physics"
                    aria-label={`Subject ${markIndex + 1} for student ${entryIndex + 1}`}
                    required
                  />
                  <Input
                    value={mark.marks}
                    onChange={(event) =>
                      updateMark(entryIndex, markIndex, {
                        marks: event.target.value,
                      })
                    }
                    inputMode="numeric"
                    placeholder="Marks /100"
                    aria-label={`Marks for subject ${markIndex + 1} of student ${entryIndex + 1}`}
                    required
                  />
                  <Input
                    value={mark.grade}
                    onChange={(event) =>
                      updateMark(entryIndex, markIndex, {
                        grade: event.target.value,
                      })
                    }
                    placeholder="Grade"
                    aria-label={`Grade for subject ${markIndex + 1} of student ${entryIndex + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEntries((rows) =>
                        rows.map((row, i) =>
                          i === entryIndex
                            ? {
                                ...row,
                                subjectMarks:
                                  row.subjectMarks.length > 1
                                    ? row.subjectMarks.filter(
                                        (_, j) => j !== markIndex,
                                      )
                                    : row.subjectMarks,
                              }
                            : row,
                        ),
                      )
                    }
                    disabled={entry.subjectMarks.length <= 1}
                    aria-label={`Remove subject ${markIndex + 1}`}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface-2 hover:text-danger disabled:opacity-40"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEntries((rows) =>
                    rows.map((row, i) =>
                      i === entryIndex
                        ? {
                            ...row,
                            subjectMarks: [
                              ...row.subjectMarks,
                              { subject: "", marks: "", grade: "" },
                            ],
                          }
                        : row,
                    ),
                  )
                }
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add subject
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setEntries((rows) => rows.filter((_, i) => i !== entryIndex))
                }
                disabled={entries.length <= 1}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove student
              </Button>
            </div>
          </div>
        </fieldset>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setEntries((rows) => [...rows, emptyEntry()])}
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Add student
      </Button>
    </div>
  );
}
