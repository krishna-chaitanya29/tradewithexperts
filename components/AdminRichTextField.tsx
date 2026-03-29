"use client";

import { RichTextEditor } from "@/components/RichTextEditor";
import { useState } from "react";

type AdminRichTextFieldProps = {
  name: string;
  defaultValue?: string;
};

export function AdminRichTextField({ name, defaultValue = "" }: AdminRichTextFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <RichTextEditor value={value} onChange={setValue} />
    </div>
  );
}
