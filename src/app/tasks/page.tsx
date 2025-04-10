'use client';

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { PlusCircle, Sparkles, Trash2Icon, XCircle } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || "",
);

const Page = () => {
    const { user } = useUser();

    const [tasks, setTasks] = useState<any[]>([]);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [Addtitle, setAddTitle] = useState("");
    const [Addpriority, setAddPriority] = useState("low"); // Default priority
    const [assignedTo, setAssignedTo] = useState(""); // Default assigned to
    const [Adddescription, setAddDescription] = useState("");
    const [Addduedate, setAddDueDate] = useState(Date.now());

    const [TaskDialogOpen, setTaskDialogOpen] = useState(false);
    const [Tasktitle, setTaskTitle] = useState("");
    const [Taskdescription, setTaskDescription] = useState("");
    const [Taskduedate, setTaskDueDate] = useState(Date.now());
    const [Taskid, setTaskId] = useState("");
    const [TaskuserId, setTaskUserId] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    //Task edit dialog
    const [taskEditDialogOpen, setTaskEditDialogOpen] = useState(false);
    const [taskEditTitle, setTaskEditTitle] = useState<string>("");
    const [taskEditContent, setTaskEditContent] = useState<string>("");
    const [taskEditId, setTaskEditId] = useState<string>("");
    const [taskEditUserId, setTaskEditUserId] = useState<string>("");
    const [taskEditPriority, setTaskEditPriority] = useState<string>("");

    useEffect(() => {
        if (user?.id) {
            fetchTasks();
            fetchCompletedTasks();
        }
    }, [user]); // 👈 use user as dependency


    const handleTaskDialogOpen = (task: any) => {
        setTaskTitle(task.title);
        setTaskDescription(task.description);
        setTaskDueDate(task.due_date);
        setTaskId(task.id);
        setTaskUserId(task.user_id);

        setTaskDialogOpen(true); // Open the dialog to view task details
    };

    const handleTaskDialogClose = () => {
        setTaskDialogOpen(false); // Close the dialog
    };

    const fetchTasks = async () => {
        const { data, error } = await supabase.from("tasks").select("*").eq("user_id", user?.id);
        if (!error) setTasks(data);
        if (error) console.error("Error fetching tasks:", error);
    };

    const fetchCompletedTasks = async () => {
        const { data, error } = await supabase.from("completed_tasks").select("*").eq("user_id", user?.id);
        if (!error) setCompletedTasks(data);
    };

    const handleCheck = async (task: any) => {
        setLoading(true); // Set loading to true while processing the task
        {
            const { error: insertError } = await supabase.from("completed_tasks").insert({
                title: task.title,
                description: task.description,
                due_date: new Date().toISOString(),
                user_id: user?.id,
            });
            // If there is no error inserting into completed_tasks, delete the task from tasks
            // and fetch the updated tasks and completed tasks
            if (!insertError) {
                const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id);
                if (!deleteError) {
                    fetchTasks();
                    fetchCompletedTasks();
                }
            }

        }

        setLoading(false); // Set loading to false after processing the task
    };

    const handleOpenDialogAdd = () => {
        setAddDialogOpen(true); // Open the dialog to add a new task
    };

    const handleAddTask = async () => {
        setLoading(true); // Set loading to true while adding the task

        // Add task to the database
        await supabase.from("tasks").insert({
            title: Addtitle,
            due_date: new Date().toISOString(),
            description: Adddescription,
            user_id: user?.id,
        });
        setAddTitle("");
        setAddDescription("");
        setAddDueDate(Date.now());
        setAddDialogOpen(false);
        fetchTasks(); // Fetch updated tasks after adding the new task

        setLoading(false); // Set loading to false after adding the task
    }

    const handleClearAllCompleted = async () => {
        setLoading(true); // Set loading to true while clearing completed tasks

        // Clear all completed tasks from the database
        await supabase.from("completed_tasks").delete().eq("user_id", user?.id);
        fetchCompletedTasks();

        setLoading(false); // Set loading to false after clearing completed tasks
    }

    const handleUncheck = async (task: any) => {
        setLoading(true); // Set loading to true while unchecking the task

        const { error: insertError } = await supabase.from("tasks").insert({
            title: task.title,
            description: task.description,
            due_date: new Date().toISOString(), // You can use task.due_date if you wanna preserve it
            user_id: user?.id,
        });

        if (!insertError) {
            const { error: deleteError } = await supabase.from("completed_tasks").delete().eq("id", task.id);
            if (!deleteError) {
                fetchTasks();
                fetchCompletedTasks();
            }
        }

        setLoading(false); // Set loading to false after unchecking the task
    };

    const handleDeleteTask = async (task: any) => {
        setLoading(true); // Set loading to true while deleting the task

        // Delete task from the database
        const { error } = await supabase.from("tasks").delete().eq("id", task.id);
        if (error) console.error("Error deleting task:", error);

        fetchTasks();

        setLoading(false); // Set loading to false after deleting the task
    }

    const handleGenerateAIDescription = async () => {
        setLoading(true); // Set loading to true while generating the description

        // Call your AI model API to generate a description
        // Replace this with your actual API call
        const generatedDescription = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Respond formally and professionally. You are currentky tasked to generate a description for a task in a Todo app.
                                    No greetings or salutations. No nothing.... Only the required information. try to make the description general and not too specific.
                                    The task is to ${Adddescription}. The task is due on ${new Date(Addduedate).toLocaleDateString()}.
                                    Task Title: ${Addtitle}
                                    `
                        }]
                    }],
                }),
            }
        );

        const jsonResponse = await generatedDescription.json();
        const descriptionText = jsonResponse?.content?.[0]?.parts?.[0]?.text || "Failed to generate description.";
        setAddDescription(descriptionText); // Set the generated description to the state
    }

    return (
        <div className="p-4">
            <p className="text-[50px] font-[800] text-center text-gray-700">Tasks</p>
            <br />

            <button className="p-3 flex gap-2 hover:text-blue-800 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-300" onClick={handleOpenDialogAdd}>
                <PlusCircle size={32} />
                <p className="font-[600] text-2xl">Add</p>
            </button>

            <br />

            <div className="md:flex gap-4">
                <div className="md:w-1/2 p-2 border border-gray-200 rounded-lg">
                    <p className="text-[20px] font-[600] text-gray-700">Tasks</p>
                    <div className="flex flex-col gap-4 mt-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white border border-gray-200 rounded-sm p-4 overflow-hidden">
                                <div className="text-lg font-bold flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        onChange={() => handleCheck(task)}
                                        disabled={loading} // Disable checkbox while loading
                                    />
                                    <p onClick={() => handleTaskDialogOpen(task)} className="hover:text-blue-700 cursor-pointer ">{task.title}</p>
                                </div>
                                <p className="text-gray-600">{task.description}</p>
                                <br />
                                <Trash2Icon size={22} className="text-red-800 cursor-pointer" onClick={() => handleDeleteTask(task)} />

                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:w-1/2 p-2 border border-gray-200 rounded-lg">

                    <div className="flex justify-between items-center">
                        <p className="text-[20px] font-[600] text-gray-700 flex">Completed Tasks</p>
                        <p className="text-red-800 flex cursor-pointer" onClick={handleClearAllCompleted}><Trash2Icon size={22} />Delete All</p>
                    </div>

                    <div className="flex flex-col gap-4 mt-4">
                        {completedTasks.map((task) => (
                            <div key={task.id} className="bg-white shadow-md rounded-lg p-4">
                                <p className="text-lg font-bold flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked
                                        onChange={() => handleUncheck(task)}
                                        disabled={loading} // Disable checkbox while loading
                                    />
                                    {task.title}
                                </p>
                                <p className="text-gray-600">{task.description}</p>
                                <br />
                                <Trash2Icon size={22} className="text-red-800 cursor-pointer" onClick={() => handleDeleteTask(task)} />

                            </div>
                        ))}

                    </div>
                </div>

                {/* Add Task Dialog */}

                {addDialogOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 z-50">
                        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-[400px]">
                            <h2 className="text-xl font-semibold mb-4">Add Task</h2>
                            <input
                                type="text"
                                value={Addtitle}
                                onChange={(e) => setAddTitle(e.target.value)}
                                placeholder="Title"
                                className="border rounded w-full mb-2 p-2 focus:outline-none bg-gray-700 border-none"
                            />
                            <br />
                            {/* <Sparkles 
                                size={16} 
                                className="text-gray-300 mb-2 cursor-pointer"
                                onClick={handleGenerateAIDescription} // Example of setting a generated description
                            /> */}
                            <textarea
                                value={Adddescription}
                                onChange={(e) => setAddDescription(e.target.value)}
                                placeholder="Description"
                                className="border rounded w-full mb-2 p-2 focus:outline-none bg-gray-700 border-none"
                            ></textarea>
                            <input
                                type="text"
                                value={Addpriority}
                                onChange={(e) => setAddPriority(e.target.value)}
                                placeholder="Priority"
                                className="border rounded w-full mb-2 p-2 focus:outline-none bg-gray-700 border-none"
                            />

                            <input
                                type="date"
                                value={new Date(Addduedate).toISOString().split("T")[0]} // shows formatted date
                                onChange={(e) => setAddDueDate(new Date(e.target.value).getTime())}
                            />
                            <br /><br />
                            <button
                                onClick={handleAddTask}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                                disabled={loading} // Disable button when loading
                            >
                                Add Task
                            </button>
                            <button
                                onClick={() => setAddDialogOpen(false)}
                                className="ml-4 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
                                disabled={loading} // Disable button when loading
                            >
                                Cancel
                            </button>
                        </div>
                    </div>)}



                {TaskDialogOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
                        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-[700px]">
                            <XCircle size={23} onClick={handleTaskDialogClose} className="cursor-pointer" />
                            <br />

                            <h1 className="text-3xl font-semibold mb-4">{Tasktitle}</h1>

                            <p className="text-md text-gray-200">{Taskdescription}</p>
                            <br />
                            <hr />
                            <br />

                            <p className="text-sm font-bold">Task Due - {new Date(Taskduedate).toLocaleDateString()}</p>
                        </div>
                    </div>)}
            </div>
        </div>
    );
};

export default Page;
