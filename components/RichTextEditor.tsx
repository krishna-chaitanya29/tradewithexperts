"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[180px] rounded-lg border border-white/20 bg-[#0f0f0f] p-3 text-sm text-zinc-200 focus:outline-none",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="rounded border border-white/20 px-2 py-1">
          Bold
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className="rounded border border-white/20 px-2 py-1">
          List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
