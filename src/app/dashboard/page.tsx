'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Markdown from "react-markdown";
import { Sparkles } from "lucide-react";

const supabase = createClient(
    "https://ucsiqszgsdqfzufbqjpp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc2lxc3pnc2RxZnp1ZmJxanBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNTk0NDcsImV4cCI6MjA1NzkzNTQ0N30.AjuQjAv8ZJsovgLq8Cge7tfLe193vIgVrGfN4MnBtUs"
);

const Dashboard = () => {
    const { user } = useUser();
    const [tests, setTests] = useState<any[]>([]);
    const [openTests, setOpenTests] = useState<Set<string>>(new Set());
    const [isLoading, setLoading] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<any | null>(null);
    const [userInput, setUserInput] = useState("");
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (user) fetchTests();
    }, [user]);

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
                        { role: "user", parts: [{ text: `Edit this text based on the prompt:\n\nOriginal Text: "${selectedTest?.content}"\n\nUser Prompt: "${userInput}"` }] }
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
                                    ${isOpen ? 'w-full h-auto' : 'w-[300px] h-[200px]'} overflow-hidden`}
                                onClick={() => toggleTest(test.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-xl">{test.title}</p>
                                    <p
                                        className="flex hover:text-indigo-600 cursor-pointer"
                                        onClick={(e) => { e.stopPropagation(); openEditDialog(test); }}
                                    >
                                        <Sparkles size={16} />&nbsp;Edit with AI
                                    </p>
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

                                {/* 🔥 SCROLLABLE CONTAINER FOR AI RESPONSE */}
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

// 🔥 Fake AI function for testing. Replace with an actual API call.
const fakeAiEditFunction = async (text: string, prompt: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`**Edited Content:**\n\n${text}\n\n*AI Applied: ${prompt}*`);
        }, 2000);
    });
};

export default Dashboard;
