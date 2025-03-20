'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Markdown from "react-markdown";
import { Sparkles, Trash } from "lucide-react";

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
    const [openTests, setOpenTests] = useState<Set<string>>(new Set());
    const [isLoading, setLoading] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<any | null>(null);
    const [userInput, setUserInput] = useState("");
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

    useEffect(() => {
        if (user) fetchTests();
    }, [user]);

    const toggleTest = (id: string) => {
        setOpenTests((prev) => {
            const newOpenTests = new Set(prev);
            if (newOpenTests.has(id)) newOpenTests.delete(id);
            else newOpenTests.add(id);
            return newOpenTests;
        });
    };

    const openEditDialog = (test: any) => {
        setSelectedTest(test);
        setUserInput("");
        setAiResponse(null);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedTest(null);
        setAiResponse(null);
    };

    const handleEditSubmit = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${"AIzaSyCblOxBBk0sWJVjGY22SHKYTC1Xu2MYIZQ"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user", parts: [{
                                text: `Respond formally and professionally. Always state searial number of each question (eg. Q1 -, Q2 - or ). No greetings or closing statements. 
                            Edit this text based on the prompt:\n\nOriginal Text: "${selectedTest?.content}"\n\nUser Prompt: "${userInput}"`
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

    const keepChanges = async () => {
        if (!selectedTest || !aiResponse) return;

        const updatedTests = tests.map((test) =>
            test.id === selectedTest.id ? { ...test, content: aiResponse } : test
        );
        setTests(updatedTests);

        await supabase
            .from("test_documents")
            .update({ content: aiResponse })
            .eq("id", selectedTest.id);

        closeDialog();
    };

    const handleDeleteTest = async (testId?: string) => {
        if (!testId) {
            console.error("Delete Error: testId is undefined");
            return;
        }

        try {
            const { error } = await supabase
                .from("test_documents")
                .delete()
                .eq("id", testId);

            if (error) {
                console.error("Delete Error:", error);
            } else {
                setTests((prevTests) => prevTests.filter((test) => test.id !== testId));
            }
        } catch (error) {
            console.error("Request Failed:", error);
        }
    };


    return (
        <div className="p-3">
            <p className="text-4xl text-center">Dashboard</p>
            <br />
            <p className="text-lg font-[600]">Your Tests</p>
            <br />

            {isLoading ? <p>Loading...</p> : (
                <div className="flex flex-wrap gap-4">
                    {tests.map((test) => {
                        const isOpen = openTests.has(test.id);
                        return (
                            <div
                                key={test.id}
                                className={`p-2 border hover:bg-gray-100 cursor-pointer transition-all duration-200 rounded-lg border-gray-200
                                    ${isOpen ? 'w-full h-auto' : 'w-[400px] h-[200px]'} overflow-hidden`}
                                onClick={() => toggleTest(test.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-xl">{test.title}</p>

                                    <div className="flex gap-3">
                                        <p
                                            className="hover:text-indigo-600 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); openEditDialog(test); }}
                                        >
                                            <Sparkles size={20} />
                                        </p>
                                        <p
                                            className="hover:text-red-600 cursor-pointer"
                                            onClick={() => handleDeleteTest(test.id)}
                                        >
                                            <Trash size={20} />
                                        </p>
                                    </div>
                                </div>

                                <br />
                                <hr />
                                <br />
                                <small className={`${isOpen ? 'text-lg' : 'text-sm'}`}>
                                    <Markdown>{test.content}</Markdown>
                                </small>
                            </div>
                        );
                    })}
                </div>
            )}

            {isDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Edit Test with AI</h2>
                        <p className="text-gray-600">{selectedTest?.title}</p>

                        {aiResponse ? (
                            <>
                                <p className="text-sm text-gray-500">AI Suggested Changes:</p>

                                <div className="border p-3 rounded-md bg-gray-100 mt-2 max-h-60 overflow-y-auto">
                                    <Markdown>{aiResponse}</Markdown>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeDialog}>Deny Changes</button>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={keepChanges}>Keep Changes</button>
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
                                    <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeDialog}>Cancel</button>
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

        </div>
    );
};

export default Dashboard;
