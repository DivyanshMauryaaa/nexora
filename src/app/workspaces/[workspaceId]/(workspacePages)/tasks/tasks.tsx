'use client';
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Calendar, PlusCircle, Trash2 } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY || ''
);

const Tasks = () => {
    const params = useParams();
    const { user } = useUser();

    const workspaceId = params.workspaceId as string;

    const [tasks, setTasks] = useState<any>([]);
    const [completedTasks, setCompletedTasks] = useState<any>([]);

    const [CreatedialogOpen, setCreateDialogOpen] = useState(false);
    const [EditDialogOpen, setEditDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [Taskstatus, setTaskStatus] = useState("Not Started")
    const [selectedTaskId, setSelectedTaskId] = useState("")

    const toggleDialog = (mode: string, title?: string, description?: string, status?: string, task_id?: string, dueDate?: string,) => {
        setTitle(title || "")
        setDescription(description || "")
        setDueDate(dueDate || "")
        setTaskStatus(status || "Not Started")
        setSelectedTaskId(task_id || "")

        if (mode == "create") setCreateDialogOpen(!CreatedialogOpen);
        else if (mode == "edit") setEditDialogOpen(!EditDialogOpen);
    }

    const handleAddTask = async () => {
        const { error } = await supabase.from('tasks').insert(
            {
                title: title,
                description: description,
                due_date: dueDate,
                user_id: user?.id,
                workspace_id: workspaceId
            }
        )

        if (error) return;
        fetchTasks();
    }

    useEffect(() => {
        if (user && workspaceId) fetchTasks();
    }, [user, workspaceId])

    const fetchTasks = async () => {
        const { data, error } = await supabase.from('tasks').select('*').eq('workspace_id', workspaceId)
        setTasks(data)

        if (error) return;
    }

    useEffect(() => {
        if (user && workspaceId) fetchCompletedTasks();
    }, [user, workspaceId])

    const fetchCompletedTasks = async () => {
        const { data, error } = await supabase.from('completed_tasks').select('*').eq('workspace_id', workspaceId)
        setCompletedTasks(data)

        if (error) return;
    }

    const updateTask = async () => {
        const { error } = await supabase.from('tasks').update(
            {
                title: title,
                description: description,
                due_date: dueDate,
                status: Taskstatus
            }
        ).eq('id', selectedTaskId);

        if (error) return;
        
        handleChangeTaskStatus(Taskstatus);

        // Refetch updated tasks
        fetchTasks()
    }

    const handleDeleteTask = async (task_id: string, database: string) => {
        const { error } = await supabase.from(database).delete().eq('id', task_id);
        fetchTasks()
        fetchCompletedTasks()

        if (error) return;
    }

    const handleChangeTaskStatus = async (status: string) => {
        setTaskStatus(status)

        if (Taskstatus === "Completed") {
            // Step 1: Move to completed_tasks
            const { error: insertError } = await supabase.from('completed_tasks').insert({
                title: title,
                description: description,
                due_date: dueDate,
                user_id: user?.id,
                workspace_id: workspaceId,
                status: Taskstatus
            });
    
            if (insertError) {
                console.error("Insert into completed_tasks failed:", insertError.message);
                return;
            }
    
            // Step 2: Delete from tasks
            const { error: deleteError } = await supabase.from('tasks').delete().eq('id', selectedTaskId);
    
            if (deleteError) {
                console.error("Delete from tasks failed:", deleteError.message);
                return;
            }
        } else {
            // Step 3: Just update task if status isn't Completed
            const { error } = await supabase.from('tasks').update({
                title: title,
                description: description,
                due_date: dueDate,
                status: Taskstatus
            }).eq('id', selectedTaskId);
    
            if (error) {
                console.error("Update task failed:", error.message);
                return;
            }
        }
    
        // Step 4: Refresh UI
        await fetchTasks();
        await fetchCompletedTasks();
        setEditDialogOpen(false); // close modal
    };

    return (
        <div>
            <div className="header flex justify-between">
                <p className="text-3xl font-bold">Tasks</p>
                <button className="p-3 bg-blue-700 text-white rounded-2xl flex gap-2 cursor-pointer" onClick={() => toggleDialog("create")}><PlusCircle />Add</button>
            </div>
            <br />

            <div className="flex gap-3 flex-wrap">

                <div className="bg-slate-100 border-gray-300 w-[430px] md:w-[300px] p-3 rounded-xl">
                    <p className="font-bold flex justify-between">Todos</p>
                    <br />

                    <div className="flex flex-col gap-2">
                        {tasks.map((task: any) => (
                            <div className="w-[400px] min-h-[20px] bg-white rounded-xl p-3 cursor-pointer md:w-full border border-white hover:border-blue-700 transition-all duration-200" key={task.id}>
                                <p className="font-[600] text-xl hover:text-blue-700" onClick={() => toggleDialog("edit", task.title, task.description, task.status, task.id, new Date(task.due_date).toISOString().split('T')[0])}>{task.title}</p>
                                <p className="text-sm text-gray-400 overflow-hidden max-h-[55px] min-h-[10px]">{task.description}</p>
                                <p className="md:text-md text-sm mt-1 flex gap-2"><Calendar size={18} />{new Date(task.due_date).toISOString().split('T')[0]}</p>
                                <p className="md:text-md text-sm mt-1" onClick={() => handleDeleteTask(task.id, "tasks")}><Trash2 size={18} className="hover:text-red-700 "/></p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-100 border-gray-300 w-[430px] md:w-[300px] p-3 rounded-xl">
                    <p className="font-bold flex justify-between">Completed Tasks</p>
                    <br />

                    <div className="flex flex-col gap-2">
                        {completedTasks.map((task: any) => (
                            <div className="md:w-full w-[400px] min-h-[20px] bg-white rounded-xl p-3 cursor-pointer border border-white hover:border-blue-700 transition-all duration-200" key={task.id}>
                                <p className="font-[600] text-xl hover:text-blue-700" onClick={() => toggleDialog("edit", task.title, task.description, task.status, task.id, new Date(task.due_date).toISOString().split('T')[0])}>{task.title}</p>
                                <p className="text-sm text-gray-400 overflow-hidden h-[55px]">{task.description}</p>
                                <p className="md:text-md text-sm mt-1 flex gap-2"><Calendar size={18} />{new Date(task.due_date).toISOString().split('T')[0]}</p>
                                <p className="md:text-md text-sm mt-1" onClick={() => handleDeleteTask(task.id, "completed_tasks")}><Trash2 size={18} className="hover:text-red-700 "/></p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {CreatedialogOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center border items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Create Task</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-700 border border-gray-400"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-700 border border-gray-400 min-h-[200px] max-h-[600px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-700 border border-gray-400"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                    onClick={() => toggleDialog("create", "", "", "")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                    onClick={() => handleAddTask()}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {EditDialogOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center border items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <form>
                            <div className="mb-4">
                                <p
                                    className="block text-3xl font-bold mb-1"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => setTitle(e.target.textContent || "")}
                                >
                                    {title}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Status</label>

                                <select value={Taskstatus} onChange={(e) => setTaskStatus(e.target.value)} className="focus:outline-none border p-2 border-gray-300 rounded-xl hover:border-blue-700 transition-all duration-200 cursor-pointer">
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>

                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-700 border border-gray-400
focus:outline-none focus:border-blue-700 border border-gray-400 min-h-[120px] max-h-[200px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-700 border border-gray-400
focus:outline-none focus:border-blue-700 border border-gray-400"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                    onClick={() => toggleDialog("edit", "", "", "")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        updateTask();
                                        toggleDialog("edit", "", "", "", "", "");
                                        fetchTasks(); // Refresh the tasks after update
                                    }}
                                >
                                    Save
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tasks;