'use client'

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextStyle from "@tiptap/extension-text-style"
import Typography from "@tiptap/extension-typography"
import Heading from "@tiptap/extension-heading"
import Toolbar from "./components/toolbar"

export default function TiptapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Typography,
      
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: "text-gray-900 ",
        },
      }),
    ],
    content: "<p>Welcome to the jungle 🌴</p>",
  })

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto mt-10">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 border border-gray-300 rounded-lg bg-white"
      />
    </div>
  )
}
