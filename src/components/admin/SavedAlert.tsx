import { CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui";

const MESSAGES: Record<string, string> = {
  created: "Saved — the new entry has been created.",
  updated: "Saved — your changes are live.",
  published: "Published — it is now visible on the public site.",
  unpublished: "Unpublished — it is now hidden from the public site.",
  deleted: "Deleted — the entry has been removed permanently.",
  read: "Marked as read.",
  settings: "Settings saved — the public site reflects them immediately.",
};

const ERROR_MESSAGES: Record<string, string> = {
  "head-of-department":
    "This teacher still heads a department — assign a new head there before deleting.",
};

/**
 * Post-action toast (server component): list pages render this from their
 * ?saved= / ?error= search params after a server action redirect.
 */
export function SavedAlert({
  saved,
  error,
}: {
  saved?: string;
  error?: string;
}) {
  if (saved && MESSAGES[saved]) {
    return (
      <Alert tone="success" className="mb-4">
        <p className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          {MESSAGES[saved]}
        </p>
      </Alert>
    );
  }
  if (error && ERROR_MESSAGES[error]) {
    return (
      <Alert tone="danger" className="mb-4" title="Action failed">
        <p>{ERROR_MESSAGES[error]}</p>
      </Alert>
    );
  }
  return null;
}
