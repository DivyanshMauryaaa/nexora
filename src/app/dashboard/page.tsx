'use client'

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Markdown from "react-markdown";

const supabase = createClient(
    "https://ucsiqszgsdqfzufbqjpp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc2lxc3pnc2RxZnp1ZmJxanBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNTk0NDcsImV4cCI6MjA1NzkzNTQ0N30.AjuQjAv8ZJsovgLq8Cge7tfLe193vIgVrGfN4MnBtUs"
);

const Dashboard = () => {
    const { user } = useUser();
    const [tests, setTests] = useState<any[]>([]);

    useEffect(() => {
        if (user) fetchTests();
    }, [user]);

    const fetchTests = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("test_documents")
            .select("*")
            .eq("user_id", user.id);

        if (error) console.error("Fetch Error:", error);
        else setTests(data || []);
    };

    return (
        <div className="p-3">
            <p className="text-4xl text-center">Dashboard</p>
            <br />
            <p className="text-lg font-[600]">Your Tests</p>
            <br />

            <div className="flex flex-wrap gap-4">
                {tests.map((test) => (
                    <div key={test.id} className="p-2 border hover:bg-gray-100 cursor-pointer transition-all duration-100 rounded-lg border-gray-200 w-[300px] h-[200px] overflow-hidden">
                        <p className="font-semibold text-xl">{test.title}</p>
                        <br />
                        <hr />
                        <br />
                        <small className="text-sm">
                            <Markdown>{test.content}</Markdown>
                        </small>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default Dashboard;
