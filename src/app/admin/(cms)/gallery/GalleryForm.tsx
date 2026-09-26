"use client";

import { useActionState, useState } from "react";
import { saveGalleryItemAction, type AdminFormState } from "@/app/admin/actions";
import { Button, Card, CardContent, Field, Input, Select, Textarea } from "@/components/ui";
import type { GalleryItem } from "@/lib/db/types";

const initialState: AdminFormState = {};

/** ISO date -> YYYY-MM-DD for <input type="date">. */
function toDateInput(iso: string | undefined): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/**
 * Gallery item create/edit form (spec 17.8): the two palette colours drive
 * the generated CSS-art tile — a live preview shows the pairing while you
 * pick (native color inputs always produce valid 6-digit hex).
 */
export function GalleryForm({ item }: { item?: GalleryItem }) {
  const [state, formAction, pending] = useActionState(
    saveGalleryItemAction,
    initialState,
  );
  const errors = state.fieldErrors ?? {};
  const [colorA, setColorA] = useState(item?.palette[0] ?? "#7c2d3e");
  const [colorB, setColorB] = useState(item?.palette[1] ?? "#e5e0d8");

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {item && <input type="hidden" name="id" value={item.id} />}
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Title"
            name="gallery-title"
            className="sm:col-span-2"
            error={errors.title}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="title"
                required
                defaultValue={item?.title ?? ""}
                placeholder="e.g. Chemistry titration practical"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field label="Category" name="gallery-category" error={errors.category}>
            {(aria) => (
              <Select
                id={aria.id}
                name="category"
                defaultValue={item?.category ?? "campus"}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              >
                <option value="campus">Campus</option>
                <option value="science-lab">Science Labs</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="library">Library</option>
              </Select>
            )}
          </Field>

          <Field label="Taken on" name="gallery-takenAt" error={errors.takenAt}>
            {(aria) => (
              <Input
                id={aria.id}
                name="takenAt"
                type="date"
                required
                defaultValue={toDateInput(item?.takenAt)}
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Palette colour A (dark)"
            name="gallery-colorA"
            error={errors.colorA}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="colorA"
                type="color"
                value={colorA}
                onChange={(event) => setColorA(event.target.value)}
                className="h-10 px-1 py-1"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Palette colour B (light)"
            name="gallery-colorB"
            error={errors.colorB}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="colorB"
                type="color"
                value={colorB}
                onChange={(event) => setColorB(event.target.value)}
                className="h-10 px-1 py-1"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>

          <Field
            label="Caption"
            name="gallery-caption"
            className="sm:col-span-2"
            error={errors.caption}
          >
            {(aria) => (
              <Textarea
                id={aria.id}
                name="caption"
                required
                rows={3}
                defaultValue={item?.caption ?? ""}
                placeholder="One or two sentences shown under the tile and in the lightbox."
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
              />
            )}
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : item ? "Save changes" : "Create gallery item"}
        </Button>
        <div
          aria-hidden="true"
          className="h-12 w-24 rounded-lg border border-border"
          style={{
            background: `linear-gradient(135deg, ${colorA} 0%, ${colorB} 100%)`,
          }}
          title="Palette preview"
        />
        <p className="text-xs text-muted">
          Palette preview — the public tile is generated from these colours.
        </p>
      </div>
    </form>
  );
}
