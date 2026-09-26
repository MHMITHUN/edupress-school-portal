"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getCmsStore, type CmsStore } from "@/lib/cms";
import {
  noticeFormSchema,
  eventFormSchema,
  teacherFormSchema,
  departmentFormSchema,
  resultSessionFormSchema,
  galleryFormSchema,
  downloadFormSchema,
  settingsFormSchema,
} from "@/lib/validation/content";

/**
 * Admin CMS server actions (spec 17.8). Every action re-checks the session
 * role server-side (guards are never bypassable from the client) and
 * validates input with the zod schemas in src/lib/validation/content.ts.
 *
 * Two shapes:
 *  - save*Action(prev, formData) for useActionState forms: returns
 *    { fieldErrors } on validation failure, redirects to the list with a
 *    ?saved= toast on success.
 *  - plain (formData) actions for tiny <form> buttons (publish/unpublish/
 *    delete/mark read) that redirect back with a toast.
 *
 * Roles: ADMIN and CONTENT_EDITOR manage all content; Settings is
 * admin-only (checked in both the page and the action).
 */

export interface AdminFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

type SavedValue =
  | "created"
  | "updated"
  | "published"
  | "unpublished"
  | "deleted"
  | "read"
  | "settings";

// ---- FormData helpers -----------------------------------------------------------

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** First zod issue per field, keyed by the form field name. */
function fieldErrorsFrom(issues: readonly z.ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Store errors worth showing on a field (duplicate slugs and the like). */
function duplicateSlugField(error: unknown): string | null {
  if (error instanceof Error && /already exists/i.test(error.message)) {
    return "This slug is already taken — choose another.";
  }
  return null;
}

function done(path: string, saved: SavedValue): never {
  revalidatePath(path);
  redirect(`${path}?saved=${saved}`);
}

const CONTENT_ROLES = ["ADMIN", "CONTENT_EDITOR"] as const;

// ---- notices -------------------------------------------------------------------

export async function saveNoticeAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  const parsed = noticeFormSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    category: str(formData, "category"),
    priority: str(formData, "priority"),
    status: str(formData, "status"),
    featured: bool(formData, "featured"),
    publishedAt: str(formData, "publishedAt"),
    expiryAt: str(formData, "expiryAt") || undefined,
    attachmentFileName: str(formData, "attachmentFileName") || undefined,
    attachmentLabel: str(formData, "attachmentLabel") || undefined,
    bodyMd: str(formData, "bodyMd"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const { attachmentFileName, attachmentLabel, ...rest } = parsed.data;
  const store = await getCmsStore();
  const id = str(formData, "id");
  try {
    if (id) {
      const updated = await store.updateNotice(id, {
        ...rest,
        expiryAt: rest.expiryAt === undefined ? undefined : rest.expiryAt,
        ...(attachmentFileName && attachmentLabel
          ? { attachment: { fileName: attachmentFileName, label: attachmentLabel } }
          : {}),
      });
      if (!updated) return { error: "That notice no longer exists." };
    } else {
      await store.createNotice({
        ...rest,
        ...(attachmentFileName && attachmentLabel
          ? { attachment: { fileName: attachmentFileName, label: attachmentLabel } }
          : {}),
      });
    }
  } catch (error) {
    const slugError = duplicateSlugField(error);
    if (slugError) return { fieldErrors: { slug: slugError } };
    throw error;
  }
  done("/admin/notices", id ? "updated" : "created");
}

export async function setNoticeStatusAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  const id = str(formData, "id");
  const status = str(formData, "status") === "published" ? "published" : "draft";
  await (await getCmsStore()).setNoticeStatus(id, status);
  done("/admin/notices", status === "published" ? "published" : "unpublished");
}

export async function deleteNoticeAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  await (await getCmsStore()).deleteNotice(str(formData, "id"));
  done("/admin/notices", "deleted");
}

// ---- events -----------------------------------------------------------------------

