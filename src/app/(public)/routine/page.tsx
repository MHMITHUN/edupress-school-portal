import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Info, UserRound } from "lucide-react";
import {
  Alert,
  Card,
  CardContent,
  Select,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TH,
  TD,
} from "@/components/ui";
import {
  CLASS_ROUTINES,
  DEFAULT_ROUTINE_ID,
  ROUTINE_DAYS,
  ROUTINE_PERIODS,
  findEntry,
  getRoutine,
} from "@/lib/content/routine";

/**
 * Class routine (spec 17.2). Class-section select via GET param; the grid
 * renders periods 1-7 across Sun-Thu with the tiffin break after period 3.
 * SOURCE LABEL: static demo dataset (src/lib/content/routine.ts) — see the
 * on-page note; it is intentionally NOT presented as CMS content.
 */

export const metadata: Metadata = {
  title: "Class Routine",
  description:
    "Weekly class routines of Padma Model College — periods, subjects and class teachers for SSC and HSC class sections.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Cells for one day row: a break cell after period 3, then each period. */
function RoutineDayRowCells({ routineId, day }: { routineId: string; day: typeof ROUTINE_DAYS[number] }) {
  const routine = getRoutine(routineId)!;
  return (
    <>
      <TD className="font-medium">{day}</TD>
      {ROUTINE_PERIODS.map((period) => {
        const entry = findEntry(routine, day, period.period);
        return (
          <TD key={period.period}>
            {period.period === 4 && (
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted/70">
                Tiffin break 10:45–11:15
              </span>
            )}
            {entry ? (
              <>
                <span className="block font-medium">{entry.subject}</span>
                {entry.teacher && (
                  <span className="block text-xs text-muted">{entry.teacher}</span>
                )}
              </>
            ) : (
              <span className="text-muted">—</span>
            )}
          </TD>
        );
      })}
    </>
  );
}

export default async function RoutinePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const requested = firstParam(sp.class)?.trim() || DEFAULT_ROUTINE_ID;
  const routine = getRoutine(requested) ?? getRoutine(DEFAULT_ROUTINE_ID)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Academic schedule
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-fg">
          Class routine
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Weekly period-by-period routine for every class section. The college
          day runs Sunday to Thursday with seven teaching periods and a
          tiffin break (10:45–11:15 AM) after period three.
        </p>
      </header>

      <Alert tone="info" className="mb-6" title="Demo dataset — not CMS content">
        <p>
          This routine is a <strong>static sample dataset</strong> maintained
          in the portal source for demonstration. The authoritative routine
          published each term is the{" "}
          <Link
            href="/downloads"
            className="font-medium text-accent underline underline-offset-2"
          >
            Class Routine sheet on the Downloads page
          </Link>
          , and exam routines arrive as notices on the notice board.
        </p>
      </Alert>

      <form
        method="get"
        action="/routine"
        className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="sm:max-w-md sm:flex-1">
          <label
            htmlFor="routine-class"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Class and section
          </label>
          <Select id="routine-class" name="class" defaultValue={routine.id}>
            {CLASS_ROUTINES.map((row) => (
              <option key={row.id} value={row.id}>
                {row.className} — {row.section} ({row.classLevel})
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:self-auto"
        >
          <CalendarRange className="size-4" aria-hidden="true" />
          Show routine
        </button>
      </form>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <h2 className="font-serif text-xl font-semibold text-fg">
              {routine.className} — {routine.section}
            </h2>
            <p className="text-sm text-muted">
              {routine.classLevel} programme · {routine.room}
            </p>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <UserRound className="size-4 text-accent" aria-hidden="true" />
            Class teacher:{" "}
            <span className="font-medium text-fg">{routine.classTeacher}</span>
          </p>
        </CardContent>
      </Card>

      <Table>
        <TableHead>
          <TableRow className="hover:bg-transparent">
            <TH>Day</TH>
            {ROUTINE_PERIODS.map((period) => (
              <TH key={period.period}>
                Period {period.period}
                <span className="block font-normal normal-case tracking-normal text-muted/80">
                  {period.start}–{period.end}
                </span>
              </TH>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {ROUTINE_DAYS.map((day) => (
            <TableRow key={day}>
              <RoutineDayRowCells routineId={routine.id} day={day} />
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Periods shown without a subject are free or self-study hall periods.
        Teacher names match the{" "}
        <Link href="/teachers" className="underline underline-offset-2 hover:text-fg">
          teacher directory
        </Link>
        .
      </p>
    </div>
  );
}
