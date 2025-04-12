'use client'

import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ""
)

const Notes = () => {
    const params = useParams();
    const { user } = useUser();

    const workspaceId = params.workspaceId as string;

    const [Notes, setNotes] = useState<any>([]);
    const [NoteCreateDialogOpen, setNoteCreateDialogOpen] = useState(false);
    const [NoteEditDialogOpen, setNoteEditDialogOpen] = useState(false);
    const [noteID, setNoteID] = useState('');

    //Form Details for creation of new note or for editing
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");

    //Dialog Toggle functions
    const toggleDialog = (dialogType?: string, noteTitle?: string, noteContent?: string, noteID?: string) => {
        //Set form elements
        setNoteTitle(noteTitle || "")
        setNoteContent(noteContent || "")
        setNoteID(noteID || "")

        //Set mode of the dialog
        if (dialogType == "create") {
            setNoteCreateDialogOpen(!NoteCreateDialogOpen)
        }
        else if (dialogType == "edit") {
            setNoteEditDialogOpen(!NoteEditDialogOpen)
        }
        else {
            return;
        }
    }

    const fetchNotes = async () => {
        const { data, error } = await supabase.from('quick_notes').select('*').eq('workspace_id', workspaceId)

        setNotes(data || [])
        if (error) return;
    }

    useEffect(() => {
        if (workspaceId && user) {
            fetchNotes()
        }
    })

    const handleAddQuickNote = async (noteTitle: string, noteContent: string) => {
        try {
            await supabase.from('quick_notes').insert({
                user_id: user?.id,
                workspace_id: workspaceId,
                title: noteTitle,
                content: noteContent,
            })
        } catch (err) {
            console.log(err)
        }

        toggleDialog('create')
    }

    const handleDeleteQuickNote = async (noteID: string) => {
        try {
            await supabase.from('quick_notes').delete().eq('id', noteID);
        } catch (err) {
            console.log(err)
        }
    }

    const handleEditQuickNote = async (noteID: string, noteTitle: string, noteContent: string) => {
        try {
            await supabase.from('quick_notes').update({ title: noteTitle, content: noteContent }).eq('id', noteID);
        } catch(err) {
            console.log(err)
        }

        toggleDialog('edit')
    }

    return (
        <div>
            <p className="font-bold text-3xl">Quick Notes</p>
            <br />

            <button
                className="py-2 px-5 text-md hover:bg-blue-800 hover:text-white border border-gray-300 cursor-pointer transition-all duration-200 text-gray-500 hover:border-blue-800 rounded-lg"
                onClick={() => toggleDialog("create")}
            >
                New Note
            </button>

            <br /><br />

            <div className="flex flex-wrap gap-3">
                {Notes.map((quickNote: any) => (
                    <div key={quickNote.id} className="p-5 w-[400px] h-[200px] border border-gray-300 rounded-lg">
                        <div className="flex gap-2">
                            <Pencil size={16} className="hover:text-blue-700 cursor-pointer" onClick={() => toggleDialog('edit', quickNote.title, quickNote.content, quickNote.id)}/>
                            <Trash2 size={16} className="hover:text-red-600 cursor-pointer" onClick={() => handleDeleteQuickNote(quickNote.id)} />
                        </div>

                        <p className="font-bold text-2xl">{quickNote.title}</p>
                        <p className="text-gray-500">{quickNote.content}</p>
                    </div>
                ))}
            </div>


            {/* Dialog */}
            {NoteCreateDialogOpen && (
                <div className="fixed inset-0 bg-transparent bg-blur-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create New Note</h2>
                        <input
                            type="text"
                            placeholder="Note Title"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mb-4 focus:border-blue-700 focus:outline-none"
                        />
                        <textarea
                            placeholder="Note Content"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full min-h-[100px] max-h-[500px] p-2 border border-gray-300 rounded mb-4 focus:border-blue-700 focus:outline-none"
                            rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => toggleDialog("create")}
                                className="py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Add logic to save the note
                                    handleAddQuickNote(noteTitle, noteContent)
                                }}
                                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            {/* Dialog */}
            {NoteEditDialogOpen && (
                <div className="fixed inset-0 bg-transparent bg-blur-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Edit Note</h2>
                        <input
                            type="text"
                            placeholder="Note Title"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mb-4 focus:border-blue-700 focus:outline-none"
                        />
                        <textarea
                            placeholder="Note Content"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full p-2  min-h-[100px] max-h-[500px] border border-gray-300 rounded mb-4 focus:border-blue-700 focus:outline-none"
                            rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => toggleDialog("edit")}
                                className="py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Add logic to save the note
                                    handleEditQuickNote(noteID, noteTitle, noteContent)
                                }}
                                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Notes;