export async function saveEventAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  const parsed = eventFormSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    category: str(formData, "category"),
    status: str(formData, "status"),
    location: str(formData, "location"),
    startsAt: str(formData, "startsAt"),
    endsAt: str(formData, "endsAt"),
    description: str(formData, "description"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const store = await getCmsStore();
  const id = str(formData, "id");
  try {
    if (id) {
      const updated = await store.updateEvent(id, parsed.data);
      if (!updated) return { error: "That event no longer exists." };
    } else {
      await store.createEvent(parsed.data);
    }
  } catch (error) {
    const slugError = duplicateSlugField(error);
    if (slugError) return { fieldErrors: { slug: slugError } };
    throw error;
  }
  done("/admin/events", id ? "updated" : "created");
}

export async function setEventStatusAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  const id = str(formData, "id");
  const status = str(formData, "status") === "published" ? "published" : "draft";
  await (await getCmsStore()).setEventStatus(id, status);
  done("/admin/events", status === "published" ? "published" : "unpublished");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  await (await getCmsStore()).deleteEvent(str(formData, "id"));
  done("/admin/events", "deleted");
}

// ---- teachers ------------------------------------------------------------------------

export async function saveTeacherAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  const parsed = teacherFormSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    designation: str(formData, "designation"),
    departmentSlug: str(formData, "departmentSlug"),
    qualification: str(formData, "qualification"),
    subjects: str(formData, "subjects"),
    email: str(formData, "email"),
    bioMd: str(formData, "bioMd"),
    joinYear: str(formData, "joinYear"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const store = await getCmsStore();
  const id = str(formData, "id");
  try {
    if (id) {
      const updated = await store.updateTeacher(id, parsed.data);
      if (!updated) return { error: "That teacher no longer exists." };
    } else {
      await store.createTeacher(parsed.data);
    }
  } catch (error) {
    const slugError = duplicateSlugField(error);
    if (slugError) return { fieldErrors: { slug: slugError } };
    throw error;
  }
  done("/admin/teachers", id ? "updated" : "created");
}

export async function deleteTeacherAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  const removed = await (await getCmsStore()).deleteTeacher(str(formData, "id"));
  if (!removed) {
    redirect("/admin/teachers?error=head-of-department");
  }
  done("/admin/teachers", "deleted");
}

// ---- departments --------------------------------------------------------------------

export async function saveDepartmentAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  const parsed = departmentFormSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    summary: str(formData, "summary"),
    descriptionMd: str(formData, "descriptionMd"),
    establishedYear: str(formData, "establishedYear"),
    headTeacherId: str(formData, "headTeacherId") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const { headTeacherId, ...rest } = parsed.data;
  const input = {
    ...rest,
    ...(headTeacherId ? { headTeacherId } : {}),
  };
  const store = await getCmsStore();
  const id = str(formData, "id");
  try {
    if (id) {
      const updated = await store.updateDepartment(id, input);
      if (!updated) return { error: "That department no longer exists." };
    } else {
      await store.createDepartment(input);
    }
  } catch (error) {
    const slugError = duplicateSlugField(error);
    if (slugError) return { fieldErrors: { slug: slugError } };
    throw error;
  }
  done("/admin/departments", id ? "updated" : "created");
}

export async function deleteDepartmentAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  await (await getCmsStore()).deleteDepartment(str(formData, "id"));
  done("/admin/departments", "deleted");
}

// ---- result sessions -------------------------------------------------------------------

export async function saveResultSessionAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  let entries: unknown;
  try {
    entries = JSON.parse(str(formData, "entries") || "[]");
  } catch {
    return { error: "The student rows could not be read — please retry." };
  }
  const parsed = resultSessionFormSchema.safeParse({
    exam: str(formData, "exam"),
    year: str(formData, "year"),
    classLevel: str(formData, "classLevel"),
    className: str(formData, "className"),
    status: str(formData, "status"),
    publishedAt: str(formData, "publishedAt"),
    entries,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  const { publishedAt, entries: rows, ...meta } = parsed.data;
  const store = await getCmsStore();
  const id = str(formData, "id");
  const input = {
    ...meta,
    results: rows,
    publishedAt: new Date(`${publishedAt}T00:00:00.000Z`).toISOString(),
  };
  if (id) {
    const updated = await store.updateResultSession(id, input);
    if (!updated) return { error: "That result session no longer exists." };
  } else {
    await store.createResultSession(input);
  }
  done("/admin/results", id ? "updated" : "created");
}

export async function setResultSessionStatusAction(
  formData: FormData,
): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  const id = str(formData, "id");
  const status = str(formData, "status") === "published" ? "published" : "draft";
  await (await getCmsStore()).setResultSessionStatus(id, status);
  done("/admin/results", status === "published" ? "published" : "unpublished");
}

