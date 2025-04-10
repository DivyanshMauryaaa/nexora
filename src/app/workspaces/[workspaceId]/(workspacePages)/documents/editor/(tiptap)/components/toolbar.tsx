'use client'

import { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Undo2,
    Redo2,
    Heading1,
    Heading1Icon,
    List
} from "lucide-react"

export default function Toolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null

    const iconBtn =
        "p-2 rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95 disabled:opacity-40 flex"

    const activeBtn = "bg-black text-white hover:bg-black hover:text-black"

    const applyFontSize = (size: string) => {
        editor.chain().focus().setMark("textStyle", { class: size }).run()
    }

    return (
        <div className="flex gap-2 p-2 border border-gray-400 rounded-sm bg-white sticky mx-auto w-full">
            <button
                className={`${iconBtn} ${editor.isActive("bold") ? activeBtn : ""}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="w-4 h-4" />
            </button>

            <button
                className={`${iconBtn} ${editor.isActive("italic") ? activeBtn : ""}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="w-4 h-4" />
            </button>

            <button
                className={`${iconBtn} ${editor.isActive("strike") ? activeBtn : ""}`}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="w-4 h-4" />
            </button>

            <button
                className={`${iconBtn} ${editor.isActive("code") ? activeBtn : ""}`}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="w-4 h-4" />
            </button>

            {/* ✨ FONT SIZE DROPDOWN */}
            <button
                className={`${iconBtn} ${editor.isActive("heading", { level: 1 }) ? activeBtn : ""}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            ><List /></button>
            <button
                className={iconBtn}
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo2 className="w-4 h-4" />
            </button>

            <button
                className={iconBtn}
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo2 className="w-4 h-4" />
            </button>
        </div>
    )
}
