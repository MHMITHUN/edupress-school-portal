"use client";

import { Printer } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";

/** Opens the browser print dialog for the printable notice view. */
export function PrintButton({ ...props }: ButtonProps) {
  return (
    <Button variant="outline" onClick={() => window.print()} {...props}>
      <Printer className="size-4" aria-hidden="true" />
      Print this notice
    </Button>
  );
}