export async function deleteResultSessionAction(
  formData: FormData,
): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  await (await getCmsStore()).deleteResultSession(str(formData, "id"));
  done("/admin/results", "deleted");
}

// ---- gallery ------------------------------------------------------------------------

export async function saveGalleryItemAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  const parsed = galleryFormSchema.safeParse({
    title: str(formData, "title"),
    category: str(formData, "category"),
    caption: str(formData, "caption"),
    takenAt: str(formData, "takenAt"),
    colorA: str(formData, "colorA"),
    colorB: str(formData, "colorB"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const { colorA, colorB, takenAt, ...rest } = parsed.data;
  const input = {
    ...rest,
    takenAt: new Date(`${takenAt}T00:00:00.000Z`).toISOString(),
    palette: [colorA.toLowerCase(), colorB.toLowerCase()] as [string, string],
  };
  const store = await getCmsStore();
  const id = str(formData, "id");
  if (id) {
    const updated = await store.updateGalleryItem(id, input);
    if (!updated) return { error: "That gallery item no longer exists." };
  } else {
    await store.createGalleryItem(input);
  }
  done("/admin/gallery", id ? "updated" : "created");
}

export async function deleteGalleryItemAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  await (await getCmsStore()).deleteGalleryItem(str(formData, "id"));
  done("/admin/gallery", "deleted");
}

// ---- downloads ------------------------------------------------------------------------

export async function saveDownloadAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole([...CONTENT_ROLES]);
  const parsed = downloadFormSchema.safeParse({
    title: str(formData, "title"),
    category: str(formData, "category"),
    fileName: str(formData, "fileName"),
    format: str(formData, "format"),
    sizeLabel: str(formData, "sizeLabel"),
    updatedAt: str(formData, "updatedAt"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const { updatedAt, ...rest } = parsed.data;
  const input = {
    ...rest,
    updatedAt: new Date(`${updatedAt}T00:00:00.000Z`).toISOString(),
  };
  const store: CmsStore = await getCmsStore();
  const id = str(formData, "id");
  if (id) {
    const updated = await store.updateDownload(id, input);
    if (!updated) return { error: "That download entry no longer exists." };
  } else {
    await store.createDownload(input);
  }
  done("/admin/downloads", id ? "updated" : "created");
}

export async function deleteDownloadAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  await (await getCmsStore()).deleteDownload(str(formData, "id"));
  done("/admin/downloads", "deleted");
}

// ---- inquiries -------------------------------------------------------------------------

export async function markInquiryReadAction(formData: FormData): Promise<void> {
  await requireRole([...CONTENT_ROLES]);
  const id = str(formData, "id");
  await (await getCmsStore()).markInquiryRead(id);
  revalidatePath("/admin/inquiries");
  redirect(`/admin/inquiries/${id}?saved=read`);
}

// ---- settings (admin-only) ---------------------------------------------------------------

export async function saveSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireRole(["ADMIN"]);
  const parsed = settingsFormSchema.safeParse({
    collegeName: str(formData, "collegeName"),
    tagline: str(formData, "tagline"),
    announcementText: str(formData, "announcementText"),
    announcementActive: bool(formData, "announcementActive"),
    contactAddress: str(formData, "contactAddress"),
    contactPhone: str(formData, "contactPhone"),
    contactEmail: str(formData, "contactEmail"),
    principalName: str(formData, "principalName"),
    principalTitle: str(formData, "principalTitle"),
    principalMessageMd: str(formData, "principalMessageMd"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }
  const store = await getCmsStore();
  await store.updateSettings({
    collegeName: parsed.data.collegeName,
    tagline: parsed.data.tagline,
    announcement: {
      text: parsed.data.announcementText,
      active: parsed.data.announcementActive,
    },
    contact: {
      address: parsed.data.contactAddress,
      phone: parsed.data.contactPhone,
      email: parsed.data.contactEmail,
    },
    principal: {
      name: parsed.data.principalName,
      title: parsed.data.principalTitle,
      messageMd: parsed.data.principalMessageMd,
    },
  });
  done("/admin/settings", "settings");
}
