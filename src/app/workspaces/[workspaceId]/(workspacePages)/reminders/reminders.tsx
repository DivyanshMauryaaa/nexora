'use client'
import { BellRing, Plus } from "lucide-react";
import { useState, useEffect } from "react";

const Reminders = () => {
    const [Reminders, setReminders] = useState<any>([]);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedReminderId, setSelectedReminderId] = useState("");

    const toggleDialog = (id: string, title: string, content: string) => {
        setCreateDialogOpen(!createDialogOpen);

        setTitle(title || "");
        setContent(content || "");
        setSelectedReminderId(id || "");
    }

    const fetchReminders = () => {}

    return(
        <div>
            <p className="text-3xl font-bold flex gap-3"><BellRing /> Reminders</p>
            <br />

            <button className="p-3 hover:bg-blue-700 border-gray-300 text-gray-400 hover:text-white rounded-lg flex gap-3 transition-all duration-200 cursor-pointer"><Plus /> New Reminder</button>
            <br />

            
        </div>
    )
}

export default Reminders;