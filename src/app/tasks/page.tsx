'use client';

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { PlusCircle, Trash2Icon, XCircle } from "lucide-react";

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
    const [Adddescription, setAddDescription] = useState("");
    const [Addduedate, setAddDueDate] = useState(Date.now());

    const [TaskDialogOpen, setTaskDialogOpen] = useState(false);
    const [Tasktitle, setTaskTitle] = useState("");
    const [Taskdescription, setTaskDescription] = useState("");
    const [Taskduedate, setTaskDueDate] = useState(Date.now());
    const [Taskid, setTaskId] = useState("");
    const [TaskuserId, setTaskUserId] = useState("");

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
        const { error: insertError } = await supabase.from("completed_tasks").insert({
            title: task.title,
            description: task.description,
            due_date: new Date().toISOString(),
            user_id: user?.id,
        });

        if (!insertError) {
            const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id);
            if (!deleteError) {
                fetchTasks();
                fetchCompletedTasks();
            }
        }
    };

    const handleOpenDialogAdd = () => {
        setAddDialogOpen(true); // Open the dialog to add a new task
    };

    const handleAddTask = async () => {
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
        fetchTasks();
    }

    const handleClearAllCompleted = async () => {
        // Clear all completed tasks from the database
        await supabase.from("completed_tasks").delete().eq("user_id", user?.id);
        fetchCompletedTasks();
    }

    const handleUncheck = async (task: any) => {
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
    };

    return (
        <div className="p-4">
            <p className="text-[50px] font-[800] text-center text-gray-700">Tasks</p>
            <br />

            <button className="p-3 flex gap-2 hover:text-blue-800 cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-300" onClick={handleOpenDialogAdd}>
                <PlusCircle size={32} />
                <p className="font-[600] text-2xl">Add</p>
            </button>

            <br />

            <div className="flex gap-4">
                <div className="w-1/2 p-2 border border-gray-200 rounded-lg">
                    <p className="text-[20px] font-[600] text-gray-700">Tasks</p>
                    <div className="flex flex-col gap-4 mt-4">
                        {tasks.map((task) => (
                            <div onClick={() => handleTaskDialogOpen(task)} key={task.id} className="bg-white border border-gray-200 rounded-sm p-4 overflow-hidden">
                                <p className="text-lg font-bold flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        onChange={() => handleCheck(task)}
                                    />
                                    {task.title}
                                </p>
                                <p className="text-gray-600">{task.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-1/2 p-2 border border-gray-200 rounded-lg">

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
                                    />
                                    {task.title}
                                </p>
                                <p className="text-gray-600">{task.description}</p>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Add Task Dialog */}

                {addDialogOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                            <h2 className="text-xl font-semibold mb-4">Add Task</h2>
                            <input
                                type="text"
                                value={Addtitle}
                                onChange={(e) => setAddTitle(e.target.value)}
                                placeholder="Title"
                                className="border rounded w-full mb-2 p-2"
                            />
                            <textarea
                                value={Adddescription}
                                onChange={(e) => setAddDescription(e.target.value)}
                                placeholder="Description"
                                className="border rounded w-full mb-2 p-2"
                            ></textarea>
                            <input
                                type="date"
                                value={new Date(Addduedate).toISOString().split("T")[0]} // shows formatted date
                                onChange={(e) => setAddDueDate(new Date(e.target.value).getTime())}
                            />

                            <button
                                onClick={handleAddTask}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                            >
                                Add Task
                            </button>
                            <button
                                onClick={() => setAddDialogOpen(false)}
                                className="ml-4 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>)}



                    {TaskDialogOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-[700px]">
                            <XCircle size={23} onClick={handleTaskDialogClose}/>

                            <h1 className="text-3xl font-semibold mb-4">{Tasktitle}</h1>
                            
                            <p className="md:text-md text-sm">{Taskdescription}</p>
                            <br />
                            <p className="text-sm font-[600] text-gray-700">Due Date: {Taskduedate}</p>
                            <p className="text-sm font-[600] text-gray-700">Created by: {user?.firstName}</p>
                            <p className="text-sm font-[600] text-gray-700">task id: {Taskid}</p>
                        </div>
                    </div>)}
            </div>
        </div>
    );
};

export default Page;
