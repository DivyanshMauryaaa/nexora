'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Markdown from "react-markdown";
import { Sparkles, Trash, Expand, Shrink, Download, X, CircleX } from "lucide-react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import TurndownService from "turndown";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ''
);

interface Test {
    id: string;
    title: string;
    content: string;
    user_id: string;
}

const Dashboard = () => {
    const { user } = useUser();
    const [tests, setTests] = useState<Test[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [openTests, setOpenTests] = useState<Set<string>>(new Set());
    const [isLoading, setLoading] = useState(false);
    const [isEditDialogOpen, setDialogOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [userInput, setUserInput] = useState("");
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useState<string>("");
    const [isNoteEditDialogOpen, setNoteEditDialogOpen] = useState(false);

    //Document Dialog
    const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
    const [documentTitle, setDocumentTitle] = useState<string>("");
    const [documentContent, setDocumentContent] = useState<string>("");

    const openDocumentDialog = (title: string, content: string) => {
        setDocumentDialogOpen(true);

        //Set data for showing in the dialog when clicked on the document
        setDocumentTitle(title);
        setDocumentContent(content);
    }

    const fetchTests = async () => {
        setLoading(true);
        if (!user) return;

        const { data, error } = await supabase
            .from("test_documents")
            .select("*")
            .eq("user_id", user.id);

        if (error) console.error("Fetch Error:", error);
        else setTests(data || []);

        setLoading(false);
    };

    const fetchNotes = async () => {
        setLoading(true);
        if (!user) return;

        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("user_id", user.id);

        if (error) console.error("Fetch Error:", error);
        else setNotes(data || []);

        setLoading(false);
    }

    useEffect(() => {
        if (user) fetchTests();
    }, [user]);

    useEffect(() => {
        if (user) fetchNotes();
    }, [user]);

    const openEditDialog = (document: any) => {
        setSelectedDoc(document);
        setUpdatedTitle(document.title);
        setUserInput("");  // Ensure AI input is cleared
        setAiResponse(null);  // Prevent AI from triggering
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedDoc(null);
        setAiResponse(null);
    };

    const openNoteEditDialog = (document: any) => {
        setSelectedDoc(document);
        setUpdatedTitle(document.title);
        setUserInput("");  // Ensure AI input is cleared
        setAiResponse(null);  // Prevent AI from triggering
        setDialogOpen(true);
    };

    const closeNoteEditDialog = () => {
        setDialogOpen(false);
        setSelectedDoc(null);
        setAiResponse(null);
    };


    const handleEditSubmit = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user", parts: [{
                                text: `Respond formally and professionally.For questions Always state searial number of each question (eg. Q1 -, Q2 - or ). And for notes, do as told in the prompt but always keep the key points intact, only add/modify where required No greetings or closing statements. 
                            Edit this text based on the prompt:\n\nOriginal Text: "${selectedDoc?.content}"\n\nUser Prompt: "${userInput}"`
                            }]
                        }
                    ]
                }),
            });

            const data = await response.json();
            if (response.ok && data.candidates?.length > 0) {
                setAiResponse(data.candidates[0].content.parts[0].text);
            } else {
                console.error("API Error:", data);
            }
        } catch (error) {
            console.error("Request Failed:", error);
        }

        setIsProcessing(false);
    };

    const keepChanges = async (database?: string) => {
        if (!selectedDoc || !aiResponse) return;

        const updatedTests = tests.map((test) =>
            test.id === selectedDoc.id ? { ...test, content: aiResponse } : test
        );
        setTests(updatedTests);

        await supabase
            .from(database || "test_documents")
            .update({ content: aiResponse })
            .eq("id", selectedDoc.id);

        closeDialog();
    };

    const HandleeditTitle = async (testId: string, newTitle: string, database: string) => {
        if (!testId || !newTitle.trim()) return;

        // Update UI instantly for better UX
        setTests((prevTests) =>
            prevTests.map((test) =>
                test.id === testId ? { ...test, title: newTitle } : test
            )
        );

        // Update Supabase
        await supabase
            .from(database)
            .update({ title: newTitle })
            .eq("id", testId);
    };

    const handleDeleteTest = async (documentID?: string, updatedTitle?: string, deleteDatabase?: string) => {
        if (!documentID) {
            console.error("Delete Error: documentID is undefined");
            return;
        }

        try {
            const { error } = await supabase
                .from(deleteDatabase || "test_documents")
                .delete()
                .eq("id", documentID);

            if (error) {
                console.error("Delete Error:", error);
            } else {
                setTests((prevTests) => prevTests.filter((test) => test.id !== documentID));
            }
        } catch (error) {
            console.error("Request Failed:", error);
        }
    };

    const handleMarkdownToDocx = async (markdown: string, fileName = "document.docx") => {
        try {
            const turndownService = new TurndownService({ strongDelimiter: "**" });

            // Use the GFM plugin for better formatting
            turndownService.addRule("preserveLineBreaks", {
                filter: ["br"],
                replacement: () => "\n",
            });

            const htmlContent = turndownService.turndown(markdown);

            // Split content into paragraphs (preserving line breaks)
            const paragraphs = htmlContent.split("\n").map(line => new Paragraph({
                children: [new TextRun(line)],
            }));

            const doc = new Document({
                sections: [{ properties: {}, children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, fileName);

            console.log("DOCX file generated successfully!");
        } catch (error) {
            console.error("Error converting Markdown to DOCX:", error);
        }
    };

    return (
        <div className="p-3">
            <p className="text-4xl text-center">Dashboard</p>
            <br />
            <p className="font-bold text-4xl">Your Tests</p>
            <br />

            {isLoading ? <p>Loading...</p> : (
                <div>
                    <div className="flex flex-wrap gap-4">

                        {tests.length === 0 ? (
                            <p className="text-gray-500">No tests available.</p>)
                            : (
                                tests.map((test) => {
                                    const isOpen = openTests.has(test.id);
                                    return (
                                        <div
                                            key={test.id}
                                            className={`p-2 border transition-all duration-200 rounded-lg border-gray-200 hover:shadow-md hover:bg-gray-100 cursor-pointer
                                            ${isOpen ? 'w-full h-auto' : 'w-[400px] h-[200px]'} overflow-hidden`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <p
                                                    className="font-semibold text-xl outline-none cursor-text"
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => HandleeditTitle(test.id, e.target.innerText, "test_documents")}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            e.currentTarget.blur(); // Save title on Enter
                                                        }
                                                    }}
                                                >
                                                    {test.title}
                                                </p>


                                                <div className="flex gap-3">
                                                    <p
                                                        className="hover:text-blue-800 cursor-pointer"
                                                        onClick={(e) => { e.stopPropagation(); openEditDialog(test); }}
                                                    >
                                                        <Sparkles size={20} />
                                                    </p>
                                                    <p
                                                        className="hover:text-red-700 cursor-pointer"
                                                        onClick={() => handleDeleteTest(test.id, "test_documents")}
                                                    >
                                                        <Trash size={20} />
                                                    </p>
                                                    <p className="cursor-pointer" onClick={() => handleMarkdownToDocx(test.content, `${test.title}.docx`)}>
                                                        <Download size={20} />
                                                    </p>


                                                </div>
                                            </div>

                                            <br />
                                            <hr />
                                            <br />
                                            <div onClick={() => openDocumentDialog(test.title, test.content)}>
                                                <small className={`${isOpen ? 'text-lg' : 'text-sm'}`}>
                                                    <Markdown>{test.content}</Markdown>
                                                </small>
                                            </div>
                                        </div>
                                    );
                                })
                            )}


                    </div>

                    <br /><br />

                    <p className="font-bold text-4xl">Your Notes</p>
                    <br />

                    <div className="flex flex-wrap gap-4">


                        {notes.map((note) => {
                            const isOpen = openTests.has(note.id);
                            return (
                                <div
                                    key={note.id}
                                    className={`p-2 border transition-all duration-200 rounded-lg border-gray-200 hover:shadow-md hover:bg-gray-100 cursor-pointer
                                    ${isOpen ? 'w-full h-auto' : 'w-[400px] h-[200px]'} overflow-hidden`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p
                                            className="font-semibold text-xl outline-none cursor-text"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => HandleeditTitle(note.id, e.target.innerText, "notes")}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    e.currentTarget.blur(); // Save title on Enter
                                                }
                                            }}
                                        >
                                            {note.title}
                                        </p>


                                        <div className="flex gap-3">
                                            <p
                                                className="hover:text-indigo-800 cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); openNoteEditDialog(note); }}
                                            >
                                                <Sparkles size={20} />
                                            </p>
                                            <p
                                                className="hover:text-red-600 cursor-pointer"
                                                onClick={() => handleDeleteTest(note.id, "notes")}
                                            >
                                                <Trash size={20} />
                                            </p>
                                            <p className="cursor-pointer" onClick={() => handleMarkdownToDocx(note.content, `${note.title}.docx`)}>
                                                <Download size={20} />
                                            </p>


                                        </div>
                                    </div>

                                    <br />
                                    <hr />
                                    <br />
                                    <div onClick={() => openDocumentDialog(note.title, note.content)}>
                                        <small className={`${isOpen ? 'text-lg' : 'text-sm'}`}>
                                            <Markdown>{note.content}</Markdown>
                                        </small>
                                    </div>
                                </div>
                            );
                        })}


                    </div>
                </div>
            )}

            {isEditDialogOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center">
                    <div className={`bg-gray-800 text-white p-5 rounded-lg shadow-lg ${aiResponse ? "w-[90%] h-[90%]" : "w-[400px] max-h-[90vh]"} overflow-y-auto`}>
                        <h2 className="text-xl font-semibold mb-4">Edit with AI</h2>
                        <p className="">{selectedDoc?.title}</p>

                        {aiResponse ? (
                            <>
                                <p className="text-sm">AI Suggested Changes:</p>

                                <div className={`border p-3 rounded-md mt-2 ${aiResponse ? "max-h-[90%]" : "max-h-60"} overflow-y-auto`}>
                                    <Markdown>{aiResponse}</Markdown>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeDialog}>Deny Changes</button>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => keepChanges("test_documents")}>Keep Changes</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <textarea
                                    className="w-full p-2 border rounded-lg mt-3"
                                    rows={4}
                                    placeholder="Enter your instructions..."
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button className="px-4 py-2 rounded" onClick={closeDialog}>Cancel</button>
                                    <button
                                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                                        onClick={handleEditSubmit}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Processing..." : "Submit"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {isNoteEditDialogOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center">
                    <div className={`bg-gray-800 text-white p-5 rounded-lg shadow-lg ${aiResponse ? "w-[90%] h-[90%]" : "w-[400px] max-h-[90vh]"} overflow-y-auto`}>
                        <h2 className="text-xl font-semibold mb-4">Edit Note with AI</h2>
                        <p className="">{selectedDoc?.title}</p>

                        {aiResponse ? (
                            <>
                                <p className="text-sm">AI Suggested Changes:</p>

                                <div className={`border p-3 rounded-md mt-2 ${aiResponse ? "max-h-[90%]" : "max-h-60"} overflow-y-auto`}>
                                    <Markdown>{aiResponse}</Markdown>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button className="px-4 py-2 bg-gray-200 rounded" onClick={closeDialog}>Deny Changes</button>
                                    <button className="px-4 py-2 bg-indigo-700 text-white rounded" onClick={() => keepChanges("notes")}>Keep Changes</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <textarea
                                    className="w-full p-2 border rounded-lg mt-3"
                                    rows={4}
                                    placeholder="Enter your instructions..."
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                />
                                <div className="flex justify-end gap-3 mt-4">
                                    <button className="px-4 py-2 rounded" onClick={closeDialog}>Cancel</button>
                                    <button
                                        className="px-4 py-2 bg-indigo-700 text-white rounded"
                                        onClick={handleEditSubmit}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? "Processing..." : "Submit"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {documentDialogOpen && (
                <div className="fixed inset-0 bg-opacity-50 bg-gray-100 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto">
                        <p className="cursor-pointer" onClick={() => setDocumentDialogOpen(false)}><CircleX /></p> {/* Close button */}

                        <br />
                        <p className="text-4xl font-bold text-gray-700">{documentTitle}</p> {/* Dialog Title */}
                        <br />
                        <hr />
                        <br />

                        <Markdown>{documentContent}</Markdown> {/* Dialog content */}
                        <br />
                    </div>
                </div>
            )}


        </div>
    );
};

export default Dashboard;
