'use client';

import { Plus, XIcon } from "lucide-react";
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ""
);

const workSpaces = () => {
    //Get the user details
    const { user } = useUser();

    //Router
    const router = useRouter();

    //Dialog States
    const [isCreateSpaceDialogOpen, setIsCreateSpaceDialogOpen] = useState(false);
    const [createSpaceTitle, setCreateSpaceTitle] = useState("");
    const [createSpaceDescription, setCreateSpaceDescription] = useState("");
    const [isCreateSpaceLoading, setIsCreateSpaceLoading] = useState(false);

    //Database client-side states
    const [spaces, setSpaces] = useState<any>([]);
    const [isLoadingSpaces, setIsLoadingSpaces] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createSpace = async (title: string, description: string) => {
        setIsCreateSpaceLoading(true);

        const { error } = await supabaseClient.from("workspaces").insert({
            title: title,
            description: description,
            user_id: user?.id,
        });

        if (!error) alert("Space created successfully");
        else alert(`Error creating space: ${error.message}, code: ${error.code}`);
        fetchSpaces();

        setIsCreateSpaceLoading(false);
    }

    const fetchSpaces = async () => {
        setIsLoadingSpaces(true);

        const { data, error } = await supabaseClient
            .from("workspaces")
            .select("*")
            .eq("user_id", user?.id);

        if (error) return setError(error.message);
        if (data) {
            setSpaces(data);
        } else {
            setSpaces([]);
        }

        setIsLoadingSpaces(false);
    }

    useEffect(() => {
        if (user?.id) {
            fetchSpaces();
        }
    }, [user]);

    return (
        <div className="p-4">
            <p className="text-3xl md:text-[60px] text-center font-[600]">Your Spaces</p>
            <br />
            <button className="p-3 ml-2 text-gray-500 border border-gray-300 hover:bg-blue-800 hover:text-white cursor-pointer rounded-xl transition-all duration-200 flex gap-2"
                onClick={() => setIsCreateSpaceDialogOpen(true)}
            ><Plus />Create a New Space</button>

            <br />

            <div className="flex gap-3 m-2">

                {isLoadingSpaces ? (
                    <p>Loading spaces...</p>
                ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                ) : spaces.length > 0 ? (
                    spaces.map((space: { id: string; title: string; description: string }) => (
                        <div
                            onClick={() => router.push(`/workspaces/${space.id}`)}
                            key={space.id} 
                            className="border border-gray-300 p-4 cursor-pointer w-[300px] h-[100px] max-h-[120px] overflow-y-hidden rounded-lg">
                            <h3 className="text-lg font-bold">{space.title}</h3>
                            <p className="text-sm text-gray-600">{space.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No spaces found. Create one to get started!</p>
                )}

            </div>

            {isCreateSpaceDialogOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
                        <button onClick={() => setIsCreateSpaceDialogOpen(false)}><XIcon className="cursor-pointer" /></button>

                        <h2 className="text-xl font-bold">Create a New Space</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createSpace(createSpaceTitle, createSpaceDescription);
                                setCreateSpaceTitle("");
                                setCreateSpaceDescription("");
                                setIsCreateSpaceDialogOpen(false);
                            }}
                        >
                            <div className="mb-4">
                                <label htmlFor="spaceTitle" className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="spaceTitle"
                                    value={createSpaceTitle}
                                    onChange={(e) => setCreateSpaceTitle(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="spaceDescription" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="spaceDescription"
                                    value={createSpaceDescription}
                                    onChange={(e) => setCreateSpaceDescription(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateSpaceDialogOpen(false)}
                                    className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreateSpaceLoading}
                                    className={`px-4 py-2 text-white rounded-md ${isCreateSpaceLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isCreateSpaceLoading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}

export default workSpaces;