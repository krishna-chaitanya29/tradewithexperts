"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type ScreenshotUploaderProps = {
  name: string;
};

export function ScreenshotUploader({ name }: ScreenshotUploaderProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  const handleFile = async (file: File) => {
    setStatus("uploading");
    try {
      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to create signed upload URL");
      }

      const { path, token } = await uploadResponse.json();
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("trade-screenshots").uploadToSignedUrl(path, token, file);

      if (uploadError) {
        throw uploadError;
      }

      const signResponse = await fetch("/api/admin/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (!signResponse.ok) {
        throw new Error("Failed to create signed file URL");
      }

      const payload = await signResponse.json();
      setUrl(payload.url);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
        }}
        className="w-full rounded-lg border border-white/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white"
      />
      <p className="text-xs text-zinc-400">
        {status === "uploading" ? "Uploading screenshot..." : status === "done" ? "Screenshot uploaded securely." : status === "error" ? "Upload failed." : "Upload to private storage bucket."}
      </p>
    </div>
  );
}
